/**
 * Markup parser for [[style]] formatted text.
 * Converts template engine output to structured styled spans for SVG rendering.
 * @module markup-parser
 */

const { COLORS } = require('./constants');

/**
 * Represents a styled text span with color and style attributes.
 * @typedef {Object} StyledSpan
 * @property {string} text - The text content
 * @property {string|null} fg - Foreground color (hex)
 * @property {string|null} bg - Background color (hex)
 * @property {boolean} bold - Whether text is bold
 * @property {boolean} dim - Whether text is dimmed
 */

/**
 * Color name to hex value mapping.
 * Maps template color names to actual hex colors.
 */
const COLOR_MAP = {
  // Standard terminal colors
  black: '#21222c',
  red: '#ff5555',
  green: COLORS.GREEN,
  yellow: COLORS.YELLOW,
  blue: COLORS.BLUE,
  magenta: COLORS.PINK,
  cyan: COLORS.CYAN,
  white: COLORS.WHITE,

  // Bright variants
  bright_black: '#6272a4',
  bright_red: '#ff6e6e',
  bright_green: '#69ff94',
  bright_yellow: '#ffffa5',
  bright_blue: '#d6acff',
  bright_magenta: '#ff92df',
  bright_cyan: '#a4ffff',
  bright_white: '#ffffff',

  // Extended palette (from COLORS)
  purple: COLORS.PURPLE,
  pink: COLORS.PINK,
  orange: COLORS.ORANGE,
  comment: COLORS.COMMENT,
  neon_green: COLORS.NEON_GREEN,
  matrix_green: COLORS.MATRIX_GREEN
};

/**
 * Custom error for markup parsing failures.
 */
class MarkupParseError extends Error {
  constructor(message, position) {
    super(message);
    this.name = 'MarkupParseError';
    this.position = position;
  }
}

/**
 * Parse [[style]] markup into styled spans.
 * @param {string} text - Text with [[style]] markup
 * @returns {Array<StyledSpan>} Array of styled spans
 * @throws {MarkupParseError} If markup is malformed
 */
function parseMarkup(text) {
  if (!text || typeof text !== 'string') {
    return [{ text: '', fg: null, bg: null, bold: false, dim: false }];
  }

  // No markup - return as single span
  if (!text.includes('[[')) {
    return [{ text, fg: null, bg: null, bold: false, dim: false }];
  }

  const spans = [];
  let pos = 0;
  let currentStyle = { fg: null, bg: null, bold: false, dim: false };
  const styleStack = [];
  const openTags = []; // Track unclosed opening tags

  while (pos < text.length) {
    const openStart = text.indexOf('[[', pos);

    // No more markup - consume rest as plain text
    if (openStart === -1) {
      const remaining = text.slice(pos);
      if (remaining) {
        spans.push({ text: remaining, ...currentStyle });
      }
      break;
    }

    // Add text before markup
    if (openStart > pos) {
      spans.push({ text: text.slice(pos, openStart), ...currentStyle });
    }

    // Find closing brackets
    const openEnd = text.indexOf(']]', openStart);
    if (openEnd === -1) {
      throw new MarkupParseError('Unclosed markup tag brackets', openStart);
    }

    const tag = text.slice(openStart + 2, openEnd);
    pos = openEnd + 2;

    // Parse the tag
    if (tag.startsWith('/')) {
      // Closing tag
      const tagName = tag.slice(1);
      if (styleStack.length > 0) {
        const popped = styleStack.pop();
        currentStyle = { ...popped };
        openTags.pop();
      }
    } else {
      // Opening tag - track it
      openTags.push({ tag, position: openStart });
      styleStack.push({ ...currentStyle });

      if (tag === 'bold') {
        currentStyle.bold = true;
      } else if (tag === 'dim') {
        currentStyle.dim = true;
      } else if (tag.startsWith('fg:')) {
        const colorName = tag.slice(3);
        currentStyle.fg = resolveColor(colorName);
      } else if (tag.startsWith('bg:')) {
        const colorName = tag.slice(3);
        currentStyle.bg = resolveColor(colorName);
      }
    }
  }

  // Check for unclosed tags
  if (openTags.length > 0) {
    const firstUnclosed = openTags[0];
    throw new MarkupParseError(
      `Unclosed markup tag: [[${firstUnclosed.tag}]]`,
      firstUnclosed.position
    );
  }

  // Merge adjacent spans with identical styles
  return mergeSpans(spans);
}

/**
 * Resolve a color name to a hex value.
 * @param {string} colorName - Color name (e.g., 'green', 'cyan')
 * @returns {string} Hex color value
 */
function resolveColor(colorName) {
  // Check if it's already a hex color
  if (colorName.startsWith('#')) {
    return colorName;
  }

  // Look up in color map
  const color = COLOR_MAP[colorName.toLowerCase()];
  if (color) {
    return color;
  }

  // Try uppercase COLORS constant
  const upperName = colorName.toUpperCase();
  if (COLORS[upperName]) {
    return COLORS[upperName];
  }

  // Default to white if unknown
  return COLORS.WHITE;
}

/**
 * Merge adjacent spans with identical styles.
 * @param {Array<StyledSpan>} spans - Array of spans to merge
 * @returns {Array<StyledSpan>} Merged spans
 */
function mergeSpans(spans) {
  if (spans.length <= 1) return spans;

  const merged = [];
  let current = { ...spans[0] };

  for (let i = 1; i < spans.length; i++) {
    const next = spans[i];
    if (
      current.fg === next.fg &&
      current.bg === next.bg &&
      current.bold === next.bold &&
      current.dim === next.dim
    ) {
      current.text += next.text;
    } else {
      if (current.text) merged.push(current);
      current = { ...next };
    }
  }

  if (current.text) merged.push(current);
  return merged;
}

/**
 * Check if text contains markup.
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains [[]] markup
 */
function hasMarkup(text) {
  if (!text || typeof text !== 'string') return false;
  return text.includes('[[');
}

/**
 * Strip all markup and return plain text.
 * @param {string} text - Text with markup
 * @returns {string} Plain text without markup
 */
function stripMarkup(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\[\[[^\]]+\]\]/g, '');
}

/**
 * Get the display width of text (excluding markup).
 * @param {string} text - Text with possible markup
 * @returns {number} Display width in characters
 */
function getMarkupDisplayWidth(text) {
  return stripMarkup(text).length;
}

module.exports = {
  parseMarkup,
  resolveColor,
  hasMarkup,
  stripMarkup,
  getMarkupDisplayWidth,
  MarkupParseError,
  COLOR_MAP
};
