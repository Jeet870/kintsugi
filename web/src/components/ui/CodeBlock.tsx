import React from 'react'

export interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  className?: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'bash',
  title,
  className = '',
}) => {
  return (
    <div className={`rounded-lg border border-white/[0.08] bg-zinc-950/90 text-left overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>{title}</span>
          <span className="uppercase text-[10px] text-violet-400">{language}</span>
        </div>
      )}
      <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default CodeBlock
