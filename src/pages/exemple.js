export default function () {
  let lastPeerId = null
  let peer = null // Own peer object
  const peerId = null
  let conn = null
  const recvId = document.getElementById('receiver-id')
  const status = document.getElementById('status')
  const message = document.getElementById('message')
  const standbyBox = document.getElementById('standby')
  const goBox = document.getElementById('go')
  const fadeBox = document.getElementById('fade')
  const offBox = document.getElementById('off')
  const sendMessageBox = document.getElementById('sendMessageBox')
  const sendButton = document.getElementById('sendButton')
  const clearMsgsButton = document.getElementById('clearMsgsButton')

  /**
   * Create the Peer object for our end of the connection.
   *
   * Sets up callbacks that handle any events related to our
   * peer object.
   */
  function initialize () {
  // Create own peer object with connection to shared PeerJS server
    peer = new Peer(null, {
      debug: 2
    })

    peer.on('open', function (id) {
      // Workaround for peer.reconnect deleting previous id
      if (peer.id === null) {
        console.log('Received null id from peer open')
        peer.id = lastPeerId
      } else {
        lastPeerId = peer.id
      }

      console.log('ID: ' + peer.id)
      recvId.innerHTML = 'ID: ' + peer.id
      status.innerHTML = 'Awaiting connection...'
    })
    peer.on('connection', function (c) {
      // Allow only a single connection
      if (conn && conn.open) {
        c.on('open', function () {
          c.send('Already connected to another client')
          setTimeout(function () { c.close() }, 500)
        })
        return
      }

      conn = c
      console.log('Connected to: ' + conn.peer)
      status.innerHTML = 'Connected'
      ready()
    })
    peer.on('disconnected', function () {
      status.innerHTML = 'Connection lost. Please reconnect'
      console.log('Connection lost. Please reconnect')

      // Workaround for peer.reconnect deleting previous id
      peer.id = lastPeerId
      peer._lastServerId = lastPeerId
      peer.reconnect()
    })
    peer.on('close', function () {
      conn = null
      status.innerHTML = 'Connection destroyed. Please refresh'
      console.log('Connection destroyed')
    })
    peer.on('error', function (err) {
      console.log(err)
      alert('' + err)
    })
  };

  /**
   * Triggered once a connection has been achieved.
   * Defines callbacks to handle incoming data and connection events.
   */
  function ready () {
    conn.on('data', function (data) {
      console.log('Data recieved')
      const cueString = '<span class="cueMsg">Cue: </span>'
      switch (data) {
        case 'Go':
          go()
          addMessage(cueString + data)
          break
        case 'Fade':
          fade()
          addMessage(cueString + data)
          break
        case 'Off':
          off()
          addMessage(cueString + data)
          break
        case 'Reset':
          reset()
          addMessage(cueString + data)
          break
        default:
          addMessage('<span class="peerMsg">Peer: </span>' + data)
          break
      };
    })
    conn.on('close', function () {
      status.innerHTML = 'Connection reset<br>Awaiting connection...'
      conn = null
    })
  }

  function go () {
    standbyBox.className = 'display-box hidden'
    goBox.className = 'display-box go'
    fadeBox.className = 'display-box hidden'
    offBox.className = 'display-box hidden'
  };

  function fade () {
    standbyBox.className = 'display-box hidden'
    goBox.className = 'display-box hidden'
    fadeBox.className = 'display-box fade'
    offBox.className = 'display-box hidden'
  };

  function off () {
    standbyBox.className = 'display-box hidden'
    goBox.className = 'display-box hidden'
    fadeBox.className = 'display-box hidden'
    offBox.className = 'display-box off'
  }

  function reset () {
    standbyBox.className = 'display-box standby'
    goBox.className = 'display-box hidden'
    fadeBox.className = 'display-box hidden'
    offBox.className = 'display-box hidden'
  };

  function addMessage (msg) {
    const now = new Date()
    let h = now.getHours()
    const m = addZero(now.getMinutes())
    const s = addZero(now.getSeconds())

    if (h > 12) { h -= 12 } else if (h === 0) { h = 12 }

    function addZero (t) {
      if (t < 10) { t = '0' + t }
      return t
    };

    message.innerHTML = '<br><span class="msg-time">' + h + ':' + m + ':' + s + '</span>  -  ' + msg + message.innerHTML
  }

  function clearMessages () {
    message.innerHTML = ''
    addMessage('Msgs cleared')
  }

  // Listen for enter in message box
  sendMessageBox.addEventListener('keypress', function (e) {
    const event = e || window.event
    const char = event.which || event.keyCode
    if (char === '13') { sendButton.click() }
  })
  // Send message
  sendButton.addEventListener('click', function () {
    if (conn && conn.open) {
      const msg = sendMessageBox.value
      sendMessageBox.value = ''
      conn.send(msg)
      console.log('Sent: ' + msg)
      addMessage('<span class="selfMsg">Self: </span>' + msg)
    } else {
      console.log('Connection is closed')
    }
  })

  // Clear messages box
  clearMsgsButton.addEventListener('click', clearMessages)

  initialize()
}
