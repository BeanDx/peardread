export const WORD_REGEX = /^(?:\p{L}[\p{L}\p{M}'’-]*|\p{N}[\p{N}.,:\/-]*)(?:[-–—](?:\p{L}[\p{L}\p{M}'’-]*|\p{N}[\p{N}.,:\/-]*))*\.?$/u

const TOKEN_REGEX =
  /(?:\p{Lu}\.){2,}(?:\p{Lu}\.?)?|(?:\p{L}{1,4}\.){1,}\p{L}{0,4}\.?|\p{N}{1,4}(?:[./:-]\p{N}{1,4}){1,}|\p{N}+(?:[.,]\p{N}+)*(?:[-–—]\p{N}+(?:[.,]\p{N}+)*)*|\p{L}[\p{L}\p{M}'’-]*(?:[-–—]\p{L}[\p{L}\p{M}'’-]*)*\.?|[^\p{L}\p{N}\s]+|\s+/gu

export function splitTextToTokens(text: string) {
  return text.match(TOKEN_REGEX) ?? []
}

export function isInteractiveToken(token: string) {
  const trimmed = token.trim()
  if (!WORD_REGEX.test(trimmed)) {
    return false
  }
  const normalized = normalizeWord(trimmed)
  if (normalized.length <= 1) {
    return false
  }
  if (/^\d+([.,:/-]\d+)*$/.test(normalized)) {
    return false
  }
  return true
}

export function normalizeWord(text: string) {
  return text
    .toLowerCase()
    .replace(/[“”„"']/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\.+$/g, '')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .trim()
}

export function normalizePhrase(text: string) {
  return text
    .toLowerCase()
    .replace(/[“”„"']/g, '')
    .replace(/[^\p{L}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
