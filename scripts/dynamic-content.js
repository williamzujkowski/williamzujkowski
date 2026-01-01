const axios = require('axios');
const { NationalDayProvider } = require('./national-day-provider');

/**
 * Dynamic content generator for terminal SVG
 * Fetches real-time data and rotates through jokes/content
 */
class DynamicContentGenerator {
  // Birth date constant for uptime and stats calculations
  static BIRTH_DATE = new Date(1982, 3, 8); // April 8, 1982
  static BIRTH_YEAR = 1982;

  constructor() {
    this.nationalDayProvider = new NationalDayProvider();
    this.techJokes = [
      {
        q: "Why do programmers prefer dark mode?",
        a: "Because light attracts bugs! 🐛💡",
        category: "classic"
      },
      {
        q: "Why did the developer go broke?",
        a: "Because he used up all his cache! 💰💸",
        category: "money"
      },
      {
        q: "How many programmers does it take to change a light bulb?",
        a: "None. It's a hardware problem! 💡🔧",
        category: "classic"
      },
      {
        q: "Why do Java developers wear glasses?",
        a: "Because they don't C#! 👓☕",
        category: "languages"
      },
      {
        q: "What's a programmer's favorite hangout place?",
        a: "Foo Bar! 🍺🎯",
        category: "classic"
      },
      {
        q: "Why did the database administrator leave his wife?",
        a: "She had one-to-many relationships! 💔📊",
        category: "databases"
      },
      {
        q: "What do you call 8 hobbits?",
        a: "A hobbyte! 🧙‍♂️💾",
        category: "geek"
      },
      {
        q: "How do you comfort a JavaScript bug?",
        a: "You console it! 🪲🖥️",
        category: "javascript"
      },
      {
        q: "Why was the function sad after a break up?",
        a: "It had no closure! 💔➡️",
        category: "javascript"
      },
      {
        q: "What's the object-oriented way to become wealthy?",
        a: "Inheritance! 💰🏰",
        category: "oop"
      },
      {
        q: "Why did the Python data scientist get arrested?",
        a: "He was caught trying to import pandas illegally! 🐼🚨",
        category: "python"
      },
      {
        q: "What did the router say to the doctor?",
        a: "It hurts when IP! 🌐💉",
        category: "networking"
      },
      {
        q: "Why do programmers always mix up Halloween and Christmas?",
        a: "Because Oct 31 == Dec 25! 🎃🎄",
        category: "classic"
      },
      {
        q: "What's a pirate's favorite programming language?",
        a: "You'd think it's R, but their first love is the C! 🏴‍☠️⚓",
        category: "languages"
      },
      {
        q: "Why did the developer get stuck in the shower?",
        a: "The shampoo bottle said: Lather, Rinse, Repeat! 🚿🔁",
        category: "loops"
      },
      {
        q: "What's the best thing about a Boolean?",
        a: "Even if you're wrong, you're only off by a bit! 0️⃣1️⃣",
        category: "logic"
      },
      {
        q: "Why do programmers hate nature?",
        a: "Too many bugs! 🐛🌳",
        category: "classic"
      },
      {
        q: "What's a programmer's favorite exercise?",
        a: "Git push! Then git pull! 💪🏋️",
        category: "git"
      },
      {
        q: "Why did the AI break up with the ML model?",
        a: "It found someone with better parameters! 🤖💔",
        category: "ai"
      },
      {
        q: "How do you generate a random string?",
        a: "Put a fresh intern in front of vim and ask them to exit! 😅",
        category: "vim"
      },
      {
        q: "What's a SQL query's favorite music?",
        a: "Hip-Hop! Because it's all about the JOINS! 🎵🔗",
        category: "databases"
      },
      {
        q: "Why was the JavaScript developer sad?",
        a: "Because they didn't Node how to Express themselves! 😢🟢",
        category: "javascript"
      },
      {
        q: "What did the DNS say to the browser?",
        a: "I'll resolve this for you! 🌐✅",
        category: "networking"
      },
      {
        q: "Why don't backend developers like beaches?",
        a: "Too many shells and not enough servers! 🏖️🖥️",
        category: "backend"
      },
      {
        q: "What's Thanos' favorite data structure?",
        a: "A perfectly balanced binary tree! ⚖️🌳",
        category: "data-structures"
      }
    ];
  }

  /**
   * Calculate day of year (1-366) for a given date
   * @param {Date} date - The date to calculate day of year for
   * @returns {number} Day of year (1-366)
   */
  getDayOfYear(date) {
    return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
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
    const index = this.getDayOfYear(date) % this.techJokes.length;
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
   * Calculate uptime in years based on birth year
   */
  calculateUptime(currentDate) {
    return currentDate.getFullYear() - DynamicContentGenerator.BIRTH_YEAR;
  }

  /**
   * Generate dynamic stats based on current date
   */
  generateStats(date) {
    const uptime = this.calculateUptime(date);
    const daysAlive = Math.floor((date - DynamicContentGenerator.BIRTH_DATE) / (1000 * 60 * 60 * 24));
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
   * Get sequence rotation (0, 1, 2) based on date
   * Day 0: Core + Easter Egg (telnet towel)
   * Day 1: DevOps rotation (git log, docker, sudo)
   * Day 2: Network rotation (ping, curl, top)
   */
  getSequenceRotation(date) {
    return this.getDayOfYear(date) % 3;
  }

  /**
   * Generate git log commits (10 total, rotate 5 per day)
   */
  generateGitLog(date) {
    const allCommits = [
      { hash: '7f3a9b2', msg: 'feat: add terminal rotation system', time: '3 hours ago' },
      { hash: 'c5e8d41', msg: 'fix: resolve docker network conflicts', time: '5 hours ago' },
      { hash: '9a1b6f7', msg: 'docs: update API documentation', time: '8 hours ago' },
      { hash: '2d4c8e9', msg: 'refactor: optimize database queries', time: '12 hours ago' },
      { hash: 'b8f7a3c', msg: 'chore: update dependencies to latest', time: '1 day ago' },
      { hash: 'e4a9c2d', msg: 'feat: implement dark mode toggle', time: '2 days ago' },
      { hash: '6c7f1b8', msg: 'test: add integration test suite', time: '2 days ago' },
      { hash: 'a3d5e9f', msg: 'fix: patch security vulnerabilities', time: '3 days ago' },
      { hash: '1f8b4c6', msg: 'feat: add WebSocket support', time: '4 days ago' },
      { hash: '5e2a7d9', msg: 'style: apply consistent formatting', time: '5 days ago' }
    ];

    // Rotate 5 commits per day deterministically
    const startIndex = (this.getDayOfYear(date) % 2) * 5;
    return allCommits.slice(startIndex, startIndex + 5);
  }

  /**
   * Generate docker containers (7 total, show 3 per day)
   */
  generateDockerContainers(date) {
    const allContainers = [
      { id: 'f3a9c7b2', image: 'nginx:alpine', status: 'Up 3 hours', ports: '0.0.0.0:80->80/tcp' },
      { id: 'e8d4c1a5', image: 'postgres:15', status: 'Up 2 days', ports: '0.0.0.0:5432->5432/tcp' },
      { id: 'b7f9a3e8', image: 'redis:7-alpine', status: 'Up 5 hours', ports: '0.0.0.0:6379->6379/tcp' },
      { id: 'c2d8e6f1', image: 'node:20-slim', status: 'Up 1 hour', ports: '0.0.0.0:3000->3000/tcp' },
      { id: 'a5f7c9d3', image: 'mongo:7', status: 'Up 12 hours', ports: '0.0.0.0:27017->27017/tcp' },
      { id: 'd1e8b4a6', image: 'grafana/grafana', status: 'Up 3 days', ports: '0.0.0.0:3001->3000/tcp' },
      { id: 'f9c3a7e2', image: 'traefik:latest', status: 'Up 1 day', ports: '0.0.0.0:443->443/tcp' }
    ];

    // Rotate 3 containers per day deterministically
    const startIndex = (this.getDayOfYear(date) % 3) * 2;
    return allContainers.slice(startIndex, Math.min(startIndex + 3, allContainers.length));
  }

  /**
   * Generate network ping statistics (dynamic values)
   */
  generateNetworkStats(date) {
    // Use day of year as seed for consistent but varied stats
    const seed = this.getDayOfYear(date) % 100;

    const minMs = 12 + (seed % 8);
    const avgMs = minMs + 3 + (seed % 5);
    const maxMs = avgMs + 5 + (seed % 10);
    const packetLoss = seed % 10 === 0 ? 1 : 0; // 10% chance of 1% loss

    return {
      packets_sent: 5,
      packets_received: 5 - packetLoss,
      packet_loss: packetLoss,
      min_ms: minMs.toFixed(3),
      avg_ms: avgMs.toFixed(3),
      max_ms: maxMs.toFixed(3),
      mdev_ms: (1.2 + (seed % 3) * 0.3).toFixed(3)
    };
  }

  /**
   * Generate complete dynamic content for terminal
   */
  async generateContent() {
    const currentTime = await this.fetchAccurateTime();
    const nationalDay = this.nationalDayProvider.getNationalDay(currentTime);
    const joke = this.getJokeOfDay(currentTime);
    const stats = this.generateStats(currentTime);
    const timestamp = this.formatDateTime(currentTime);
    const rotation = this.getSequenceRotation(currentTime);
    const gitLog = this.generateGitLog(currentTime);
    const dockerContainers = this.generateDockerContainers(currentTime);
    const networkStats = this.generateNetworkStats(currentTime);

    return {
      timestamp,
      joke,
      stats,
      currentTime,
      nationalDay,
      rotation,
      gitLog,
      dockerContainers,
      networkStats
    };
  }
}

module.exports = DynamicContentGenerator;
