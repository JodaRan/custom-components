import type { KeyString } from "./types"

export const dynamicError = (error: any): string => {
  return error?.response?.data ? error.response.data.message : error.message
}

export async function asyncTimeout(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export function filterWithinDescendant(
  arr: any[],
  filterFn: (el: any) => boolean,
  childrenKey: string = 'children'
) {
  if (!Array.isArray(arr)) return arr

  function copy(o: any) {
    return Object.assign({}, o)
  }

  return arr.map(copy).filter(function f(o) {
    if (filterFn(o)) return true

    if (o[childrenKey]) {
      return !!(o[childrenKey] = o[childrenKey].map(copy).filter(f)).length
    }
  })
}

/**
 *
 * @param arrayToCopy
 * @param keyMappings An array of array of string that take the first string and copy to the second
 */
export function copyKeys(
  arrayToCopy: KeyString[],
  keyMappings: [string, string | ((object: KeyString) => any)][]
): KeyString[] {
  return arrayToCopy.map((item) => {
    const newItem: KeyString = { ...item }
    keyMappings.forEach(([newKey, key]) => {
      if (typeof key !== 'string' || Object.prototype.hasOwnProperty.call(newItem, key)) {
        newItem[newKey] = typeof key === 'string' ? newItem[key] : key(newItem)
        // delete newItem[key]
      }
    })
    // Recursively copy keys in children arrays
    if (newItem.children && newItem.children.length > 0) {
      newItem.children = copyKeys(newItem.children, keyMappings)
    }
    return newItem
  })
}


export function isArray(el: unknown): el is any[] {
  if (typeof el === "object" && Array.isArray(el)) return true
  return false
}

export function hasType<T>(obj: any, properties: string[]): obj is T {
  return (
    obj &&
    typeof obj === "object" &&
    properties.every((property) => property in obj)
  );
}
