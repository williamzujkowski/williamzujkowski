# Terminal SVG Generators

This directory contains the **dynamic terminal SVG generation system** that creates daily-updating animated terminals for the GitHub profile.

## 🚀 Current System (Dynamic Generation)

### Active Files

1. **`dynamic-terminal-generator.js`** - Main entry point
   - Orchestrates the entire generation process
   - Creates terminal sequences with dynamic content
   - Configures window size (900x650px) and visual settings
   - Used by `npm run generate` command

2. **`dynamic-content.js`** - Content generation engine
   - Fetches accurate time from World Time API (America/New_York)
   - Rotates through 15 tech dad jokes daily (deterministic by day-of-year)
   - Calculates dynamic statistics (uptime, coffee consumed, bugs fixed, etc.)
   - Provides formatted timestamps for terminal display

3. **`advanced-terminal-generator.js`** - Core SVG animation engine
   - Generates SVG with typing effects, cursor animation, scrolling
   - Creates realistic terminal window with title bar
   - Handles frame-based animation timing
   - Applies visual effects (glow, shadows, scanlines)

4. **`config-reader.js`** - Configuration utilities
   - JSON file reading and parsing
   - Error handling for missing configs

5. **`schema-validator.js`** - JSON schema validation
   - AJV-based validation against schemas
   - Ensures configuration integrity

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────┐
│  1. GitHub Actions triggers (daily at midnight EST) │
│  2. npm run generate                                 │
│  3. dynamic-terminal-generator.js                    │
│     ├── Calls dynamic-content.js                     │
│     │   ├── Fetches time from World Time API        │
│     │   ├── Selects joke (dayOfYear % 15)           │
│     │   └── Calculates current stats                │
│     └── Calls advanced-terminal-generator.js        │
│         └── Creates SVG with animations             │
│  4. Outputs to src/terminal.svg                     │
│  5. Git diff detects changes                        │
│  6. Commits and pushes updated SVG                  │
└─────────────────────────────────────────────────────┘
```

## 📝 Usage

```bash
# Generate terminal SVG with fresh content
npm run generate

# Output will show:
# ✓ Fetched accurate time from World Time API
# 📅 Current time: Wed Oct 1 22:43 EST 2025
# 😄 Today's joke: [rotating joke]
# ✅ Generated successfully!
```

## 🎨 Adding New Jokes

Edit `dynamic-content.js` and add to the `techJokes` array:

```javascript
{
  q: "Why do programmers prefer dark mode?",
  a: "Because light attracts bugs!"
}
```

Jokes rotate daily based on day-of-year for consistent daily content.

## 🔧 Customizing Appearance

Edit `dynamic-terminal-generator.js`:

```javascript
// Window configuration
generator.config.window.width = 900;
generator.config.window.height = 650;
generator.config.window.titleBar.title = 'william@dad-joke-hq:~';

// Terminal settings
generator.config.terminal.fontSize = 15;
generator.config.terminal.lineHeight = 1.5;
```

## 📦 Legacy Files

Legacy static generators have been archived to `.archive/`:
- `generate-advanced-terminal.js` - Old static config-based generator
- `terminal-config-fixed.json` - Old static configuration
- Various old schema files

These are kept for reference but are no longer used.

## 🧪 Testing

The system includes Jest tests in `__tests__/`:
- `config-reader.test.js` - Configuration loading
- `schema-validator.test.js` - Schema validation

Run tests with:
```bash
npm test
npm run test:watch  # Watch mode
```

## 🤖 Automation

GitHub Actions (`.github/workflows/update-terminal-svg.yml`):
- Runs daily at midnight EST (`0 5 * * *` UTC)
- Triggers on push to generator scripts
- Automatically commits updated SVG

## 🎯 Why This Works

The old system generated the **same SVG every time** because it used a static config file. The git diff showed no changes, so nothing was committed.

The new system guarantees fresh content daily by:
1. Fetching real-time timestamps (changes every run)
2. Using date-based joke rotation (same joke all day, different tomorrow)
3. Calculating stats from current date (increases daily)

This ensures the SVG **always** changes, triggering automatic commits.

## 📊 Animation Features

- **Character-by-character typing** with variable speeds
- **Block cursor** that follows typing and blinks
- **Auto-scrolling** when content exceeds viewport
- **CRT effects**: phosphor glow, scanlines, shadows
- **Ubuntu-style window** with traffic light buttons
- **Smooth transitions** and precise timing

## 🔗 Dependencies

- `axios` - HTTP client for World Time API
- `ajv` - JSON schema validation
- `jest` - Testing framework

Install with: `npm install`
