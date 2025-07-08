## 📌 Project Overview

- This is a JavaScript single-page application built with **Vite**.
- It uses modern front-end development practices (ESM, npm, etc.).
- The goal is to produce a small, self-contained static site that can be deployed on **GitHub Pages**.

## 🎯 Main Objectives

1. Help me implement new features on request (e.g. UI changes, new components, utility functions).
2. Help maintain clean, idiomatic, production-ready JavaScript/HTML/CSS.
3. Provide clear explanations and reasoning for code suggestions.
4. Ensure that any code changes remain compatible with Vite.
5. Consider GitHub Pages deployment requirements in all code (e.g. correct `base` path in vite.config.js).

## 🚀 Deployment Target

- Deployment is via **GitHub Pages**.
- The `gh-pages` branch will contain the built static site.
- Vite’s `base` option must match the GitHub Pages subpath (e.g. `/repo-name/`).
- Preferred deployment method: npm script using the `gh-pages` package.

## 🗂️ Project Structure

- `/src`: All source files (JavaScript, components, styles)
- `/dist`: Build output (auto-generated)
- `vite.config.js`: Vite configuration
- `package.json`: npm scripts, dependencies

## ✅ Expected Behaviors for the Agent

When working in this repo, the AI should:

- **Implement** any requested features or fixes in code blocks.
- **Explain** any significant changes.
- **Suggest** improvements or refactors when appropriate.
- **Provide** full terminal/git/npm commands for tasks like:
  - Initializing the project
  - Committing and pushing changes
  - Deploying to `gh-pages`
- **Check** that any deployment instructions work for GitHub Pages.

## ⚙️ Example Commands I Might Give

- "Implement a new button that triggers an alert."
- "Refactor this function to be cleaner."
- "Set up GitHub Pages deploy script."
- "Help me push this to the gh-pages branch."
- "Consider GH Pages base path in vite.config.js."

## 💡 Notes for AI

- Use standard modern JavaScript.
- Keep CSS simple and maintainable.
- Assume I will run `npm install`, `npm run dev`, `npm run build`.
- Avoid framework-specific code unless asked.
- Prefer minimal dependencies.
