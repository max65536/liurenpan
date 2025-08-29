#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function patchMetroExports() {
  const target = path.join(process.cwd(), 'node_modules', 'metro', 'package.json');
  if (!fs.existsSync(target)) {
    console.log('[patch-metro-exports] metro not found, skip');
    return;
  }
  const raw = fs.readFileSync(target, 'utf8');
  let json;
  try { json = JSON.parse(raw); } catch (e) {
    console.log('[patch-metro-exports] failed to parse package.json, skip');
    return;
  }
  json.exports = json.exports || {};
  if (!json.exports['./src/*']) {
    json.exports['./src/*'] = './src/*.js';
    fs.writeFileSync(target, JSON.stringify(json, null, 2));
    console.log('[patch-metro-exports] added exports["./src/*"] -> "./src/*.js"');
  } else {
    console.log('[patch-metro-exports] exports already contains ./src/*');
  }
}

try {
  patchMetroExports();
} catch (e) {
  console.log('[patch-metro-exports] error:', e && e.message);
}

