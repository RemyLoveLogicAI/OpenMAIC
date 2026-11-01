import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { generateTTS } from '@/lib/audio/tts-providers';
import { DEFAULT_TTS_VOICES, DEFAULT_TTS_MODELS } from '@/lib/audio/constants';
import { writeJsonFileAtomic } from '@/lib/server/classroom-storage';

const CLASSROOM_ID = 'TJ0q3IsuaR';
const CLASSROOM_FILE = path.join(process.cwd(), 'data', 'classrooms', `${CLASSROOM_ID}.json`);
const AUDIO_DIR = path.join(process.cwd(), 'data', 'classrooms', CLASSROOM_ID, 'audio');

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`[Classroom TTS] Starting synthesis for classroom ${CLASSROOM_ID}`);
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set in environment!');
  }

  if (!fs.existsSync(CLASSROOM_FILE)) {
    throw new Error(`Classroom file does not exist: ${CLASSROOM_FILE}`);
  }

  const raw = fs.readFileSync(CLASSROOM_FILE, 'utf-8');
  const classroom = JSON.parse(raw);

  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const voice = DEFAULT_TTS_VOICES['elevenlabs-tts'];
  const modelId = DEFAULT_TTS_MODELS['elevenlabs-tts'];
  console.log(`[Classroom TTS] Provider: elevenlabs-tts, Model: ${modelId}, Voice: ${voice}`);

  let totalActions = 0;
  let synthesizedCount = 0;
  let reusedCount = 0;

  for (const scene of classroom.scenes) {
    const sceneOrder = scene.order;
    for (const action of scene.actions || []) {
      if (action.type !== 'speech' || !action.text) continue;
      totalActions++;
      const audioId = `tts_s${sceneOrder}_${action.id}`;
      const filename = `${audioId}.mp3`;
      const filePath = path.join(AUDIO_DIR, filename);
      const audioUrl = `/api/classroom-media/${CLASSROOM_ID}/audio/${filename}`;

      let hasValidFile = false;
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 100) {
          hasValidFile = true;
          reusedCount++;
          console.log(`[Reused] Scene ${sceneOrder} Action ${action.id} -> ${filename} (${stats.size} bytes)`);
        }
      }

      if (!hasValidFile) {
        console.log(`[Synthesizing ${totalActions}] Scene ${sceneOrder} Action ${action.id}: "${action.text.slice(0, 50)}..."`);
        const result = await generateTTS(
          {
            providerId: 'elevenlabs-tts',
            apiKey,
            modelId,
            voice,
          },
          action.text,
        );

        fs.writeFileSync(filePath, Buffer.from(result.audio));
        synthesizedCount++;
        console.log(`[Done] Written ${filename} (${result.audio.byteLength} bytes)`);

        // Pacing delay to avoid burst limits
        await sleep(200);
      }

      action.audioId = audioId;
      action.audioUrl = audioUrl;
    }
  }

  console.log(`[Classroom TTS] Total speech actions: ${totalActions}, Synthesized: ${synthesizedCount}, Reused: ${reusedCount}`);

  // Save updated JSON
  console.log(`[Classroom TTS] Writing updated JSON to ${CLASSROOM_FILE}`);
  await writeJsonFileAtomic(CLASSROOM_FILE, classroom);

  // Sync to PostgreSQL
  const dbUrl = process.env.DATABASE_URL || 'postgres://openmaic:openmaic-dev@127.0.0.1:5433/openmaic';
  if (dbUrl) {
    console.log('[Classroom TTS] Updating PostgreSQL database records...');
    const pool = new Pool({ connectionString: dbUrl });
    try {
      for (const scene of classroom.scenes) {
        const res = await pool.query(
          `INSERT INTO document_scenes (stage_id, id, scene_order, data)
           VALUES ($1, $2, $4, $3::jsonb)
           ON CONFLICT (stage_id, id)
           DO UPDATE SET data = EXCLUDED.data, scene_order = EXCLUDED.scene_order`,
          [CLASSROOM_ID, scene.id, JSON.stringify(scene), scene.order],
        );
        console.log(`[DB] Upserted document_scenes ${scene.id}: ${res.rowCount} row(s) updated`);
      }

      const metaRes = await pool.query(
        `UPDATE stage_meta
         SET is_public = true, generation_complete = true
         WHERE stage_id = $1`,
        [CLASSROOM_ID],
      );
      console.log(`[DB] Updated stage_meta: ${metaRes.rowCount} row(s) updated`);
    } finally {
      await pool.end();
    }
  }

  console.log('[Classroom TTS] Synthesis and synchronization complete!');
}

main().catch((err) => {
  console.error('[Classroom TTS] Error:', err);
  process.exit(1);
});
