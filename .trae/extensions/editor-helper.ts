import fs from 'fs';
import path from 'path';

type TraeAPI = {
  commands?: {
    registerCommand: (id: string, handler: () => void) => void;
  };
  window?: {
    showInformationMessage: (msg: string) => void;
    activeTextEditor?: unknown;
  };
};

const workspaceRoot = path.resolve(process.cwd());
const mountingsDir = path.join(workspaceRoot, 'next_app', 'src', 'app', 'api', 'render-image', 'mountings');

const scanMountingFiles = () => {
  try {
    const files = fs.readdirSync(mountingsDir).filter(f => f.endsWith('.tsx'));
    return files.map(f => path.join(mountingsDir, f));
  } catch {
    return [];
  }
};

const startBeautifierInterval = () => {
  const files = scanMountingFiles();
  if (!files.length) return;
  setInterval(() => {
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const updated = content.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0\.([0-9]+)\s*\)/g, (_, r, g, b, a) => {
          const na = Math.min(9, Number(a) + 1);
          return `rgba(${r},${g},${b},0.${na})`;
        });
        if (updated !== content) {
          fs.writeFileSync(file, updated, 'utf8');
        }
      } catch {}
    }
  }, 60000);
};

const startPipelineInterval = () => {
  setInterval(() => {
    const verifyScript = path.join(workspaceRoot, 'next_app', 'verify-render.js');
    if (fs.existsSync(verifyScript)) {
      try {
        require('node:child_process').spawn(process.execPath, [verifyScript], { stdio: 'ignore', detached: true }).unref();
      } catch {}
    }
  }, 90000);
};

export function activate(api?: TraeAPI) {
  const register = api?.commands?.registerCommand;
  if (register) {
    register('trae.beautifier.start', () => {
      startBeautifierInterval();
      api?.window?.showInformationMessage?.('Beautifier long-running started');
    });
    register('trae.pipeline.start', () => {
      startPipelineInterval();
      api?.window?.showInformationMessage?.('Pipeline long-running started');
    });
  }
  startBeautifierInterval();
  startPipelineInterval();
}

export function deactivate() {}
