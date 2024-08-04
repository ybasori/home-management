<script setup lang="ts">
import { watch } from "fs";
import FormThingAddEdit from "src/components/FormThingAddEdit/FormThingAddEdit.vue";
import { onFetch } from "src/helpers/lazyFetch";
import { onMounted, Ref, ref } from "vue";

interface IDataThing {
  name: string;
  uid: string;
}

const editSubmit: Ref<HTMLButtonElement | null> = ref(null);
const isOpenOption: Ref<string[]> = ref([]);
const cardAddThings = ref(false);
const isLoading = ref(false);
const isLoadingDelete = ref(false);
const dataThings: Ref<IDataThing[]> = ref([]);
const lastMouseDown: Ref<number> = ref(0);
const selectedDataThings: Ref<IDataThing[]> = ref([]);
const onMouseDown = (data: IDataThing, e: MouseEvent) => {
  lastMouseDown.value = new Date().getTime();

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

// const onBackdrop = () => {
//   let ls = [...isOpenOption.value];
//   ls = [...ls.filter((_, i) => i !== ls.length - 1)];
//   isOpenOption.value = ls;
// };

const onMouseUp = (data: IDataThing) => {
  if (new Date().getTime() - lastMouseDown.value >= 500) {
    onToggleModal("things-option");
    // selectedDataThings.value = [data];
  }
};
const onDeleteThings = () => {
  onFetch({
    url: `/api/v1/things`,
    method: "DELETE",
    data: { uid: selectedDataThings.value.map((item) => item.uid) },
    beforeSend() {
      isLoadingDelete.value = true;
    },
    success() {
      isLoadingDelete.value = false;
      dataThings.value = [
        ...dataThings.value.filter(
          (item) =>
            !selectedDataThings.value.find((sub) => sub.uid === item.uid)
        ),
      ];
      onToggleModal("things-modal-delete");
      if (isOpenOption.value.find((item) => item === "things-option")) {
        onToggleModal("things-option");
      }
      selectedDataThings.value = [];
    },
    error() {
      isLoadingDelete.value = false;
    },
  });
};
const onDblClick = (data: IDataThing) => {
  console.log("dbl press");
  selectedDataThings.value = [data];
};
const onGetThings = () =>
  onFetch({
    url: "/api/v1/things",
    method: "GET",
    beforeSend() {
      isLoading.value = true;
    },
    success(data) {
      isLoading.value = false;
      dataThings.value = (data as { data: IDataThing[] }).data;
    },
    error() {
      isLoading.value = false;
    },
  });


onMounted(() => {
  onGetThings();
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
          @click="cardAddThings = !cardAddThings"
        >
          Add Things
        </a>
      </h4>
    </div>
    <div :class="`panel-collapse collapse ${cardAddThings ? 'in' : ''}`">
      <div class="panel-body">
        <FormThingAddEdit
          :noActionButton="false"
          @onClose="() => (cardAddThings = !cardAddThings)"
          @onReload="
            (result) => {
              if (!!result) {
                dataThings = [result, ...dataThings];
              }
            }
          "
        >
        </FormThingAddEdit>
      </div>
    </div>
  </div>
  <div class="row" style="margin-bottom: 1em">
    <div class="col-xs-12">
      <button class="btn btn-default" @click="onGetThings()">
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>

      <button
        v-if="selectedDataThings.length > 0"
        class="btn btn-default"
        @click="onToggleModal('things-modal-delete')"
      >
        <i class="fa-regular fa-trash-can"></i>
      </button>
    </div>
  </div>
  <div class="row" style="overflow: auto">
    <div class="col-xs-12" v-if="isLoading">
      <i class="fa-duotone fa-solid fa-spinner fa-spin-pulse"></i>
    </div>
    <div
      v-else="!isLoading"
      v-for="(item, key) in dataThings"
      class="col-xs-4"
      v-bind:key="key"
    >
      <div
        :class="`panel panel-${
          selectedDataThings.find((sub) => sub.uid === item.uid)
            ? 'primary'
            : 'default'
        }`"
        @mousedown="onMouseDown(item, $event)"
        @mouseup="onMouseUp(item)"
        @dblclick="onDblClick(item)"
        draggable="true"
      >
        <div
          class="panel-body"
          style="display: flex; align-items: center; justify-content: center"
        >
          <div class="" style="height: 12rem"></div>
          <i class="fa-solid fa-circle-info"></i>
        </div>
        <div class="panel-footer">
          <h4 class="panel-title">
            {{ item.name }}
          </h4>
        </div>
      </div>
    </div>
  </div>

  <div
    :class="`modal fade in`"
    tabindex="-1"
    role="dialog"
    :style="`${
      isOpenOption.find((item) => item === 'things-option')
        ? 'display: block'
        : ''
    }`"
  >
    <div class="modal-dialog modal-sm" role="document">
      <div
        class="btn-group-vertical btn-block"
        role="group"
        aria-label="Vertical button group"
      >
        <button
          v-if="selectedDataThings.length === 1"
          type="button"
          class="btn btn-default"
          @click="onToggleModal('things-modal-edit')"
        >
          Edit
        </button>
        <button
          type="button"
          class="btn btn-default"
          @click="onToggleModal('things-modal-delete')"
        >
          Delete
        </button>
        <button
          type="button"
          class="btn btn-default"
          @click="onToggleModal('things-option')"
        >
          Close
        </button>
      </div>
    </div>
    <!-- /.modal-dialog -->
  </div>
  <!-- /.modal -->
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
                ? selectedDataThings[0].name
                : `${selectedDataThings.length} Things`
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
  <!-- /.modal -->
  <div
    :class="`modal fade in`"
    tabindex="-1"
    role="dialog"
    :style="`${
      isOpenOption.find((item) => item === 'things-modal-edit')
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
            @click="isLoadingDelete ? null : onToggleModal('things-modal-edit')"
          >
            <span aria-hidden="true">×</span>
          </button>
          <h4 class="modal-title" id="mySmallModalLabel">
            Edit
            {{
              selectedDataThings.length === 1
                ? selectedDataThings[0].name
                : `${selectedDataThings.length} Things`
            }}
          </h4>
        </div>
        <FormThingAddEdit
          noActionButton
          isEdit
          :initialValues="selectedDataThings[0]"
          @onClose="
            () => {
              onToggleModal('things-modal-edit');
            }
          "
          @onReload="
            () => {
              onToggleModal('things-option');
              onGetThings();
            }
          "
        >
          <template v-slot:action-button="slotProps">
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-default"
                @click="onToggleModal('things-modal-edit')"
              >
                Close
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                @click="editSubmit?.click()"
                :disabled="!slotProps.isValid || slotProps.isLoading"
              >
                {{ slotProps.isLoading ? "Wait..." : "Edit" }}
              </button>
            </div>
          </template>
        </FormThingAddEdit>
      </div>
    </div>

    <!-- /.modal-dialog -->
  </div>

  <!-- /.modal -->
  <div v-if="isOpenOption.length > 0" class="modal-backdrop fade in"></div>
</template>

<style scoped></style>
