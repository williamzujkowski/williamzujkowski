# CLAUDE.md

GitHub Profile README repository (`williamzujkowski/williamzujkowski`) - displays README.md on GitHub profile page.

## Quick Reference

| Item | Value |
|------|-------|
| Main output | `src/terminal.svg` (embedded in README.md) |
| Generator | `scripts/dynamic-terminal-generator.js` |
| Content logic | `scripts/dynamic-content.js` |
| Animation engine | `scripts/advanced-terminal-generator.js` |
| Viewport | 1000x700px (~28 visible lines) |
| Updates | Every 6 hours via GitHub Actions |
| Tests | 292 passing, 95.89% statement coverage |

## Repository Structure

```
scripts/
  dynamic-terminal-generator.js  # Main SVG generator entry point
  dynamic-content.js             # Time API, jokes, stats, national days
  advanced-terminal-generator.js # Core SVG animation engine
  terminal-sequences.js          # Rotation sequence builders
  terminal-line-renderer.js      # Line rendering with styled text support
  svg-effects.js                 # SVG filters and visual effects
  national-day-provider.js       # 366-day fun/awareness day database
  constants.js                   # Centralized colors, timing, dimensions
  box-generator.js               # ASCII box drawing utilities
  template-engine.js             # Nunjucks templating with custom filters
  content-loader.js              # YAML content loading with caching
  markup-parser.js               # [[style]] markup to SVG tspan conversion
  template-context.js            # Template render context builder
templates/
  base/macros.njk                # Reusable terminal components
  blocks/*.njk                   # Block templates (dad_joke, national_day, etc.)
content/
  jokes.yaml                     # Externalized joke database
  national_days.yaml             # Externalized national days
src/
  terminal.svg                   # Generated output (auto-updated)
__tests__/                       # Jest tests for all modules
.github/workflows/
  update-terminal-svg.yml        # Runs every 6 hours + on script changes
```

## Development Commands

```bash
npm install          # Install dependencies
npm run generate     # Generate SVG locally
npm test             # Run 292 tests
npm run test:watch   # Watch mode
```

## How the Terminal SVG Works

1. Fetches time from World Time API (America/New_York timezone)
2. Selects joke: `dayOfYear % 25` (deterministic daily rotation)
3. Calculates stats from birth year 1982 (coffee, bugs fixed, etc.)
4. Generates animated SVG with typing effects and scrolling
5. GitHub Actions commits if SVG changed

## Key Configuration

**Constants** (`scripts/constants.js`):
- `COLORS` - Dracula theme palette
- `TYPING` - Animation durations (INSTANT=50ms to EXTRA_LONG=2500ms)
- `PAUSE` - Delays between sequences
- `WINDOW` - Viewport dimensions (1000x700)

**Terminal sequences** use this structure:
```javascript
{ type: 'command', prompt: '$ ', content: 'echo hello', typingDuration: 500 }
{ type: 'output', content: 'hello', color: COLORS.GREEN }
```

## Modifying Content

**Add jokes** - Edit `scripts/dynamic-content.js`:
```javascript
this.techJokes.push({ q: "Question?", a: "Punchline!" });
```

**Change appearance** - Edit `scripts/dynamic-terminal-generator.js` or use constants from `constants.js`.

**Add national days** - Edit `scripts/national-day-provider.js` (366 entries, indexed by day-of-year).

Always run `npm run generate` to preview before committing.

## Automation Details

GitHub Actions (`.github/workflows/update-terminal-svg.yml`):
- Schedule: `0 5,11,17,23 * * *` (every 6 hours UTC)
- Triggers on changes to generator scripts
- Uses `[skip ci]` in commit message to prevent loops
- Concurrency control prevents overlapping runs

## Content Guidelines

- Maintain playful, dad-joke friendly tone
- Keep content family-friendly and tech-related
- This is public-facing personal brand representation
- Legacy files in `.archive/` should not be used

## Coding Standards

See `coding_standards.md` for full policies. Key rules for this repo:

| Rule | Application |
|------|-------------|
| Time Authority | Use America/New_York (implemented via World Time API) |
| Deterministic outputs | Joke rotation uses `dayOfYear % 25` - no randomness |
| File size ≤400 lines | All code files now compliant |
| Function size ≤50 lines | Keep helpers focused |
| No secrets in logs | No sensitive data in SVG output |
| Test → observe → record | Run `npm test` after changes |

**Commits**: `type(scope): subject` - feat, fix, docs, refactor, chore
