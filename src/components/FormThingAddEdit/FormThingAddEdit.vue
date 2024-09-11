<script setup lang="ts">
import { expandJSON } from "src/helpers/helpers";
import { onFetch } from "src/helpers/lazyFetch";
import { useKeyboard } from "src/hooks/useKeyboard";
import { ref, Ref, watch } from "vue";
import * as yup from "yup";
import { API_THINGS } from "src/config/api";
import { wbvtInstance } from "src/config/axios";

interface IDataThing {
  name: string;
  id: string;
  parent_id?: string;
  prefs: { id: string; name: string }[];
  photo?: {
    url: string;
  };
}
interface IInitDataThing {
  name?: string;
  id?: string;
  parent_id?: string;
  photo?: {
    url: string;
  };
}

const emit = defineEmits<{
  (e: "onReload", data: IDataThing | null): void;
  (e: "onClose"): void;
}>();

const props = defineProps<{
  initialValues?: IInitDataThing;
  isEdit?: boolean;
  noActionButton: boolean;
}>();

const keyboard = useKeyboard();

const validation = () => {
  return yup.object().shape({
    name: yup.string().required("Name is required"),
  });
};

const values: Ref<{
  name: string;
  id?: string;
  parent_id?: string;
}> = ref({ name: "" });

const errValues: Ref<{ [key: string]: string }> = ref({});
const isValid = ref(false);
const isLoading = ref(false);
const errSubmit: Ref<null | string> = ref(null);
const fieldKeyboard: Ref<"name"> = ref("name");

const onReset = () => {
  values.value = {
    name: props.initialValues?.name ?? "",
  };
};

const onSubmit = () => {
  if (props.isEdit) {
    onFetch(wbvtInstance)({
      url: `${API_THINGS}/${props.initialValues?.id}`,
      method: "PUT",
      data: values.value,
      beforeSend: () => {
        isLoading.value = true;
        errSubmit.value = null;
      },
      success: () => {
        isLoading.value = false;
        emit("onClose");
        emit("onReload", null);
      },
      error: () => {
        isLoading.value = false;
        errSubmit.value = "Something went wrong!";
      },
    });
  } else {
    onFetch(wbvtInstance)({
      url: API_THINGS,
      method: "POST",
      data: values.value,
      beforeSend: () => {
        isLoading.value = true;
        errSubmit.value = null;
      },
      success: (data) => {
        isLoading.value = false;
        onReset();
        emit("onClose");
        emit("onReload", { ...data.result, prefs: [] } as IDataThing);
      },
      error: () => {
        isLoading.value = false;
        errSubmit.value = "Something went wrong!";
      },
    });
  }
};

const activateKeyboard = (value: "name") => {
  if (!keyboard.show) {
    fieldKeyboard.value = value;
    keyboard.setInput("");
  }
  keyboard.setShow(!keyboard.show);
};

watch(
  () => props?.initialValues,
  (newValues, oldValues) => {
    if (
      !!newValues &&
      JSON.stringify(newValues) !== JSON.stringify(oldValues)
    ) {
      values.value = {
        name: newValues?.name ?? "",
      };
    }
  }
);

watch(
  values,
  (newValues) => {
    validation()
      .validate(newValues, { abortEarly: false })
      .then(() => {
        errValues.value = {};
        isValid.value = true;
      })
      .catch((err) => {
        let errin = {};
        (!!err.inner ? err.inner : []).forEach(
          (item: { path: string; message: string }) => {
            errin = { ...errin, [item.path]: item.message };
          }
        );

        errValues.value = { ...errin };
        isValid.value = false;
      });
  },
  { deep: true }
);

watch(
  () => keyboard.input,
  (newValues) => {
    values.value = { ...values.value, [fieldKeyboard.value]: newValues };
  }
);
</script>

<template>
  <form class="form-horizontal" @submit.prevent="onSubmit">
    <div class="modal-body">
      <div v-if="!!errSubmit" class="alert alert-danger">
        <button type="button" class="close" @click="errSubmit = null">
          <span>&times;</span>
        </button>
        {{ errSubmit }}
      </div>
      <div
        :class="`form-group ${!!errValues.name ? 'has-error has-danger' : ''}`"
      >
        <label class="col-sm-2 control-label">Name</label>
        <div class="col-sm-10">
          <div class="input-group">
            <input
              type="text"
              class="form-control input-keyboard"
              placeholder="Name"
              v-model="values.name"
            />
            <span class="input-group-btn">
              <button
                class="btn btn-default"
                type="button"
                @click="activateKeyboard('name')"
              >
                <i class="fa-regular fa-keyboard"></i>
              </button>
            </span>
          </div>
          <div class="help-block with-errors">
            <ul v-if="!!errValues.name" class="list-unstyled">
              <li>{{ errValues.name }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div v-if="!props.noActionButton" class="form-group">
        <div class="col-sm-offset-2 col-sm-10">
          <button
            type="submit"
            :class="`btn btn-default`"
            :disabled="!isValid || isLoading"
          >
            {{ isLoading ? "Wait..." : "Submit" }}
          </button>
        </div>
      </div>
    </div>
    <slot name="action-button" :isValid="isValid" :isLoading="isLoading"></slot>
  </form>
</template>
