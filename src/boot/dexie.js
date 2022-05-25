import { boot } from 'quasar/wrappers'
// db.js
import Dexie from 'dexie'
const useDataBase = ['chatMessages']

let dataBases = {}
const structure = ['++id', 'remetente', 'destinatario', 'timestamp', 'jsonData']

const createDataBase = (name) => {
  dataBases[name] = new Dexie(name)
  dataBases[name].version(1).stores({ [name]: structure.join(', ') })
  dataBases[name].open().catch(function (err) {
    console.error(err.stack || err)
  })
}

useDataBase.forEach((item) => {
  createDataBase(item)
})

const getDataBase = (name) => {
  return dataBases[name][name]
}

const save = (dataBaseName, data) => {
  return getDataBase(dataBaseName).add(data)
}

const saveOrUpdateOne = async (dataBaseName, data) => {
  let rows = await getAll(dataBaseName)
  if (rows.length) {
    return getDataBase(dataBaseName).update(rows[0], data)
  }
  return save(dataBaseName, data)
}

const getAll = (dataBaseName) => {
  return getDataBase(dataBaseName).toArray()
}

const getLast = (dataBaseName) => {
  return getDataBase(dataBaseName).orderBy('id')
    .last()
}

const getFirst = (dataBaseName) => {
  return getDataBase(dataBaseName).orderBy('id')
    .first()
}

const getBy = (dataBaseName, params) => {
  return getDataBase(dataBaseName).where(params)
    .toArray()
}

const isEmpty = async (dataBaseName) => {
  return getAll(dataBaseName)
}

/**
 */
export default boot(({ app }) => {
  app.config.globalProperties.$localDataBase = {
    getDataBase, save, saveOrUpdateOne, getAll, getBy, getLast, getFirst, isEmpty
  }
})
