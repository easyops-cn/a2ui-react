# Research: A2UI 0.9 Renderer

**Date**: 2026-01-12
**Status**: Complete

## Summary

This document captures research findings for implementing the A2UI 0.9 Renderer. All technical decisions are informed by the existing 0.8 implementation and the 0.9 protocol specification.

---

## 1. String Interpolation Implementation

### Decision

Implement a regex-based parser for `${expression}` syntax with support for nested expressions and escape sequences.

### Rationale

- The 0.9 protocol defines string interpolation with `${...}` syntax similar to JavaScript template literals
- Must support: absolute paths (`${/user/name}`), relative paths (`${name}`), escaped sequences (`\${literal}`)
- Function calls in interpolation are deferred to a future release per clarification

### Implementation Approach

```typescript
// Regex pattern for interpolation
const INTERPOLATION_REGEX = /(?<!\\)\$\{([^}]+)\}/g

function interpolate(
  template: string,
  dataModel: object,
  scope?: string
): string {
  return template.replace(INTERPOLATION_REGEX, (match, expression) => {
    const path = expression.trim()
    const value = resolvePath(path, dataModel, scope)
    return stringifyValue(value)
  })
}
```

### Alternatives Considered

1. **Full expression parser**: Too complex for initial release; function calls are deferred
2. **Template literal evaluation**: Security concerns with `eval`; rejected

---

## 2. Collection Scope Context

### Decision

Create a new `ScopeContext` that tracks the current data path when rendering template-bound children.

### Rationale

- Template binding (`{"componentId": "...", "path": "/items"}`) creates child scopes
- Relative paths (not starting with `/`) must resolve within the current scope
- Absolute paths must always resolve from root data model
- React Context is the idiomatic way to pass scope down the component tree

### Implementation Approach

```typescript
interface ScopeValue {
  basePath: string | null;  // null for root scope, "/items/0" for first item in collection
}

const ScopeContext = createContext<ScopeValue>({ basePath: null });

// In ListComponent when rendering template children:
items.map((_, index) => (
  <ScopeContext.Provider value={{ basePath: `${path}/${index}` }}>
    <ComponentRenderer id={componentId} />
  </ScopeContext.Provider>
));
```

### Alternatives Considered

1. **Pass scope as props**: Requires prop drilling through all components; rejected
2. **Global scope stack**: More complex, harder to test; rejected

---

## 3. Multi-Surface State Management

### Decision

Use a `Map<string, SurfaceState>` within `A2UIProvider` to manage multiple surfaces, with separate message buffers per surface.

### Rationale

- 0.9 protocol explicitly supports multiple simultaneous surfaces
- Each surface has independent component tree, data model, and lifecycle
- Pre-`createSurface` messages must be buffered per surface

### Implementation Approach

```typescript
interface SurfaceState {
  catalogId: string | null
  components: Map<string, Component>
  dataModel: object
  created: boolean
}

interface ProviderState {
  surfaces: Map<string, SurfaceState>
  messageBuffer: Map<string, A2UIMessage[]> // Buffer per surfaceId
}
```

### Alternatives Considered

1. **Single surface only**: Doesn't meet requirement FR-017; rejected
2. **Separate provider per surface**: More API changes for downstream; rejected

---

## 4. Validation Function Registry

### Decision

Implement a `FunctionRegistry` pattern with built-in validation functions, extensible for custom functions.

### Rationale

- Standard catalog defines 5 validation functions: `required`, `email`, `regex`, `length`, `numeric`
- Functions must be callable from `checks` property
- Should support future extensibility for custom functions

### Implementation Approach

```typescript
type ValidationFunction = (args: Record<string, unknown>) => boolean

const defaultFunctions: Record<string, ValidationFunction> = {
  required: ({ value }) => value != null && value !== '',
  email: ({ value }) =>
    typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  regex: ({ value, pattern }) =>
    typeof value === 'string' && new RegExp(pattern as string).test(value),
  length: ({ value, min, max }) => {
    const len = String(value ?? '').length
    return (min == null || len >= min) && (max == null || len <= max)
  },
  numeric: ({ value, min, max }) => {
    const num = Number(value)
    return (
      !isNaN(num) && (min == null || num >= min) && (max == null || num <= max)
    )
  },
}
```

### Alternatives Considered

1. **Inline validation logic per component**: Code duplication; rejected
2. **Schema-based validation**: Overkill for simple boolean checks; rejected

---

## 5. Logic Expression Evaluation

### Decision

Implement recursive evaluation for `LogicExpression` types (`and`, `or`, `not`, function calls).

### Rationale

- `CheckRule` extends `LogicExpression` with a `message` property
- Logic expressions can be nested arbitrarily deep
- Must support `and`, `or`, `not` operators and function calls

### Implementation Approach

```typescript
function evaluateLogicExpression(
  expr: LogicExpression,
  context: EvaluationContext
): boolean {
  if ('and' in expr) {
    return expr.and.every((e) => evaluateLogicExpression(e, context))
  }
  if ('or' in expr) {
    return expr.or.some((e) => evaluateLogicExpression(e, context))
  }
  if ('not' in expr) {
    return !evaluateLogicExpression(expr.not, context)
  }
  if ('call' in expr) {
    return evaluateFunctionCall(expr, context)
  }
  if ('true' in expr) return true
  if ('false' in expr) return false
  return false
}
```

---

## 6. Component Type Discrimination

### Decision

Use the `component` property as a discriminator to select the appropriate React component.

### Rationale

- 0.9 uses flat component format: `{"id": "...", "component": "Text", "text": "..."}`
- This is simpler than 0.8's wrapped format: `{"id": "...", "component": {"Text": {...}}}`
- A simple switch/map lookup is sufficient

### Implementation Approach

```typescript
const componentMap: Record<string, React.ComponentType<any>> = {
  Text: TextComponent,
  Image: ImageComponent,
  // ... all 18 components
};

function ComponentRenderer({ id }: { id: string }) {
  const component = useComponent(id);
  const Component = componentMap[component.component] ?? UnknownComponent;
  return <Component {...component} />;
}
```

---

## 7. Data Model Update Semantics

### Decision

Implement JSON merge/replace semantics at the specified path using JSON Pointer (RFC 6901).

### Rationale

- `updateDataModel` with `path` and `value` → replace value at path
- `updateDataModel` with `path` and no `value` → remove value at path
- `updateDataModel` with `path: "/"` or omitted → replace entire model

### Implementation Approach

```typescript
function updateDataModelAtPath(
  model: object,
  path: string,
  value?: unknown
): object {
  if (!path || path === '/') {
    return value === undefined ? {} : (value as object)
  }

  const segments = parseJsonPointer(path)
  const result = structuredClone(model)

  // Navigate to parent and update/delete at final segment
  let current = result
  for (let i = 0; i < segments.length - 1; i++) {
    current = current[segments[i]] ??= {}
  }

  const lastKey = segments[segments.length - 1]
  if (value === undefined) {
    delete current[lastKey]
  } else {
    current[lastKey] = value
  }

  return result
}
```

---

## 8. Reuse from 0.8 Implementation

### Decision

Maximize code reuse from 0.8 for shared UI primitives while implementing 0.9-specific logic separately.

### Reusable Components

- `src/components/ui/*` - Radix UI primitives (shared across versions)
- Icon mappings (lucide-react)
- CSS/Tailwind utility classes

### 0.9-Specific Implementations

- Message handler (new message format)
- Data binding (simplified path format)
- Interpolation (new feature)
- Validation (new `checks` property)
- Scope context (new feature)

---

## Conclusion

All technical decisions are documented above. No NEEDS CLARIFICATION items remain. The implementation can proceed to Phase 1.
