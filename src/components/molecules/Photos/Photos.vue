<script lang="ts" setup>
import { onMounted, ref } from "vue";
import FormAddPhoto from "../FormAddPhoto/FormAddPhoto.vue";
import { watch } from "vue";
import { Ref } from "vue";
import { onFetch } from "src/helpers/lazyFetch";
import { useMediaDevice } from "src/hooks/useMediaDevice";
import { expandJSON } from "src/helpers/helpers";
import { API_DISPLAY_THINGS, API_PHOTOS, API_THINGS } from "src/config/api";
import { wbvtInstance } from "src/config/axios";

interface IInitDataThing {
  name: string;
  id: string;
  parent_id?: string;
  prefs: { id: string; name: string }[];
}
interface IPhotoData {
  id: string;
  url: string;
  description: string;
}

const props = defineProps<{
  initialValues?: IInitDataThing;
}>();
const emit = defineEmits<{
  (e: "setIsLoading", value: boolean): void;
  (e: "onReload"): void;
}>();
const { onCloseCamera } = useMediaDevice();

const openCard = ref(false);
const photos: Ref<IPhotoData[]> = ref([]);
const selectedDataThings: Ref<IPhotoData[]> = ref([]);
const isOpenOption: Ref<string[]> = ref([]);
const isLoadingDelete = ref(false);
const isLoadingMain = ref(false);

const getAllPhoto = () =>
  onFetch(wbvtInstance)({
    url: `${API_PHOTOS}`,
    method: "GET",
    data: {
      filter: {
        things_id: props.initialValues?.id,
      },
    },
    beforeSend: () => null,
    success(response) {
      photos.value = [...(response.result.data as IPhotoData[])];
    },
    error: () => null,
  });

const onMouseDown = (data: IPhotoData, e: MouseEvent) => {
  // lastMouseDown.value = new Date().getTime();

  if (e.ctrlKey) {
    let ls = [...selectedDataThings.value];
    if (!!ls.find((item) => item === data)) {
      ls = [...ls.filter((item) => item !== data)];
    } else {
      ls = [...ls, data];
    }
    selectedDataThings.value = ls;
  } else {
    selectedDataThings.value = [data];
  }
};

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
  isOpenOption.value = ls;
};

const onDeleteThings = () => {
  onFetch(wbvtInstance)({
    url: `/api/v1/uploads`,
    method: "DELETE",
    data: { uid: selectedDataThings.value.map((item) => item.id) },
    beforeSend() {
      isLoadingDelete.value = true;
    },
    success() {
      isLoadingDelete.value = false;
      photos.value = [
        ...photos.value.filter(
          (item) => !selectedDataThings.value.find((sub) => sub.id === item.id)
        ),
      ];
      onToggleModal("things-modal-delete");
      selectedDataThings.value = [];
      emit("onReload");
    },
    error() {
      isLoadingDelete.value = false;
    },
  });
};
const onMainThings = () => {
  const formd = new FormData();
  const dt = expandJSON({ ...selectedDataThings.value[0], main: 1 });
  for (const k in dt) {
    formd.append(dt[k].label, dt[k].value as string);
  }
  onFetch(wbvtInstance)({
    url: `${API_DISPLAY_THINGS}/${props.initialValues?.id}`,
    method: "PUT",
    data: {
      photo_id: selectedDataThings.value[0].id,
    },
    beforeSend() {
      isLoadingMain.value = true;
    },
    success() {
      isLoadingMain.value = false;
      onToggleModal("things-modal-main");
      selectedDataThings.value = [];
      emit("onReload");
    },
    error() {
      isLoadingMain.value = false;
    },
  });
};

onMounted(() => {
  getAllPhoto();
});
</script>
<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a
          role="button"
          data-toggle="collapse"
          href="javascript:void(0)"
          @click="
            () => {
              onCloseCamera();
              openCard = !openCard;
            }
          "
        >
          Add Photo
        </a>
      </h4>
    </div>
    <div :class="`panel-collapse collapse ${openCard ? 'in' : ''}`">
      <div class="panel-body">
        <FormAddPhoto
          v-if="openCard"
          @onClose="
            () => {
              onCloseCamera();
              openCard = false;
            }
          "
          :initialValues="props.initialValues"
          @onReload="(value) => (photos = [{ ...value }, ...photos])"
          @setIsLoading="(value) => emit('setIsLoading', value)"
        />
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-xs-12">
      <button
        v-if="selectedDataThings.length > 0"
        class="btn btn-default"
        @click="onToggleModal('things-modal-delete')"
      >
        <i class="fa-regular fa-trash-can"></i>
      </button>
      <button
        v-if="selectedDataThings.length == 1"
        class="btn btn-default"
        @click="onToggleModal('things-modal-main')"
      >
        <i class="fa-solid fa-circle-info"></i>
      </button>
    </div>
  </div>
  <div class="row">
    <div v-for="(item, index) in photos" class="col-xs-4" :key="index">
      <div
        href="javascript:void(0)"
        class="thumbnail t-parent"
        @mousedown="onMouseDown(item, $event)"
      >
        <img :src="`${item.url}`" alt="..." />
        <div
          v-if="selectedDataThings.find((sub) => sub.id === item.id)"
          class="selected-check"
        >
          <i class="fa-solid fa-check"></i>
        </div>
      </div>
    </div>
  </div>
  <div
    :class="`modal fade in`"
    tabindex="-1"
    role="dialog"
    :style="`${
      isOpenOption.find((item) => item === 'things-modal-delete')
        ? 'display: block'
        : ''
    }`"
  >
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button
            type="button"
            class="close"
            @click="
              isLoadingDelete ? null : onToggleModal('things-modal-delete')
            "
          >
            <span aria-hidden="true">×</span>
          </button>
          <h4 class="modal-title" id="mySmallModalLabel">
            Delete
            {{
              selectedDataThings.length === 1
                ? "photo"
                : `${selectedDataThings.length} photos`
            }}
          </h4>
        </div>
        <div class="modal-body">Are you sure you want to delete things?</div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-default"
            @click="onToggleModal('things-modal-delete')"
            :disabled="isLoadingDelete"
          >
            Close
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="onDeleteThings()"
            :disabled="isLoadingDelete"
          >
            <i
              v-if="isLoadingDelete"
              class="fa-duotone fa-solid fa-spinner fa-spin-pulse"
            ></i>
            <span v-else>Sure</span>
          </button>
        </div>
      </div>
    </div>
    <!-- /.modal-dialog -->
  </div>
  <div
    :class="`modal fade in`"
    tabindex="-1"
    role="dialog"
    :style="`${
      isOpenOption.find((item) => item === 'things-modal-main')
        ? 'display: block'
        : ''
    }`"
  >
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button
            type="button"
            class="close"
            @click="isLoadingMain ? null : onToggleModal('things-modal-main')"
          >
            <span aria-hidden="true">×</span>
          </button>
          <h4 class="modal-title" id="mySmallModalLabel">
            Make it display photo
            {{
              selectedDataThings.length === 1
                ? "photo"
                : `${selectedDataThings.length} photos`
            }}
          </h4>
        </div>
        <div class="modal-body">Are you sure you want to it default?</div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-default"
            @click="onToggleModal('things-modal-main')"
            :disabled="isLoadingMain"
          >
            Close
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="onMainThings()"
            :disabled="isLoadingMain"
          >
            <i
              v-if="isLoadingMain"
              class="fa-duotone fa-solid fa-spinner fa-spin-pulse"
            ></i>
            <span v-else>Sure</span>
          </button>
        </div>
      </div>
    </div>
    <!-- /.modal-dialog -->
  </div>

  <div v-if="isOpenOption.length > 0" class="modal-backdrop fade in"></div>
</template>

<style lang="scss" scoped>
.t-parent {
  position: relative;
  cursor: pointer;
}
.selected-check {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
