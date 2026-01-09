/**
 * useSurface - Hook to get a Surface by ID.
 */

import { useMemo } from 'react'
import type { Surface } from '../types'
import { useSurfaceContext } from '../contexts/SurfaceContext'

/**
 * Gets a Surface by its ID.
 *
 * @param surfaceId - The surface ID to look up
 * @returns The Surface, or undefined if not found
 *
 * @example
 * ```tsx
 * function MySurface({ surfaceId }) {
 *   const surface = useSurface(surfaceId);
 *
 *   if (!surface) {
 *     return <div>Surface not found</div>;
 *   }
 *
 *   return <ComponentRenderer surfaceId={surfaceId} componentId={surface.root} />;
 * }
 * ```
 */
export function useSurface(surfaceId: string): Surface | undefined {
  const { surfaces } = useSurfaceContext()

  return useMemo(() => {
    return surfaces.get(surfaceId)
  }, [surfaces, surfaceId])
}
