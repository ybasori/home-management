import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export const useKeyboard = defineStore("keyboardset", () => {
  const inputKeyboard: Ref<string> = ref("");

  async function setInputKeyboard(value: string) {
    console.log(value);
    inputKeyboard.value = value;
  }

  return {
    setInputKeyboard,
    inputKeyboard,
  };
});
