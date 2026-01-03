/**
 * National Day Provider
 * Provides fun/awareness day information for each day of the year.
 * Loads data from content/national_days.yaml.
 * @module national-day-provider
 */

const { YamlContentLoader } = require('./content-loader');

/**
 * Default fallback day when no data is found.
 */
const DEFAULT_DAY = {
  name: 'Awesome Day',
  emoji: '✨',
  desc: 'Make it count!'
};

/**
 * Provider for national/fun day information.
 * Uses YAML data file for 366-day coverage.
 */
class NationalDayProvider {
  /**
   * Create a new national day provider.
   * @param {YamlContentLoader} [loader] - Optional content loader instance
   */
  constructor(loader) {
    this.loader = loader || new YamlContentLoader();
  }

  /**
   * Get the national day for a given date.
   * @param {Date} date - The date to look up
   * @returns {Object} The day object with name, emoji, and desc
   */
  getNationalDay(date) {
    const day = this.loader.getNationalDay(date);
    return day || DEFAULT_DAY;
  }

  /**
   * Get today's national day.
   * @returns {Object} Today's national day data
   */
  getTodaysNationalDay() {
    return this.getNationalDay(new Date());
  }

  /**
   * Get all loaded national days (for testing/debugging).
   * @returns {Object} Map of MM-DD keys to day objects
   */
  getAllDays() {
    return this.loader.loadNationalDays();
  }

  /**
   * Check if a specific date has a national day entry.
   * @param {Date|string} date - Date object or MM-DD string
   * @returns {boolean} True if entry exists
   */
  hasDay(date) {
    return this.loader.getNationalDay(date) !== null;
  }

  /**
   * Clear cached data (useful for testing).
   */
  clearCache() {
    this.loader.clearCache();
  }
}

module.exports = { NationalDayProvider, DEFAULT_DAY };
