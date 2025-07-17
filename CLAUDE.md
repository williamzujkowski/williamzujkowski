# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **GitHub Profile README repository** (`williamzujkowski/williamzujkowski`) - a special repository that displays its README.md content on the GitHub user profile page.

## Repository Structure

- Single-file repository containing only `README.md`
- No build system, dependencies, or complex codebase
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

## Best Practices

1. **Keep It Simple**: This is a single-file repo - avoid overcomplicating
2. **Regular Maintenance**: Review quarterly for outdated information
3. **Test Locally**: Preview markdown changes before committing
4. **Atomic Commits**: One logical change per commit
5. **Meaningful Messages**: Clear commit messages help track profile evolution

## Additional Resources

- **Standards Repository**: https://github.com/williamzujkowski/standards
- **Conventional Commits**: https://www.conventionalcommits.org/
- **GitHub Profile README Guide**: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme

## Notes for Claude Code

- This repository is intentionally simple - no build process or dependencies
- Focus on content quality and maintaining William's personal voice
- When in doubt, preserve the existing playful tone
- All changes are immediately visible on the GitHub profile
- Remember: this is a public-facing personal brand representation