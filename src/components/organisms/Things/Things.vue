<script setup lang="ts">
import { watch } from "fs";
import FormThingAddEdit from "src/components/FormThingAddEdit/FormThingAddEdit.vue";
import { expandJSON } from "src/helpers/helpers";
import { onFetch, onFetchAllAsync } from "src/helpers/lazyFetch";
import { onMounted, Ref, ref } from "vue";
import Properties from "../Properties/Properties.vue";
import { useMediaDevice } from "src/hooks/useMediaDevice";
import { useKeyboard } from "src/hooks/useKeyboard";
import { API_THINGS, API_PREFERENCES, API_PHOTOS } from "src/config/api";
import { wbvtInstance } from "src/config/axios";

interface IDataThing {
  name: string;
  id: string;
  prefs: { id: string; name: string }[];
  photo_id?: string;
  photo?: {
    url: string;
  };
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
const breadCrumbMove: Ref<IDataThing[]> = ref([]);
const dataThingsMove: Ref<IDataThing[]> = ref([]);

const { onCloseCamera } = useMediaDevice();

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
  onCloseCamera();
  isOpenOption.value = ls;
  if (value === "things-modal-move") {
    dataThingsMove.value = dataThings.value;
    breadCrumbMove.value = breadCrumb.value;
  }
};

// const onBackdrop = () => {
//   let ls = [...isOpenOption.value];
//   ls = [...ls.filter((_, i) => i !== ls.length - 1)];
//   isOpenOption.value = ls;
// };

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

const onMouseUp = (data: IDataThing) => {
  if (new Date().getTime() - lastMouseDown.value >= 500) {
    onToggleModal("things-option");
    // selectedDataThings.value = [data];
  }
};

const onDblClick = (data: IDataThing) => {
  if (data.prefs.map((item) => item.name).find((item) => item === "storage")) {
    selectedDataThings.value = [];
    breadCrumb.value = [...breadCrumb.value, data];
    breadCrumbMove.value = [...breadCrumbMove.value, data];
    return childFetch(data.id);
  } else {
    selectedDataThings.value = [data];
    // onToggleModal("things-option");
    onToggleModal("things-modal-properties");
  }
};

const onDeleteThings = () => {
  onFetch(wbvtInstance)({
    url: `${API_THINGS}`,
    method: "DELETE",
    data: { id: selectedDataThings.value.map((item) => item.id) },
    beforeSend() {
      isLoadingDelete.value = true;
    },
    success() {
      isLoadingDelete.value = false;
      dataThings.value = [
        ...dataThings.value.filter(
          (item) => !selectedDataThings.value.find((sub) => sub.id === item.id)
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

const childFetch = (id: string, menu = "") => {
  return onFetch(wbvtInstance)({
    url: `${API_THINGS}`,
    method: "GET",
    data: {
      filter: {
        parent_id: id,
      },
    },
    beforeSend() {
      if (menu === "") {
        isLoading.value = true;
      }
    },
    success(data) {
      let ntap = (data as unknown as { result: { data: IDataThing[] } }).result
        .data;
      onFetchAllAsync(wbvtInstance)(
        ntap.map((item) => ({
          url: API_PREFERENCES,
          data: {
            filter: { things_id: item.id },
          },
        })),
        {
          beforeSend() {
            return null;
          },
          success(resp) {
            resp.forEach((item) => {
              ntap.forEach((sub, i) => {
                if (
                  !!item.data.result &&
                  sub.id === item.config.params.filter.things_id
                ) {
                  ntap[i].prefs = [...item.data.result.data];
                }
              });
            });
            onFetchAllAsync(wbvtInstance)(
              ntap
                .filter((item) => item.photo_id !== null)
                .map((item) => ({ url: API_PHOTOS + `/${item.photo_id}` })),
              {
                beforeSend() {
                  return null;
                },
                success(resp) {
                  isLoading.value = false;
                  resp.forEach((item) => {
                    ntap.forEach((sub, i) => {
                      if (
                        item.data.result !== null &&
                        sub.id === item.data.result.things_id
                      ) {
                        ntap[i].photo = {
                          url: item.data.result.url,
                        };
                      }
                    });
                  });
                  if (menu === "") {
                    dataThings.value = ntap;
                    dataThingsMove.value = ntap;
                  }
                  if (menu === "move") {
                    dataThingsMove.value = ntap;
                  }
                },
                error() {
                  isLoading.value = false;
                  if (menu === "") {
                    dataThings.value = ntap;
                    dataThingsMove.value = ntap;
                  }
                  if (menu === "move") {
                    dataThingsMove.value = ntap;
                  }
                },
              }
            );
          },
          error() {
            isLoading.value = false;
            return null;
          },
        }
      );
    },
    error() {
      isLoading.value = false;
    },
  });
};

const onGetThings = (menu = "") =>
  onFetch(wbvtInstance)({
    url: API_THINGS,
    method: "GET",
    data: {
      filter: {
        parent_id: "null",
      },
      sort: [{ by: "created_at", order: "desc" }],
    },
    beforeSend() {
      if (menu === "") {
        isLoading.value = true;
      }
    },
    success(data) {
      let ntap = (data as unknown as { result: { data: IDataThing[] } }).result
        .data;
      onFetchAllAsync(wbvtInstance)(
        ntap.map((item) => ({
          url: API_PREFERENCES,
          data: {
            filter: { things_id: item.id },
          },
        })),
        {
          beforeSend() {
            return null;
          },
          success(resp) {
            console.log(resp);
            resp.forEach((item) => {
              ntap.forEach((sub, i) => {
                if (sub.id === item.config.params.filter.things_id) {
                  ntap[i].prefs = [...item.data.result.data];
                }
              });
            });

            onFetchAllAsync(wbvtInstance)(
              ntap
                .filter((item) => item.photo_id !== null)
                .map((item) => ({
                  url: API_PHOTOS + "/" + item.photo_id,
                })),
              {
                beforeSend() {
                  return null;
                },
                success(resp) {
                  isLoading.value = false;
                  console.log(resp);
                  resp.forEach((item) => {
                    ntap.forEach((sub, i) => {
                      if (
                        !!item.data.result &&
                        sub.id === item.data.result.things_id
                      ) {
                        ntap[i].photo = {
                          url: item.data.result.url,
                        };
                      }
                    });
                  });
                  if (menu === "") {
                    dataThings.value = ntap;
                    dataThingsMove.value = ntap;
                  }
                  if (menu === "move") {
                    dataThingsMove.value = ntap;
                  }
                },
                error() {
                  isLoading.value = false;
                  if (menu === "") {
                    dataThings.value = ntap;
                    dataThingsMove.value = ntap;
                  }
                  if (menu === "move") {
                    dataThingsMove.value = ntap;
                  }
                },
              }
            );
          },
          error() {
            isLoading.value = false;
          },
        }
      );
    },
    error(err) {
      isLoading.value = false;
    },
  });

onMounted(() => {
  onGetThings();
});

const drag = (ev: DragEvent, item: IDataThing) => {
  ev.dataTransfer?.setData("text", JSON.stringify(item));
};

const allowDrop = (ev: DragEvent) => {
  ev.preventDefault();
};

const onMove = (item: IDataThing | null) => {
  if (selectedDataThings.value.length === 1) {
    if (
      (!!item &&
        selectedDataThings.value[0].id !== item?.id &&
        !!item?.prefs
          .map((item) => item.name)
          .find((item) => item === "storage")) ||
      !item
    ) {
      const formd = new FormData();
      const bd = expandJSON({
        ...selectedDataThings.value[0],
        parent_id: item?.id ?? null,
      });
      for (const key in bd) {
        formd.append(bd[key].label, bd[key].value as string | Blob);
      }
      onFetch(wbvtInstance)({
        url: API_THINGS + "/" + selectedDataThings.value[0].id,
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
              (item) => item.id !== selectedDataThings.value[0].id
            ),
          ];
          onToggleModal("things-modal-move");
        },
        error() {
          isLoadingEdit.value = false;
        },
      });
    }
  }
};

const drop = (ev: DragEvent, item: IDataThing | null) => {
  ev.preventDefault();
  var data = {
    ...JSON.parse(ev.dataTransfer?.getData("text") ?? ""),
    parent_id: item?.id ?? null,
  };
  if (
    ((!!item &&
      data.id !== item?.id &&
      !!item?.prefs
        .map((item) => item.name)
        .find((item) => item === "storage")) ||
      !item) &&
    selectedDataThings.value.length === 1
  ) {
    const formd = new FormData();
    const bd = expandJSON(data);
    for (const key in bd) {
      formd.append(bd[key].label, bd[key].value as string | Blob);
    }
    onFetch(wbvtInstance)({
      url: API_THINGS + "/" + data.id,
      method: "PUT",
      data: formd,
      beforeSend() {
        isLoadingEdit.value = true;
      },
      success() {
        isLoadingEdit.value = false;
        // dataThings.value = (data as { data: IDataThing[] }).data;

        dataThings.value = [
          ...dataThings.value.filter((item) => item.id !== data.id),
        ];
      },
      error() {
        isLoadingEdit.value = false;
      },
    });
  }
};

const onBreadCrumbHome = (menu = "") => {
  if (menu === "") {
    breadCrumb.value = [];
    selectedDataThings.value = [];
  }
  if (menu === "move") {
    breadCrumbMove.value = [];
  }
  return onGetThings(menu);
};
const onBreadCrumb = (key: number, menu = "") => {
  if (menu === "") {
    breadCrumb.value = breadCrumb.value.filter((_, i) => i <= key);
    breadCrumbMove.value = breadCrumb.value;
    selectedDataThings.value = [];
    childFetch(breadCrumb.value[key].id);
  }
  if (menu === "move") {
    breadCrumbMove.value = breadCrumbMove.value.filter((_, i) => i <= key);
    childFetch(breadCrumbMove.value[key].id, menu);
  }
  return;
};
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
          v-if="cardAddThings"
          :initialValues="
            breadCrumb.length > 0
              ? { parent_id: breadCrumb[breadCrumb.length - 1].id }
              : undefined
          "
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

  <div class="row">
    <div class="col-xs-12">
      <button
        v-if="breadCrumb.length !== 0"
        class="btn btn-default"
        @click="onBreadCrumbHome()"
        @drop="drop($event, null)"
        @dragover="allowDrop($event)"
      >
        Home
      </button>
      <button v-else class="btn btn-primary" disabled>Home</button>
      <template v-for="(item, key) in breadCrumb" :key="key">
        <button
          v-if="key < breadCrumb.length - 1"
          class="btn btn-default"
          @click="onBreadCrumb(key)"
          @drop="drop($event, item)"
          @dragover="allowDrop($event)"
        >
          {{ item.name }}
        </button>
        <button v-else class="btn btn-primary" disabled>
          {{ item.name }}
        </button>
      </template>
    </div>
  </div>

  <div class="row" style="margin-bottom: 1em">
    <div class="col-xs-12">
      <button
        class="btn btn-default"
        @click="
          breadCrumb.length === 0
            ? onGetThings()
            : childFetch(breadCrumb[breadCrumb.length - 1].id)
        "
      >
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>

      <button
        v-if="selectedDataThings.length > 0"
        class="btn btn-default"
        @click="onToggleModal('things-modal-delete')"
      >
        <i class="fa-regular fa-trash-can"></i>
      </button>
      <button
        v-if="selectedDataThings.length === 1"
        class="btn btn-default"
        @click="onToggleModal('things-modal-edit')"
      >
        <i class="fa-regular fa-pen-to-square"></i>
      </button>
      <button
        v-if="selectedDataThings.length === 1"
        class="btn btn-default"
        @click="onToggleModal('things-modal-properties')"
      >
        <i class="fa-solid fa-sliders"></i>
      </button>
      <button
        v-if="selectedDataThings.length === 1"
        class="btn btn-default"
        @click="onToggleModal('things-modal-move')"
      >
        <i class="fa-regular fa-share-from-square"></i>
      </button>
    </div>
  </div>
  <div class="row" style="overflow: auto">
    <div class="col-xs-12" v-if="isLoading">
      <i class="fa-duotone fa-solid fa-spinner fa-spin-pulse"></i>
    </div>
    <div
      v-else
      v-for="(item, key) in dataThings"
      class="col-xs-4"
      v-bind:key="key"
      @drop="drop($event, item)"
      @dragover="allowDrop($event)"
    >
      <div
        :class="`panel panel-${
          selectedDataThings.find((sub) => sub.id === item.id)
            ? 'primary'
            : 'default'
        }`"
        @mousedown="onMouseDown(item, $event)"
        @mouseup="onMouseUp(item)"
        @dblclick="onDblClick(item)"
        :draggable="selectedDataThings.length === 1"
        @dragstart="drag($event, item)"
      >
        <div
          class="panel-body"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 12rem;
          "
        >
          <img v-if="!!item.photo" :src="item.photo.url" style="width: 100%" />
          <i v-else class="fa-solid fa-circle-info"></i>
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
        ? 'display: flex'
        : ''
    }; flex-direction: column`"
  >
    <div class="modal-dialog modal-sm" role="document" style="margin-top: auto">
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
          v-if="selectedDataThings.length === 1"
          type="button"
          class="btn btn-default"
          @click="onToggleModal('things-modal-properties')"
        >
          Properties
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
        ? 'display: flex'
        : ''
    }; flex-direction: column`"
  >
    <div class="modal-dialog modal-sm" role="document" style="margin-top: auto">
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
        ? 'display: flex'
        : ''
    }; flex-direction: column`"
  >
    <div class="modal-dialog modal-sm" role="document" style="margin-top: auto">
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
              if (breadCrumb.length === 0) {
                onGetThings();
              } else {
                childFetch(breadCrumb[breadCrumb.length - 1].id);
              }
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
  <div
    :class="`modal fade in`"
    tabindex="-1"
    role="dialog"
    :style="`${
      isOpenOption.find((item) => item === 'things-modal-properties')
        ? 'display: flex'
        : ''
    }; flex-direction: column`"
  >
    <div class="modal-dialog modal-md" role="document" style="margin-top: auto">
      <div class="modal-content">
        <div class="modal-header">
          <button
            type="button"
            class="close"
            @click="onToggleModal('things-modal-properties')"
          >
            <span aria-hidden="true">×</span>
          </button>
          <h4 class="modal-title" id="mySmallModalLabel">
            Properties of
            {{
              selectedDataThings.length === 1
                ? selectedDataThings[0].name
                : `${selectedDataThings.length} Things`
            }}
          </h4>
        </div>
        <Properties
          v-if="isOpenOption.find((item) => item === 'things-modal-properties')"
          :initialValues="selectedDataThings[0]"
          @onClose="() => onToggleModal('things-modal-properties')"
          @onReload="
            () => {
              if (breadCrumb.length === 0) {
                onGetThings();
              } else {
                childFetch(breadCrumb[breadCrumb.length - 1].id);
              }
            }
          "
        />
      </div>
    </div>

    <!-- /.modal-dialog -->
  </div>

  <div
    :class="`modal fade in things-modal-move`"
    tabindex="-1"
    role="dialog"
    :style="`${
      isOpenOption.find((item) => item === 'things-modal-move')
        ? 'display: flex'
        : ''
    }; flex-direction: column`"
  >
    <div class="modal-dialog modal-sm" role="document" style="margin-top: auto">
      <div
        v-if="selectedDataThings.length > 0"
        class="btn-group-vertical btn-block"
        role="group"
        aria-label="Vertical button group"
      >
        <button
          v-if="breadCrumbMove.length > 0"
          type="button"
          class="btn btn-default"
          @click="
            breadCrumbMove.length === 1
              ? onBreadCrumbHome('move')
              : onBreadCrumb(breadCrumbMove.length - 2, 'move')
          "
        >
          ...
        </button>
        <button
          v-for="(dt, key) in dataThingsMove
            .filter(
              (item) =>
                !!item.prefs
                  .map((item) => item.name)
                  .find((sbu) => sbu === 'storage')
            )
            .filter((item) => item.id !== selectedDataThings[0].id)"
          type="button"
          class="btn btn-default"
          v-bind:key="key"
          @click="
            () => {
              breadCrumbMove = [...breadCrumbMove, dt];
              childFetch(dt.id, 'move');
            }
          "
        >
          {{ dt.name }}
        </button>
        <button
          type="button"
          class="btn btn-default"
          @click="onMove(breadCrumbMove[breadCrumbMove.length - 1])"
        >
          Here
        </button>
        <button
          type="button"
          class="btn btn-default"
          @click="onToggleModal('things-modal-move')"
        >
          Close
        </button>
      </div>
    </div>
    <!-- /.modal-dialog -->
  </div>
  <!-- /.modal -->
  <div v-if="isOpenOption.length > 0" class="modal-backdrop fade in"></div>
</template>

<style scoped></style>
