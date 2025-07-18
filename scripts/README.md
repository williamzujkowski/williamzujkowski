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

### 3. `generate-awesome-terminal.js` (v3 - Awesome Terminal)
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

### 4. `generate-unix-terminal.js` (v4 - Unix Terminal) ⭐ CURRENT
- Authentic Unix/Linux terminal with block cursor
- Realistic typing speed variations
- Config: `src/unix-terminal-config.json`
- Features:
  - Block cursor that follows typing
  - Variable typing speeds (fast/slow/pauses)
  - Command + output pairing
  - Instant output display (like real terminals)
  - CRT phosphor glow effects
  - Smooth scrolling animations
  - Accurate monospace character width

## Usage

```bash
# Generate the Unix terminal (recommended) ⭐
npm run generate-unix

# Generate v3 awesome terminal
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
- `unix-terminal-config.json` - Unix-style commands and outputs

## GitHub Actions

The workflow is configured to use `generate-unix` by default.

## Architecture

### Core Modules
- `config-reader.js` - Reads JSON configuration files
- `schema-validator.js` - Validates configs against JSON schemas
- `flexible-schema-validator.js` - Schema validator with configurable schemas
- `svg-generator.js` - v1 API-based generator
- `terminal-window-generator.js` - v2 window generator
- `awesome-terminal-generator.js` - v3 full-featured generator
- `unix-terminal-generator.js` - v4 Unix-style terminal generator