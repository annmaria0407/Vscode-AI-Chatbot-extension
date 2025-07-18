export function getWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AI Chat</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 0;
      background-color: #1e1e1e;
      color: #d4d4d4;
      display: flex;
    }

    #sidebar {
      width: 250px;
      background: #2b2b2b;
      border-right: 1px solid #444;
      overflow-y: auto;
      height: 100vh;
      padding: 1em;
      display: flex;
      flex-direction: column;
    }

    #sidebar h3 {
      margin: 0.5em 0 0.3em 0;
      font-size: 1.1em;
    }

    .history-item {
      margin-bottom: 8px;
      cursor: pointer;
      font-size: 0.85em;
      padding: 6px;
      border-radius: 5px;
      color: #ccc;
      background-color: #1a1a1a;
      border: 1px solid #333;
    }

    .history-item:hover {
      background-color: #444;
      color: #fff;
    }

    #main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    #controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5em 1em;
      background-color: #333;
    }

    #chat {
      flex: 1;
      overflow-y: auto;
      padding: 1em;
      display: flex;
      flex-direction: column;
    }

    .message {
      margin-bottom: 1em;
      padding: 0.7em 1em;
      border-radius: 10px;
      max-width: 75%;
      word-wrap: break-word;
      position: relative;
      display: inline-block;
    }

    .user {
      background-color: #0e639c;
      color: white;
      align-self: flex-end;
      text-align: right;
    }

    .assistant {
      background-color: #2c2c2c;
      color: #d4d4d4;
      align-self: flex-start;
      text-align: left;
    }

    .timestamp {
      font-size: 0.7em;
      opacity: 0.6;
      margin-bottom: 4px;
    }

    .sender-label {
      font-weight: bold;
      font-size: 0.75em;
      margin-bottom: 3px;
      opacity: 0.7;
    }

    #inputArea {
      display: flex;
      padding: 1em;
      border-top: 1px solid #333;
      background: #252526;
      align-items: center;
    }

    textarea {
      flex: 1;
      padding: 0.7em;
      border-radius: 6px;
      border: 1px solid #555;
      background-color: #2d2d2d;
      color: white;
      resize: vertical;
      min-height: 2em;
      max-height: 10em;
    }

    button {
      margin-left: 0.5em;
      padding: 0.7em 1em;
      background-color: #0e639c;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    button:hover {
      background-color: #1177bb;
    }

    #loading {
      font-style: italic;
      color: gray;
    }
  </style>
</head>
<body>
  <div id="sidebar">
    <h3>Suggested Questions</h3>
    <div id="suggestedQuestions"></div>

    <h3>History</h3>
    <div id="historyList"></div>
  </div>

  <div id="main">
    <div id="controls">
      <span><strong>AI Chat Assistant</strong></span>
      <div>
        <button onclick="clearChat()">Clear Chat</button>
        <button onclick="startListening()">🎙️</button>
      </div>
    </div>

    <div id="chat"></div>

    <div id="inputArea">
      <textarea id="userInput" placeholder="Ask something..."></textarea>
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const chat = document.getElementById('chat');
    const input = document.getElementById('userInput');
    const historyList = document.getElementById('historyList');

    const suggested = [
      "What is a closure in JavaScript?",
      "How does async/await work in Node.js?",
      "What are Python decorators?",
      "Explain the concept of promises in JavaScript.",
      "How do I center a div using CSS?",
      "What is the difference between var, let, and const?",
      "How to create a virtual environment in Python?",
      "What is the difference between shallow and deep copy in Python?",
      "What is the purpose of the useEffect hook in React?",
      "How do I reverse a string in JavaScript?"
    ];

    function scrollToBottom() {
      chat.scrollTop = chat.scrollHeight;
    }

    function addMessage(content, sender, time = new Date()) {
      const div = document.createElement('div');
      div.className = 'message ' + sender;

      const ts = document.createElement('div');
      ts.className = 'timestamp';
      ts.textContent = new Date(time).toLocaleString();

      const label = document.createElement('div');
      label.className = 'sender-label';
      label.textContent = sender === 'user' ? 'You' : 'AI';

      const contentDiv = document.createElement('div');
      contentDiv.innerText = content;

      div.appendChild(ts);
      div.appendChild(label);
      div.appendChild(contentDiv);
      chat.appendChild(div);
      scrollToBottom();
    }

    function showLoading(id) {
      const div = document.createElement('div');
      div.id = id;
      div.className = 'message assistant';
      div.innerHTML = '<span id="loading">Thinking...</span>';
      chat.appendChild(div);
      scrollToBottom();
    }

    function removeLoading(id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    function clearChat() {
      chat.innerHTML = '';
      historyList.innerHTML = '';
      vscode.postMessage({ type: 'clearHistory' });
    }

    function sendMessage(promptOverride = null) {
      const text = promptOverride || input.value.trim();
      if (!text) return;

      const loadingId = 'loading-' + Date.now();
      addMessage(text, 'user');
      showLoading(loadingId);
      vscode.postMessage({ type: 'chat', text, loadingId });

      if (!promptOverride) {
        input.value = '';
        input.focus();
      }
    }

    function startListening() {
      if (!('webkitSpeechRecognition' in window)) {
        alert('Speech Recognition not supported in this browser.');
        return;
      }
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      recognition.onresult = function(event) {
        input.value = event.results[0][0].transcript;
        sendMessage();
      };
    }

    function renderSuggestedQuestions() {
      const list = document.getElementById('suggestedQuestions');
      suggested.forEach(q => {
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerText = q;
        el.onclick = () => {
          sendMessage(q);
        };
        list.appendChild(el);
      });
    }

    function renderHistory(history) {
      historyList.innerHTML = '';
      const trimmed = history.slice(-20).reverse();
      for (const item of trimmed) {
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerText = item.prompt;
        el.onclick = () => {
          el.style.backgroundColor = '#666';
          sendMessage(item.prompt);
        };
        historyList.appendChild(el);
      }
    }

    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'response') {
        removeLoading(msg.loadingId);
        addMessage(msg.text, 'assistant');
      } else if (msg.type === 'history') {
        renderHistory(msg.data);
      }
    });

    window.addEventListener('load', () => {
      renderSuggestedQuestions(); // ✅ Add this
      vscode.postMessage({ type: 'loadHistory' });
      input.focus();
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });
  </script>
</body>
</html>`;
}
