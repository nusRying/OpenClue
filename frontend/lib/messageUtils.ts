export function cleanMessageContent(content: string | undefined): string {
  if (!content) return ''
  
  // Handle literal \n strings
  let current = content.replace(/\\n/g, '\n')
  
  const extractText = (obj: any): string => {
    if (!obj || typeof obj !== 'object') return ''
    
    // Direct match for common keys
    const keys = ['message', 'content', 'text', 'msg', 'msg_content', 'response', 'output', 'body', 'data']
    for (const key of keys) {
      if (typeof obj[key] === 'string' && obj[key].trim()) return obj[key]
    }

    // Deep search (one level)
    if (obj.data && typeof obj.data === 'object') return extractText(obj.data)
    if (obj.message && typeof obj.message === 'object') return extractText(obj.message)

    return ''
  }

  try {
    const trimmed = current.trim()
    // Optimization: only attempt JSON parse if it looks like an object
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed)
      const text = extractText(parsed)
      if (text) return cleanMessageContent(text)
    } else {
      // Try to find a JSON block within text
      const jsonMatch = trimmed.match(/{[\s\S]*}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const text = extractText(parsed)
        if (text) return cleanMessageContent(text)
      }
    }
  } catch (e) {
    // Parsing failed, continue to return current
  }

  return current
}
