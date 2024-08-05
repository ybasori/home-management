<script setup lang="ts">
import { watch } from "fs";
import FormThingAddEdit from "src/components/FormThingAddEdit/FormThingAddEdit.vue";
import { expandJSON } from "src/helpers/helpers";
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
const isLoadingEdit = ref(false);
const breadCrumb: Ref<IDataThing[]> = ref([]);
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

const childFetch = (uid: string) => {
  return onFetch({
    url: `/api/v1/things/${uid}`,
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
}

const onDblClick = (data: IDataThing) => {
  selectedDataThings.value = [];
  breadCrumb.value = [...breadCrumb.value, data];

  return childFetch(data.uid)
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


const drag = (ev: DragEvent, item: IDataThing) => {
  ev.dataTransfer?.setData("text", JSON.stringify(item));
}

const allowDrop = (ev: DragEvent) => {
  ev.preventDefault();
}

const drop = (ev: DragEvent, item: IDataThing | null) => {
  ev.preventDefault();
  var data = { ...JSON.parse(ev.dataTransfer?.getData("text") ?? ''), parent_uid: item?.uid ?? null };
  if (((!!item && data.uid !== item?.uid) || !item) && selectedDataThings.value.length === 1) {
    const formd = new FormData();
    const bd = expandJSON(data);
    console.log(data, bd);
    for (const key in bd) {
      formd.append(bd[key].label, bd[key].value as string | Blob);
    }
    onFetch({
      url: "/api/v1/things/" + data.uid,
      method: "PUT",
      data: formd,
      beforeSend() {
        isLoadingEdit.value = true;
      },
      success() {
        isLoadingEdit.value = false;
        // dataThings.value = (data as { data: IDataThing[] }).data;

        dataThings.value = [
          ...dataThings.value.filter(
            (item) =>
              item.uid !== data.uid
          ),
        ]
      },
      error() {
        isLoadingEdit.value = false;
      },
    });
  }
}

const onBreadCrumbHome = () => {
  breadCrumb.value = [];
  selectedDataThings.value = [];
  return onGetThings();
}
const onBreadCrumb = (key: number) => {
  breadCrumb.value = breadCrumb.value.filter((_, i) => i <= key);

  selectedDataThings.value = [];
  return childFetch(breadCrumb.value[key].uid)
}
</script>

<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a role="button" data-toggle="collapse" href="javascript:void(0)" @click="cardAddThings = !cardAddThings">
          Add Things
        </a>
      </h4>
    </div>
    <div :class="`panel-collapse collapse ${cardAddThings ? 'in' : ''}`">
      <div class="panel-body">
        <FormThingAddEdit
          :initialValues="breadCrumb.length > 0 ? { parent_uid: breadCrumb[breadCrumb.length - 1].uid } : undefined"
          :noActionButton="false" @onClose="() => (cardAddThings = !cardAddThings)" @onReload="(result) => {
            if (!!result) {
              dataThings = [result, ...dataThings];
            }
          }
            ">
        </FormThingAddEdit>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-xs-12">
      <button v-if="breadCrumb.length !== 0" class="btn btn-default" @click="onBreadCrumbHome()" @drop="drop($event, null)" @dragover="allowDrop($event)">
        Home
      </button>
      <button v-else class="btn btn-default" disabled>
        Home
      </button>
      <template v-for="(item, key) in breadCrumb" :key="key">

        <button v-if="key < breadCrumb.length - 1" class="btn btn-default" @click="onBreadCrumb(key)" @drop="drop($event, item)" @dragover="allowDrop($event)">
          {{ item.name }}
        </button>
        <button v-else class="btn btn-default" disabled>
          {{ item.name }}
        </button>

      </template>

    </div>
  </div>

  <div class="row" style="margin-bottom: 1em">
    <div class="col-xs-12">
      <button class="btn btn-default"
        @click="breadCrumb.length === 0 ? onGetThings() : childFetch(breadCrumb[breadCrumb.length - 1].uid)">
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>

      <button v-if="selectedDataThings.length > 0" class="btn btn-default"
        @click="onToggleModal('things-modal-delete')">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    </div>
  </div>
  <div class="row" style="overflow: auto">
    <div class="col-xs-12" v-if="isLoading">
      <i class="fa-duotone fa-solid fa-spinner fa-spin-pulse"></i>
    </div>
    <div v-else="!isLoading" v-for="(item, key) in dataThings" class="col-xs-4" v-bind:key="key"
      @drop="drop($event, item)" @dragover="allowDrop($event)">
      <div :class="`panel panel-${selectedDataThings.find((sub) => sub.uid === item.uid)
        ? 'primary'
        : 'default'
        }`" @mousedown="onMouseDown(item, $event)" @mouseup="onMouseUp(item)" @dblclick="onDblClick(item)"
        :draggable="selectedDataThings.length === 1" @dragstart="drag($event, item)">
        <div class="panel-body" style="display: flex; align-items: center; justify-content: center">
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

  <div :class="`modal fade in`" tabindex="-1" role="dialog" :style="`${isOpenOption.find((item) => item === 'things-option')
    ? 'display: block'
    : ''
    }`">
    <div class="modal-dialog modal-sm" role="document">
      <div class="btn-group-vertical btn-block" role="group" aria-label="Vertical button group">
        <button v-if="selectedDataThings.length === 1" type="button" class="btn btn-default"
          @click="onToggleModal('things-modal-edit')">
          Edit
        </button>
        <button type="button" class="btn btn-default" @click="onToggleModal('things-modal-delete')">
          Delete
        </button>
        <button type="button" class="btn btn-default" @click="onToggleModal('things-option')">
          Close
        </button>
      </div>
    </div>
    <!-- /.modal-dialog -->
  </div>
  <!-- /.modal -->
  <div :class="`modal fade in`" tabindex="-1" role="dialog" :style="`${isOpenOption.find((item) => item === 'things-modal-delete')
    ? 'display: block'
    : ''
    }`">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="
            isLoadingDelete ? null : onToggleModal('things-modal-delete')
            ">
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
          <button type="button" class="btn btn-default" @click="onToggleModal('things-modal-delete')"
            :disabled="isLoadingDelete">
            Close
          </button>
          <button type="button" class="btn btn-danger" @click="onDeleteThings()" :disabled="isLoadingDelete">
            <i v-if="isLoadingDelete" class="fa-duotone fa-solid fa-spinner fa-spin-pulse"></i>
            <span v-else>Sure</span>
          </button>
        </div>
      </div>
    </div>
    <!-- /.modal-dialog -->
  </div>
  <!-- /.modal -->
  <div :class="`modal fade in`" tabindex="-1" role="dialog" :style="`${isOpenOption.find((item) => item === 'things-modal-edit')
    ? 'display: block'
    : ''
    }`">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="isLoadingDelete ? null : onToggleModal('things-modal-edit')">
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
        <FormThingAddEdit noActionButton isEdit :initialValues="selectedDataThings[0]" @onClose="() => {
          onToggleModal('things-modal-edit');
        }
          " @onReload="() => {
            onToggleModal('things-option');
            onGetThings();
          }
            ">
          <template v-slot:action-button="slotProps">
            <div class="modal-footer">
              <button type="button" class="btn btn-default" @click="onToggleModal('things-modal-edit')">
                Close
              </button>
              <button type="submit" class="btn btn-primary" @click="editSubmit?.click()"
                :disabled="!slotProps.isValid || slotProps.isLoading">
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
