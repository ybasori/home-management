<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useMediaDevice } from "./hooks/useMediaDevice";
import Keyboard from "src/components/atoms/Keyboard/Keyboard.vue";
import { useKeyboard } from "./hooks/useKeyboard";
import { Ref } from "vue";

const fullscreen = ref(false);
const route = useRoute();
const { onCloseCamera } = useMediaDevice();
const kb = useKeyboard();
const isOpenOption: Ref<string[]> = ref([]);
const rotate = ref(0);

const onToggleModal = (value: string) => {
  let ls = [...isOpenOption.value];
  if (!!ls.find((item) => item === value)) {
    ls = [...ls.filter((item) => item !== value)];
  } else {
    ls = [...ls, value];
  }

  if (ls.length <= 0) {
    document.body.classList.remove("modal-open");
  } else {
    if (!document.body.classList.contains("modal-option")) {
      document.body.classList.add("modal-open");
    }
  }
  onCloseCamera();
  isOpenOption.value = ls;
};

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

onMounted(() => {
  // toggleFullScreen();
});
</script>

<template>
  <div
    class="container-fluid"
    style="
      display: flex;
      flex-direction: column;
      height: 100vh;
      padding-top: 2rem;
      max-width: 500px;
      width: 100%;
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
      <button class="btn btn-default" @click="onToggleModal('settings')">
        <i class="fa-solid fa-gear"></i>
      </button>
    </div>

    <div
      v-if="kb.show"
      style="position: fixed; left: 0; bottom: 0; width: 100%"
    >
      <button class="btn btn-default" type="button" @click="kb.setShow(false)">
        hide
      </button>
      <Keyboard></Keyboard>
    </div>

    <div
      :class="`modal fade in`"
      tabindex="-1"
      role="dialog"
      :style="`${
        isOpenOption.find((item) => item === 'settings') ? 'display: flex' : ''
      }; flex-direction: column`"
    >
      <div
        class="modal-dialog modal-sm"
        role="document"
        style="margin-top: auto"
      >
        <div
          class="btn-group-vertical btn-block"
          role="group"
          aria-label="Vertical button group"
        >
          <button
            type="button"
            class="btn btn-default"
            @click="toggleFullScreen()"
          >
            Fullscreen
          </button>
          <!-- <button type="button" class="btn btn-default" @click="rotate += 1">
            Rotate 90<sup>o</sup><i class="fa-solid fa-rotate-right"></i>
          </button> -->
          <button
            type="button"
            class="btn btn-default"
            @click="onToggleModal('settings')"
          >
            Close
          </button>
        </div>
      </div>
      <!-- /.modal-dialog -->
    </div>

    <!-- /.modal -->
    <div v-if="isOpenOption.length > 0" class="modal-backdrop fade in"></div>
  </div>
</template>
