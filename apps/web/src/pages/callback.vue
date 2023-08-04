<template>
  <div>
    <h1>Welcome to the callback</h1>
    {{ data }}
  </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()
const { update } = await useSession()
const route = useRoute()

const data = await $client.auth.spotify.useQuery({
  code: route.query.code as string,
})

update({ authToken: data.data.value.authToken })
</script>
