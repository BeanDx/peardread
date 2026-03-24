import type { Book } from './types'

const demoParagraphs = [
  'Am fruhen Abend ging Lea langsam durch eine ruhige Strasse in Berlin. Die Luft war kuhl, und aus einem kleinen Cafe kam der Duft von frischem Brot.',
  'Sie setzte sich auf eine Bank am Kanal und offnete ihr Buch. Das Wasser war still, nur ein Fahrrad fuhr vorbei, und die Lichter in den Fenstern wurden warmer.',
  'Lea las noch ein paar Seiten, atmete tief ein und dachte: Genau so mochte ich jeden Tag lernen - mit Ruhe, mit Neugier, mit einem klaren Kopf.',
]

export const demoBook: Book = {
  id: 'demo-evening-walk',
  title: 'Evening Walk in Berlin',
  sourceType: 'demo',
  format: 'txt',
  chapters: [
    {
      id: 'chapter-1',
      title: 'Chapter 1',
      paragraphs: demoParagraphs.map((text, index) => ({
        id: `demo-p-${index + 1}`,
        text,
      })),
    },
  ],
}
