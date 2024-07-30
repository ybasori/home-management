<script setup lang="ts">
import FormThingAddEdit from 'src/components/FormThingAddEdit/FormThingAddEdit.vue';
import { ref } from 'vue';

const cardAddThings = ref(false)
</script>

<template>
    <div class="panel panel-default">
        <div class="panel-heading">
            <h4 class="panel-title">
                <a role="button" data-toggle="collapse" href="javascript:void(0)"
                    @click="cardAddThings = !cardAddThings">
                    Add Things
                </a>
            </h4>
        </div>
        <div :class="`panel-collapse collapse ${cardAddThings ? 'in' : ''}`">
            <div class="panel-body">
                <FormThingAddEdit />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
