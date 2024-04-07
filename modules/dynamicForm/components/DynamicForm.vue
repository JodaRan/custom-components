<template>
  <form class="w-full" @submit="onSubmit">
    <Steps v-if="paginated" v-model:activeStep="activeStep" :model="stepper" />
    <div class="grid gap-0">
      <div v-for="item in paginatedForm" :key="item.id" :class="['flex flex-column', item.containerClass]"
        :ref="(el) => (containerRefs[item.id] = el)">
        <template v-if="getLoading">
          <Skeleton height="1rem" style="max-width: 10rem; margin-bottom: .45rem;"></Skeleton>
          <Skeleton :height="skeletonHeight(item)"></Skeleton>
        </template>
        <template v-else>
          <label :for="withLabel(item.type) ? idFor(item) : 'no'" :class="withLabel(item.type) ? '' : 'mb-2'"
            class="font-semibold text-sm mb-1">
            {{ item.label }}
          </label>
          <slot v-if="item.type === 'template'" :name="`item(${item.id})`" v-bind="{ data: item }"></slot>
          <DynamicFormCore v-else v-model="item.value" :item="item" :errors-touched="errorsTouched" :id="id" />
          <ErrorMessage :message="errorsTouched[item.id]"></ErrorMessage>
        </template>
      </div>
      <div class="col-12" :class="{ 'p-0': $slots.submit }">
        <div v-if="!$slots.submit" class="w-full flex justify-content-end gap-2">
          <Button icon="pi pi-arrow-left" label="Précédent" @click="prevPage()" v-if="hasPrev" severity="contrast">
          </Button>
          <Button icon="pi pi-arrow-right" iconPos="right" label="Suivant" @click="nextPage()" v-if="hasNext">
          </Button>
          <Button v-else :loading="props.submitLoading" class="" :icon="submitIcon || 'pi pi-check'" type="submit"
            :label="submitLabel || 'Confirmer'"></Button>
        </div>
        <div v-else>
          <slot name="submit" v-bind="{ prevPage, nextPage, hasNext, hasPrev }"></slot>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue'
import Steps from 'primevue/steps'
import Skeleton from 'primevue/skeleton'
import Button from 'primevue/button'
import { useWindowScroll } from '@vueuse/core'
import { useForm } from 'vee-validate'
import DynamicFormCore from "./DynamicFormCore.vue"
import { asyncTimeout, isArray } from '../../utils/global'
import type { TDynamicForm, FormResult } from '../types'
import { useIdFor, useFormPagination } from '../composables/dynamicForm'
import ErrorMessage from './cells/ErrorMessage.vue'
import initializeRules from '../utils/rules'

//// Types
type DynamicFormProps = {
  modelValue: TDynamicForm[];
  id: string;
  submitLoading?: boolean,
  getLoading?: boolean,
  paginated?: boolean,
  limit?: number,
  submitLabel?: string,
  submitIcon?: string,
}
type FormType = TDynamicForm['type']


//// From parent
const props = defineProps<DynamicFormProps>()

const idFor = (item: TDynamicForm) => useIdFor(props.id, item)

const withLabel = (type: FormType) => type !== "checkbox" && type !== "radio"

//// To children

//// Validation
onBeforeMount(() => {
  initializeRules()
})

// Await for the form to be touched to display the errors
const isFormHasError = ref(false)
const errorsTouched = computed<Record<string, string | undefined>>(() => (
  Object.keys(errors.value).reduce((acc, curr) => ({ ...acc, [curr]: isFormHasError.value ? errors.value[curr] : '' }), {})
))

// Errors
const getObject = (key: keyof TDynamicForm) =>
  props
    .modelValue
    .reduce((acc, curr) =>
      ({ ...acc, [curr.id]: curr[key] }),
      {})

type Form = Record<typeof props.modelValue[number]['id'], string>


const { errors, setFieldValue, handleSubmit } = useForm<Form>({
  validationSchema: getObject("validation"),
  initialValues: getObject("value"),
});

watch(() => props.modelValue, () => {
  props.modelValue.forEach((el) => {
    setFieldValue('' + el.id, el.value)
  })
}, { deep: true })

//// To parent
const emits = defineEmits<{
  (e: 'submit', value: FormResult, formData?: FormData): void
}>()

const onSubmit = handleSubmit((values) => {
  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (isArray(value)) {
      value.forEach((el) => formData.append(`${key}`, el))
      return
    }
    formData.append(key, value)
  })
  emits('submit', values, formData)
}, ({ errors }) => {
  isFormHasError.value = true
  const arrayErrors = Object.keys(errors)
  if (arrayErrors.length <= 0) return
  scrollToContainer(arrayErrors[0])
})

//// Pagination
const {
  prevPage,
  nextPage,
  goToPage,
  paginatedForm,
  activeStep,
  stepper,
  hasPrev,
  hasNext,
  limit,
} = useFormPagination(props.modelValue, props.paginated, props.limit)

//// Utils
const { y } = useWindowScroll({ behavior: "smooth" })
const containerRefs = ref<{ [key: string]: any }>({});

const scrollToContainer = async (itemId: string) => {
  const id = props.modelValue.findIndex((el) => el.id === itemId)
  if (id < 0) return
  const pageToGo = Math.floor(id / limit.value) + 1
  goToPage(pageToGo)
  await asyncTimeout(500)
  const containerRef: HTMLElement = containerRefs.value[itemId]
  if (!containerRef) return
  const offset = 65
  const containerY = containerRef.getBoundingClientRect().y - offset
  y.value += containerY
}

//// Loading
const skeletonHeight = (item: TDynamicForm) => {
  if (item.type === "textarea")
    return "85.6px"
  if (item.type === "file")
    return "76px"
  if (item.type === "checkbox" || item.type === "radio")
    return "22px"
  return "45.6px"
}

</script>

<style scoped lang="scss"></style>
