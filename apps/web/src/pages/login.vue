<template>
    <div @click="login">login</div>
</template>

<script setup lang="ts">
import { getOAuthURL } from '~~/helpers';

async function login() {
    await navigateTo(getOAuthURL(), {
        external: true
    })
}

</script>