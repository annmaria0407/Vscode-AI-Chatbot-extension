import { exec } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

const historyPath = path.join(__dirname, 'chat-history.json');

function stripAnsi(input: string): string {
  return input.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  ).trim();
}

function getTimestamp(): string {
  return new Date().toLocaleString();
}

function saveToHistory(entry: any) {
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch {
      history = [];
    }
  }
  history.push(entry);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

export function runOllama(model: string, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const sanitizedPrompt = prompt.replace(/["`$\\]/g, '\\$&');
    const command = `OLLAMA_NO_TTY=1 ollama run ${model} <<< "${sanitizedPrompt}"`;
    const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash';

    exec(command, { shell }, (error, stdout, stderr) => {
      const cleanStderr = stripAnsi(stderr || '');
     
      let message = '';

      if (error) {
        message = `❌ Failed: ${error.message}`;
      } else if (cleanStderr && /error|failed|not found|invalid/i.test(cleanStderr)) {
        message = `⚠️ Warning: ${cleanStderr}`;
      } else {
        message = stdout.trim();
      }

      // Save the full entry to history
      const entry = { model, prompt, response: message };
      saveToHistory(entry);

      resolve(`[ ${message}`);
    });
  });
}
