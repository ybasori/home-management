<script lang="ts" setup>
import { expandJSON } from "src/helpers/helpers";
import { onFetch } from "src/helpers/lazyFetch";
import { onMounted, ref, Ref, watch } from "vue";
import { v4 as uuidV4 } from "uuid";
import { useMediaDevice } from "src/hooks/useMediaDevice";
import { RouterLink } from "vue-router";

interface IInitDataThing {
  name: string;
  uid: string;
  parent_uid?: string;
  prefs: string[];
}
interface IPhotoData {
  uid: string;
  filename: string;
  description: string;
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

const videoStream: Ref<HTMLVideoElement | null> = ref(null);
const outputCanvas: Ref<HTMLCanvasElement | null> = ref(null);
const imagePreview: Ref<HTMLImageElement | null> = ref(null);
const showImage = ref(false);
const imageFile: Ref<File | null> = ref(null);
const isLoading = ref(false);

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
  const formd = new FormData();
  const bd = expandJSON({ file: imageFile.value });
  for (const key in bd) {
    formd.append(bd[key].label, bd[key].value as string | Blob);
  }
  onFetch({
    url: `/api/v1/upload`,
    method: "POST",
    data: formd,
    beforeSend() {
      isLoading.value = true;
      emit("setIsLoading", true);
    },
    success(upload) {
      const formupload = new FormData();
      const bd = expandJSON({
        filename: upload.data,
      });
      for (const key in bd) {
        formupload.append(bd[key].label, bd[key].value as string | Blob);
      }
      onFetch({
        url: `/api/v1/things/${props.initialValues?.uid}/photos`,
        method: "POST",
        data: formupload,
        beforeSend() {
          isLoading.value = true;
          emit("setIsLoading", true);
        },
        success(response) {
          isLoading.value = false;
          emit("setIsLoading", false);
          emit("onReload", response.data as IPhotoData);
          emit("onClose");
        },
        error() {
          emit("setIsLoading", false);
          isLoading.value = false;
        },
      });
    },
    error() {
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

onMounted(() => {
  handleCamera();
});
</script>
<template>
  <div style="display: flex; flex-direction: column">
    <video
      ref="videoStream"
      :style="`display: ${showImage ? 'none' : 'block'}`"
    ></video>
    <canvas ref="outputCanvas" style="display: none"></canvas>
    <img
      ref="imagePreview"
      alt=""
      :style="`display: ${!showImage ? 'none' : 'block'}`"
    />
    <button
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
    </button>
  </div>
</template>
