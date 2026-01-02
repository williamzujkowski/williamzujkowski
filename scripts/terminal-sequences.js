/**
 * Terminal sequence builders for rotation-based content display.
 * Extracted from dynamic-terminal-generator.js per coding standards (≤400 lines).
 * @module terminal-sequences
 */

const { DEFAULT_PROMPT, COLORS } = require('./constants');

/**
 * Build DevOps sequence (Day 1 rotation)
 * Showcases git log, docker ps, and sudo sandwich joke
 * @param {Object} content - Dynamic content from DynamicContentGenerator
 * @returns {Array<Object>} Terminal sequences for DevOps rotation
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
      prompt: DEFAULT_PROMPT,
      content: 'git log --oneline -5',
      typingDuration: 1400,
      pause: 400
    },
    {
      type: 'output',
      content: gitCommits,
      color: COLORS.YELLOW,
      pause: 1800
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'docker ps --format "table {{.ID}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"',
      typingDuration: 2400,
      pause: 500
    },
    {
      type: 'output',
      content: `CONTAINER ID  IMAGE                 STATUS           PORTS
${dockerRows}`,
      color: COLORS.CYAN,
      pause: 2000
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
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
      color: COLORS.GREEN,
      pause: 1800
    }
  ];
}

/**
 * Build Network sequence (Day 2 rotation)
 * Showcases ping, curl joke API, and top
 * @param {Object} content - Dynamic content from DynamicContentGenerator
 * @returns {Array<Object>} Terminal sequences for Network rotation
 */
function buildNetworkSequences(content) {
  const stats = content.networkStats;

  return [
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
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
      color: COLORS.CYAN,
      pause: 2000
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'curl -s https://icanhazdadjoke.com/ | head -1',
      typingDuration: 2200,
      pause: 500
    },
    {
      type: 'output',
      content: `${content.joke.q}
${content.joke.a}`,
      color: COLORS.PINK,
      pause: 1600
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
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
      color: COLORS.WHITE,
      pause: 2000
    }
  ];
}

/**
 * Build Easter Egg sequence (Day 0 rotation)
 * Features telnet towel.blinkenlights.nl (Star Wars ASCII)
 * @param {Object} content - Dynamic content from DynamicContentGenerator
 * @returns {Array<Object>} Terminal sequences for Easter Egg rotation
 */
function buildEasterEggSequences(content) {
  return [
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'telnet towel.blinkenlights.nl',
      typingDuration: 2000,
      pause: 600
    },
    {
      type: 'output',
      content: `Trying 176.9.53.173...
Connected to towel.blinkenlights.nl.
Escape character is '^]'.`,
      color: COLORS.COMMENT,
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
      color: COLORS.ORANGE,
      pause: 2800
    },
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'echo "Easter egg found! 🥚"',
      typingDuration: 1800,
      pause: 400
    },
    {
      type: 'output',
      content: 'Easter egg found! 🥚',
      color: COLORS.GREEN,
      pause: 1400
    }
  ];
}

module.exports = {
  buildDevOpsSequences,
  buildNetworkSequences,
  buildEasterEggSequences
};
