<script setup lang="ts">
import Photos from "src/components/molecules/Photos/Photos.vue";
import Preferences from "src/components/molecules/Preferences/Preferences.vue";
import { expandJSON } from "src/helpers/helpers";
import { onFetch } from "src/helpers/lazyFetch";
import { onMounted, Ref, ref, watch } from "vue";

interface IInitDataThing {
  name: string;
  uid: string;
  parent_uid?: string;
  prefs: string[];
}

const props = defineProps<{
  initialValues?: IInitDataThing;
}>();
const emit = defineEmits<{
  (e: "onClose"): void;
  (e: "onReload"): void;
}>();

const isLoading = ref(false);
const isSubmiting = ref(false);

const activeTab = ref("preferences");
</script>
<template>
  <div class="modal-body">
    <ul class="nav nav-tabs">
      <li
        role="presentation"
        :class="activeTab === 'preferences' ? 'active' : ''"
      >
        <a href="javascript:void(0)" @click="activeTab = 'preferences'"
          >Preferences</a
        >
      </li>
      <li role="presentation" :class="activeTab === 'photos' ? 'active' : ''">
        <a href="javascript:void(0)" @click="activeTab = 'photos'">Photos</a>
      </li>
    </ul>
    <Preferences
      v-if="activeTab === 'preferences'"
      :initialValues="props.initialValues"
      :isSubmiting="isSubmiting"
      @setIsLoading="(value) => (isLoading = value)"
      @onReload="emit('onReload')"
    />
    <Photos v-if="activeTab === 'photos'" />
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
