# STATUS — log of work done (newest first)

Append one entry per finished task: date · task · what changed · files · how verified.

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
