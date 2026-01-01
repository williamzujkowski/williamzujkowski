const {
  createAsciiBox,
  createDoubleBox,
  createRoundedBox,
  createTitledBox,
  getDisplayWidth,
  padToWidth,
  truncateToWidth,
  BOX_STYLES
} = require('../scripts/box-generator');

describe('BoxGenerator', () => {
  describe('getDisplayWidth', () => {
    test('returns 0 for empty string', () => {
      expect(getDisplayWidth('')).toBe(0);
    });

    test('returns correct length for ASCII text', () => {
      expect(getDisplayWidth('Hello')).toBe(5);
      expect(getDisplayWidth('Test string')).toBe(11);
    });

    test('handles null/undefined', () => {
      expect(getDisplayWidth(null)).toBe(0);
      expect(getDisplayWidth(undefined)).toBe(0);
    });

    test('counts emoji as 2 characters wide', () => {
      expect(getDisplayWidth('Hi')).toBe(2);
      // Emoji should count as 2 chars
      const withEmoji = getDisplayWidth('A\u{1F600}B'); // A😀B
      expect(withEmoji).toBe(4); // A(1) + emoji(2) + B(1)
    });
  });

  describe('padToWidth', () => {
    test('pads short strings', () => {
      expect(padToWidth('Hi', 5)).toBe('Hi   ');
    });

    test('does not pad strings at target width', () => {
      expect(padToWidth('Hello', 5)).toBe('Hello');
    });

    test('does not truncate long strings', () => {
      expect(padToWidth('Hello World', 5)).toBe('Hello World');
    });

    test('uses custom pad character', () => {
      expect(padToWidth('Hi', 5, '-')).toBe('Hi---');
    });
  });

  describe('truncateToWidth', () => {
    test('does not truncate short strings', () => {
      expect(truncateToWidth('Hi', 10)).toBe('Hi');
    });

    test('truncates long strings with ellipsis', () => {
      const result = truncateToWidth('Hello World!', 10);
      expect(result).toBe('Hello W...');
      expect(getDisplayWidth(result)).toBeLessThanOrEqual(10);
    });

    test('handles exact length', () => {
      expect(truncateToWidth('Hello', 5)).toBe('Hello');
    });
  });

  describe('createDoubleBox', () => {
    test('creates box with correct borders', () => {
      const box = createDoubleBox(['Test'], 20);
      const lines = box.split('\n');

      expect(lines[0]).toMatch(/^╔═+╗$/);
      expect(lines[1]).toMatch(/^║.*║$/);
      expect(lines[2]).toMatch(/^╚═+╝$/);
    });

    test('creates box with correct width', () => {
      const box = createDoubleBox(['Test'], 20);
      const lines = box.split('\n');

      lines.forEach(line => {
        expect(getDisplayWidth(line)).toBe(20);
      });
    });

    test('pads content to fill box', () => {
      const box = createDoubleBox(['Hi'], 20);
      expect(box).toContain('║ Hi');
      expect(box).toContain(' ║');
    });

    test('handles multiple lines', () => {
      const box = createDoubleBox(['Line 1', 'Line 2', 'Line 3'], 20);
      const lines = box.split('\n');

      expect(lines.length).toBe(5); // top + 3 content + bottom
      expect(lines[1]).toContain('Line 1');
      expect(lines[2]).toContain('Line 2');
      expect(lines[3]).toContain('Line 3');
    });

    test('handles empty lines', () => {
      const box = createDoubleBox(['', 'Content', ''], 20);
      const lines = box.split('\n');

      expect(lines.length).toBe(5);
      expect(lines[1]).toBe('║                  ║');
    });

    test('uses default width of 56', () => {
      const box = createDoubleBox(['Test']);
      const lines = box.split('\n');

      expect(getDisplayWidth(lines[0])).toBe(56);
    });
  });

  describe('createRoundedBox', () => {
    test('creates box with rounded borders', () => {
      const box = createRoundedBox(['Test'], 20);
      const lines = box.split('\n');

      expect(lines[0]).toMatch(/^╭─+╮$/);
      expect(lines[1]).toMatch(/^│.*│$/);
      expect(lines[2]).toMatch(/^╰─+╯$/);
    });

    test('uses default width of 48', () => {
      const box = createRoundedBox(['Test']);
      const lines = box.split('\n');

      expect(getDisplayWidth(lines[0])).toBe(48);
    });
  });

  describe('createAsciiBox with separators', () => {
    test('adds separator after specified lines', () => {
      const box = createAsciiBox({
        style: 'double',
        width: 20,
        lines: ['Title', 'Content'],
        separatorAfter: [0]
      });
      const lines = box.split('\n');

      expect(lines[0]).toBe('╔══════════════════╗');
      expect(lines[1]).toContain('Title');
      expect(lines[2]).toBe('╠══════════════════╣');
      expect(lines[3]).toContain('Content');
      expect(lines[4]).toBe('╚══════════════════╝');
    });

    test('handles multiple separators', () => {
      const box = createAsciiBox({
        style: 'double',
        width: 20,
        lines: ['Header', 'Body', 'Footer'],
        separatorAfter: [0, 1]
      });
      const lines = box.split('\n');

      expect(lines.filter(l => l.includes('╠')).length).toBe(2);
    });
  });

  describe('createTitledBox', () => {
    test('creates box with title section', () => {
      const box = createTitledBox({
        title: 'TITLE',
        content: ['Content'],
        width: 30
      });
      const lines = box.split('\n');

      expect(lines[0]).toMatch(/^╔═+╗$/);
      expect(lines[1]).toMatch(/^║\s+║$/); // Empty line
      expect(lines[2]).toContain('TITLE');
      expect(lines[3]).toMatch(/^╠═+╣$/); // Separator
      expect(lines[4]).toContain('Content');
      expect(lines[lines.length - 1]).toMatch(/^╚═+╝$/);
    });

    test('includes subtitle when provided', () => {
      const box = createTitledBox({
        title: 'TITLE',
        subtitle: 'Subtitle',
        content: ['Content'],
        width: 30
      });

      expect(box).toContain('TITLE');
      expect(box).toContain('Subtitle');
    });
  });

  describe('BOX_STYLES', () => {
    test('double style has all required characters', () => {
      expect(BOX_STYLES.double).toEqual({
        topLeft: '╔',
        topRight: '╗',
        bottomLeft: '╚',
        bottomRight: '╝',
        horizontal: '═',
        vertical: '║',
        separatorLeft: '╠',
        separatorRight: '╣'
      });
    });

    test('rounded style has all required characters', () => {
      expect(BOX_STYLES.rounded).toEqual({
        topLeft: '╭',
        topRight: '╮',
        bottomLeft: '╰',
        bottomRight: '╯',
        horizontal: '─',
        vertical: '│',
        separatorLeft: '├',
        separatorRight: '┤'
      });
    });
  });

  describe('error handling', () => {
    test('throws error for unknown style', () => {
      expect(() => {
        createAsciiBox({
          style: 'invalid',
          lines: ['test']
        });
      }).toThrow("Unknown box style: invalid. Use 'double' or 'rounded'.");
    });
  });

  describe('truncation', () => {
    test('truncates long lines by default', () => {
      const longLine = 'A'.repeat(100);
      const box = createDoubleBox([longLine], 30);
      const lines = box.split('\n');

      expect(getDisplayWidth(lines[1])).toBe(30);
      expect(lines[1]).toContain('...');
    });

    test('can disable truncation', () => {
      const longLine = 'A'.repeat(100);
      const box = createAsciiBox({
        style: 'double',
        width: 30,
        lines: [longLine],
        truncate: false
      });
      const lines = box.split('\n');

      // Content line will be longer than box
      expect(lines[1]).toContain(longLine);
    });
  });
});
