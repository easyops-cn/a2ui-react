/**
 * String interpolation utilities for A2UI 0.9.
 *
 * Supports `${expression}` syntax where expression is a JSON Pointer path.
 * Examples:
 * - "Hello, ${/user/name}!" → "Hello, John!"
 * - "Count: ${/stats/count}" → "Count: 42"
 * - "Escaped \\${/user/name}" → "Escaped ${/user/name}" (literal)
 */

import type { DataModel } from '../types'
import { getValueByPath, resolvePath } from './pathUtils'

/**
 * Regular expression to match interpolation expressions.
 * Matches ${...} that is NOT preceded by a backslash.
 *
 * Uses negative lookbehind (?<!\\) to exclude escaped expressions.
 */
const INTERPOLATION_REGEX = /(?<!\\)\$\{([^}]+)\}/g

/**
 * Checks if a string contains interpolation expressions.
 *
 * @param value - The string to check
 * @returns True if the string contains at least one ${...} expression
 *
 * @example
 * hasInterpolation("Hello, ${/user/name}!");  // true
 * hasInterpolation("Hello, World!");          // false
 * hasInterpolation("Escaped \\${/user/name}"); // false (escaped)
 */
export function hasInterpolation(value: string): boolean {
  // Reset lastIndex to ensure consistent results
  INTERPOLATION_REGEX.lastIndex = 0
  return INTERPOLATION_REGEX.test(value)
}

/**
 * Parses a string and extracts all interpolation expressions.
 *
 * @param value - The string to parse
 * @returns Array of paths found in the interpolation expressions
 *
 * @example
 * parseInterpolation("Hello, ${/user/name}! You have ${/stats/count} messages.");
 * // Returns: ["/user/name", "/stats/count"]
 */
export function parseInterpolation(value: string): string[] {
  const paths: string[] = []
  INTERPOLATION_REGEX.lastIndex = 0

  let match
  while ((match = INTERPOLATION_REGEX.exec(value)) !== null) {
    paths.push(match[1].trim())
  }

  return paths
}

/**
 * Interpolates a string by replacing ${...} expressions with resolved values.
 *
 * @param template - The template string with ${...} expressions
 * @param dataModel - The data model for path lookups
 * @param basePath - Optional base path for relative path resolution
 * @returns The interpolated string
 *
 * @example
 * const model = { user: { name: "John" }, stats: { count: 42 } };
 *
 * interpolate("Hello, ${/user/name}!", model);
 * // Returns: "Hello, John!"
 *
 * interpolate("Count: ${/stats/count}", model);
 * // Returns: "Count: 42"
 *
 * interpolate("Name: ${name}", model, "/user");
 * // Returns: "Name: John" (relative path)
 *
 * interpolate("Missing: ${/nonexistent}", model);
 * // Returns: "Missing: " (undefined values become empty string)
 *
 * interpolate("Escaped \\${/user/name}", model);
 * // Returns: "Escaped ${/user/name}" (backslash escape)
 */
export function interpolate(
  template: string,
  dataModel: DataModel,
  basePath: string | null = null
): string {
  // Reset lastIndex
  INTERPOLATION_REGEX.lastIndex = 0

  // Replace all interpolation expressions
  let result = template.replace(INTERPOLATION_REGEX, (_match, pathExpr) => {
    const path = pathExpr.trim()
    const resolvedPath = resolvePath(path, basePath)
    const value = getValueByPath(dataModel, resolvedPath)

    // Convert value to string
    if (value === undefined || value === null) {
      return ''
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  })

  // Unescape escaped expressions: \${ → ${
  result = result.replace(/\\\$\{/g, '${')

  return result
}

/**
 * Extracts all dependency paths from an interpolated string.
 * Used for reactive updates when any of the paths change.
 *
 * @param template - The template string
 * @param basePath - Optional base path for relative path resolution
 * @returns Array of resolved absolute paths
 *
 * @example
 * getInterpolationDependencies("Hello, ${/user/name}!");
 * // Returns: ["/user/name"]
 *
 * getInterpolationDependencies("Name: ${name}, Age: ${age}", "/user");
 * // Returns: ["/user/name", "/user/age"]
 */
export function getInterpolationDependencies(
  template: string,
  basePath: string | null = null
): string[] {
  const paths = parseInterpolation(template)
  return paths.map((path) => resolvePath(path, basePath))
}
