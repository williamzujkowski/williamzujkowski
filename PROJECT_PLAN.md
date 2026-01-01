# Project Plan: Terminal SVG National Day & Clock Timing Enhancement

## Overview

Enhance the terminal SVG generator with two features:
1. **National X Day Display** - Show a fun/awareness day for each date using a static database
2. **Accurate Clock Timing** - Terminal timestamps should progress naturally from generation time

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| National Day Source | Static 365-day database | No API key needed, fully self-contained |
| Update Frequency | Every 6 hours | Balance freshness vs Actions minutes |
| Clock Display | Generation timestamp + progression | Timestamps increment as "session" progresses |
| National Day Position | After MOTD banner | Natural flow in terminal session |

---

## Part 1: National Day Provider

### Create New File: `scripts/national-day-provider.js`

Create a class that provides a curated national/fun day for any date.

**Requirements:**
- Export a `NationalDayProvider` class
- Store 366 days (including Feb 29) in a `this.days` object
- Key format: `'MM-DD'` (e.g., `'01-15'` for January 15)
- Each entry: `{ name: string, emoji: string, desc: string }`
- Method: `getNationalDay(date)` returns the day object for given Date
- Fallback: Return a generic "Programmer Appreciation Day" if date not found

**Sample entries to include (create full 366 days):**

```javascript
// Tech-focused days
'01-15': { name: 'Wikipedia Day', emoji: '📖', desc: 'Wiki born 2001' },
'01-28': { name: 'Data Privacy Day', emoji: '🔒', desc: 'Encrypt everything!' },
'02-01': { name: 'Change Your Password Day', emoji: '🔐', desc: 'hunter2 is bad' },
'03-14': { name: 'Pi Day', emoji: '🥧', desc: '3.14159265...' },
'03-31': { name: 'World Backup Day', emoji: '💾', desc: 'Save your data!' },
'05-02': { name: 'Password Day', emoji: '🔑', desc: 'Use a manager!' },
'05-04': { name: 'Star Wars Day', emoji: '⭐', desc: 'May the 4th...' },
'05-25': { name: 'Towel Day', emoji: '🧖', desc: "Don't panic!" },
'07-08': { name: 'Video Games Day', emoji: '🎮', desc: 'Level up!' },
'09-13': { name: "Programmer's Day", emoji: '💻', desc: '256th day!' },
'11-30': { name: 'Computer Security Day', emoji: '🔐', desc: 'Update passwords!' },

// Fun/quirky days  
'01-13': { name: 'Rubber Ducky Day', emoji: '🦆', desc: 'Debug with ducks!' },
'04-01': { name: "April Fools' Day", emoji: '🃏', desc: 'Trust no one' },
'09-19': { name: 'Talk Like a Pirate Day', emoji: '🏴‍☠️', desc: 'Arrr!' },
'10-31': { name: 'Halloween', emoji: '👻', desc: 'Boo!' },

// Holidays
'01-01': { name: 'Public Domain Day', emoji: '📚', desc: 'Copyrights expire!' },
'02-14': { name: "Valentine's Day", emoji: '❤️', desc: 'Love is in the air' },
'07-04': { name: 'Independence Day', emoji: '🎆', desc: 'USA! USA!' },
'12-25': { name: 'Christmas Day', emoji: '🎄', desc: 'Ho ho ho!' },
'12-31': { name: "New Year's Eve", emoji: '🎆', desc: 'Countdown!' },
```

**Complete all 366 days** with a mix of:
- Tech/programming days
- Food days (pizza, taco, coffee, etc.)
- Awareness days
- Fun/quirky celebrations
- Major holidays

---

## Part 2: Clock Timing System

### Concept

The terminal "session" should have timestamps that progress naturally. If generated at 08:00:00, the timestamps in terminal output should show:

```
[08:00:12] First command output
[08:00:45] Second command output  
[08:01:23] Third command output
... etc
```

### Implementation in `scripts/dynamic-content.js`

Add a `SessionTimer` helper class or methods:

```javascript
class SessionTimer {
  constructor(startTime) {
    this.startTime = new Date(startTime);
    this.elapsed = 0; // milliseconds elapsed in "session"
  }

  /**
   * Get current session time and advance the clock
   * @param {number} advanceMs - How many ms to advance after returning
   * @returns {Date} Current session time
   */
  getTime(advanceMs = 0) {
    const current = new Date(this.startTime.getTime() + this.elapsed);
    this.elapsed += advanceMs;
    return current;
  }

  /**
   * Format time as HH:MM:SS
   */
  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/New_York'
    });
  }

  /**
   * Format full timestamp for display
   */
  formatTimestamp(date) {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    });
  }
}
```

### Update `generateContent()` in `dynamic-content.js`

```javascript
async generateContent() {
  const currentTime = await this.fetchAccurateTime();
  const sessionTimer = new SessionTimer(currentTime);
  
  // Get national day
  const nationalDay = this.nationalDayProvider.getNationalDay(currentTime);
  
  return {
    timestamp: this.formatDateTime(currentTime),
    generatedAt: currentTime,
    sessionTimer, // Pass timer to sequence generator
    nationalDay,
    joke: this.getJokeOfDay(currentTime),
    // ... rest of existing content
  };
}
```

---

## Part 3: Terminal Sequence Updates

### Update `scripts/dynamic-terminal-generator.js`

#### Add National Day Sequence (after MOTD)

Insert this sequence after the MOTD banner display:

```javascript
// National Day command
{
  type: 'command',
  prompt: 'visitor@terminal:~$ ',
  content: 'curl -s https://whatday.today/api | jq .today',
  typingDuration: 1800,
  pause: 400
},
{
  type: 'output',
  content: (content) => {
    const day = content.nationalDay;
    const name = day.name.length > 32 ? day.name.substring(0, 29) + '...' : day.name;
    return `╭────────────────────────────────────────────╮
│ ${day.emoji} Today is ${name.padEnd(32)}│
│   "${day.desc}"${' '.repeat(Math.max(0, 32 - day.desc.length))}│
╰────────────────────────────────────────────╯`;
  },
  color: '#f1fa8c',
  pause: 1200
},
```

#### Update Timestamps Throughout

Modify command/output sequences to use progressive timestamps:

```javascript
// Example: Status check command with timestamp
{
  type: 'command', 
  prompt: (content) => {
    const time = content.sessionTimer.formatTime(content.sessionTimer.getTime(500));
    return `[${time}] visitor@terminal:~$ `;
  },
  content: 'systemctl status terminal',
  typingDuration: 1400,
  pause: 300
},
```

#### Realistic Time Progression

Advance the session timer based on:
- **Typing duration**: Add typing time + small random variance
- **Command execution**: Add 200-800ms for "processing"
- **Output display**: Add based on output length

Example timing flow:
```
Generation: 08:00:00 EST
├─ MOTD display:        08:00:00 (instant)
├─ National Day cmd:    08:00:02 (+2s typing)
├─ National Day output: 08:00:03 (+1s display)
├─ Neofetch cmd:        08:00:05 (+2s typing)
├─ Neofetch output:     08:00:06 (+1s render)
├─ Dad joke cmd:        08:00:08 (+2s typing)
├─ Dad joke output:     08:00:09 (+1s)
└─ ... continues naturally
```

---

## Part 4: GitHub Actions Update

### Update `.github/workflows/update-terminal-svg.yml`

Change schedule to every 6 hours:

```yaml
name: Update Terminal SVG

on:
  schedule:
    # Every 6 hours: midnight, 6am, noon, 6pm EST (adjust for UTC)
    - cron: '0 5,11,17,23 * * *'
  
  workflow_dispatch:  # Manual trigger
  
  push:
    branches: [main]
    paths:
      - 'scripts/**'
      - '.github/workflows/update-terminal-svg.yml'

jobs:
  update-svg:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Generate Terminal SVG
        run: npm run generate
        env:
          NODE_ENV: production
          TZ: 'America/New_York'
      
      - name: Commit if changed
        uses: EndBug/add-and-commit@v9
        with:
          add: 'src/terminal.svg'
          message: 'chore: update terminal SVG [skip ci]'
          default_author: github_actions
```

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `scripts/national-day-provider.js` | **CREATE** | Static 366-day database class |
| `scripts/dynamic-content.js` | **MODIFY** | Add SessionTimer, integrate NationalDayProvider |
| `scripts/dynamic-terminal-generator.js` | **MODIFY** | Add national day sequence, use progressive timestamps |
| `.github/workflows/update-terminal-svg.yml` | **MODIFY** | Change to 6-hour cron schedule |

---

## Implementation Order

1. **Create** `national-day-provider.js` with complete 366-day database
2. **Modify** `dynamic-content.js`:
   - Import NationalDayProvider
   - Add SessionTimer class
   - Update generateContent() to include nationalDay and sessionTimer
3. **Modify** `dynamic-terminal-generator.js`:
   - Add national day sequence after MOTD
   - Update existing sequences to use sessionTimer for timestamps
4. **Modify** GitHub Actions workflow for 6-hour schedule
5. **Test** locally with `npm run generate`
6. **Commit** and verify GitHub Actions runs successfully

---

## Testing Checklist

- [ ] National day displays correctly for current date
- [ ] National day displays correctly for edge cases (Feb 29, Dec 31, Jan 1)
- [ ] Timestamps progress naturally through the session
- [ ] Timestamps are in EST timezone
- [ ] SVG generates without errors
- [ ] Animation timing stays under 50 seconds total
- [ ] GitHub Actions workflow triggers on schedule

---

## Example Output

After implementation, the terminal should show something like:

```
[08:00:00] ══════════════════════════════════════════════
           Welcome to William's Terminal
           ══════════════════════════════════════════════

[08:00:02] visitor@terminal:~$ curl -s https://whatday.today/api | jq .today
╭────────────────────────────────────────────╮
│ 🔒 Today is Data Privacy Day               │
│   "Encrypt everything!"                    │
╰────────────────────────────────────────────╯

[08:00:05] visitor@terminal:~$ neofetch
... neofetch output ...

[08:00:09] visitor@terminal:~$ fortune | cowsay
... dad joke output ...
```

---

## Notes

- The 366-day database should be comprehensive but can be expanded later
- Focus on tech/programming days where possible for audience relevance
- Keep descriptions short (under 25 chars) to fit in display box
- Emoji should render correctly in SVG (test in GitHub README)
- Session time advances should feel natural, not perfectly uniform
