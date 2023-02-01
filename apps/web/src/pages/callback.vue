<template>
    <div>
        <h1>Welcome to the callback</h1>
        {{ hello }}
    </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()
const route = useRoute()

const hello = await $client.login.useQuery({ code: route.query.code as string })
</script>