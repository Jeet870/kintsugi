import React from 'react'
import { HexagonBackground } from './HexagonBackground'
import { KintsugiLines } from './KintsugiLines'

export const BackgroundEffects: React.FC = React.memo(() => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden bg-background"
    >
      <HexagonBackground density="medium" animated={true} />
      <KintsugiLines />
    </div>
  )
})

BackgroundEffects.displayName = 'BackgroundEffects'
export default BackgroundEffects
