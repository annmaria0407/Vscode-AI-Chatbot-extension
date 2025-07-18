"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOllama = runOllama;
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const historyPath = path.join(__dirname, 'chat-history.json');
function stripAnsi(input) {
    return input.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim();
}
function getTimestamp() {
    return new Date().toLocaleString();
}
function saveToHistory(entry) {
    let history = [];
    if (fs.existsSync(historyPath)) {
        try {
            history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        }
        catch {
            history = [];
        }
    }
    history.push(entry);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}
function runOllama(model, prompt) {
    return new Promise((resolve) => {
        const sanitizedPrompt = prompt.replace(/["`$\\]/g, '\\$&');
        const command = `OLLAMA_NO_TTY=1 ollama run ${model} <<< "${sanitizedPrompt}"`;
        const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash';
        (0, child_process_1.exec)(command, { shell }, (error, stdout, stderr) => {
            const cleanStderr = stripAnsi(stderr || '');
            let message = '';
            if (error) {
                message = `❌ Failed: ${error.message}`;
            }
            else if (cleanStderr && /error|failed|not found|invalid/i.test(cleanStderr)) {
                message = `⚠️ Warning: ${cleanStderr}`;
            }
            else {
                message = stdout.trim();
            }
            // Save the full entry to history
            const entry = { model, prompt, response: message };
            saveToHistory(entry);
            resolve(`[ ${message}`);
        });
    });
}
