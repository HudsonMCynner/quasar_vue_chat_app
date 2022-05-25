import { get } from 'lodash'
export const uniqueKey = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

/**
 * @param {Object|Array} structure
 * @param {String} path
 * @param {*} fallback
 * @returns {*} Returns the resolved value
 */
export const prop = (structure, path, fallback = undefined) => {
  return get(structure, path, fallback)
}
