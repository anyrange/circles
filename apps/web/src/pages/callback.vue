<script setup lang="ts">
import { useUserStore } from "~~/stores/user"

const { $client } = useNuxtApp()
const route = useRoute()
const userStore = useUserStore()

const { data } = await $client.auth.spotify.useQuery({
  code: route.query.code as string,
})

userStore.login(data.value.authToken)
userStore.updateUser(data.value.user)
</script>

<template>
  <div>
    <h1>Welcome to the callback</h1>
    {{ data }}
  </div>
</template>
