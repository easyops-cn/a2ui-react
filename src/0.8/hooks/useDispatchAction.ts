/**
 * useDispatchAction - Hook for dispatching actions from components.
 */

import { useCallback } from 'react'
import type { Action } from '../types'
import { useActionContext } from '../contexts/ActionContext'

/**
 * Returns a function to dispatch actions.
 *
 * @returns A function that dispatches actions
 *
 * @example
 * ```tsx
 * function ButtonComponent({ surfaceId, componentId, action }) {
 *   const dispatchAction = useDispatchAction();
 *
 *   const handleClick = () => {
 *     if (action) {
 *       dispatchAction(surfaceId, componentId, action);
 *     }
 *   };
 *
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */
export function useDispatchAction(): (
  surfaceId: string,
  componentId: string,
  action: Action
) => void {
  const { dispatchAction } = useActionContext()
  return dispatchAction
}

/**
 * Returns a bound dispatch function for a specific surface and component.
 * Useful when you have multiple actions from the same component.
 *
 * @param surfaceId - The surface ID
 * @param componentId - The component ID
 * @returns A function that dispatches actions for this component
 *
 * @example
 * ```tsx
 * function MultiButtonComponent({ surfaceId, componentId, actions }) {
 *   const dispatch = useBoundDispatchAction(surfaceId, componentId);
 *
 *   return (
 *     <div>
 *       {actions.map((action) => (
 *         <button key={action.name} onClick={() => dispatch(action)}>
 *           {action.name}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBoundDispatchAction(
  surfaceId: string,
  componentId: string
): (action: Action) => void {
  const { dispatchAction } = useActionContext()

  return useCallback(
    (action: Action) => {
      dispatchAction(surfaceId, componentId, action)
    },
    [dispatchAction, surfaceId, componentId]
  )
}
