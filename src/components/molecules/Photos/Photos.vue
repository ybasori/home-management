<script lang="ts" setup>
import { expandJSON } from "src/helpers/helpers";
import { onFetch } from "src/helpers/lazyFetch";
import { onMounted, Ref, ref } from "vue";

const videoStream: Ref<HTMLVideoElement | null> = ref(null);
const outputCanvas: Ref<HTMLCanvasElement | null> = ref(null);
const imagePreview: Ref<HTMLImageElement | null> = ref(null);
const showImage = ref(false);
const imageFile: Ref<File | null> = ref(null);
const isLoading = ref(false);
const openCard = ref(false);

const onCapture = () => {
  if (!!outputCanvas.value) {
    const ctxt = outputCanvas.value.getContext("2d");
    outputCanvas.value.width = 400;
    outputCanvas.value.height = 400;

    if (ctxt && !!videoStream.value) {
      ctxt.drawImage(
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
          "fileName.jpg",
          { type: "image/jpeg" }
        );
      }, "image/jpeg");
    }

    showImage.value = true;
  }
};

const onReset = () => {
  showImage.value = false;
};

const onUpload = () => {
  const formd = new FormData();
  const bd = expandJSON({ file: imageFile.value });
  for (const key in bd) {
    formd.append(bd[key].label, bd[key].value as string | Blob);
  }
  onFetch({
    url: `/api/v1/uploads`,
    method: "POST",
    data: formd,
    beforeSend() {
      isLoading.value = true;
    },
    success() {
      isLoading.value = false;
      openCard.value = false;
    },
    error() {
      isLoading.value = false;
    },
  });
};

onMounted(() => {
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        width: 400,
        height: 400,
      },
    })
    .then((stream) => {
      if (videoStream.value) {
        videoStream.value.srcObject = stream;
        videoStream.value.play();
      }
    })
    .catch((err) => {
      alert(err);
    });
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
          @click="openCard = !openCard"
        >
          Add Photo
        </a>
      </h4>
    </div>
    <div :class="`panel-collapse collapse ${openCard ? 'in' : ''}`">
      <div class="panel-body">
        <form>
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
              type="button"
              class="btn btn-default"
              @click="onUpload()"
              :style="`display: ${showImage ? 'none' : 'block'}`"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
