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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const webview_1 = require("./webview");
const mockService_1 = require("./mockService");
const olama_1 = require("./olama");
async function activate(context) {
    const historyFilePath = path.join(context.globalStorageUri.fsPath, 'chat-history.json');
    try {
        await vscode.workspace.fs.createDirectory(context.globalStorageUri);
    }
    catch (err) {
        console.error('Failed to create storage directory:', err);
    }
    const disposable = vscode.commands.registerCommand('ai-chat-assistant.openChat', () => {
        const panel = vscode.window.createWebviewPanel('aiChatAssistant', 'AI Chat Assistant', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = (0, webview_1.getWebviewContent)();
        panel.webview.onDidReceiveMessage(async (message) => {
            const { type } = message;
            if (type === 'chat') {
                const { text, loadingId } = message;
                const timestamp = new Date().toISOString();
                try {
                    let response = '';
                    try {
                        response = await (0, olama_1.runOllama)('llama3', text); // ✅ use Ollama
                    }
                    catch (err) {
                        console.warn('⚠️ Ollama failed. Falling back to mock reply.', err);
                        response = await (0, mockService_1.getMockReply)(text); // 🔁 fallback if Ollama fails
                    }
                    const entry = { prompt: text, response, timestamp };
                    panel.webview.postMessage({ type: 'response', text: response, loadingId });
                    saveToChatHistory(historyFilePath, entry);
                }
                catch (err) {
                    panel.webview.postMessage({ type: 'response', text: String(err), loadingId });
                }
            }
            else if (type === 'loadHistory') {
                const history = loadChatHistory(historyFilePath);
                panel.webview.postMessage({ type: 'history', data: history });
            }
            else if (type === 'clearHistory') {
                clearChatHistory(historyFilePath);
                panel.webview.postMessage({ type: 'history', data: [] });
            }
        });
    });
    context.subscriptions.push(disposable);
}
function saveToChatHistory(filePath, entry) {
    let history = [];
    try {
        if (fs.existsSync(filePath)) {
            history = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    }
    catch (error) {
        console.error('Error reading chat history:', error);
    }
    history.push(entry);
    try {
        fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
    }
    catch (error) {
        console.error('Error saving chat history:', error);
    }
}
function loadChatHistory(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    }
    catch (error) {
        console.error('Error loading chat history:', error);
    }
    return [];
}
function clearChatHistory(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error('Error clearing chat history:', error);
    }
}
function deactivate() { }
