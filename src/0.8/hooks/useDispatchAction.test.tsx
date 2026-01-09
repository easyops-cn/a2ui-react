/**
 * useDispatchAction Tests
 *
 * Tests for the useDispatchAction and useBoundDispatchAction hooks.
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDispatchAction, useBoundDispatchAction } from './useDispatchAction'
import { ActionProvider } from '../contexts/ActionContext'
import { DataModelProvider } from '../contexts/DataModelContext'
import type { ReactNode } from 'react'
import type { Action, ActionPayload } from '../types'

describe('useDispatchAction', () => {
  // Helper to create wrapper with providers
  const createWrapper =
    (onAction?: (action: ActionPayload) => void) =>
    ({ children }: { children: ReactNode }) => (
      <DataModelProvider>
        <ActionProvider onAction={onAction}>{children}</ActionProvider>
      </DataModelProvider>
    )

  describe('useDispatchAction', () => {
    it('should return dispatch function', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useDispatchAction(), { wrapper })
      expect(typeof result.current).toBe('function')
    })

    it('should dispatch action with correct payload', () => {
      const onAction = vi.fn()
      const wrapper = createWrapper(onAction)

      const { result } = renderHook(() => useDispatchAction(), { wrapper })

      const action: Action = {
        name: 'submit',
        context: [{ key: 'type', value: { literalString: 'form' } }],
      }

      act(() => {
        result.current('surface-1', 'button-1', action)
      })

      expect(onAction).toHaveBeenCalledWith({
        surfaceId: 'surface-1',
        name: 'submit',
        context: { type: 'form' },
        sourceComponentId: 'button-1',
      })
    })

    it('should dispatch action without context', () => {
      const onAction = vi.fn()
      const wrapper = createWrapper(onAction)

      const { result } = renderHook(() => useDispatchAction(), { wrapper })

      const action: Action = { name: 'cancel' }

      act(() => {
        result.current('surface-1', 'button-1', action)
      })

      expect(onAction).toHaveBeenCalledWith({
        surfaceId: 'surface-1',
        name: 'cancel',
        context: {},
        sourceComponentId: 'button-1',
      })
    })

    it('should throw error when used outside provider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        renderHook(() => useDispatchAction())
      }).toThrow('useActionContext must be used within an ActionProvider')

      consoleError.mockRestore()
    })
  })

  describe('useBoundDispatchAction', () => {
    it('should return bound dispatch function', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(
        () => useBoundDispatchAction('surface-1', 'button-1'),
        { wrapper }
      )
      expect(typeof result.current).toBe('function')
    })

    it('should dispatch action with bound surfaceId and componentId', () => {
      const onAction = vi.fn()
      const wrapper = createWrapper(onAction)

      const { result } = renderHook(
        () => useBoundDispatchAction('surface-1', 'button-1'),
        { wrapper }
      )

      const action: Action = { name: 'click' }

      act(() => {
        result.current(action)
      })

      expect(onAction).toHaveBeenCalledWith({
        surfaceId: 'surface-1',
        name: 'click',
        context: {},
        sourceComponentId: 'button-1',
      })
    })

    it('should dispatch multiple actions with same bound values', () => {
      const onAction = vi.fn()
      const wrapper = createWrapper(onAction)

      const { result } = renderHook(
        () => useBoundDispatchAction('surface-1', 'multi-button'),
        { wrapper }
      )

      act(() => {
        result.current({ name: 'action1' })
        result.current({ name: 'action2' })
        result.current({ name: 'action3' })
      })

      expect(onAction).toHaveBeenCalledTimes(3)
      expect(onAction).toHaveBeenNthCalledWith(1, {
        surfaceId: 'surface-1',
        name: 'action1',
        context: {},
        sourceComponentId: 'multi-button',
      })
      expect(onAction).toHaveBeenNthCalledWith(2, {
        surfaceId: 'surface-1',
        name: 'action2',
        context: {},
        sourceComponentId: 'multi-button',
      })
      expect(onAction).toHaveBeenNthCalledWith(3, {
        surfaceId: 'surface-1',
        name: 'action3',
        context: {},
        sourceComponentId: 'multi-button',
      })
    })

    it('should update when surfaceId or componentId changes', () => {
      const onAction = vi.fn()
      const wrapper = createWrapper(onAction)

      const { result, rerender } = renderHook(
        ({ surfaceId, componentId }) =>
          useBoundDispatchAction(surfaceId, componentId),
        {
          wrapper,
          initialProps: { surfaceId: 'surface-1', componentId: 'button-1' },
        }
      )

      act(() => {
        result.current({ name: 'action' })
      })

      expect(onAction).toHaveBeenLastCalledWith(
        expect.objectContaining({
          surfaceId: 'surface-1',
          sourceComponentId: 'button-1',
        })
      )

      // Change props
      rerender({ surfaceId: 'surface-2', componentId: 'button-2' })

      act(() => {
        result.current({ name: 'action' })
      })

      expect(onAction).toHaveBeenLastCalledWith(
        expect.objectContaining({
          surfaceId: 'surface-2',
          sourceComponentId: 'button-2',
        })
      )
    })

    it('should throw error when used outside provider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        renderHook(() => useBoundDispatchAction('surface', 'component'))
      }).toThrow('useActionContext must be used within an ActionProvider')

      consoleError.mockRestore()
    })
  })
})
