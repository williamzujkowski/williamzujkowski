const {
  DEFAULT_PROMPT,
  COLORS,
  TYPING,
  PAUSE,
  DELAY,
  TIME,
  WINDOW,
  TITLE_BAR,
  TERMINAL,
  STATS_MULTIPLIERS,
  ANIMATION,
  BOX
} = require('../scripts/constants');

describe('Constants Module', () => {
  describe('DEFAULT_PROMPT', () => {
    test('is defined and non-empty', () => {
      expect(DEFAULT_PROMPT).toBeDefined();
      expect(DEFAULT_PROMPT.length).toBeGreaterThan(0);
    });

    test('ends with $ and space', () => {
      expect(DEFAULT_PROMPT).toMatch(/\$ $/);
    });

    test('contains username', () => {
      expect(DEFAULT_PROMPT).toContain('william');
    });
  });

  describe('COLORS', () => {
    const colorKeys = [
      'YELLOW', 'CYAN', 'GREEN', 'PINK', 'PURPLE',
      'WHITE', 'ORANGE', 'COMMENT', 'BLUE',
      'NEON_GREEN', 'MATRIX_GREEN', 'BACKGROUND', 'TITLE_BAR_BG'
    ];

    test.each(colorKeys)('%s is a valid hex color', (key) => {
      expect(COLORS[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    test('all expected colors are defined', () => {
      colorKeys.forEach(key => {
        expect(COLORS[key]).toBeDefined();
      });
    });
  });

  describe('TYPING', () => {
    const timingKeys = [
      'INSTANT', 'FAST', 'QUICK', 'MEDIUM', 'STANDARD',
      'MODERATE', 'SLOW', 'EXTENDED', 'LONG', 'EXTRA_LONG'
    ];

    test.each(timingKeys)('%s is a positive number', (key) => {
      expect(typeof TYPING[key]).toBe('number');
      expect(TYPING[key]).toBeGreaterThan(0);
    });

    test('values are in ascending order', () => {
      expect(TYPING.INSTANT).toBeLessThan(TYPING.FAST);
      expect(TYPING.FAST).toBeLessThanOrEqual(TYPING.QUICK);
      expect(TYPING.QUICK).toBeLessThan(TYPING.MEDIUM);
      expect(TYPING.MEDIUM).toBeLessThan(TYPING.STANDARD);
    });

    test('all values are under 3 seconds', () => {
      Object.values(TYPING).forEach(value => {
        expect(value).toBeLessThan(3000);
      });
    });
  });

  describe('PAUSE', () => {
    const pauseKeys = [
      'MINIMAL', 'SHORT', 'BRIEF', 'QUICK', 'MEDIUM',
      'STANDARD', 'EXTENDED', 'LONG', 'LONGER', 'EXTRA',
      'DRAMATIC', 'EMPHASIS', 'SHOWCASE'
    ];

    test.each(pauseKeys)('%s is a positive number', (key) => {
      expect(typeof PAUSE[key]).toBe('number');
      expect(PAUSE[key]).toBeGreaterThan(0);
    });

    test('MINIMAL is smallest', () => {
      Object.entries(PAUSE).forEach(([key, value]) => {
        if (key !== 'MINIMAL') {
          expect(value).toBeGreaterThanOrEqual(PAUSE.MINIMAL);
        }
      });
    });
  });

  describe('DELAY', () => {
    test('NONE is zero', () => {
      expect(DELAY.NONE).toBe(0);
    });

    test('other delays are positive', () => {
      expect(DELAY.MINIMAL).toBeGreaterThan(0);
      expect(DELAY.SHORT).toBeGreaterThan(DELAY.MINIMAL);
      expect(DELAY.MEDIUM).toBeGreaterThan(DELAY.SHORT);
    });
  });

  describe('TIME', () => {
    test('MS_PER_SECOND is 1000', () => {
      expect(TIME.MS_PER_SECOND).toBe(1000);
    });

    test('MS_PER_MINUTE is 60000', () => {
      expect(TIME.MS_PER_MINUTE).toBe(60000);
    });

    test('MS_PER_HOUR is 3600000', () => {
      expect(TIME.MS_PER_HOUR).toBe(3600000);
    });

    test('MS_PER_DAY is 86400000', () => {
      expect(TIME.MS_PER_DAY).toBe(86400000);
    });

    test('time constants are mathematically consistent', () => {
      expect(TIME.MS_PER_MINUTE).toBe(TIME.MS_PER_SECOND * 60);
      expect(TIME.MS_PER_HOUR).toBe(TIME.MS_PER_MINUTE * 60);
      expect(TIME.MS_PER_DAY).toBe(TIME.MS_PER_HOUR * 24);
    });
  });

  describe('WINDOW', () => {
    test('has valid dimensions', () => {
      expect(WINDOW.WIDTH).toBeGreaterThan(0);
      expect(WINDOW.HEIGHT).toBeGreaterThan(0);
    });

    test('has reasonable aspect ratio', () => {
      const aspectRatio = WINDOW.WIDTH / WINDOW.HEIGHT;
      expect(aspectRatio).toBeGreaterThan(1);
      expect(aspectRatio).toBeLessThan(2);
    });

    test('has valid border radius', () => {
      expect(WINDOW.BORDER_RADIUS).toBeGreaterThan(0);
      expect(WINDOW.BORDER_RADIUS).toBeLessThan(50);
    });

    test('has title string', () => {
      expect(typeof WINDOW.TITLE).toBe('string');
      expect(WINDOW.TITLE.length).toBeGreaterThan(0);
    });
  });

  describe('TITLE_BAR', () => {
    test('has positive height', () => {
      expect(TITLE_BAR.HEIGHT).toBeGreaterThan(0);
    });

    test('has valid background color', () => {
      expect(TITLE_BAR.BACKGROUND_COLOR).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('TERMINAL', () => {
    test('has valid font size', () => {
      expect(TERMINAL.FONT_SIZE).toBeGreaterThan(8);
      expect(TERMINAL.FONT_SIZE).toBeLessThan(24);
    });

    test('has valid line height', () => {
      expect(TERMINAL.LINE_HEIGHT).toBeGreaterThan(1);
      expect(TERMINAL.LINE_HEIGHT).toBeLessThan(3);
    });

    test('has valid colors', () => {
      expect(TERMINAL.BACKGROUND_COLOR).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(TERMINAL.PROMPT_COLOR).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(TERMINAL.CURSOR_COLOR).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('STATS_MULTIPLIERS', () => {
    test('COFFEE_PER_DAY is reasonable', () => {
      expect(STATS_MULTIPLIERS.COFFEE_PER_DAY).toBeGreaterThan(0);
      expect(STATS_MULTIPLIERS.COFFEE_PER_DAY).toBeLessThan(10);
    });

    test('BUGS_PER_DAY is positive', () => {
      expect(STATS_MULTIPLIERS.BUGS_PER_DAY).toBeGreaterThan(0);
    });

    test('SO_VISIT_MULTIPLIER is at least 1', () => {
      expect(STATS_MULTIPLIERS.SO_VISIT_MULTIPLIER).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ANIMATION', () => {
    test('MAX_DURATION_SECONDS is reasonable', () => {
      expect(ANIMATION.MAX_DURATION_SECONDS).toBeGreaterThan(30);
      expect(ANIMATION.MAX_DURATION_SECONDS).toBeLessThan(120);
    });

    test('WARNING_THRESHOLD is less than max', () => {
      expect(ANIMATION.WARNING_THRESHOLD).toBeLessThan(ANIMATION.MAX_DURATION_SECONDS);
    });
  });

  describe('BOX', () => {
    test('has valid default widths', () => {
      expect(BOX.DOUBLE_WIDTH).toBeGreaterThan(20);
      expect(BOX.ROUNDED_WIDTH).toBeGreaterThan(20);
      expect(BOX.JOKE_BOX_WIDTH).toBeGreaterThan(20);
    });

    test('widths are even numbers', () => {
      expect(BOX.DOUBLE_WIDTH % 2).toBe(0);
      expect(BOX.ROUNDED_WIDTH % 2).toBe(0);
      expect(BOX.JOKE_BOX_WIDTH % 2).toBe(0);
    });
  });
});
