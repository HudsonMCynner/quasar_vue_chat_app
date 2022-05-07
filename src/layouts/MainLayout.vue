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
          Quasar Chat App
        </q-toolbar-title>

<!--        <div>App v{{ $q.version }}</div>-->
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
  }
})
</script>
