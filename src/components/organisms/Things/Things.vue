<script setup lang="ts">
import FormThingAddEdit from "src/components/FormThingAddEdit/FormThingAddEdit.vue";
import { onFetch } from "src/helpers/lazyFetch";
import { onMounted, Ref, ref } from "vue";

interface IDataThing {
  name: string;
  uid: string;
}

const isOpenOption: Ref<string[]> = ref([]);
const cardAddThings = ref(false);
const isLoading = ref(false);
const isLoadingDelete = ref(false);
const dataThings: Ref<IDataThing[]> = ref([]);
const lastMouseDown: Ref<number> = ref(0);
const selectedDataThings: Ref<IDataThing[]> = ref([]);
const onMouseDown = (data: IDataThing) => {
  lastMouseDown.value = new Date().getTime();

  let ls = [...selectedDataThings.value];
  if (!!ls.find((item) => item.uid === data.uid)) {
    ls = [];
  } else {
    ls = [data];
  }

  selectedDataThings.value = ls;
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
    selectedDataThings.value = [data];
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
      onToggleModal("things-modal-delete")
      onToggleModal("things-option")
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
          @onClose="() => (cardAddThings = !cardAddThings)"
          @onReload="
            (result) => {
              dataThings = [result, ...dataThings];
            }
          "
        />
      </div>
    </div>
  </div>
  <div class="row" style="margin-bottom: 1em">
    <div class="col-xs-12">
      <button class="btn btn-default" @click="onGetThings()">
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
    </div>
  </div>
  <div class="row">
    <div class="col-xs-12" v-if="isLoading">
      <i class="fa-duotone fa-solid fa-spinner fa-spin-pulse"></i>
    </div>
    <div
      v-if="!isLoading"
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
        @mousedown="onMouseDown(item)"
        @mouseup="onMouseUp(item)"
        @dblclick="onDblClick(item)"
      >
        <div class="panel-body">
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
        <button type="button" class="btn btn-default">Edit</button>
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
            @click="isLoadingDelete?null:onToggleModal('things-modal-delete')"
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
            <i v-if="isLoadingDelete" class="fa-duotone fa-solid fa-spinner fa-spin-pulse"></i>
            <span v-else>Sure</span>
          </button>
        </div>
      </div>
    </div>
    <!-- /.modal-dialog -->
  </div>
  <!-- /.modal -->
  <div v-if="isOpenOption.length > 0" class="modal-backdrop fade in"></div>
</template>

<style scoped></style>
