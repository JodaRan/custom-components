<template>
    <TreeSelect id="tree-select-test" v-model="selectedValue" :options="resultCategories" emptyMessage="Pas d'options">
        <template #header>
            <div class="px-4 mt-2">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <InputText v-model.trim="search" class="w-full" placeholder="Rechercher" size="small" />
                </span>
            </div>
        </template>
    </TreeSelect>
</template>

<script setup lang="ts">
import { computed, ref, type WritableComputedRef } from 'vue';
import { copyKeys, filterWithinDescendant } from '../../../utils/global';
import type { KeyString } from '../../../utils/types';


const props = defineProps<{
    modelValue: number | string,
    options: KeyString[],
    selectLabel?: string
    selectValue?: string
    childrenKey?: string
}>()

const emits = defineEmits<{
    (e: "update:modelValue", value: number | string): void
}>()

const options = computed(() => props.options)

const treatedCategories = computed(() => {
    return copyKeys(options.value, [
        ["key", props.selectValue || "value"],
        ["label", props.selectLabel || "label"],
        ["children", props.childrenKey || "children"],
        ["selectable", (el) => !el[props.childrenKey || "children"]?.length],
        ["data", props.selectLabel || "label"],
    ])
})

const selectedValue: WritableComputedRef<KeyString> = computed({
    get(): KeyString {
        if (!props.modelValue) return {}
        
        return { [props.modelValue]: true }
    },
    set(value: KeyString) {
        const val = Object.keys(value)[0]
        emits('update:modelValue', val)
    },
});

const search = ref("")
const resultCategories = computed(() =>
    filterWithinDescendant(
        treatedCategories.value,
        (el) => el.name?.toLowerCase().includes(search.value.toLowerCase())
    )
)



</script>