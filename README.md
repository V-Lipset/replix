<div align="center">

<h1 align="center">Replix</h1>

An advanced cross-platform batch text replacement tool with EPUB ebook support.

</div>

## Features

- **Dual-mode rule editing**: Supports structured form mode and plain-text bulk mode (syntax: `source=replacement` / `source:replacement`)
- **Smart rule expansion**: Automatically expands compound rules into sub-rule combinations, supporting both Chinese and English delimiters (space / `·`), improving match coverage
- **Trie engine**: High-performance streaming text replacement based on a Trie, with longest-match-first strategy
- **Web Worker parallel processing**: File processing runs in a separate thread, keeping the UI completely responsive
- **EPUB ebook support**: Full support for importing EPUB books, replacing content in HTML, and exporting the result
- **Batch file processing**: Import multiple files at once for batch processing. Supported formats: `.txt` `.md` `.csv` `.json` `.epub`
- **Split-screen preview**: Side-by-side comparison of the original file and the processed result, with expand/collapse support
- **Case-sensitive toggle**: Switch matching mode with one click
- **UTF-8 BOM export**: Exported text files automatically include a BOM, ensuring Excel correctly recognizes Chinese encoding
- **Bilingual UI**: Supports Chinese / English switching
- **Responsive layout**: Side-by-side panels on desktop, tab switching on mobile

## Technical Architecture

```
src/
├── engine/
│   ├── RuleParser.ts        # Rule parser (structured/textbox interchange, compound rule expansion)
│   ├── TrieEngine.ts        # Trie-based replacement engine (longest-match-first)
│   ├── worker.ts            # Web Worker entry (asynchronous file processing)
│   ├── FilePreprocessor.ts  # File preprocessor (encoding conversion, newline normalization)
│   └── EpubProcessor.ts     # EPUB processor (parse / modify / repackage)
├── components/
│   ├── RuleEditor.tsx       # Rule editing panel (structured + plain-text dual mode)
│   └── PreviewPane.tsx      # File preview panel (side-by-side display)
├── App.tsx                  # Main application layout and logic
├── translations.ts          # Internationalization (i18n) file
└── main.tsx                 # Application entry point
```

**Tech Stack**: React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · Lucide Icons · JSZip · Web Workers

## Getting Started

### Live Demo

Visit the [AI Studio Demo](https://ai.studio/apps/7b762977-72cd-4927-9da0-0b839fc7cc05) to use it online.

### Run Locally

**Prerequisites:** Node.js 18+

1. Clone the project and install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open `http://localhost:3000`

### Build & Deploy

```bash
npm run build     # Build to dist/
npm run preview   # Preview the production build
```

## Usage Guide

### 1. Add Replacement Rules

**Structured mode**: Fill in source text and replacement text one by one.

**Plain-text mode**: Enter rules in bulk using `=` or `:` as delimiters:
```
Hello = Bonjour
Good Morning · Madam = Bonjour Madame
```

Compound rules (using `·` or spaces as separators) will be intelligently expanded, automatically generating forward, reverse, and segmented sub-rule combinations to significantly improve match coverage.

### 2. Import Files

Click the **Import** button and select the text files or EPUB ebooks you want to process. You can import multiple files at once.

### 3. Run Replacement

Click the **Run** button. The system will process all files in parallel inside a Web Worker. A toast notification will appear in the bottom-right corner when processing is complete.

### 4. Preview & Export

The processed results are displayed in the preview panel on the right, with the original file and the result shown side by side. Once you confirm everything is correct, click **Export** to download the processed files. EPUB files will retain their original HTML structure and formatting.

## Roadmap

- [x] Structured rule editing
- [x] Bulk plain-text rule editing
- [x] Trie engine with longest-match-first replacement
- [x] Web Worker asynchronous processing
- [x] Smart compound rule expansion
- [x] Full EPUB ebook support (import / replace / export)
- [x] Batch file processing
- [x] Split-screen preview (original / processed)
- [x] Case-sensitive toggle
- [x] Bilingual UI (Chinese / English)
- [x] Responsive layout (desktop + mobile)
- [x] UTF-8 BOM export
- [ ] Regular expression rule support
- [ ] Rule template save / import
- [ ] History

## License

[MIT](https://opensource.org/license/mit/)