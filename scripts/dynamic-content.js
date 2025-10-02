const axios = require('axios');

/**
 * Dynamic content generator for terminal SVG
 * Fetches real-time data and rotates through jokes/content
 */
class DynamicContentGenerator {
  constructor() {
    this.techJokes = [
      {
        q: "Why do programmers prefer dark mode?",
        a: "Because light attracts bugs!"
      },
      {
        q: "Why did the developer go broke?",
        a: "Because he used up all his cache!"
      },
      {
        q: "How many programmers does it take to change a light bulb?",
        a: "None. It's a hardware problem!"
      },
      {
        q: "Why do Java developers wear glasses?",
        a: "Because they don't C#!"
      },
      {
        q: "What's a programmer's favorite hangout place?",
        a: "Foo Bar!"
      },
      {
        q: "Why did the database administrator leave his wife?",
        a: "She had one-to-many relationships!"
      },
      {
        q: "What do you call 8 hobbits?",
        a: "A hobbyte!"
      },
      {
        q: "How do you comfort a JavaScript bug?",
        a: "You console it!"
      },
      {
        q: "Why was the function sad after a break up?",
        a: "It had no closure!"
      },
      {
        q: "What's the object-oriented way to become wealthy?",
        a: "Inheritance!"
      },
      {
        q: "Why did the Python data scientist get arrested?",
        a: "He was caught trying to import pandas illegally!"
      },
      {
        q: "What did the router say to the doctor?",
        a: "It hurts when IP!"
      },
      {
        q: "Why do programmers always mix up Halloween and Christmas?",
        a: "Because Oct 31 == Dec 25!"
      },
      {
        q: "What's a pirate's favorite programming language?",
        a: "You'd think it's R, but their first love is the C!"
      },
      {
        q: "Why did the developer get stuck in the shower?",
        a: "The shampoo bottle said: Lather, Rinse, Repeat!"
      }
    ];
  }

  /**
   * Fetch current datetime from World Time API (more reliable than NIST)
   * Falls back to system time if API fails
   */
  async fetchAccurateTime() {
    try {
      // Try World Time API first
      const response = await axios.get('https://worldtimeapi.org/api/timezone/America/New_York', {
        timeout: 5000
      });

      if (response.data && response.data.datetime) {
        console.log('✓ Fetched accurate time from World Time API');
        return new Date(response.data.datetime);
      }
    } catch (error) {
      console.log('⚠ Time API failed, using system time:', error.message);
    }

    // Fallback to system time
    return new Date();
  }

  /**
   * Get joke for the day (deterministic based on date)
   */
  getJokeOfDay(date) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % this.techJokes.length;
    return this.techJokes[index];
  }

  /**
   * Format date/time for terminal display
   */
  formatDateTime(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dateNum = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day} ${month} ${dateNum} ${hours}:${minutes} EST ${year}`;
  }

  /**
   * Calculate uptime in years based on birth year (1990)
   */
  calculateUptime(currentDate) {
    const birthYear = 1990;
    const age = currentDate.getFullYear() - birthYear;
    return age;
  }

  /**
   * Generate dynamic stats based on current date
   */
  generateStats(date) {
    const uptime = this.calculateUptime(date);
    const daysAlive = Math.floor((date - new Date(1990, 0, 1)) / (1000 * 60 * 60 * 24));
    const coffeeConsumed = Math.floor(daysAlive * 2.1); // ~2 cups per day
    const bugsFixed = Math.floor(daysAlive * 2.7);
    const stackOverflowVisits = Math.floor(bugsFixed * 1.5);

    return {
      uptime,
      daysAlive,
      coffeeConsumed,
      bugsFixed,
      bugsCreated: bugsFixed - 1, // Always one less fixed than created :)
      stackOverflowVisits
    };
  }

  /**
   * Generate complete dynamic content for terminal
   */
  async generateContent() {
    const currentTime = await this.fetchAccurateTime();
    const joke = this.getJokeOfDay(currentTime);
    const stats = this.generateStats(currentTime);
    const timestamp = this.formatDateTime(currentTime);

    return {
      timestamp,
      joke,
      stats,
      currentTime
    };
  }
}

module.exports = DynamicContentGenerator;
