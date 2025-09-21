DEVELOPER INSTRUCTIONS

Quickstart
1. Prerequisites
   - Node.js (LTS), npm
   - Git

2. Install
   - Run `npm install` in the repository root.

3. Run locally
   - `npm start` (uses the `start` script in `package.json`)

4. Tests
   - `npm test`

5. Lint & Format
   - Follow existing TypeScript and SCSS style in the project. Use `prettier` or `eslint` if configured.

Development Tips
- Theme variables are stored and applied across SCSS files; keep colors consistent.
- The sidebar is responsive and becomes an overlay at small widths (see `src/app/core/nav/*`).
- When adding new routes, update `app.routes.ts` and add links to the sidebar if appropriate.

Pull Request Workflow
- Create a branch per feature.
- Include tests for functional changes when possible.
- Keep changes focused and explain reasoning in the PR description.

Notes
- This project is configured for development inside a dev container; check `.devcontainer` if present.

If something isn't working, open an issue with steps to reproduce and any relevant logs.