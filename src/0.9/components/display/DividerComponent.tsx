/**
 * DividerComponent - Displays a separator line.
 */

import { memo } from 'react'
import type { DividerComponent as DividerComponentType } from '../../types'
import type { A2UIComponentProps } from '../../contexts/ComponentsMapContext'
import { Separator } from '@/components/ui/separator'

/**
 * Divider component for visual separation.
 */
export const DividerComponent = memo(function DividerComponent({
  component,
}: A2UIComponentProps) {
  const dividerComp = component as DividerComponentType
  const axis = dividerComp.axis ?? 'horizontal'

  return (
    <Separator
      orientation={axis}
      className={axis === 'vertical' ? 'self-stretch h-auto!' : 'w-full'}
    />
  )
})

DividerComponent.displayName = 'A2UI.Divider'
