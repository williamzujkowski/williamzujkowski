/**
 * Constants Module
 * Centralized configuration values for the terminal SVG generator
 *
 * This module eliminates magic numbers and provides self-documenting code.
 * All timing, color, and configuration values are defined here.
 */

// ============================================================================
// TERMINAL PROMPT
// ============================================================================

/**
 * Default terminal prompt string
 * Used throughout all command sequences
 */
const DEFAULT_PROMPT = 'william@dad-joke-hq:~$ ';

// ============================================================================
// COLOR PALETTE (Dracula Theme)
// ============================================================================

/**
 * Dracula-inspired color palette for terminal output
 * See: https://draculatheme.com/
 */
const COLORS = {
  // Primary colors
  YELLOW: '#f1fa8c',      // Git commits, warnings
  CYAN: '#8be9fd',        // Docker, network output
  GREEN: '#50fa7b',       // Success messages, confirmations
  PINK: '#ff79c6',        // Jokes, special content
  PURPLE: '#bd93f9',      // ASCII art, decorative
  WHITE: '#ffffff',       // Default text, process lists
  ORANGE: '#ffb86c',      // Easter eggs, highlights
  COMMENT: '#6272a4',     // Muted text, connection info

  // Extended colors
  BLUE: '#729fcf',        // Profile info, stats
  NEON_GREEN: '#00ff9f',  // Prompt color, MOTD
  MATRIX_GREEN: '#00ff41', // Cursor color

  // Background colors
  BACKGROUND: '#0a0e27',      // Terminal background
  TITLE_BAR_BG: '#151b2e'     // Title bar background
};

// ============================================================================
// TIMING VALUES (milliseconds)
// ============================================================================

/**
 * Typing duration presets
 * How long it takes to "type" a command
 */
const TYPING = {
  INSTANT: 400,       // Very short commands (date, whoami)
  FAST: 500,          // Short commands
  QUICK: 800,         // Simple commands (cat /etc/motd)
  MEDIUM: 1200,       // Medium commands
  STANDARD: 1400,     // Standard typing speed
  MODERATE: 1600,     // Longer commands
  SLOW: 1800,         // Complex commands
  EXTENDED: 2000,     // Long commands
  LONG: 2200,         // Very long commands
  EXTRA_LONG: 2400    // Extra long commands (docker ps)
};

/**
 * Pause duration presets
 * Time to wait after command/output
 */
const PAUSE = {
  MINIMAL: 300,       // Quick transitions
  SHORT: 400,         // Brief pause
  BRIEF: 500,         // Short pause
  QUICK: 600,         // Quick pause
  MEDIUM: 800,        // Medium pause
  STANDARD: 1000,     // Standard pause
  EXTENDED: 1200,     // Extended pause
  LONG: 1400,         // Long pause
  LONGER: 1500,       // Longer pause
  EXTRA: 1600,        // Extra pause
  DRAMATIC: 1800,     // Dramatic pause
  EMPHASIS: 2000,     // For emphasis
  SHOWCASE: 2800      // Showcase content
};

/**
 * Delay presets
 * Initial delay before sequence starts
 */
const DELAY = {
  NONE: 0,
  MINIMAL: 100,
  SHORT: 200,
  MEDIUM: 500
};

// ============================================================================
// WINDOW CONFIGURATION
// ============================================================================

/**
 * Terminal window configuration
 */
const WINDOW = {
  WIDTH: 1000,
  HEIGHT: 700,
  BORDER_RADIUS: 12,
  TITLE: '🚀 william@dad-joke-hq:~'
};

/**
 * Title bar configuration
 */
const TITLE_BAR = {
  HEIGHT: 40,
  BACKGROUND_COLOR: COLORS.TITLE_BAR_BG
};

/**
 * Terminal content configuration
 */
const TERMINAL = {
  FONT_SIZE: 14,
  LINE_HEIGHT: 1.8,
  PADDING: 12,              // Left/right padding (12px = typical terminal)
  PADDING_TOP: 8,           // Top padding below title bar
  BACKGROUND_COLOR: COLORS.BACKGROUND,
  PROMPT_COLOR: COLORS.NEON_GREEN,
  CURSOR_COLOR: COLORS.MATRIX_GREEN
};

// ============================================================================
// STATISTICS MULTIPLIERS
// ============================================================================

/**
 * Multipliers for generating dynamic statistics
 * Based on days alive since birth date
 */
const STATS_MULTIPLIERS = {
  COFFEE_PER_DAY: 2.1,          // Average cups per day
  BUGS_PER_DAY: 2.7,            // Bugs fixed per day
  SO_VISIT_MULTIPLIER: 1.5      // Stack Overflow visits per bug
};

// ============================================================================
// TIME CONSTANTS
// ============================================================================

/**
 * Time-related constants
 */
const TIME = {
  MS_PER_SECOND: 1000,
  MS_PER_MINUTE: 60000,
  MS_PER_HOUR: 3600000,
  MS_PER_DAY: 86400000
};

// ============================================================================
// ANIMATION TARGETS
// ============================================================================

/**
 * Animation timing targets
 */
const ANIMATION = {
  MAX_DURATION_SECONDS: 90,     // Target max animation length (comfortable reading)
  WARNING_THRESHOLD: 80         // Warn when approaching max
};

// ============================================================================
// READING SPEED CONFIGURATION
// ============================================================================

/**
 * Reading speed parameters for calculating pause durations
 * Based on typical technical content reading rates
 */
const READING = {
  CHARS_PER_SECOND: 14,         // ~175 WPM for technical content (comfortable)
  MIN_PAUSE_MS: 800,            // Minimum pause even for short content
  MAX_PAUSE_MS: 4500,           // Maximum pause for very long content
  BASE_PAUSE_MS: 300            // Base pause added to calculated time
};

/**
 * Calculate appropriate pause duration based on content length
 * @param {string} content - The text content to calculate reading time for
 * @returns {number} Pause duration in milliseconds
 */
function calculateReadingPause(content) {
  if (!content) return READING.MIN_PAUSE_MS;

  const charCount = content.replace(/\[\[.*?\]\]/g, '').length; // Strip markup
  const readingTimeMs = (charCount / READING.CHARS_PER_SECOND) * 1000;
  const totalPause = readingTimeMs + READING.BASE_PAUSE_MS;

  return Math.max(READING.MIN_PAUSE_MS, Math.min(READING.MAX_PAUSE_MS, totalPause));
}

// ============================================================================
// BOX DIMENSIONS
// ============================================================================

/**
 * ASCII box default dimensions
 */
const BOX = {
  DOUBLE_WIDTH: 56,             // Default width for double-line boxes
  ROUNDED_WIDTH: 48,            // Default width for rounded boxes
  JOKE_BOX_WIDTH: 58            // Width for joke display boxes
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Core
  DEFAULT_PROMPT,

  // Colors
  COLORS,

  // Timing
  TYPING,
  PAUSE,
  DELAY,
  TIME,

  // Configuration
  WINDOW,
  TITLE_BAR,
  TERMINAL,

  // Statistics
  STATS_MULTIPLIERS,

  // Animation
  ANIMATION,

  // Reading speed
  READING,
  calculateReadingPause,

  // Box dimensions
  BOX
};
