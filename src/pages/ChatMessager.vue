<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 q-pa-sm">
        <q-input dense outlined v-model="myId" label="Meu ID" readonly/>
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 q-pa-sm">
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
    <div style="width: 100%; height: calc(100vh - 330px);">
      <template v-for="(mensagem, index) in mensagens">
        <q-chat-message
          v-if="mensagem.id === myId && mensagem.type === 'message'"
          sent
          :key="`sent_${index}`"
          :name="mensagem.name"
          avatar="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
          :text="[mensagem.text]"
          :stamp="mensagem.timestamp"
          text-color="white"
          bg-color="primary"
        >
        </q-chat-message>
        <q-chat-message
          v-if="mensagem.id !== myId && mensagem.type === 'message'"
          :key="`receive_${index}`"
          :name="mensagem.name"
          avatar="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
          :text="[mensagem.text]"
          :stamp="mensagem.timestamp"
          text-color="white"
          bg-color="primary"
        >
        </q-chat-message>
        <q-chat-message
          v-if="mensagem.type === 'file'"
          :sent="mensagem.id === myId"
          :key="`receive_file_${index}`"
          text-color="white"
          bg-color="primary"
        >
          <template v-slot:name>{{ mensagem.name }}</template>
          <template v-slot:avatar>
            <img
              class="q-message-avatar"
              :class="{'q-message-avatar--received': mensagem.id === myId}"
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
            >
          </template>

          <div>
            {{ mensagem.fileName }}
            <q-btn dense outline icon="download" @click="downloadFile(mensagem)"/>
          </div>
        </q-chat-message>
      </template>
    </div>
    <div class="row" style="width: 100%">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm">
        <q-file outlined dense bottom-slots v-model="arquivos" label="Enviar Arquivo" multiple counter max-files="10">
          <template v-slot:append>
            <q-icon v-if="arquivos !== null" name="close" @click.stop="arquivos = null" class="cursor-pointer" />
          </template>
          <template v-slot:after>
            <q-btn outlined icon="send" @click="enviarArquivos"/>
          </template>
        </q-file>
      </div>
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
import { date } from 'quasar'
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
        console.log('~> ', data)
      })
      this.connection.send({ status: 'OK' })
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
    arquivos: [],
    myId: null,
    meuNome: '',
    otherPeerId: null
  }),
  methods: {
    downloadFile (data) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([data.file], { type: data.fileType }))
      link.download = data.fileName
      link.click()
    },
    enviarArquivos () {
      debugger
      if (this.connection) {
        this.arquivos.forEach((arquivo) => {
          const mensagem = {
            type: 'file',
            id: this.myId,
            timestamp: date.formatDate(new Date(), 'DD/MM/YYYY HH:mm'),
            text: this.message,
            name: this.meuNome,
            file: arquivo,
            fileName: arquivo.name,
            fileType: arquivo.type
          }
          this.connection.send(mensagem)
          this.mensagens.push(mensagem)
        })
        this.message = null
      }
    },
    sendMessage () {
      if (this.connection) {
        if (this.message) {
          const mensagem = {
            id: this.myId,
            type: 'message',
            timestamp: date.formatDate(new Date(), 'DD/MM/YYYY HH:mm'),
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
      if (this.otherPeerId === this.myId) {
        return
      }
      if (this.otherPeerId) {
        if (this.connection) {
          this.connection.close()
        }
        this.connection = this.conn.connect(this.otherPeerId.trim())
        this.connection.on('data', (data) => {
          this.mensagens.push(data)
        })
        this.connection.on('open', () => {
          this.status = 'CONNECTED'
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
