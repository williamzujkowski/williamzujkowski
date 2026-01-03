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
| Tests | 476 passing, 97%+ statement coverage |
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
npm test             # Run 476 tests
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
- Uses Nunjucks templates in `templates/blocks/*.njk`
- Dynamic reading-based pauses via `calculateReadingPause()`
- Single code path (legacy mode removed in v2026.01)

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
- `buildDevOpsSequences` - Git blame, Docker, npm install, sudo sandwich
- `buildNetworkSequences` - Ping jokes, curl, top
- `buildEasterEggSequences` - Telnet Star Wars ASCII

Always run `npm run generate` to preview before committing.

## Template Authoring Guide

Templates use [Nunjucks](https://mozilla.github.io/nunjucks/) (Jinja2-compatible). Create new blocks in `templates/blocks/`.

### Template Structure

```nunjucks
{# Comment describing the template #}
{# Context: variables you expect to receive #}

{% set local_var = some_calculation %}

{{ content | filter }}
```

### Available Filters

| Filter | Usage | Description |
|--------|-------|-------------|
| `box` | `lines \| box('double', 56)` | ASCII box (styles: double, single, rounded) |
| `doublebox` | `lines \| doublebox(56)` | Double-line box |
| `roundedbox` | `lines \| roundedbox(48)` | Rounded corners box |
| `fg` | `text \| fg('green')` | Set foreground color |
| `bold` | `text \| bold` | Bold text |
| `dim` | `text \| dim` | Dimmed text |
| `center` | `text \| center(40)` | Center text in width |
| `pad` | `text \| pad(20, 'left')` | Pad text (left/right/center) |
| `truncate` | `text \| truncate(30)` | Truncate to max width |
| `wrap` | `text \| wrap(50, '  ')` | Word wrap with indent |
| `repeat` | `char \| repeat(10)` | Repeat string N times |
| `slice` | `str \| slice(0, 10)` | Python-style string slice |

### Available Colors (Dracula Theme)

Access via `COLORS` global or use color names in `fg()` filter:
- `YELLOW`, `CYAN`, `GREEN`, `PINK`, `PURPLE`, `WHITE`, `ORANGE`
- `BLUE`, `NEON_GREEN`, `MATRIX_GREEN`, `COMMENT`

### Context Variables

Templates receive these from `buildContext()`:

```javascript
{
  user: 'william',
  host: 'dad-joke-hq',
  timestamp: 'Sat Jan 3 00:00 EST 2026',
  joke: { q, a, category },
  nationalDay: { name, desc, emoji },
  stats: { uptime, daysAlive, coffeeConsumed, bugsFixed, bugsCreated, stackOverflowVisits },
  rotation: 0-2,
  rotationName: 'Core+Easter' | 'DevOps' | 'Network'
}
```

### Macros (templates/base/macros.njk)

```nunjucks
{% from 'base/macros.njk' import prompt, info_row, status, progress_bar %}

{{ prompt('william', 'homelab', '~', '$') }}
{{ info_row('OS', 'DadOS 2026.01') }}
{{ status('success', 'Build complete') }}
{{ progress_bar(75, 100, 20) }}
```

### Adding a New Sequence

1. Create template: `templates/blocks/your_block.njk`
2. Add builder in `scripts/template-sequence-builder.js`:
```javascript
function buildYourSequence(content, engine) {
  return buildTemplateSequence({
    command: 'your-command --flags',
    templateName: 'blocks/your_block.njk',
    context: { /* variables for template */ },
    color: COLORS.CYAN,
    typingDuration: TYPING.MEDIUM,
    pause: PAUSE.STANDARD
  }, engine);
}
```
3. Add to sequence array in `buildTemplateSequences()` or rotation builders
4. Export function and add tests

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
