# Little Alchemy 2 Companion

A mobile companion app for [Little Alchemy 2](https://littlealchemy2.com) — browse all 720+ elements, look up recipes, and see what each element is used in.

Built with React Native and Expo.

## Features

- **Browse all elements** — searchable list of every element in the game
- **Recipe lookup** — see every combination that creates a given element
- **"Used in" view** — see which recipes use a given element as an ingredient
- **Tier badges** — elements are organized by crafting tier (starter, T1–T5+, special)
- **Element icons** — icons sourced from the Little Alchemy wiki
- **Dark theme** — designed for comfortable use alongside the game

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Install

```bash
npm install
```

### Run

```bash
npx expo start
```

Then open the app on your device with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

## Project Structure

```
app/
  _layout.tsx          # Root layout (status bar config)
  index.tsx            # Main browse screen
components/
  ElementCard.tsx      # List item for an element
  ElementDetailModal.tsx  # Full detail view with recipes & usage
  SearchBar.tsx        # Search input component
constants/
  colors.ts            # Theme colors and tier color mapping
  elements.ts          # Auto-generated element data (720+ elements)
  icons/               # Downloaded SVG icons for each element
hooks/
  useElementSearch.ts  # Search/filter logic with tier grouping
scripts/
  scrape-elements.ts   # Scrapes element data & icons from the wiki
```

## Updating Element Data

Element data is scraped from the [Little Alchemy 2 Wiki](https://little-alchemy.fandom.com/wiki/Elements_(Little_Alchemy_2)). To refresh it:

```bash
npm run scrape
```

This will re-scrape all elements, download any new icons, and regenerate `constants/elements.ts`.

## Tech Stack

- [React Native](https://reactnative.dev/) 0.81
- [Expo](https://expo.dev/) SDK 54
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing
- TypeScript

## License

This project is for personal/educational use. Little Alchemy 2 is a trademark of Recloak.
