<template>
    <FilePond name="file" ref="pond" label-idle="Faites glisser et déposez les fichiers ici..."
        :allow-multiple="props.allowMultiple" :accepted-file-types="acceptedFileTypes" @init="handleFilePondInit" :server="server"
        :files="fileToShow" @processfile="handleProcess" @removefile="handleProcess" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import vueFilePond from "vue-filepond";
import type { FilePondFile } from "filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import type { FileTypes, TempImgFromServer } from '../../types';

const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview
);

type FilepondInputProps = { modelValue: TempImgFromServer[], allowMultiple?: boolean, acceptedFileTypes: FileTypes, server: string }

const props = defineProps<FilepondInputProps>()
const emits = defineEmits<{ (e: 'update:modelValue', value: TempImgFromServer[]): void }>()

const acceptedFileTypes = computed(() => {
    return props.acceptedFileTypes === "image" 
        ? "image/*" 
        : props.acceptedFileTypes === "video"
        ? "video/*"
        : props.acceptedFileTypes === "doc"
        ? "application/*"
        : '*'
})

const handleFilePondInit = () => {
    // console.log("FilePond has initialized");
    fileToShow.value = props.modelValue.map((el) => el.original_url || "")
}

const fileToShow = ref<string[]>([])

const handleProcess = (err: any, file: FilePondFile) => {
    try {
        if (err) throw err
        const nice: TempImgFromServer = JSON.parse(file.serverId)
        if (props.modelValue.some((val) => val.path === nice.path))
            return null
        emits("update:modelValue", [...props.modelValue].concat(nice))
    } catch (error) {
        console.log(error);
    }

}
</script>