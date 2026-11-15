const fetch = require('node-fetch');
const Cache = require('kotoba-node-common').cache;
const staticDecks = require('./deck_list.json');
const constants = require('./../constants.js');
let config = { bot: { botWebClientBaseUri: 'https://kotobaweb.com' } };
try {
  config = require('../../../../config/config.js');
} catch (err) {
  // Use default if config.js not yet copied
}

const DECKS_CACHE_KEY = 'quizDeckList';
const CACHE_EXPIRATION_SECONDS = 60 * 60; // 1 hour

function getDecks() {
  return Cache.getCachedInProcess(DECKS_CACHE_KEY, CACHE_EXPIRATION_SECONDS, async () => {
    if (!config.bot.dynamicDecksUrl) {
      return staticDecks;
    }

    const response = await fetch(config.bot.dynamicDecksUrl);
    if (!response.ok) {
      return staticDecks;
    }

    return response.json();
  });
}

module.exports.createContent = async function(prefix) {
  const decks = await getDecks();

  return {
    embeds: [{
      title: 'Quiz',
      description: `Say **${prefix}quiz deckname** to start a quiz (Example: **${prefix}quiz N5**). Say **${prefix}quiz stop** to stop a quiz. Say **nodelay** after the deck name for a lightning fast quiz, for example: **k!quiz N1 nodelay**. For advanced help, say **${prefix}quiz help** or [visit me on the web](${config.bot.botWebClientBaseUri}/bot/quiz).`,
      color: constants.EMBED_NEUTRAL_COLOR,
      fields: decks.mainDecks.map(field => ({ name: field.name, value: field.value.replace(/<prefix>/g, prefix) })),
      footer: {
        icon_url: constants.FOOTER_ICON_URI,
        text: `You can mix any decks by using the + symbol. For example: ${prefix}quiz N5+N4+N3`,
      },
    }],
  };
};

module.exports.getCategoryHelp = async function(keyword, prefix = 'k!') {
  const decks = await getDecks();
  const subCategory = decks.subCategories.find(category => category.keyword === keyword);

  if (!subCategory) {
    return undefined;
  }

  if (keyword.toLowerCase() === 'katakana') {
    return {
      embeds: [{
        title: 'Katakana Quizzes by Difficulty',
        description: `Say **${prefix}quiz <deckname>** to start a Katakana quiz. Choose your difficulty level:\n\n` +
          `• **${prefix}quiz katakana_n5** (or **${prefix}quiz kn5**, **${prefix}quiz katakana 5**) — JLPT N5 (Beginner) [127 words]\n` +
          `• **${prefix}quiz katakana_n4** (or **${prefix}quiz kn4**, **${prefix}quiz katakana 4**) — JLPT N4 (Elementary) [65 words]\n` +
          `• **${prefix}quiz katakana_n3** (or **${prefix}quiz kn3**, **${prefix}quiz katakana 3**) — JLPT N3 (Intermediate) [246 words]\n` +
          `• **${prefix}quiz katakana_n2** (or **${prefix}quiz kn2**, **${prefix}quiz katakana 2**) — JLPT N2 (Upper Intermediate) [96 words]\n` +
          `• **${prefix}quiz katakana_n1** (or **${prefix}quiz kn1**, **${prefix}quiz katakana 1**) — JLPT N1 (Advanced) [162 words]\n` +
          `• **${prefix}quiz Katakana_words** (or **${prefix}quiz katakana_words**) — All loanwords [4,163 words]\n\n` +
          `*You can also use exact file names like \`${prefix}quiz N5.txt\` or mix difficulty decks with \`+\` (e.g. \`${prefix}quiz kn5+kn4\`)*`,
        color: constants.EMBED_NEUTRAL_COLOR,
      }],
    };
  }

  return `${subCategory.description.replace(/<prefix>/g, prefix)}  \`\`\`${subCategory.decks.join(', ')}\`\`\``;
};

module.exports.defaultDeckOptionsForInteraction = [{
  name: 'katakana_n5 (Katakana JLPT N5 Reading Quiz)',
  value: 'katakana_n5',
},{
  name: 'Katakana_words (Katakana Loanwords Reading Quiz)',
  value: 'Katakana_words',
},{
  name: 'n5 (JLPT N5 Reading Quiz)',
  value: 'n5',
},{
  name: 'n4 (JLPT N4 Reading Quiz)',
  value: 'n4',
},{
  name: 'n3 (JLPT N3 Reading Quiz)',
  value: 'n3',
},{
  name: 'n2 (JLPT N2 Reading Quiz)',
  value: 'n2',
},{
  name: 'n1 (JLPT N1 Reading Quiz)',
  value: 'n1',
},{
  name: 'hiragana (Hiragana Reading Quiz)',
  value: 'hiragana',
},{
  name: 'katakana (Katakana Difficulty Selector)',
  value: 'katakana',
},{
  name: 'kanawords (Kana Words Reading Quiz)',
  value: 'kanawords',
},{
  name: 'common (Common Words Reading Quiz)',
  value: 'common',
},{
  name: 'hard (Hard Reading Quiz)',
  value: 'hard',
},{
  name: 'haard (Haard Reading Quiz)',
  value: 'haard',
},{
  name: 'cities (Cities Reading Quiz)',
  value: 'cities',
},{
  name: 'namae (Namae Reading Quiz)',
  value: 'namae',
},{
  name: 'myouji (Myouji Reading Quiz)',
  value: 'myouji',
},{
  name: 'prefectures (Prefectures Reading Quiz)',
  value: 'prefectures',
},{
  name: 'anagrams5 (English Anagrams Length 5 Quiz)',
  value: 'anagrams5',
},{
  name: 'anagrams6 (English Anagrams Length 6 Quiz)',
  value: 'anagrams6',
},{
  name: 'anagrams7 (English Anagrams Length 7 Quiz)',
  value: 'anagrams7',
},{
  name: 'anagrams8 (English Anagrams Length 8 Quiz)',
  value: 'anagrams8',
},{
  name: 'easymix (Easy Mix)',
  value: 'easymix',
},{
  name: 'medmix (Medium Mix)',
  value: 'medmix',
},{
  name: 'hardmix (Hard Mix)',
  value: 'hardmix',
},{
  name: 'hardermix (Harder Mix)',
  value: 'hardermix',
},{
  name: 'insanemix (Insane Mix)',
  value: 'insanemix',
}];
