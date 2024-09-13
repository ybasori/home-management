import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export const useRoute = defineStore("useRoute", () => {
  const currentRoute: Ref<string> = ref("things");
  const setRoute = (value: string) => {
    currentRoute.value = value;
  };

  return {
    setRoute,
    currentRoute,
  };
});
