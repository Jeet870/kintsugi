import React from 'react'
import { Check, X } from 'lucide-react'

export interface ComparisonItem {
  feature: string
  kintsugi: boolean | string
  traditional: boolean | string
}

export interface ComparisonTableProps {
  items: ComparisonItem[]
  title?: string
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ items, title }) => {
  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground backdrop-blur-xl overflow-hidden text-left shadow-xl">
      {title && (
        <div className="p-4 sm:p-6 border-b border-border">
          <h4 className="text-lg font-bold text-card-foreground font-serif">{title}</h4>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
            <tr>
              <th className="p-4 sm:px-6">Feature</th>
              <th className="p-4 sm:px-6 text-violet-600 dark:text-violet-400 font-serif">Kintsugi AI Platform</th>
              <th className="p-4 sm:px-6 text-muted-foreground">Traditional Methods</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/40 transition-colors">
                <td className="p-4 sm:px-6 font-medium text-card-foreground">{row.feature}</td>
                <td className="p-4 sm:px-6">
                  {typeof row.kintsugi === 'boolean' ? (
                    row.kintsugi ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Check className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-500">
                        <X className="w-4 h-4" /> No
                      </span>
                    )
                  ) : (
                    <span className="text-violet-700 dark:text-violet-300 font-semibold">{row.kintsugi}</span>
                  )}
                </td>
                <td className="p-4 sm:px-6 text-muted-foreground">
                  {typeof row.traditional === 'boolean' ? (
                    row.traditional ? (
                      <span className="flex items-center gap-1.5 text-foreground/80">
                        <Check className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <X className="w-4 h-4" /> No
                      </span>
                    )
                  ) : (
                    row.traditional
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ComparisonTable
