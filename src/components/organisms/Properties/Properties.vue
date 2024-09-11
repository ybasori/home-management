<script setup lang="ts">
import Photos from "src/components/molecules/Photos/Photos.vue";
import Preferences from "src/components/molecules/Preferences/Preferences.vue";
import { expandJSON } from "src/helpers/helpers";
import { onFetch } from "src/helpers/lazyFetch";
import { useMediaDevice } from "src/hooks/useMediaDevice";
import { onMounted, Ref, ref, watch } from "vue";

interface IInitDataThing {
  name: string;
  id: string;
  parent_id?: string;
  prefs: { id: string; name: string }[];
}

const props = defineProps<{
  initialValues?: IInitDataThing;
}>();
const emit = defineEmits<{
  (e: "onClose"): void;
  (e: "onReload"): void;
}>();

const { onCloseCamera } = useMediaDevice();
const isLoading = ref(false);
const isSubmiting = ref(false);

const activeTab = ref("preferences");

const onChangeTab = (value: string) => {
  onCloseCamera();
  activeTab.value = value;
};
</script>
<template>
  <div class="modal-body">
    <ul class="nav nav-tabs">
      <li
        role="presentation"
        :class="activeTab === 'preferences' ? 'active' : ''"
      >
        <a href="javascript:void(0)" @click="onChangeTab('preferences')"
          >Preferences</a
        >
      </li>
      <li role="presentation" :class="activeTab === 'photos' ? 'active' : ''">
        <a href="javascript:void(0)" @click="onChangeTab('photos')">Photos</a>
      </li>
    </ul>
    <Preferences
      v-if="activeTab === 'preferences'"
      :initialValues="props.initialValues"
      :isSubmiting="isSubmiting"
      @setIsLoading="(value) => (isLoading = value)"
      @onReload="emit('onReload')"
    />
    <Photos
      v-if="activeTab === 'photos'"
      :initialValues="props.initialValues"
      @setIsLoading="(value) => (isLoading = value)"
      @onReload="() => emit('onReload')"
    />
  </div>
  <div class="modal-footer">
    <button
      type="button"
      class="btn btn-default"
      @click="emit('onClose')"
      :disabled="isLoading"
    >
      Close
    </button>
    <button
      type="button"
      class="btn btn-primary"
      :disabled="isLoading"
      @click="isSubmiting = true"
    >
      {{ isLoading ? "Wait..." : "Apply" }}
    </button>
  </div>
</template>
