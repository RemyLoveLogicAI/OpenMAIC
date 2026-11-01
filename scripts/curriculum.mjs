#!/usr/bin/env node

/**
 * OpenMAIC Curriculum Manager
 *
 * Enables archiving, loading, switching, and resetting curricula
 * so you can continuously customize and swap classroom subjects while
 * keeping previous curricula archived in git/filesystem.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'data', 'classrooms');
const CURRICULA_DIR = path.join(ROOT_DIR, 'curricula');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function copyFolderRecursive(source, target) {
  ensureDir(target);
  const items = fs.readdirSync(source, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(source, item.name);
    const destPath = path.join(target, item.name);
    if (item.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getActiveClassrooms() {
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR);
  const classrooms = [];
  for (const file of files) {
    if (file.endsWith('.json') && !file.includes('.tmp')) {
      const id = file.replace(/\.json$/, '');
      const jsonPath = path.join(DATA_DIR, file);
      try {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(raw);
        const audioDir = path.join(DATA_DIR, id, 'audio');
        let audioCount = 0;
        if (fs.existsSync(audioDir)) {
          audioCount = fs.readdirSync(audioDir).filter(f => !f.startsWith('.')).length;
        }
        classrooms.push({
          id,
          name: data.stage?.name || data.title || data.topic || 'Untitled Stage',
          scenesCount: Array.isArray(data.scenes) ? data.scenes.length : 0,
          audioCount,
          createdAt: data.createdAt || data.stage?.createdAt || null,
          filePath: jsonPath,
        });
      } catch (err) {
        classrooms.push({ id, name: `[Error reading: ${err.message}]`, scenesCount: 0, audioCount: 0 });
      }
    }
  }
  return classrooms;
}

function getArchivedCurricula() {
  if (!fs.existsSync(CURRICULA_DIR)) return [];
  const entries = fs.readdirSync(CURRICULA_DIR, { withFileTypes: true });
  const curricula = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const curDir = path.join(CURRICULA_DIR, entry.name);
      const manifestPath = path.join(curDir, 'manifest.json');
      const classroomJsonPath = path.join(curDir, 'classroom.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          curricula.push({
            slug: entry.name,
            ...manifest,
            path: curDir,
          });
        } catch {
          curricula.push({ slug: entry.name, name: '[Invalid manifest]', path: curDir });
        }
      } else if (fs.existsSync(classroomJsonPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(classroomJsonPath, 'utf-8'));
          curricula.push({
            slug: entry.name,
            id: data.id,
            name: data.stage?.name || 'Untitled',
            scenesCount: data.scenes?.length || 0,
            path: curDir,
          });
        } catch {
          curricula.push({ slug: entry.name, name: '[Legacy archive]', path: curDir });
        }
      }
    }
  }
  return curricula;
}

function printList() {
  console.log('\n============================================================');
  console.log('  OpenMAIC Classroom & Curriculum Manager');
  console.log('============================================================\n');

  console.log('📦 ACTIVE CLASSROOMS in data/classrooms/:');
  const active = getActiveClassrooms();
  if (active.length === 0) {
    console.log('   (No active classrooms found - system is clean/pristine)\n');
  } else {
    for (const c of active) {
      console.log(`   • ID: [${c.id}]`);
      console.log(`     Title:  "${c.name}"`);
      console.log(`     Scenes: ${c.scenesCount} | Audio clips: ${c.audioCount}`);
      console.log(`     Path:   ${c.filePath}\n`);
    }
  }

  console.log('📚 ARCHIVED CURRICULA in curricula/:');
  const archived = getArchivedCurricula();
  if (archived.length === 0) {
    console.log('   (No archived curricula yet)\n');
  } else {
    for (const a of archived) {
      console.log(`   • Slug: ${a.slug}`);
      console.log(`     Name:      "${a.name || a.stageName}"`);
      console.log(`     Orig ID:   ${a.id || a.classroomId}`);
      console.log(`     Scenes:    ${a.scenesCount ?? a.sceneCount ?? 'N/A'}`);
      console.log(`     Archived:  ${a.archivedAt ? new Date(a.archivedAt).toLocaleString() : 'N/A'}`);
      console.log(`     Location:  ${a.path}\n`);
    }
  }
}

function saveCurriculum(targetName, specifiedId) {
  ensureDir(DATA_DIR);
  ensureDir(CURRICULA_DIR);

  const active = getActiveClassrooms();
  if (active.length === 0) {
    console.error('❌ Error: No active classroom found in data/classrooms/ to save.');
    process.exit(1);
  }

  let selected = null;
  if (specifiedId) {
    selected = active.find(c => c.id === specifiedId);
    if (!selected) {
      console.error(`❌ Error: Classroom ID "${specifiedId}" not found in data/classrooms/.`);
      process.exit(1);
    }
  } else if (active.length === 1) {
    selected = active[0];
  } else {
    console.error('❌ Multiple active classrooms exist. Please specify --id <classroomId>.');
    process.exit(1);
  }

  const slug = targetName ? slugify(targetName) : slugify(selected.name) || selected.id;
  const targetDir = path.join(CURRICULA_DIR, slug);

  if (fs.existsSync(targetDir)) {
    console.log(`⚠️ Overwriting existing archive at curricula/${slug}/...`);
  } else {
    ensureDir(targetDir);
  }

  // Read data
  const rawData = fs.readFileSync(selected.filePath, 'utf-8');
  const classroomData = JSON.parse(rawData);

  // Copy classroom JSON
  fs.writeFileSync(path.join(targetDir, 'classroom.json'), JSON.stringify(classroomData, null, 2), 'utf-8');
  fs.writeFileSync(path.join(targetDir, `${selected.id}.json`), JSON.stringify(classroomData, null, 2), 'utf-8');

  // Copy assets folder if it exists
  const activeAssetDir = path.join(DATA_DIR, selected.id);
  const targetAssetDir = path.join(targetDir, selected.id);
  if (fs.existsSync(activeAssetDir)) {
    copyFolderRecursive(activeAssetDir, targetAssetDir);
  }

  // Create manifest
  const manifest = {
    id: selected.id,
    name: selected.name,
    slug,
    scenesCount: selected.scenesCount,
    audioCount: selected.audioCount,
    archivedAt: new Date().toISOString(),
    stage: classroomData.stage || {},
  };
  fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`\n✅ Saved curriculum "${selected.name}" [${selected.id}] to curricula/${slug}/`);
  console.log(`   - Data:   curricula/${slug}/classroom.json`);
  console.log(`   - Assets: curricula/${slug}/${selected.id}/ (if any)`);
  console.log(`   - Meta:   curricula/${slug}/manifest.json\n`);
}

function loadCurriculum(slug, overrideId) {
  ensureDir(DATA_DIR);
  ensureDir(CURRICULA_DIR);

  if (!slug) {
    console.error('❌ Error: Please specify which curriculum to load: pnpm curriculum:load <slug>');
    process.exit(1);
  }

  const targetDir = path.join(CURRICULA_DIR, slug);
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Error: Archive curricula/${slug}/ not found.`);
    process.exit(1);
  }

  let manifest = null;
  const manifestPath = path.join(targetDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  }

  let classroomData = null;
  const classroomJsonPath = path.join(targetDir, 'classroom.json');
  if (fs.existsSync(classroomJsonPath)) {
    classroomData = JSON.parse(fs.readFileSync(classroomJsonPath, 'utf-8'));
  } else {
    // Look for any .json file in targetDir
    const jsonFiles = fs.readdirSync(targetDir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
    if (jsonFiles.length > 0) {
      classroomData = JSON.parse(fs.readFileSync(path.join(targetDir, jsonFiles[0]), 'utf-8'));
    }
  }

  if (!classroomData) {
    console.error(`❌ Error: No classroom JSON found in curricula/${slug}/.`);
    process.exit(1);
  }

  const targetClassroomId = overrideId || manifest?.id || classroomData.id;
  if (!targetClassroomId) {
    console.error('❌ Error: Could not determine classroom ID.');
    process.exit(1);
  }

  // Update ID in payload if overridden
  if (overrideId) {
    classroomData.id = overrideId;
    if (classroomData.stage) classroomData.stage.id = overrideId;
    if (Array.isArray(classroomData.scenes)) {
      for (const scene of classroomData.scenes) {
        scene.stageId = overrideId;
      }
    }
  }

  // Write into data/classrooms/
  const destJsonPath = path.join(DATA_DIR, `${targetClassroomId}.json`);
  fs.writeFileSync(destJsonPath, JSON.stringify(classroomData, null, 2), 'utf-8');

  // Copy assets
  const sourceAssetDir = path.join(targetDir, manifest?.id || classroomData.id);
  const destAssetDir = path.join(DATA_DIR, targetClassroomId);
  if (fs.existsSync(sourceAssetDir)) {
    copyFolderRecursive(sourceAssetDir, destAssetDir);
  }

  console.log(`\n✅ Loaded curriculum "${classroomData.stage?.name || slug}" into data/classrooms/!`);
  console.log(`   - Classroom ID: ${targetClassroomId}`);
  console.log(`   - Data file:    ${destJsonPath}`);
  console.log(`   - Ready in UI at: http://localhost:3000/classroom/${targetClassroomId}\n`);
}

function resetClassrooms(force) {
  if (!fs.existsSync(DATA_DIR)) {
    console.log('✨ Classroom data directory is already empty.');
    return;
  }

  const active = getActiveClassrooms();
  if (active.length === 0) {
    console.log('✨ No active classrooms to reset.');
    return;
  }

  if (!force) {
    console.log('⚠️ Warning: This will delete active classrooms in data/classrooms/.');
    console.log('   Run with --force to confirm: pnpm curriculum:reset --force');
    return;
  }

  const items = fs.readdirSync(DATA_DIR);
  for (const item of items) {
    const p = path.join(DATA_DIR, item);
    fs.rmSync(p, { recursive: true, force: true });
  }

  console.log('🧹 Cleaned data/classrooms/. OpenMAIC is now in a fresh, unconfigured baseline state.');
}

// CLI Routing
const args = process.argv.slice(2);
const command = args[0] || 'list';

switch (command) {
  case 'list':
  case 'ls':
    printList();
    break;
  case 'save': {
    let name = null;
    let id = null;
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--id' && args[i + 1]) {
        id = args[i + 1];
        i++;
      } else if (!name && !args[i].startsWith('--')) {
        name = args[i];
      }
    }
    saveCurriculum(name, id);
    break;
  }
  case 'load': {
    const slug = args[1];
    let id = null;
    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--id' && args[i + 1]) {
        id = args[i + 1];
        i++;
      }
    }
    loadCurriculum(slug, id);
    break;
  }
  case 'reset': {
    const force = args.includes('--force');
    resetClassrooms(force);
    break;
  }
  default:
    console.log('Usage:');
    console.log('  pnpm curriculum:list                   List active and archived curricula');
    console.log('  pnpm curriculum:save [name] [--id ID]  Archive active classroom');
    console.log('  pnpm curriculum:load <slug> [--id ID]  Restore archived curriculum');
    console.log('  pnpm curriculum:reset [--force]        Clean active classrooms');
    break;
}
