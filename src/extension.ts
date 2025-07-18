import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getWebviewContent } from './webview';
import { getMockReply } from './mockService';
import { runOllama } from './olama';

interface ChatEntry {
  prompt: string;
  response: string;
  timestamp: string;
}

export async function activate(context: vscode.ExtensionContext) {
  const historyFilePath = path.join(context.globalStorageUri.fsPath, 'chat-history.json');

  try {
    await vscode.workspace.fs.createDirectory(context.globalStorageUri);
  } catch (err) {
    console.error('Failed to create storage directory:', err);
  }

  const disposable = vscode.commands.registerCommand('ai-chat-assistant.openChat', () => {
    const panel = vscode.window.createWebviewPanel(
      'aiChatAssistant',
      'AI Chat Assistant',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(async (message) => {
      const { type } = message;

      if (type === 'chat') {
        const { text, loadingId } = message;
        const timestamp = new Date().toISOString();

        try {
          let response = '';
          try {
            response = await runOllama('llama3', text); // ✅ use Ollama
          } catch (err) {
            console.warn('⚠️ Ollama failed. Falling back to mock reply.', err);
            response = await getMockReply(text); // 🔁 fallback if Ollama fails
          }

          const entry: ChatEntry = { prompt: text, response, timestamp };
          panel.webview.postMessage({ type: 'response', text: response, loadingId });
          saveToChatHistory(historyFilePath, entry);
        } catch (err) {
          panel.webview.postMessage({ type: 'response', text: String(err), loadingId });
        }
      } else if (type === 'loadHistory') {
        const history = loadChatHistory(historyFilePath);
        panel.webview.postMessage({ type: 'history', data: history });
      } else if (type === 'clearHistory') {
        clearChatHistory(historyFilePath);
        panel.webview.postMessage({ type: 'history', data: [] });
      }
    });
  });

  context.subscriptions.push(disposable);
}

function saveToChatHistory(filePath: string, entry: ChatEntry) {
  let history: ChatEntry[] = [];
  try {
    if (fs.existsSync(filePath)) {
      history = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading chat history:', error);
  }

  history.push(entry);

  try {
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
}

function loadChatHistory(filePath: string): ChatEntry[] {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
  return [];
}

function clearChatHistory(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
}

export function deactivate() {}
