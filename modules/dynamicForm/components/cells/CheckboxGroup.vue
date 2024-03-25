<template>
    <div :class="`flex ${props.alignement === 'vertical' ? 'flex-column' : 'flex-row flex-wrap'} gap-2`">
        <div v-for="option in options" :key="'' + valueOf(option)" class="flex align-items-center">
            <Checkbox :modelValue="modelValue" @update:modelValue="emits('update:modelValue', $event)"
                :inputId="`${props.id}-${valueOf(option)}`" :name="labelOf(option)" :value="valueOf(option)"
                :class="{ 'p-invalid': invalid }" />
            <label :for="`${props.id}-${valueOf(option)}`" class="ml-2">{{ labelOf(option) }}</label>
        </div>
    </div>
</template>


<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import type { SelectValues } from '../../types';
import type { KeyString } from '../../../utils/types';

type RadioGroupProps = {
    modelValue: SelectValues[],
    options: KeyString[],
    id: string,
    alignement?: string
    invalid?: boolean
    selectLabel?: string
    selectValue?: string
}
const props = defineProps<RadioGroupProps>()

const valueOf = (option: (KeyString | SelectValues)): SelectValues => 
    typeof option !== "object" ? option : option[props.selectValue || "value"]
const labelOf = (option: (KeyString | SelectValues)): string => 
    typeof option !== "object" ? String(option) : option[props.selectLabel || "label"]


const emits = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void
}>()
</script>


<style scoped lang="scss"></style>