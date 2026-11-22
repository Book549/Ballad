# Project Updates

## Removed Commands

The following Discord commands and their associated helper modules have been removed:

- **`anime`** (`bot/src/discord_commands/kitsu_anime_search.js`, `bot/src/discord/create_anime_search_navigation.js`)
- **`hispadic`** (`bot/src/discord_commands/hispadic.js`)
- **`jukebox`** (`bot/src/discord_commands/jukebox.js`)
- **`furigana`** (`bot/src/discord_commands/furigana.js`)
- **`jisho`** (`bot/src/discord_commands/jisho_word_search.js`, `bot/src/discord_commands/jisho_word_search_no_command_buttons.js`)

Command references have also been updated in `bot/src/discord_commands/help.js`.

---

## Deck System Streamlining

All legacy built-in quiz decks not related to the `katakana/` directory have been removed:

- **Legacy Deck Files Removed**:
  - Removed 191 legacy JSON quiz decks from `resources/quiz_data/`.
  - Cleared built-in quiz deck tables (`QuizQuestions`, `QuizDecksMeta`, `QuizDecksMetaFTS`) in `bot/generated/resources.dat`.
- **Active Quiz Decks**:
  - Focused quiz sessions exclusively on Katakana reading quizzes located in `katakana/`:
    - `katakana_n5` / `kn5` (`katakana/N5.txt`)
    - `katakana_n4` / `kn4` (`katakana/N4.txt`)
    - `katakana_n3` / `kn3` (`katakana/N3.txt`)
    - `katakana_n2` / `kn2` (`katakana/N2.txt`)
    - `katakana_n1` / `kn1` (`katakana/N1.txt`)
    - `Katakana_words` (`katakana/Katakana_words.txt`)
- **Config & UI Updates**:
  - `bot/src/common/quiz/deck_list.json` updated to only list Katakana decks.
  - `bot/src/common/quiz/decks_content.js` interaction options updated to Katakana decks.
  - `bot/src/common/quiz/deck_loader.js` updated to prioritize loading from `katakana/`.
  - `bot/src/discord_commands/quiz.js` deck presets updated.

---

## Documentation Updates

- Updated `README.md` to remove references to the removed commands, cloud functions, and non-katakana decks.
