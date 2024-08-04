<script setup lang="ts">
import { onFetch } from 'src/helpers/lazyFetch';
import { ref, Ref, watch } from 'vue';
import * as yup from "yup";

interface IDataThing{
    name:string; uid: string
}

const emit = defineEmits<{
    (e: "onReload", data: IDataThing | null): void;
    (e: "onClose"): void;
}>();

const props = defineProps<{
    initialValues?: IDataThing;
    isEdit?: boolean;
}>();

const validation = () => {
    return yup.object().shape({
        name: yup.string().required("Name is required"),
    });
}


const values: Ref<{
    name: string;
    uid?: string;
}> = ref({ name: "", });
const errValues: Ref<{ [key: string]: string }> = ref({});
const isValid = ref(false);
const isLoading = ref(false);
const errSubmit: Ref<null | string> = ref(null);


const onSubmit = () => {
    if(props.isEdit){
        const formd = new FormData;
        formd.append("name",values.value.name);
        onFetch({
            url: `/api/v1/things/${props.initialValues?.uid}`,
            method: "PUT",
            data: formd,
            beforeSend: () => {
                isLoading.value = true;
                errSubmit.value = null;
            },
            success: (data) => {
                isLoading.value = false;
                emit("onClose");
                emit("onReload", null );
            },
            error: () => {
                isLoading.value = false;
                errSubmit.value = "Something went wrong!"
            }
        })
    }
    else{
        const formd = new FormData;
        formd.append("name",values.value.name);
        onFetch({
            url: "/api/v1/things",
            method: "POST",
            data: formd,
            beforeSend: () => {
                isLoading.value = true;
                errSubmit.value = null;
            },
            success: (data) => {
                isLoading.value = false;
                emit("onClose");
                emit("onReload", data.data as IDataThing );
            },
            error: () => {
                isLoading.value = false;
                errSubmit.value = "Something went wrong!"
            }
        })
    }
}

watch(
    ()=> props?.initialValues,
    (newValues, oldValues) => {
        if (!!newValues && JSON.stringify(newValues) !== JSON.stringify(oldValues)) {
            values.value = {
                name: newValues.name
            }
        }
    }
);


watch(
    values,
    (newValues) => {
        validation()
            .validate(newValues, { abortEarly: false }).then(() => {
                errValues.value = {}
                isValid.value = true;
            }).catch((err) => {
                let errin = {};
                (!!err.inner ? err.inner : []).forEach((item: { path: string; message: string }) => {
                    errin = { ...errin, [item.path]: item.message };
                });

                errValues.value = { ...errin }
                isValid.value = false;
            })
    },
    { deep: true }
);

</script>

<template>
    <div v-if="!!errSubmit" class="alert alert-danger">
        <button type="button" class="close" @click="errSubmit = null"><span>&times;</span></button>
        {{ errSubmit }}
    </div>
    <form class="form-horizontal" @submit.prevent="onSubmit">
        <div :class="`form-group ${!!errValues.name ? 'has-error has-danger' : ''}`">
            <label class="col-sm-2 control-label">Name</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" placeholder="Name" v-model="values.name">
                <div class="help-block with-errors">
                    <ul v-if="!!errValues.name" class="list-unstyled">
                        <li>{{ errValues.name }}</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="col-sm-offset-2 col-sm-10">
                <button type="submit" :class="`btn btn-default`"
                    :disabled="!isValid || isLoading">{{ isLoading ? "Wait..." : "Submit" }}</button>
            </div>
        </div>
    </form>
</template>