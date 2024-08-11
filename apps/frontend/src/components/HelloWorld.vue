<script setup lang="ts">
import { ref, onMounted } from "vue";
import { client } from "../plugins/rpc";

defineProps<{ msg: string }>();

const count = ref(0);

const user = ref<any>(null);
onMounted(async () => {
  const res = await client.user.info.$get({
    query: { id: "7uq098pzvp4db2e2138tmgneb" },
  });

  const [data] = await res.json()

  if(!data){
    return;
  }

  user.value = data
});
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>{{ user }}</p>
  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
