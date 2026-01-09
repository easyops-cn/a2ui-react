/**
 * useSurface Tests
 *
 * Tests for the useSurface hook.
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSurface } from './useSurface'
import { SurfaceProvider, useSurfaceContext } from '../contexts/SurfaceContext'
import type { ReactNode } from 'react'

describe('useSurface', () => {
  // Helper to render hook with provider
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SurfaceProvider>{children}</SurfaceProvider>
  )

  it('should return undefined for non-existent surface', () => {
    const { result } = renderHook(() => useSurface('non-existent'), { wrapper })
    expect(result.current).toBeUndefined()
  })

  it('should return surface when it exists', () => {
    // Custom wrapper that initializes a surface
    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <SurfaceProvider>
        <SurfaceInitializer>{children}</SurfaceInitializer>
      </SurfaceProvider>
    )

    function SurfaceInitializer({ children }: { children: ReactNode }) {
      const { initSurface } = useSurfaceContext()
      React.useEffect(() => {
        initSurface('test-surface', 'root-component', { font: 'Arial' })
      }, [initSurface])
      return <>{children}</>
    }

    const { result } = renderHook(() => useSurface('test-surface'), {
      wrapper: TestWrapper,
    })

    expect(result.current).toBeDefined()
    expect(result.current?.surfaceId).toBe('test-surface')
    expect(result.current?.root).toBe('root-component')
    expect(result.current?.styles?.font).toBe('Arial')
  })

  it('should update when surface changes', () => {
    const { result } = renderHook(
      () => {
        const surface = useSurface('test-surface')
        const { initSurface, updateSurface } = useSurfaceContext()
        return { surface, initSurface, updateSurface }
      },
      { wrapper }
    )

    // Initially undefined
    expect(result.current.surface).toBeUndefined()

    // Initialize surface
    act(() => {
      result.current.initSurface('test-surface', 'root')
    })

    expect(result.current.surface).toBeDefined()
    expect(result.current.surface?.root).toBe('root')

    // Update surface with components
    act(() => {
      result.current.updateSurface('test-surface', [
        { id: 'comp-1', component: { Text: {} } },
      ])
    })

    expect(result.current.surface?.components.size).toBe(1)
  })

  it('should memoize result based on surfaceId', () => {
    const { result, rerender } = renderHook(
      ({ surfaceId }) => {
        const surface = useSurface(surfaceId)
        const { initSurface } = useSurfaceContext()
        return { surface, initSurface }
      },
      { wrapper, initialProps: { surfaceId: 'surface-1' } }
    )

    act(() => {
      result.current.initSurface('surface-1', 'root-1')
      result.current.initSurface('surface-2', 'root-2')
    })

    expect(result.current.surface?.root).toBe('root-1')

    // Change surfaceId
    rerender({ surfaceId: 'surface-2' })
    expect(result.current.surface?.root).toBe('root-2')
  })

  it('should throw error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useSurface('test'))
    }).toThrow('useSurfaceContext must be used within a SurfaceProvider')

    consoleError.mockRestore()
  })
})

import React from 'react'
