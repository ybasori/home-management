<script lang="ts" setup>
import { expandJSON } from "src/helpers/helpers";
import { onFetch, onFetchAllAsync } from "src/helpers/lazyFetch";
import { onMounted, ref, Ref, watch } from "vue";
import { API_PREFERENCES, API_THINGS } from "src/config/api";
import { wbvtInstance } from "src/config/axios";

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
  id: string;
  parent_id?: string;
  prefs: { id: string; name: string }[];
}

const props = defineProps<{
  initialValues?: IInitDataThing;
  isSubmiting: boolean;
}>();
const emit = defineEmits<{
  (e: "setIsLoading", value: boolean): void;
  (e: "setIsSubmiting", value: boolean): void;
  (e: "onReload"): void;
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
              "storage:story",
            ],
            children: [],
          },
          {
            label: "Story",
            value: "storage:story",
            disable: [
              "storage:building",
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
              "storage:story",
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
              "storage:story",
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
              "storage:story",
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
              "storage:story",
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
              "storage:story",
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
              "storage:story",
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
              "storage:story",
            ],
            children: [],
          },
        ],
        disable: ["file", "living"],
      },
    ],
  },
  {
    title: "Vehicle",
    options: [
      {
        label: "Vehicle",
        value: "vehicle",
        disable: ["file", "living"],
        children: [
          {
            label: "Car",
            value: "vehicle:car",
            disable: ["vehicle:scooter"],
            children: [],
          },
          {
            label: "Scooter",
            value: "vehicle:scooter",
            disable: ["vehicle:car"],
            children: [],
          },
        ],
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
const mySubmitButton: Ref<HTMLButtonElement | null> = ref(null);

const onSubmit = (e: Event) => {
  e.preventDefault();
  onFetchAllAsync(wbvtInstance)(
    props.initialValues?.prefs.map((item) => ({
      url: API_PREFERENCES + "/" + item.id,
      method: "DELETE",
    })) ?? [],
    {
      beforeSend: () => {
        isLoading.value = true;
        emit("setIsLoading", true);
      },
      success: () => {
        onFetchAllAsync(wbvtInstance)(
          values.value.prefs.map((item) => ({
            url: API_PREFERENCES,
            method: "POST",
            data: {
              name: item,
              things_id: props.initialValues?.id,
            },
          })) ?? [],
          {
            beforeSend: () => {
              isLoading.value = true;
              emit("setIsLoading", true);
            },
            success: () => {
              const n = navigator as unknown as { notification: any };
              if (!!n.notification) {
                n.notification.alert("Success!");
              }
              isLoading.value = false;
              emit("setIsLoading", false);
              emit("onReload");
            },
            error: () => {
              isLoading.value = false;
              emit("setIsLoading", false);
            },
          }
        );
      },
      error: () => {
        isLoading.value = false;
        emit("setIsLoading", false);
      },
    }
  );
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

watch(
  () => props.isSubmiting,
  (newValues) => {
    if (newValues) {
      emit("setIsSubmiting", false);
      mySubmitButton.value?.click();
    }
  }
);

onMounted(() => {
  values.value = {
    prefs: props?.initialValues?.prefs.map((item) => item.name) ?? [],
  };
});
</script>

<template>
  <form @submit="onSubmit($event)">
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
    <button style="display: none" type="submit" ref="mySubmitButton">
      submit
    </button>
  </form>
</template>
