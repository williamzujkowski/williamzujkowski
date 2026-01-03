/**
 * Nunjucks template engine for terminal content generation.
 * Provides Jinja2-compatible templating with custom filters for ASCII art.
 * @module template-engine
 */

const nunjucks = require('nunjucks');
const path = require('path');
const {
  createAsciiBox,
  createDoubleBox,
  createRoundedBox,
  createTitledBox,
  getDisplayWidth,
  padToWidth,
  truncateToWidth,
  wrapText,
  BOX_STYLES
} = require('./box-generator');
const { COLORS } = require('./constants');

/**
 * Custom error for template not found
 */
class TemplateNotFoundError extends Error {
  constructor(templateName) {
    super(`Template not found: ${templateName}`);
    this.name = 'TemplateNotFoundError';
  }
}

/**
 * Custom error for template rendering failures
 */
class TemplateRenderError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'TemplateRenderError';
    this.cause = cause;
  }
}

/**
 * Terminal template engine with ASCII art filters.
 */
class TerminalTemplateEngine {
  /**
   * Create a new template engine instance.
   * @param {string} [templateDir] - Path to templates directory
   */
  constructor(templateDir) {
    this.templateDir = templateDir || path.join(__dirname, '..', 'templates');
    this.env = this._createEnvironment();
    this._registerFilters();
    this._registerGlobals();
  }

  /**
   * Create Nunjucks environment with proper configuration.
   * @private
   * @returns {nunjucks.Environment}
   */
  _createEnvironment() {
    return new nunjucks.Environment(
      new nunjucks.FileSystemLoader(this.templateDir, {
        watch: false,
        noCache: process.env.NODE_ENV !== 'production'
      }),
      {
        trimBlocks: true,
        lstripBlocks: true,
        autoescape: false // Plain text output, not HTML
      }
    );
  }

  /**
   * Register custom filters for ASCII art and styling.
   * @private
   */
  _registerFilters() {
    // Box drawing filters
    this.env.addFilter('box', (content, style = 'double', width = 56) => {
      const lines = Array.isArray(content) ? content : content.split('\n');
      return createAsciiBox({ style, width, lines });
    });

    this.env.addFilter('doublebox', (content, width = 56) => {
      const lines = Array.isArray(content) ? content : content.split('\n');
      return createDoubleBox(lines, width);
    });

    this.env.addFilter('roundedbox', (content, width = 48) => {
      const lines = Array.isArray(content) ? content : content.split('\n');
      return createRoundedBox(lines, width);
    });

    this.env.addFilter('titledbox', (content, title, subtitle = null, width = 56) => {
      const lines = Array.isArray(content) ? content : content.split('\n');
      return createTitledBox({ title, subtitle, content: lines, width });
    });

    // Text manipulation filters
    this.env.addFilter('center', (text, width, fill = ' ') => {
      const textWidth = getDisplayWidth(text);
      if (textWidth >= width) return text;
      const leftPad = Math.floor((width - textWidth) / 2);
      const rightPad = width - textWidth - leftPad;
      return fill.repeat(leftPad) + text + fill.repeat(rightPad);
    });

    this.env.addFilter('pad', (text, width, align = 'left') => {
      if (align === 'right') {
        return text.padStart(width);
      } else if (align === 'center') {
        return this.env.getFilter('center')(text, width);
      }
      return padToWidth(text, width);
    });

    this.env.addFilter('truncate', (text, maxWidth) => {
      return truncateToWidth(text, maxWidth);
    });

    this.env.addFilter('wrap', (text, maxWidth, indent = '') => {
      return wrapText(text, maxWidth, indent);
    });

    this.env.addFilter('displaywidth', (text) => {
      return getDisplayWidth(text);
    });

    // Color markup filters (for future SVG integration)
    this.env.addFilter('fg', (text, color) => {
      return `[[fg:${color}]]${text}[[/fg]]`;
    });

    this.env.addFilter('bg', (text, color) => {
      return `[[bg:${color}]]${text}[[/bg]]`;
    });

    this.env.addFilter('bold', (text) => {
      return `[[bold]]${text}[[/bold]]`;
    });

    this.env.addFilter('dim', (text) => {
      return `[[dim]]${text}[[/dim]]`;
    });

    // Utility filters
    this.env.addFilter('repeat', (str, times) => {
      return str.repeat(times);
    });

    this.env.addFilter('json', (obj) => {
      return JSON.stringify(obj, null, 2);
    });

    // String slice filter (Python-style slice syntax)
    this.env.addFilter('slice', (str, start, end) => {
      if (typeof str !== 'string') return '';
      return str.slice(start, end);
    });
  }

  /**
   * Register global variables and functions.
   * @private
   */
  _registerGlobals() {
    this.env.addGlobal('BOX_STYLES', BOX_STYLES);
    this.env.addGlobal('COLORS', COLORS);
    this.env.addGlobal('now', () => new Date());
  }

  /**
   * Render a template by name.
   * @param {string} templateName - Template file name (relative to template dir)
   * @param {Object} context - Template context variables
   * @returns {string} Rendered template output
   * @throws {TemplateNotFoundError} If template file not found
   * @throws {TemplateRenderError} If rendering fails
   */
  render(templateName, context = {}) {
    try {
      return this.env.render(templateName, context);
    } catch (error) {
      if (error.message && error.message.includes('template not found')) {
        throw new TemplateNotFoundError(templateName);
      }
      throw new TemplateRenderError(`Failed to render ${templateName}: ${error.message}`, error);
    }
  }

  /**
   * Render a template from a string.
   * @param {string} templateString - Template content as string
   * @param {Object} context - Template context variables
   * @returns {string} Rendered template output
   * @throws {TemplateRenderError} If rendering fails
   */
  renderString(templateString, context = {}) {
    try {
      return this.env.renderString(templateString, context);
    } catch (error) {
      throw new TemplateRenderError(`Failed to render template string: ${error.message}`, error);
    }
  }

  /**
   * Get the Nunjucks environment for advanced usage.
   * @returns {nunjucks.Environment}
   */
  getEnvironment() {
    return this.env;
  }
}

module.exports = {
  TerminalTemplateEngine,
  TemplateNotFoundError,
  TemplateRenderError
};
