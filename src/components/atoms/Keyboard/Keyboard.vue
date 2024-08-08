<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from "vue";

import Keyboard from "simple-keyboard";
import { useKeyboard } from "src/hooks/useKeyboard";

const { inputKeyboard, setInputKeyboard } = useKeyboard();
const keyboard: Ref<Keyboard | null> = ref(null);

const onChange = (value: string) => {
  setInputKeyboard(value);
};

watch(
  () => inputKeyboard,
  (newValues) => {
    console.log("ooooo");
    keyboard.value?.setInput(newValues);
  }
);

onMounted(() => {
  keyboard.value = new Keyboard("simple-keyboard", {
    onChange,
  });
});
</script>
<template>
  <div class="simple-keyboard"></div>
</template>
