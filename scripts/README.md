# Terminal SVG Generators

This directory contains multiple SVG generators for creating animated terminal displays.

## Generators

### 1. `generate-svg.js` (v1 - Basic)
- Original implementation using readme-typing-svg API
- Simple text-only animations
- Config: `src/terminal-config.json`
- Features: Basic typing animation

### 2. `generate-svg-v2.js` (v2 - Terminal Window)
- Adds terminal window UI with title bar
- Still uses readme-typing-svg API for text
- Config: `src/terminal-config-v2.json`
- Features: Window chrome, basic animations

### 3. `generate-awesome-terminal.js` (v3 - Awesome Terminal) ⭐ CURRENT
- Complete terminal experience with realistic behaviors
- Custom SVG generation (no external API)
- Config: `src/awesome-terminal-config.json`
- Features:
  - Character-by-character typing
  - Loading animations
  - Progress bars
  - Clear screen effects
  - Auto-scrolling
  - ASCII art with glow
  - CRT scanlines

## Usage

```bash
# Generate the awesome terminal (recommended)
npm run generate-awesome

# Generate v2 terminal window
npm run generate-terminal

# Generate v1 basic animation
npm run generate-svg
```

## Configuration Files

Each generator uses its own configuration file in the `src/` directory:
- `terminal-config.json` - Basic typing sequences
- `terminal-config-v2.json` - Window settings + typing
- `awesome-terminal-config.json` - Full animation sequences

## GitHub Actions

The workflow is configured to use `generate-awesome` by default.

## Architecture

### Core Modules
- `config-reader.js` - Reads JSON configuration files
- `schema-validator.js` - Validates configs against JSON schemas
- `svg-generator.js` - v1 API-based generator
- `terminal-window-generator.js` - v2 window generator
- `awesome-terminal-generator.js` - v3 full-featured generator