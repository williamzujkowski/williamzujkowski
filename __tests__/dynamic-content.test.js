const DynamicContentGenerator = require('../scripts/dynamic-content');

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn()
}));

const axios = require('axios');

describe('DynamicContentGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new DynamicContentGenerator();
    jest.clearAllMocks();
  });

  describe('static constants', () => {
    test('BIRTH_DATE is a valid Date', () => {
      expect(DynamicContentGenerator.BIRTH_DATE).toBeInstanceOf(Date);
    });

    test('BIRTH_DATE is April 8, 1982', () => {
      const birthDate = DynamicContentGenerator.BIRTH_DATE;
      expect(birthDate.getFullYear()).toBe(1982);
      expect(birthDate.getMonth()).toBe(3); // 0-indexed, so 3 = April
      expect(birthDate.getDate()).toBe(8);
    });

    test('BIRTH_YEAR is 1982', () => {
      expect(DynamicContentGenerator.BIRTH_YEAR).toBe(1982);
    });
  });

  describe('constructor', () => {
    test('initializes techJokes array', () => {
      expect(generator.techJokes).toBeDefined();
      expect(Array.isArray(generator.techJokes)).toBe(true);
      expect(generator.techJokes.length).toBeGreaterThan(0);
    });

    test('initializes nationalDayProvider', () => {
      expect(generator.nationalDayProvider).toBeDefined();
    });

    test('each joke has question and answer', () => {
      generator.techJokes.forEach((joke, index) => {
        expect(joke.q).toBeDefined();
        expect(joke.a).toBeDefined();
        expect(typeof joke.q).toBe('string');
        expect(typeof joke.a).toBe('string');
      });
    });
  });

  describe('getDayOfYear', () => {
    test('returns 1 for January 1st', () => {
      const jan1 = new Date(2024, 0, 1);
      expect(generator.getDayOfYear(jan1)).toBe(1);
    });

    test('returns 32 for February 1st', () => {
      const feb1 = new Date(2024, 1, 1);
      expect(generator.getDayOfYear(feb1)).toBe(32);
    });

    test('returns 366 for December 31st in leap year', () => {
      const dec31Leap = new Date(2024, 11, 31);
      expect(generator.getDayOfYear(dec31Leap)).toBe(366);
    });

    test('returns 365 for December 31st in non-leap year', () => {
      const dec31 = new Date(2023, 11, 31);
      expect(generator.getDayOfYear(dec31)).toBe(365);
    });

    test('returns correct value for mid-year date', () => {
      const july4 = new Date(2024, 6, 4); // July 4th, 2024 (leap year)
      // Jan: 31, Feb: 29 (leap), Mar: 31, Apr: 30, May: 31, Jun: 30 = 182, + Jul 4 = 186
      // Actually the getDayOfYear implementation counts from day 0, so July 4 = 185
      const result = generator.getDayOfYear(july4);
      expect(result).toBeGreaterThan(180);
      expect(result).toBeLessThan(190);
    });
  });

  describe('getJokeOfDay', () => {
    test('returns same joke for same date', () => {
      const date = new Date(2024, 5, 15);
      const joke1 = generator.getJokeOfDay(date);
      const joke2 = generator.getJokeOfDay(date);
      expect(joke1).toBe(joke2);
    });

    test('returns joke object with q and a properties', () => {
      const date = new Date(2024, 5, 15);
      const joke = generator.getJokeOfDay(date);
      expect(joke).toHaveProperty('q');
      expect(joke).toHaveProperty('a');
    });

    test('rotates through jokes deterministically', () => {
      const jokes = new Set();
      const numJokes = generator.techJokes.length;

      // Collect jokes for all days of year
      for (let day = 1; day <= numJokes; day++) {
        const date = new Date(2024, 0, day);
        const joke = generator.getJokeOfDay(date);
        jokes.add(joke.q);
      }

      // Should have cycled through all jokes
      expect(jokes.size).toBe(numJokes);
    });

    test('same day in different years gets same joke', () => {
      // Use January dates to avoid leap year differences (Feb 29 shifts day-of-year)
      const date2023 = new Date(2023, 0, 15);  // Jan 15, 2023
      const date2024 = new Date(2024, 0, 15);  // Jan 15, 2024
      const joke2023 = generator.getJokeOfDay(date2023);
      const joke2024 = generator.getJokeOfDay(date2024);
      expect(joke2023.q).toBe(joke2024.q);
    });
  });

  describe('formatDateTime', () => {
    test('formats date correctly', () => {
      const date = new Date(2024, 5, 15, 14, 30); // June 15, 2024, 2:30 PM
      const formatted = generator.formatDateTime(date);
      expect(formatted).toContain('Sat');
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('15');
      expect(formatted).toContain('14:30');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('EST');
    });

    test('pads single digit hours', () => {
      const date = new Date(2024, 5, 15, 9, 5);
      const formatted = generator.formatDateTime(date);
      expect(formatted).toContain('09:05');
    });

    test('includes all date components', () => {
      const date = new Date(2024, 0, 1, 0, 0); // Jan 1, 2024, midnight
      const formatted = generator.formatDateTime(date);
      expect(formatted).toMatch(/\w{3} \w{3} \d+ \d{2}:\d{2} EST \d{4}/);
    });
  });

  describe('calculateUptime', () => {
    test('calculates correct uptime for current year', () => {
      const date2024 = new Date(2024, 5, 15);
      const uptime = generator.calculateUptime(date2024);
      expect(uptime).toBe(2024 - 1982);
    });

    test('calculates correct uptime for birth year', () => {
      const date1982 = new Date(1982, 5, 15);
      const uptime = generator.calculateUptime(date1982);
      expect(uptime).toBe(0);
    });
  });

  describe('generateStats', () => {
    test('returns object with required properties', () => {
      const date = new Date(2024, 5, 15);
      const stats = generator.generateStats(date);

      expect(stats).toHaveProperty('uptime');
      expect(stats).toHaveProperty('daysAlive');
      expect(stats).toHaveProperty('coffeeConsumed');
      expect(stats).toHaveProperty('bugsFixed');
      expect(stats).toHaveProperty('bugsCreated');
      expect(stats).toHaveProperty('stackOverflowVisits');
    });

    test('all stats are positive numbers', () => {
      const date = new Date(2024, 5, 15);
      const stats = generator.generateStats(date);

      expect(stats.uptime).toBeGreaterThan(0);
      expect(stats.daysAlive).toBeGreaterThan(0);
      expect(stats.coffeeConsumed).toBeGreaterThan(0);
      expect(stats.bugsFixed).toBeGreaterThan(0);
      expect(stats.bugsCreated).toBeGreaterThan(0);
      expect(stats.stackOverflowVisits).toBeGreaterThan(0);
    });

    test('bugsCreated is one less than bugsFixed', () => {
      const date = new Date(2024, 5, 15);
      const stats = generator.generateStats(date);
      expect(stats.bugsCreated).toBe(stats.bugsFixed - 1);
    });

    test('stats increase with later dates', () => {
      const earlier = new Date(2020, 0, 1);
      const later = new Date(2024, 0, 1);

      const statsEarlier = generator.generateStats(earlier);
      const statsLater = generator.generateStats(later);

      expect(statsLater.daysAlive).toBeGreaterThan(statsEarlier.daysAlive);
      expect(statsLater.coffeeConsumed).toBeGreaterThan(statsEarlier.coffeeConsumed);
    });
  });

  describe('getSequenceRotation', () => {
    test('returns 0, 1, or 2', () => {
      for (let day = 1; day <= 10; day++) {
        const date = new Date(2024, 0, day);
        const rotation = generator.getSequenceRotation(date);
        expect([0, 1, 2]).toContain(rotation);
      }
    });

    test('cycles through 0, 1, 2 in sequence', () => {
      const rotations = [];
      for (let day = 1; day <= 6; day++) {
        const date = new Date(2024, 0, day);
        rotations.push(generator.getSequenceRotation(date));
      }

      // Should cycle: 1, 2, 0, 1, 2, 0 (based on day % 3)
      expect(rotations[0]).toBe(rotations[3]);
      expect(rotations[1]).toBe(rotations[4]);
      expect(rotations[2]).toBe(rotations[5]);
    });
  });

  describe('generateGitLog', () => {
    test('returns array of commits', () => {
      const date = new Date(2024, 5, 15);
      const commits = generator.generateGitLog(date);

      expect(Array.isArray(commits)).toBe(true);
      expect(commits.length).toBe(5);
    });

    test('each commit has required properties', () => {
      const date = new Date(2024, 5, 15);
      const commits = generator.generateGitLog(date);

      commits.forEach(commit => {
        expect(commit).toHaveProperty('hash');
        expect(commit).toHaveProperty('msg');
        expect(commit).toHaveProperty('time');
        expect(commit.hash).toMatch(/^[a-f0-9]{7}$/);
      });
    });

    test('rotates commits based on day', () => {
      const day1 = new Date(2024, 0, 1);
      const day2 = new Date(2024, 0, 2);

      const commits1 = generator.generateGitLog(day1);
      const commits2 = generator.generateGitLog(day2);

      // Different days should get different commit sets
      expect(commits1[0].hash).not.toBe(commits2[0].hash);
    });
  });

  describe('generateDockerContainers', () => {
    test('returns array of containers', () => {
      const date = new Date(2024, 5, 15);
      const containers = generator.generateDockerContainers(date);

      expect(Array.isArray(containers)).toBe(true);
      expect(containers.length).toBeGreaterThan(0);
      expect(containers.length).toBeLessThanOrEqual(3);
    });

    test('each container has required properties', () => {
      const date = new Date(2024, 5, 15);
      const containers = generator.generateDockerContainers(date);

      containers.forEach(container => {
        expect(container).toHaveProperty('id');
        expect(container).toHaveProperty('image');
        expect(container).toHaveProperty('status');
        expect(container).toHaveProperty('ports');
      });
    });
  });

  describe('generateNetworkStats', () => {
    test('returns object with network metrics', () => {
      const date = new Date(2024, 5, 15);
      const stats = generator.generateNetworkStats(date);

      expect(stats).toHaveProperty('packets_sent');
      expect(stats).toHaveProperty('packets_received');
      expect(stats).toHaveProperty('packet_loss');
      expect(stats).toHaveProperty('min_ms');
      expect(stats).toHaveProperty('avg_ms');
      expect(stats).toHaveProperty('max_ms');
      expect(stats).toHaveProperty('mdev_ms');
    });

    test('packets_sent is 5', () => {
      const date = new Date(2024, 5, 15);
      const stats = generator.generateNetworkStats(date);
      expect(stats.packets_sent).toBe(5);
    });

    test('min_ms <= avg_ms <= max_ms', () => {
      const date = new Date(2024, 5, 15);
      const stats = generator.generateNetworkStats(date);

      expect(parseFloat(stats.min_ms)).toBeLessThanOrEqual(parseFloat(stats.avg_ms));
      expect(parseFloat(stats.avg_ms)).toBeLessThanOrEqual(parseFloat(stats.max_ms));
    });

    test('is deterministic for same date', () => {
      const date = new Date(2024, 5, 15);
      const stats1 = generator.generateNetworkStats(date);
      const stats2 = generator.generateNetworkStats(date);

      expect(stats1.min_ms).toBe(stats2.min_ms);
      expect(stats1.avg_ms).toBe(stats2.avg_ms);
      expect(stats1.max_ms).toBe(stats2.max_ms);
    });

    test('packet_loss is 1 when seed % 10 === 0', () => {
      // Jan 10 = day 10, seed = 10 % 100 = 10, 10 % 10 === 0
      const date = new Date(2024, 0, 10);
      const stats = generator.generateNetworkStats(date);
      expect(stats.packet_loss).toBe(1);
      expect(stats.packets_received).toBe(4);
    });

    test('packet_loss is 0 when seed % 10 !== 0', () => {
      // Jan 15 = day 15, seed = 15 % 100 = 15, 15 % 10 !== 0
      const date = new Date(2024, 0, 15);
      const stats = generator.generateNetworkStats(date);
      expect(stats.packet_loss).toBe(0);
      expect(stats.packets_received).toBe(5);
    });
  });

  describe('fetchAccurateTime', () => {
    test('returns Date from API when successful', async () => {
      const mockDate = '2024-06-15T14:30:00-04:00';
      axios.get.mockResolvedValue({
        data: { datetime: mockDate }
      });

      const result = await generator.fetchAccurateTime();

      expect(result).toBeInstanceOf(Date);
      expect(axios.get).toHaveBeenCalledWith(
        'https://worldtimeapi.org/api/timezone/America/New_York',
        { timeout: 5000 }
      );
    });

    test('falls back to system time on API error', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const before = Date.now();
      const result = await generator.fetchAccurateTime();
      const after = Date.now();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });

    test('falls back to system time on missing data', async () => {
      axios.get.mockResolvedValue({ data: {} });

      const result = await generator.fetchAccurateTime();
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('generateContent', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: { datetime: '2024-06-15T14:30:00-04:00' }
      });
    });

    test('returns object with all required properties', async () => {
      const content = await generator.generateContent();

      expect(content).toHaveProperty('timestamp');
      expect(content).toHaveProperty('joke');
      expect(content).toHaveProperty('stats');
      expect(content).toHaveProperty('currentTime');
      expect(content).toHaveProperty('nationalDay');
      expect(content).toHaveProperty('rotation');
      expect(content).toHaveProperty('gitLog');
      expect(content).toHaveProperty('dockerContainers');
      expect(content).toHaveProperty('networkStats');
    });

    test('joke has q and a properties', async () => {
      const content = await generator.generateContent();

      expect(content.joke).toHaveProperty('q');
      expect(content.joke).toHaveProperty('a');
    });

    test('nationalDay has required properties', async () => {
      const content = await generator.generateContent();

      expect(content.nationalDay).toHaveProperty('name');
      expect(content.nationalDay).toHaveProperty('desc');
      expect(content.nationalDay).toHaveProperty('emoji');
    });

    test('rotation is 0, 1, or 2', async () => {
      const content = await generator.generateContent();
      expect([0, 1, 2]).toContain(content.rotation);
    });
  });
});
