/**
 * Terminal line rendering utilities for SVG generation.
 * Handles command lines, output lines, and cursor animations.
 * Extracted from advanced-terminal-generator.js per coding standards (≤400 lines).
 * @module terminal-line-renderer
 */

/**
 * Escapes special XML characters to prevent SVG parsing errors.
 * @param {string} text - Text to escape
 * @returns {string} XML-safe escaped text
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Calculates approximate text width for monospace font.
 * @param {string} text - Text to measure
 * @param {number} fontSize - Font size in pixels
 * @returns {number} Approximate width in pixels
 */
function getTextWidth(text, fontSize) {
  return text.length * (fontSize * 0.6);
}

/**
 * Generates all terminal line elements from animation frames.
 * @param {Array<Object>} frames - Animation frames
 * @param {Object} terminal - Terminal configuration
 * @param {number} maxVisibleLines - Maximum visible lines
 * @param {number} lineHeight - Height of each line in pixels
 * @returns {string} SVG markup for all terminal lines
 */
function generateAllLines(frames, terminal, maxVisibleLines, lineHeight) {
  const processedLines = new Map();

  frames.forEach((frame) => {
    if (frame.type === 'add-command') {
      const y = frame.lineIndex * lineHeight;
      const lineContent = generateCommandLine(
        frame.lineIndex,
        y,
        frame.prompt,
        frame.command,
        frame.time,
        frame.typingDuration,
        terminal
      );
      processedLines.set(frame.lineIndex, lineContent);
    } else if (frame.type === 'add-output') {
      const y = frame.lineIndex * lineHeight;
      const lineContent = generateOutputLine(
        frame.lineIndex,
        y,
        frame.content,
        frame.color,
        frame.time,
        terminal
      );
      processedLines.set(frame.lineIndex, lineContent);
    }
  });

  return Array.from(processedLines.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([_, content]) => content)
    .join('\n');
}

/**
 * Generates a command line with typing animation.
 * @param {number} lineIndex - Line index in terminal buffer
 * @param {number} y - Y position in pixels
 * @param {string} prompt - Command prompt text
 * @param {string} command - Command text to type
 * @param {number} startTime - Animation start time in ms
 * @param {number} typingDuration - Total typing duration in ms
 * @param {Object} terminal - Terminal configuration
 * @returns {string} SVG markup for command line
 */
function generateCommandLine(lineIndex, y, prompt, command, startTime, typingDuration, terminal) {
  const promptWidth = getTextWidth(prompt, terminal.fontSize);
  const charDuration = command.length > 0 ? typingDuration / command.length : 0;

  return `
    <!-- Command line ${lineIndex} -->
    <g id="line-${lineIndex}" transform="translate(0, ${y})">
      <!-- Prompt appears immediately -->
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}"
            fill="${terminal.promptColor}" filter="url(#textGlow)" xml:space="preserve" opacity="0">
        ${escapeXml(prompt)}
        <animate attributeName="opacity" from="0" to="1"
                 begin="${startTime}ms" dur="10ms" fill="freeze"/>
      </text>

      <!-- Command with character-by-character typing -->
      <text x="${promptWidth}" font-family="${terminal.fontFamily}"
            font-size="${terminal.fontSize}" fill="${terminal.textColor}" filter="url(#textGlow)" xml:space="preserve">
        ${command.split('').map((char, i) => {
          const charStart = startTime + (i * charDuration);
          return `<tspan opacity="0">${escapeXml(char)}<animate attributeName="opacity"
                  from="0" to="1" begin="${charStart}ms" dur="10ms" fill="freeze"/></tspan>`;
        }).join('')}
      </text>

      <!-- Typing cursor -->
      ${generateCursor(prompt, command, startTime, typingDuration, terminal)}
    </g>`;
}

/**
 * Generates an output line with fade-in animation.
 * @param {number} lineIndex - Line index in terminal buffer
 * @param {number} y - Y position in pixels
 * @param {string} content - Output text content
 * @param {string} color - Text color
 * @param {number} startTime - Animation start time in ms
 * @param {Object} terminal - Terminal configuration
 * @returns {string} SVG markup for output line
 */
function generateOutputLine(lineIndex, y, content, color, startTime, terminal) {
  return `
    <!-- Output line ${lineIndex} -->
    <g id="line-${lineIndex}" transform="translate(0, ${y})" opacity="0">
      <animate attributeName="opacity" from="0" to="1"
               begin="${startTime}ms" dur="10ms" fill="freeze"/>

      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}"
            fill="${color}" filter="url(#textGlow)" xml:space="preserve">
        ${escapeXml(content)}
      </text>
    </g>`;
}

/**
 * Generates an animated blinking cursor that follows typing.
 * @param {string} prompt - Command prompt text
 * @param {string} command - Command being typed
 * @param {number} startTime - Animation start time in ms
 * @param {number} typingDuration - Total typing duration in ms
 * @param {Object} terminal - Terminal configuration
 * @returns {string} SVG markup for cursor animation
 */
function generateCursor(prompt, command, startTime, typingDuration, terminal) {
  const promptWidth = getTextWidth(prompt, terminal.fontSize);
  const charWidth = terminal.fontSize * 0.6;
  const cursorY = -terminal.fontSize * 0.85;
  const charDuration = typingDuration / command.length;
  const typingEndTime = startTime + typingDuration;

  return `
    <!-- Cursor -->
    <rect x="${promptWidth}" y="${cursorY}" width="${charWidth}" height="${terminal.fontSize}"
          fill="${terminal.cursorColor}" opacity="0">
      <!-- Show cursor when line appears -->
      <animate attributeName="opacity" from="0" to="1"
               begin="${startTime}ms" dur="10ms" fill="freeze"/>

      <!-- Blinking animation -->
      <animate attributeName="opacity" values="1;1;0;0" dur="1s"
               begin="${startTime}ms" end="${typingEndTime}ms" repeatCount="indefinite"/>

      <!-- Hide cursor after typing -->
      <animate attributeName="opacity" to="0"
               begin="${typingEndTime}ms" dur="10ms" fill="freeze"/>

      <!-- Cursor moves to next position AFTER character appears -->
      ${command.split('').map((char, idx) => {
        const charAppearTime = startTime + (idx * charDuration);
        const moveTime = charAppearTime + 10;
        const fromX = promptWidth + (idx * charWidth);
        const toX = promptWidth + ((idx + 1) * charWidth);
        return `<animate attributeName="x"
                 from="${fromX}" to="${toX}"
                 begin="${moveTime}ms" dur="1ms"
                 fill="freeze"/>`;
      }).join('')}
    </rect>`;
}

module.exports = {
  escapeXml,
  getTextWidth,
  generateAllLines,
  generateCommandLine,
  generateOutputLine,
  generateCursor
};
