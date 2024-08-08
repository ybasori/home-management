import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export const useKeyboard = defineStore("keyboardset", () => {
  const show = ref(false);

  const input: Ref<string> = ref("");

  const setInput = (value: string) => {
    input.value = value;
  };
  const setShow = (value: boolean) => {
    show.value = value;
  };

  return {
    setInput,
    input,
    setShow,
    show,
  };
});
