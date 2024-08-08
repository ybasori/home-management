<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useMediaDevice } from "./hooks/useMediaDevice";

const fullscreen = ref(false);
const route = useRoute();
const { onCloseCamera } = useMediaDevice();

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreen.value = true;
  } else if (document.exitFullscreen) {
    fullscreen.value = false;
    document.exitFullscreen();
  }
};

watch(route, () => {
  onCloseCamera();
});
</script>

<template>
  <div
    class="container-fluid wrapper"
    style="
      display: flex;
      flex-direction: column;
      height: 100vh;
      padding-top: 2rem;
    "
  >
    <RouterView />
    <div
      style="display: flex; width: 100%; margin-top: auto; margin-bottom: 2rem"
    >
      <ul class="nav nav-pills nav-justified">
        <li
          role="presentation"
          :class="`${$route.path === '/' ? 'active' : ''}`"
        >
          <RouterLink to="/">Things</RouterLink>
        </li>
        <li
          role="presentation"
          :class="`${$route.path === '/activity' ? 'active' : ''}`"
        >
          <RouterLink to="/activity">Activity</RouterLink>
        </li>
      </ul>
      <button class="btn btn-default" @click="toggleFullScreen()">
        <i
          v-if="fullscreen"
          class="fa-solid fa-up-right-and-down-left-from-center"
        ></i>
        <i v-else class="fa-solid fa-down-left-and-up-right-to-center"></i>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  max-width: 500px;
  width: 100%;
}
</style>
