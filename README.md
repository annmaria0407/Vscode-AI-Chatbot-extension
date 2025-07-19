# 🧠 VS Code AI Chat Assistant Extension

A Visual Studio Code extension that brings AI-powered chat right into your editor — powered by [Ollama](https://ollama.com/) or mock AI responses.

---

## 🚀 Features

- 💬 Chat with an AI assistant inside VS Code  
- ✅ Predefined **Suggested Questions**  
- 🕘 **Timestamped** user/assistant messages  
- 🧠 **Mock mode** for offline development or testing  
- 📜 **Chat history persistence**  
- 🧹 Clear chat history with one click  
- 🎙️ Optional **Speech-to-Text** input  

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/vscode-ai-chat-extension.git
cd vscode-ai-chat-extension
```

### 2. Install Dependencies

```bash
npm install
```

> Make sure you have Node.js and Visual Studio Code installed.

---

## 🧠 Ollama Setup (for real AI responses)

1. Download and install [Ollama](https://ollama.com/)
2. Run a model (e.g. `llama3`) locally:

```bash
ollama run llama3
```

3. The extension sends messages using the command:

```bash
echo "your prompt" | ollama run llama3
```

> Ensure the `ollama` CLI is available in your system `PATH`.

---

4. To create a production-ready build of your Next. js application.

```bash
echo "your prompt" | npm run compile
```


## 🧪 Running the Extension in VS Code

1. Open the project folder in **VS Code**  
2. Press `F5` or click **Run > Start Debugging**  
3. A new Extension Development Host will launch  
4. Open the Command Palette (`⇧⌘P` / `Ctrl+Shift+P`) and run:

```
> AI Chat Assistant: Open Chat
```

---

## 📂 Project Structure

```
├── src/
│   ├── extension.ts        # Main extension entry
│   ├── webview.ts          # Renders the webview UI
│   ├── olama.ts            # Runs local Ollama model
│   └── mockService.ts      # Fallback responses
├── package.json            # VS Code extension config
├── tsconfig.json
├── README.md
└── .gitignore
```

---

## 🛠 Suggested Questions

These appear at the top of the sidebar and help you get started:

1. What is a closure in JavaScript?  
2. How do I reverse a linked list in Python?  
3. What is the difference between `var`, `let`, and `const`?  
4. How to handle async/await errors?  
5. What is dependency injection?  
6. How to center a div in CSS?  
7. What is REST vs. GraphQL?  
8. How to write a unit test in Java?  
9. What is the time complexity of quicksort?  
10. Explain promises in JavaScript.

---
