# CLAUDE.md

GitHub Profile README repository (`williamzujkowski/williamzujkowski`) - displays README.md on GitHub profile page.

## Quick Reference

| Item | Value |
|------|-------|
| Main output | `src/terminal.svg` (embedded in README.md) |
| Generator | `scripts/dynamic-terminal-generator.js` (entry point) |
| Sequence Builder | `scripts/template-sequence-builder.js` (primary) |
| Content logic | `scripts/dynamic-content.js` |
| Animation engine | `scripts/advanced-terminal-generator.js` |
| Template engine | `scripts/template-engine.js` (Nunjucks) |
| Viewport | 1000x700px (~28 visible lines) |
| Updates | Every 6 hours via GitHub Actions |
| Tests | 469 passing, 97%+ statement coverage |
| Animation target | ~90s (dynamic reading-based pauses) |

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
  template-sequence-builder.js   # Template-driven sequence generation
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
npm run generate     # Generate SVG locally (uses template mode)
npm test             # Run 469 tests
npm run test:watch   # Watch mode
```

## How the Terminal SVG Works

1. Fetches time from World Time API (America/New_York timezone)
2. Selects joke: `dayOfYear % 25` (deterministic daily rotation)
3. Calculates stats from birth year 1982 (coffee, bugs fixed, etc.)
4. Generates animated SVG with typing effects and scrolling
5. GitHub Actions commits if SVG changed

## Key Configuration

**Generator Mode**:
- Template mode is the DEFAULT and ONLY supported mode
- Uses Nunjucks templates in `templates/blocks/*.njk`
- Dynamic reading-based pauses via `calculateReadingPause()`
- Legacy inline generation is DEPRECATED (do not use `USE_TEMPLATES=false`)

**Constants** (`scripts/constants.js`):
- `COLORS` - Dracula theme palette
- `TYPING` - Animation durations (INSTANT=400ms to EXTRA_LONG=2400ms)
- `PAUSE` - Delays between sequences
- `READING` - Reading speed parameters (14 chars/sec, 800-4500ms pause range)
- `TERMINAL` - Padding (12px), font size (14px), line height (1.8)
- `WINDOW` - Viewport dimensions (1000x700)
- `ANIMATION` - Max duration target (90s)

**Terminal sequences** use this structure:
```javascript
{ type: 'command', prompt: '$ ', content: 'echo hello', typingDuration: 500 }
{ type: 'output', content: 'hello', color: COLORS.GREEN }
```

## Modifying Content

**Add/edit terminal blocks** - Edit templates in `templates/blocks/*.njk`:
- `motd.njk` - Welcome banner
- `neofetch.njk` - System info display
- `dad_joke_box.njk` - Joke display with ASCII box
- `htop.njk` - Process display with progress bars
- `fortune.njk` - Cowsay tux output
- etc.

**Add jokes** - Edit `scripts/dynamic-content.js`:
```javascript
this.techJokes.push({ q: "Question?", a: "Punchline!" });
```

**Change timing/colors** - Edit `scripts/constants.js` (COLORS, TYPING, PAUSE, READING).

**Change terminal padding** - Edit `TERMINAL.PADDING` in `scripts/constants.js`.

**Add national days** - Edit `scripts/national-day-provider.js` (366 entries, indexed by day-of-year).

**Modify rotation sequences** - Edit `scripts/terminal-sequences.js`:
- `buildDevOpsSequences` - Git blame, Docker, sudo sandwich
- `buildNetworkSequences` - Ping jokes, curl, top
- `buildEasterEggSequences` - Telnet Star Wars ASCII

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
