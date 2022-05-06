<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm">
        <div> My ID {{ myId }}</div>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm">
        <q-input dense outlined v-model="meuNome" label="Meu Nome" :disable="status === 'CONNECTED'" />
      </div>
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm">
        <q-input dense outlined v-model="otherPeerId" label="ID Remetente" :disable="status === 'CONNECTED'" >
          <template v-slot:after>
            <q-btn outlined label="Conectar" @click="connect"/>
          </template>
        </q-input>
      </div>
    </div>
    <div style="width: 100%; height: calc(100vh - 300px);">
      <template v-for="(mensagem, index) in mensagens">
        <q-chat-message
          v-if="mensagem.id === myId"
          sent
          :key="`sent_${index}`"
          :name="mensagem.name"
          avatar="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
          :text="[mensagem.text]"
          :stamp="mensagem.timestamp"
        />
        <q-chat-message
          v-else
          :key="`receive_${index}`"
          :name="mensagem.name"
          avatar="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
          :text="[mensagem.text]"
          :stamp="mensagem.timestamp"
        />
      </template>
    </div>
    <div class="row" style="width: 100%">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm">
        <q-input dense outlined v-model="message" @keyup.enter="sendMessage" >
          <template v-slot:after>
            <q-btn outlined @click="sendMessage" icon="send"/>
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ChatMessager',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  created () {
    this.conn = new window.Peer()
    this.model = this.value
    this.conn.on('open', (id) => {
      this.myId = id
    })
    this.conn.on('connection', (NACoon) => {
      this.status = 'CONNECTED'
      if (this.connection) {
        this.connection.close()
        this.status = 'DISCONNECTED'
      }
      this.otherPeerId = NACoon.peer
      this.connection = NACoon
      this.connection.on('data', (data) => {
        this.mensagens.push(data)
      })
    })
  },
  data: () => ({
    status: 'DISCONNECTED',
    conn: null,
    peer: null,
    connection: null,
    model: null,
    message: null,
    mensagens: [],
    myId: null,
    meuNome: '',
    otherPeerId: null
  }),
  methods: {
    sendMessage () {
      if (this.connection) {
        if (this.message) {
          const mensagem = {
            id: this.myId,
            timestamp: new Date(),
            text: this.message,
            name: this.meuNome
          }
          this.connection.send(mensagem)
          this.mensagens.push(mensagem)
          this.message = null
        }
      }
    },
    connect () {
      if (this.otherPeerId) {
        if (this.connection) {
          this.connection.close()
        }
        this.connection = this.conn.connect(this.otherPeerId)
        this.connection.on('data', (data) => {
          this.mensagens.push(data)
        })
      }
    }
  },
  watch: {
    value: {
      handler (value) {
        this.model = value
      },
      deep: true
    }
  }
}
</script>

<style
  lang="stylus"
  scoped
>

</style>
