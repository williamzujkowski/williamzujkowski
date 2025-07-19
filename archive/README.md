# Archive

This folder contains previous iterations and unused files from the terminal SVG generator project.

## Contents

### `/scripts/`
Previous generator implementations that have been superseded by the advanced terminal generator:
- `generate-svg.js` - Original basic SVG generator
- `generate-svg-v2.js` - Second iteration with improvements
- `generate-awesome-terminal.js` - Version with enhanced animations
- `generate-unix-terminal.js` - Unix-style terminal attempt
- `generate-fixed-terminal.js` - Bug fix iteration
- `generate-optimized-terminal.js` - Performance optimization attempt
- Various generator classes (`*-generator.js`)
- Python implementations (`*.py`)
- Test and debug scripts

### `/src/`
Unused configuration files:
- `terminal-config.json` - Original configuration
- `terminal-config-v2.json` - V2 configuration
- `awesome-terminal-config.json` - Awesome version config
- `awesome-terminal-config-jokes.json` - Jokes configuration
- `unix-terminal-config.json` - Unix terminal config
- `terminal-test.svg` - Test output file

### `/root/`
Files from the repository root:
- Python scripts and their requirements
- Old configuration files
- `terminal.gif` - Original GIF animation
- `config.toml` and `gifos_settings.toml` - Unused configs

### `/tests/`
Tests for deprecated generators:
- `generate-svg.test.js`
- `svg-generator.test.js`

### `/.github/workflows/`
Deprecated GitHub Actions workflows:
- `terminal-update.yml` - GIF generation workflow (no longer needed)

## Note
These files are preserved for historical reference. The active terminal generator is:
- `scripts/generate-advanced-terminal.js` (entry point)
- `scripts/advanced-terminal-generator.js` (implementation)
- `src/terminal-config-fixed.json` (configuration)