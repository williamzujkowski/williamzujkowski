/**
 * @fileoverview Tests for the template context builder module.
 * @module tests/template-context
 */

const {
  buildContext,
  buildTestContext,
  loadFullContext,
  enrichWithYamlContent
} = require('../scripts/template-context');
const { YamlContentLoader } = require('../scripts/content-loader');

describe('TemplateContext', () => {
  describe('buildContext', () => {
    const mockContent = {
      timestamp: 'Thu Jan 2 10:30 EST 2026',
      date: new Date('2026-01-02T10:30:00'),
      joke: {
        q: 'Why do programmers prefer dark mode?',
        a: 'Because light attracts bugs!',
        category: 'programming'
      },
      nationalDay: {
        name: 'Science Fiction Day',
        desc: 'Celebrating sci-fi literature',
        emoji: '🚀'
      },
      stats: {
        uptime: 44,
        daysAlive: 16001,
        coffeeConsumed: 50001,
        bugsFixed: 10001,
        bugsCreated: 10000,
        stackOverflowVisits: 25001
      },
      rotation: 1,
      gitLog: [{ hash: 'abc123', msg: 'test commit', time: '2h ago' }],
      containers: [{ id: 'abc', image: 'nginx', status: 'running', ports: '80' }],
      network: { latency: 10 }
    };

    it('includes user and host info', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.user).toBe('william');
      expect(ctx.host).toBe('dad-joke-hq');
    });

    it('maps timestamp from content', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.timestamp).toBe(mockContent.timestamp);
    });

    it('maps date from content', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.date).toBe(mockContent.date);
    });

    it('maps joke with category fallback', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.joke.q).toBe(mockContent.joke.q);
      expect(ctx.joke.a).toBe(mockContent.joke.a);
      expect(ctx.joke.category).toBe('programming');
    });

    it('defaults joke category to classic when missing', () => {
      const contentNoCategory = {
        ...mockContent,
        joke: { q: 'Q?', a: 'A!' }
      };
      const ctx = buildContext(contentNoCategory);
      expect(ctx.joke.category).toBe('classic');
    });

    it('maps national day info', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.nationalDay.name).toBe(mockContent.nationalDay.name);
      expect(ctx.nationalDay.desc).toBe(mockContent.nationalDay.desc);
      expect(ctx.nationalDay.emoji).toBe(mockContent.nationalDay.emoji);
    });

    it('maps stats directly', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.stats).toBe(mockContent.stats);
    });

    it('maps rotation and calculates rotationName', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.rotation).toBe(1);
      expect(ctx.rotationName).toBe('DevOps');
    });

    it('calculates correct rotationName for all rotations', () => {
      const rotation0 = buildContext({ ...mockContent, rotation: 0 });
      const rotation1 = buildContext({ ...mockContent, rotation: 1 });
      const rotation2 = buildContext({ ...mockContent, rotation: 2 });

      expect(rotation0.rotationName).toBe('Core+Easter');
      expect(rotation1.rotationName).toBe('DevOps');
      expect(rotation2.rotationName).toBe('Network');
    });

    it('maps gitLog from content', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.gitLog).toEqual(mockContent.gitLog);
    });

    it('defaults gitLog to empty array when missing', () => {
      const { gitLog, ...contentNoGitLog } = mockContent;
      const ctx = buildContext(contentNoGitLog);
      expect(ctx.gitLog).toEqual([]);
    });

    it('maps containers from content', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.containers).toEqual(mockContent.containers);
    });

    it('defaults containers to empty array when missing', () => {
      const { containers, ...contentNoContainers } = mockContent;
      const ctx = buildContext(contentNoContainers);
      expect(ctx.containers).toEqual([]);
    });

    it('maps network from content', () => {
      const ctx = buildContext(mockContent);
      expect(ctx.network).toEqual(mockContent.network);
    });

    it('defaults network to empty object when missing', () => {
      const { network, ...contentNoNetwork } = mockContent;
      const ctx = buildContext(contentNoNetwork);
      expect(ctx.network).toEqual({});
    });
  });

  describe('buildTestContext', () => {
    it('returns default values when no overrides', () => {
      const ctx = buildTestContext();

      expect(ctx.user).toBe('testuser');
      expect(ctx.host).toBe('testhost');
      expect(ctx.timestamp).toBe('Thu Jan 1 12:00 EST 2026');
      expect(ctx.joke.q).toBe('Why did the programmer quit?');
      expect(ctx.joke.a).toBe('Because they did not get arrays!');
      expect(ctx.nationalDay.name).toBe('Public Domain Day');
      expect(ctx.stats.uptime).toBe(44);
      expect(ctx.rotation).toBe(0);
      expect(ctx.rotationName).toBe('Core+Easter');
      expect(ctx.gitLog).toEqual([]);
      expect(ctx.containers).toEqual([]);
      expect(ctx.network).toEqual({});
    });

    it('merges overrides with defaults', () => {
      const ctx = buildTestContext({
        user: 'customuser',
        rotation: 2
      });

      expect(ctx.user).toBe('customuser');
      expect(ctx.rotation).toBe(2);
      // Other defaults still present
      expect(ctx.host).toBe('testhost');
      expect(ctx.stats.uptime).toBe(44);
    });

    it('allows overriding nested objects', () => {
      const ctx = buildTestContext({
        joke: { q: 'Custom Q?', a: 'Custom A!', category: 'custom' }
      });

      expect(ctx.joke.q).toBe('Custom Q?');
      expect(ctx.joke.a).toBe('Custom A!');
      expect(ctx.joke.category).toBe('custom');
    });

    it('returns a Date object for date field', () => {
      const ctx = buildTestContext();
      expect(ctx.date).toBeInstanceOf(Date);
      expect(ctx.date.getFullYear()).toBe(2026);
    });
  });

  describe('loadFullContext', () => {
    it('returns a promise', () => {
      const result = loadFullContext();
      expect(result).toBeInstanceOf(Promise);
    });

    it('resolves to context with expected structure', async () => {
      const ctx = await loadFullContext();

      expect(ctx.user).toBe('william');
      expect(ctx.host).toBe('dad-joke-hq');
      expect(ctx.timestamp).toBeDefined();
      expect(ctx.joke).toBeDefined();
      expect(ctx.nationalDay).toBeDefined();
      expect(ctx.stats).toBeDefined();
      expect(typeof ctx.rotation).toBe('number');
      expect(ctx.rotationName).toBeDefined();
    }, 30000); // Allow time for API calls (weather, time, RSS)
  });

  describe('enrichWithYamlContent', () => {
    let loader;
    let baseContext;

    beforeEach(() => {
      loader = new YamlContentLoader();
      baseContext = buildTestContext();
    });

    it('adds yamlJoke to context', () => {
      const enriched = enrichWithYamlContent(baseContext, loader);
      expect(enriched.yamlJoke).toBeDefined();
      expect(enriched.yamlJoke.q).toBeDefined();
      expect(enriched.yamlJoke.a).toBeDefined();
    });

    it('adds yamlNationalDay to context', () => {
      const enriched = enrichWithYamlContent(baseContext, loader);
      expect(enriched.yamlNationalDay).toBeDefined();
    });

    it('preserves base context properties', () => {
      const enriched = enrichWithYamlContent(baseContext, loader);
      expect(enriched.user).toBe(baseContext.user);
      expect(enriched.host).toBe(baseContext.host);
      expect(enriched.joke).toEqual(baseContext.joke);
    });

    it('falls back to base joke when YAML returns null', () => {
      // Mock loader that returns null
      const mockLoader = {
        getJokeByIndex: () => null,
        getTodaysNationalDay: () => null
      };

      const enriched = enrichWithYamlContent(baseContext, mockLoader);
      expect(enriched.yamlJoke).toEqual(baseContext.joke);
      expect(enriched.yamlNationalDay).toEqual(baseContext.nationalDay);
    });

    it('uses day of week for joke index', () => {
      const mondayContext = buildTestContext({
        date: new Date('2026-01-05T12:00:00') // Monday = 1
      });

      // Should call getJokeByIndex with 1 (Monday)
      let calledWith = null;
      const mockLoader = {
        getJokeByIndex: (index) => {
          calledWith = index;
          return { q: 'Monday joke', a: 'Answer', category: 'test' };
        },
        getTodaysNationalDay: () => null
      };

      enrichWithYamlContent(mondayContext, mockLoader);
      expect(calledWith).toBe(1);
    });
  });
});
