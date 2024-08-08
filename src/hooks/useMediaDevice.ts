import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export const useMediaDevice = defineStore("mediaDevice", () => {
  const mediaStream: Ref<MediaStream | null> = ref(null);

  const onCamera = (
    constraints: MediaStreamConstraints,
    cb: (resolve: MediaStream | null, reject: unknown) => void
  ) =>
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        setMediaStream(stream);
        cb(stream, false);
      })
      .catch((err) => {
        cb(null, err);
      });

  const setMediaStream = (value: MediaStream) => {
    mediaStream.value = value;
  };

  const onCloseCamera = () => {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  return {
    onCamera,
    onCloseCamera,
  };
});
