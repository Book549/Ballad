const fs = require('fs');
const path = require('path');
const convertToHiragana = require('../util/convert_to_hiragana.js');

// Cache parsed decks by file path and mtime
const deckCache = {};

function getKatakanaDir() {
  const possiblePaths = [
    process.env.KATAKANA_DIR,
    path.join(__dirname, '..', '..', '..', '..', 'katakana'),
    path.join(__dirname, '..', '..', '..', 'katakana'),
    path.join(__dirname, '..', '..', 'katakana'),
    path.join(process.cwd(), 'katakana'),
    '/var/katakana',
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return path.join(__dirname, '..', '..', '..', '..', 'katakana');
}

function generateAnswers(question, rawRomaji) {
  const cleanRomaji = (rawRomaji || '').replace(/[\[\]]/g, '').trim();
  const answers = new Set();

  if (cleanRomaji) {
    // 1. Primary raw Romaji
    answers.add(cleanRomaji);

    // 2. Hepburn macrons to hyphen (e.g. aisukurīmu -> aisukuri-mu)
    const hyphenated = cleanRomaji
      .replace(/ā/g, 'a-').replace(/ī/g, 'i-').replace(/ū/g, 'u-').replace(/ē/g, 'e-').replace(/ō/g, 'o-')
      .replace(/Ā/g, 'A-').replace(/Ī/g, 'I-').replace(/Ū/g, 'U-').replace(/Ē/g, 'E-').replace(/Ō/g, 'O-');
    answers.add(hyphenated);

    // 3. Double vowel conversion (e.g. aisukurīmu -> aisukuriimu)
    const doubleVowel = cleanRomaji
      .replace(/ā/g, 'aa').replace(/ī/g, 'ii').replace(/ū/g, 'uu').replace(/ē/g, 'ee').replace(/ō/g, 'oo')
      .replace(/Ā/g, 'Aa').replace(/Ī/g, 'Ii').replace(/Ū/g, 'Uu').replace(/Ē/g, 'Ee').replace(/Ō/g, 'Oo');
    answers.add(doubleVowel);

    // 4. Single vowel conversion (e.g. aisukurīmu -> aisukurimu)
    const singleVowel = cleanRomaji
      .replace(/ā/g, 'a').replace(/ī/g, 'i').replace(/ū/g, 'u').replace(/ē/g, 'e').replace(/ō/g, 'o')
      .replace(/Ā/g, 'A').replace(/Ī/g, 'I').replace(/Ū/g, 'U').replace(/Ē/g, 'E').replace(/Ō/g, 'O');
    answers.add(singleVowel);

    // 5. Without spaces, hyphens, or underscores
    for (const a of [...answers]) {
      answers.add(a.replace(/[\s\-_]/g, ''));
    }
  }

  // Katakana question word itself
  answers.add(question);
  answers.add(question.replace(/[\s\-_]/g, ''));

  // Hiragana conversion of question
  try {
    const h = convertToHiragana(question);
    if (h) {
      answers.add(h);
      answers.add(h.replace(/[\s\-_]/g, ''));
    }
  } catch (err) {
    // Ignore conversion error
  }

  return [...answers].filter(Boolean);
}

function parseKatakanaFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const cards = [];
  const seenQuestions = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const parts = line.split('\t');
    if (parts.length < 2) {
      continue;
    }

    const question = parts[0].trim();
    if (!question || seenQuestions.has(question)) {
      continue;
    }
    seenQuestions.add(question);

    const rawRomaji = parts[1].trim();
    const meaning = parts.slice(2).join('\t').trim();

    const answers = generateAnswers(question, rawRomaji);
    if (answers.length === 0) {
      continue;
    }

    cards.push({
      question,
      answer: answers,
      meaning: meaning || undefined,
    });
  }

  return cards;
}

function getCardsForFile(filePath) {
  const stats = fs.statSync(filePath);
  const mtime = stats.mtimeMs;

  if (deckCache[filePath] && deckCache[filePath].mtime === mtime) {
    return deckCache[filePath].cards;
  }

  const cards = parseKatakanaFile(filePath);
  deckCache[filePath] = {
    mtime,
    cards,
  };

  return cards;
}

function getAvailableKatakanaFiles() {
  const katakanaDir = getKatakanaDir();
  if (!fs.existsSync(katakanaDir)) {
    return [];
  }

  const files = fs.readdirSync(katakanaDir);
  return files
    .filter(f => f.endsWith('.txt'))
    .map(fileName => {
      const filePath = path.join(katakanaDir, fileName);
      const baseName = fileName.replace(/\.txt$/i, '');
      return {
        fileName,
        baseName,
        filePath,
      };
    });
}

const JLPT_NAMES = {
  n5: 'JLPT N5 (Beginner)',
  n4: 'JLPT N4 (Elementary)',
  n3: 'JLPT N3 (Intermediate)',
  n2: 'JLPT N2 (Upper Intermediate)',
  n1: 'JLPT N1 (Advanced)',
};

function resolveKatakanaFile(deckNameOrUniqueId) {
  const normalized = deckNameOrUniqueId.toLowerCase().trim();
  const availableFiles = getAvailableKatakanaFiles();

  // 1. Direct match with baseName (e.g. "katakana_words" -> "Katakana_words.txt", "n5" -> "N5.txt")
  let match = availableFiles.find(f => f.baseName.toLowerCase() === normalized);
  if (match) {
    return match;
  }

  // 2. Direct match with fileName (e.g. "n5.txt" -> "N5.txt")
  match = availableFiles.find(f => f.fileName.toLowerCase() === normalized);
  if (match) {
    return match;
  }

  // 3. Normalized prefix "katakana_" or "katakana-" or "katakana/"
  // e.g. "katakana_n5" -> "n5", "katakana_words" -> "katakana_words"
  const strippedPrefix = normalized.replace(/^katakana[_\-\/]/i, '');
  match = availableFiles.find(f => f.baseName.toLowerCase() === strippedPrefix);
  if (match) {
    return match;
  }

  // 4. "kn5" -> "n5", "kn4" -> "n4", etc.
  const knMatch = normalized.match(/^kn([1-5])$/i);
  if (knMatch) {
    const target = `n${knMatch[1]}`;
    match = availableFiles.find(f => f.baseName.toLowerCase() === target);
    if (match) {
      return match;
    }
  }

  // 5. "katakana5" or "katakana_5" -> "n5"
  const kNumMatch = normalized.match(/^katakana[_\-\/]?([1-5])$/i);
  if (kNumMatch) {
    const target = `n${kNumMatch[1]}`;
    match = availableFiles.find(f => f.baseName.toLowerCase() === target);
    if (match) {
      return match;
    }
  }

  // 6. "katakana_loanwords" or "katakanawords" -> "katakana_words"
  if (normalized === 'katakanawords' || normalized === 'katakana_loanwords' || normalized === 'katakana') {
    match = availableFiles.find(f => /katakana_words/i.test(f.baseName));
    if (match) {
      return match;
    }
  }

  return undefined;
}

function createCardGetterFromInMemoryArray(array) {
  return {
    get: i => Promise.resolve(array[i]),
    length: array.length,
    memoryArray: array,
  };
}

function getKatakanaDeck(deckInfo) {
  const deckQuery = typeof deckInfo === 'string' ? deckInfo : deckInfo.deckNameOrUniqueId;
  const match = resolveKatakanaFile(deckQuery);
  if (!match) {
    return undefined;
  }

  const cards = getCardsForFile(match.filePath);
  if (cards.length === 0) {
    return undefined;
  }

  const baseLower = match.baseName.toLowerCase();
  const jlptTitle = JLPT_NAMES[baseLower];
  let displayName;
  if (jlptTitle) {
    displayName = `Katakana ${jlptTitle} Reading Quiz`;
  } else if (/katakana_words/i.test(match.baseName)) {
    displayName = 'Katakana Loanwords Reading Quiz';
  } else {
    displayName = `Katakana ${match.baseName} Quiz`;
  }

  const shortName = `katakana_${match.baseName.toLowerCase()}`;

  return {
    uniqueId: `katakana_${match.baseName.toLowerCase()}`,
    name: displayName,
    shortName,
    description: `Katakana vocabulary quiz loaded from katakana/${match.fileName} (${cards.length} cards)`,
    article: 'a',
    instructions: 'Type the reading in Romaji or Kana!',
    questionCreationStrategy: 'IMAGE',
    dictionaryLinkStrategy: 'JISHO_QUESTION_WORD',
    answerTimeLimitStrategy: 'JAPANESE_SETTINGS',
    cardPreprocessingStrategy: 'NONE',
    discordFinalAnswerListElementStrategy: 'QUESTION_AND_ANSWER_LINK_QUESTION',
    scoreAnswerStrategy: 'ONE_ANSWER_ONE_POINT',
    additionalAnswerWaitStrategy: 'JAPANESE_SETTINGS',
    discordIntermediateAnswerListElementStrategy: 'CORRECT_ANSWERS',
    answerCompareStrategy: 'CONVERT_KANA',
    commentFieldName: 'Meaning',
    isKatakanaDeck: true,
    cards: createCardGetterFromInMemoryArray(cards),
  };
}

module.exports = {
  getKatakanaDeck,
  resolveKatakanaFile,
  getAvailableKatakanaFiles,
  getKatakanaDir,
};
