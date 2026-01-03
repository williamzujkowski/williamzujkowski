/**
 * Load content from YAML files for template rendering.
 * Provides typed content loading with validation.
 * @module content-loader
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Custom error for content loading failures.
 */
class ContentLoadError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ContentLoadError';
    this.cause = cause;
  }
}

/**
 * Content loader for YAML-based joke and national day data.
 */
class YamlContentLoader {
  /**
   * Create a new content loader.
   * @param {string} [contentDir] - Path to content directory
   */
  constructor(contentDir) {
    this.contentDir = contentDir || path.join(__dirname, '..', 'content');
    this._jokesCache = null;
    this._nationalDaysCache = null;
    this._fortunesCache = null;
  }

  /**
   * Load all jokes from YAML file.
   * @returns {Array<Object>} Array of joke objects
   * @throws {ContentLoadError} If file not found or parse fails
   */
  loadJokes() {
    if (this._jokesCache) {
      return this._jokesCache;
    }

    const jokesFile = path.join(this.contentDir, 'jokes.yaml');
    try {
      const content = fs.readFileSync(jokesFile, 'utf8');
      this._jokesCache = yaml.load(content) || [];
      return this._jokesCache;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new ContentLoadError(`Failed to load jokes: ${error.message}`, error);
    }
  }

  /**
   * Get joke by index (deterministic selection).
   * @param {number} index - Day of year for rotation
   * @returns {Object|null} Joke object or null if none available
   */
  getJokeByIndex(index) {
    const jokes = this.loadJokes();
    if (jokes.length === 0) {
      return null;
    }
    return jokes[index % jokes.length];
  }

  /**
   * Get random joke (non-deterministic).
   * @returns {Object|null} Random joke object or null
   */
  getRandomJoke() {
    const jokes = this.loadJokes();
    if (jokes.length === 0) {
      return null;
    }
    const index = Math.floor(Math.random() * jokes.length);
    return jokes[index];
  }

  /**
   * Load all fortunes from YAML file.
   * @returns {Array<Object>} Array of fortune objects
   * @throws {ContentLoadError} If parse fails
   */
  loadFortunes() {
    if (this._fortunesCache) {
      return this._fortunesCache;
    }

    const fortunesFile = path.join(this.contentDir, 'fortunes.yaml');
    try {
      const content = fs.readFileSync(fortunesFile, 'utf8');
      this._fortunesCache = yaml.load(content) || [];
      return this._fortunesCache;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new ContentLoadError(`Failed to load fortunes: ${error.message}`, error);
    }
  }

  /**
   * Get fortune by index (deterministic selection).
   * @param {number} index - Day of year for rotation
   * @returns {Object|null} Fortune object or null if none available
   */
  getFortuneByIndex(index) {
    const fortunes = this.loadFortunes();
    if (fortunes.length === 0) {
      return null;
    }
    return fortunes[index % fortunes.length];
  }

  /**
   * Load national days from YAML file.
   * @returns {Object} Map of MM-DD to national day data
   * @throws {ContentLoadError} If file not found or parse fails
   */
  loadNationalDays() {
    if (this._nationalDaysCache) {
      return this._nationalDaysCache;
    }

    const daysFile = path.join(this.contentDir, 'national_days.yaml');
    try {
      const content = fs.readFileSync(daysFile, 'utf8');
      this._nationalDaysCache = yaml.load(content) || {};
      return this._nationalDaysCache;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }
      throw new ContentLoadError(`Failed to load national days: ${error.message}`, error);
    }
  }

  /**
   * Get national day for a specific date.
   * @param {string|Date} date - Date as MM-DD string or Date object
   * @returns {Object|null} National day data or null if not found
   */
  getNationalDay(date) {
    let dateKey;
    if (date instanceof Date) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateKey = `${month}-${day}`;
    } else {
      dateKey = date;
    }

    const days = this.loadNationalDays();
    return days[dateKey] || null;
  }

  /**
   * Get today's national day.
   * @returns {Object|null} Today's national day or null
   */
  getTodaysNationalDay() {
    return this.getNationalDay(new Date());
  }

  /**
   * Clear cached data (useful for testing or reloading).
   */
  clearCache() {
    this._jokesCache = null;
    this._nationalDaysCache = null;
    this._fortunesCache = null;
  }

  /**
   * Validate joke schema.
   * @param {Object} joke - Joke object to validate
   * @returns {boolean} True if valid
   */
  static validateJoke(joke) {
    return (
      joke !== null &&
      typeof joke === 'object' &&
      typeof joke.q === 'string' &&
      typeof joke.a === 'string'
    );
  }

  /**
   * Validate national day schema.
   * @param {Object} day - National day object to validate
   * @returns {boolean} True if valid
   */
  static validateNationalDay(day) {
    return (
      typeof day === 'object' &&
      typeof day.name === 'string' &&
      typeof day.desc === 'string'
    );
  }
}

module.exports = {
  YamlContentLoader,
  ContentLoadError
};
