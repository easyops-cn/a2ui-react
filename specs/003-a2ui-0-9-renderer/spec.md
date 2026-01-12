# Feature Specification: A2UI 0.9 Renderer Implementation

**Feature Branch**: `003-a2ui-0-9-renderer`
**Created**: 2026-01-12
**Status**: Draft
**Input**: User description: "实现 A2UI 0.9 的 Renderer，对外接口应和当前 0.8 基本一致，0.9 的文档和 schema 见 @src/0.9/docs/ 和 @src/0.9/schemas/"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Basic UI Rendering with New Message Format (Priority: P1)

A downstream developer integrates the A2UI 0.9 Renderer into their React application to render dynamic UIs. They receive server messages in the new 0.9 format (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`) and the renderer correctly processes and displays the UI.

**Why this priority**: This is the core functionality - without basic message processing and rendering, nothing else works. The 0.9 protocol has fundamental changes in message structure (flat component format with discriminator property vs. wrapped key-based format) that must work correctly.

**Independent Test**: Can be fully tested by sending a sequence of `createSurface` and `updateComponents` messages and verifying the UI renders correctly with basic components (Text, Button, Row, Column).

**Acceptance Scenarios**:

1. **Given** an A2UIProvider with the 0.9 renderer, **When** a `createSurface` message with `surfaceId` and `catalogId` is received, **Then** a new surface context is created and ready for component updates
2. **Given** a created surface, **When** `updateComponents` messages are received with flat component definitions (e.g., `{"id": "root", "component": "Column", "children": ["title"]}`), **Then** the components are parsed correctly and rendered using the adjacency list model
3. **Given** components referencing a non-existent component ID, **When** rendering occurs, **Then** the renderer gracefully handles missing references without crashing

---

### User Story 2 - Data Model Binding with Simplified Value Format (Priority: P1)

A developer creates a data-driven UI where component properties are bound to the data model using the simplified 0.9 value format. Properties accept either literal values directly (e.g., `"text": "Hello"`) or path bindings (e.g., `"text": {"path": "/user/name"}`), replacing the verbose 0.8 `literalString`/`literalNumber` wrappers.

**Why this priority**: Data binding is fundamental to dynamic UIs. The 0.9 protocol simplifies this significantly, and the renderer must correctly handle both literal values and path bindings.

**Independent Test**: Can be tested by sending `updateDataModel` with JSON objects (not arrays of key-value pairs) and verifying bound component properties update reactively.

**Acceptance Scenarios**:

1. **Given** a Text component with `"text": "Hello"` (literal), **When** rendered, **Then** displays "Hello"
2. **Given** a Text component with `"text": {"path": "/greeting"}`, **When** `updateDataModel` sets `/greeting` to "Welcome", **Then** the text updates to "Welcome"
3. **Given** `updateDataModel` with `path: "/user"` and `value: {"name": "Jane"}`, **When** processed, **Then** the data model at `/user` is replaced/created with the provided JSON object
4. **Given** `updateDataModel` with `path: "/user/name"` and no `value` field, **When** processed, **Then** the data at `/user/name` is removed

---

### User Story 3 - Two-Way Binding for Input Components (Priority: P1)

A developer builds forms where user input immediately updates the local data model. TextField, CheckBox, ChoicePicker, Slider, and DateTimeInput components write user changes to their bound data paths, enabling reactive updates across the UI.

**Why this priority**: Two-way binding is essential for form handling. Components like TextField now use `value` instead of `text`, and the local data model must update immediately on user interaction.

**Independent Test**: Can be tested by interacting with form components and verifying the data model updates, which in turn updates other components bound to the same path.

**Acceptance Scenarios**:

1. **Given** a TextField with `value: {"path": "/form/email"}`, **When** user types "test@example.com", **Then** the data model at `/form/email` is immediately updated
2. **Given** a TextField and a Text component both bound to `/form/name`, **When** user types in TextField, **Then** the Text component updates in real-time
3. **Given** a CheckBox with `value: {"path": "/form/agree"}`, **When** user toggles it, **Then** the boolean value at `/form/agree` is updated
4. **Given** a ChoicePicker with `value: {"path": "/form/preference"}`, **When** user selects an option, **Then** the string array at `/form/preference` is updated

---

### User Story 4 - String Interpolation in Dynamic Strings (Priority: P2)

A developer uses the new `${expression}` syntax to embed data model values and function calls directly within string properties. This allows mixing static text with dynamic values without complex JSON structures.

**Why this priority**: String interpolation is a major 0.9 enhancement that improves developer experience and reduces message complexity. It's not strictly required for basic functionality but is important for advanced use cases.

**Independent Test**: Can be tested by using interpolated strings in Text components and verifying they resolve correctly with data model values.

**Acceptance Scenarios**:

1. **Given** a Text with `text: "Hello, ${/user/name}!"`, **When** data model has `/user/name` = "Alice", **Then** displays "Hello, Alice!"
2. **Given** a Text with `text: "Welcome to ${/appName}. ${name}"` in a template context where current item has `name: "Bob"`, **When** rendered, **Then** absolute paths resolve from root and relative paths from current scope
3. **Given** a Text with `text: "Escaped: \\${literal}"`, **When** rendered, **Then** displays "Escaped: ${literal}"
4. **Given** a non-string value in interpolation (number, boolean), **When** interpolated, **Then** the value is converted to its string representation

---

### User Story 5 - Dynamic Children with Template Binding (Priority: P2)

A developer creates lists where children are dynamically generated from a data array. Container components (Column, Row, List) accept a `ChildList` that can be either a static array of IDs or a template object with `componentId` and `path`.

**Why this priority**: Dynamic list rendering is common in data-driven UIs. The template binding feature enables efficient rendering of lists from data.

**Independent Test**: Can be tested by providing a data array and a template, verifying each array item generates a component instance with correctly scoped data bindings.

**Acceptance Scenarios**:

1. **Given** a List with `children: {"componentId": "item_template", "path": "/items"}`, **When** data model has `/items` as an array of 3 objects, **Then** 3 instances of the template component are rendered
2. **Given** a template component with `text: {"path": "name"}` (relative path), **When** rendering item at index 1, **Then** the path resolves to `/items/1/name`
3. **Given** a template component with `text: {"path": "/appName"}` (absolute path), **When** rendered within a collection scope, **Then** the path resolves from root data model

---

### User Story 6 - Action Dispatch with Simplified Context (Priority: P2)

A developer adds buttons that dispatch actions when clicked. The action context uses standard JSON objects (not arrays of key-value pairs) and values can include both literals and path bindings.

**Why this priority**: Actions are required for user interactions. The 0.9 format simplifies context definition, making it easier to construct action payloads.

**Independent Test**: Can be tested by clicking a Button and verifying the `onAction` callback receives the correctly resolved context payload.

**Acceptance Scenarios**:

1. **Given** a Button with `action: {name: "submit", context: {userId: "123", email: {"path": "/form/email"}}}`, **When** clicked, **Then** `onAction` receives resolved context with literal "123" and bound email value
2. **Given** an action context referencing a data model path, **When** the action is dispatched, **Then** the path is resolved to the current value at dispatch time
3. **Given** an action with context containing function calls (e.g., `{"call": "now", "returnType": "string"}`), **When** dispatched, **Then** the function result is included in the context

---

### User Story 7 - Client-Side Validation with Checks (Priority: P3)

A developer adds validation rules to input components using the `checks` property. Each check is a function call that returns a boolean, and failed checks display error messages.

**Why this priority**: Validation enhances user experience but is not required for basic functionality. The 0.9 `checks` array replaces the 0.8 `validationRegexp`.

**Independent Test**: Can be tested by entering invalid data in a TextField with checks and verifying error messages appear.

**Acceptance Scenarios**:

1. **Given** a TextField with `checks: [{call: "required", message: "Required"}]`, **When** value is empty, **Then** error message "Required" is displayed
2. **Given** a TextField with `checks: [{call: "email", message: "Invalid email"}]`, **When** value is "notanemail", **Then** error message is displayed
3. **Given** a Button with `checks` that reference data model paths, **When** checks fail, **Then** the button is disabled

---

### User Story 8 - All Standard Catalog Components (Priority: P3)

A developer uses all components from the standard catalog: Text, Image, Icon, Video, AudioPlayer, Row, Column, List, Card, Tabs, Modal, Divider, Button, TextField, CheckBox, ChoicePicker, Slider, DateTimeInput.

**Why this priority**: Complete component coverage ensures the renderer supports the full standard catalog. Lower priority because basic components (P1/P2) cover most use cases.

**Independent Test**: Can be tested by rendering each component type and verifying it displays correctly.

**Acceptance Scenarios**:

1. **Given** each component type from the standard catalog, **When** rendered with valid properties, **Then** the component displays correctly
2. **Given** a Tabs component with `tabs` array (renamed from `tabItems`), **When** rendered, **Then** tabs are displayed with correct titles and content switching works
3. **Given** a Modal with `trigger` and `content` (renamed from `entryPointChild` and `contentChild`), **When** trigger is clicked, **Then** modal opens with content
4. **Given** a ChoicePicker with `variant: "mutuallyExclusive"` (radio behavior), **When** user selects an option, **Then** only one option can be selected at a time

---

### Edge Cases

- What happens when `createSurface` is received for an already-existing surfaceId? → Log error via `console.error` and keep existing surface unchanged
- How does the system handle `updateComponents` before `createSurface`? → Buffer components until `createSurface` arrives, then apply queued updates
- What happens when a component references a non-existent child ID? (Assumed: skip rendering that child, log warning)
- How does the system handle circular references in component tree? (Assumed: detect and break cycles to prevent infinite loops)
- What happens when data binding path does not exist in data model? (Assumed: return undefined/null, component handles gracefully)
- How does the system handle malformed interpolation syntax (e.g., unclosed `${`)? (Assumed: treat as literal text, log warning)
- What happens when a required function for checks is not registered? (Assumed: check fails with error logged)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST process `createSurface` messages containing `surfaceId` and `catalogId` to initialize new surfaces
- **FR-002**: System MUST process `updateComponents` messages with flat component arrays using the discriminator pattern (`"component": "Text"`)
- **FR-003**: System MUST process `updateDataModel` messages with standard JSON object values (not arrays of key-value pairs)
- **FR-004**: System MUST support `deleteSurface` messages to remove surfaces
- **FR-005**: System MUST resolve data bindings using `{"path": "..."}` syntax for all Dynamic\* types
- **FR-006**: System MUST support literal values directly in component properties (e.g., `"text": "Hello"` instead of `{"literalString": "Hello"}`)
- **FR-007**: System MUST implement two-way binding for input components (TextField, CheckBox, ChoicePicker, Slider, DateTimeInput)
- **FR-008**: System MUST support the `ChildList` type for both static arrays and template bindings
- **FR-009**: System MUST resolve relative paths within collection scopes (template-generated components)
- **FR-010**: System MUST implement string interpolation with `${expression}` syntax for DynamicString properties
- **FR-011**: System MUST dispatch actions with resolved context values when Button is clicked
- **FR-012**: System MUST provide an API compatible with the existing 0.8 API pattern (`A2UIProvider`, `A2UIRenderer`, hooks)
- **FR-013**: System MUST support the `checks` property for validation on input components and Buttons
- **FR-014**: System MUST render a component tree starting from a component with `id: "root"`
- **FR-015**: System MUST handle renamed properties from 0.8 (e.g., `justify` instead of `distribution`, `variant` instead of `usageHint`)
- **FR-016**: System MUST log warnings via `console.warn` for recoverable issues (missing child IDs, non-existent data paths) and `console.error` for critical errors (malformed messages)
- **FR-017**: System MUST support multiple simultaneous surfaces within a single provider, each identified by unique `surfaceId`

### Key Entities

- **Surface**: Top-level container identified by `surfaceId`, associated with a `catalogId`, containing a component tree and data model
- **Component**: UI element with `id`, `component` type discriminator, and type-specific properties; organized as adjacency list with ID references
- **Data Model**: Hierarchical JSON structure storing application state; components bind to paths using JSON Pointers (RFC 6901)
- **Action**: Named event with context payload, dispatched from Button clicks; context values resolved at dispatch time
- **Check**: Validation rule defined as a function call returning boolean, with associated error message
- **ChildList**: Either static array of component IDs or template binding with `componentId` and data `path`

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can migrate from 0.8 to 0.9 with minimal API changes (same `A2UIProvider`/`A2UIRenderer` pattern)
- **SC-002**: All 18 standard catalog components render correctly with their 0.9 property schemas
- **SC-003**: Data bindings update within 16ms of data model changes (single frame at 60fps)
- **SC-004**: String interpolation correctly resolves expressions with mixed static text and dynamic values
- **SC-005**: Input components maintain two-way binding with immediate local updates
- **SC-006**: Action dispatch includes correctly resolved context values
- **SC-007**: Validation checks display appropriate error messages when conditions fail
- **SC-008**: Dynamic children via template binding correctly scope relative path resolution

## Clarifications

### Session 2026-01-12

- Q: What should happen when `updateComponents` is received before `createSurface` for a given surfaceId? → A: Buffer until surface created - Queue components and apply when `createSurface` arrives
- Q: How should the renderer report warnings and errors (e.g., missing child IDs, invalid paths, malformed interpolation)? → A: Console logging - Use `console.warn`/`console.error` for development warnings
- Q: Should all functions defined in the standard catalog be implemented in the initial release, or should only a subset be prioritized? → A: Validation first - Implement validation functions (`required`, `email`, `regex`, `length`, `numeric`) first; defer formatting functions
- Q: What should happen when `createSurface` is received for an already-existing surfaceId? → A: Error - Log error via `console.error` and keep existing surface unchanged
- Q: Should the 0.9 renderer support multiple simultaneous surfaces (multi-surface rendering)? → A: Yes, supported - Multiple surfaces can be created and rendered simultaneously within one provider

## Assumptions

- The 0.9 renderer will be exposed under `@easyops-cn/a2ui-react/0.9` similar to the 0.8 export
- Custom component registration will follow the same pattern as 0.8 (`components` prop as Map)
- Standard validation functions (`required`, `email`, `regex`, `length`, `numeric`) will be implemented in the initial release; formatting functions (e.g., `now`, `formatDate`) are deferred to a future release
- The renderer will maintain backward compatibility with React 19+ as specified in the project
- Function calls in interpolation and checks will initially support the functions defined in the standard catalog
