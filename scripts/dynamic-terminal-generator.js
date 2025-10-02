#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdvancedTerminalGenerator = require('./advanced-terminal-generator');
const DynamicContentGenerator = require('./dynamic-content');

/**
 * Generate dynamic terminal sequences based on current date/time and jokes
 */
async function generateDynamicTerminal() {
  console.log('🚀 Starting dynamic terminal generation...');

  // Get dynamic content
  const contentGen = new DynamicContentGenerator();
  const content = await contentGen.generateContent();

  console.log(`📅 Current time: ${content.timestamp}`);
  console.log(`😄 Today's joke: ${content.joke.q}`);

  // Build terminal sequences with dynamic content
  const sequences = [
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'cat /etc/motd',
      typingDuration: 800,
      pause: 400,
      delay: 100
    },
    {
      type: 'output',
      content: `╔════════════════════════════════════════════════════════╗
║  WILLIAM'S DEV TERMINAL v${new Date().getFullYear()}.${(new Date().getMonth() + 1).toString().padStart(2, '0')}${' '.repeat(23)}║
║  Powered by coffee, dad jokes & late-night debugging  ║
╚════════════════════════════════════════════════════════╝`,
      color: '#00ff9f',
      pause: 1200
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'date',
      typingDuration: 400,
      pause: 300
    },
    {
      type: 'output',
      content: `📅 ${content.timestamp}`,
      color: '#50fa7b',
      pause: 800
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'whoami',
      typingDuration: 500,
      pause: 300
    },
    {
      type: 'output',
      content: 'william',
      color: '#ffffff',
      pause: 600
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
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
      color: '#729fcf',
      pause: 1500
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
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
      color: '#ffffff',
      pause: 1800
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
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
      color: '#729fcf',
      pause: 2000
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: './dad-joke --random --format=fancy',
      typingDuration: 2000,
      pause: 500
    },
    {
      type: 'output',
      content: `╔════════════════════════════════════════════════════════╗
║  DAD JOKE OF THE DAY - ${content.timestamp.slice(4, 16).padEnd(32)}║
║  Category: ${(content.joke.category || 'classic').toUpperCase().padEnd(44)}║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Q: ${content.joke.q.replace(/[^\x00-\x7F]/g, '').slice(0, 51).padEnd(51)}║
║                                                        ║
║  A: ${content.joke.a.replace(/[^\x00-\x7F]/g, '').slice(0, 51).padEnd(51)}║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║  Stats:                                                ║
║  - Groan Level: ████████░░ ${(Math.floor(Math.random() * 20 + 80) + '%').padEnd(22)}║
║  - Times Delivered: ${Math.floor(Math.random() * 50000 + 10000).toLocaleString().padEnd(35)}║
║  - Success Rate: ${(Math.floor(Math.random() * 5 + 95) + '% eye rolls').padEnd(38)}║
╚════════════════════════════════════════════════════════╝`,
      color: '#ff79c6',
      pause: 3000
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
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
        .--.\n       |o_o |
       |:_/ |
      //   \\ \\
     (|     | )
    /'\\_   _/\`\\
    \\___)=(___/`,
      color: '#bd93f9',
      pause: 2200
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
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
      color: '#ffffff',
      pause: 2000
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'cat /etc/goodbye.txt',
      typingDuration: 1600,
      pause: 500
    },
    {
      type: 'output',
      content: `╔════════════════════════════════════════════════════════╗
║                                                        ║
║  Thanks for visiting!                                  ║
║                                                        ║
║  May your:                                             ║
║    - Code compile without warnings                     ║
║    - Tests pass on first try                           ║
║    - Bugs be easily reproducible                       ║
║    - Coffee stay hot                                   ║
║    - Git conflicts be minimal                          ║
║                                                        ║
║  See you in the commits!                               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝`,
      color: '#50fa7b',
      pause: 2500
    }
  ];

  // Generate SVG
  console.log('🎨 Generating terminal SVG with dynamic content...');
  const generator = new AdvancedTerminalGenerator();

  // Customize terminal config for better aesthetics
  generator.config.window.width = 1000;  // Wider for better readability
  generator.config.window.height = 700;  // Taller for more content
  generator.config.window.backgroundColor = '#0a0e27';
  generator.config.window.borderRadius = 12;
  generator.config.window.titleBar.title = '🚀 william@dad-joke-hq:~';
  generator.config.window.titleBar.height = 40;
  generator.config.window.titleBar.backgroundColor = '#151b2e';
  generator.config.terminal.fontSize = 14;
  generator.config.terminal.lineHeight = 1.6;
  generator.config.terminal.backgroundColor = '#0a0e27';
  generator.config.terminal.promptColor = '#00ff9f';
  generator.config.terminal.cursorColor = '#00ff41';

  const svgContent = generator.generateTerminal(sequences);

  // Write to file
  const outputPath = path.join(process.cwd(), 'src', 'terminal.svg');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await fs.promises.writeFile(outputPath, svgContent, 'utf-8');

  console.log('✅ Dynamic terminal SVG generated successfully!');
  console.log(`📍 Output: ${outputPath}`);
  console.log(`📊 Sequences: ${sequences.length}`);
  console.log(`⏱️  Animation features:`);
  console.log('   - Real-time accurate timestamps');
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
