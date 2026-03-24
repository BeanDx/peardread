import { normalizePhrase, normalizeWord } from '../../reader/model/tokenization'
import {
  demoPhraseTranslations,
  demoWordTranslations,
  type TranslationEntry,
} from './translationData'

function toTitleCase(value: string) {
  if (!value) {
    return value
  }
  return `${value[0].toUpperCase()}${value.slice(1)}`
}

function generateWordCandidates(normalizedWord: string) {
  const candidates = new Set<string>([normalizedWord])
  const endings = ['en', 'er', 'em', 'es', 'e', 'n', 's']
  for (const ending of endings) {
    if (normalizedWord.endsWith(ending) && normalizedWord.length > ending.length + 2) {
      candidates.add(normalizedWord.slice(0, -ending.length))
    }
  }
  return [...candidates]
}

function resolveWord(sourceWord: string, unavailableText: string): TranslationEntry | null {
  const normalized = normalizeWord(sourceWord)
  if (!normalized) {
    return null
  }

  const candidates = generateWordCandidates(normalized)
  for (const candidate of candidates) {
    const match = demoWordTranslations[candidate]
    if (match) {
      return match
    }
  }

  return {
    text: toTitleCase(normalized),
    translation: unavailableText,
  }
}

export function resolveLocalTranslation(
  sourceText: string,
  unavailableText: string,
): TranslationEntry | null {
  if (!sourceText.trim()) {
    return null
  }

  const phraseKey = normalizePhrase(sourceText)
  if (!phraseKey) {
    return null
  }

  const exactPhrase = demoPhraseTranslations[phraseKey]
  if (exactPhrase) {
    return exactPhrase
  }

  if (phraseKey.includes(' ')) {
    const tokens = phraseKey.split(' ')
    const translatedTokens = tokens.map((token) => {
      const translated = resolveWord(token, unavailableText)
      return translated?.translation ?? unavailableText
    })
    const knownTokens = translatedTokens.filter((token) => token !== unavailableText)

    return {
      text: sourceText.trim(),
      translation: knownTokens.length ? knownTokens.join(' ') : unavailableText,
    }
  }

  return resolveWord(sourceText, unavailableText)
}
