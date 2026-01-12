/**
 * Tests for interpolation utilities.
 */

import { describe, it, expect } from 'vitest'
import {
  hasInterpolation,
  parseInterpolation,
  interpolate,
  getInterpolationDependencies,
} from './interpolation'

describe('hasInterpolation', () => {
  it('should return true for strings with interpolation', () => {
    expect(hasInterpolation('Hello, ${/user/name}!')).toBe(true)
    expect(hasInterpolation('${/value}')).toBe(true)
    expect(hasInterpolation('Start ${/a} middle ${/b} end')).toBe(true)
  })

  it('should return false for strings without interpolation', () => {
    expect(hasInterpolation('Hello, World!')).toBe(false)
    expect(hasInterpolation('')).toBe(false)
    expect(hasInterpolation('No interpolation here')).toBe(false)
  })

  it('should return false for escaped interpolation', () => {
    expect(hasInterpolation('Escaped \\${/user/name}')).toBe(false)
    expect(hasInterpolation('\\${a} \\${b}')).toBe(false)
  })

  it('should return true when mix of escaped and unescaped', () => {
    expect(hasInterpolation('\\${escaped} ${/unescaped}')).toBe(true)
  })
})

describe('parseInterpolation', () => {
  it('should extract single path', () => {
    expect(parseInterpolation('Hello, ${/user/name}!')).toEqual(['/user/name'])
  })

  it('should extract multiple paths', () => {
    expect(parseInterpolation('${/a} and ${/b} and ${/c}')).toEqual([
      '/a',
      '/b',
      '/c',
    ])
  })

  it('should trim whitespace in expressions', () => {
    expect(parseInterpolation('${ /user/name }')).toEqual(['/user/name'])
    expect(parseInterpolation('${  /path  }')).toEqual(['/path'])
  })

  it('should return empty array for no interpolation', () => {
    expect(parseInterpolation('Hello, World!')).toEqual([])
    expect(parseInterpolation('')).toEqual([])
  })

  it('should skip escaped expressions', () => {
    expect(parseInterpolation('\\${/escaped}')).toEqual([])
    expect(parseInterpolation('\\${/a} ${/b}')).toEqual(['/b'])
  })

  it('should handle relative paths', () => {
    expect(parseInterpolation('${name}')).toEqual(['name'])
    expect(parseInterpolation('${./relative}')).toEqual(['./relative'])
  })
})

describe('interpolate', () => {
  const dataModel = {
    user: {
      name: 'John',
      age: 30,
    },
    stats: {
      count: 42,
      active: true,
    },
    items: ['a', 'b', 'c'],
  }

  it('should interpolate single value', () => {
    expect(interpolate('Hello, ${/user/name}!', dataModel)).toBe('Hello, John!')
  })

  it('should interpolate multiple values', () => {
    expect(
      interpolate('${/user/name} is ${/user/age} years old', dataModel)
    ).toBe('John is 30 years old')
  })

  it('should handle number values', () => {
    expect(interpolate('Count: ${/stats/count}', dataModel)).toBe('Count: 42')
  })

  it('should handle boolean values', () => {
    expect(interpolate('Active: ${/stats/active}', dataModel)).toBe(
      'Active: true'
    )
  })

  it('should handle array values as JSON', () => {
    expect(interpolate('Items: ${/items}', dataModel)).toBe(
      'Items: ["a","b","c"]'
    )
  })

  it('should handle object values as JSON', () => {
    expect(interpolate('User: ${/user}', dataModel)).toBe(
      'User: {"name":"John","age":30}'
    )
  })

  it('should handle undefined values as empty string', () => {
    expect(interpolate('Missing: ${/nonexistent}', dataModel)).toBe('Missing: ')
    expect(interpolate('${/a}${/b}${/c}', dataModel)).toBe('')
  })

  it('should handle null values as empty string', () => {
    const modelWithNull = { value: null }
    expect(interpolate('Value: ${/value}', modelWithNull)).toBe('Value: ')
  })

  it('should preserve text without interpolation', () => {
    expect(interpolate('Hello, World!', dataModel)).toBe('Hello, World!')
    expect(interpolate('No variables here', dataModel)).toBe(
      'No variables here'
    )
  })

  it('should unescape escaped expressions', () => {
    expect(interpolate('Escaped \\${/user/name}', dataModel)).toBe(
      'Escaped ${/user/name}'
    )
    expect(interpolate('\\${a} and \\${b}', dataModel)).toBe('${a} and ${b}')
  })

  it('should handle mix of escaped and unescaped', () => {
    expect(interpolate('\\${escaped} ${/user/name}', dataModel)).toBe(
      '${escaped} John'
    )
  })

  describe('with basePath', () => {
    it('should resolve relative paths with basePath', () => {
      expect(interpolate('Name: ${name}', dataModel, '/user')).toBe(
        'Name: John'
      )
      expect(interpolate('Age: ${age}', dataModel, '/user')).toBe('Age: 30')
    })

    it('should handle absolute paths even with basePath', () => {
      expect(interpolate('Count: ${/stats/count}', dataModel, '/user')).toBe(
        'Count: 42'
      )
    })

    it('should handle mix of relative and absolute', () => {
      expect(
        interpolate('${name} has ${/stats/count} items', dataModel, '/user')
      ).toBe('John has 42 items')
    })
  })
})

describe('getInterpolationDependencies', () => {
  it('should return absolute paths', () => {
    expect(getInterpolationDependencies('${/user/name}')).toEqual([
      '/user/name',
    ])
    expect(getInterpolationDependencies('${/a} ${/b}')).toEqual(['/a', '/b'])
  })

  it('should resolve relative paths with basePath', () => {
    expect(getInterpolationDependencies('${name}', '/user')).toEqual([
      '/user/name',
    ])
    expect(getInterpolationDependencies('${name} ${age}', '/user')).toEqual([
      '/user/name',
      '/user/age',
    ])
  })

  it('should return empty array for no interpolation', () => {
    expect(getInterpolationDependencies('Hello')).toEqual([])
  })

  it('should skip escaped expressions', () => {
    expect(getInterpolationDependencies('\\${/escaped}')).toEqual([])
  })
})
