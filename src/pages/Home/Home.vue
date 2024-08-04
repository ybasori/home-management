<script setup lang="ts">
import FormThingAddEdit from "src/components/FormThingAddEdit/FormThingAddEdit.vue";
import { onFetch } from "src/helpers/lazyFetch";
import { onMounted, Ref, ref } from "vue";

interface IDataThing {
  name: string;
  uid: string;
}

const cardAddThings = ref(false);
const isLoading = ref(false);
const dataThings: Ref<IDataThing[]> = ref([]);
const lastMouseDown: Ref<number> = ref(0);
const selectedDataThings: Ref<IDataThing | null> = ref(null);
const onMouseDown = (data: IDataThing) => {
  lastMouseDown.value = new Date().getTime();
  selectedDataThings.value = data;
};
const onMouseUp = () => {
  if (new Date().getTime() - lastMouseDown.value > 1000) {
    console.log("long press");
  }
};
const onDblClick = () =>{
    console.log("dbl press")
}
const onGetThings = () =>
  onFetch({
    url: "/api/v1/things",
    method: "GET",
    beforeSend() {
      isLoading.value = true;
    },
    success(data) {
      isLoading.value = false;
      console.log(data);
      dataThings.value = (data as { data: IDataThing[] }).data;
    },
    error(err) {
      isLoading.value = false;
      console.log(err);
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
      <button class="btn btn-default" @click="onGetThings()">Reload</button>
    </div>
  </div>
  <div class="row">
    <div class="col-xs-12" v-if="isLoading">Loading</div>
    <div
      v-if="!isLoading"
      v-for="(item, key) in dataThings"
      class="col-xs-4"
      v-bind:key="key"
    >
      <div
        :class="`panel panel-${
          item.uid === selectedDataThings?.uid ? 'primary' : 'default'
        }`"
        @mousedown="onMouseDown(item)"
        @mouseup="onMouseUp()"
        @dblclick="onDblClick()"
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
</template>

<style scoped></style>
