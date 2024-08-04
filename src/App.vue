<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="container-fluid" style="display: flex; flex-direction: column; height: 100vh; padding-top: 2rem;">
    <RouterView />
    <ul class="nav nav-pills nav-justified" style="margin-top: auto; margin-bottom: 2rem;">
      <li role="presentation" :class="`${$route.path==='/'?'active':''}`">
        <RouterLink to="/">Things</RouterLink>
      </li>
      <li role="presentation" :class="`${$route.path==='/about'?'active':''}`"><RouterLink to="/about">About</RouterLink></li>
    </ul>
  </div>
</template>
