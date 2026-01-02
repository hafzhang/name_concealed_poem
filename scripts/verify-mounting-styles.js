const fs = require('fs');
const path = require('path');

const MOUNTINGS_DIR = path.join(__dirname, '../next_app/src/app/api/render-image/mountings');
const MIN_LINES = 1000;

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function verifyMountings() {
  log(COLORS.cyan, '\n🖼️  Verifying Mounting Styles...');

  if (!fs.existsSync(MOUNTINGS_DIR)) {
    log(COLORS.red, `❌ Directory not found: ${MOUNTINGS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(MOUNTINGS_DIR).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  
  if (files.length === 0) {
    log(COLORS.red, '❌ No mounting style files found.');
    process.exit(1);
  }

  let allPassed = true;

  files.forEach(file => {
    const filePath = path.join(MOUNTINGS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    
    // Check if it's the "none" style (optional check, assuming we might skip it or it's not in this folder)
    // But user said "every mounting style... except no frame". 
    // If "NoFrame.tsx" exists, we might exempt it, but let's assume we won't put NoFrame there or we enforce it for all in that folder.
    // For now, let's strictly enforce the rule for all files found in this specific folder.
    
    if (lines < MIN_LINES) {
      log(COLORS.red, `  ❌ ${file}: ${lines} lines (Minimum required: ${MIN_LINES})`);
      allPassed = false;
    } else {
      log(COLORS.green, `  ✅ ${file}: ${lines} lines`);
    }
  });

  if (!allPassed) {
    log(COLORS.red, '\n⛔ Verification Failed: Some mounting styles do not meet the acceptance criteria.');
    process.exit(1);
  } else {
    log(COLORS.green, '\n✨ All mounting styles verified successfully!');
  }
}

verifyMountings();
