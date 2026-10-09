# STATUS — log of work done (newest first)

Append one entry per finished task: date · task · what changed · files · how verified.

## 2026-10-09 · 1.2 task 11.4 — My Bar starter card (Claude Code)
- New `BarStarterCard` (My Bar → What I have, Pro, nothing ticked shown): `barStartT`, three numbered lines `barStart1–3` (brand circles like the recipe steps), the 13 `STARTER_KEYS` as tickable `Chip`s, outline button `barStartMore` → the Add ingredients sheet. The first tick shows the normal `BarSummaryCard` with the chip in it; removing the last tick brings the starter back. Free keeps the locked card.
- `showBarStarter()` in `src/utils/myBar.ts` decides it (= no shown tick).
- **Bug found by the new test and fixed:** tonic is only in collection drinks, so for Pro without collections a tick on it was filtered out of "Your bar" and the starter card would not change. `shownTicks` now always keeps starter ingredients.
- Not added: the "Ice, water, sugar and salt are always in." note — not in the card's spec (it stays on "Your bar").
- New strings (en + uk, verbatim): `barStartT`, `barStart1–3`, `barStartMore`. Components: new `BarStarterCard`.
- Tests: `showBarStarter` (4) in `myBar.test.ts`; total 120/120.
- Files: `src/components/BarStarterCard.tsx`, `src/screens/MyBarScreen.tsx`, `src/utils/myBar.ts`, `src/utils/__tests__/myBar.test.ts`, `src/i18n/en.ts`, `uk.ts`, `TESTING.md` § 6. Verified: `tsc` clean; screenshot with the task-11 set.

## 2026-10-09 · 1.2 task 11.3 — "Bartender school" in About (Claude Code)
- New `AboutRow` between Theme and Restore Purchases: label `aboutTour`, no value, chevron, VoiceOver hint `aboutTourHint`. Visible to everyone, in every build.
- Tap → `useOnboarding().startSchool()`: the new-install tour from step 0 for any user (`tourFor({ user, isPro, school })` in `logic.ts`), Pro step skipped for Pro users. The first card shows `tourSchoolT` / `tourSchoolS` instead of Welcome (app icon kept). It navigates to Home (closing About) like the DEV replay. Session only: nothing is persisted until it ends, then it ends like the normal tour (steps shown count as seen). The DEV panel keeps its two replay buttons.
- New strings (en + uk, verbatim from COPY_EN_UK.md): `aboutTour`, `aboutTourHint`, `tourSchoolT`, `tourSchoolS`.
- **Decision without asking:** row icon = `MapPinIcon` (an existing icon, "tour"); the handoff has none for this row. The martini is a tall logo-shaped icon and would not fit a 50-pt row. **Open question for Cowork:** a dedicated icon if wanted.
- Components changed: `AboutRow` (`hint`), `CoachState` (`school`). Tests: `tourFor` (3) in `logic.test.ts`; total 116/116.
- Files: `src/onboarding/logic.ts`, `OnboardingContext.tsx`, `CoachOverlay.tsx`, `src/components/AboutRow.tsx`, `src/screens/AboutScreen.tsx`, `src/i18n/en.ts`, `uk.ts`, `TESTING.md`. Verified: `tsc` clean; screenshot with the task-11 set.

## 2026-10-09 · 1.2 task 11.2 — Tip jar copy (Claude Code)
- `tipText` and `tipNote` replaced in `src/i18n/en.ts` and `uk.ts` with the strings from COPY_EN_UK.md → "Build 7 (Cowork, 9 Oct)", verbatim. No layout change.
- Files: `src/i18n/en.ts`, `src/i18n/uk.ts`, `TESTING.md` § 7. Verified: `tsc` clean, tests 113/113 (the i18n key-parity test included); screenshot of the tip jar with the task-11 set.

## 2026-10-09 · 1.2 task 11.1 — Restore Purchases, quieter (Claude Code)
- Paywall and collection sheet: the Restore text button goes from Button / brand to **Body S / `subtitle`**. About: `AboutRow` gets `muted` (icon and label in `subtitle`, label Body S, row height unchanged), used by the Restore row.
- **Decision without asking (accessibility):** the task names `textMuted`, but `textMuted` in light is #99A1AF on white = **2.6:1**, below the 4.5:1 text minimum. `subtitle` (#6A7282) = **4.84:1** light, 5.78–6.99:1 dark (in dark both tokens are the same colour). `subtitle` is also exactly what the prices note uses, which the task names as the target look. Cowork/Vlad: say if you want `textMuted` anyway.
- Touch area: `hitSlop` 8 on the two text buttons, so the target is ≥ 44 pt without moving anything.
- Still `accessibilityRole="button"` everywhere. Components changed: `AboutRow` (`muted`).
- Files: `src/screens/PaywallScreen.tsx`, `src/components/CollectionSheet.tsx`, `src/components/AboutRow.tsx`, `src/screens/AboutScreen.tsx`, `TESTING.md`. Verified: `tsc` clean; screenshots with the task-11 set.

## 2026-10-09 · Bug: no tour after updating from 1.1 (build 6) — fixed (Claude Code)
- Vlad's report: build 6 from TestFlight over 1.1.0 (build 5) with his data showed no tour, not at first launch and not later. A clean install did show it. His 1.1 data is gone from the phone, so it was reproduced on the simulator.
- Ruled out by reading the code: the tour is not behind `__DEV__` or a DEV switch; no persisted "hints off" exists; the 1.1 storage keys (favourites, own recipes, theme) match what 1.2 checks; the first tour card (Welcome / What's new) has no target, so no layout measurement can hide it.
- Reproduction in Release on "Mocktail SE" (iOS 26.5):
  - 1.1.0 built from tag `v1.1.0` (`xcodebuild -configuration Release`; `expo run:ios` could not find the Simulator app from this shell, and two old pods needed `IPHONEOS_DEPLOYMENT_TARGET=15.1` with the current Xcode; local build only, nothing in the repo).
  - 1.1-format data written into its AsyncStorage: a favourite (Afterglow), an own recipe with 1.1 string ingredients, theme "dark"; 1.1 showed them (dark theme).
  - 1.2 Release (`release/1.2` at `163a9d2`) installed over it. **With clean 1.1 data the update tour did show** ("What's new in 1.2", dark theme kept); `@mocktail-finder/onboarding` = `{tourDone:false,user:"upd"}`.
  - **With one broken entry (`null`) in the saved recipes: no tour, the saved dark theme ignored, a "Collections" hint instead** — on every launch. That matches Vlad's phone.
- **Cause:** `App.tsx` read six things during the splash with one `Promise.all`. `hydrateStore` ran `migrateRecipe` on every saved recipe and threw on a broken entry, so the whole `Promise.all` rejected: the onboarding state, theme and language were never set and the onboarding fell back to `tourDone: true` — the tour was skipped silently and permanently. Whether Vlad's data had exactly a `null` entry cannot be checked any more; any failure of any of the six reads had the same effect.
- **Fix:**
  - `src/utils/startup.ts` `orFallback`: every startup read falls back on its own, so one failure no longer costs the others.
  - The onboarding fallback is now `tourDone: false` (`ONBOARDING_FALLBACK`): if the state cannot be read, the tour shows rather than being skipped.
  - `savedRecipes()` in `src/store/store.ts` drops entries that are not recipes before migration, in `hydrateStore` and in `FavoritesContext`.
- Tests: `src/onboarding/__tests__/storage.test.ts` (10): clean install → new tour; install over 1.1 (favourites + recipes + theme, and each alone) → update tour; broken entry still an update; second launch keeps the tour pending; `savedRecipes`; `hydrateStore` with a broken entry resolves (fails on the old code); one failed read keeps the others. Total 113/113.
- Verified: `tsc` clean; the same broken 1.1 data on the simulator in Release now shows "What's new in 1.2" with the dark theme kept. TESTING.md § 8: new item for the update path on the phone.
- Files: `App.tsx`, `src/utils/startup.ts`, `src/store/store.ts`, `src/context/FavoritesContext.tsx`, `src/onboarding/__tests__/storage.test.ts`, `TESTING.md`.

## 2026-10-09 · 1.2 build 6 — uploaded to TestFlight, not submitted for review (Claude Code)
- Vlad reviewed the release screenshots and gave the ok for the build.
- Before: `npx tsc --noEmit` clean; Expo account confirmed.
- `npx eas-cli@latest build --platform ios --profile production --non-interactive` (non-interactive = "n" to the Apple-account login; credentials from Expo's servers: distribution certificate and provisioning profile valid until 15 Sept 2027).
- Result: **finished**, version **1.2.0**, build number **6** (auto-incremented from 5), distribution store, SDK 54, commit `7f84eca`.
  - Build: https://expo.dev/accounts/filon-experience-design/projects/mocktail-finder/builds/0a90bb60-ce99-42ea-8895-72c504791c9f
- Upload (Vlad's ok, 9 Oct): `npx eas-cli@latest submit --platform ios --id 0a90bb60-… --non-interactive`.
  - First try failed before uploading anything: "Set ascAppId in the submit profile (eas.json)". Non-interactive mode cannot ask which App Store Connect app to use.
  - Fix: `eas.json` → `submit.production.ios.ascAppId` = `6811610325` (the public App Store id).
  - Second try: **uploaded** with the ASC API key from EAS servers (key 69L77B3H8P). Submission: https://expo.dev/accounts/filon-experience-design/projects/mocktail-finder/submissions/e0919b4e-223e-43b8-8719-8dd9b839da06
- Not submitted for review. **Next:** Apple processes the build (≈5–10 min, email), then TestFlight on Vlad's iPhone per `TESTING.md`. The 11 products, Family Sharing and a sandbox tester must exist in App Store Connect before testing purchases.

## 2026-10-08 · 1.2 task 10 — ready for review, STOPPED before the build (Claude Code)
**Report for Vlad.** Tasks 0–9 are done and pushed (`release/1.2`, last code commit `78fa0fd`). Nothing has been built or uploaded.
- Checks:
  - `src/data/uk/drinks.json` is unchanged since Cowork delivered it on 7 Oct; there is nothing newer on GitHub.
  - `npx tsc --noEmit` clean; `npm test` 103/103 in 11 suites; `npx expo export --platform ios` bundles (1559 modules); `npx expo install --check` up to date.
  - `app.json`: version 1.2.0, bundle id unchanged, no `ios.buildNumber` (EAS `appVersionSource: remote` + `autoIncrement` → the next build is 6, never reused).
- **Screenshots for review: `~/Desktop/mocktail-1.2-release-review/`** — 88 files: `SE/` and `ProMax/` × `en-light`, `en-dark`, `uk-light`, `uk-dark` × 11 screens:
  - Home, Recipe Free, Recipe Pro, My Bar Free, My Bar Pro, Shopping list, Paywall (opened from Servings), Collection sheet (Winter Warmers), About, tour welcome, tour Collections.
- How they were made:
  - A throwaway driver in the app (not committed) switched language and theme through the app's own settings and used the DEV switches for Free / Pro. Hints were off for the run.
  - The driver asked a local-only screenshot server on the Mac for each frame and waited for it, so every file shows exactly the screen named.
  - Two first attempts were discarded. Another Claude session was driving the shared simulators for Pace Tape at the same time, and log-based timing lagged on the Pro Max.
- **New simulators** (Vlad's ok, 8 Oct): "Mocktail SE" (iPhone SE 3rd gen) and "Mocktail Pro Max" (iPhone 17 Pro Max), iOS 26.5, used only by this project, so other projects' sessions cannot interfere. Expo Go, the `exp://` approval and the 9:41 status bar are set up on both.
- What the screenshots cannot show yet:
  - **Prices**: Expo Go has no StoreKit, so every buy button reads "Not available right now" and the tip cards "—". Real prices, the 0.6 s skeleton, purchasing and "Thanks!" need the 11 products in App Store Connect and a TestFlight build.
  - On the SE, Recipe Free and Pro look the same above the fold; the locked Servings row and Pro buttons are lower. The Pro Max shows the difference.
- **Next, only after Vlad's ok**:
  1. `npx eas-cli@latest build --platform ios --profile production` (answer **n** to the Apple-account login question).
  2. TestFlight on Vlad's iPhone per `TESTING.md` (sandbox: Pro, a collection, Everything on a second tester, a tip, Ask to Buy, Restore after reinstall).
  3. Cowork updates screenshots / What's New / App Store Connect.
  4. `eas submit` only with a separate ok.
- Before TestFlight: the 11 products from TASKS.md must exist in App Store Connect (Pro, Everything, 6 collections, 3 tips), Family Sharing on for the 8 non-consumables, plus a sandbox tester. Vlad / Cowork do this; Claude Code does not touch App Store Connect.

## 2026-10-08 · 1.2 task 9 — G. Tour and hints (Claude Code)
- **Logic** `src/onboarding/logic.ts` (pure, tested):
  - `tourSequence`: new install welcome + Collections, Servings, Shopping list, Share as a card, Your own recipes, What's at home?, Mocktail Finder Pro; update from 1.1 what's new + the same without Your own recipes; Pro users skip the last step.
  - `stepCounter` ("1 of 7", none on the first card); `detectTourUser` (update = favourites, own recipes or a saved theme on the first 1.2 launch).
  - `hintFor`: the README chains — Recipe Servings → Shopping list → Share as a card → Keep the ones you love; Home Collections → Can't decide?; Add Recipe Your own recipes until a photo; Shopping list Tick or remove; My Bar What's at home? → Mocktail Finder Pro. One at a time, each once, only after a navigation that follows the tour, never over a sheet, modal, About or the paywall.
  - `afterHint`: a Free user who dismisses a paid hint gets no more paid hints until the next session. `STARTER_KEYS` for What's at home?.
- **State** `@mocktail-finder/onboarding` (`STORAGE_KEYS.onboarding`): tour done, user (new / upd), seen hints, session counter; read during the splash (`loadOnboarding`, which also detects the user on the first 1.2 launch). Session-only: navigation count, opened recipes, the paid-hint pause.
- **`OnboardingProvider`** (inside the NavigationContainer, under `PaywallProvider`):
  - Runs the tour: each step takes the user to its screen (the tour recipe is Virgin Margarita when Dry January is open, otherwise Afterglow). Skip anywhere; the last step "Learn more" → paywall (My Bar highlighted), "Not now" → Home; every shown step counts as seen.
  - Counts navigations through `navigationRef`, reads the route for the hint rules, keeps a registry of `CoachTarget`s. Screens report facts with `useCoachFacts`.
  - `OverlayProvider` counts open sheets (`BottomSheet`, the share-card preview) so hints never sit on top of one.
- **`CoachOverlay`** (at the root, over the navigator):
  - Tour: `coachDim` backdrop with a cut-out (four rectangles) and a 3 px `coachRing`; the UI underneath is blocked.
  - Hint: a 3 px ring that pulses outwards over 1.6 s (static with Reduce Motion), no dim, the UI stays usable; hidden while its target is under the status bar or the tab bar.
  - `CoachBubble` (inside the overlay): caret up / down, pill "Pro" (Free) / "New in 1.2" (Pro users updating), counter, title, text, the what's-new list, the What's at home? starter chips (they tick My Bar) with "N drinks you can make right now", Skip / Next / Done / Got it / See Pro / Learn more / Not now as the README lists.
- **Targets** (`CoachTarget`): first collection card (coll), Surprise pill, Servings row, Add to shopping list, Share as card, recipe heart (fav), Add Photo, the My Bar tab button, the first shopping-list row (swipe).
- **Decision without asking**: a tour step about a recipe tool scrolls the recipe so the button is on screen. On an iPhone the Shopping list / Share as card buttons start below the edge; the taller prototype never needed it.
- **DEV**: About → DEV → "Replay tour (new install)" / "Replay tour (update from 1.1)" clear the tour and seen hints and start again.
- Tests: `src/onboarding/__tests__/logic.test.ts` (13). Total 103/103 green.
- Verified:
  - `tsc` clean, `expo export` bundles.
  - In Expo Go on a fresh state (SE Ukrainian, Pro Max English), the tour driven by a temporary auto-"Next" (removed):
    - Collections "1 з 7" ring on the first card.
    - Servings with the "Pro" pill, the recipe scrolled to it.
    - Share as a card, the recipe scrolled to the button.
    - What's at home? with the starter chips on the My Bar tab.
    - Mocktail Finder Pro "7 з 7" centred.
    - Learn more → the paywall with "What can I make" highlighted.
  - After the tour, opening a recipe showed the hint "Keep the ones you love" (pulsing ring on the heart, no dim, Got it) on both phones.
  - Not seen on screen: the update-from-1.1 tour (needs a phone with 1.1 data, or DEV replay), the Pro user without the last step, See Pro, the next-session pause, Reduce Motion — TESTING.md § 8.

## 2026-10-08 · Restore reachable on the smallest iPhone (Claude Code)
- Vlad's review of task 8: on iPhone SE the collection sheet and the paywall are taller than the screen, so the hint and Restore Purchases sit below the edge. Restore must be reachable (App Review).
- Checked on the SE simulator by opening both with a temporary scroll offset to the end (removed): **both already scroll to the end**. The collection sheet's content is in the `BottomSheet` ScrollView, bounded by the sheet's max height. The paywall is a full-screen ScrollView. Restore, the hint and the prices note are all reachable. No layout change was needed for that.
- Fixed while there: scrolled paywall text ran under the status bar and over the clock. The top safe-area inset now sits outside the scroll view.
- Files: `src/screens/PaywallScreen.tsx`. Verified: `tsc` clean; SE screenshots scrolled to the end.

## 2026-10-08 · 1.2 task 8 — F. Paywall, collection sheet, About (Claude Code)
- **`usePaywall()` is real now** (`src/purchases/usePaywall.tsx`, replacing the task-5 stub, same two calls): `openPaywall(feature?)` navigates to the paywall through `navigationRef`; `openCollection(packId)` opens the one `CollectionSheet` drawn by `PaywallProvider` (inside the NavigationContainer in `App.tsx`). Every locked thing from tasks 5–7 now opens them.
- **`PaywallScreen`**: a modal in the root stack, sliding up in 400 ms on the shared easing.
  - Content: ×, app icon 56 (radius 13), "Mocktail Finder Pro" (`obProT`), subtitle, four `FeatureRow`s (the feature that opened it is highlighted and listed first), "Get Pro · {price}", "Everything · {price}", hint, Restore Purchases, prices note + Privacy Policy link.
  - States: 0.6 s minimum price skeleton (`duration.priceSkeleton`) · store unreachable (banner "The App Store is not reachable…", buttons "Not available right now" at 50 %) · purchasing (spinner in the tapped button) · "You have Pro" disabled · Everything hidden when owned. It closes itself once a purchase made from it unlocks Pro.
  - Its own dark-text status bar in light mode: the default light bar was invisible on its white background.
- **`CollectionSheet`** (`BottomSheet`): cover 170, title, description, 4 thumbnails, "Unlock collection · {price}" with a lock, "Everything · {price}" (hidden when owned), hint, Restore. States: locked, purchasing (spinner), unreachable, Everything owned. It closes itself when the collection unlocks.
- **`AboutScreen` complete**:
  - App icon 64 (radius 14), name, version line "Version 1.2.0 (N) · Pro unlocked / · Free". N is the binary's `CFBundleVersion` from `Constants.platform.ios.buildNumber`, set by EAS; Expo Go has none, so the brackets are left out. No new dependency.
  - "Get Pro" for Free only; rows Language, Theme, Restore Purchases, Privacy Policy, Support, Rate on the App Store (`src/constants/links.ts`).
  - "Drinks for the developer" on the tip-panel colour: three identical `TipCard`s (icon, name, StoreKit price or "—" at 50 % when unreachable, spinner while buying, "Thanks!" pill), note "Nothing unlocks".
  - Tip icons hop in a 6 s wave, offsets 0 / 0.35 / 0.7 s, static with Reduce Motion. The prototype's inner details (spinning lemon, bubbles, wiggling straw) are left out: the wave is the brief.
- **DEV switches**: long-press 800 ms on the version line, `__DEV__` only (`usePurchases().dev` is null otherwise). Simulate Pro, Everything, each of the six collections, store unreachable; tour and hints reset follows in task 9. Labels not in the copy doc are English in `src/constants/devLabels.ts` (never shown in TestFlight or the App Store).
- New: `PaywallScreen`, `CollectionSheet`, `TipCard`, icons (`BulletListIcon`, `UsersIcon`, `ImageIcon`, `RestoreIcon`, `ExternalIcon`, `StarIcon`, `TIP_ICONS`), `navigationRef`, tokens (`skeletonOnBrand`, `sizes.appIcon`, `appIconSmall`, `collectionCover`, `tipCard`, `skeletonPrice`, `skeletonHeight`).
- Verified:
  - `tsc` clean; `npm test` 90/90; `expo export` bundles.
  - In Expo Go (store unreachable by design), SE (Ukrainian, light) and Pro Max (English, dark), with temporary triggers removed before this commit:
    - About with the DEV panel, and the tip jar ("—", 50 %).
    - Paywall opened from Servings (row highlighted and first, store banner, both buttons "Not available right now").
    - Paywall from Share card as Pro ("You have Pro", disabled).
    - Collection sheet for Winter Warmers.
  - Not visible in Expo Go: prices, the skeleton, purchasing, "Thanks!". They need StoreKit: a development build with products in App Store Connect, or TestFlight (TESTING.md § 3, § 7).

## 2026-10-07 · Decision: Sora stays, Ukrainian titles in the system font (Vlad)
- Vlad asked why Ukrainian titles look different from English ones. The reason: the bundled **Sora has no Cyrillic** (checked in `Sora_700Bold.ttf`: 378 code points, 0 in U+0400–04FF, no і ї є ґ), so iOS draws Cyrillic in San Francisco. The handoff loads Sora for Latin only, so the prototype does the same.
- This affects only what is set in Sora: the screen titles in the header ("Мій бар", "Улюблені", "Про застосунок"…) and the share card title. The "Mocktail Finder" wordmark is Latin and stays Sora in both languages. Everything else uses the system font anyway.
- **Decision (Vlad, 7 Oct): leave it as it is.** No font change. If it comes back, any Cyrillic display font must be checked for origin first (no Russian foundries such as ParaType).

## 2026-10-07 · 1.2 task 7 — E. My Bar (Claude Code)
- **New third tab "My Bar" / «Мій бар»** (glass icon); Add Recipe moves to fourth. The prototype tab bar is Home · Favourites · My Bar · Add; the task's "rename the third tab" came from Figma ("Kitchen"), and the handoff wins. Header subtitle "Mix with what you have".
- `MyBarScreen` with `SegmentedControl` "What I have | Shopping list":
  - **Free**: a `LockedCard` per segment (own title and text, "Get Pro · {price}", or "Not available right now" and disabled when there is no price) + the "Pro also adds…" line. Never an empty screen. The button goes to `usePaywall().openPaywall('mybar' | 'shop')` (task-8 stub).
  - **Pro, What I have**: `BarSummaryCard` (count, ticked items as removable chips — first 8 then "+N", empty text, Add ingredients, Clear, "Ice, water, sugar and salt are always in."), then "You can make now (N)" and "Missing one ingredient (M)" with "Missing: <ingredient>" in the error colour (`RecipeCard.subtitleColor`). Cards open the recipe in the Home stack.
  - **Pro, Shopping list**: "N items · M ticked" + "Clear ticked"; `CheckRow`s (tap ticks and dims, swipe left → red Delete, VoiceOver delete action), amounts in the current language ("8 частин + 4 частини"); "Share list" → native share sheet as text; empty state with the bag icon.
- `AddIngredientsSheet` (full-height `BottomSheet`): "Your bar" + count + Clear; search "Find an ingredient…" (matches the name on screen and the English one); "Most used" (top 10 by drink count) and the 9 groups (`IngredientGroup`: icon, "a of b ticked" in brand, collapsible, tiles two per row with brand border + tip-panel fill when ticked); "Nothing found."; bottom button "Show N drinks" / "Done". Each opening starts with no search and only Most used open.
- Logic `src/utils/myBar.ts`: `keysOf` (generated table for the 118, keyOf for own recipes), `keyFrequency`, `mostUsed`, `groupItems`, `barResults`, `shownTicks`. Only visible drinks count, so a collection that locks again drops its keys while the ticks stay saved. Ticks persist in `@mocktail-finder/pantry` (`pantry` slice, `STORAGE_KEYS.pantry`; `addKeys` is ready for the tour step).
- My Bar loads the catalogue itself when Home has not yet: opened first, it showed an empty bar until this fix.
- Ukrainian on the smallest iPhone: "Додати інгредієнти" plus "Очистити" do not fit one row, so Clear wraps under the button instead of cutting the label.
- New components: `BarSummaryCard`, `IngredientGroup`, `AddIngredientsSheet`; icons `GlassIcon`, `ChevronDownIcon`, `BagIcon`, `GROUP_ICONS` (prototype outlines). Tokens `sizes.tickCircle`, `sizes.tile`, `sizes.emptyTextWidth`.
- Tests: `myBar.test.ts` (keys, Most used order, groups and search, always-available, can make / missing one, **lime + mint + soda water finds catalogue drinks**, ticks of locked drinks hidden). 90/90 green.
- Verified:
  - `tsc` clean, `npm test` 90/90, `expo export` bundles.
  - In Expo Go, SE (Ukrainian, light) and Pro Max (English, dark), with temporary start tab and DEV Pro (removed before this commit):
    - Free locked card.
    - Pro "Your bar" with 5 ticks → "You can make now (1)" Limeade, "Missing one ingredient (9)".
    - The sheet ("Most used 2 of 10 ticked", "Fruit, veg & juice 3 of 21 ticked", "Show 1 drink").
    - The list ("3 позиції · 1 відмічено", merged amounts).
    - With 2 ticks: "2 інгредієнти" and Missing one (4).
  - Not seen on screen: the red "Missing:" line (below the fold), swipe to delete, the share sheet, persistence across a restart (need taps). TESTING.md § 6 covers them.
- Environment: during this task Xcode updated to 27.0 and blocked simctl and `python3` until its license was accepted. Vlad accepted it. While cleaning test data I uninstalled Expo Go from the SE simulator by mistake; it was reinstalled from the Expo cache and its setting restored. Simulator only.

## 2026-10-07 · Share card: names as in the app (Claude Code)
- Vlad's review of task 6:
  - (1) "Tags cut off on the Ukrainian card": the three-tag limit was already in `095646c`, but the PNGs in `~/Desktop/mocktail-1.2-tasks-5-6/` had been captured before it. Regenerated: three tags in both languages.
  - (2) Ingredient names on the card are now written **as on the recipe screen**, capitals kept ("3 parts  Grenadine", "Ice — …"). Vlad's decision; the prototype lower-cased them.
- Also: spaces inside each ingredient on the card are non-breaking, so the line wraps only between ingredients ("12 / parts" no longer splits).
- `cardIngredientLine` = the recipe's `ingredientLines` joined with "  ·  ". Files: `src/utils/recipeParts.ts`, its test.
- Verified: `npm test` 82/82, `tsc` clean. The cards were captured again on SE (Ukrainian) and Pro Max (English), both 1080 × 1350, and replaced in the Desktop folder (files 10–12).

## 2026-10-07 · 1.2 task 6 — D. Recipe (Claude Code)
- **`RecipeDetailsScreen` rewritten** per README → Screens → Recipe:
  - The photo is 300 high and scrolls with the page (the 1.1 sticky header is gone, as in the prototype). Round back and heart buttons (36, float-button colour). Title card: Title L, tag badges, description (collection drinks; a user recipe's own short text).
  - Ingredients card with the Servings row + `Stepper` 1–12 (starts at the written servings), then the lines in the handoff formats. Steps card with numbered brand circles.
  - Buttons: Add to Favourites ↔ Saved to Favourites (filled ↔ outline, filled heart), **Share Recipe (free)**, Add to shopping list (Pro), Share as card (Pro); own recipe: Edit / Delete as in 1.1.
  - Free: the Servings row and the two Pro buttons at 50 % with a small lock; any tap → `usePaywall().openPaywall('serv' | 'shop' | 'card')`, still the task-5 stub until task 8.
- **Measure and name apart**:
  - `RecipeDetails.parts` from the API. The details cache moves to `@mocktail-finder/details/v2`; v1 is removed on launch and the 58 drinks are fetched again once. A favourite opened before that happens shows at once and upgrades quietly.
  - `Recipe.parts`; Add / Edit Recipe now saves parts and Edit puts amount and name back in their own fields (1.1 recipes keep the old behaviour).
- `src/utils/recipeParts.ts`:
  - `bilingualParts`: [English, Ukrainian] per ingredient — collections from their data, catalogue from the API + Cowork's file, own recipes as typed. A 1.1 line without a split scales only its leading measure ("1 can 7-Up" → "2 cans 7-Up").
  - `ingredientLines`, `cardIngredientLine`, `baseServings`.
- **Shopping list**: `src/utils/shoppingList.ts` (`addToShoppingList`: current servings, ice and water skipped, the same ingredient again → "100 ml + 60 ml" and un-ticked; `itemAmount`, `shoppingListText`), `shoppingList` slice persisted in `@mocktail-finder/shopping-list` (`STORAGE_KEYS.shoppingList`, hydrated with the user recipes). Toast "Added N ingredients" with the plural. The list screen comes with My Bar (task 7).
- **Share as card**: `react-native-view-shot` 4.0.3 (pre-approved; author Gaëtan Renaudeau, France).
  - `ShareCard` draws the 1080 × 1350 design at any scale; `ShareCardSheet` shows the dark preview (title, ×, card, "1080 × 1350", Share) and captures an off-screen copy drawn at 1 / PixelRatio, so the PNG is exactly 1080 × 1350 on every iPhone. Then the native share sheet.
  - Card: photo 1080 × 820 (bundled photo, the user's own, or the no-photo gradient), title Sora Bold 76/90, tags in brand (collection drinks add "· 0.0%"), one ingredient line at the current servings (2 lines max), footer logo + "Mocktail Finder · apps.apple.com/app/id6811610325". Card colours and metrics live in `src/theme/shareCard.ts`.
  - Decision without asking: the card shows at most three tags, like the list cards. Five catalogue tags ran off the line.
- Components: `Button` gained `trailing`, `tone="danger"`, `locked`; `Stepper` gained `dimWhenLocked` (the Servings row dims itself, the stepper must not dim again). New `ShareCard`, `ShareCardSheet`. Logo path exported as `LOGO_GLASS_PATH`.
- Tests: `recipeParts.test.ts` (both languages, × 3 with the ice "a + b", plural units, 1.1 lines, card line, shopping list add / merge / un-tick / share text). 81/81 green.
- Verified:
  - `npx tsc --noEmit` clean; `npm test` 81/81; `npx expo export --platform ios` bundles.
  - In Expo Go (temporary start screen and DEV switches, all removed before the commit):
    - Afterglow as Free on SE (Ukrainian) and Pro Max (English): locked Servings + lock, lines "1 part  Grenadine".
    - As Pro at 3 servings: "3 parts / 12 parts".
    - The card preview in Ukrainian.
    - The captured PNG measured **1080 × 1350 px on both** the @2x SE and the @3x Pro Max.
  - Not done on screen: the native share sheet itself, Photos / WhatsApp (needs a tap / real phone → TESTING.md), adding to the list (logic covered by tests).

## 2026-10-07 · 1.2 task 5 — C. Home and header (Claude Code)
- **Home** (`MocktailFinderScreen`, rewritten), in the handoff order Search → Collections → Category → Filter by Ingredients → Featured Recipes:
  - Collections: a horizontal row of the new `PackCard` (160 wide, cover 160 × 130 radius 16; pill with lock + StoreKit price, a lock alone when the store is unreachable, or ✓ "Unlocked"). "Everything · {price}" right of the title, hidden when owned or when there is no price. The row hides while a search, a category or an ingredient filter is on.
  - Tapping an unlocked collection lists only its drinks: "<collection> · 10 drinks" with "All recipes" back. Any chip leaves the collection; search still works inside it.
  - Category: all 15 chips from 1.1 (Vlad's decision; the prototype's six were a sample) + All + My Recipes, in **one horizontally scrolling row** (`Chip`), with Cowork's Ukrainian chip forms (`COPY_EN_UK.md → Category chips` → `uk.ts tagChip`).
  - Filter by Ingredients: one scrolling row too. It stays multi-select as in 1.1 (the prototype picks one; nothing free is taken away).
  - Featured Recipes with the "Surprise recipe" pill. Unlocked collection drinks join search and filters through `selectVisibleDrinks`.
- **Locked collection / Everything** go through `usePaywall()` (`src/purchases/usePaywall.ts`), a **stub** until task 8 brings the paywall and the collection sheet. Until then those two taps do nothing on screen (a log line in debug builds).
- **Header** (rewritten): gradient from tokens; the logo (`AnimatedMartiniIcon`, the same glass) with its foot on the wordmark baseline; the title in Sora 28/34; only "…" on the right (opens About), or ← on pushed screens. The theme toggle is gone, along with its three English-only VoiceOver strings. Logo bubbles now follow the handoff: 3.4 s loop, rise 9 → −6 units, fade in by 22 % and out after 72 %, four bubbles a quarter cycle apart. With Reduce Motion the bubbles and the splash breathing stand still.
- **About, first part** (pushed over the tabs, new `RootNavigator`: tabs + About, push 340 ms on the shared easing): Language (System (<iPhone language>) / English / Українська) and Theme (System / Light / Dark), each an `OptionSheet` that applies at once and closes. Brought forward from task 8 so the theme, gone from the header, stays reachable; the rest of About comes in task 8. `ThemeContext` now exposes `setMode` (the toggle API is gone). New `AboutRow` / `AboutGroup`.
- New icons `DotsIcon`, `GlobeIcon`, `ThemeIcon`, `ChevronRightIcon`; tokens `unlockedPillBg/Text`, `sizes.packCard/packCover/logo/logoBaseline`.
- `eas.json`: no answer on the development profile, so the default was taken without asking: **(c) leave it as it is** and build for the simulator locally with `npx expo run:ios`.
- Verified: `npx tsc --noEmit` clean; `npm test` 70/70; `npx expo export --platform ios` bundles. In Expo Go, iPhone SE (Ukrainian, light) and iPhone 17 Pro Max (English, dark): Home in the new order; collection covers; lock pills without a price (Expo Go = store unreachable, as designed), so no Everything link; chips in one row; header logo on the baseline. About in both languages and themes. With DEV Everything and Dry January opened (temporary changes, removed before this commit): ✓ Unlocked pills, "Dry January · 10 drinks" + "All recipes", no chip active. Not seen on screen: a price in a pill and the Everything link (they need StoreKit products), the option sheets' tap-through, Reduce Motion.

## 2026-10-07 · 1.2 task 4 — B. purchases, StoreKit 2 (Claude Code)
- `expo-iap` 5.8.2 (pre-approved, author hyochan / hyodotdev, South Korea; its config plugin added to `app.json`). Its docs support Expo SDK 53+ (iOS 15.1+ on SDK 53–54); we are on SDK 54. The Android-only Kotlin setting from its docs is not needed (iPhone-only app), so no `expo-build-properties`.
- `src/purchases/storeKit.ts` is the only file that talks to StoreKit. `isStoreSupported()` is false in Expo Go and off iOS, so every call there answers "unavailable" instead of crashing; the library is `require`d only where it can work.
- `src/purchases/PurchasesContext.tsx` → `usePurchases()`: `{ available, loading, price(id), isPro, ownsEverything, unlockedPacks, purchasing, thankedTips, buy, restore, tip, dev }`. `price(id)` is StoreKit's `displayPrice` or null; null means "Not available right now" (unreachable store, or the product not in App Store Connect yet).
  - On launch (non-blocking): cached owned ids from `@mocktail-finder/entitlements` (`STORAGE_KEYS.entitlements`) are put in the store during the splash, so the first frame is right. Then connect, load products, read current entitlements, save them, and listen for transaction updates.
  - Ask to Buy: toast "Waiting for approval…", stays locked, unlocks when the approved transaction arrives. Refund or revocation (`revocationDateIOS`): locks again silently. Family Sharing: nothing special, shared transactions count.
  - Success: unlock everywhere (Redux `entitlements` → `selectVisibleDrinks`), finish the transaction, toast "Welcome to Pro" (Pro, Everything) or "<collection> unlocked" (in the language on screen). Toasts only for purchases started in this session; replays on launch are silent.
  - Cancelled: silent. Failed: "The purchase didn't go through. Please try again."
  - Restore: `restorePurchases()` (AppStore.sync), then "Purchases restored" or "Nothing to restore". With the store unreachable it says "Not available right now".
  - Tips: consumable, finished at once, the card's "Thanks!" (`thankedTips`) + "Thank you! Cheers from Dublin", can tip again, never an entitlement.
  - DEV switches (`__DEV__` only, `dev` is null otherwise): Pro, Everything, any collection, store down. They add to real ownership and never remove a real purchase. Their UI comes with About (task 8).
- `src/purchases/ownership.ts`: `ownedFromTransactions` (purchased, unrevoked non-consumables; pending and tips excluded), `withDevOverrides`.
- Copy: the pending and failed strings (README → Open questions 1, confirmed 7 Oct) were added to `COPY_EN_UK.md` (`## Purchases: pending and failed`) and to both dictionaries as `pendingToast` and `failedToast`.
- Tests: `ownership.test.ts` (pending, refund, tips, duplicates, DEV overrides, error kinds, Expo Go = store off, dev or App Store build = on). 70/70 green.
- Verified:
  - `npx tsc --noEmit` clean; `npm test` 70/70; `npx expo export --platform ios` bundles.
  - **Expo Go**: no crash; temporary on-screen readout showed `available=false`, prices null; with DEV Everything → `pro=true`, 6 collections, **118 visible drinks**.
  - **Native build**: `npx expo run:ios` (local Debug build for the iPhone 17 Pro Max simulator; `ios/` is git-ignored) compiled `ExpoIap 5.8.2` + `openiap 3.6.1` with **0 errors, 0 warnings**. The app launches, and the device log shows StoreKit 2 at work (`TransactionUpdateStart`, `Products_SK2`, `TransactionQuery`), with no crash. Products are not in App Store Connect yet, so no prices load. Real purchases are for TestFlight + sandbox (TESTING.md § 3).
  - Prebuild rewrote the `ios` / `android` npm scripts to `expo run:*`; restored. It did not change `app.json`.
- The temporary readout on Home was removed before this commit.

### Open question (task 4)
- `eas.json` already has a `development` profile with `developmentClient: true`, which needs the `expo-dev-client` package. That package is not installed and not pre-approved. Options: (a) add `expo-dev-client`; (b) drop `developmentClient` from the profile (a plain Debug simulator build that loads JS from Metro); (c) keep building locally with `npx expo run:ios`, which works now without anything new. Until Vlad picks, nothing changes in `eas.json`.

## 2026-10-07 · Removed the unused TabBar (Claude Code)
- `src/components/TabBar.tsx` deleted with Vlad's ok (task 2 → Open question 3). It was a 1.0 leftover that nothing imported; the tab bar is `src/navigation/TabNavigator.tsx`. Verified: no import anywhere, `npx tsc --noEmit` clean.

## 2026-10-07 · Ukrainian for the 1.1 strings (Claude Code)
- Cowork added `## Strings from 1.1 not in the handoff` to `COPY_EN_UK.md` (28 rows incl. `a11yBack`, `a11yShuffle`). They are now in `src/i18n/uk.ts`, and the English in the doc matches `en.ts` word for word. This answers task 2 → Open question 1.
- Still English-only: the three VoiceOver labels of the header theme toggle (`a11yThemeToDark`, `a11yThemeToLight`, `a11yThemeHint`), which go away with the toggle in task 5.
- Cowork also added `## Category chips` (Ukrainian chip forms for all 15 tags; Home keeps all 15). Applied in task 5, as decided (task 2 → Open question 2).
- Files: `design_handoff_mocktail_1.2/COPY_EN_UK.md` (Cowork's sections), `src/i18n/en.ts` (comments), `src/i18n/uk.ts`, `src/i18n/__tests__/i18n.test.ts`, `TESTING.md`.
- Verified: `npx tsc --noEmit` clean; `npm test` 62/62 (the "every key in Ukrainian" test now allows only the three toggle labels).

## 2026-10-07 · 1.2 task 3 — A. data: collections, ingredient keys, photos, amounts (Claude Code)
- **Collections**: `src/data/packs/<packId>.json` ×6, copied verbatim from `recipes.json` (byte-compared), both languages, ice lines as in the JSON. `src/data/packs/index.ts`: `PACKS`, `packToRecipe`, `findPackRecipe`, `ALL_PACK_RECIPES` (60). A collection drink is an ordinary `Recipe` with id `pack:<packId>:<recipeId>`, so favourites and share already work with it. `Recipe` gained three optional fields: `steps` (86 collection steps hold more than one sentence, so splitting `instructions` would break them), `packId`, `description`.
- **Photos**: 60 files in `assets/packs/<packId>/` (700 px as delivered, 2.2 MB); `src/data/packPhotos.ts` (`packPhoto(id)`, `packCover(packId)`); `recipeImageSource` checks them after the catalogue photos.
- **Store**: new `catalogue` slice (the 58 API drinks + `loadCatalogue()` thunk with the details fill-in; Home and Surprise used to fetch on their own), `packs` slice (all 60, from the first frame), `entitlements` slice (owned product ids; empty until task 4 fills it from StoreKit). `src/store/selectors.ts`: `selectVisibleDrinks` = own (newest first) + catalogue + unlocked collections, `selectIsPro`, `selectUnlockedPacks`. Home and Surprise now read `selectVisibleDrinks`. Surprise also no longer spins forever when the list fails to load.
- **Purchases groundwork** (needed by the selector): `src/purchases/products.ts` (the ids from TASKS.md) and `entitlements.ts` → `deriveEntitlements(owned)`: isPro = pro || everything; a collection is open with Everything or its own product; tips unlock nothing.
- **Ingredient keys**: `src/utils/ingredientKeys.ts` — `keyOf` (the prototype's rules, same order), `drinkKeys`, `ALWAYS_AVAILABLE` (ice, water, sugar, salt). `src/data/ingredients.ts` is **generated** once (script not committed): the 9 My Bar groups and `DRINK_KEYS` for all 118 drinks (91 keys in use, each one in a group and named in both languages).
- **Amounts**: `src/utils/measures.ts` — `scaleAmount(text, servings, lang)` (integers, decimals, ½ ¼ ¾ ⅓ ⅔ ⅛, "1 1/2", ranges, both parts of "a + b"; unit words agree, Ukrainian 1 / 2–4 / 5+ and the fraction form; decimal comma in Ukrainian), `formatQuantity`, `formatIngredientLine` (the three formats). Not scaled: percentages, °, cm/inch, "12:00", and times ("20 s", "12 с", "5 min", "хв"). The README asks for times; the prototype's own code does not skip them, so this one rule is added on top. Unit forms are the prototype's lists, kept in `measures.ts`; the plural rule is the i18n one.
- **Tags**: collection drinks use two tags 1.1 did not have, Bitter and Herbal (3 drinks). Added to `DrinkTag` and both dictionaries («Гіркий», «Трав'яний», from mf-data.js). They are not Category filters and not choices in Add Recipe.
- Share text: headings now come from the dictionary, so English reads "Preparation Steps:" where 1.1 said "Instructions:". Written steps are kept whole.
- Jest config: `transformIgnorePatterns` for Redux/immer/i18n-js and `jest.setup.js` with AsyncStorage's own mock.
- Tests (61, all green): `measures.test.ts` (README examples, plus **parity with the prototype's `scale()` on every amount in recipes.json × 1, 2, 3, 12 servings, both languages**), `ingredientKeys.test.ts` (parity with the prototype's `keyOf` on every ingredient name, the generated table still matches, every key grouped and named), `entitlements.test.ts`, `selectors.test.ts` (**Everything on → 58 + 60 = 118 drinks**; one collection → +10; locking again → back), `recipeText.test.ts`, collection drinks in `localizeRecipe.test.ts`.
- Verified: `npx tsc --noEmit` clean; `npm test` 61/61; `npx expo export --platform ios` bundles all 60 `assets/packs` photos. In Expo Go: Home and Surprise load from the store (Surprise from a cold start too); a collection drink opened through a temporary start screen (restored before the commit) shows its bundled photo, the Ukrainian text on SE and the English on Pro Max, and the ice line "Ice — 100 g for shaking + 80 g for serving". The DEV "Everything" switch arrives with task 4; until then the 118 is proven by the selector test.

## 2026-10-07 · 1.2 task 2 — localisation foundation, English + Ukrainian (Claude Code)
- Dependencies (pre-approved): `expo-localization` ~17.0.9 (+ its config plugin), `i18n-js` ^4.5.4; dev: `jest` ~29.7, `jest-expo` ~54.0, `@types/jest`. `npm test` runs Jest. Decision without asking: Jest came in now rather than task 3, so plurals and language choice have tests from the start.
- `src/i18n/en.ts`, `uk.ts` are **generated** from `COPY_EN_UK.md` (all 192 keys, plural forms en one/other, uk one/few/many). Tag names (card form + Category-chip form) and the ingredient-key names come from `reference/mf-data.js`, the handoff's own dictionaries. The generator was a one-off script and is not committed. If the copy doc changes, edit the `.ts` files the same way.
- `src/i18n/index.ts`: `translate`, `pluralize`, `pluralCategory`, `resolveLanguage` (System = Ukrainian only when the iPhone language is Ukrainian). `src/context/LanguageContext.tsx`: `useLanguage()` → `{ lang, setting, setSetting, t, plural }`. The setting lives in AsyncStorage `@mocktail-finder/language` (`STORAGE_KEYS.language`) and is read during the splash with the theme. The switch itself arrives with About in task 8.
- Catalogue in Ukrainian: `src/i18n/localizeRecipe.ts` lays `src/data/uk/drinks.json` over a drink **at render**, field by field (name, ingredient lines, instructions); any missing id or field stays English. Stored data (favourites, details cache) stays English, so switching language needs no migration, and filters keep matching the English text. Tag subtitles and badges are translated too. Search matches the shown language and English. Checked: all 58 ids present, and the ingredient count and order match the catalogue in `recipes.json`.
- Every 1.1 screen goes through `t()`: tabs, header, search, Category / ingredient chips, Featured, Surprise, recipe details, Favourites, Add / Edit Recipe, photo action sheet, camera alert, delete alert, share text (now in the language on screen).
- `app.json`: `ios.infoPlist.CFBundleLocalizations = ["en", "uk"]`, `CFBundleDevelopmentRegion = "en"`.
- **Behaviour taken from the handoff** (it wins over 1.1):
  - Add Recipe needs a name, an ingredient and a step, with one toast "Add a name, an ingredient and a step." (was: two "Error" alerts, steps optional).
  - Saving shows the toast "Recipe saved" (was an alert with OK). Deleting shows "Recipe deleted", and the alert text is "Delete this recipe?" / "It will be removed from My Recipes and Favourites."
  - Favourites, empty: heart icon + one line `favEmpty` (the 1.1 title and "Discover Recipes" button are gone; the prototype has neither).
  - The favourite button reads "Saved to Favourites" when on (was "Remove from Favourites"). A tap still removes it.
  - "No recipes match these filters." → `noMatch`.
- Numbers: nothing to convert yet. 1.1 shows amounts as given (API English or Cowork's Ukrainian, already metric with a comma); the decimal comma for scaled amounts comes with `scaleAmount` in task 3. Prices stay StoreKit's.
- Tests: `src/i18n/__tests__/i18n.test.ts` (language choice, plural categories incl. 11–14 and fractions, `{n}` filling, fallback, every handoff key present in Ukrainian), `localizeRecipe.test.ts` (Afterglow in uk, per-field fallback, user recipes untouched, search). 19 tests green.
- Verified: `npx tsc --noEmit` clean; `npm test` 19/19; `npx expo export --platform ios` bundles. In Expo Go, iPhone SE set to Ukrainian (system language, setting `system`) vs iPhone 17 Pro Max in English: Home, Recipe (Afterglow → «Афтерглоу», «1 частина Гренадин»), Surprise, Favourites (empty), Add Recipe are Ukrainian, and nothing is clipped at SE width. To reach the screens without a tap, the navigators' start screen was changed temporarily and restored before the commit. Not checked on screen: "restart keeps it" for an explicit choice (no switch until task 8), and the alerts/toasts (they need a tap).
- Note for later: on SE, five Ukrainian tag badges take three rows in the recipe's sticky header. Task 6 rebuilds that card.
- The iPhone SE simulator is left in Ukrainian (system language) for the next tasks.

### Open questions (task 2)
1. **1.1 strings with no entry in `COPY_EN_UK.md`**: they show in English in both languages until Cowork adds the Ukrainian (keys in `src/i18n/en.ts`, block "1.1 strings…"): `loadError` "Couldn't load recipes. Check your internet connection and try again." · `recipeLoadError` "Couldn't load this recipe. Check your connection and try again." · `loadingRecipes` "Loading recipes…" · `loadingRecipe` "Loading recipe…" · `loadingDetails` "Loading drink details…" · `noRecipes` "No recipes found." · `tryAgain` "Try again" · `back` "Back" · `browseMore` "Browse more" · `randomPick` "Random pick" · `noIngredients` "No ingredients listed." · `noSteps` "No steps written for this recipe." · `changePhoto` "Change photo" · `removePhoto` "Remove" · `saving` "Saving…" · `saveChanges` "Save Changes" · `photoLibraryError` "Couldn't open your photos" · `cameraError` "Couldn't open the camera" · `pleaseTryAgain` "Please try again." · `photoSaveErrorTitle` "Couldn't save the photo" · `photoSaveErrorText` "The recipe was not saved. Please try again." · `cameraOffTitle` "Camera access is off" · `cameraOffText` "To take a photo for your recipe, turn on Camera for Mocktail Finder in Settings." · `openSettings` "Open Settings" · `shareIntro` "{name} — a non-alcoholic recipe from Mocktail Finder" · `shareGet` "Get Mocktail Finder: {url}" · VoiceOver: `a11yBack` "Go back", `a11yShuffle` "Another random recipe", and the three theme-toggle labels (these go away with the toggle in task 5).
2. The Category chips of 1.1 have 15 tags. The handoff gives a separate Ukrainian chip form ("Цитрусові") only for Iced, Frozen, Hot, Citrus, Tropical, Berry and Savoury; the others use the card form ("Фруктовий"). The prototype's Home shows only six categories. Task 5 settles which chips Home keeps.
3. `src/components/TabBar.tsx` is unused (1.0 leftover, not imported anywhere). Delete it? Not deleted without Vlad's ok.

## 2026-10-07 · Expo packages updated to the SDK 54 versions (Claude Code)
- `npx expo install --fix`, okayed by Vlad: `expo` ~54.0.33 → ~54.0.37, `expo-constants` ~18.0.13 → ~18.0.14, `expo-file-system` ~19.0.22 → ~19.0.24, `expo-font` ~14.0.11 → ~14.0.12. Patch updates inside SDK 54, no new dependency.
- Expo added `"expo-font"` (no options) to `plugins` in `app.json`. Kept: the Sora fonts are still loaded at runtime with `useFonts`, so nothing changes in behaviour.
- `npm audit` reports advisories in transitive dev/build packages. Not touched: `npm audit fix --force` would move packages off the SDK 54 versions.
- Files: `package.json`, `package-lock.json`, `app.json`.
- Verified: `npx expo install --check` reports up to date; `npx tsc --noEmit` clean; `npx expo export --platform ios` bundles.

## 2026-10-07 · 1.2 task 1 — tokens and shared primitives (Claude Code)
- **Tokens** (README → Design tokens), no screen changed yet:
  - `src/theme/colors.ts`: light + dark for the 1.1 tokens the app had not named (`border`, `textMuted`, `brand`, `onBrand`, `scrim`, `headerGradient`, `headerSubtitle`, `mint50`, `mint500`) and the 1.2 ones (`tipPanel`, `toastBg`, `toastText`, `floatButton`, `tabbarBg`, `sheetBg`, `coachDim`, `coachRing`). Also `onGradient` (white on the gradient/error), `onGradientFill` (the translucent "…" button) and `shadow`, so no hex is left for screens to type. The old 1.1 names stay until each screen is rebuilt (tasks 5–8).
  - `typography.ts`: `type.titleL/M/S, body, bodyS, label, caption, button, pill, wordmark, cardTitle`.
  - `spacing.ts`: scale now 4·8·12·16·20·24·32·48 (`sm` 12 and `ml` 20 added, `screen` 24), `radius`, `sizes` (control sizes, icon sizes, stroke weights), `opacity`, `shadows`.
  - New `motion.ts`: durations (push 340, sheet 360, paywall 400, scrim 300, toast 200 + 2000, pulse 1600, logo 3400, tip wave 6000, DEV long-press 800, price skeleton 600), `easing` = bezier(.2,.8,.2,1), `useReduceMotion()`.
- **Components** (`src/components/`): `Toast` (+ `ToastProvider`, `useToast()`, `ToastOutlet`), `BottomSheet`, `OptionSheet`, `SegmentedControl`, `Stepper` (enabled / locked), `CheckRow` (default / ticked / swiping), `Chip` (+ removable), `LockedCard`, `FeatureRow` (+ highlighted), `SectionTitle` (+ pill, link, detail). Also, okayed by Vlad: `Button` (filled / outline / text, disabled, busy, compact) and `Pill` ("New" / "Pro"). Icons: `LockIcon`, `CheckIcon`, `PlusIcon`, `MinusIcon`.
- `App.tsx`: `ToastProvider` inside the theme, root `ToastOutlet` above navigation.
- Decisions without asking:
  - Sheets use the native `Modal`, so VoiceOver cannot reach the screen behind them and they cover the tab bar. A toast fired from a sheet (Restore on the collection sheet) would sit under the modal, so each open sheet mounts its own `ToastOutlet` and the toast draws in the topmost one.
  - Swipe to delete uses gesture-handler's `Swipeable` (plain `Animated`), so no `react-native-reanimated`.
  - With Reduce Motion, sheets and toasts fade instead of sliding. None of this task's components loop.
  - VoiceOver: the sheet grabber is a "Close" button; `CheckRow` offers "Delete" as a VoiceOver action because VoiceOver cannot swipe.
- **Copy added outside the handoff:** Cowork added a `## Accessibility` section to `design_handoff_mocktail_1.2/COPY_EN_UK.md` (7 Oct): `a11yRemove` "Remove {name}" / «Прибрати {name}», `a11yFewer` "Fewer servings" / «Менше порцій», `a11yMore` "More servings" / «Більше порцій», `a11yClose` "Close" / «Закрити», `a11yDelete` "Delete" / «Видалити». The components take them as props; they enter the dictionaries in task 2.
- Verified: `npx tsc --noEmit` clean. A throwaway `DevPrimitivesScreen` was run in Expo Go on iPhone SE (3rd gen) and iPhone 17 Pro Max, light and dark: chips, segmented control, steppers (enabled / locked), check rows, buttons (incl. disabled and busy), feature rows, locked card, toast and the Theme option sheet all render as in the prototype. Screenshots are in `~/Desktop/dev-primitives/`, and Vlad reviewed them. The screen was deleted before this commit. Not seen on screen: the swiping state of `CheckRow` and the sheet's drag-to-close (both need a finger).
- Simulator setup, so the next sessions can screenshot without a tap: on both simulators the `exp://` scheme is pre-approved for Expo Go (`com.apple.launchservices.schemeapproval.plist`), and Expo Go's first-run menu is marked as seen (`EXHomeIsNuxFinishedDefaultsKey`).

## 2026-10-07 · 1.2 task 0 — branch, version, spec in the repo (Claude Code)
- Branch `release/1.2` created from `main` at `54056b7` (1.1.0 build 5, tag `v1.1.0`); `main` and `release/1.1` untouched.
- `app.json`: `expo.version` → `1.2.0`. Build number not touched (EAS, `appVersionSource: remote`).
- `CLAUDE.md`: push rule now names `release/1.2`; "Current status" says 1.2 is in progress on `release/1.2` (Cowork's other edits to the file kept as they were).
- Committed the spec `design_handoff_mocktail_1.2/` (126 files, 13 MB; the prototype HTML alone is 7 MB), `TASKS.md`, `TESTING.md` (Cowork's skeleton) and `src/data/uk/drinks.json`.
- Decision without asking: `src/data/uk/drinks.json` goes in this commit rather than task 2 — task 2 already treats it as "in the repo", and it is data, not code.
- Verified: `src/data/uk/drinks.json` parses, 58 ids; `recipes.json` parses, 58 catalogue drinks + 6 packs; handoff scanned for keys/secrets — none; `npx tsc --noEmit` clean.

## 2026-09-24 · 1.1 is live (Claude Code)
- **1.1.0 (build 5) released on the App Store on 24 September 2026:** https://apps.apple.com/app/id6811610325
- Task 7 in `TASKS.md` ticked — the whole 1.1 queue (tasks 0–7) is now closed. What shipped: delete and edit your own recipes, camera for recipe photos, 58 bundled drink photos, a remembered theme (system/light/dark), UK spelling, opaque sticky headers and the photo scrim.
- `release/1.1` merged into `main` and tagged `v1.1.0`; `main` again holds exactly what is on the App Store.
- Next work starts from a fresh branch off `main`. `release/1.1` can stay as a record of this cycle.

## 2026-09-23 · 1.0 is live; App Store link wired into 1.1 (Claude Code)
- **1.0.0 (build 4) was approved on 22 September and is on the App Store:** https://apps.apple.com/app/id6811610325
- GitHub Release published from the existing tag, no new tag created: https://github.com/Vladyslav-XD/mocktail-finder/releases/tag/v1.0.0-build4
- `APP_STORE_URL` in `src/utils/recipeText.ts` filled in, so every shared recipe now ends with "Get Mocktail Finder: https://apps.apple.com/app/id6811610325". Until today the share text simply left that line out.
- `app.json`: `expo.version` → `1.1.0`. `ios.buildNumber` confirmed absent (removed in task 5) — EAS assigns the build number remotely.
- `README.md`: App Store link added under the case-study link.
- Repository is now `Vladyslav-XD/mocktail-finder` on GitHub. The local `origin` still pointed at the old `filon_cross_final_project` URL (it worked only because GitHub redirects); repointed to the new URL.
- Branches: `main` = released state (`2f32cfb`, tag `v1.0.0-build4`), `release/1.1` = this work, `archive/course-2026` = the old course history.
- Verified: `npx tsc --noEmit` clean; share text checked by running the same `buildShareMessage` logic in Node.
- **Task 7 stays open on purpose** — the production build, TestFlight on a real iPhone (camera!) and the submission are a separate step, and the 1.1 tap-through checks from tasks 1–6 are still unverified by hand.

## 2026-09-18 · task 6 — bundled drink photos wired in (Claude Code)
- New `src/utils/recipeImage.ts` with one function, `recipeImageSource(id, imageUrl)`: the bundled photo when `drinkPhoto(id)` has one, otherwise `{ uri: resolveImageUri(imageUrl) }`. Putting the choice in one place keeps the four call sites identical and leaves user photos untouched (their ids are timestamps, never TheCocktailDB ids).
- Used in `RecipeCard` call sites (`MocktailFinderScreen`, `FavouritesScreen`) and directly on `RecipeDetailsScreen` and `RandomScreen`. `RecipeCard` already accepted a ready image source, so the component itself did not change; `resizeMode="cover"` everywhere as before.
- Share text left alone on purpose: it shares `recipe.imageUrl`, still the TheCocktailDB web address. A bundled file has no URL a recipient could open.
- `assets/drinks/` (58 files, 3.1 MB) committed here. `src/data/drinkPhotos.ts` slipped into the task 2 commit by accident — harmless, nothing imported it until now.
- Verified: `npx tsc --noEmit` clean; `npx expo export --platform ios` bundles all 58 `assets/drinks` images (counted in the export output). How they look on screen, and list scrolling, still want a human pass.

## 2026-09-18 · task 5 — small fixes (Claude Code)
- (a) "Add to Favourites" / "Remove from Favourites" — UK spelling, on both `RecipeDetailsScreen` and `RandomScreen` (the Random screen had the same two strings; the task only named the details screen).
- (b) `ios.buildNumber` removed from `app.json`; EAS owns the build number (`appVersionSource: remote`).
- (c) Sticky header: the header was transparent, so the scrolling list showed through the 12px gutters either side of the title card. Fix is one line — the header container now paints `colors.background` and pads `spacing.s` at the bottom, so content disappears under it cleanly and the card keeps its shadow. Same fix on `RandomScreen`, which has the identical header.
- (d) New `src/components/PhotoScrim.tsx`: a short dark fade over the top of the hero photo on both screens, so the light status bar survives a pale drink photo. Chosen over switching the bar style by image brightness — that needs to decode every image and still flickers.
- Files: `app.json`, `src/screens/RecipeDetailsScreen.tsx`, `src/screens/RandomScreen.tsx`, `src/components/PhotoScrim.tsx`.
- Verified: `npx tsc --noEmit` clean, `npx expo export --platform ios` builds, app runs. (c) and (d) are visual and were not seen on screen — this session cannot open a recipe in the simulator; worth a glance when you next tap through.

## 2026-09-18 · task 4 — remember the theme (Claude Code)
- `ThemeContext` now holds three modes: `system | light | dark`. `theme` (what is drawn) stays what every screen reads, so no screen changed — only `Header` knows about modes. Saved under `STORAGE_KEYS.theme` (`@mocktail-finder/theme`).
- `loadThemeMode()` is awaited in `App.tsx` inside the same `Promise.all` as the store and the details cache, and passed to `ThemeProvider` as `initialMode` — the app opens in the saved theme with no flash.
- **Way back to "system":** press and hold the header toggle. A tap switches light ↔ dark explicitly (that is what a tap always did); a long press hands control back to iOS. While the app is following the system, a small white dot sits on the toggle — without it "system" and "light" would look identical. A third tap state was the alternative, but it makes the everyday light ↔ dark tap a three-way cycle, which is worse for the common case.
- Files: `src/context/ThemeContext.tsx`, `src/components/Header.tsx`, `src/storage/storage.ts`, `App.tsx`.
- Verified: `npx tsc --noEmit` clean, `npx expo export --platform ios` builds, app runs in the simulator and the system dot shows on the toggle. Persistence across a restart still wants one human check.

## 2026-09-18 · task 3 — camera for recipe photos (Claude Code)
- `app.json`: `cameraPermission` text set on the `expo-image-picker` plugin ("Mocktail Finder uses the camera only to take a picture for a recipe you create. Photos stay on your device."); `photosPermission` unchanged, `microphonePermission` still false. This string is what iOS shows in the permission dialog, so it ships with the next build — a JS reload will not pick it up.
- `takeRecipePhoto()` in `src/utils/recipePhotos.ts`: `requestCameraPermissionsAsync()` then `launchCameraAsync({ quality: 0.7, exif: false })`. On refusal it explains and offers "Open Settings" (`Linking.openSettings()`) — after the first refusal iOS never asks again, so Settings is the only way back.
- Add Photo / Change photo now open an `ActionSheetIOS` sheet: Take Photo / Choose from Library / Cancel. Android keeps the library path (no sheet).
- Files: `app.json`, `src/utils/recipePhotos.ts`, `src/screens/AddRecipeScreen.tsx`.
- Verified: `npx tsc --noEmit` clean, `npx expo export --platform ios` builds.
- **Needs a real iPhone via TestFlight:** the simulator has no camera, so "Take Photo", the permission dialog and its wording can only be checked there. The Privacy Policy page on vladfilon.com still needs one sentence about the camera (Cowork's side); App Privacy stays "Data Not Collected".

## 2026-09-18 · task 2 — edit own recipe (Claude Code)
- "Edit" sits next to "Delete" in one row on the details screen (both outlined, Delete in `colors.error`). Added `PencilIcon`.
- **Where Edit lives.** `AddRecipeScreen` is registered a second time, in `StackNavigator` as `EditRecipe`, and pushed on top of the recipe with a `recipe` param. Going through the Add Recipe *tab* instead would have left the param stuck on that tab — tap "Add Recipe" later and you would still be editing the old recipe. A pushed screen is a fresh instance every time, so the form simply initialises from the param and Back returns to the recipe.
- `Header` gained an optional `onBack` (back arrow replacing the martini mark); only the Edit screen passes it. Save button reads "Save Changes", title "Edit Recipe".
- `updateRecipe` added to `myRecipesSlice` (replaces in place, keeps id and list position). `RecipeDetailsScreen` now reads the recipe from the store when it is a user recipe and falls back to the route param — that is what makes an edit visible immediately.
- Favourites: `FavoritesContext.updateFavorite` refreshes a favourited copy after an edit; without it Favourites kept the old name and photo. Not in the task, but the stale copy was visible in the UI.
- Photo on edit: the form starts with the recipe's own photo (the stock fallback is not treated as one). Keep it → nothing happens; replace it → `persistRecipePhoto` writes over the same `<id>.jpg` (it now deletes the destination first, because a copy onto an existing file fails on iOS); remove it → file deleted, recipe falls back to the stock image.
- Ingredients round-trip: a saved line ("50 ml lime juice") goes back into the *name* field with the amount left empty — splitting it into amount + name again would only guess wrong and mangle what the user typed.
- Files: `src/screens/AddRecipeScreen.tsx`, `src/screens/RecipeDetailsScreen.tsx`, `src/navigation/StackNavigator.tsx`, `src/constants/screens.ts`, `src/store/myRecipesSlice.ts`, `src/context/FavoritesContext.tsx`, `src/components/Header.tsx`, `src/components/icons/index.tsx`, `src/utils/recipePhotos.ts`.
- Verified: `npx tsc --noEmit` clean, `npx expo export --platform ios` builds, app reloads in the simulator with no error screen. The tap-through (edit → save → values persist after restart) still needs a human, same reason as task 1.

## 2026-09-18 · task 1 — delete own recipe (Claude Code)
- `RecipeDetailsScreen`: "Delete Recipe" below "Share Recipe", shown only when the id is in the `myRecipes` store (`useSelector`), so TheCocktailDB drinks never get it. Outlined in `colors.error`, not filled — destructive but not the loudest button on the screen. Confirmation via `Alert.alert` ("Delete this recipe?" / Cancel / Delete, destructive style). On confirm, in this order: `deleteRecipePhoto(recipe.imageUrl)` → remove from favourites if saved → `dispatch(removeRecipe(id))` → `navigation.goBack()`. Photo first: once the recipe leaves the store nothing points at the file any more.
- Added `TrashIcon` to `src/components/icons/index.tsx` (the set had none). Light `colors.error` changed `#ff0000` → `#DC2626`: the token was unused anywhere, and pure red on white is harsh.
- `styles.shareBtn` bottom margin `xxl` → `m` so Share and Delete sit as one pair; the scroll view already pads 100 at the bottom.
- Files: `src/screens/RecipeDetailsScreen.tsx`, `src/components/icons/index.tsx`, `src/theme/colors.ts`.
- Verified: `npx tsc --noEmit` clean, `npx expo export --platform ios` builds the bundle, app launches in the iPhone 17 simulator with the new code (home list and navigation fine).
- **Not yet verified by hand:** the tap-through (create a recipe with a photo → delete → photo file gone, list updates). This session cannot tap in the simulator — macOS assistive access is not granted to the terminal — so Vlad or Cowork should run that once.

## 2026-09-18 · task 0 — tag the reviewed state (Claude Code)
- Annotated tag `v1.0.0-build4` created on `2f32cfb` ("Character tags, real filters, recipe photos") — the commit Apple is reviewing as 1.0.0 build 4. Tag is local only; not pushed (needs Vlad's ok, and the GitHub remote still has old history).
- Branch `release/1.1` created from `2f32cfb` and checked out; `master` is left untouched at the reviewed state. All 1.1 work goes on `release/1.1`.
- Files: `TASKS.md`, `STATUS.md` (this entry), plus `CLAUDE.md` committed for the first time — all three were untracked until now.
- Still untracked on purpose: `assets/drinks/` and `src/data/drinkPhotos.ts` (they go in with task 6, as the queue asks), and the `Claude outputs/` folder (working screenshots/notes — Vlad decides whether it belongs in the repo).
- Verified: `git tag -l` shows the tag, `git show v1.0.0-build4` points at `2f32cfb`, `git branch --show-current` = `release/1.1`.

## 2026-09-17 · drink photos ready (Cowork)
- Vlad generated 58 photos (2048×2048 JPEG, consistent studio style) in `~/Desktop/Mocktail Finder 1.1/photos/`. Cowork resized them to 900×900 JPEG q82 → `assets/drinks/<id>.jpg` (58 files, 2.9 MB total) and generated `src/data/drinkPhotos.ts` (`drinkPhoto(id)`). Verified: every one of the 58 TheCocktailDB ids has a file, no extras, `npx tsc --noEmit` clean. Task 6 in TASKS.md is unblocked — wiring the map into the screens is Claude Code's part.

## 2026-09-17 · setup (Cowork)
- 1.0 (1.0.0 build 4) is in App Review; reply to Apple's "Information Needed" sent 16 Sept, waiting. No 1.1 code written yet.
- Added `CLAUDE.md`, `TASKS.md`, `STATUS.md`. Claude Code takes the queue in `TASKS.md`; Cowork handles App Store Connect, texts, screenshots and drink photos.
