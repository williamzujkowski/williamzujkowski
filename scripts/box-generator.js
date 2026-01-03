/**
 * ASCII Box Generator
 * Utility for creating consistently-formatted ASCII boxes for terminal output
 *
 * Supports two styles:
 * - 'double': ╔═══╗ (formal, used for headers/important content)
 *             ║   ║
 *             ╚═══╝
 *
 * - 'rounded': ╭───╮ (casual, used for informational content)
 *              │   │
 *              ╰───╯
 */

const BOX_STYLES = {
  double: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║',
    separatorLeft: '╠',
    separatorRight: '╣'
  },
  rounded: {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
    separatorLeft: '├',
    separatorRight: '┤'
  }
};

/**
 * Calculate the display width of a string, accounting for emoji and special characters
 * Emojis typically display as 2 characters wide in monospace fonts
 * @param {string} str - Input string
 * @returns {number} Display width
 */
function getDisplayWidth(str) {
  if (!str) return 0;

  // Remove ANSI escape codes if present
  const cleaned = str.replace(/\x1b\[[0-9;]*m/g, '');

  // Count emoji (surrogate pairs and common emoji ranges)
  // This is a simplified approach - emojis are roughly 2 char widths
  let width = 0;
  const chars = [...cleaned]; // Handle surrogate pairs properly

  for (const char of chars) {
    const code = char.codePointAt(0);

    // Emoji ranges (simplified - covers most common cases)
    if (
      (code >= 0x1F300 && code <= 0x1F9FF) || // Misc Symbols, Emoticons, etc.
      (code >= 0x2600 && code <= 0x26FF) ||   // Misc Symbols
      (code >= 0x2700 && code <= 0x27BF) ||   // Dingbats
      (code >= 0x1F600 && code <= 0x1F64F) || // Emoticons
      (code >= 0x1F680 && code <= 0x1F6FF)    // Transport symbols
    ) {
      width += 2; // Emoji displays as 2 chars wide
    } else {
      width += 1;
    }
  }

  return width;
}

/**
 * Pad a string to a target display width
 * Accounts for emoji/special character widths
 * @param {string} str - String to pad
 * @param {number} targetWidth - Target display width
 * @param {string} [padChar=' '] - Character to use for padding
 * @returns {string} Padded string
 */
function padToWidth(str, targetWidth, padChar = ' ') {
  const currentWidth = getDisplayWidth(str);
  const padding = Math.max(0, targetWidth - currentWidth);
  return str + padChar.repeat(padding);
}

/**
 * Truncate a string to a maximum display width, adding ellipsis if needed
 * @param {string} str - String to truncate
 * @param {number} maxWidth - Maximum display width
 * @returns {string} Truncated string
 */
function truncateToWidth(str, maxWidth) {
  if (getDisplayWidth(str) <= maxWidth) {
    return str;
  }

  const chars = [...str];
  let width = 0;
  let result = '';

  for (const char of chars) {
    const charWidth = getDisplayWidth(char);
    if (width + charWidth + 3 > maxWidth) { // +3 for '...'
      return result + '...';
    }
    result += char;
    width += charWidth;
  }

  return result;
}

/**
 * Wrap text to fit within a maximum display width, breaking at word boundaries.
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width per line
 * @param {string} [indent=''] - Indentation for continuation lines
 * @returns {string[]} Array of wrapped lines
 */
function wrapText(text, maxWidth, indent = '') {
  if (!text || getDisplayWidth(text) <= maxWidth) {
    return [text || ''];
  }

  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';
  const indentWidth = getDisplayWidth(indent);

  for (const word of words) {
    const wordWidth = getDisplayWidth(word);
    const lineWidth = getDisplayWidth(currentLine);
    const effectiveMax = lines.length === 0 ? maxWidth : maxWidth - indentWidth;

    if (currentLine === '') {
      // First word on line - must include it even if too long
      if (wordWidth > effectiveMax && lines.length > 0) {
        // Word is too long, truncate it
        currentLine = indent + truncateToWidth(word, effectiveMax - 3);
      } else if (lines.length > 0) {
        currentLine = indent + word;
      } else {
        currentLine = word;
      }
    } else if (lineWidth + 1 + wordWidth <= effectiveMax) {
      // Word fits on current line
      currentLine += ' ' + word;
    } else {
      // Word doesn't fit, start new line
      lines.push(currentLine);
      currentLine = indent + word;
    }
  }

  // Don't forget the last line
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Creates an ASCII box with automatic padding and alignment
 *
 * @param {Object} config - Box configuration
 * @param {string} [config.style='double'] - Box style: 'double' or 'rounded'
 * @param {number} [config.width=56] - Total box width including borders
 * @param {string[]} config.lines - Content lines (will be auto-padded)
 * @param {number[]} [config.separatorAfter=[]] - Line indices after which to add separator
 * @param {boolean} [config.truncate=true] - Truncate lines that exceed width
 * @returns {string} Complete ASCII box as a single string
 */
function createAsciiBox(config) {
  const {
    style = 'double',
    width = 56,
    lines = [],
    separatorAfter = [],
    truncate = true
  } = config;

  const chars = BOX_STYLES[style];
  if (!chars) {
    throw new Error(`Unknown box style: ${style}. Use 'double' or 'rounded'.`);
  }

  // Inner width = total width - 2 borders - 2 padding spaces
  const innerWidth = width - 4;

  // Build the box
  const result = [];

  // Top border
  result.push(chars.topLeft + chars.horizontal.repeat(width - 2) + chars.topRight);

  // Content lines
  lines.forEach((line, index) => {
    let content = line;

    // Truncate if needed
    if (truncate && getDisplayWidth(content) > innerWidth) {
      content = truncateToWidth(content, innerWidth);
    }

    // Pad to inner width
    const paddedContent = padToWidth(content, innerWidth);

    // Add line with borders
    result.push(chars.vertical + ' ' + paddedContent + ' ' + chars.vertical);

    // Add separator if specified
    if (separatorAfter.includes(index)) {
      result.push(chars.separatorLeft + chars.horizontal.repeat(width - 2) + chars.separatorRight);
    }
  });

  // Bottom border
  result.push(chars.bottomLeft + chars.horizontal.repeat(width - 2) + chars.bottomRight);

  return result.join('\n');
}

/**
 * Creates a double-line ASCII box (╔═══╗ style)
 * Convenience wrapper for createAsciiBox
 *
 * @param {string[]} lines - Content lines
 * @param {number} [width=56] - Total box width
 * @param {Object} [options={}] - Additional options (separatorAfter, truncate)
 * @returns {string} Complete ASCII box
 *
 * @example
 * createDoubleBox([
 *   '',
 *   'WELCOME TO MY TERMINAL',
 *   'Powered by coffee and code',
 *   ''
 * ]);
 */
function createDoubleBox(lines, width = 56, options = {}) {
  return createAsciiBox({
    style: 'double',
    width,
    lines,
    ...options
  });
}

/**
 * Creates a rounded ASCII box (╭───╮ style)
 * Convenience wrapper for createAsciiBox
 *
 * @param {string[]} lines - Content lines
 * @param {number} [width=48] - Total box width
 * @param {Object} [options={}] - Additional options (separatorAfter, truncate)
 * @returns {string} Complete ASCII box
 *
 * @example
 * createRoundedBox([
 *   '🎉 Today is National Coffee Day',
 *   '  "Fuel for developers everywhere"'
 * ]);
 */
function createRoundedBox(lines, width = 48, options = {}) {
  return createAsciiBox({
    style: 'rounded',
    width,
    lines,
    ...options
  });
}

/**
 * Creates a double-line box with title and content sections
 *
 * @param {Object} config - Configuration
 * @param {string} config.title - Title text
 * @param {string[]} config.content - Content lines
 * @param {number} [config.width=56] - Total box width
 * @param {string} [config.subtitle] - Optional subtitle after title
 * @returns {string} Complete ASCII box with title section
 *
 * @example
 * createTitledBox({
 *   title: 'DAD JOKE OF THE DAY',
 *   subtitle: 'Category: CLASSIC',
 *   content: [
 *     '',
 *     'Q: Why do programmers hate nature?',
 *     '',
 *     'A: Too many bugs!',
 *     ''
 *   ]
 * });
 */
function createTitledBox(config) {
  const {
    title,
    subtitle,
    content = [],
    width = 56
  } = config;

  const lines = [
    '',
    title
  ];

  if (subtitle) {
    lines.push(subtitle);
  }

  const separatorIndex = lines.length - 1;

  lines.push(...content);

  return createDoubleBox(lines, width, {
    separatorAfter: [separatorIndex]
  });
}

module.exports = {
  createAsciiBox,
  createDoubleBox,
  createRoundedBox,
  createTitledBox,
  getDisplayWidth,
  padToWidth,
  truncateToWidth,
  wrapText,
  BOX_STYLES
};
