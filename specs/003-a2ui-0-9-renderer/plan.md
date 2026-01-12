# Implementation Plan: A2UI 0.9 Renderer

**Branch**: `003-a2ui-0-9-renderer` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-a2ui-0-9-renderer/spec.md`

## Summary

Implement the A2UI 0.9 Renderer with an API compatible with the existing 0.8 pattern (`A2UIProvider`, `A2UIRenderer`, hooks). The 0.9 protocol introduces significant simplifications: flat component format with discriminator property, simplified data binding (`{"path": "..."}` instead of `literalString`/`literalNumber` wrappers), standard JSON objects for data model updates, string interpolation with `${expression}` syntax, and a unified `checks` property for validation.

## Technical Context

**Language/Version**: TypeScript 5.9
**Primary Dependencies**: React 19, Radix UI (for UI primitives), Tailwind CSS (via class-variance-authority), lucide-react (icons)
**Storage**: N/A (client-side rendering library)
**Testing**: Vitest + React Testing Library + jsdom
**Target Platform**: Browser (modern ES modules)
**Project Type**: React library (npm package)
**Performance Goals**: Data bindings update within 16ms of data model changes (single frame at 60fps)
**Constraints**: Bundle size should remain reasonable; API compatibility with 0.8 pattern
**Scale/Scope**: 18 standard catalog components, 5 validation functions, multi-surface support

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

The constitution template is not yet configured for this project. No blocking gates identified.

**Status**: PASS (no constitution constraints defined)

## Project Structure

### Documentation (this feature)

```text
specs/003-a2ui-0-9-renderer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no external API)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/0.9/
├── index.ts                     # Public API exports (mirrors 0.8/index.ts)
├── A2UIRenderer.tsx             # Main renderer component
├── types/
│   └── index.ts                 # TypeScript types for 0.9 protocol
├── contexts/
│   ├── A2UIProvider.tsx         # Provider with multi-surface support
│   ├── SurfaceContext.tsx       # Surface state (components map, root ID)
│   ├── DataModelContext.tsx     # Data model state with JSON Pointer paths
│   ├── ActionContext.tsx        # Action dispatch context
│   ├── ComponentsMapContext.tsx # Custom components registry
│   └── ScopeContext.tsx         # NEW: Collection scope for relative paths
├── hooks/
│   ├── useA2UIMessageHandler.ts # Message processing (createSurface, updateComponents, etc.)
│   ├── useDataBinding.ts        # Data binding with relative/absolute path support
│   ├── useDispatchAction.ts     # Action dispatch with context resolution
│   ├── useComponent.ts          # Component lookup from adjacency list
│   ├── useInterpolation.ts      # NEW: String interpolation parser
│   └── useValidation.ts         # NEW: Checks evaluation
├── utils/
│   ├── pathUtils.ts             # JSON Pointer parsing and resolution
│   ├── dataBinding.ts           # Dynamic value resolution
│   ├── interpolation.ts         # NEW: ${expression} parsing
│   └── validation.ts            # NEW: Validation function implementations
├── components/
│   ├── index.ts                 # Component exports
│   ├── ComponentRenderer.tsx    # Recursive component renderer
│   ├── UnknownComponent.tsx     # Fallback for unknown component types
│   ├── display/
│   │   ├── index.ts
│   │   ├── TextComponent.tsx
│   │   ├── ImageComponent.tsx
│   │   ├── IconComponent.tsx
│   │   ├── VideoComponent.tsx
│   │   ├── AudioPlayerComponent.tsx
│   │   └── DividerComponent.tsx
│   ├── layout/
│   │   ├── index.ts
│   │   ├── RowComponent.tsx
│   │   ├── ColumnComponent.tsx
│   │   ├── ListComponent.tsx
│   │   ├── CardComponent.tsx
│   │   ├── TabsComponent.tsx
│   │   └── ModalComponent.tsx
│   └── interactive/
│       ├── index.ts
│       ├── ButtonComponent.tsx
│       ├── TextFieldComponent.tsx
│       ├── CheckBoxComponent.tsx
│       ├── ChoicePickerComponent.tsx  # Renamed from MultipleChoiceComponent
│       ├── SliderComponent.tsx
│       └── DateTimeInputComponent.tsx
└── schemas/                     # Already exists - protocol schemas
    ├── common_types.json
    ├── server_to_client.json
    ├── client_to_server.json
    └── standard_catalog.json

tests/
└── 0.9/                         # Test files co-located with source
    ├── contexts/
    ├── hooks/
    ├── utils/
    └── components/
```

**Structure Decision**: Mirror the existing 0.8 structure under `src/0.9/` for consistency. Add new modules for interpolation, validation, and scope context. Tests co-located with source files following existing pattern.

## Key Architectural Decisions

### 1. Multi-Surface State Management

The 0.9 renderer must support multiple simultaneous surfaces. Each surface has:

- Its own component tree (adjacency list)
- Its own data model
- Its own message buffer (for pre-createSurface messages)

**Approach**: Use a Map<surfaceId, SurfaceState> in A2UIProvider to manage multiple surfaces.

### 2. Message Processing Pipeline

Messages flow through: A2UIProvider → useA2UIMessageHandler → Surface/DataModel contexts

**0.9 Message Types**:

- `createSurface` → Initialize surface, set catalogId
- `updateComponents` → Upsert components into adjacency list
- `updateDataModel` → JSON object merge/replace at path
- `deleteSurface` → Remove surface state

### 3. Data Binding Resolution

**0.9 Format**: `{"path": "/absolute"}` or `{"path": "relative"}` or literal value

Resolution order:

1. Check if value is object with `path` property → resolve path
2. Check if value is string with `${...}` → interpolate
3. Otherwise → use literal value

### 4. String Interpolation

Parse `${expression}` within DynamicString values:

- `${/absolute/path}` → resolve from root data model
- `${relative/path}` → resolve from current scope
- `${functionName(args)}` → evaluate function (deferred)
- `\${literal}` → escape to literal `${`

### 5. Collection Scope (Template Binding)

When `ChildList` uses template binding `{"componentId": "...", "path": "/items"}`:

1. Create a new ScopeContext for each array item
2. Relative paths resolve within that scope
3. Absolute paths (starting with `/`) resolve from root

### 6. Validation System

`checks` property on input components and Buttons:

- Array of `CheckRule` objects
- Each rule is a `LogicExpression` with `message`
- Failed checks → display error message (inputs) or disable (buttons)

**Initial Functions**: `required`, `email`, `regex`, `length`, `numeric`

## Property Renames from 0.8 to 0.9

| Component      | 0.8 Property      | 0.9 Property                     |
| -------------- | ----------------- | -------------------------------- |
| Row/Column     | `distribution`    | `justify`                        |
| Row/Column     | `alignment`       | `align`                          |
| Modal          | `entryPointChild` | `trigger`                        |
| Modal          | `contentChild`    | `content`                        |
| Tabs           | `tabItems`        | `tabs`                           |
| TextField      | `text`            | `value`                          |
| Many           | `usageHint`       | `variant`                        |
| Slider         | `minValue`        | `min`                            |
| Slider         | `maxValue`        | `max`                            |
| MultipleChoice | -                 | ChoicePicker (renamed component) |

## Complexity Tracking

No constitution violations to justify.
