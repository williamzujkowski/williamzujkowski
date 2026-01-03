/**
 * Template-driven terminal sequence builder.
 * Uses Nunjucks templates to generate terminal content for SVG animation.
 * @module template-sequence-builder
 */

const { TerminalTemplateEngine } = require('./template-engine');
const { buildContext } = require('./template-context');
const { COLORS, DEFAULT_PROMPT, TYPING, PAUSE } = require('./constants');

/**
 * Build a command sequence with template-rendered output.
 * @param {Object} options - Sequence options
 * @param {string} options.command - Command to type
 * @param {string} options.templateName - Template file name
 * @param {Object} options.context - Template context
 * @param {string} [options.color] - Output color (default: WHITE)
 * @param {number} [options.typingDuration] - Typing duration in ms
 * @param {number} [options.pause] - Pause after output in ms
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Command and output sequences
 */
function buildTemplateSequence(options, engine) {
  const {
    command,
    templateName,
    context,
    color = COLORS.WHITE,
    typingDuration = TYPING.STANDARD,
    pause = PAUSE.SHORT
  } = options;

  const content = engine.render(templateName, context);

  return [
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: command,
      typingDuration,
      pause: PAUSE.MINIMAL
    },
    {
      type: 'output',
      content: content.trim(),
      color,
      pause
    }
  ];
}

/**
 * Build MOTD (Message of the Day) sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildMotdSequence(content, engine) {
  const date = content.currentTime;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return buildTemplateSequence({
    command: 'cat /etc/motd',
    templateName: 'blocks/motd.njk',
    context: { year, month },
    color: COLORS.NEON_GREEN,
    typingDuration: TYPING.QUICK,     // Match legacy: 800ms
    pause: PAUSE.EXTENDED             // Match legacy output: 1200ms
  }, engine);
}

/**
 * Build national day sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildNationalDaySequence(content, engine) {
  const day = content.nationalDay;
  const name = day.name.length > 32 ? day.name.substring(0, 29) + '...' : day.name;
  const desc = day.desc.length > 38 ? day.desc.substring(0, 35) + '...' : day.desc;

  return buildTemplateSequence({
    command: 'curl -s https://whatday.today/api | jq .today',
    templateName: 'blocks/national_day.njk',
    context: {
      day: { name, desc, emoji: day.emoji },
      date: content.timestamp.slice(0, 10)
    },
    color: COLORS.YELLOW,
    typingDuration: TYPING.MODERATE,   // Match legacy: 1600ms
    pause: PAUSE.STANDARD              // Match legacy: 1000ms
  }, engine);
}

/**
 * Build profile sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildProfileSequence(content, engine) {
  return buildTemplateSequence({
    command: 'cat /etc/profile',
    templateName: 'blocks/profile.njk',
    context: { stats: content.stats, timestamp: content.timestamp },
    color: COLORS.BLUE,
    typingDuration: TYPING.MEDIUM,     // Match legacy: 1200ms
    pause: PAUSE.LONGER                // Match legacy: 1500ms
  }, engine);
}

/**
 * Build process list sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildProcessesSequence(content, engine) {
  return buildTemplateSequence({
    command: 'ps aux | grep "life.*processes"',
    templateName: 'blocks/processes.njk',
    context: { timestamp: content.timestamp },
    color: COLORS.WHITE,
    typingDuration: TYPING.EXTENDED,   // Match legacy: 2000ms
    pause: PAUSE.DRAMATIC              // Match legacy: 1800ms
  }, engine);
}

/**
 * Build developer stats sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildStatsSequence(content, engine) {
  return buildTemplateSequence({
    command: 'cat /proc/developer/stats',
    templateName: 'blocks/stats.njk',
    context: { stats: content.stats },
    color: COLORS.BLUE,
    typingDuration: TYPING.SLOW,       // Match legacy: 1800ms
    pause: PAUSE.EMPHASIS              // Match legacy: 2000ms
  }, engine);
}

/**
 * Build neofetch-style system info sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildNeofetchSequence(content, engine) {
  const date = content.currentTime;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return buildTemplateSequence({
    command: 'neofetch --ascii_distro DadOS',
    templateName: 'blocks/neofetch.njk',
    context: {
      user: 'william',
      host: 'dev-machine',
      os: `DadOS ${year}.${month} LTS`,
      kernel: 'caffeine-6.1.0-dad',
      uptime: `${content.stats.uptime} years`,
      packages: '42 (npm), 1337 (brew)',
      shell: '/bin/dad-jokes',
      de: 'Coffee Desktop Environment',
      terminal: 'dad-term 3.14',
      coffee: content.stats.coffeeConsumed.toLocaleString(),
      bugs: content.stats.bugsFixed.toLocaleString(),
      commits: '∞'
    },
    color: COLORS.CYAN,
    typingDuration: TYPING.QUICK,        // Quick typing for snappy feel
    pause: PAUSE.MEDIUM                  // Brief pause before continuing
  }, engine);
}

/**
 * Build dad joke box sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildDadJokeSequence(content, engine) {
  return buildTemplateSequence({
    command: './dad-joke --random --format=fancy',
    templateName: 'blocks/dad_joke_box.njk',
    context: {
      joke: content.joke,
      timestamp: content.timestamp,
      rotation: content.rotation,
      stats: content.stats
    },
    color: COLORS.PINK,
    typingDuration: TYPING.EXTENDED,   // Match legacy: 2000ms
    pause: PAUSE.EMPHASIS              // Match legacy: 2000ms
  }, engine);
}

/**
 * Build fortune/cowsay sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildFortuneSequence(content, engine) {
  return buildTemplateSequence({
    command: 'fortune | cowsay -f tux | lolcat',
    templateName: 'blocks/fortune.njk',
    context: { fortune: content.fortune },
    color: COLORS.PURPLE,
    typingDuration: TYPING.LONG,       // Match legacy: 2200ms
    pause: PAUSE.LONGER                // Match legacy: 1500ms
  }, engine);
}

/**
 * Build systemctl status sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildSystemctlSequence(content, engine) {
  return buildTemplateSequence({
    command: 'systemctl status dad-mode.service',
    templateName: 'blocks/systemctl.njk',
    context: { timestamp: content.timestamp },
    color: COLORS.WHITE,
    typingDuration: TYPING.EXTRA_LONG, // Match legacy: 2400ms
    pause: PAUSE.EMPHASIS              // Match legacy: 2000ms
  }, engine);
}

/**
 * Build goodbye sequence.
 * @param {Object} content - Dynamic content from generator
 * @param {Object} engine - Template engine instance
 * @returns {Array<Object>} Terminal sequences
 */
function buildGoodbyeSequence(content, engine) {
  return buildTemplateSequence({
    command: 'cat /etc/goodbye.txt',
    templateName: 'blocks/goodbye.njk',
    context: {},
    color: COLORS.GREEN,
    typingDuration: TYPING.MODERATE,   // Match legacy: 1600ms
    pause: PAUSE.DRAMATIC              // Match legacy: 1800ms
  }, engine);
}

/**
 * Build all core template-based sequences.
 * Returns sequences in the order they should appear in terminal.
 * @param {Object} content - Dynamic content from DynamicContentGenerator
 * @returns {Array<Object>} Complete array of terminal sequences
 */
function buildTemplateSequences(content) {
  const engine = new TerminalTemplateEngine();

  const sequences = [
    // MOTD welcome banner
    ...buildMotdSequence(content, engine),

    // Neofetch-style system info (DadOS branding)
    ...buildNeofetchSequence(content, engine),

    // National day info
    ...buildNationalDaySequence(content, engine),

    // Date command (simple, not templated)
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'date',
      typingDuration: TYPING.INSTANT,  // Match legacy: 400ms
      pause: PAUSE.MINIMAL             // Match legacy: 300ms
    },
    {
      type: 'output',
      content: `${content.timestamp}`,
      color: COLORS.GREEN,
      pause: PAUSE.MEDIUM              // Match legacy: 800ms
    },

    // Whoami (simple)
    {
      type: 'command',
      prompt: DEFAULT_PROMPT,
      content: 'whoami',
      typingDuration: TYPING.FAST,     // Match legacy: 500ms
      pause: PAUSE.MINIMAL             // Match legacy: 300ms
    },
    {
      type: 'output',
      content: 'william',
      color: COLORS.WHITE,
      pause: PAUSE.QUICK               // Match legacy: 600ms
    },

    // Profile info
    ...buildProfileSequence(content, engine),

    // Process list
    ...buildProcessesSequence(content, engine),

    // Developer stats
    ...buildStatsSequence(content, engine),

    // Dad joke
    ...buildDadJokeSequence(content, engine),

    // Fortune
    ...buildFortuneSequence(content, engine),

    // Systemctl
    ...buildSystemctlSequence(content, engine),

    // Goodbye
    ...buildGoodbyeSequence(content, engine)
  ];

  return sequences;
}

module.exports = {
  buildTemplateSequence,
  buildMotdSequence,
  buildNationalDaySequence,
  buildProfileSequence,
  buildProcessesSequence,
  buildStatsSequence,
  buildNeofetchSequence,
  buildDadJokeSequence,
  buildFortuneSequence,
  buildSystemctlSequence,
  buildGoodbyeSequence,
  buildTemplateSequences
};
