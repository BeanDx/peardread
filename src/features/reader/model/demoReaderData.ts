export type TranslationEntry = {
  text: string
  translation: string
  partOfSpeech?: string
  note?: string
}

export const demoParagraphs = [
  'Am fruhen Abend ging Lea langsam durch eine ruhige Strasse in Berlin. Die Luft war kuhl, und aus einem kleinen Cafe kam der Duft von frischem Brot.',
  'Sie setzte sich auf eine Bank am Kanal und offnete ihr Buch. Das Wasser war still, nur ein Fahrrad fuhr vorbei, und die Lichter in den Fenstern wurden warmer.',
  'Lea las noch ein paar Seiten, atmete tief ein und dachte: Genau so mochte ich jeden Tag lernen - mit Ruhe, mit Neugier, mit einem klaren Kopf.',
]

export const demoWordTranslations: Record<string, TranslationEntry> = {
  abend: { text: 'Abend', translation: 'вечер', partOfSpeech: 'noun' },
  langsam: { text: 'langsam', translation: 'медленно', partOfSpeech: 'adverb' },
  ruhige: { text: 'ruhige', translation: 'тихая, спокойная', partOfSpeech: 'adjective' },
  strasse: { text: 'Strasse', translation: 'улица', partOfSpeech: 'noun' },
  luft: { text: 'Luft', translation: 'воздух', partOfSpeech: 'noun' },
  kuhl: { text: 'kuhl', translation: 'прохладный', partOfSpeech: 'adjective' },
  duft: { text: 'Duft', translation: 'аромат', partOfSpeech: 'noun' },
  frischem: { text: 'frischem', translation: 'свежим', partOfSpeech: 'adjective' },
  brot: { text: 'Brot', translation: 'хлеб', partOfSpeech: 'noun' },
  wasser: { text: 'Wasser', translation: 'вода', partOfSpeech: 'noun' },
  still: { text: 'still', translation: 'тихий, неподвижный', partOfSpeech: 'adjective' },
  lichter: { text: 'Lichter', translation: 'огни', partOfSpeech: 'noun' },
  warmer: { text: 'warmer', translation: 'более теплый', partOfSpeech: 'adjective' },
  las: { text: 'las', translation: 'читала', partOfSpeech: 'verb' },
  lernen: { text: 'lernen', translation: 'учиться', partOfSpeech: 'verb' },
  ruhe: { text: 'Ruhe', translation: 'спокойствие', partOfSpeech: 'noun' },
  neugier: { text: 'Neugier', translation: 'любопытство', partOfSpeech: 'noun' },
  klaren: { text: 'klaren', translation: 'ясный', partOfSpeech: 'adjective' },
  kopf: { text: 'Kopf', translation: 'голова', partOfSpeech: 'noun' },
}

export const demoPhraseTranslations: Record<string, TranslationEntry> = {
  'ruhige strasse': {
    text: 'ruhige Strasse',
    translation: 'тихая улица',
    note: 'Natural scene-setting phrase.',
  },
  'duft von frischem brot': {
    text: 'Duft von frischem Brot',
    translation: 'аромат свежего хлеба',
  },
  'mit einem klaren kopf': {
    text: 'mit einem klaren Kopf',
    translation: 'с ясной головой',
    note: 'Means staying mentally focused.',
  },
}
