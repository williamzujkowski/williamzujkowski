# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **GitHub Profile README repository** (`williamzujkowski/williamzujkowski`) - a special repository that displays its README.md content on the GitHub user profile page.

## Repository Structure

- **README.md** - Main profile content with embedded terminal SVG
- **src/** - Generated SVG output
  - `terminal.svg` - Dynamically generated animated terminal (updates daily)
- **scripts/** - SVG generation system
  - `dynamic-terminal-generator.js` - Main generator with real-time content
  - `dynamic-content.js` - Time API integration and joke rotation
  - `advanced-terminal-generator.js` - Core SVG animation engine
  - `national-day-provider.js` - 366-day fun/awareness day database
- **.github/** - GitHub Actions automation
  - `workflows/update-terminal-svg.yml` - Automated updates every 6 hours
- **.archive/** - Archived legacy files (old static generators and configs)
- **package.json** - Node.js dependencies (axios, jest)
- Git-based version control for tracking changes

## Development Standards

This repository follows William's personal development standards. For comprehensive guidelines, see: https://github.com/williamzujkowski/standards

### Commit Message Standards

Follow conventional commit format:
```
type(scope): subject

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature or content addition
- `fix`: Bug fix or correction
- `docs`: Documentation changes (README updates)
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code restructuring without changing functionality
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "docs: update current projects section"
git commit -m "feat: add new hobby to interests list"
git commit -m "fix: correct LinkedIn badge URL"
git commit -m "style: improve YAML formatting"
```

### Git Workflow

```bash
# Before making changes
git pull origin main
git status

# Make your edits to README.md

# Stage and commit with conventional format
git add README.md
git commit -m "type(scope): descriptive message"

# Push changes
git push origin main

# View recent commits
git log --oneline -5
```

## Security Practices

- **Never commit sensitive information** (API keys, tokens, passwords)
- **Review changes before committing** with `git diff`
- **Keep the repository public-friendly** - all content is visible
- **Verify all external links** remain functional and safe

## Content Guidelines

### Quality Checklist

Before committing README updates, ensure:
- [ ] All links are functional and use HTTPS where possible
- [ ] Badges display correctly
- [ ] YAML section is valid and properly formatted
- [ ] Tone remains playful and family-friendly
- [ ] No typos or grammatical errors
- [ ] Current projects/quests are up-to-date
- [ ] No sensitive personal information exposed

### Content Standards

When updating the README.md:
- **Maintain personality**: Keep the lighthearted, dad-joke friendly tone
- **Stay authentic**: Personal stories and genuine interests
- **Be concise**: Clear, readable sections without overwhelming detail
- **Update regularly**: Keep projects and interests current
- **Preserve structure**: 
  - Hero section with introduction
  - About Me with key personality traits
  - Current Quests (active projects)
  - Side Quests & Hobbies
  - YAML configuration
  - Closing tagline

### Writing Style

- Use emoji thoughtfully to enhance readability 🎯
- Keep bullet points concise and scannable
- Use tables for structured information
- Include personality in descriptions (e.g., "Raspberry Pi wizardry")
- Balance professional and personal elements

## Common Tasks

### Update Current Projects
```bash
# Edit the Current Quests table in README.md
# Then commit with:
git add README.md
git commit -m "docs: update current quests status"
git push origin main
```

### Add New Hobby or Interest
```bash
# Add to Side Quests & Hobbies section
# Update YAML configuration if needed
git add README.md
git commit -m "feat: add new hobby to interests"
git push origin main
```

### Fix Broken Links or Badges
```bash
# Correct the URL in README.md
git add README.md
git commit -m "fix: update broken badge/link URL"
git push origin main
```

## Terminal SVG Generation System

### Architecture Overview

The terminal animation system generates **dynamic, daily-updating content** using real-time APIs and rotating jokes.

**Core Modules** (in `scripts/`):
- `dynamic-terminal-generator.js` - Main generator with dynamic content creation
- `dynamic-content.js` - Real-time World Time API integration, joke rotation, stats generation
- `advanced-terminal-generator.js` - Core SVG animation engine (scrolling, typing, cursor)
- `national-day-provider.js` - 366-day database of fun/awareness days

**How It Works**:
1. Fetches accurate time from World Time API (America/New_York timezone)
2. Selects daily joke based on day-of-year (deterministic rotation through 25 tech jokes)
3. Calculates dynamic stats (uptime, coffee consumed, bugs fixed, etc.)
4. Generates terminal sequences with real content
5. Creates animated SVG with typing effects and scrolling
6. Output: `src/terminal.svg` (embedded in README.md)

### Key Features

- **Dynamic Daily Content**:
  - Real-time accurate timestamps from World Time API
  - 25 rotating tech dad jokes (deterministic by day)
  - Dynamic statistics that update based on current date
  - Fresh content guaranteed every day

- **Realistic Terminal Behavior**:
  - Character-by-character typing with variable speeds
  - Block cursor that follows typing and blinks
  - Automatic scrolling when content exceeds viewport
  - Authentic command/output sequencing

- **Visual Effects**:
  - CRT phosphor text glow (`textGlow` filter)
  - Window shadow effects
  - Custom title bar: "william@dad-joke-hq:~"
  - Monospace Ubuntu Mono font
  - Enhanced 1000x700px viewport

- **Animation System**:
  - Frame-based animation with precise timing
  - Separate scroll container for smooth transitions
  - Support for commands, output, and ASCII art
  - Configurable delays and pauses

### Development Commands

```bash
# Install dependencies
npm install

# Generate dynamic SVG with fresh content
npm run generate

# Run tests
npm test
npm run test:watch

# Lint code (if configured)
npm run lint
```

### Updating Terminal Content

The terminal content is **fully dynamic** - no config editing needed! It automatically:
- Fetches current time from World Time API
- Rotates through 15 tech dad jokes daily
- Calculates stats based on current date

**To modify jokes or content**:
1. Edit `scripts/dynamic-content.js` to add/modify jokes or change logic
2. Run `npm run generate` to preview
3. Commit and push - GitHub Actions handles the rest

**To change terminal appearance**:
1. Edit `scripts/dynamic-terminal-generator.js`
2. Modify window size, colors, or sequence structure
3. Test with `npm run generate`

**To add new jokes**:
```javascript
// In scripts/dynamic-content.js, add to this.techJokes array:
{
  q: "Your question here?",
  a: "Your punchline here!"
}
```

### How Dynamic Content Works

The system generates fresh content each run:

1. **Time API** - Fetches accurate time from `worldtimeapi.org/api/timezone/America/New_York`
2. **Joke Rotation** - Selects joke using: `dayOfYear % totalJokes` (ensures same joke all day)
3. **Dynamic Stats** - Calculates from birth year (1982):
   - Coffee consumed: `days alive * 2.1 cups/day`
   - Bugs fixed: `days alive * 2.7`
   - Stack Overflow visits: `bugs fixed * 1.5`
4. **Fresh SVG** - Generates new animation with updated content

### Testing

Test infrastructure is configured via `jest.config.js`. Tests should be placed in `__tests__/` directory.

```bash
# Run tests
npm test

# Watch mode for development
npm run test:watch
```

**Note**: Core modules (dynamic-content.js, dynamic-terminal-generator.js, etc.) currently lack test coverage. See GitHub issue #9 for tracking.

### Automation

GitHub Actions workflow (`.github/workflows/update-terminal-svg.yml`):
- **Schedule**: Runs every 6 hours (`0 5,11,17,23 * * *` UTC = midnight, 6am, noon, 6pm EST)
- **Triggers**: Also runs on pushes to generator scripts
- **Process**:
  1. Checks out repository
  2. Installs Node.js dependencies (`npm ci`)
  3. Runs `npm run generate` (fetches live time, generates content)
  4. Checks if SVG changed with `git diff`
  5. Commits updated SVG if changed: `"chore: update terminal with daily joke and fresh stats [skip ci]"`
  6. Pushes to main branch

**Why it works**: Dynamic content (timestamps, date-based stats, national days) ensures SVG stays fresh with up to 4 updates daily.

### Best Practices

1. **Joke Quality**: Keep jokes appropriate, family-friendly, and tech-related
2. **Test Locally**: Always run `npm run generate` before pushing generator changes
3. **API Reliability**: World Time API has fallback to system time if unavailable
4. **Animation Length**: Current total ~60-70 seconds - good for engagement
5. **Viewport Size**: 1000x700px shows ~28 lines - plan sequences accordingly
6. **Stats Accuracy**: Update birth year in `dynamic-content.js` if needed for accurate age calculation

## Additional Resources

- **Standards Repository**: https://github.com/williamzujkowski/standards
- **Conventional Commits**: https://www.conventionalcommits.org/
- **GitHub Profile README Guide**: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme

## Notes for Claude Code

- This repository features a **fully dynamic** terminal SVG that updates daily
- The system fetches real-time data and rotates content automatically - no static configs!
- Run `npm install` before making changes to ensure dependencies are available
- The terminal SVG updates **daily at midnight EST** via GitHub Actions
- All changes are immediately visible on the GitHub profile
- Legacy files are archived in `.archive/` - don't use them
- Current generator: `scripts/dynamic-terminal-generator.js`
- Content logic: `scripts/dynamic-content.js` (jokes, stats, time API)
- Focus on maintaining William's playful, dad-joke friendly tone
- Terminal animations should be tested locally with `npm run generate` before committing
- Remember: this is a public-facing personal brand representation