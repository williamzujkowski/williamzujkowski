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
      content: 'date',
      typingDuration: 400,
      pause: 300,
      delay: 100
    },
    {
      type: 'output',
      content: content.timestamp,
      color: '#87d75f',
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
      content: './dad-joke --random',
      typingDuration: 1400,
      pause: 500
    },
    {
      type: 'output',
      content: `┌─────────────────────────────────────────────────┐
│  🎯 DAD JOKE OF THE DAY                         │
│  Generated: ${content.timestamp.slice(4, 16)}                │
└─────────────────────────────────────────────────┘

Q: ${content.joke.q}

A: ${content.joke.a}

[ Groan Level: ████████░░ 80% ]
[ Delivered: ${Math.floor(Math.random() * 50000 + 10000).toLocaleString()} times ]`,
      color: '#87d75f',
      pause: 2500
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'fortune | cowsay -f tux',
      typingDuration: 1800,
      pause: 500
    },
    {
      type: 'output',
      content: ` ________________________________________
/ "The best thing about a Boolean is    \\
| even if you are wrong, you are only   |
\\ off by a bit."                        /
 ----------------------------------------
   \\
    \\
        .--.\n       |o_o |
       |:_/ |
      //   \\ \\
     (|     | )
    /'\\_   _/\`\\
    \\___)=(___/`,
      color: '#ffff00',
      pause: 2000
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
      content: 'echo "Thanks for visiting! May your code compile and your tests pass! 🚀"',
      typingDuration: 3000,
      pause: 500
    },
    {
      type: 'output',
      content: 'Thanks for visiting! May your code compile and your tests pass! 🚀',
      color: '#87d75f',
      pause: 2000
    }
  ];

  // Generate SVG
  console.log('🎨 Generating terminal SVG with dynamic content...');
  const generator = new AdvancedTerminalGenerator();

  // Customize terminal config for better aesthetics
  generator.config.window.width = 900;
  generator.config.window.height = 650;
  generator.config.window.titleBar.title = 'william@dad-joke-hq:~';
  generator.config.terminal.fontSize = 15;
  generator.config.terminal.lineHeight = 1.5;

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
