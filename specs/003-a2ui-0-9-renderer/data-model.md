# Data Model: A2UI 0.9 Renderer

**Date**: 2026-01-12

## Overview

This document defines the internal data structures and TypeScript types for the A2UI 0.9 Renderer implementation.

---

## 1. Message Types (Server to Client)

### A2UIMessage

The top-level message type. Each message contains exactly one of the four message types.

```typescript
type A2UIMessage =
  | { createSurface: CreateSurfacePayload }
  | { updateComponents: UpdateComponentsPayload }
  | { updateDataModel: UpdateDataModelPayload }
  | { deleteSurface: DeleteSurfacePayload }
```

### CreateSurfacePayload

```typescript
interface CreateSurfacePayload {
  surfaceId: string
  catalogId: string
}
```

**Constraints**:

- `surfaceId` must be unique within the provider context
- If surface already exists, log error and ignore (per clarification)

### UpdateComponentsPayload

```typescript
interface UpdateComponentsPayload {
  surfaceId: string
  components: Component[]
}
```

**Constraints**:

- Must be received after `createSurface` for this surfaceId (or buffered until then)
- Components are upserted into the surface's component map by `id`

### UpdateDataModelPayload

```typescript
interface UpdateDataModelPayload {
  surfaceId: string
  path?: string // JSON Pointer, defaults to "/" (root)
  value?: unknown // If omitted, data at path is removed
}
```

**Constraints**:

- `path` follows RFC 6901 JSON Pointer format
- If `value` is omitted, the data at `path` is deleted
- If `path` is omitted or "/", the entire data model is replaced

### DeleteSurfacePayload

```typescript
interface DeleteSurfacePayload {
  surfaceId: string
}
```

---

## 2. Component Types

### Base Component

All components share common properties defined in `ComponentCommon`.

```typescript
interface ComponentBase {
  id: string
  component: string // Discriminator: "Text", "Button", etc.
  weight?: number // flex-grow for Row/Column children
}
```

### DynamicValue Types

Values that can be literal, path binding, or function call.

```typescript
// Generic dynamic value (any type)
type DynamicValue = string | number | boolean | { path: string } | FunctionCall

// Type-specific variants
type DynamicString = string | { path: string } | FunctionCall
type DynamicNumber = number | { path: string } | FunctionCall
type DynamicBoolean = boolean | { path: string } | LogicExpression
type DynamicStringList = string[] | { path: string } | FunctionCall
```

### ChildList Type

```typescript
type ChildList =
  | string[] // Static list of component IDs
  | { componentId: string; path: string } // Template binding
```

### FunctionCall

```typescript
interface FunctionCall {
  call: string
  args?: Record<string, DynamicValue>
  returnType?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any'
}
```

### LogicExpression

```typescript
type LogicExpression =
  | { and: LogicExpression[] }
  | { or: LogicExpression[] }
  | { not: LogicExpression }
  | FunctionCall
  | { true: true }
  | { false: false }
```

### CheckRule

```typescript
interface CheckRule extends LogicExpression {
  message: string
}
```

### Checkable (Mixin)

```typescript
interface Checkable {
  checks?: CheckRule[]
}
```

---

## 3. Catalog Components

### Display Components

```typescript
interface TextComponent extends ComponentBase {
  component: 'Text'
  text: DynamicString
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'caption' | 'body'
}

interface ImageComponent extends ComponentBase {
  component: 'Image'
  url: DynamicString
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  variant?:
    | 'icon'
    | 'avatar'
    | 'smallFeature'
    | 'mediumFeature'
    | 'largeFeature'
    | 'header'
}

interface IconComponent extends ComponentBase {
  component: 'Icon'
  name: string | { path: string } // Icon name or bound path
}

interface VideoComponent extends ComponentBase {
  component: 'Video'
  url: DynamicString
}

interface AudioPlayerComponent extends ComponentBase {
  component: 'AudioPlayer'
  url: DynamicString
  description?: DynamicString
}

interface DividerComponent extends ComponentBase {
  component: 'Divider'
  axis?: 'horizontal' | 'vertical'
}
```

### Layout Components

```typescript
interface RowComponent extends ComponentBase {
  component: 'Row'
  children: ChildList
  justify?:
    | 'center'
    | 'end'
    | 'spaceAround'
    | 'spaceBetween'
    | 'spaceEvenly'
    | 'start'
    | 'stretch'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

interface ColumnComponent extends ComponentBase {
  component: 'Column'
  children: ChildList
  justify?:
    | 'start'
    | 'center'
    | 'end'
    | 'spaceBetween'
    | 'spaceAround'
    | 'spaceEvenly'
    | 'stretch'
  align?: 'center' | 'end' | 'start' | 'stretch'
}

interface ListComponent extends ComponentBase {
  component: 'List'
  children: ChildList
  direction?: 'vertical' | 'horizontal'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

interface CardComponent extends ComponentBase {
  component: 'Card'
  child: string // Single child component ID
}

interface TabsComponent extends ComponentBase {
  component: 'Tabs'
  tabs: Array<{
    title: DynamicString
    child: string // Component ID
  }>
}

interface ModalComponent extends ComponentBase {
  component: 'Modal'
  trigger: string // Component ID for trigger
  content: string // Component ID for content
}
```

### Interactive Components

```typescript
interface ButtonComponent extends ComponentBase, Checkable {
  component: 'Button'
  child: string // Component ID (typically Text or Icon)
  primary?: boolean
  action: {
    name: string
    context?: Record<string, DynamicValue>
  }
}

interface TextFieldComponent extends ComponentBase, Checkable {
  component: 'TextField'
  label: DynamicString
  value?: DynamicString // Two-way binding path
  variant?: 'longText' | 'number' | 'shortText' | 'obscured'
}

interface CheckBoxComponent extends ComponentBase, Checkable {
  component: 'CheckBox'
  label: DynamicString
  value: DynamicBoolean // Two-way binding path
}

interface ChoicePickerComponent extends ComponentBase, Checkable {
  component: 'ChoicePicker'
  label?: DynamicString
  variant?: 'multipleSelection' | 'mutuallyExclusive'
  options: Array<{
    label: DynamicString
    value: string
  }>
  value: DynamicStringList // Two-way binding path
}

interface SliderComponent extends ComponentBase, Checkable {
  component: 'Slider'
  label?: DynamicString
  min: number
  max: number
  value: DynamicNumber // Two-way binding path
}

interface DateTimeInputComponent extends ComponentBase, Checkable {
  component: 'DateTimeInput'
  value: DynamicString // Two-way binding path (ISO 8601)
  enableDate?: boolean
  enableTime?: boolean
  outputFormat?: string
  label?: DynamicString
}
```

### Union Type

```typescript
type Component =
  | TextComponent
  | ImageComponent
  | IconComponent
  | VideoComponent
  | AudioPlayerComponent
  | DividerComponent
  | RowComponent
  | ColumnComponent
  | ListComponent
  | CardComponent
  | TabsComponent
  | ModalComponent
  | ButtonComponent
  | TextFieldComponent
  | CheckBoxComponent
  | ChoicePickerComponent
  | SliderComponent
  | DateTimeInputComponent
```

---

## 4. Internal State Types

### SurfaceState

```typescript
interface SurfaceState {
  surfaceId: string
  catalogId: string
  components: Map<string, Component>
  dataModel: Record<string, unknown>
  created: boolean
}
```

### ProviderState

```typescript
interface ProviderState {
  surfaces: Map<string, SurfaceState>
  messageBuffer: Map<string, A2UIMessage[]>
}
```

### ScopeValue

```typescript
interface ScopeValue {
  basePath: string | null // null = root scope
}
```

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean
  errors: string[] // List of failed check messages
}
```

---

## 5. Action Types (Client to Server)

### ActionPayload

```typescript
interface ActionPayload {
  name: string
  surfaceId: string
  sourceComponentId: string
  timestamp: string // ISO 8601
  context: Record<string, unknown> // Resolved values
}
```

---

## 6. Entity Relationships

```
┌─────────────────┐
│  A2UIProvider   │
│  (ProviderState)│
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│  SurfaceState   │
│  - surfaceId    │
│  - catalogId    │
│  - components   │◄───── Map<id, Component>
│  - dataModel    │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│   Component     │
│   - id          │
│   - component   │◄───── Discriminator
│   - ...props    │
└─────────────────┘
         │ 0:N (children reference)
         ▼
┌─────────────────┐
│  ChildList      │
│  - string[]     │◄───── Static IDs
│  - {componentId,│
│     path}       │◄───── Template binding
└─────────────────┘
```

---

## 7. State Transitions

### Surface Lifecycle

```
[Not Created] ──createSurface──▶ [Created] ──deleteSurface──▶ [Deleted]
     │                               │
     │                               │ updateComponents
     │                               ▼
     │                          [Components Updated]
     │                               │
     │                               │ updateDataModel
     │                               ▼
     │                          [Data Model Updated]
     │
     └──updateComponents/updateDataModel──▶ [Buffered]
                                              │
                                              │ createSurface
                                              ▼
                                         [Buffer Applied → Created]
```

### Validation State (Input Components)

```
[Initial] ──user input──▶ [Value Changed] ──evaluate checks──▶ [Valid] or [Invalid]
                                                                    │
                                                               [Show Errors]
```

### Button State (with checks)

```
[Enabled] ──checks fail──▶ [Disabled]
    ▲                          │
    └────checks pass───────────┘
```
