COPILOT INSTRUCTIONS

Purpose
- Provide clear guidelines for AI-assisted edits so changes are safe, testable, and consistent.

Patch Format
- Use `apply_patch` tool with the provided V4A diff format when making edits.
- Limit changes to the minimal set of files needed to implement a feature or fix.

Before Editing
- Read `DEVELOPER_INSTRUCTIONS.md`.
- Run tests locally if available.
- Search the codebase for usages of symbols you change.

Behavioral Boundaries
- Do not add or modify secrets, tokens, or API keys.
- Avoid large-scale refactors without explicit human approval.
- Keep UI/UX changes consistent with project theme and variables.

Testing
- Run `npm test` after edits when possible.
- For styling changes, describe expected visual behavior and which files were modified.

Styling (Bootstrap-First)
- Prefer Bootstrap utility classes and components for styling before adding custom SCSS/CSS.
- Use Bootstrap's spacing, color, layout, and component classes to solve visual requirements where possible.
- Only add custom styles when Bootstrap cannot provide the needed behavior or when the design requires a bespoke look that cannot be achieved with utilities.
- When adding custom styles:
	- Add them to the component's SCSS file or a shared theme file, not inline in templates.
	- Keep selectors specific and scoped to the component to avoid global collisions.
	- Document why custom styles were necessary in the PR description.

Examples
- Preferred (Bootstrap): `<button class="btn btn-primary me-2">Save</button>`
- Custom (only if needed): add `.btn-custom-save { background: linear-gradient(...); }` in the component SCSS and reference it with a Bootstrap utility class for spacing/behavior.

Layout (Flex / Grid First)
- Prefer CSS Flexbox or Grid for layout and alignment instead of positioning with `position: absolute` or `position: relative`.
- Use Bootstrap's flex and grid utilities (`d-flex`, `flex-column`, `row`, `col`, `gap-*`, etc.) when possible to keep markup consistent and responsive.
- Exceptions: use absolute positioning only for UI decorations or small elements that must overlap content (tooltips, badges) and cannot be implemented via layout primitives.
- When absolute/relative positioning is necessary, document the reason in the PR and scope selectors tightly to avoid layout regressions.

Examples
- Preferred (Flex):
	- `<div class="d-flex align-items-center justify-content-between"> ... </div>`
- Preferred (Grid):
	- `<div class="row g-3"><div class="col-md-6">...</div><div class="col-md-6">...</div></div>`
- Not preferred: using absolute positioning to center elements or to lay out main page structure.

Commit & PR
- Prefer creating branches and opening PRs for human review.
- Include a concise changelog entry in the PR description.

TypeScript Class Member Order
- Always use explicit access modifiers (`public`, `protected`, `private`) for class fields and methods.
- Order class members with public members first, then protected, then private. Keep static members grouped above instance members.
- Put public variables and methods at the top of the class, and private variables/methods near the bottom to improve readability and API surface clarity.
- Example order:
	1. `public static` fields
	2. `public` fields
	3. `public` methods
	4. `protected` fields/methods
	5. `private` fields
	6. `private` methods
- When adding new members, place them in the correct section and update any constructor or lifecycle hooks accordingly.

Communication
- If uncertain about intent, ask the human reviewer for clarification before making non-trivial changes.

Component Scaffolding
- Create one folder per component under `src/app/feature/` or `src/app/shared/` with a clear kebab-case name (for example: `my-widget/`).
- Each component directory should contain at minimum:
	- `my-widget.component.ts` — component class and metadata
	- `my-widget.component.html` — template
	- `my-widget.component.scss` — component styles (optional if using Bootstrap only)
	- `index.ts` — barrel export that re-exports the component for easy imports: `export * from './my-widget.component';`
	- `my-widget.component.spec.ts` — unit tests (recommended)
- Use Angular CLI naming conventions where possible. Keep component selectors and filenames consistent.
- When exporting components for feature modules or lazy loading, import from the component folder's `index.ts` to keep imports concise.

Thank you for keeping edits focused and reviewable.

Units (Use `rem` Not `px`)
- Prefer `rem` units for sizes (spacing, font-size, gaps, widths) in SCSS to improve accessibility and scale with root font-size.
- Avoid `px` for main layout and type sizing. Use `px` only for very small detailed borders or when interacting with third-party components that require `px`.
- Document the base font-size (commonly `16px`) in the project-level styles and add a comment in the theme file if applicable.
- Examples:
	- Prefer: `padding: 1rem; font-size: 1rem;`  (assumes root `font-size:16px`)
	- Avoid: `padding: 16px; font-size: 16px;`

Conversion quick reference:
- `1rem = 16px` (if `html { font-size: 16px }`)
- To convert px to rem: `valueInRem = pxValue / 16`