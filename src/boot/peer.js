import { boot } from 'quasar/wrappers'
import Peer from 'peerjs'
let PeerId = null

export const openPeer = () => {
  return new Promise((resolve, reject) => {
    if (!PeerId) {
      return Peer.on('open', (id) => {
        PeerId = id
        return resolve(id)
      })
    }
    return resolve(PeerId)
  })
}

export const getMyPeerId = () => {
  return PeerId
}

export const getPeer = () => {
  return Peer
}

export const connect = (peerId) => {
  return Peer.connect(peerId)
}

export default boot(({ app }) => {
  app.config.globalProperties.$peer = {
    openPeer, getPeer, connect, getMyPeerId
  }
  // for use inside Vue files (Options API) through this.$axios and this.$api
})
