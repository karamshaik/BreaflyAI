# Briefly AI

Files: `index.html`, `css/style.css`, `js/main.js`, `img/` (sample images), `server.js` (optional AI route).

- **Without a server:** double-click `index.html`. Samples, the offline extractive fallback and the My documents table work. The AI summary and agent need the server.
- **With AI:** `ANTHROPIC_API_KEY=your_key node server.js`, then open http://localhost:3000. The key stays on the server. Change the model with `MODEL=...`.
- **Saved data:** the My documents table (sample image, title, date, options, summary) is stored in the browser's localStorage only.
