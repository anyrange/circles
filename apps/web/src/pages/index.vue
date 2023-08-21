<script setup type="ts">
import { useUserStore } from "~~/stores/user"
const userStore = useUserStore()
const { $client } = useNuxtApp()

const data = await $client.user.info.query({id: userStore.user.id })
</script>

<template>
  <div>
    <h1>Welcome to the homepage</h1>
    {{ data }}
  </div>
</template>
