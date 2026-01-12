import { useMemo } from 'react'

interface BaseExample {
  id: string
  title: string
  description: string
  group?: string
  messages: unknown[]
}

interface ExampleSelectorProps {
  examples: BaseExample[]
  selectedId: string
  onSelect: (id: string) => void
}

export function ExampleSelector({
  examples,
  selectedId,
  onSelect,
}: ExampleSelectorProps) {
  const groupedExamples = useMemo(() => {
    const groups: Record<string, BaseExample[]> = {}
    const ungrouped: BaseExample[] = []

    for (const example of examples) {
      if (example.group) {
        if (!groups[example.group]) {
          groups[example.group] = []
        }
        groups[example.group].push(example)
      } else {
        ungrouped.push(example)
      }
    }

    return { groups, ungrouped }
  }, [examples])

  return (
    <div className="example-selector">
      <label htmlFor="example-select" className="example-selector-label">
        Example:
      </label>
      <select
        id="example-select"
        className="example-selector-dropdown"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
      >
        {groupedExamples.ungrouped.map((example) => (
          <option key={example.id} value={example.id}>
            {example.title}
          </option>
        ))}
        {Object.entries(groupedExamples.groups).map(([groupName, items]) => (
          <optgroup key={groupName} label={groupName}>
            {items.map((example) => (
              <option key={example.id} value={example.id}>
                {example.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span className="example-selector-description">
        {examples.find((e) => e.id === selectedId)?.description}
      </span>
    </div>
  )
}
