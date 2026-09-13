import {isDeepStrictEqual} from 'node:util'

// Compare only fields the import owns; preserve all other editorial fields.
export function patchChangesDocument(existing, fields, fieldsToUnset = []) {
  return Object.entries(fields).some(([key, value]) => !isDeepStrictEqual(existing[key], value)) ||
    fieldsToUnset.some((key) => Object.hasOwn(existing, key))
}
