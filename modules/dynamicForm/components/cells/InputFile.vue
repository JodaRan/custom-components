<template>
    <FileUpload :name="allowMultiple ? 'file' : 'file'" customUpload @uploader="onTemplatedUpload($event)"
        @error="handleError" :multiple="allowMultiple" :accept="acceptedFileTypes" :maxFileSize="maxFileSize"
        :invalidFileSizeMessage="invalidFileSizeMessage" :invalidFileTypeMessage="invalidFileTypeMessage"
        :fileLimit="fileLimit" :invalidFileLimitMessage="invalidFileLimitMessage" :auto="true"
        :pt="{ buttonbar: { class: 'p-2' } }">
        <template #header="{ chooseCallback, files }">
            <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                <div class="flex gap-2">
                    <span class="outlined-btn text-primary border-1 border-primary-500 hover:bg-surface-100"
                        @click="(!files || files.length === 0) && chooseCallback()">
                        <i class="pi pi-images"></i>
                    </span>
                </div>
            </div>
        </template>

        <template #content="{ messages }">
            <div :class="['w-full', { 'py-2': files.length }]">
                <Message severity="error" v-for="message in messages" :key="message">
                    {{ message }}
                </Message>
                <div :class="['flex flex-column gap-1', { 'mb-2': files.length }]">
                    <div v-for="(file, index) of files" :key="file.name + file.type + file.size"
                        :class="imageContainer">
                        <div>
                            <img role="presentation" :alt="file.name" :src="getFileUrl(file)" width="120" height="100"
                                class="object-cover" />
                        </div>
                        <div class="flex flex-column gap-1">
                            <span class="font-semibold truncate">{{ file.name }}</span>
                            <div v-if="file.size">{{ formatSize(file.size) }}</div>
                            <div>
                                <small class="px-2 py-1 border-round-3xl bg-green-500 text-white">Chargé</small>
                            </div>
                        </div>
                        <span class="close-btn" @click="onRemoveTemp(index)">
                            <i class="pi pi-times text-xs"></i>
                        </span>
                    </div>
                </div>
                <Draggable v-model="list" :disabled="!reorderer" item-key="name" class="flex flex-column gap-1 mb-2"
                    ghost-class="ghost" @start="dragging = true" @end="dragging = false">
                    <template #item="{ element: file }">
                        <div :class="imageContainer" :style="{ cursor: dragging ? 'grabbing!important' : 'grab' }">
                            <div>
                                <img role="presentation" :alt="file.name" :src="getExistingUrl(file)" width="120"
                                    height="100" class="object-cover" />
                            </div>
                            <div class="flex flex-column gap-1">
                                <span class="font-semibold truncate">{{ file.file_name }}</span>
                                <div v-if="file.size">{{ formatSize(file.size) }}</div>
                                <div>
                                    <small class="px-2 py-1 border-round-3xl bg-blue-500 text-white">Existant</small>
                                </div>
                            </div>
                            <span class="close-btn" @click="removeExisting(file)">
                                <i class="pi pi-times text-xs"></i>
                            </span>
                        </div>
                    </template>
                </Draggable>
            </div>
        </template>

        <template #empty>
            <div v-if="readFiles.length <= 0 && files.length <= 0"
                class="flex align-items-center justify-content-center flex-column">
                <i class="pi pi-cloud-upload border-2 border-circle p-3 text-3xl text-400 border-400" />
                <p class="mt-2 mb-0">Faites glisser et déposez les fichiers ici.</p>
            </div>
        </template>
    </FileUpload>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import FileUpload from 'primevue/fileupload';
import { usePrimeVue } from 'primevue/config';
import { useToast } from "primevue/usetoast";
import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import Draggable from 'vuedraggable';
import { dynamicError, isArray } from '../../../utils/global';
import type { FileTypes, ImgFromServer, TempImgFromServer } from '../../types';

type CommonInputFileProps = {
    allowMultiple?: boolean
    readFiles?: ImgFromServer[]
    acceptedFileTypes: FileTypes
    maxFileSize?: number
    docPreviewImgUrl: string
    videoPreviewImgUrl: string
    deleter?: (file_id: number) => Promise<void>
    reorderer?: (product_id: number, reordered_ids: number[]) => Promise<void>
    invalidFileSizeMessage: string
    invalidFileTypeMessage: string
    fileLimit: number
    invalidFileLimitMessage: string
}

type DirectUploadProps = {
    valueType: "directUpload"
    modelValue?: TempImgFromServer[]
    uploader: (file: File) => Promise<TempImgFromServer>
}

type FormDataProps = {
    valueType: "formData"
    modelValue?: File[]
    uploader?: undefined
}

type InputFileProps = CommonInputFileProps & (DirectUploadProps | FormDataProps)

type InputFileEmits = {
    (e: "update:modelValue", value?: (TempImgFromServer | File)[]): void,
    (e: "update:readFiles", value: ImgFromServer[]): void,
}
const acceptedFileTypes = computed(() => {
    return props.acceptedFileTypes === "image"
        ? "image/*"
        : props.acceptedFileTypes === "video"
            ? "video/*"
            : props.acceptedFileTypes === "doc"
                ? "application/*"
                : '*'
})

const props = withDefaults(defineProps<InputFileProps>(), {
    readFiles: () => [],
    invalidFileSizeMessage: "{0}: Fichier trop volumineux, doit être inférieure à {1}.",
    invalidFileTypeMessage: "{0}: Type de fichier non pris en compte, type permis: {1}.",
    fileLimit: 10,
    invalidFileLimitMessage: "Maximum de fichier dépassé, la limite est de {0} au max.",
    valueType: "directUpload",
    allowMultiple: true
})
const emits = defineEmits<InputFileEmits>()

const $primevue = usePrimeVue();
const toast = useToast();

const files = ref<File[]>([]);

const onTemplatedUpload = async (evt: FileUploadUploaderEvent) => {
    const _files = evt.files
    // if not array
    if (!isArray(_files)) {
        files.value = [_files]
        await uploadOne(_files)
        return
    }
    // if multiple
    if (props.allowMultiple) {
        _files.forEach(_file => files.value.push(_file))
        for (let index = 0; index < _files.length; index++) {
            const element = _files[index];
            await uploadOne(element)
        }
        return
    }
    const lastFile = _files.at(-1)
    if (!lastFile) return
    files.value = [lastFile]
    await uploadOne(lastFile)
    if (props.readFiles.length <= 0) return
    emits("update:readFiles", [])

};

function hasObjectType<T>(value: unknown, key: string | number): value is T {
    return !!value && typeof value === "object" && key in value
}

const uploadOne = async (file: File) => {
    try {
        if (props.valueType === "directUpload") {
            const response = await props.uploader?.(file)
            if (!response) throw new Error("No uploader promise/function to images field")
            const fromServer: TempImgFromServer = response
            const nullableValue = props.modelValue && props.allowMultiple
                ? props.modelValue.concat(fromServer) 
                : [fromServer]
            emits("update:modelValue", nullableValue)
            toast.add({ severity: "info", summary: "Succès", detail: "Fichier sauvegardé", life: 3000 });
        } else if (hasObjectType<File[]>(props.modelValue, "length")) {
            const nullableValue = props.modelValue && props.allowMultiple
                ? props.modelValue.concat(file) 
                : [file]
            emits("update:modelValue", nullableValue)
        }
    } catch (error) {
        toast.add({ severity: "error", summary: "Erreur", detail: dynamicError(error), life: 3000 });
        console.log(error);
    }
}

const getFileUrl = (file: File | ImgFromServer): string => {
    if (props.acceptedFileTypes === "doc") return props.docPreviewImgUrl
    if (props.acceptedFileTypes === "video") return props.videoPreviewImgUrl
    if (!('objectURL' in file) || typeof file.objectURL !== "string")
        return ""
    return file.objectURL
}

const getExistingUrl = (file: ImgFromServer): string => {
    if (props.acceptedFileTypes === "doc") return props.docPreviewImgUrl
    if (props.acceptedFileTypes === "video") return props.videoPreviewImgUrl
    return file.original_url
}

const formatSize = (bytes: number) => {
    const k = 1024;
    const dm = 3;
    const sizes = $primevue.config.locale?.fileSizeTypes;
    if (!sizes) return
    if (bytes === 0) {
        return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
};

// Remove
const onRemoveTemp = (index: number) => {
    if (!props.modelValue) return
    files.value.splice(index, 1)
    let newValue: (File | TempImgFromServer)[] | undefined
    newValue = props.modelValue.filter((el, id) => id !== index)
    if (!newValue.length && props.readFiles.length) {
        newValue = undefined
    }
    emits("update:modelValue", newValue)
};
const removeExisting = async (file: ImgFromServer) => {
    try {
        if (!props.deleter) throw new Error("No deleter function")
        await props.deleter(file.id)
        const _readFiles = props.readFiles.filter((el) => el.id !== file.id)
        emits("update:readFiles", _readFiles)
        toast.add({ severity: "info", summary: "Succès", detail: "Fichier supprimé", life: 3000 });
    } catch (error) {
        toast.add({ severity: "error", summary: "Erreur", detail: dynamicError(error), life: 3000 });
        console.log(error);
    }
}

// Ordering
const dragging = ref(false)
const list = computed({
    get() {
        return props.readFiles
    },
    async set(value) {
        if (!value) return
        const _readFiles = value.slice()
        try {
            if (!props.reorderer) return
            emits("update:readFiles", value)
            const orderedId = value.map(el => el.id)
            const productId = value[0].model_id
            await props.reorderer(productId, orderedId)
            toast.add({ severity: "info", summary: "Succès", detail: "Fichiers re-ordonnés", life: 3000 });
        } catch (error) {
            toast.add({ severity: "error", summary: "Erreur", detail: dynamicError(error), life: 3000 });
            emits("update:readFiles", _readFiles)
        }
    }
})


// Error
const handleError = (error: any) => {
    console.error("error", error);
}

// Style
const imageContainer = 'm-0 p-3 flex border-1 surface-border '
    + 'align-items-center gap-5 relative w-full'
    + ' col md:col-6 lg:col-4 xl:col-3'
</script>

<style scoped lang="scss">
.img {
    position: absolute;
    right: 0;
    top: 0;
}

.close-btn {
    position: absolute;
    right: 0.2rem;
    top: 0.2rem;
    background: var(--red-700);
    color: white;
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    border-radius: 55rem;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.5;

    &:hover {
        opacity: 0.7;
    }
}

.outlined-btn {
    background: var(--surface-0);
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    border-radius: 55rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
</style>
