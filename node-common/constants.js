const path = require('path');
const fs = require('fs');

const CUSTOM_DECK_DIR = path.join(__dirname, '..', 'shared_data', 'custom_decks');
const KATAKANA_DIR = path.join(__dirname, '..', 'katakana');

fs.mkdirSync(CUSTOM_DECK_DIR, { recursive: true });

module.exports = {
  CUSTOM_DECK_DIR,
  KATAKANA_DIR,
};
