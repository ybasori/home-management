<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from "vue";

import Keyboard from "simple-keyboard";
import { useKeyboard } from "src/hooks/useKeyboard";

const kb = useKeyboard();
const keyboard: Ref<Keyboard | null> = ref(null);

const onChange = (value: string) => {
  kb.setInput(value);
};

const handleShift = () => {
  let currentLayout = keyboard.value?.options.layoutName;
  let shiftToggle = currentLayout === "default" ? "shift" : "default";

  keyboard.value?.setOptions({
    layoutName: shiftToggle,
  });
};

const onKeyPress = (button: string) => {
  // this.$emit("onKeyPress", button);

  /**
   * If you want to handle the shift and caps lock buttons
   */
  if (button === "{shift}" || button === "{lock}") handleShift();
};

watch(
  () => kb.input,
  (newValues) => {
    keyboard.value?.setInput(newValues);
  }
);

onMounted(() => {
  keyboard.value = new Keyboard("simple-keyboard", {
    onChange,
    onKeyPress,
  });
});
</script>
<template>
  <div class="simple-keyboard"></div>
</template>
