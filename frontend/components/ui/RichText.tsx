import React from 'react'

interface Props {
  text: string
  isAgent?: boolean
  className?: string
  style?: React.CSSProperties
}

export function RichText({ text, isAgent, style }: Props) {
  if (!text) return null
  
  // Handle literal \n strings (often found in raw logs/outputs)
  const normalizedText = text.replace(/\\n/g, '\n')
  
  const lines = normalizedText.split('\n')
  const elements: React.ReactNode[] = []
  
  const parseInline = (t: string) => {
    // Basic bold parsing: **text**
    // Basic italic parsing: *text* or _text_
    // Inline code: `code`
    // Links: [text](url)
    
    const parts = t.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ fontWeight: 700, color: isAgent ? 'inherit' : 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} style={{ 
          background: isAgent ? 'rgba(255,255,255,0.1)' : 'var(--bg-elevated)', 
          padding: '2px 4px', 
          borderRadius: '4px', 
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>{part.slice(1, -1)}</code>
      }
      if (part.startsWith('[') && part.includes('](')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/)
        if (match) {
          return <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: isAgent ? 'white' : 'var(--accent)', textDecoration: 'underline' }}>{match[1]}</a>
        }
      }
      return part
    })
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    
    // Code block start/end
    if (trimmed.startsWith('```')) {
      // Very basic code block handling
      return
    }

    if (!trimmed && i > 0 && i < lines.length - 1) {
      elements.push(<div key={`br-${i}`} style={{ height: '0.75rem' }} />)
      return
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: '1rem', fontWeight: 700, margin: '1rem 0 0.5rem 0', color: isAgent ? 'white' : 'var(--text-primary)' }}>{parseInline(line.slice(4))}</h3>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: '1.25rem', fontWeight: 800, margin: '1.25rem 0 0.75rem 0', color: isAgent ? 'white' : 'var(--text-primary)' }}>{parseInline(line.slice(3))}</h2>)
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: '1.5rem', fontWeight: 800, margin: '1.5rem 0 1rem 0', color: isAgent ? 'white' : 'var(--text-primary)' }}>{parseInline(line.slice(2))}</h1>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: '0.5rem', margin: '0.25rem 0', paddingLeft: '0.5rem' }}>
          <span style={{ color: isAgent ? 'white' : 'var(--accent)', fontWeight: 800 }}>•</span>
          <span style={{ flex: 1 }}>{parseInline(line.slice(2))}</span>
        </div>
      )
    } else {
      elements.push(<p key={i} style={{ margin: '0.25rem 0', lineHeight: 1.6 }}>{parseInline(line)}</p>)
    }
  })

  return <div className="rich-text-content" style={style}>{elements}</div>
}
