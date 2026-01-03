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
 * Rotating ping jokes - deterministic selection based on day
 */
const PING_JOKES = [
  {
    command: 'ping localhost --self-esteem',
    output: `PING localhost (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: You're doing great!
64 bytes from 127.0.0.1: That bug wasn't your fault
64 bytes from 127.0.0.1: Your code is beautiful
64 bytes from 127.0.0.1: You deserve that coffee ☕
64 bytes from 127.0.0.1: Imposter syndrome is lying

--- localhost affirmation statistics ---
5 compliments transmitted, 5 received, 0% self-doubt
mood-trip avg/max/current = good/great/caffeinated`,
    color: COLORS.GREEN
  },
  {
    command: 'ping sleep',
    output: `PING sleep (127.0.0.1): 56 data bytes
Request timeout for icmp_seq 0 (kid woke up)
Request timeout for icmp_seq 1 (had a nightmare)
Request timeout for icmp_seq 2 (needs water)
Request timeout for icmp_seq 3 (heard a noise)
Request timeout for icmp_seq 4 (just checking)

--- sleep statistics ---
5 packets transmitted, 0 received, 100% packet loss
average hours slept: 4.2 (target: 8.0)
dad-mode: ALWAYS ACTIVE`,
    color: COLORS.YELLOW
  },
  {
    command: 'ping production',
    output: `PING production (10.0.0.1): 56 data bytes
64 bytes: icmp_seq=0 time=2.001ms status=OK... probably
64 bytes: icmp_seq=1 time=2.003ms status=still OK... I think
64 bytes: icmp_seq=2 time=1.998ms status=wait what was that
64 bytes: icmp_seq=3 time=15023ms status=OH NO
64 bytes: icmp_seq=4 time=0.001ms status=nvm we're fine

--- production statistics ---
5 prayers transmitted, 4 answered, 20% anxiety
uptime: 99.9% (that 0.1% was at 3am Friday)`,
    color: COLORS.ORANGE
  },
  {
    command: 'ping work-life-balance',
    output: `PING work-life-balance (0.0.0.0): 56 data bytes
Request timeout for icmp_seq 0
Request timeout for icmp_seq 1
Request timeout for icmp_seq 2
Request timeout for icmp_seq 3
Request timeout for icmp_seq 4

--- work-life-balance statistics ---
5 packets transmitted, 0 received, 100% packet loss
error: destination unreachable (are you sure this exists?)
suggestion: try 'ping coffee' instead`,
    color: COLORS.PURPLE
  },
  {
    command: 'ping monday.motivation',
    output: `ping: cannot resolve monday.motivation: NXDOMAIN
ping: trying alternate DNS...
ping: monday.motivation: Name does not exist
ping: maybe try tuesday.motivation?

--- motivation lookup failed ---
error: motivation not found on Mondays
workaround: coffee && pretend_to_be_productive
hint: try again after 10am`,
    color: COLORS.COMMENT
  }
];

/**
 * Get ping joke for the day (deterministic rotation)
 * @param {Date} date - Current date
 * @returns {Object} Ping joke object with command, output, color
 */
function getPingJoke(date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return PING_JOKES[dayOfYear % PING_JOKES.length];
}

/**
 * Build Network sequence (Day 2 rotation)
 * Showcases rotating ping jokes, curl joke API, and top
 * @param {Object} content - Dynamic content from DynamicContentGenerator
 * @returns {Array<Object>} Terminal sequences for Network rotation
 */
function buildNetworkSequences(content) {
  const pingJoke = getPingJoke(content.currentTime);

  return [
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: pingJoke.command,
      typingDuration: 1400,
      pause: 300
    },
    {
      type: 'output',
      content: pingJoke.output,
      color: pingJoke.color,
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
