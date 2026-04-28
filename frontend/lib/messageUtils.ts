export function cleanMessageContent(content: string | undefined): string {
  if (!content) return ''
  
  // Handle literal \n strings
  let current = content.replace(/\\n/g, '\n')
  
  const extractText = (obj: any): string => {
    if (typeof obj !== 'object' || obj === null) return ''
    return obj.message || obj.content || obj.text || obj.msg || obj.msg_content || ''
  }

  try {
    let trimmed = current.trim()
    // Try to find JSON block
    const jsonMatch = trimmed.match(/^(?:.*?:?\s*)?({[\s\S]*})$/)
    if (jsonMatch && jsonMatch[1]) {
      const parsed = JSON.parse(jsonMatch[1])
      const text = extractText(parsed)
      if (text) return cleanMessageContent(text)
    }
  } catch (e) {
    // Not valid JSON or parsing failed, keep as is
  }
  return current
}
