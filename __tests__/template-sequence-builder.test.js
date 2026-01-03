/**
 * @fileoverview Tests for the template sequence builder module.
 * @module tests/template-sequence-builder
 */

const {
  buildTemplateSequence,
  buildMotdSequence,
  buildNationalDaySequence,
  buildProfileSequence,
  buildProcessesSequence,
  buildStatsSequence,
  buildDadJokeSequence,
  buildFortuneSequence,
  buildSystemctlSequence,
  buildGoodbyeSequence,
  buildNpmInstallSequence,
  buildTemplateSequences
} = require('../scripts/template-sequence-builder');
const { TerminalTemplateEngine } = require('../scripts/template-engine');
const { COLORS, DEFAULT_PROMPT, TYPING, PAUSE } = require('../scripts/constants');

describe('TemplateSequenceBuilder', () => {
  let engine;
  let mockContent;

  beforeEach(() => {
    engine = new TerminalTemplateEngine();
    mockContent = {
      currentTime: new Date('2026-01-01T12:00:00'),
      timestamp: 'Thu Jan 1 12:00 EST 2026',
      nationalDay: {
        name: 'Test Day',
        desc: 'A day for testing',
        emoji: '🧪'
      },
      joke: {
        q: 'Why do programmers prefer dark mode?',
        a: 'Because light attracts bugs!',
        category: 'programming'
      },
      stats: {
        uptime: 42,
        daysAlive: 15000,
        coffeeConsumed: 50000,
        bugsFixed: 10000,
        bugsCreated: 9999,
        stackOverflowVisits: 25000
      },
      rotation: 1
    };
  });

  describe('buildTemplateSequence', () => {
    it('creates command and output sequence pair', () => {
      const sequences = buildTemplateSequence({
        command: 'echo hello',
        templateName: 'blocks/goodbye.njk',
        context: {},
        color: COLORS.GREEN
      }, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].type).toBe('command');
      expect(sequences[0].content).toBe('echo hello');
      expect(sequences[1].type).toBe('output');
      expect(sequences[1].color).toBe(COLORS.GREEN);
    });

    it('uses default values when not specified', () => {
      const sequences = buildTemplateSequence({
        command: 'test',
        templateName: 'blocks/goodbye.njk',
        context: {},
        dynamicPause: false  // Test with fixed pause
      }, engine);

      expect(sequences[0].typingDuration).toBe(TYPING.STANDARD);
      expect(sequences[1].color).toBe(COLORS.WHITE);
      expect(sequences[1].pause).toBe(PAUSE.SHORT);
    });

    it('calculates dynamic pause based on content length', () => {
      const sequences = buildTemplateSequence({
        command: 'test',
        templateName: 'blocks/goodbye.njk',
        context: {},
        dynamicPause: true
      }, engine);

      // Dynamic pause should be between MIN and MAX
      expect(sequences[1].pause).toBeGreaterThanOrEqual(800);
      expect(sequences[1].pause).toBeLessThanOrEqual(5000);
    });

    it('uses prompt from DEFAULT_PROMPT', () => {
      const sequences = buildTemplateSequence({
        command: 'test',
        templateName: 'blocks/goodbye.njk',
        context: {}
      }, engine);

      expect(sequences[0].prompt).toBe(DEFAULT_PROMPT);
    });
  });

  describe('buildMotdSequence', () => {
    it('creates MOTD sequence with correct command', () => {
      const sequences = buildMotdSequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].type).toBe('command');
      expect(sequences[0].content).toBe('cat /etc/motd');
      expect(sequences[1].type).toBe('output');
    });

    it('uses NEON_GREEN color', () => {
      const sequences = buildMotdSequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.NEON_GREEN);
    });

    it('includes year and month from content date', () => {
      const sequences = buildMotdSequence(mockContent, engine);
      expect(sequences[1].content).toContain('2026');
      expect(sequences[1].content).toContain('01');
    });
  });

  describe('buildNationalDaySequence', () => {
    it('creates national day sequence with curl command', () => {
      const sequences = buildNationalDaySequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].content).toContain('curl');
      expect(sequences[0].content).toContain('whatday.today');
    });

    it('uses YELLOW color', () => {
      const sequences = buildNationalDaySequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.YELLOW);
    });

    it('truncates long names', () => {
      const longContent = {
        ...mockContent,
        nationalDay: {
          name: 'This Is A Very Long National Day Name That Should Be Truncated',
          desc: 'A very long description that should also be truncated here',
          emoji: '📅'
        }
      };
      const sequences = buildNationalDaySequence(longContent, engine);

      // Check name truncation (max 32 chars)
      expect(sequences[1].content).not.toContain('Truncated');
    });
  });

  describe('buildProfileSequence', () => {
    it('creates profile sequence with cat command', () => {
      const sequences = buildProfileSequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].content).toBe('cat /etc/profile');
    });

    it('uses BLUE color', () => {
      const sequences = buildProfileSequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.BLUE);
    });
  });

  describe('buildProcessesSequence', () => {
    it('creates processes sequence with htop command', () => {
      const sequences = buildProcessesSequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].content).toBe('htop --dad-mode');
    });

    it('uses WHITE color', () => {
      const sequences = buildProcessesSequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.WHITE);
    });

    it('includes htop-style output with process names', () => {
      const sequences = buildProcessesSequence(mockContent, engine);
      expect(sequences[1].content).toContain('family');
      expect(sequences[1].content).toContain('dad-joked');
    });

    it('uses extended typing duration with dynamic pause', () => {
      const sequences = buildProcessesSequence(mockContent, engine);
      expect(sequences[0].typingDuration).toBe(TYPING.EXTENDED);  // 2000ms
      // Dynamic pause based on content length
      expect(sequences[1].pause).toBeGreaterThanOrEqual(800);
      expect(sequences[1].pause).toBeLessThanOrEqual(5000);
    });
  });

  describe('buildStatsSequence', () => {
    it('creates stats sequence with proc command', () => {
      const sequences = buildStatsSequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].content).toBe('cat /proc/developer/stats');
    });

    it('uses BLUE color', () => {
      const sequences = buildStatsSequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.BLUE);
    });

    it('uses slow typing duration with dynamic pause', () => {
      const sequences = buildStatsSequence(mockContent, engine);
      expect(sequences[0].typingDuration).toBe(TYPING.SLOW);       // 1800ms
      // Dynamic pause based on content length
      expect(sequences[1].pause).toBeGreaterThanOrEqual(800);
      expect(sequences[1].pause).toBeLessThanOrEqual(5000);
    });
  });

  describe('buildDadJokeSequence', () => {
    it('creates dad joke sequence with custom command', () => {
      const sequences = buildDadJokeSequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].content).toContain('dad-joke');
      expect(sequences[0].content).toContain('--format=fancy');
    });

    it('uses PINK color', () => {
      const sequences = buildDadJokeSequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.PINK);
    });

    it('includes joke content', () => {
      const sequences = buildDadJokeSequence(mockContent, engine);
      expect(sequences[1].content).toContain('dark mode');
      expect(sequences[1].content).toContain('bugs');
    });
  });

  describe('buildFortuneSequence', () => {
    it('creates fortune sequence with pipe command', () => {
      const sequences = buildFortuneSequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].content).toContain('fortune');
      expect(sequences[0].content).toContain('cowsay');
      expect(sequences[0].content).toContain('lolcat');
    });

    it('uses PURPLE color', () => {
      const sequences = buildFortuneSequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.PURPLE);
    });
  });

  describe('buildSystemctlSequence', () => {
    it('creates systemctl sequence', () => {
      const sequences = buildSystemctlSequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].content).toBe('systemctl status dad-mode.service');
    });

    it('uses WHITE color', () => {
      const sequences = buildSystemctlSequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.WHITE);
    });
  });

  describe('buildGoodbyeSequence', () => {
    it('creates goodbye sequence with cat command', () => {
      const sequences = buildGoodbyeSequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].content).toBe('cat /etc/goodbye.txt');
    });

    it('uses GREEN color', () => {
      const sequences = buildGoodbyeSequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.GREEN);
    });

    it('includes goodbye content', () => {
      const sequences = buildGoodbyeSequence(mockContent, engine);
      expect(sequences[1].content).toContain('Thanks for visiting');
    });
  });

  describe('buildNpmInstallSequence', () => {
    it('creates npm install sequence with default package', () => {
      const sequences = buildNpmInstallSequence(mockContent, engine);

      expect(sequences).toHaveLength(2);
      expect(sequences[0].type).toBe('command');
      expect(sequences[0].content).toBe('npm install left-pad');
    });

    it('creates npm install sequence with custom package', () => {
      const sequences = buildNpmInstallSequence(mockContent, engine, 'is-even');

      expect(sequences[0].content).toBe('npm install is-even');
    });

    it('uses YELLOW color', () => {
      const sequences = buildNpmInstallSequence(mockContent, engine);
      expect(sequences[1].color).toBe(COLORS.YELLOW);
    });

    it('includes dependency tree humor', () => {
      const sequences = buildNpmInstallSequence(mockContent, engine);
      expect(sequences[1].content).toContain('added 847 packages');
      expect(sequences[1].content).toContain('vulnerabilities');
      expect(sequences[1].content).toContain('universe');
    });

    it('uses medium typing duration', () => {
      const sequences = buildNpmInstallSequence(mockContent, engine);
      expect(sequences[0].typingDuration).toBe(TYPING.MEDIUM);
    });
  });

  describe('buildTemplateSequences', () => {
    it('returns array of sequences', () => {
      const sequences = buildTemplateSequences(mockContent);

      expect(Array.isArray(sequences)).toBe(true);
      expect(sequences.length).toBeGreaterThan(10);
    });

    it('includes all core sequence types', () => {
      const sequences = buildTemplateSequences(mockContent);
      const commands = sequences
        .filter(s => s.type === 'command')
        .map(s => s.content);

      // Core sequences in optimized order
      expect(commands).toContain('cat /etc/motd');
      expect(commands).toContain('neofetch --ascii_distro DadOS');
      expect(commands).toContain('cat /etc/profile');
      expect(commands).toContain('curl -s williamzujkowski.github.io/feed.xml | grep -m1 title');
      expect(commands).toContain('cat /etc/goodbye.txt');
    });

    it('all sequences have required properties', () => {
      const sequences = buildTemplateSequences(mockContent);

      sequences.forEach(seq => {
        expect(seq.type).toBeDefined();
        if (seq.type === 'command') {
          expect(seq.prompt).toBeDefined();
          expect(seq.content).toBeDefined();
          expect(typeof seq.typingDuration).toBe('number');
        } else if (seq.type === 'output') {
          expect(seq.content).toBeDefined();
          expect(seq.color).toBeDefined();
        }
      });
    });

    it('starts with MOTD and ends with goodbye', () => {
      const sequences = buildTemplateSequences(mockContent);
      const firstCommand = sequences.find(s => s.type === 'command');
      const lastOutput = sequences[sequences.length - 1];

      expect(firstCommand.content).toBe('cat /etc/motd');
      expect(lastOutput.content).toContain('Thanks for visiting');
    });
  });
});
