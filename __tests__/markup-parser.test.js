/**
 * @fileoverview Tests for the markup parser module.
 * @module tests/markup-parser
 */

const {
  parseMarkup,
  resolveColor,
  hasMarkup,
  stripMarkup,
  getMarkupDisplayWidth,
  MarkupParseError,
  COLOR_MAP
} = require('../scripts/markup-parser');
const { COLORS } = require('../scripts/constants');

describe('MarkupParser', () => {
  describe('hasMarkup', () => {
    it('returns true for text with markup', () => {
      expect(hasMarkup('[[fg:green]]text[[/fg]]')).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(hasMarkup('plain text')).toBe(false);
    });

    it('returns false for null', () => {
      expect(hasMarkup(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(hasMarkup(undefined)).toBe(false);
    });

    it('returns false for non-string', () => {
      expect(hasMarkup(123)).toBe(false);
    });
  });

  describe('stripMarkup', () => {
    it('removes foreground color markup', () => {
      expect(stripMarkup('[[fg:green]]hello[[/fg]]')).toBe('hello');
    });

    it('removes bold markup', () => {
      expect(stripMarkup('[[bold]]world[[/bold]]')).toBe('world');
    });

    it('removes multiple markup tags', () => {
      expect(stripMarkup('[[fg:green]]hello[[/fg]] [[bold]]world[[/bold]]')).toBe('hello world');
    });

    it('handles nested markup', () => {
      expect(stripMarkup('[[bold]][[fg:red]]text[[/fg]][[/bold]]')).toBe('text');
    });

    it('returns empty string for null', () => {
      expect(stripMarkup(null)).toBe('');
    });

    it('returns plain text unchanged', () => {
      expect(stripMarkup('plain text')).toBe('plain text');
    });
  });

  describe('getMarkupDisplayWidth', () => {
    it('returns length excluding markup', () => {
      expect(getMarkupDisplayWidth('[[fg:green]]hello[[/fg]]')).toBe(5);
    });

    it('counts plain text correctly', () => {
      expect(getMarkupDisplayWidth('hello world')).toBe(11);
    });
  });

  describe('resolveColor', () => {
    it('resolves standard color names', () => {
      expect(resolveColor('green')).toBe(COLORS.GREEN);
      expect(resolveColor('cyan')).toBe(COLORS.CYAN);
      expect(resolveColor('yellow')).toBe(COLORS.YELLOW);
    });

    it('is case insensitive', () => {
      expect(resolveColor('GREEN')).toBe(COLORS.GREEN);
      expect(resolveColor('Green')).toBe(COLORS.GREEN);
    });

    it('returns hex colors unchanged', () => {
      expect(resolveColor('#ff0000')).toBe('#ff0000');
    });

    it('resolves bright variants', () => {
      expect(resolveColor('bright_green')).toBeTruthy();
      expect(resolveColor('bright_red')).toBeTruthy();
    });

    it('resolves extended colors', () => {
      expect(resolveColor('purple')).toBe(COLORS.PURPLE);
      expect(resolveColor('pink')).toBe(COLORS.PINK);
      expect(resolveColor('orange')).toBe(COLORS.ORANGE);
    });

    it('falls back to white for unknown colors', () => {
      expect(resolveColor('unknowncolor')).toBe(COLORS.WHITE);
    });
  });

  describe('parseMarkup', () => {
    it('returns single span for plain text', () => {
      const spans = parseMarkup('hello world');
      expect(spans).toHaveLength(1);
      expect(spans[0].text).toBe('hello world');
      expect(spans[0].fg).toBeNull();
      expect(spans[0].bold).toBe(false);
    });

    it('parses foreground color', () => {
      const spans = parseMarkup('[[fg:green]]hello[[/fg]]');
      expect(spans).toHaveLength(1);
      expect(spans[0].text).toBe('hello');
      expect(spans[0].fg).toBe(COLORS.GREEN);
    });

    it('parses background color', () => {
      const spans = parseMarkup('[[bg:blue]]hello[[/bg]]');
      expect(spans).toHaveLength(1);
      expect(spans[0].text).toBe('hello');
      expect(spans[0].bg).toBe(COLORS.BLUE);
    });

    it('parses bold', () => {
      const spans = parseMarkup('[[bold]]hello[[/bold]]');
      expect(spans).toHaveLength(1);
      expect(spans[0].text).toBe('hello');
      expect(spans[0].bold).toBe(true);
    });

    it('parses dim', () => {
      const spans = parseMarkup('[[dim]]hello[[/dim]]');
      expect(spans).toHaveLength(1);
      expect(spans[0].text).toBe('hello');
      expect(spans[0].dim).toBe(true);
    });

    it('handles mixed styled and plain text', () => {
      const spans = parseMarkup('hello [[fg:green]]world[[/fg]]!');
      expect(spans).toHaveLength(3);
      expect(spans[0].text).toBe('hello ');
      expect(spans[0].fg).toBeNull();
      expect(spans[1].text).toBe('world');
      expect(spans[1].fg).toBe(COLORS.GREEN);
      expect(spans[2].text).toBe('!');
      expect(spans[2].fg).toBeNull();
    });

    it('handles nested styles', () => {
      const spans = parseMarkup('[[bold]][[fg:red]]text[[/fg]][[/bold]]');
      expect(spans).toHaveLength(1);
      expect(spans[0].text).toBe('text');
      expect(spans[0].bold).toBe(true);
      expect(spans[0].fg).toBeTruthy();
    });

    it('handles multiple separate styled sections', () => {
      const spans = parseMarkup('[[fg:green]]a[[/fg]]b[[fg:red]]c[[/fg]]');
      expect(spans.length).toBeGreaterThanOrEqual(3);
      const allText = spans.map(s => s.text).join('');
      expect(allText).toBe('abc');
    });

    it('returns empty span for null input', () => {
      const spans = parseMarkup(null);
      expect(spans).toHaveLength(1);
      expect(spans[0].text).toBe('');
    });

    it('returns empty span for empty string', () => {
      const spans = parseMarkup('');
      expect(spans).toHaveLength(1);
      expect(spans[0].text).toBe('');
    });

    it('throws for unclosed markup', () => {
      expect(() => parseMarkup('[[fg:green]]hello')).toThrow(MarkupParseError);
    });

    it('merges adjacent spans with same style', () => {
      // Parse text that would create adjacent spans with same style
      const spans = parseMarkup('[[fg:green]]hello[[/fg]][[fg:green]]world[[/fg]]');
      // After merging, should be single span
      expect(spans).toHaveLength(1);
      expect(spans[0].text).toBe('helloworld');
    });
  });

  describe('COLOR_MAP', () => {
    it('has standard terminal colors', () => {
      expect(COLOR_MAP.black).toBeTruthy();
      expect(COLOR_MAP.red).toBeTruthy();
      expect(COLOR_MAP.green).toBeTruthy();
      expect(COLOR_MAP.yellow).toBeTruthy();
      expect(COLOR_MAP.blue).toBeTruthy();
      expect(COLOR_MAP.magenta).toBeTruthy();
      expect(COLOR_MAP.cyan).toBeTruthy();
      expect(COLOR_MAP.white).toBeTruthy();
    });

    it('has bright variants', () => {
      expect(COLOR_MAP.bright_black).toBeTruthy();
      expect(COLOR_MAP.bright_red).toBeTruthy();
      expect(COLOR_MAP.bright_green).toBeTruthy();
      expect(COLOR_MAP.bright_white).toBeTruthy();
    });

    it('has extended colors', () => {
      expect(COLOR_MAP.purple).toBe(COLORS.PURPLE);
      expect(COLOR_MAP.pink).toBe(COLORS.PINK);
      expect(COLOR_MAP.orange).toBe(COLORS.ORANGE);
    });
  });

  describe('MarkupParseError', () => {
    it('has correct name', () => {
      const error = new MarkupParseError('test', 5);
      expect(error.name).toBe('MarkupParseError');
    });

    it('stores position', () => {
      const error = new MarkupParseError('test', 10);
      expect(error.position).toBe(10);
    });
  });
});
