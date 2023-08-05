<script setup lang="ts">
const { $client } = useNuxtApp()
const route = useRoute()
const authToken = useCookie("authToken", {
  sameSite: true,
  httpOnly: true,
  secure: true,
})

const { data } = await $client.auth.spotify.useQuery({
  code: route.query.code as string,
})

authToken.value = data.value.authToken
</script>

<template>
  <div>
    <h1>Welcome to the callback</h1>
    {{ data }}
  </div>
</template>
