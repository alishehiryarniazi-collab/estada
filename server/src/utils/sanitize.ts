/**
 * Strip any HTML from user-submitted text to prevent stored XSS (Section 8).
 * We disallow ALL tags/attributes — listing titles, descriptions, messages etc.
 * are plain text, so nothing legitimate is lost.
 */
import sanitizeHtml from 'sanitize-html';

export function cleanText(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
}
