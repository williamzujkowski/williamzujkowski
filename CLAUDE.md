# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **GitHub Profile README repository** (`williamzujkowski/williamzujkowski`) - a special repository that displays its README.md content on the GitHub user profile page.

## Repository Structure

- **README.md** - Main profile content with embedded terminal SVG
- **src/** - Configuration files and generated SVG
  - `terminal.svg` - Generated animated terminal (auto-updated)
  - `awesome-terminal-config.json` - Animation sequences
- **scripts/** - SVG generators and utilities
  - `generate-awesome-terminal.js` - Main terminal generator
  - Supporting modules for validation and generation
- **.github/** - GitHub Actions and schemas
  - `workflows/update-terminal-svg.yml` - Hourly automation
  - `schema/` - JSON validation schemas
- **package.json** - Node.js dependencies (ajv, axios, jest)
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

## Terminal SVG Feature

### Overview
The animated terminal SVG displays William's profile information through a realistic terminal interface that updates hourly via GitHub Actions.

### Updating Terminal Content
1. Edit `src/awesome-terminal-config.json` to modify animation sequences
2. Run `npm run generate-awesome` to preview locally
3. Commit changes - GitHub Actions will auto-update the SVG

### Terminal Features
- Character-by-character typing animations
- Loading effects and progress bars
- Auto-scrolling for long content
- ASCII art with glow effects
- Multiple dad jokes from the README

## Best Practices

1. **Test SVG Generation**: Run `npm run generate-awesome` before committing
2. **Regular Maintenance**: Review quarterly for outdated information
3. **Animation Timing**: Keep total duration under 90 seconds
4. **Atomic Commits**: One logical change per commit
5. **Meaningful Messages**: Clear commit messages help track profile evolution

## Additional Resources

- **Standards Repository**: https://github.com/williamzujkowski/standards
- **Conventional Commits**: https://www.conventionalcommits.org/
- **GitHub Profile README Guide**: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme

## Notes for Claude Code

- This repository now includes an automated terminal SVG generation system
- Run `npm install` before making changes to ensure dependencies are available
- The terminal SVG updates hourly via GitHub Actions
- Focus on content quality and maintaining William's personal voice
- When in doubt, preserve the existing playful tone
- All changes are immediately visible on the GitHub profile
- Remember: this is a public-facing personal brand representation
- Terminal animations should be tested locally before committing