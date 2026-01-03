#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdvancedTerminalGenerator = require('./advanced-terminal-generator');
const DynamicContentGenerator = require('./dynamic-content');
const { createDoubleBox, createRoundedBox } = require('./box-generator');
const { DEFAULT_PROMPT, COLORS, WINDOW, ANIMATION } = require('./constants');
const {
  buildDevOpsSequences,
  buildNetworkSequences,
  buildEasterEggSequences
} = require('./terminal-sequences');
const { buildTemplateSequences } = require('./template-sequence-builder');

/**
 * Feature flag for template-based content generation.
 * Template mode is now the DEFAULT - use USE_LEGACY=true to use deprecated legacy mode.
 * @type {boolean}
 */
const USE_TEMPLATES = process.env.USE_LEGACY !== 'true';

/**
 * Generate dynamic terminal sequences based on current date/time and jokes
 */
async function generateDynamicTerminal() {
  console.log('🚀 Starting dynamic terminal generation...');

  // Get dynamic content
  const contentGen = new DynamicContentGenerator();
  const content = await contentGen.generateContent();

  console.log(`📅 Current time: ${content.timestamp}`);
  console.log(`🎉 Today is: ${content.nationalDay.emoji} ${content.nationalDay.name} - ${content.nationalDay.desc}`);
  console.log(`😄 Today's joke: ${content.joke.q}`);
  console.log(`🔄 Rotation: Day ${content.rotation} (${['Core+Easter', 'DevOps', 'Network'][content.rotation]})`);
  console.log(`📝 Generator mode: ${USE_TEMPLATES ? 'template (default)' : 'LEGACY (deprecated)'}`);

  // Build core sequences (common to all rotations)
  // Template mode is the default; legacy mode is deprecated
  const coreSequences = USE_TEMPLATES
    ? buildTemplateSequences(content)
    : buildLegacyCoreSequences(content);

  /**
   * Build legacy core sequences (original inline implementation).
   * @param {Object} content - Dynamic content from generator
   * @returns {Array<Object>} Terminal sequences
   */
  function buildLegacyCoreSequences(content) {
    return [
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'cat /etc/motd',
      typingDuration: 800,
      pause: 400,
      delay: 100
    },
    {
      type: 'output',
      content: createDoubleBox([
        '',
        `WILLIAM'S DEV TERMINAL v${new Date().getFullYear()}.${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
        'Powered by coffee, dad jokes & late-night debugging',
        ''
      ]),
      color: COLORS.NEON_GREEN,
      pause: 1200
    },
    // National Day sequence - shows fun/awareness day for today
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'curl -s https://whatday.today/api | jq .today',
      typingDuration: 1600,
      pause: 300
    },
    {
      type: 'output',
      content: (() => {
        const day = content.nationalDay;
        const name = day.name.length > 32 ? day.name.substring(0, 29) + '...' : day.name;
        const desc = day.desc.length > 38 ? day.desc.substring(0, 35) + '...' : day.desc;
        return createRoundedBox([
          `${day.emoji} Today is ${name}`,
          `  "${desc}"`
        ]);
      })(),
      color: COLORS.YELLOW,
      pause: 1000
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'cat /var/log/dad.log | tail -4',
      typingDuration: 1200,
      pause: 300
    },
    {
      type: 'output',
      content: `[INFO]  Coffee levels: CRITICAL - refilling...
[WARN]  Kids detected in kitchen, engaging snack protocols
[DEBUG] Attempting to find matching socks... timeout
[INFO]  Dad joke #${Math.floor(content.stats.daysAlive * 0.7).toLocaleString()} deployed successfully`,
      color: COLORS.YELLOW,
      pause: 800
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'alias | head -4',
      typingDuration: 500,
      pause: 300
    },
    {
      type: 'output',
      content: `alias yolo='git push --force'
alias fix='git commit -m "fixed it"'
alias coffee='break && brew'
alias monday='sudo shutdown -h now'`,
      color: COLORS.CYAN,
      pause: 600
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'cat /etc/profile',
      typingDuration: 1200,
      pause: 400
    },
    {
      type: 'output',
      content: `# William Zujkowski - Developer Profile
# =======================================
Role: Senior Security Specialist & Family CTO
Uptime: ${content.stats.uptime} years (${content.stats.daysAlive.toLocaleString()} days)
Shell: /bin/dad-jokes
Status: ☕ Powered by coffee and curiosity`,
      color: COLORS.BLUE,
      pause: 1500
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'ps aux | grep "life.*processes"',
      typingDuration: 2000,
      pause: 500
    },
    {
      type: 'output',
      content: `william   1337  99.9  5.0   ∞   ∞  ?  Ssl  ${content.timestamp.slice(4, 16)}  ∞  /usr/bin/family --priority=realtime
william   2048  42.0  3.7   ∞   ∞  ?  Sl   ${content.timestamp.slice(4, 16)}  ∞  /usr/bin/security-automation --mode=defensive
william   4096  15.2  2.1   ∞   ∞  ?  S    ${content.timestamp.slice(4, 16)}  ∞  /usr/bin/home-assistant --smart-home
william   8192  100   1.0   ∞   ∞  ?  R+   ${content.timestamp.slice(4, 16)}  ∞  /usr/bin/dad-joke-daemon --interval=30s`,
      color: COLORS.WHITE,
      pause: 1800
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'cat /proc/developer/stats',
      typingDuration: 1800,
      pause: 500
    },
    {
      type: 'output',
      content: `Developer Stats (PID: 1000)
============================
Total Uptime: ${content.stats.uptime} years
Coffee Consumed: ${content.stats.coffeeConsumed.toLocaleString()} cups
Bugs Fixed: ${content.stats.bugsFixed.toLocaleString()}
Bugs Created: ${content.stats.bugsCreated.toLocaleString()} (improving!)
Stack Overflow Visits: ${content.stats.stackOverflowVisits.toLocaleString()}
Dad Jokes Told: ∞
Kids Impressed: 0 (work in progress)`,
      color: COLORS.BLUE,
      pause: 2000
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: './dad-joke --random --format=fancy',
      typingDuration: 2000,
      pause: 500
    },
    {
      type: 'output',
      content: (() => {
        // Strip emojis from joke text for consistent box alignment
        const cleanQ = content.joke.q.replace(/[^\x00-\x7F]/g, '');
        const cleanA = content.joke.a.replace(/[^\x00-\x7F]/g, '');
        const { createAsciiBox } = require('./box-generator');
        return createAsciiBox({
          style: 'double',
          width: 56,
          lines: [
            '',
            `DAD JOKE OF THE DAY - ${content.timestamp.slice(4, 16)}`,
            `Category: ${(content.joke.category || 'classic').toUpperCase()}`,
            '',
            `Q: ${cleanQ}`,
            '',
            `A: ${cleanA}`,
            '',
            'Stats:',
            `- Groan Level: ████████░░ ${80 + (content.rotation * 7)}%`,
            `- Times Delivered: ${(10000 + content.stats.daysAlive % 40000).toLocaleString()}`,
            `- Success Rate: ${95 + (content.rotation * 2)}% eye rolls`,
            ''
          ],
          separatorAfter: [2, 7]
        });
      })(),
      color: COLORS.PINK,
      pause: 2000
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'fortune | cowsay -f tux | lolcat',
      typingDuration: 2200,
      pause: 500
    },
    {
      type: 'output',
      content: ` _________________________________________
/ Pro Tip:                                \\
|                                         |
| "There are only two hard things in     |
| Computer Science: cache invalidation,  |
| naming things, and off-by-one errors." |
\\                                        /
 -----------------------------------------
   \\
    \\
        .--.
       |o_o |
       |:_/ |
      //   \\ \\
     (|     | )
    /'\\_   _/\`\\
    \\___)=(___/`,
      color: COLORS.PURPLE,
      pause: 1500  // Optimized: 2200ms → 1500ms (save 0.7s)
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'systemctl status dad-mode.service',
      typingDuration: 2400,
      pause: 500
    },
    {
      type: 'output',
      content: `● dad-mode.service - Professional Dad Joke Delivery
     Loaded: loaded (/etc/systemd/dad-mode.service; enabled)
     Active: ✓ active (running) since birth
   Main PID: 1337 (dad-joked)
      Tasks: ∞
     Memory: 42.0M (worth it)
     CGroup: /system.slice/dad-mode.service
             └─1337 /usr/sbin/dad-joked --quality=premium

${content.timestamp} dad-mode[1337]: ✓ Joke delivery successful
${content.timestamp} dad-mode[1337]: ✓ Maximum groan achieved`,
      color: COLORS.WHITE,
      pause: 2000
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'cat /etc/goodbye.txt',
      typingDuration: 1600,
      pause: 500
    },
    {
      type: 'output',
      content: createDoubleBox([
        '',
        'Thanks for visiting!',
        '',
        'May your:',
        '  - Code compile without warnings',
        '  - Tests pass on first try',
        '  - Bugs be easily reproducible',
        '  - Coffee stay hot',
        '  - Git conflicts be minimal',
        '',
        'See you in the commits!',
        ''
      ]),
      color: COLORS.GREEN,
      pause: 1800
    }
    ];
  }

  // Add rotation-specific sequences based on day
  let rotationSequences = [];
  switch(content.rotation) {
    case 0:
      // Day 0: Core + Easter Egg (telnet Star Wars)
      rotationSequences = buildEasterEggSequences(content);
      break;
    case 1:
      // Day 1: DevOps rotation (git log, docker, sudo)
      rotationSequences = buildDevOpsSequences(content);
      break;
    case 2:
      // Day 2: Network rotation (ping, curl, top)
      rotationSequences = buildNetworkSequences(content);
      break;
  }

  // Combine sequences: core start + rotation + core end
  // Split core into start (all except goodbye) and end (goodbye command + output)
  const coreStart = coreSequences.slice(0, -2); // All except goodbye (2 items)
  const coreEnd = coreSequences.slice(-2); // Goodbye command + output

  const sequences = [...coreStart, ...rotationSequences, ...coreEnd];

  // Validate total animation duration (target: comfortable reading)
  const calculateAnimationDuration = (sequences) => {
    let totalDuration = 0;
    sequences.forEach(seq => {
      if (seq.type === 'command') {
        totalDuration += (seq.typingDuration || 0) + (seq.pause || 0) + (seq.delay || 0);
      } else if (seq.type === 'output') {
        totalDuration += (seq.pause || 0);
      }
    });
    return totalDuration / 1000; // Convert to seconds
  };

  const animationDuration = calculateAnimationDuration(sequences);
  console.log(`⏱️  Total animation duration: ${animationDuration.toFixed(1)}s (target: <${ANIMATION.MAX_DURATION_SECONDS}s)`);
  console.log(`📦 Total sequences: ${sequences.length} (${coreStart.length} core + ${rotationSequences.length} rotation + ${coreEnd.length} ending)`);

  if (animationDuration > ANIMATION.MAX_DURATION_SECONDS) {
    console.warn(`⚠️  WARNING: Animation duration (${animationDuration.toFixed(1)}s) exceeds ${ANIMATION.MAX_DURATION_SECONDS}s target!`);
  }

  // Generate SVG
  console.log('🎨 Generating terminal SVG with dynamic content...');
  const generator = new AdvancedTerminalGenerator();

  // Customize terminal config for better aesthetics
  generator.config.window.width = WINDOW.WIDTH;
  generator.config.window.height = WINDOW.HEIGHT;
  generator.config.window.backgroundColor = COLORS.BACKGROUND;
  generator.config.window.borderRadius = WINDOW.BORDER_RADIUS;
  generator.config.window.titleBar.title = WINDOW.TITLE;
  generator.config.window.titleBar.height = 40;
  generator.config.window.titleBar.backgroundColor = COLORS.TITLE_BAR_BG;
  generator.config.terminal.fontSize = 14;
  generator.config.terminal.lineHeight = 1.8;
  generator.config.terminal.backgroundColor = COLORS.BACKGROUND;
  generator.config.terminal.promptColor = COLORS.NEON_GREEN;
  generator.config.terminal.cursorColor = COLORS.MATRIX_GREEN;

  const svgContent = generator.generateTerminal(sequences);

  // Write to file with error handling
  const outputPath = path.join(process.cwd(), 'src', 'terminal.svg');
  const outputDir = path.dirname(outputPath);

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await fs.promises.writeFile(outputPath, svgContent, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write SVG to ${outputPath}: ${error.message}`);
  }

  console.log('✅ Dynamic terminal SVG generated successfully!');
  console.log(`📍 Output: ${outputPath}`);
  console.log(`📊 Sequences: ${sequences.length}`);
  console.log(`⏱️  Animation features:`);
  console.log('   - Real-time accurate timestamps');
  console.log('   - Daily national/fun day display');
  console.log('   - Daily rotating tech jokes');
  console.log('   - Dynamic statistics');
  console.log('   - Smooth animations and scrolling');

  return { success: true, joke: content.joke, timestamp: content.timestamp };
}

// Run if called directly
if (require.main === module) {
  generateDynamicTerminal()
    .then(result => {
      console.log('\n🎉 Generation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = generateDynamicTerminal;
