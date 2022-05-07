<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 q-pa-sm">
        <q-input ref="nome" dense outlined v-model="meuNome" label="Meu Nome" :disable="status === 'CONNECTED'" :rules="[val => !!val || 'Campo Obrigatório']" />
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 q-pa-sm">
        <q-input dense outlined v-model="myId" label="Meu ID" :readonly="peerStatus === 'ON'" >
          <template v-slot:after>
            <q-btn dense outline icon="sync" @click="gerarId" ><q-tooltip>Gerar ID</q-tooltip></q-btn>
            <q-btn
              dense
              outline
              :icon="peerStatus === 'ON' ? 'logout' : 'login'"
              @click="peerStatus === 'ON' ? logout() : login()"
              :color="peerStatus === 'ON' ? 'positive' : 'negative'">
              <q-tooltip> {{ peerStatus === 'ON' ? 'Deslogar' : 'Logar' }}</q-tooltip>
            </q-btn>
          </template>
        </q-input>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm">
        <q-input dense outlined v-model="otherPeerId" label="ID Remetente" :disable="status === 'CONNECTED'" >
          <template v-slot:after>
            <q-btn
              outlined
              :label="status === 'CONNECTED' ? 'Desconectar' : 'Conectar'"
              @click="status === 'CONNECTED' ? disconnet() : connect()"
              :color="status === 'CONNECTED' ? 'positive' : 'primary'" />
          </template>
        </q-input>
      </div>
    </div>
    <div class="chat-messages">
      <template v-for="(mensagem, index) in mensagens" :key="`message_${index}`">
        <q-chat-message
          :sent="mensagem.id === myId"
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
          <div v-if="mensagem.type === 'message'">
            {{ mensagem.text }}
          </div>

          <div v-if="mensagem.type === 'file'">
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
import Peer from 'peerjs'
import { date } from 'quasar'
import { uniqueKey } from 'src/util'
export default {
  name: 'ChatMessager',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  created () {
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
    otherPeerId: null,
    peerStatus: 'OFF'
  }),
  methods: {
    createPeer () {
      this.conn = new Peer(this.myId)
      this.model = this.value
      this.conn.on('open', () => {
        this.peerStatus = 'ON'
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
        this.connection.on('open', () => {
          this.status = 'CONNECTED'
        })
        this.connection.on('close', () => {
          this.status = 'DICONNECTED'
        })
        this.connection.send({ status: 'OK' })
      })

      this.conn.on('error', (err) => {
        console.log('~> Err', err.type)
      })

      this.conn.on('disconnected', () => {
        this.peerStatus = 'OFF'
      })
    },
    gerarId () {
      this.myId = uniqueKey()
    },
    login () {
      if (!this.myId) {
        this.myId = uniqueKey()
      }
      if (!this.$refs.nome.validate()) {
        return
      }
      this.createPeer()
    },
    logout () {
      if (this.conn) {
        this.conn.disconnect()
      }
      if (this.connection) {
        this.connection.close()
      }
    },
    downloadFile (data) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([data.file], { type: data.fileType }))
      link.download = data.fileName
      link.click()
    },
    enviarArquivos () {
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
        this.arquivos = []
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
    disconnet () {
      this.connection.close()
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
        this.connection.on('close', () => {
          this.status = 'DICONNECTED'
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
  lang="sass"
  scoped
>
.chat-messages
  width: 100%
  height: calc(100vh - 350px)
  overflow: auto
</style>
