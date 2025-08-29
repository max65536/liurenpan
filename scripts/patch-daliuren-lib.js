#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function patchDaliurenLib() {
  const pkgPath = path.join(process.cwd(), 'node_modules', 'daliuren-lib', 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.log('[patch-daliuren-lib] daliuren-lib not found, skip');
    return;
  }
  const raw = fs.readFileSync(pkgPath, 'utf8');
  let json;
  try { json = JSON.parse(raw); } catch {
    console.log('[patch-daliuren-lib] failed to parse package.json, skip');
    return;
  }
  const distIndex = path.join(path.dirname(pkgPath), 'dist', 'index.js');
  const distSrcIndex = path.join(path.dirname(pkgPath), 'dist', 'src', 'index.js');
  const hasDistIndex = fs.existsSync(distIndex);
  const hasDistSrcIndex = fs.existsSync(distSrcIndex);

  if (!hasDistIndex && hasDistSrcIndex) {
    let changed = false;
    if (json.main !== 'dist/src/index.js') {
      json.main = 'dist/src/index.js';
      changed = true;
    }
    if (json.module && json.module !== 'dist/src/index.js') {
      json.module = 'dist/src/index.js';
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2));
      console.log('[patch-daliuren-lib] patched main/module -> dist/src/index.js');
    } else {
      console.log('[patch-daliuren-lib] already patched');
    }
  } else {
    console.log('[patch-daliuren-lib] no patch needed');
  }
}

try {
  patchDaliurenLib();
} catch (e) {
  console.log('[patch-daliuren-lib] error:', e && e.message);
}

