<script setup lang="ts">
import { expandJSON } from "src/helpers/helpers";
import { onFetch } from "src/helpers/lazyFetch";
import { onMounted, Ref, ref, watch } from "vue";

interface IOption {
  label: string;
  value: string;
  parent?: string;
  disable: string[];
  children: IOption[];
}

interface IOptionWrapper {
  title: string;
  options: IOption[];
}

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
  (e: "onReload"): void;
  (e: "onClose"): void;
}>();

const options: Ref<IOptionWrapper[]> = ref([
  {
    title: "Storage",
    options: [
      {
        label: "Storage",
        value: "storage",
        children: [
          {
            label: "Building",
            value: "storage:building",
            disable: [
              "storage:room",
              "storage:cupboard",
              "storage:rack",
              "storage:basket",
              "storage:box",
              "storage:bag",
              "storage:suitcase",
            ],
            children: [],
          },
          {
            label: "Room",
            value: "storage:room",
            disable: [
              "storage:building",
              "storage:cupboard",
              "storage:rack",
              "storage:basket",
              "storage:box",
              "storage:bag",
              "storage:suitcase",
            ],
            children: [],
          },
          {
            label: "Cupboard",
            value: "storage:cupboard",
            disable: [
              "storage:building",
              "storage:room",
              "storage:rack",
              "storage:basket",
              "storage:box",
              "storage:bag",
              "storage:suitcase",
            ],
            children: [],
          },
          {
            label: "Rack",
            value: "storage:rack",
            disable: [
              "storage:building",
              "storage:room",
              "storage:cupboard",
              "storage:basket",
              "storage:box",
              "storage:bag",
              "storage:suitcase",
            ],
            children: [],
          },
          {
            label: "Basket",
            value: "storage:basket",
            disable: [
              "storage:building",
              "storage:room",
              "storage:cupboard",
              "storage:rack",
              "storage:box",
              "storage:bag",
              "storage:suitcase",
            ],
            children: [],
          },
          {
            label: "Box",
            value: "storage:box",
            disable: [
              "storage:building",
              "storage:room",
              "storage:cupboard",
              "storage:rack",
              "storage:basket",
              "storage:bag",
              "storage:suitcase",
            ],
            children: [],
          },
          {
            label: "Bag",
            value: "storage:bag",
            disable: [
              "storage:building",
              "storage:room",
              "storage:cupboard",
              "storage:rack",
              "storage:basket",
              "storage:box",
              "storage:suitcase",
            ],
            children: [],
          },
          {
            label: "Suitcase",
            value: "storage:suitcase",
            disable: [
              "storage:building",
              "storage:room",
              "storage:cupboard",
              "storage:rack",
              "storage:basket",
              "storage:box",
              "storage:bag",
            ],
            children: [],
          },
        ],
        disable: ["file", "living"],
      },
    ],
  },
  {
    title: "File",
    options: [
      {
        label: "File",
        value: "file",
        disable: ["storage", "living"],
        children: [],
      },
    ],
  },
  {
    title: "Living",
    options: [
      {
        label: "Living",
        value: "living",
        disable: ["file", "storage"],
        children: [
          {
            label: "Human",
            value: "living:human",
            disable: ["living:animal"],
            children: [],
          },
          {
            label: "Animal",
            value: "living:animal",
            disable: ["living:human"],
            children: [],
          },
        ],
      },
    ],
  },
]);

const values: Ref<{ prefs: string[] }> = ref({
  prefs: [],
});
const disablePrefs: Ref<string[]> = ref([]);

const unnecessaryWatch = ref(true);
const isLoading = ref(false);

const onSubmit = (e: Event) => {
  e.preventDefault();
  const formd = new FormData();
  const bd = expandJSON(
    { ...props.initialValues, ...values.value },
    {
      arrayNoNumber: true,
    }
  );
  for (const key in bd) {
    formd.append(bd[key].label, bd[key].value as string | Blob);
  }
  onFetch({
    url: `/api/v1/things/${props.initialValues?.uid}`,
    method: "PUT",
    data: formd,
    beforeSend: () => {
      isLoading.value = true;
    },
    success: () => {
      isLoading.value = false;
      emit("onClose");
      emit("onReload");
    },
    error: () => {
      isLoading.value = false;
    },
  });
};

watch(
  values,
  (newValues) => {
    if (unnecessaryWatch.value) {
      options.value = options.value
        .map((item) => ({
          ...item,
          options: item.options.filter((opt) => !!!opt.parent),
        }))
        .map((item) => ({
          ...item,
          options: [
            ...item.options,
            ...item.options
              .filter(
                (opt) => !!newValues.prefs.find((sub) => sub === opt.value)
              )
              .map((sub) =>
                sub.children.map((i) => ({ ...i, parent: sub.value }))
              )
              .flat(2),
          ],
        }));

      disablePrefs.value = options.value
        .map((item) =>
          item.options
            .filter((opt) => !!newValues.prefs.find((sub) => sub === opt.value))
            .map((item) => item.disable)
        )
        .flat(2);
    } else {
      unnecessaryWatch.value = true;
    }
  },
  { deep: true }
);

watch(
  options,
  () => {
    unnecessaryWatch.value = false;
    values.value.prefs = [
      ...values.value.prefs.filter((opt, _i, self) => {
        if (opt.split(":").length > 1) {
          return !!self.find((sub) => sub === opt.split(":")[0]);
        } else {
          return true;
        }
      }),
    ];
  },
  { deep: true }
);

onMounted(() => {
  values.value = {
    prefs: props?.initialValues?.prefs ?? [],
  };
});
</script>
<template>
  <form @submit="onSubmit($event)">
    <div class="modal-body">
      <ul class="nav nav-tabs">
        <li role="presentation" class="active">
          <a href="javascript:void(0)">Preferences</a>
        </li>
      </ul>
      <div v-for="item in options" class="row">
        <div class="col-xs-12">
          <h3 class="title">{{ item.title }}</h3>
          <div class="row">
            <div v-for="opt in item.options" class="col-xs-4">
              <label class="checkbox-inline">
                <input
                  type="checkbox"
                  id="inlineCheckbox1"
                  :value="opt.value"
                  v-model="values.prefs"
                  :disabled="!!disablePrefs.find((sub) => sub === opt.value)"
                />
                {{ opt.label }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" @click="emit('onClose')">
        Close
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isLoading">
        {{ isLoading ? "Wait..." : "Apply" }}
      </button>
    </div>
  </form>
</template>
