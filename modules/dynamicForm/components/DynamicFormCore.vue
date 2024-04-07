<template>
    <component v-if="item && item.type !== 'template'" :is="mappedForm[item.type].component" v-on="ons(item)"
        v-bind="attrs(item)" v-model="value" />
</template>


<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Password from 'primevue/password'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'

import RadioGroup from './cells/RadioGroup.vue'
import CheckboxGroup from './cells/CheckboxGroup.vue'

import FilepondInput from './cells/FilepondInput.vue'
import TreeSelectComponent from './cells/TreeSelectComponent.vue'
import LazyPaginatedSelect from './cells/LazyPaginatedSelect.vue'
import InputFile from './cells/InputFile.vue'
import type { TDynamicForm } from '../types'
import { useHydrateAttr, useHydrateOn } from '../composables/dynamicForm'
import { computed } from 'vue'


type DynamicFormCoreProps = {
    id: string,
    modelValue?: TDynamicForm["value"],
    errorsTouched?: Record<string, string | undefined>
    item?: TDynamicForm
}

const props = defineProps<DynamicFormCoreProps>()

type DynamicFormCoreEmits = {
    (e: "update:modelValue", value: TDynamicForm): void
}

const emits = defineEmits<DynamicFormCoreEmits>()

const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emits("update:modelValue", value)
    }
})

type FormType = TDynamicForm['type']
type FormTypeMap = { [key in FormType]: any }

const mappedForm: Omit<FormTypeMap, 'template'> = {
    number: { component: InputNumber },
    input: { component: InputText },
    textarea: { component: Textarea },
    date: { component: Calendar },
    select: { component: Dropdown },
    password: { component: Password },
    radio: { component: RadioGroup },
    checkbox: { component: CheckboxGroup },
    file: { component: InputFile },
    filepond: { component: FilepondInput },
    multiselect: { component: MultiSelect },
    treeselect: { component: TreeSelectComponent },
    lazyselect: { component: LazyPaginatedSelect },
    mask: { component: InputMask }
}

const attrs = (item: TDynamicForm) => useHydrateAttr(props.id, item, props.errorsTouched)

const ons = (item?: TDynamicForm) => useHydrateOn(item)

</script>


<style scoped lang="scss"></style>