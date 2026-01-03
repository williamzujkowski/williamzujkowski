/**
 * Tests for NationalDayProvider module.
 * @module national-day-provider.test
 */

const { NationalDayProvider, DEFAULT_DAY } = require('../scripts/national-day-provider');

describe('NationalDayProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new NationalDayProvider();
  });

  afterEach(() => {
    provider.clearCache();
  });

  describe('getNationalDay', () => {
    it('returns New Year\'s Day for January 1st', () => {
      const date = new Date(2024, 0, 1); // January 1st
      const day = provider.getNationalDay(date);
      expect(day.name).toBe("New Year's Day");
      expect(day.emoji).toBe('🎉');
    });

    it('returns Science Fiction Day for January 2nd', () => {
      const date = new Date(2024, 0, 2); // January 2nd
      const day = provider.getNationalDay(date);
      expect(day.name).toBe('Science Fiction Day');
      expect(day.emoji).toBe('🚀');
    });

    it('returns Pi Day for March 14th', () => {
      const date = new Date(2024, 2, 14); // March 14th
      const day = provider.getNationalDay(date);
      expect(day.name).toBe('Pi Day');
    });

    it('returns Leap Day for February 29th', () => {
      const date = new Date(2024, 1, 29); // February 29th (leap year)
      const day = provider.getNationalDay(date);
      expect(day.name).toBe('Leap Day');
      expect(day.emoji).toBe('🐸');
    });
  });

  describe('getTodaysNationalDay', () => {
    it('returns a valid day object', () => {
      const day = provider.getTodaysNationalDay();
      expect(day).toHaveProperty('name');
      expect(day).toHaveProperty('emoji');
      expect(day).toHaveProperty('desc');
    });
  });

  describe('getAllDays', () => {
    it('returns all 366 days', () => {
      const days = provider.getAllDays();
      expect(Object.keys(days).length).toBe(366);
    });

    it('includes all months', () => {
      const days = provider.getAllDays();
      const months = new Set(Object.keys(days).map(key => key.slice(0, 2)));
      expect(months.size).toBe(12);
    });
  });

  describe('hasDay', () => {
    it('returns true for existing dates', () => {
      expect(provider.hasDay(new Date(2024, 0, 1))).toBe(true);
      expect(provider.hasDay('01-01')).toBe(true);
    });
  });

  describe('DEFAULT_DAY', () => {
    it('is exported and has correct structure', () => {
      expect(DEFAULT_DAY).toHaveProperty('name', 'Awesome Day');
      expect(DEFAULT_DAY).toHaveProperty('emoji', '✨');
      expect(DEFAULT_DAY).toHaveProperty('desc', 'Make it count!');
    });
  });

  describe('clearCache', () => {
    it('clears cached data', () => {
      // Load data first
      provider.getAllDays();
      // Clear cache
      provider.clearCache();
      // Reload and verify still works
      const days = provider.getAllDays();
      expect(Object.keys(days).length).toBe(366);
    });
  });
});
