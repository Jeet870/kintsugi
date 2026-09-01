import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <Link
        to={ROUTES.PUBLIC.HOME}
        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-foreground truncate">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-foreground transition-colors truncate">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
