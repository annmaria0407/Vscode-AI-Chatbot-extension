"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_RESPONSES = void 0;
exports.getMockReply = getMockReply;
exports.MOCK_RESPONSES = [
    {
        keywords: ['closure', 'javascript'],
        response: 'A closure in JavaScript is a function that has access to its outer function scope even after the outer function has returned.'
    },
    {
        keywords: ['async', 'await', 'node'],
        response: 'async/await in Node.js allows asynchronous code to be written in a synchronous style, making it easier to manage asynchronous operations.'
    },
    {
        keywords: ['decorator', 'python'],
        response: 'Python decorators are a way to modify or enhance functions without changing their actual code.'
    },
    {
        keywords: ['promise', 'javascript'],
        response: 'A promise is an object that represents the eventual completion or failure of an asynchronous operation.'
    },
    {
        keywords: ['center', 'div', 'css'],
        response: 'Use flexbox:\n```css\ndisplay: flex;\njustify-content: center;\nalign-items: center;\n```'
    },
    {
        keywords: ['difference', 'let', 'var', 'const'],
        response: '`var` is function scoped, `let` and `const` are block scoped. `const` cannot be reassigned.'
    },
    {
        keywords: ['virtual environment', 'python'],
        response: 'Use `python -m venv env` to create a virtual environment in Python.'
    },
    {
        keywords: ['shallow', 'deep', 'copy', 'python'],
        response: 'Shallow copy copies references to objects; deep copy creates new independent copies of nested objects.'
    },
    {
        keywords: ['useeffect', 'react'],
        response: '`useEffect` runs side effects in React components. It replaces lifecycle methods like `componentDidMount`.'
    },
    {
        keywords: ['reverse', 'string', 'javascript'],
        response: 'Use `str.split("").reverse().join("")` to reverse a string in JavaScript.'
    }
];
// ✅ This is the function you asked about — add below MOCK_RESPONSES
async function getMockReply(prompt) {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    await delay(1000 + Math.random() * 1000); // simulate 1–2s latency
    const lower = prompt.toLowerCase();
    for (const item of exports.MOCK_RESPONSES) {
        if (item.keywords.some(k => lower.includes(k))) {
            return item.response;
        }
    }
    // ❗ Fallback response for unmatched inputs
    return "I'm not sure how to help with that. Please try rephrasing or asking something else related to programming.";
}
