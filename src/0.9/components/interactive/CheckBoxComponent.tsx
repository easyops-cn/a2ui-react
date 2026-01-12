/**
 * CheckBoxComponent - Checkbox input with two-way binding.
 */

import { memo, useCallback } from 'react'
import type { CheckBoxComponent as CheckBoxComponentType } from '../../types'
import type { A2UIComponentProps } from '../../contexts/ComponentsMapContext'
import { useStringBinding, useFormBinding } from '../../hooks/useDataBinding'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * CheckBox component - checkbox input with label.
 */
export const CheckBoxComponent = memo(function CheckBoxComponent({
  surfaceId,
  component,
}: A2UIComponentProps) {
  const checkBox = component as CheckBoxComponentType
  const labelText = useStringBinding(surfaceId, checkBox.label, '')
  const [checked, setChecked] = useFormBinding<boolean>(
    surfaceId,
    checkBox.value,
    false
  )

  const handleChange = useCallback(
    (newChecked: boolean) => {
      setChecked(newChecked)
    },
    [setChecked]
  )

  const id = `checkbox-${checkBox.id}`

  // Apply weight as flex-grow if set
  const style = checkBox.weight ? { flexGrow: checkBox.weight } : undefined

  return (
    <div className={cn('flex items-center gap-3')} style={style}>
      <Checkbox id={id} checked={checked} onCheckedChange={handleChange} />
      {labelText && (
        <Label htmlFor={id} className="cursor-pointer">
          {labelText}
        </Label>
      )}
    </div>
  )
})

CheckBoxComponent.displayName = 'A2UI.CheckBox'
