[![Discord Bots](https://discordbots.org/api/widget/251239170058616833.png)](https://discordbots.org/bot/251239170058616833)

# Kotoba Discord Bot

A feature-rich Discord bot designed for Japanese language learning, dictionary lookups, and multiplayer games.

## Features

* **Interactive Quizzes**:
  * Extensive quiz library covering JLPT (N5–N1), Kanken, common vocabulary, anime words, and custom decks.
  * Multiple modes: Normal, Review, Conquest, and Mastery.
* **Shiritori (Japanese Word-Chain Game)**:
  * Interactive turn-based games with dictionary verification.
  * `shiritori_forever` dedicated channels for endless multiplayer word-chain fun.
* **Dictionary & Reference**:
  * Jisho word and Kanji searches with stroke-order diagrams.
  * Kanji reading lookups, radical decomposition, and compound search.
  * Real-time Furigana image generation over Kanji text.
  * Example sentence lookups with Yourei.
  * Native audio pronunciation lookup via Forvo.
* **Scheduled Quizzes & Server Leaderboards**:
  * Automate daily or hourly quizzes directly into server channels.
  * Server-wide and global player scoreboards.

---

## Repository Structure

```
├── bot/               # Discord bot source code, commands, quiz engine, and message processors
├── common/            # Shared rules, limits, and deck validation logic
├── node-common/       # Mongoose models, resource database builder, fonts, and Shiritori engine
├── worker/            # Microservice for CPU-intensive tasks (furigana image rendering, quiz stats)
├── cloud_functions/   # Optional GCP Cloud Function endpoints (furigana parser, Hispadic)
├── resources/         # Built-in quiz decks, fonts, and dictionary archives (JMDict, KanjiVG)
├── config/            # Configuration templates (config_sample.js)
├── docker-compose.yml # Containerized orchestration for the bot, worker, and MongoDB
└── Katakana_words.txt # Katakana loanword reference vocabulary
```

---

## Prerequisites

* **Node.js**: Check [.nvmrc](./.nvmrc) for the recommended Node.js version.
* **Discord Bot Token**: Create an application and bot on the [Discord Developer Portal](https://discord.com/developers/applications).
  * Enable **Server Members Intent** and **Message Content Intent**.
* *(Database)*: **No external database setup is required.** The bot automatically runs an embedded local database that persists data directly to `bot/data/mongo_data/`. (You can still connect to an external MongoDB by setting `MONGO_HOST` if desired).

---

## Configuration

1. Copy the sample configuration file:
   ```sh
   cp config/config_sample.js config/config.js
   ```
2. Open `config/config.js` and set:
   * `bot.botToken`: Your Discord bot token (required).
   * `bot.botAdminIds`: Your Discord User ID (optional).
   * `bot.apiKeys`: Optional API keys (YouTube, Google Translate, Forvo) to enable extra commands.

---

## Development Setup

### 1. Install Dependencies & Build Resources
The bot uses SQLite resource databases built from the raw dictionaries in `resources/`.

```sh
# 1. Install node-common dependencies
cd node-common
npm ci

# 2. Install bot dependencies and generate resource databases
cd ../bot
npm ci
npm run buildresources # This takes a few minutes on first run
```

### 3. Start the Bot
```sh
npm start
```

### 4. (Optional) Start the Background Worker
The worker offloads heavy tasks like Furigana PNG rendering and user quiz stat calculations:
```sh
cd ../worker
npm ci
npm run buildresources
npm start
```

VS Code debugging configurations are also available under `.vscode/launch.json` (**Launch bot** and **Launch Worker**).

---

## Running with Docker Compose

You can run the bot, the worker, and MongoDB using Docker:

```sh
sudo docker-compose up kotoba-bot kotoba-worker mongo_readwrite
```

*(Note: Docker images in the default compose file are configured for ARM64. If building on x86_64/AMD64, update `arm64v8/node` to `node` in `bot/Dockerfile` and `worker/Dockerfile`).*

---

## Optional: Cloud Functions (Furigana & Hispadic)

Commands like `k!furigana` (parsing) and `k!hispadic` call lightweight HTTP endpoints. Code for these endpoints is located in the [`cloud_functions/`](file:///home/book549/Documents/code/Ballad/cloud_functions) folder. You can deploy them to Google Cloud Functions (or any serverless platform) and add their trigger URLs to `config/config.js`.

---

## Third-Party Data & Credits

Data from the following sources is used in Kotoba:
* [Jisho.org](https://jisho.org/about)
* [KanjiVG](http://kanjivg.tagaini.net/)
* [Forvo](https://forvo.com/)
* [EDICT / JMDict](http://www.edrdg.org/jmdict/edict.html)
* [Princeton University Japanese WordNet](http://compling.hss.ntu.edu.sg/wnja/index.en.html)
* [Google Translate](https://translate.google.com/)
* [YouTube](https://www.youtube.com/)
