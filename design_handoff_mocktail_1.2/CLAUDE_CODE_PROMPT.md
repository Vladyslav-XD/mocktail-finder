# Mocktail Finder 1.2 "Pro" — build round

Read first: the repo's `CLAUDE.md`, `PROGRESS.md` and `TESTING.md`, then `design_handoff_mocktail_1.2/README.md`. The handoff is the spec for this round. Where it differs from Figma, the handoff wins (README → "Prototype wins over Figma"); Figma is being updated in parallel.

Source of the round: the Claude Design prototype and spec (`design_handoff_mocktail_1.2/`), Figma page `mocktail-finder` (node 375-770).

## Rules
- Tokens and base components first, in their own commit, before any screen work. No colour, size or motion literal in UI code.
- Every string comes from `COPY_EN_UK.md`, in English and Ukrainian, with the plural forms given. Never invent copy; missing copy goes to `PROGRESS.md` → Open questions.
- One commit per group below. A test for every piece of logic (amount scaling, My Bar matching, entitlements, plurals, hint conditions). Lint and tests clean before each commit.
- Update `PROGRESS.md` (status, differences from the design and why, decisions made without asking), `TESTING.md` (Ukrainian; a checklist item with an expected result for every behaviour change) and the component catalog in the same commits.
- System UI stays native: StoreKit purchase sheet, share sheet, photo action sheet, alerts.
- Accessibility: Reduce Motion (no loops), Dynamic Type, VoiceOver labels; closed sheets and screens are not reachable by VoiceOver; smallest supported iPhone; light and dark; Ukrainian strings are about 20 % longer and must not clip.
- Ask before adding a dependency. No software of Russian origin.

## New tokens (values in README → Design tokens)
tip-panel · toast-bg / toast-text · float-button · tabbar-bg · sheet-bg · coach-dim · coach-ring · motion: push 340 ms, sheet 360 ms, paywall 400 ms, easing cubic-bezier(.2,.8,.2,1), scrim 300 ms, toast 2 s, pulse 1.6 s.

## New components (with their variants)
Pack card (locked with price / locked, store unreachable / unlocked) · Locked card · Segmented control · Stepper (enabled / locked) · Check row (default / ticked / swiping) · Removable chip · Ingredient group (collapsed / open / with ticks) · Bar summary card (empty / with items) · Feature row · Tip card (idle / purchasing / thanked / unavailable) · About row (with value / link) · Option sheet (Language, Theme) · Coach bubble (tour / hint; caret up or down; pill; counter) · Highlight ring (tour / hint) · Toast.

## Groups
**A. Data.** Import `data/recipes.json` (58 catalogue drinks + 6 collections × 10, English and Ukrainian, photos from `photos/`). Ingredient keys and the always-available set (ice, water, sugar, salt) as in `reference/mf-data.js`. Ice lines exactly as in the JSON.

**B. Purchases (StoreKit 2).** Products and entitlements from README → Logic reference. Prices only from `displayPrice`. States: loading, store unreachable, purchasing, success, cancelled (silent), restore; tips are consumable. Pending and failed: placeholder handling until Vlad answers Open question 1.

**C. Home and header.** Order: Search → Collections → Category → Filter by Ingredients → Featured Recipes. Collections row with pack cards and the Everything link; it hides while a search or filter is active. Category and ingredient chips each in one horizontally scrolling row. Collection list view; unlocked drinks in search and filters. Header: remove the theme toggle, keep "…" → About; logo on the wordmark baseline with the bubble loop.

**D. Recipe.** Servings 1–12 with the exact scaling rules; the three ingredient-line formats; Add to shopping list; Share as card (1080 × 1350 PNG, Sora title) → share sheet; Free locked states → paywall.

**E. My Bar.** Rename the tab to My Bar (glass icon). Free locked cards for both segments. Your bar card + Add ingredients sheet; matching ("can make" / "missing one"). Shopping list: merge amounts, tick, swipe to delete, clear ticked, share as text, empty state. Persist the ticks and the list.

**F. Paywall, collection sheet, About.** Every paywall state; the collection sheet; About rows including the Language and Theme option sheets, the tip jar, the version line, DEV switches in debug builds only.

**G. Tour and hints.** Sequences, conditions, pills and persistence from README → Tour and hints; new install vs update detection; a debug reset.

**H. Ship.** Bump the build number (never reuse one). STOP before upload and send screenshots — smallest and largest iPhone, light and dark, English and Ukrainian — of Home, Recipe (Free and Pro), My Bar (Free and Pro), Shopping list, Paywall, Collection sheet, About and two tour steps, plus a short report. Don't touch App Store Connect.
