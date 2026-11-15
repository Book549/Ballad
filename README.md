[![Discord Bots](https://discordbots.org/api/widget/251239170058616833.png)](https://discordbots.org/bot/251239170058616833)

# Kotoba Discord Bot

A feature-rich Discord bot designed for Japanese language learning, dictionary lookups, interactive quizzes, and multiplayer games.

---

## Features

* **Interactive Quizzes**:
  * Extensive quiz library covering JLPT (N5–N1), Kanken, common vocabulary, anime words, light novels, yojijukugo, trivia, and custom decks.
  * Multiple game modes: **Normal**, **Review**, **Conquest**, and **Mastery**.
  * Speed options (e.g. `nodelay`) for lightning-fast quiz sessions.
  * 30-day visual quiz statistics charts (`k!quiz stats`) rendered via the background worker.
* **Shiritori (Japanese Word-Chain Game)**:
  * Interactive turn-based games with Japanese dictionary verification.
  * `shiritori_forever` dedicated channels for endless asynchronous multiplayer word chaining.
* **Dictionary & Reference**:
  * Jisho word and Kanji lookups with readings, radicals, compounds, and stroke counts (`k!jisho`, `k!kanji`).
  * Animated and static stroke-order diagrams (`k!strokeorder`).
  * Kanji drawing practice canvas (`k!draw`).
  * Example sentences from Jisho and real-life usage examples from Yourei.jp (`k!examples`, `k!yourei`).
  * Random Japanese vocabulary and Kanji by JLPT level (`k!random N3`).
  * Spanish-Japanese dictionary search via Hispadic (`k!hispadic`).
* **Furigana Rendering**:
  * Real-time Furigana image generation over Kanji text with customizable font sizing and colors (`k!furigana`).
* **Audio Pronunciation & Jukebox**:
  * Native speaker audio pronunciation lookup via Forvo (`k!pronounce`).
  * Voice channel music streaming from YouTube (`k!jukebox`).
* **Anime & Translation Utilities**:
  * Anime search powered by Kitsu (`k!anime`).
  * Multi-language translation via Google Translate (`k!translate`).
* **Automated Schedules & Server Leaderboards**:
  * Automate daily or hourly quizzes directly into server channels (`k!schedule`).
  * Server-wide and global player scoreboards (`k!leaderboard`).
* **Discord Slash Commands & Interactions**:
  * Supports modern Discord slash commands / application commands alongside message prefixes.

---

## Repository Structure

```
├── bot/               # Discord bot source code, commands, quiz engine, and message processors
├── common/            # Shared rules, limits, defaults, and deck validation logic
├── node-common/       # Mongoose models, resource database builder, fonts, and Shiritori engine
├── worker/            # Microservice for CPU-intensive tasks (furigana image rendering, quiz stats)
├── cloud_functions/   # Optional serverless HTTP endpoints (furigana parser, Hispadic lookup)
├── katakana/          # Katakana vocabulary word lists by difficulty (N5–N1, Katakana_words)
├── resources/         # Built-in quiz decks, fonts, audio, and raw dictionary archives (JMDict, KanjiVG)
├── shared_data/       # Persistent storage for user custom decks (custom_decks/)
├── config/            # Configuration files and templates (config_sample.js)
└── docker-compose.yml # Containerized orchestration for the bot, worker, and MongoDB
```

---

## Prerequisites

* **Node.js**: Node.js **v24.12.0** or compatible (see [.nvmrc](./.nvmrc)).
* **System Native Build Libraries**:
  Building native addons (`canvas` and `better-sqlite3`) requires native build tools and graphics libraries:
  ```sh
  # Debian / Ubuntu
  sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev ffmpeg
  ```
  *(Note: `ffmpeg` is required if you plan to use the voice channel jukebox command `k!jukebox`).*
* **Discord Bot Token**:
  * Create an application and bot on the [Discord Developer Portal](https://discord.com/developers/applications).
  * In the **Bot** tab, enable the following **Privileged Gateway Intents**:
    * **Server Members Intent**
    * **Message Content Intent**
  * Required bot permissions: *Send Messages*, *Embed Links*, *Attach Files*, *Add Reactions*, and *Connect/Speak* (for voice jukebox).
* **Database (MongoDB)**:
  * **No external database setup is required for local development.** If no MongoDB instance is detected on `127.0.0.1:27017`, the bot automatically launches an embedded local MongoDB instance that persists data directly to `bot/data/mongo_data/`.
  * If you already have MongoDB running or want to connect to a remote instance, set the `MONGO_HOST` environment variable (e.g. `export MONGO_HOST=127.0.0.1:27017`).

---

## Configuration

1. Copy the sample configuration file:
   ```sh
   cp config/config_sample.js config/config.js
   ```
2. Open `config/config.js` and set the desired configuration options:
   * `bot.botToken`: Your Discord bot token (required, format: `'Bot YOUR_BOT_TOKEN'`).
   * `bot.botAdminIds`: Array of Discord user IDs with bot administrator privileges.
   * `bot.apiKeys`: Optional third-party API keys to enable additional commands:
     * `youtube`: Required for `k!jukebox` voice streaming.
     * `googleTranslate`: Required for `k!translate`.
     * `forvo`: Required for `k!pronounce` audio pronunciation files.
     * `websterCth`: Merriam-Webster API key for certain English quiz decks.
     * `oxfordAppId` & `oxfordApiKey`: Oxford Dictionaries API credentials.
   * `bot.hispadicApiUri`: Trigger URL for the Hispadic Spanish-Japanese cloud function (optional, for `k!hispadic`).
   * `worker.furiganaApiUri`: Trigger URL for the Furigana parser cloud function (optional, used by the worker for `k!furigana`).
   * `bot.botWebClientBaseUri`: Base URL for external web links (defaults to `'https://kotobaweb.com'`).
   * `bot.dynamicDecksUrl`: Optional URL to lazily fetch custom `deck_list.json` quiz decks.
3. *(Optional GCP Logging)*: Place service account credentials at `config/gcloud_key.json` to stream logs to Google Cloud Stackdriver/Logging.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MONGO_HOST` | `127.0.0.1:27017` | MongoDB connection host and port. When pointed to localhost and no server is listening, the bot automatically boots an embedded local database in `bot/data/mongo_data/`. |
| `WORKER_HOST` | `localhost` | Host and port of the background worker HTTP service (used by the bot for furigana rendering and quiz stats). |
| `PORT` | `80` | HTTP port for the background worker microservice. Set to an unprivileged port (e.g. `8080`) if running worker without root. |
| `FORCE_COLOR` | `1` | Forces ANSI color formatting in console and container log output. |

---

## Development Setup

### 1. Install Shared Dependencies
```sh
cd node-common
npm ci
```

### 2. Install Bot Dependencies & Build Resources
The bot uses a compiled SQLite resource database (`generated/resources.dat`) generated from the raw dictionary archives in `resources/`.

```sh
cd ../bot
npm ci
npm run buildresources # This takes a couple of minutes on first run
```

### 3. Start the Bot
```sh
npm start
```
The bot will start, connect to MongoDB (or launch its embedded database), and connect to Discord.

### 4. (Optional) Setup and Start the Background Worker
The worker service offloads CPU-intensive tasks such as Furigana PNG rendering and generating 30-day user quiz statistics charts (`k!quiz stats`):

```sh
cd ../worker
npm ci

# The worker requires generated/resources.dat.
# You can reuse the database already built in step 2 to save time:
mkdir -p generated
cp ../bot/generated/resources.dat ./generated/resources.dat
# (Or build it separately with: npm run buildresources)

# Start worker (use PORT=8080 if running without root privileges)
PORT=8080 npm start
```
*Note: If running worker on a custom port like `8080`, start the bot with `WORKER_HOST=localhost:8080 npm start`.*

### VS Code Debugging
Pre-configured debugging profiles are available under `.vscode/launch.json`:
* **Launch bot**: Starts `bot/src/start.js` in the debugger.
* **Launch Worker**: Starts `worker/src/index.js` in the debugger.
* **Build resources**: Runs `npm run buildresources` in `bot/`.
* **Mocha Current File**: Runs Mocha tests on the active test file.

---

## Command Reference

The default bot prefix is `k!` (e.g. `k!help`). The bot also supports Discord slash commands.

### Dictionary & Language Reference
| Command | Aliases | Description |
|---|---|---|
| `k!jisho <word>` | `k!j`, `k!ja`, `k!en` | Search Jisho.org for Japanese or English definitions (supports `--big` and `--small` view modes). |
| `k!jn <word>` | | Search Jisho without interactive reaction buttons. |
| `k!kanji <kanji>` | `k!k` | Detailed Kanji lookup: stroke count, readings, meanings, radicals, and compound words. |
| `k!strokeorder <kanji>` | `k!so` | Displays stroke order diagram and stroke animation for a Kanji. |
| `k!draw <kanji>` | | Interactive Kanji stroke-order drawing and practice canvas. |
| `k!examples <word>` | `k!ex` | Search Jisho for Japanese/English example sentences. |
| `k!yourei <word>` | `k!y` | Search real-world Japanese usage sentences from Yourei.jp. |
| `k!random [level]` | `k!r` | Fetch random words or Kanji (e.g. `k!r N3`, `k!r 1k`). |
| `k!pronounce <word>` | `k!p` | Audio pronunciation clips recorded by native Japanese speakers via Forvo. |
| `k!furigana <text>` | `k!furi`, `k!f` | Renders a styled image of Japanese text with Furigana annotations over Kanji (requires worker). |
| `k!hispadic <word>` | `k!es` | Search the Hispadic Spanish-Japanese dictionary (requires cloud function). |
| `k!translate <text>` | `k!t` | Translate text between languages using Google Translate. |

### Quizzes & Multiplayer Games
| Command | Aliases | Description |
|---|---|---|
| `k!quiz <deck> [options]` | `k!q` | Start a quiz session (e.g. `k!quiz N5`, `k!quiz katakana_n5`, `k!quiz nodelay`). |
| `k!quiz katakana` | | View Katakana quizzes grouped by difficulty level (N5–N1, loanwords). |
| `k!quiz katakana_n5` | `k!quiz kn5`, `k!quiz katakana 5` | Quiz Katakana vocabulary for JLPT N5 (Beginner). |
| `k!quiz katakana_n1` | `k!quiz kn1`, `k!quiz katakana 1` | Quiz Katakana vocabulary for JLPT N1 (Advanced). |
| `k!quiz Katakana_words` | `k!quiz katakana_words` | Quiz all Katakana loanword vocabulary (4,100+ words). |
| `k!quiz stop` | `k!stop`, `k!s` | Stop the currently running quiz or Shiritori session in the channel. |
| `k!quiz stats` | | Generate graphical charts showing 30-day quiz performance, accuracy, and deck distribution (requires worker). |
| `k!quizsessions` | | List currently active quiz sessions across the bot. |
| `k!shiritori` | `k!sh` | Start a real-time turn-based multiplayer Shiritori game. |
| `k!shiritoriforever` | | Designate a channel for asynchronous, endless multiplayer Shiritori word-chaining. |
| `k!leaderboard` | `k!lb` | Display server and global player score leaderboards. |
| `k!resetserverscoreboard` | | Reset quiz scores and leaderboard for the current server (Admin only). |

### Media & Utilities
| Command | Aliases | Description |
|---|---|---|
| `k!jukebox <query / url>` | `k!jb` | Join your voice channel and stream audio/music from YouTube (requires YouTube API key & ffmpeg). |
| `k!anime <title>` | `k!a` | Search anime information, synopsis, and rating via Kitsu. |
| `k!settings` | `k!set` | View and customize bot settings for your server or channel (quiz timing, fonts, furigana size/colors, etc.). |
| `k!schedule` | | Schedule recurring automated daily or hourly quizzes for a channel. |
| `k!scheduleupdate` | | Update or modify existing scheduled quizzes. |
| `k!help [command]` | `k!h` | Interactive help menu with command details and syntax examples. |
| `k!invite` | | Get the bot invite link for your server. |
| `k!about` | | Show bot metadata, libraries, framework versions, and data credits. |

---

## Running with Docker Compose

You can run the bot, the worker, and MongoDB in isolated containers using Docker Compose:

```sh
# Start all services in the background
docker compose up -d kotoba-bot kotoba-worker mongo_readwrite
```
*(Or `docker-compose up` depending on your Docker installation).*

### Services
* `kotoba-bot`: The Discord bot service.
* `kotoba-worker`: The background worker microservice for rendering Furigana PNGs and quiz stats charts.
* `mongo_readwrite`: MongoDB 8 container configured with WiredTiger cache limits.

### Volume Mounts & Persistence
* `./user_data/bot` -> `/var/app/data`: Persistent bot runtime state.
* `./user_data/shared_data` -> `/var/shared_data`: Storage directory for custom quiz decks.
* `./katakana` -> `/var/katakana`: Katakana vocabulary data files (e.g. `N1.txt`–`N5.txt`, `Katakana_words.txt`).
* `./user_data/mongo_readwrite_data` -> `/data/db`: MongoDB persistent database data.
* `./config` -> `/var/config`: Host configuration files.

> [!NOTE]
> The default Dockerfiles specify `FROM arm64v8/node:24.12.0`. If building on an x86_64 / AMD64 machine, replace `arm64v8/node:24.12.0` with `node:24.12.0` in `bot/Dockerfile` and `worker/Dockerfile`.

---

## Optional: Cloud Functions (Furigana & Hispadic)

Commands like `k!furigana` (parsing) and `k!hispadic` use lightweight HTTP endpoints located in the [`cloud_functions/`](./cloud_functions) folder. You can deploy them to Google Cloud Functions (or any serverless platform) and link them in `config/config.js`:

### 1. Furigana Parser Cloud Function
* **Path**: `cloud_functions/furigana`
* **Trigger**: HTTP (Allow unauthenticated invocations)
* **Runtime**: Node.js
* **Entry Point / Function to Execute**: `getFurigana`
* **Config**: Add the deployed function URL to `config/config.js` under `worker.furiganaApiUri`.

### 2. Hispadic Search Cloud Function
* **Path**: `cloud_functions/hispadic` (deploy `index.js`, `hispadic.js`, and `package.json`)
* **Trigger**: HTTP (Allow unauthenticated invocations)
* **Runtime**: Node.js
* **Entry Point / Function to Execute**: `search`
* **Config**: Add the deployed function URL to `config/config.js` under `bot.hispadicApiUri`.

---

## Third-Party Data & Credits

Kotoba uses data, APIs, and resources from the following sources:
* [Jisho.org](https://jisho.org/about) - Japanese-English dictionary and Kanji data
* [KanjiVG](http://kanjivg.tagaini.net/) - Kanji stroke order diagrams and vector data
* [Forvo](https://forvo.com/) - Native speaker pronunciation audio
* [EDICT / JMDict](http://www.edrdg.org/jmdict/edict.html) - Japanese electronic dictionary files
* [Princeton University Japanese WordNet](http://compling.hss.ntu.edu.sg/wnja/index.en.html) - Semantic lexicon for Japanese
* [Yourei.jp](http://yourei.jp/) - Real-world Japanese example sentences
* [Hispadic](http://hispadic.byethost3.com/) - Spanish-Japanese dictionary
* [Weblio](http://weblio.jp/) - Japanese dictionary reference
* [Kitsu](https://kitsu.io/) - Anime search API
* [Google Translate](https://translate.google.com/) - Text translation
* [YouTube](https://www.youtube.com/) - Jukebox audio streaming
* [Merriam-Webster](https://www.merriam-webster.com) - English dictionary data
* [Oxford Dictionaries](https://www.oxforddictionaries.com/) - English lexical data
* [Japanese Wiktionary](https://ja.wiktionary.org) - Japanese vocabulary definitions
* [Jonathan Waller's Tanos](http://www.tanos.co.uk/) - JLPT study lists and resources
* Community quiz creators who have contributed custom decks and question data.

---

## Community & Support

* **Discord Support Server**: Join the [Kotoba Discord Server](https://discord.gg/S92qCjbNHt) for assistance, feedback, and updates.
* **Issues**: Report bugs or feature requests on the [GitHub Issues](https://github.com/mistval/kotoba/issues) tracker.
