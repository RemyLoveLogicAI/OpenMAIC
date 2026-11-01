/**
 * expand-conversation-lab.ts
 *
 * Appends two new scenes to the "Covert Influence & Defense" classroom
 * (TJ0q3IsuaR) using the same pipeline as expand-classroom-curriculum.ts:
 *
 *   Scene 10 — The Conversation Lab (interactive simulation, widgetType: 'simulation')
 *              A live-fire branching drill: 3 elicitation encounters, scored
 *              responses, per-choice debriefs, vulnerability profile.
 *   Scene 11 — Operation Canary Shield (PBL capstone, projectV2)
 *              Learner-as-security-officer plans and executes a canary trap
 *              across 4 directors to forensically identify a mole.
 *
 * Additive and idempotent: existing scenes are preserved; scenes 10/11 are
 * upserted by id. Speech actions are TTS-synthesized (ElevenLabs primary,
 * Deepgram fallback) with mp3 reuse, then the classroom JSON is written
 * atomically and synced to PostgreSQL (document_scenes + stage_meta).
 *
 * Run:  npx tsx scripts/expand-conversation-lab.ts
 * Env:  ELEVENLABS_API_KEY (required), DEEPGRAM_API_KEY (fallback),
 *       DATABASE_URL (defaults to local dev postgres)
 */
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { validateScene } from '../packages/@openmaic/dsl/dist/index.js';
import { generateTTS } from '@/lib/audio/tts-providers';
import { DEFAULT_TTS_VOICES, DEFAULT_TTS_MODELS } from '@/lib/audio/constants';
import { writeJsonFileAtomic } from '@/lib/server/classroom-storage';

const CLASSROOM_ID = 'TJ0q3IsuaR';
const ROOT = process.cwd();
const CLASSROOM_FILE = path.join(ROOT, 'data', 'classrooms', `${CLASSROOM_ID}.json`);
const AUDIO_DIR = path.join(ROOT, 'data', 'classrooms', CLASSROOM_ID, 'audio');
const LAB_HTML_FILE = path.join(ROOT, 'scripts', 'conversation-lab.html');

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildScene10() {
  const html = fs.readFileSync(LAB_HTML_FILE, 'utf-8');
  return {
    id: 'scene_conversation_lab_10',
    stageId: CLASSROOM_ID,
    title: 'The Conversation Lab: Live-Fire Elicitation Drill',
    order: 10,
    outlineId: 'scene_10',
    type: 'interactive',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: {
      type: 'interactive',
      widgetType: 'simulation',
      html,
    },
    actions: [
      {
        id: 'action_s10_intro',
        type: 'speech',
        text: 'Welcome to the Conversation Lab. Theory is over. You are about to face three live elicitation attempts drawn from real tradecraft — the same tactics you studied in Scene 6. Spot the lever, choose your response, and keep your secrets. Good luck, operator.',
      },
    ],
  };
}

function buildScene11() {
  const now = new Date().toISOString();
  return {
    id: 'scene_canary_shield_11',
    stageId: CLASSROOM_ID,
    title: 'Capstone: Operation Canary Shield',
    order: 11,
    outlineId: 'scene_11',
    type: 'pbl',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: {
      type: 'pbl',
      projectV2: {
        uiPhase: 'hero',
        title: 'Operation Canary Shield',
        description:
          'You are the newly appointed security officer at Meridian Dynamics. Confidential release dates keep surfacing in competitor hands, and the leak traces to your four-person executive council. Design and deploy a canary trap that forensically identifies the mole — without alerting the source.',
        learningObjective:
          'Plan and execute a controlled information-watermarking operation: formulate subtly differentiated briefings, distribute them under isolated channels, monitor for the watermark\u2019s emergence, and attribute the leak while preserving operational secrecy.',
        gains: [
          'Design forensic watermarks that survive paraphrase and partial disclosure',
          'Run isolated distribution without cross-contamination or tipping the operation',
          'Attribute a leak from observed evidence and write a defensible attribution memo',
        ],
        tags: ['counter-intelligence', 'canary trap', 'elicitation defense', 'capstone'],
        language: 'en',
        languageDirective:
          'Deliver the entire capstone in English. Keep tradecraft terms precise and operational.',
        proficiency: 'advanced',
        status: 'active',
        schemaVersion: 2,
        scenario: {
          setting:
            'Meridian Dynamics, a mid-size deep-tech firm. Four directors sit on the executive council. Over the last quarter, three confidential release dates appeared in competitor briefings within days of council sessions. Counter-intelligence believes one director is the source — deliberate or unwitting.',
          goal: 'Identify the leaking director with forensic certainty while keeping the operation invisible to all four.',
          rules:
            'Never confront a director without watermark evidence. Never reuse a watermark across directors. Never discuss the operation outside the secure channel with your Handler.',
          learnerRole: 'Security Officer, Meridian Dynamics — you own this operation end to end.',
          characters: [
            {
              id: 'dir_okonkwo',
              name: 'Adaeze Okonkwo',
              persona:
                'VP Engineering. Brilliant, impatient, allergic to process. Asks sharp technical questions and dislikes being managed.',
              situation: 'Runs the teams whose dates keep leaking. Defensive about her org.',
              boundaries: 'Will not tolerate vague accusations; responds to evidence and precision.',
              openingLine:
                '\u201cIf you\u2019re going to slow my teams down with another security review, you\u2019d better have a reason.\u201d',
            },
            {
              id: 'dir_chen',
              name: 'Rafael Chen',
              persona:
                'Chief Product Officer. Political, charming, always fishing for timelines he can promise to the board.',
              situation: 'Has asked for early dates \u201cthree times this month, just between us.\u201d',
              boundaries: 'Deflects direct questions with humor; reveals most when he\u2019s steering.',
              openingLine:
                '\u201cBetween us — if I had the real dates a week early, I could land the Helios partnership. Just saying.\u201d',
            },
            {
              id: 'dir_sorensen',
              name: 'Ingrid Sorensen',
              persona:
                'CFO. Precise, quiet, notices numbers the way others notice weather.',
              situation: 'Spotted the competitor\u2019s dates matching internal figures before anyone else did.',
              boundaries: 'Cooperates fully once she trusts the methodology; trusts no one by default.',
              openingLine:
                '\u201cThe competitor\u2019s Q3 figure matches our internal memo to the day. That is not a coincidence. What\u2019s your plan?\u201d',
            },
            {
              id: 'dir_rivera',
              name: 'Tom\u00e1s Rivera',
              persona:
                'Head of Partnerships. Gregarious, talks to everyone, remembers birthdays, repeats stories.',
              situation: 'Highest external contact surface of the four. Believes \u201crelationships run on openness.\u201d',
              boundaries: 'Genuinely warm; the risk is carelessness, not malice — treat him accordingly.',
              openingLine:
                '\u201cYou look stressed, friend. Come on, what\u2019s the latest on the launch? I won\u2019t tell a soul.\u201d',
            },
            {
              id: 'the_handler',
              name: 'The Handler',
              persona:
                'Your mentor in the security practice. Dry, exacting, has run a dozen such operations. Never decides for you — only sharpens your thinking.',
              situation: 'Your only cleared confidant. Reviews your plan before execution.',
              boundaries: 'Will not approve a plan with cross-contamination risk or a watermark that won\u2019t survive paraphrase.',
              openingLine:
                '\u201cFour directors, four briefings, one truth with four faces. Show me your watermarks.\u201d',
            },
          ],
        },
        roles: [
          {
            id: 'role_officer',
            type: 'user',
            name: 'Security Officer',
            description: 'You. You design the watermarks, run the distribution, and own the attribution.',
          },
          {
            id: 'role_handler',
            type: 'instructor',
            name: 'The Handler',
            description: 'Mentor who pressure-tests your plan before it touches a director.',
            systemPrompt:
              'You are a veteran counter-intelligence mentor. Challenge the learner\u2019s watermark designs for paraphrase-survival and cross-contamination risk. Never reveal which director is the mole. Approve only airtight plans.',
          },
          {
            id: 'role_adjudicator',
            type: 'evaluator',
            name: 'Red Cell Adjudicator',
            description: 'Grades the final attribution memo against the evidence chain.',
            systemPrompt:
              'Evaluate the learner\u2019s attribution memo: is the watermark evidence sufficient, is the chain of custody clean, is the conclusion defensible? Score rigorously.',
          },
          {
            id: 'role_mole',
            type: 'simulator',
            name: 'The Mole',
            description: 'Simulated adversary behavior for the roleplay milestone.',
            systemPrompt:
              'You simulate the leaking director\u2019s observable behavior during distribution: which watermark surfaces externally and when. Never break character to reveal the answer early.',
          },
        ],
        milestones: [
          {
            id: 'ms_watermarks',
            title: 'Design the Watermarks',
            description:
              'Four briefings, one truth, four faces. Each director gets a subtly different version of the release schedule.',
            status: 'active',
            order: 1,
            scenarioStage: 'prep',
            briefing:
              'Draft four variants of the Q4 release briefing. Each carries a unique, plausible watermark — a shifted date, a distinct codename (Apex, Titan, Zenith, Vanguard), a reordered milestone. The watermarks must survive paraphrase: if a director repeats the gist in their own words, your fingerprint must still be identifiable.',
            microtasks: [
              {
                id: 'mt_variants',
                title: 'Draft the four briefing variants',
                description:
                  'Write the four versions. Each watermark must be plausible on its own — nothing that would make a director ask \u201cwhy does mine say something different?\u201d',
                status: 'todo',
                assignee: 'user',
                hints: [
                  'Shift dates by a few days, not weeks — dramatic differences invite comparison.',
                  'Codenames should feel like normal internal churn, not a pattern.',
                ],
                order: 1,
                completionCriteria:
                  'Four complete briefing texts, each with exactly one documented watermark, reviewed by the Handler.',
              },
              {
                id: 'mt_distribution',
                title: 'Define the isolated distribution protocol',
                description:
                  'Specify channel, timing, and access controls per director. Zero cross-contamination: no shared threads, no forwarded copies, no hallway mentions.',
                status: 'todo',
                assignee: 'user',
                hints: [
                  'Stagger delivery so no two directors can compare notes in real time.',
                  'Log every handoff — chain of custody is your evidence later.',
                ],
                order: 2,
                completionCriteria:
                  'A written distribution plan naming channel, time, and custody log per director.',
              },
              {
                id: 'mt_tripwires',
                title: 'Set the monitoring tripwires',
                description:
                  'Define what counts as a hit: which external sources you watch, what watermark evidence looks like, and the threshold for attribution.',
                status: 'todo',
                assignee: 'user',
                hints: [
                  'Watch competitor briefings, press, and partner chatter — not the directors\u2019 inboxes.',
                  'Decide in advance: one sighting or two before you attribute?',
                ],
                order: 3,
                completionCriteria:
                  'A monitoring plan with sources, evidence criteria, and an attribution threshold.',
              },
            ],
            completionCriteria:
              'Handler approves all four watermarks and the distribution protocol. No cross-contamination vectors remain.',
            debrief:
              'Good tradecraft is invisible tradecraft. If any director could detect the operation from their briefing alone, the design fails — elegance is a security property.',
            synthesisCheck: {
              coreConcept:
                'A canary trap only works if each recipient\u2019s copy is uniquely fingerprinted yet individually plausible.',
            },
          },
          {
            id: 'ms_deploy',
            title: 'Execute the Deployment',
            description:
              'Distribute the briefings. Handle the humans. Watch the wires. Say nothing.',
            status: 'locked',
            order: 2,
            scenarioStage: 'roleplay',
            briefing:
              'Deliver each briefing per your protocol. Director Chen will press you for early dates; Director Rivera will ask \u201cas a friend.\u201d Neither gets anything beyond their watermarked copy. Log every interaction.',
            microtasks: [
              {
                id: 'mt_deliver',
                title: 'Deliver the four briefings',
                description:
                  'Execute the distribution plan exactly as approved. Any deviation gets logged and justified.',
                status: 'todo',
                assignee: 'user',
                hints: ['Stick to the script. Improvisation is where operations die.'],
                order: 1,
                completionCriteria: 'All four deliveries logged with time, channel, and recipient confirmation.',
              },
              {
                id: 'mt_handle_chen',
                title: 'Deflect Chen\u2019s early-date press',
                description:
                  'He will ask for the real dates \u201cjust between us.\u201d Give him his briefing and nothing else — warmly.',
                status: 'todo',
                assignee: 'user',
                hints: [
                  'Conversational judo: validate the partnership pressure, confirm nothing new.',
                  'A refusal that sounds like a favor beats a refusal that sounds like suspicion.',
                ],
                order: 2,
                completionCriteria:
                  'Chen receives only his watermarked copy; the interaction log shows no additional disclosure.',
              },
              {
                id: 'mt_monitor',
                title: 'Watch for the watermark',
                description:
                  'Monitor the agreed sources. When a watermark surfaces, capture the evidence verbatim before acting.',
                status: 'todo',
                assignee: 'user',
                hints: ['Screenshot everything. Memory is not evidence.'],
                order: 3,
                completionCriteria:
                  'At least one watermark sighting captured with source, timestamp, and verbatim text.',
              },
            ],
            completionCriteria:
              'All briefings delivered per protocol and at least one watermark observed in the wild with captured evidence.',
            debrief:
              'Notice what the operation cost you: nothing. No confrontations, no accusations, no burned relationships. The trap did the talking.',
          },
          {
            id: 'ms_attribute',
            title: 'Attribute & Debrief',
            description:
              'Name the source — on evidence, in writing, defensibly.',
            status: 'locked',
            order: 3,
            scenarioStage: 'wrapup',
            briefing:
              'A watermark has surfaced. Trace it to its director, rule out alternate explanations (a secondhand leak? a guessed date?), and write the attribution memo the adjudicator will grade.',
            microtasks: [
              {
                id: 'mt_trace',
                title: 'Trace the watermark to its source',
                description:
                  'Match the observed evidence to exactly one briefing variant. Document why the other three are excluded.',
                status: 'todo',
                assignee: 'user',
                hints: [
                  'Elimination is as important as matching — show your work on all four.',
                  'Consider: could the evidence have come from anyone outside the four?',
                ],
                order: 1,
                completionCriteria:
                  'A written trace naming one director, with the other three explicitly excluded on evidence.',
              },
              {
                id: 'mt_memo',
                title: 'Write the attribution memo',
                description:
                  'A memo the adjudicator — and, hypothetically, counsel — would accept: evidence, chain of custody, conclusion, recommended action.',
                status: 'todo',
                assignee: 'user',
                hints: [
                  'Lead with the conclusion, then the evidence. Busy readers decide in the first paragraph.',
                  'Separate what you know from what you infer. Label every inference.',
                ],
                order: 2,
                completionCriteria:
                  'Attribution memo submitted; adjudicator scores it against the evidence rubric.',
              },
            ],
            completionCriteria:
              'Attribution memo accepted by the adjudicator with a defensible evidence chain.',
            debrief:
              'The reversal at the heart of this course: every leak is also a signal. The mole thought they were exfiltrating your schedule. They were actually handing you their identity. That is conversational judo at the organizational scale.',
            synthesisCheck: {
              coreConcept:
                'Counter-intelligence wins not by stopping the adversary\u2019s move, but by making their move reveal them.',
            },
          },
        ],
        threads: [
          { agentId: 'role_handler', messages: [] },
          { agentId: 'role_adjudicator', messages: [] },
          { agentId: 'role_mole', messages: [] },
        ],
        submissions: [],
        evaluations: [],
        engagementEvents: [],
        createdAt: now,
        updatedAt: now,
      },
    },
    actions: [
      {
        id: 'action_s11_intro',
        type: 'speech',
        text: 'Capstone time. You are the newly appointed security officer at Meridian Dynamics. Four directors, one suspected mole, and confidential release dates that keep surfacing in competitor hands. Your mission: design and deploy a canary trap that forensically identifies the leak — without alerting the source. Plan carefully. The mole is watching.',
      },
    ],
  };
}

async function synthesizeSpeech(classroom: any) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY missing');

  const voice = DEFAULT_TTS_VOICES['elevenlabs-tts'];
  const modelId = DEFAULT_TTS_MODELS['elevenlabs-tts'];
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

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
        let audioBytes: Buffer | null = null;
        try {
          const result = await generateTTS(
            { providerId: 'elevenlabs-tts', apiKey, modelId, voice },
            action.text,
          );
          audioBytes = Buffer.from(result.audio);
          console.log(`[Done via ElevenLabs] Written ${filename} (${audioBytes.byteLength} bytes)`);
        } catch (err: any) {
          console.warn(`[ElevenLabs Quota/Error] ${err?.message || err}. Falling back to Deepgram Aura TTS...`);
          const deepgramKey = process.env.DEEPGRAM_API_KEY;
          if (!deepgramKey) throw new Error('DEEPGRAM_API_KEY missing for fallback');
          const dgResp = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
            method: 'POST',
            headers: {
              Authorization: `Token ${deepgramKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: action.text }),
          });
          if (!dgResp.ok) {
            throw new Error(`Deepgram fallback failed: ${dgResp.status} ${await dgResp.text()}`);
          }
          const buf = await dgResp.arrayBuffer();
          audioBytes = Buffer.from(buf);
          console.log(`[Done via Deepgram Aura] Written ${filename} (${audioBytes.byteLength} bytes)`);
        }

        fs.writeFileSync(filePath, audioBytes);
        synthesizedCount++;
        await sleep(250);
      }

      action.audioId = audioId;
      action.audioUrl = audioUrl;
    }
  }

  console.log(`[Conversation Lab] Total: ${totalActions}, Synthesized: ${synthesizedCount}, Reused: ${reusedCount}`);
}

async function main() {
  if (!fs.existsSync(LAB_HTML_FILE)) {
    throw new Error(`Missing simulation HTML: ${LAB_HTML_FILE}`);
  }
  console.log(`[Conversation Lab] Loading ${CLASSROOM_FILE}`);
  const classroom = JSON.parse(fs.readFileSync(CLASSROOM_FILE, 'utf-8'));

  const newScenes = [buildScene10(), buildScene11()];

  for (const scene of newScenes) {
    const valid = validateScene(scene as any);
    if (!valid.valid) {
      console.error(`Validation error on ${scene.title}:`, valid.errors);
      throw new Error(`Scene validation failed for ${scene.title}`);
    }
  }
  console.log('[Conversation Lab] Both new scenes passed validateScene()!');

  // Additive upsert by scene id (idempotent on re-runs)
  const byId = new Map<string, any>(classroom.scenes.map((s: any) => [s.id, s]));
  for (const s of newScenes) byId.set(s.id, s);
  classroom.scenes = [...byId.values()].sort((a: any, b: any) => a.order - b.order);
  classroom.stage.updatedAt = Date.now();

  await synthesizeSpeech(classroom);

  console.log(`[Conversation Lab] Writing updated JSON to ${CLASSROOM_FILE}`);
  await writeJsonFileAtomic(CLASSROOM_FILE, classroom);

  const dbUrl = process.env.DATABASE_URL || 'postgres: <redacted>';
  console.log('[Conversation Lab] Updating PostgreSQL database records (if reachable)...');
  const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 2000 });
  try {
    for (const scene of classroom.scenes) {
      const res = await pool.query(
        `INSERT INTO document_scenes (stage_id, id, scene_order, data)
         VALUES ($1, $2, $4, $3::jsonb)
         ON CONFLICT (stage_id, id)
         DO UPDATE SET data = EXCLUDED.data, scene_order = EXCLUDED.scene_order`,
        [CLASSROOM_ID, scene.id, JSON.stringify(scene), scene.order],
      );
      console.log(`[DB] Upserted document_scenes ${scene.id} (order ${scene.order}): ${res.rowCount} row(s) updated`);
    }

    const metaRes = await pool.query(
      `UPDATE stage_meta
       SET is_public = true, generation_complete = true
       WHERE stage_id = $1`,
      [CLASSROOM_ID],
    );
    console.log(`[DB] Updated stage_meta: ${metaRes.rowCount} row(s) updated`);
  } catch (dbErr: any) {
    console.warn('[Conversation Lab] DB sync skipped (PostgreSQL not running or unreachable):', dbErr.message);
  } finally {
    await pool.end().catch(() => {});
  }

  console.log('[Conversation Lab] Scenes 10 + 11 added and synchronized successfully!');
}

main().catch((err) => {
  console.error('[Conversation Lab] Error:', err);
  process.exit(1);
});
