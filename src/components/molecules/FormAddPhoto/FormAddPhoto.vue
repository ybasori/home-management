<script lang="ts" setup>
import { expandJSON } from "src/helpers/helpers";
import { onFetch } from "src/helpers/lazyFetch";
import { onMounted, ref, Ref, watch } from "vue";
import { v4 as uuidV4 } from "uuid";
import { useMediaDevice } from "src/hooks/useMediaDevice";
import { RouterLink } from "vue-router";
import { API_PHOTOS, API_THINGS, API_UPLOAD } from "src/config/api";
import { wbvtInstance } from "src/config/axios";
import { AxiosError } from "axios";

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
  upload_id: string;
}
const props = defineProps<{
  initialValues?: IInitDataThing;
}>();
const emit = defineEmits<{
  (e: "onReload", value: IPhotoData): void;
  (e: "onClose"): void;
  (e: "setIsLoading", value: boolean): void;
}>();

const { onCamera, onCloseCamera } = useMediaDevice();

const mySubmitButton: Ref<HTMLButtonElement | null> = ref(null);
const myCaptureButton: Ref<HTMLButtonElement | null> = ref(null);

const videoStream: Ref<HTMLVideoElement | null> = ref(null);
const outputCanvas: Ref<HTMLCanvasElement | null> = ref(null);
const imagePreview: Ref<HTMLImageElement | null> = ref(null);
const showImage = ref(false);
const imageFile: Ref<File | null> = ref(null);
const isLoading = ref(false);
const url: Ref<string | null> = ref(null);

const onCapture = () => {
  if (!!outputCanvas.value) {
    const ctx = outputCanvas.value.getContext("2d");
    outputCanvas.value.width = 400;
    outputCanvas.value.height = 400;

    if (ctx && !!videoStream.value) {
      ctx.drawImage(
        videoStream.value,
        0,
        0,
        outputCanvas.value.width,
        outputCanvas.value.height
      );
    }

    if (!!imagePreview.value) {
      imagePreview.value.src = outputCanvas.value.toDataURL();
      outputCanvas.value.toBlob((blob) => {
        imageFile.value = new File(
          [blob as unknown as BlobPart],
          `${uuidV4()}.jpg`,
          { type: "image/jpeg" }
        );
      }, "image/jpeg");
    }

    onCloseCamera();

    showImage.value = true;
  }
};

const onUpload = () => {
  // const formd = new FormData();
  // const bd = expandJSON({ file: imageFile.value });
  // for (const key in bd) {
  //   formd.append(bd[key].label, bd[key].value as string | Blob);
  // }
  onFetch(wbvtInstance)({
    url: API_UPLOAD,
    method: "POST",
    data: {
      file: imageFile.value,
    },
    type: "formdata",
    beforeSend() {
      isLoading.value = true;
      emit("setIsLoading", true);
    },
    success(upload) {
      onFetch(wbvtInstance)({
        url: API_PHOTOS,
        method: "POST",
        data: {
          url: upload.result.file_name,
          things_id: props.initialValues?.id,
          upload_id: upload.result.id,
        },
        beforeSend() {
          isLoading.value = true;
          emit("setIsLoading", true);
        },
        success(response) {
          isLoading.value = false;
          const n = navigator as unknown as { notification: any };
          if (!!n.notification) {
            n.notification.alert(response.message);
          }
          emit("setIsLoading", false);
          emit("onReload", response.result as IPhotoData);
          emit("onClose");
        },
        error(err: any) {
          const n = navigator as unknown as { notification: any };
          if (!!n.notification) {
            n.notification.alert(err.response.data.message);
          }
          emit("setIsLoading", false);
          isLoading.value = false;
        },
      });
    },
    error(err: any) {
      const n = navigator as unknown as { notification: any };
      if (!!n.notification) {
        n.notification.alert(err.response.data.result.error);
      }
      emit("setIsLoading", false);
      isLoading.value = false;
    },
  });
};

const handleCamera = () =>
  onCamera(
    {
      audio: false,
      video: {
        width: 400,
        height: 400,
      },
    },
    (stream, err) => {
      if (!!stream) {
        if (videoStream.value) {
          videoStream.value.srcObject = stream;
          videoStream.value.play();
        }
      } else {
        alert(err);
      }
    }
  );

const onReset = () => {
  showImage.value = false;

  handleCamera();
};

const onFileChange = (e: Event) => {
  const [file] = (e.target as unknown as { files: FileList }).files;
  url.value = URL.createObjectURL(file);
  imageFile.value = file;
};

onMounted(() => {
  // handleCamera();
});
</script>
<template>
  <div style="display: flex; flex-direction: column">
    <!-- <video
      ref="videoStream"
      :style="`display: ${showImage ? 'none' : 'block'}`"
    ></video>
    <canvas ref="outputCanvas" style="display: none"></canvas>
    <img
      ref="imagePreview"
      alt=""
      :style="`display: ${!showImage ? 'none' : 'block'}`"
    /> -->
    <!-- <button
      type="button"
      class="btn btn-default"
      @click="onReset()"
      :style="`display: ${!showImage ? 'none' : 'block'}`"
    >
      Reset
    </button>
    <button
      type="button"
      class="btn btn-default"
      @click="onCapture()"
      :style="`display: ${showImage ? 'none' : 'block'}`"
    >
      Capture
    </button>
    <button
      ref="mySubmitButton"
      type="button"
      class="btn btn-default"
      @click="onUpload()"
      :style="`display: ${!showImage ? 'none' : 'block'}`"
    >
      Upload
    </button> -->

    <img
      :src="url ?? ''"
      alt=""
      :style="`display: ${
        !!!url ? 'none' : 'block'
      }; width: 100%; height: 150px; object-fit: cover`"
    />
    <input
      type="file"
      accept="image/*"
      capture="user"
      @change="onFileChange"
      ref="myCaptureButton"
      style="display: none"
    />
    <button
      class="btn btn-default"
      type="button"
      @click="myCaptureButton?.click()"
      :style="`display: ${!!imageFile ? 'none' : 'block'}`"
    >
      Capture
    </button>
    <button
      type="button"
      class="btn btn-default"
      @click="imageFile = null"
      :style="`display: ${!!!imageFile ? 'none' : 'block'}`"
    >
      Reset
    </button>
    <button
      ref="mySubmitButton"
      type="button"
      class="btn btn-default"
      @click="onUpload()"
      :style="`display: ${!!!imageFile ? 'none' : 'block'}`"
    >
      Upload
    </button>
  </div>
</template>
