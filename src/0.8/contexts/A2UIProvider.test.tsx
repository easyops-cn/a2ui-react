/**
 * A2UIProvider Tests
 *
 * Tests for the combined A2UI provider component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { A2UIProvider } from './A2UIProvider'
import { useSurfaceContext } from './SurfaceContext'
import { useDataModelContext } from './DataModelContext'
import { useActionContext } from './ActionContext'
import type { ReactNode } from 'react'

describe('A2UIProvider', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(
        <A2UIProvider>
          <div data-testid="child">Child content</div>
        </A2UIProvider>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })

  describe('context availability', () => {
    // Wrapper for hooks
    const wrapper = ({ children }: { children: ReactNode }) => (
      <A2UIProvider>{children}</A2UIProvider>
    )

    it('should provide SurfaceContext', () => {
      const { result } = renderHook(() => useSurfaceContext(), { wrapper })
      expect(result.current).toBeDefined()
      expect(result.current.surfaces).toBeInstanceOf(Map)
      expect(result.current.initSurface).toBeDefined()
    })

    it('should provide DataModelContext', () => {
      const { result } = renderHook(() => useDataModelContext(), { wrapper })
      expect(result.current).toBeDefined()
      expect(result.current.dataModels).toBeInstanceOf(Map)
      expect(result.current.setDataValue).toBeDefined()
    })

    it('should provide ActionContext', () => {
      const { result } = renderHook(() => useActionContext(), { wrapper })
      expect(result.current).toBeDefined()
      expect(result.current.dispatchAction).toBeDefined()
    })
  })

  describe('onAction prop', () => {
    it('should pass onAction to ActionProvider', () => {
      const onAction = vi.fn()

      const wrapper = ({ children }: { children: ReactNode }) => (
        <A2UIProvider onAction={onAction}>{children}</A2UIProvider>
      )

      const { result } = renderHook(() => useActionContext(), { wrapper })

      act(() => {
        result.current.dispatchAction('surface-1', 'button-1', {
          name: 'test',
        })
      })

      expect(onAction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test',
          surfaceId: 'surface-1',
          sourceComponentId: 'button-1',
        })
      )
    })

    it('should work without onAction prop', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const wrapper = ({ children }: { children: ReactNode }) => (
        <A2UIProvider>{children}</A2UIProvider>
      )

      const { result } = renderHook(() => useActionContext(), { wrapper })

      // Should not throw
      expect(() => {
        act(() => {
          result.current.dispatchAction('surface-1', 'button-1', {
            name: 'test',
          })
        })
      }).not.toThrow()

      consoleWarn.mockRestore()
    })
  })

  describe('integration', () => {
    it('should allow interaction between contexts', () => {
      const onAction = vi.fn()

      // Test component that uses all contexts
      function TestComponent() {
        const { initSurface, updateSurface, getSurface } = useSurfaceContext()
        const { setDataValue, getDataValue } = useDataModelContext()
        const { dispatchAction } = useActionContext()

        return (
          <div>
            <button
              onClick={() => {
                initSurface('test-surface', 'root')
                updateSurface('test-surface', [
                  { id: 'text-1', component: { Text: {} } },
                ])
              }}
            >
              Init Surface
            </button>
            <button
              onClick={() => {
                setDataValue('test-surface', '/name', 'John')
              }}
            >
              Set Data
            </button>
            <button
              onClick={() => {
                dispatchAction('test-surface', 'button-1', {
                  name: 'submit',
                  context: [{ key: 'name', value: { path: '/name' } }],
                })
              }}
            >
              Dispatch Action
            </button>
            <span data-testid="surface-exists">
              {getSurface('test-surface') ? 'yes' : 'no'}
            </span>
            <span data-testid="data-value">
              {String(getDataValue('test-surface', '/name') ?? 'none')}
            </span>
          </div>
        )
      }

      render(
        <A2UIProvider onAction={onAction}>
          <TestComponent />
        </A2UIProvider>
      )

      // Initially no surface
      expect(screen.getByTestId('surface-exists').textContent).toBe('no')
      expect(screen.getByTestId('data-value').textContent).toBe('none')

      // Init surface
      act(() => {
        screen.getByText('Init Surface').click()
      })
      expect(screen.getByTestId('surface-exists').textContent).toBe('yes')

      // Set data
      act(() => {
        screen.getByText('Set Data').click()
      })
      expect(screen.getByTestId('data-value').textContent).toBe('John')

      // Dispatch action
      act(() => {
        screen.getByText('Dispatch Action').click()
      })
      expect(onAction).toHaveBeenCalledWith({
        surfaceId: 'test-surface',
        name: 'submit',
        context: { name: 'John' },
        sourceComponentId: 'button-1',
      })
    })

    it('should maintain separate data for multiple surfaces', () => {
      function TestComponent() {
        const { initSurface } = useSurfaceContext()
        const { setDataValue, getDataValue } = useDataModelContext()

        return (
          <div>
            <button
              onClick={() => {
                initSurface('surface-1', 'root')
                initSurface('surface-2', 'root')
                setDataValue('surface-1', '/name', 'John')
                setDataValue('surface-2', '/name', 'Jane')
              }}
            >
              Setup
            </button>
            <span data-testid="surface-1-name">
              {String(getDataValue('surface-1', '/name') ?? '')}
            </span>
            <span data-testid="surface-2-name">
              {String(getDataValue('surface-2', '/name') ?? '')}
            </span>
          </div>
        )
      }

      render(
        <A2UIProvider>
          <TestComponent />
        </A2UIProvider>
      )

      act(() => {
        screen.getByText('Setup').click()
      })

      expect(screen.getByTestId('surface-1-name').textContent).toBe('John')
      expect(screen.getByTestId('surface-2-name').textContent).toBe('Jane')
    })
  })
})
