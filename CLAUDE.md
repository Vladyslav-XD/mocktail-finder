# Mocktail Finder — guide for Claude Code

Read this first. It describes the project, how it is built and released, what is in flight right now, and how Vlad likes to work.

## Working with Vlad

- Vlad is a UX/UI designer, not a developer. Answer in Ukrainian. Explain every action and the reasoning behind each choice before doing it — teach, don't just run commands.
- Show what you are about to run or change and wait for his «ок» before anything irreversible: `eas submit`, `git push`, deleting files, anything in App Store Connect.
- Never print or commit secrets. `.env.local` holds the TheCocktailDB key and is git-ignored; leave it alone.
- Release state and decisions live in the claude.ai Project "Mocktail Finder" (docs `app-store-release-audit.md`, `app-store-listing-and-pages.md`, `photo-brief-1.1.md`). The Cowork session handles App Store Connect, texts, screenshots and photos; Claude Code handles builds, the simulator and git. Keep the "Current status" section below in sync when you change something.

## Task queue and status (how Cowork and Claude Code talk)

- `TASKS.md` — the queue. Cowork (or Vlad) adds tasks; work them top-down, one task = one commit, tick the box when done.
- `STATUS.md` — the log. After every finished task append: date, what changed, files touched, how it was verified. Cowork reads this file to pick up where you left off, so keep it factual and short.
- Before each commit: `npx tsc --noEmit` must be clean. Never run `eas build` or `eas submit` without Vlad's explicit ok in the terminal.
- **Push rule.** Standing permission: push the current release branch — now **`release/1.2`** (for the version after it, a new branch off `main`) — and version tags, as a backup after each finished task. Never touch other branches on GitHub, never `--force`. Remote `origin` = `https://github.com/Vladyslav-XD/mocktail-finder.git`. If a push asks for a login or a token, stop and say what is needed; never ask Vlad for a password.
- **`main`** is the default branch and holds exactly what is on the App Store (now `54056b7`, 1.1.0 build 5, tag `v1.1.0`). It is **only ever updated by a fast-forward merge of the release branch, after Vlad's explicit ok**. Never a direct commit, never `--force`. `release/1.1` stays as the record of the 1.1 cycle; the old course history lives on `archive/course-2026`. Leave both alone.

## What the app is

iOS app (Expo SDK 54, React Native 0.81, React 19.1, TypeScript, Redux Toolkit, React Navigation) that helps people discover, save and create alcohol-free drink recipes. Recipes come from TheCocktailDB (58 drinks in the `Non_Alcoholic` filter); favourites, user recipes and their photos are stored on the device only. No accounts, no analytics, no servers of our own. Bundle ID `com.filonexperiencedesign.mocktailfinder`, App Store ID 6811610325, iPhone only (`supportsTablet: false`), age rating 4+.

## Code map

- `App.tsx` — providers, splash (`SplashScreen.tsx`, waits for the Sora font), `Promise.all([hydrateStore(), loadDetailsCache()])`.
- `src/api/api.ts` — `fetchMocktailList()` (list endpoint returns only id/name/thumb) and `fetchMocktailDetails(id)`; `src/api/config.ts` — key/base URL; `src/api/detailsCache.ts` — memory + AsyncStorage cache of details (30-day TTL, prefetch with concurrency 4); `src/api/recipes.ts` — `withDetails`, `fetchMocktails`, `fillInDetails`.
- `src/utils/drinkTags.ts` — character tags (Iced/Frozen/Hot, Citrus, Tropical, Berry, Fruity, Creamy, Sparkling, Chocolate, Coffee, Tea, Minty, Spiced, Sweet, Savoury) derived from ingredients, measures, instructions and category. Cards show up to 3 (`tagsToSubtitle`). The same tags are the "Category" filters (`src/constants/filters.ts`, without Sweet); ingredient filters are regex-based there too.
- `src/utils/recipePhotos.ts` — user photos: camera (`takeRecipePhoto`, asks for camera permission, "Open Settings" if declined) or PHPicker via `expo-image-picker` (no library permission prompt), chosen in an action sheet; copied to `documentDirectory/recipe-photos/<id>.jpg`, stored as `recipe-photo:<id>.jpg` (relative on purpose — the container path changes between app updates), resolved with `resolveImageUri`.
- `src/utils/recipeText.ts` — share text; `APP_STORE_URL = 'https://apps.apple.com/app/id6811610325'`.
- `src/data/drinkPhotos.ts` + `assets/drinks/<id>.jpg` — 58 bundled drink photos (900×900), `drinkPhoto(id)` with a fallback to the TheCocktailDB image. `src/components/PhotoScrim.tsx` — dark fade under the status bar on recipe photos.
- `src/screens/*` — MocktailFinder (home: search, filters, list), RecipeDetails, Random ("Surprise"), Favourites, AddRecipe. `src/context/FavoritesContext.tsx` (favourites in AsyncStorage), `src/store/myRecipesSlice.ts` + `store.ts` (user recipes, `migrateRecipe` for old shapes, `updateRecipe`, `removeRecipe`; Edit and Delete buttons on a user recipe, Edit opens `EditRecipe` pushed on the stack), `src/context/ThemeContext.tsx` (system / light / dark, saved in AsyncStorage; tap the header toggle = light↔dark, press and hold = follow the system, a dot marks system mode).
- Hermes: no regex lookbehind. UK spelling in UI ("Favourites").

## Commands

```bash
npm install
npx tsc --noEmit                      # type check — keep it clean
npx expo export --platform ios        # bundle smoke test (no device needed)
npx expo start -c                     # dev server; press i for the iOS simulator (iPhone 17, status bar overridden to 9:41)
npx eas-cli@latest build --platform ios --profile production   # cloud build; build number auto-increments (appVersionSource: remote)
npx eas-cli@latest submit --platform ios                       # upload to App Store Connect / TestFlight
```

- If `eas build` asks "Do you want to log in to your Apple account?" answer **n** — signing credentials and the ASC API key live on Expo's servers.
- `EXPO_PUBLIC_COCKTAILDB_API_KEY` is set in `.env.local` locally and as an Expo project environment variable for EAS; without it the app silently uses TheCocktailDB's test key (dev only).
- In zsh `#` is not a comment in an interactive shell — never paste commands with trailing `# comments`.
- To reset the app's data in the simulator: delete Expo Go (`xcrun simctl uninstall booted host.exp.Exponent`), then press `i` again.
- Simulator can't test the camera; anything camera-related must be checked on a real iPhone through TestFlight.

## Current status (update me)

- **Live on the App Store:** 1.0 (1.0.0, build 4) released 22 Sept 2026; **1.1 (1.1.0, build 5) released 24 Sept 2026**. Release is manual in App Store Connect (Vlad presses Release after approval). https://apps.apple.com/app/id6811610325
- Git: `main` = `release/1.1` = `54056b7`, tags `v1.0.0-build4` and `v1.1.0`, GitHub Releases v1.0.0 and v1.1.0. The 1.1 queue is closed. **1.2 in progress on `release/1.2`** (branched off `main` at `54056b7` on 7 Oct 2026, `expo.version` 1.2.0); queue in `TASKS.md`, log in `STATUS.md`.
- **1.2.0 build 6** built 9 Oct 2026 (EAS, commit `7f84eca`) and uploaded to App Store Connect / TestFlight the same day; not submitted for review. `eas.json` → `submit.production.ios.ascAppId` = `6811610325` (needed for `eas submit --non-interactive`).
- The project folder lives at `~/Projects/mocktail-finder` (moved from Downloads on 24 Sept). Open Claude Code with `cd ~/Projects/mocktail-finder` then `claude`.
- Case study on vladfilon.com (repo `Vladyslav-XD/portfolio`) is updated for 1.1; privacy and support pages cover the camera, edit/delete and the theme.

## Version 1.2 "Pro" (started 5 Oct 2026; design handoff 7 Oct 2026)

- **The spec is `design_handoff_mocktail_1.2/`** (from Claude Design): `README.md` (screens, states, logic, tokens, tour), `COPY_EN_UK.md` (every string, en + uk), `data/recipes.json` (58 catalogue + 6 collections × 10), `prototype/…html` (offline, with a debug panel), `reference/mf-data.js` (behaviour reference). **Where the handoff differs from Figma or from older notes, the handoff wins.** Never invent copy; a missing string goes to STATUS.md → Open questions.
- The handoff's `CLAUDE_CODE_PROMPT.md` says `PROGRESS.md` → that is our `STATUS.md`; `TESTING.md` is the Ukrainian checklist Vlad runs on TestFlight (append an item with the expected result for every behaviour change); there is no separate component catalog — list new components in the STATUS.md entry.
- **Bilingual (en + uk):** every user-visible string goes through `t()` in `src/i18n/`, dictionaries built from `COPY_EN_UK.md`; new screens are built with keys, never literals. Language = AsyncStorage `@mocktail-finder/language` (`system` default), switch in About → Language. Ukrainian recipe texts for the 58 catalogue drinks live in `src/data/uk/drinks.json` (Cowork delivers; English fallback per field until then); collections are bilingual in `recipes.json`.
- **Logo:** the header/splash logo is `AnimatedMartiniIcon.tsx` (handoff `assets/logo-martini.svg`). Do not replace it with a generic martini icon.
- **Theme** moves from the header to About → Theme (System / Light / Dark). It stays free.
- Tokens and base components come first, in their own commit; no colour, size or motion literal in UI code after that. One task = one commit; a test for every piece of logic (amount scaling, ingredient keys, entitlements, plurals, hint conditions).

The queue is in `TASKS.md` (decisions, product ids, pre-approved dependencies at the top); the product decisions are in the claude.ai Project doc `pro-plan-1.2.md`. Non-negotiables: free features stay free; purchases go directly through Apple (StoreKit 2 via `expo-iap`), no RevenueCat, no analytics; prices on screen only from StoreKit; a visible Restore Purchases on the paywall, the collection sheet and About; "Data Not Collected" stays true. `expo-iap` does not run in Expo Go — use a development build for the simulator and TestFlight for real purchases; the app must not crash in Expo Go. Ask before adding any dependency not pre-approved in `TASKS.md`. No software of Russian origin.

## Next version after 1.2

Create a new branch off `main` (e.g. `release/1.3`), bump `version` in `app.json`, add the tasks to `TASKS.md`, same loop: one task = one commit, `tsc` clean, TestFlight on a real iPhone before submitting. The full history of 1.0 and 1.1 (review, rejections, App Store Connect quirks) is in the claude.ai Project doc `app-store-release-audit.md`.
