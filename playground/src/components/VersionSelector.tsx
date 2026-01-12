export type A2UIVersion = '0.8' | '0.9'

interface VersionSelectorProps {
  version: A2UIVersion
  onChange: (version: A2UIVersion) => void
}

export function VersionSelector({ version, onChange }: VersionSelectorProps) {
  return (
    <div className="version-selector">
      <label htmlFor="version-select" className="version-selector-label">
        Version:
      </label>
      <select
        id="version-select"
        className="version-selector-dropdown"
        value={version}
        onChange={(e) => onChange(e.target.value as A2UIVersion)}
      >
        <option value="0.8">v0.8</option>
        <option value="0.9">v0.9</option>
      </select>
    </div>
  )
}
