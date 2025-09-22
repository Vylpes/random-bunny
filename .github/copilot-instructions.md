# Copilot Instructions for `random-bunny`

## Project Overview
- **Purpose:** Fetches a random image URL from a specified subreddit, available as both a Node.js library and a CLI tool.
- **Entry Points:**
  - Library: `src/index.ts` (main API)
  - CLI: `src/cli.ts` (command-line interface)
  - Prebuilt binaries: `bin/` (platform-specific executables)

## Key Components
- **API Function:** `randomBunny(subreddit, sortBy, limit)`
  - Returns a JSON string with post details (see `README.md` for fields).
  - Defaults: `sortBy` = 'hot', `limit` = 100.
- **CLI:** Mirrors API functionality, see `src/cli.ts` and `docs/cli.md`.
- **Contracts:** Type definitions in `src/contracts/` (e.g., `IRedditResult.ts`, `ICliOptions.ts`).
- **Helpers:** Utility logic in `src/helpers/` (e.g., `cliHelper.ts`, `imageHelper.ts`).
- **Constants:** Error codes/messages in `src/constants/`.

## Developer Workflows
- **Install dependencies:** `yarn install`
- **Run tests:** `yarn test` (uses Jest, see `jest.config.cjs`)
- **Build (TypeScript):** `yarn build` (config in `tsconfig.json`)
- **Debug CLI:** Run `yarn start` or use prebuilt binaries in `bin/`

## Project Conventions
- **TypeScript:** All source code in `src/` is TypeScript.
- **Error Handling:** Centralized in `src/constants/ErrorCode.ts` and `ErrorMessages.ts`.
- **Testing:** Unit tests in `tests/`, mirroring `src/` structure. Snapshots in `__snapshots__/`.
- **Documentation:** API and CLI usage in `README.md` and `docs/cli.md`.
- **External APIs:** Fetches data from Reddit; see `src/helpers/imageHelper.ts` for fetch logic.

## Examples
- **API Usage:**
  ```ts
  import randomBunny from 'random-bunny';
  const result = await randomBunny('rabbits', 'hot');
  ```
- **CLI Usage:**
  ```sh
  yarn start -s rabbits --sort hot
  ```

## References
- Main API: `src/index.ts`
- CLI: `src/cli.ts`, `docs/cli.md`
- Types: `src/contracts/`
- Helpers: `src/helpers/`
- Tests: `tests/`

---
For more, see [README.md](../readme.md) and [docs/cli.md](../docs/cli.md).