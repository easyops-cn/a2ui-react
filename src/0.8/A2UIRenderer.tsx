/**
 * A2UIRenderer - Component for rendering A2UI surfaces.
 *
 * This component renders the surfaces from the A2UI context.
 * It must be used within an A2UIProvider.
 *
 * @example
 * ```tsx
 * import { A2UIProvider, A2UIRenderer, A2UIMessage, A2UIAction } from '@easyops-cn/a2ui-react/0.8'
 *
 * function App() {
 *   const messages: A2UIMessage[] = [...]
 *   const handleAction = (action: A2UIAction) => {
 *     console.log('Action:', action)
 *   }
 *   return (
 *     <A2UIProvider messages={messages} onAction={handleAction}>
 *       <A2UIRenderer />
 *     </A2UIProvider>
 *   )
 * }
 *
 * // With custom middleware component that uses hooks
 * function AppWithMiddleware() {
 *   return (
 *     <A2UIProvider messages={messages} onAction={handleAction}>
 *       <MyCustomMiddleware>
 *         <A2UIRenderer />
 *       </MyCustomMiddleware>
 *     </A2UIProvider>
 *   )
 * }
 * ```
 */

import { useSurfaceContext } from './contexts/SurfaceContext'
import { ComponentRenderer } from './components/ComponentRenderer'

/**
 * Component for rendering A2UI surfaces.
 *
 * Renders all surfaces from the A2UI context. Must be used within an A2UIProvider.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <A2UIProvider messages={messages} onAction={handleAction}>
 *   <A2UIRenderer />
 * </A2UIProvider>
 *
 * // With custom middleware for hooks access
 * <A2UIProvider messages={messages} onAction={handleAction}>
 *   <MyCustomComponent />
 *   <A2UIRenderer />
 * </A2UIProvider>
 * ```
 */
export function A2UIRenderer() {
  const { surfaces } = useSurfaceContext()

  // Render all surfaces
  const surfaceEntries = Array.from(surfaces.entries())

  if (surfaceEntries.length === 0) {
    return null
  }

  return (
    <>
      {surfaceEntries.map(([surfaceId, surface]) => {
        // Only render surfaces that have a root component
        if (!surface.root) {
          return null
        }
        return (
          <ComponentRenderer
            key={surfaceId}
            surfaceId={surfaceId}
            componentId={surface.root}
          />
        )
      })}
    </>
  )
}

A2UIRenderer.displayName = 'A2UI.Renderer'
