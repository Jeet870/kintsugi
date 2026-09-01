import React from 'react'

export interface SectionTitleProps {
  category?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  categoryColor?: string
  className?: string
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  category,
  title,
  subtitle,
  align = 'center',
  categoryColor = 'text-violet-600 dark:text-violet-400',
  className = '',
}) => {
  const alignment = align === 'center' ? 'text-center max-w-3xl mx-auto' : 'text-left'

  return (
    <div className={`space-y-3 ${alignment} ${className}`}>
      {category && (
        <h2 className={`text-xs font-semibold uppercase tracking-widest ${categoryColor}`}>
          {category}
        </h2>
      )}
      <h3 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight font-serif">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionTitle
