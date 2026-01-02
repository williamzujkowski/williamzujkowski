/**
 * Template context builder for terminal content generation.
 * Assembles context data from various sources for template rendering.
 * @module template-context
 */

const { YamlContentLoader } = require('./content-loader');
const DynamicContentGenerator = require('./dynamic-content');

/**
 * Build template context from dynamic content.
 * @param {Object} content - Content from DynamicContentGenerator.generateContent()
 * @returns {Object} Template context with all variables
 */
function buildContext(content) {
  return {
    // User info
    user: 'william',
    host: 'dad-joke-hq',

    // Timing
    timestamp: content.timestamp,
    date: content.date,

    // Today's joke
    joke: {
      q: content.joke.q,
      a: content.joke.a,
      category: content.joke.category || 'classic'
    },

    // National day
    nationalDay: {
      name: content.nationalDay.name,
      desc: content.nationalDay.desc,
      emoji: content.nationalDay.emoji
    },

    // Stats
    stats: content.stats,

    // Rotation info
    rotation: content.rotation,
    rotationName: ['Core+Easter', 'DevOps', 'Network'][content.rotation],

    // Git log (if available)
    gitLog: content.gitLog || [],

    // Docker containers (if available)
    containers: content.containers || [],

    // Network stats (if available)
    network: content.network || {}
  };
}

/**
 * Build minimal context for testing templates.
 * @param {Object} overrides - Values to override defaults
 * @returns {Object} Test context
 */
function buildTestContext(overrides = {}) {
  const defaults = {
    user: 'testuser',
    host: 'testhost',
    timestamp: 'Thu Jan 1 12:00 EST 2026',
    date: new Date('2026-01-01T12:00:00'),
    joke: {
      q: 'Why did the programmer quit?',
      a: 'Because they did not get arrays!',
      category: 'classic'
    },
    nationalDay: {
      name: 'Public Domain Day',
      desc: 'Works entering the public domain',
      emoji: '📚'
    },
    stats: {
      uptime: 44,
      daysAlive: 16000,
      coffeeConsumed: 50000,
      bugsFixed: 10000,
      bugsCreated: 9999,
      stackOverflowVisits: 25000
    },
    rotation: 0,
    rotationName: 'Core+Easter',
    gitLog: [],
    containers: [],
    network: {}
  };

  return { ...defaults, ...overrides };
}

/**
 * Load context directly from YAML files and dynamic content.
 * @returns {Promise<Object>} Full template context
 */
async function loadFullContext() {
  const contentGen = new DynamicContentGenerator();
  const content = await contentGen.generateContent();
  return buildContext(content);
}

/**
 * Create context with YAML-sourced jokes.
 * Useful for templates that need YAML-based content.
 * @param {Object} baseContext - Base context from buildContext
 * @param {YamlContentLoader} loader - Content loader instance
 * @returns {Object} Context with YAML content
 */
function enrichWithYamlContent(baseContext, loader) {
  const yamlJoke = loader.getJokeByIndex(baseContext.date.getDay());
  const yamlNationalDay = loader.getTodaysNationalDay();

  return {
    ...baseContext,
    yamlJoke: yamlJoke || baseContext.joke,
    yamlNationalDay: yamlNationalDay || baseContext.nationalDay
  };
}

module.exports = {
  buildContext,
  buildTestContext,
  loadFullContext,
  enrichWithYamlContent
};
