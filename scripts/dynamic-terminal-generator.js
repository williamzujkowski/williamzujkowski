#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdvancedTerminalGenerator = require('./advanced-terminal-generator');
const DynamicContentGenerator = require('./dynamic-content');

/**
 * Build DevOps sequence (Day 1 rotation)
 * Showcases git log, docker ps, and sudo sandwich joke
 */
function buildDevOpsSequences(content) {
  const gitCommits = content.gitLog.map(c =>
    `${c.hash} ${c.msg} (${c.time})`
  ).join('\n');

  const dockerRows = content.dockerContainers.map(c =>
    `${c.id}  ${c.image.padEnd(20)}  ${c.status.padEnd(15)}  ${c.ports}`
  ).join('\n');

  return [
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'git log --oneline -5',
      typingDuration: 1400,
      pause: 400
    },
    {
      type: 'output',
      content: gitCommits,
      color: '#f1fa8c',
      pause: 1800
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'docker ps --format "table {{.ID}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"',
      typingDuration: 2400,
      pause: 500
    },
    {
      type: 'output',
      content: `CONTAINER ID  IMAGE                 STATUS           PORTS
${dockerRows}`,
      color: '#8be9fd',
      pause: 2000
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'sudo make me a sandwich',
      typingDuration: 1600,
      pause: 400
    },
    {
      type: 'output',
      content: `[sudo] password for william:
Making sandwich...
🥪 Sandwich created successfully!
Ingredients: dad-jokes, coffee, code
Quality: Premium (as always)`,
      color: '#50fa7b',
      pause: 1800
    }
  ];
}

/**
 * Build Network sequence (Day 2 rotation)
 * Showcases ping, curl joke API, and top
 */
function buildNetworkSequences(content) {
  const stats = content.networkStats;

  return [
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'ping -c 5 github.com',
      typingDuration: 1400,
      pause: 400
    },
    {
      type: 'output',
      content: `PING github.com (140.82.113.4): 56 data bytes
64 bytes from 140.82.113.4: icmp_seq=0 ttl=52 time=${stats.min_ms} ms
64 bytes from 140.82.113.4: icmp_seq=1 ttl=52 time=${stats.avg_ms} ms
64 bytes from 140.82.113.4: icmp_seq=2 ttl=52 time=${(parseFloat(stats.avg_ms) + 1.2).toFixed(3)} ms
64 bytes from 140.82.113.4: icmp_seq=3 ttl=52 time=${(parseFloat(stats.avg_ms) - 0.8).toFixed(3)} ms
64 bytes from 140.82.113.4: icmp_seq=4 ttl=52 time=${stats.max_ms} ms

--- github.com ping statistics ---
${stats.packets_sent} packets transmitted, ${stats.packets_received} packets received, ${stats.packet_loss}% packet loss
round-trip min/avg/max/stddev = ${stats.min_ms}/${stats.avg_ms}/${stats.max_ms}/${stats.mdev_ms} ms`,
      color: '#8be9fd',
      pause: 2000
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'curl -s https://icanhazdadjoke.com/ | head -1',
      typingDuration: 2200,
      pause: 500
    },
    {
      type: 'output',
      content: `${content.joke.q}
${content.joke.a}`,
      color: '#ff79c6',
      pause: 1600
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'top -bn1 | head -8',
      typingDuration: 1600,
      pause: 400
    },
    {
      type: 'output',
      content: `top - ${content.timestamp.slice(11, 16)} up ${content.stats.uptime} years, load avg: 0.42, 0.37, 0.31
Tasks: 342 total,   2 running, 340 sleeping
%Cpu(s): 15.2 us,  3.7 sy,  0.0 ni, 80.1 id,  0.5 wa
MiB Mem : 32768.0 total, 16384.2 free,  8192.5 used,  8191.3 buff/cache

  PID USER      PR  NI    VIRT    RES  %CPU %MEM     TIME+ COMMAND
 1337 william   20   0  999999  42000  99.9  5.0   ∞:∞.∞ dad-joked
 2048 william   20   0  888888  32000  42.0  3.7   ∞:∞.∞ family`,
      color: '#ffffff',
      pause: 2000
    }
  ];
}

/**
 * Build Easter Egg sequence (Day 0 rotation)
 * Features telnet towel.blinkenlights.nl (Star Wars ASCII)
 */
function buildEasterEggSequences(content) {
  return [
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'telnet towel.blinkenlights.nl',
      typingDuration: 2000,
      pause: 600
    },
    {
      type: 'output',
      content: `Trying 176.9.53.173...
Connected to towel.blinkenlights.nl.
Escape character is '^]'.`,
      color: '#6272a4',
      pause: 800
    },
    {
      type: 'output',
      content: `
                    .-.
                   /   \\
          .-.     | SW |
         /   \\    |____|-.
    .===|  S  |===|       |===================.
     .-|  T  |-.  | A New |  ________________ \\
    ( (|  A  | )  | Hope |  \\XXXXXXXXXXXXXXX| )
     \`-|  R  |-'  |_______|  \`\"""\"\"\"\"\"\"\"\"\"\"\"\`-'
         \\___/

    "May the Source be with you!" - Obi-Wan Kerneli

Connection closed by foreign host.`,
      color: '#ffb86c',
      pause: 2800
    },
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
      content: 'echo "Easter egg found! 🥚"',
      typingDuration: 1800,
      pause: 400
    },
    {
      type: 'output',
      content: 'Easter egg found! 🥚',
      color: '#50fa7b',
      pause: 1400
    }
  ];
}

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

  // Build core sequences (common to all rotations)
  const coreSequences = [
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
║                                                        ║
║  WILLIAM'S DEV TERMINAL v${new Date().getFullYear()}.${(new Date().getMonth() + 1).toString().padStart(2, '0')}${' '.repeat(23)}║
║  Powered by coffee, dad jokes & late-night debugging${' '.repeat(3)}║
╚════════════════════════════════════════════════════════╝`,
      color: '#00ff9f',
      pause: 1200
    },
    // National Day sequence - shows fun/awareness day for today
    {
      type: 'command',
      prompt: 'william@dad-joke-hq:~$ ',
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
        return `╭────────────────────────────────────────────────╮
│ ${day.emoji} Today is ${name.padEnd(35)}│
│   "${desc}"${' '.repeat(Math.max(0, 38 - desc.length))}│
╰────────────────────────────────────────────────╯`;
      })(),
      color: '#f1fa8c',
      pause: 1000
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
║                                                        ║
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
║  ${('- Groan Level: ████████░░ ' + (Math.floor(Math.random() * 20 + 80) + '%')).padEnd(52)}  ║
║  ${('- Times Delivered: ' + Math.floor(Math.random() * 50000 + 10000).toLocaleString()).padEnd(52)}  ║
║  ${('- Success Rate: ' + (Math.floor(Math.random() * 5 + 95) + '% eye rolls')).padEnd(52)}  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝`,
      color: '#ff79c6',
      pause: 2000  // Optimized: 3000ms → 2000ms (save 1s)
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
      pause: 1500  // Optimized: 2200ms → 1500ms (save 0.7s)
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
      pause: 1800  // Optimized: 2500ms → 1800ms (save 0.7s)
    }
  ];

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
  // Split core into start (first 11 items) and end (last item - goodbye)
  const coreStart = coreSequences.slice(0, -1); // All except goodbye
  const coreEnd = coreSequences.slice(-1); // Just goodbye

  const sequences = [...coreStart, ...rotationSequences, ...coreEnd];

  // Validate total animation duration (target: under 50s)
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
  console.log(`⏱️  Total animation duration: ${animationDuration.toFixed(1)}s (target: <50s)`);
  console.log(`📦 Total sequences: ${sequences.length} (${coreStart.length} core + ${rotationSequences.length} rotation + ${coreEnd.length} ending)`);

  if (animationDuration > 50) {
    console.warn(`⚠️  WARNING: Animation duration (${animationDuration.toFixed(1)}s) exceeds 50s target!`);
  }

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
  generator.config.terminal.lineHeight = 1.8;
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
