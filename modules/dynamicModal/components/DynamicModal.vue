<template>
    <Dialog v-model:visible="visible" modal :header="headerText || ''" :style="{ minWidth: '25rem', maxWidth: '57rem' }"
        @hide="close">
        <DynamicForm :id="id" :model-value="modelValue" @update:model-value="emits('update:modelValue', $event)"
            @submit="handleConfirm" :submit-loading="submitLoading" :get-loading="getLoading" :paginated="paginated"
            :limit="limit">
            <template #submit="{ hasNext, hasPrev, nextPage, prevPage }">
                <div class="w-full flex justify-content-end gap-2">
                    <Button class="" :icon="cancelIcon || 'pi pi-times'" type="button" :label="cancelLabel || 'Annuler'"
                        @click="close" severity="contrast"></Button>
                    <Button icon="pi pi-arrow-left" label="Précédent" @click="prevPage()" v-if="hasPrev"
                        severity="contrast">
                    </Button>
                    <Button icon="pi pi-arrow-right" iconPos="right" label="Suivant" @click="nextPage()" v-if="hasNext">
                    </Button>
                    <Button v-else :loading="submitLoading" class="" :icon="submitIcon || 'pi pi-check'" type="submit"
                        :label="submitLabel || 'Confirmer'"></Button>
                </div>
            </template>
        </DynamicForm>
    </Dialog>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import type { DynamicFormProps, FormResult, TDynamicForm } from '../../dynamicForm/types';
import DynamicForm from '../../dynamicForm/components/DynamicForm.vue';

const visible = ref(false)
const confirmed = ref(false)
const res = ref<(...args: any[]) => any>()
const rej = ref<(...args: any[]) => any>()

type DynamicModalProp = DynamicFormProps & {
    headerText?: string
    cancelIcon?: string
    cancelLabel?: string
}

defineProps<DynamicModalProp>()

const emits = defineEmits<{
    (e: "update:modelValue", value: TDynamicForm[]): void
}>()

const handleConfirm = async (value: FormResult) => {
    res.value?.(value)
    confirmed.value = true
}

const close = () => {
    visible.value = false
    if (confirmed.value) {
        confirmed.value = false
        return
    }
    confirmed.value = false
    rej.value?.("closed")
}

const open = () => {
    visible.value = true
    return new Promise((resolve, reject) => {
        res.value = resolve
        rej.value = reject
    })
}

defineExpose({
    open,
    close
})
</script>


<style scoped lang="scss"></style>