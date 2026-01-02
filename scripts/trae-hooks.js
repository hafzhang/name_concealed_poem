const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration Path
const CONFIG_PATH = path.join(__dirname, '../.vscode/hooks.json');

// Color codes for output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    log(COLORS.red, 'Error: Hooks configuration file not found at ' + CONFIG_PATH);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    log(COLORS.red, 'Error parsing hooks.json: ' + e.message);
    process.exit(1);
  }
}

const config = loadConfig();

function runPreCommitChecks() {
  log(COLORS.cyan, '\n🔍 Running Pre-Commit Checks...');
  const checks = config.hooks.pre_commit_checks || [];
  let failed = false;

  checks.forEach(check => {
    log(COLORS.yellow, `Running: ${check.description || check.id}...`);
    
    if (check.pattern) {
      // Pattern check (e.g. secrets)
      try {
        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' }).split('\n').filter(Boolean);
        let found = false;
        stagedFiles.forEach(file => {
            if (!fs.existsSync(file)) return;
            const content = fs.readFileSync(file, 'utf8');
            const regex = new RegExp(check.pattern);
            if (regex.test(content)) {
                log(COLORS.red, `  ❌ Match found in ${file}: ${check.message}`);
                found = true;
            }
        });
        
        if (found && check.action === 'block') {
            failed = true;
        }
      } catch (e) {
        // Git might not be initialized or other error
      }
    } else if (check.command) {
      // Command execution
      try {
        execSync(check.command, { stdio: 'inherit' });
        log(COLORS.green, '  ✅ Passed');
      } catch (e) {
        log(COLORS.red, '  ❌ Failed');
        if (check.blocking) failed = true;
      }
    }
  });

  if (failed) {
    log(COLORS.red, '\n⛔ Commit blocked due to failed checks.');
    process.exit(1);
  } else {
    log(COLORS.green, '\n✨ All pre-commit checks passed.');
  }
}

function scanFiles() {
    log(COLORS.cyan, '\n📂 Scanning Code Quality...');
    const rules = config.hooks.code_quality_gates?.rules || [];
    const pattern = config.hooks.code_quality_gates?.files || '**/*.ts';
    
    // Simple recursive file finder (ignoring node_modules)
    function getFiles(dir, extRegex) {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                    results = results.concat(getFiles(filePath, extRegex));
                }
            } else {
                if (extRegex.test(file)) {
                    results.push(filePath);
                }
            }
        });
        return results;
    }

    const files = getFiles(path.join(__dirname, '../next_app'), /\.(ts|tsx)$/);
    let issues = 0;

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        rules.forEach(rule => {
            const regex = new RegExp(rule.pattern);
            if (regex.test(content)) {
                log(rule.level === 'error' ? COLORS.red : COLORS.yellow, `  [${rule.level.toUpperCase()}] ${path.basename(file)}: ${rule.message}`);
                issues++;
            }
        });
    });

    log(COLORS.cyan, `\nScan complete. ${issues} issues found.`);
}

// Main execution
const mode = process.argv[2];

switch (mode) {
  case 'pre-commit':
    runPreCommitChecks();
    break;
  case 'scan':
    scanFiles();
    break;
  default:
    log(COLORS.cyan, 'Trae Hooks Runner');
    log(COLORS.reset, 'Usage: node scripts/trae-hooks.js [mode]');
    log(COLORS.reset, 'Modes: pre-commit, scan');
    break;
}
