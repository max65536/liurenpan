# Repository Guidelines

## Project Structure & Module Organization
- `App.tsx`: App entry with mode switch and basic UI.
- `src/domain/`: Thin wrappers around `daliuren-lib` (`pan.ts`).
- `src/components/`: UI pieces (e.g., `PanResultView.tsx`, `TwelveGrid.tsx`, `Turntable.tsx`).
- `docs/`: Design and planning docs (`DEVELOPMENT.md`).
- `scripts/`: Tooling (e.g., `patch-metro-exports.js`).
- `README.md`: Setup and usage.

## Build, Test, and Development Commands
- `npm i`: Install dependencies and run postinstall patches.
- `npm run start` or `npx expo start -c`: Launch the Expo dev server with cache clear.
- Expo installs (as needed):
  - `npx expo install react-native-gesture-handler react-native-reanimated react-native-svg`.

Notes
- Postinstall adds `exports["./src/*"]` to Metro to avoid TerminalReporter export errors.
- Use Node 20+ (Metro requires >= 20.19.4).

## Coding Style & Naming Conventions
- Language: TypeScript/TSX preferred for new code.
- Components: `PascalCase` file names (e.g., `Turntable.tsx`).
- Modules & utils: `camelCase` exports.
- Indentation: 2 spaces; keep functions small and focused.
- Keep UI logic (components) separate from domain logic (`src/domain`).

## Testing Guidelines
- Framework: Not set up yet; recommend Jest + React Native Testing Library.
- Place tests alongside files or under `__tests__/` using `*.test.ts(x)`.
- Aim for unit tests on domain functions and basic render/interaction tests for components.

## Commit & Pull Request Guidelines
- Commits: Use clear, imperative summaries (e.g., "Add turntable inertia and snapping").
- Scope changes narrowly; one logical change per commit when possible.
- PRs must include:
  - Purpose and summary of changes.
  - Screenshots/GIFs for UI changes.
  - Steps to test (commands, inputs).
  - Links to issues/tasks.

## Security & Configuration Tips
- Do not hand-edit `node_modules` directly; rely on `scripts/patch-metro-exports.js` and `postinstall`.
- Keep `babel.config.js` with `react-native-reanimated/plugin` as the last plugin.
- Prefer `expo install` for RN native deps to ensure version compatibility.

## Agent-Specific Instructions
- Use small, focused PRs; avoid unrelated refactors.
- When adding architectural features, update `docs/DEVELOPMENT.md` first, then implement.
