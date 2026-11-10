/**
 * Drop markdown/HTML presentation so the widget (plain text) never shows
 * literal **bold** or injects markup. Does not interpret remaining text as HTML.
 */
export function stripGuidePresentationMarkers(text: string): string {
  let t = String(text || '')
  t = t.replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, '').trim())
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1')
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1')
  t = t.replace(/__([^_]+)__/g, '$1')
  t = t.replace(/(^|[^\w])\*([^*\n]+)\*(?=[^\w]|$)/g, '$1$2')
  t = t.replace(/(^|[^\w])_([^_\n]+)_(?=[^\w]|$)/g, '$1$2')
  t = t.replace(/`([^`]+)`/g, '$1')
  t = t.replace(/^#{1,6}\s+/gm, '')
  t = t.replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
  t = t.replace(/\*{1,}/g, '')
  t = t.replace(/_{2,}/g, ' ')
  return t
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim()
}
