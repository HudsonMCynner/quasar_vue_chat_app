<template>
  <q-layout view="lHr lpR lfr">
    <q-header elevated>
      <q-toolbar>
<!--        <q-btn-->
<!--          flat-->
<!--          dense-->
<!--          round-->
<!--          icon="menu"-->
<!--          aria-label="Menu"-->
<!--          @click="toggleLeftDrawer"-->
<!--        />-->

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleRightDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="rigthDrawerOpen"
      show-if-above
      side="right"
      bordered
    >
      <contacts />
    </q-drawer>

    <q-page-container>
      <chat-messager />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import ChatMessager from 'pages/ChatMessager'
import Contacts from 'components/Contacts'

export default defineComponent({
  name: 'MainLayout',
  components: {
    Contacts,
    ChatMessager
  },
  createdes () {
    this.peer = new window.Peer()
    this.peer.on('open', (id) => {
      // console.log('My peer ID is: ' + id)
      this.connectionID = id
    })

    this.peer.on('connection', (conn) => {
      // console.log('~> Connection')
      conn.on('data', (data) => {
        // Will print 'hi!'
        console.log(data)
        if (data.file) {
          const link = document.createElement('a')
          link.href = URL.createObjectURL(new Blob([data.file], { type: data.type }))
          link.download = data.name
          link.click()
          // document.removeChild(link)
        }
      })
      conn.on('open', () => {
        conn.send('hello!')
      })
    })
  },
  setup () {
    const leftDrawerOpen = ref(false)
    const rigthDrawerOpen = ref(false)
    return {
      leftDrawerOpen,
      rigthDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      toggleRightDrawer () {
        rigthDrawerOpen.value = !rigthDrawerOpen.value
      }
    }
  },
  methods: {
    connect () {
      this.conn = this.peer.connect(this.otherConId)
      this.conn.on('open', () => {
        this.conn.send('hi!')
      })
    },
    enviarArquivo () {
      console.log('~> ', this.files)
      this.conn.send({
        type: this.files.type,
        name: this.files.name,
        file: this.files
      })
    }
  },
  data: () => ({
    conn: null,
    connection: null,
    peer: null,
    connectionID: null,
    otherConId: null,
    files: null
  }),
  computed: {
    getId () {
      return this.connectionID
    }
  }
})
</script>
