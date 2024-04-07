<template>
  <Dropdown v-model="value" :options="optionsWithSkel" :optionLabel="selectLabel" :optionValue="selectValue"
    :loading="loading" inputClass="w-full" class="w-full" emptyMessage="Pas d'options" @show="focused = true" @hide="focused = false">
    <template #header>
      <div class="px-4 mt-2">
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search"></i>
          <InputText :modelValue="search" @update:modelValue="debouncedFilter" class="w-full" placeholder="Rechercher" ref="inputFilter"
            size="small" />
        </span>
      </div>
    </template>
    <template #option="{ option, index }">
      <div :ref="(el) => conditionnalRef(el, index)">
        <SkeletonText v-if="option[selectLabel] === 'Chargement...'" @click.prevent.stop>
          {{ option[selectValue] }}
        </SkeletonText>
        <div v-else>
          {{ option[selectLabel] }}
        </div>
      </div>
    </template>
  </Dropdown>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import Dropdown from "primevue/dropdown";
import { useIntersectionObserver, useDebounceFn, useFocus } from '@vueuse/core'
import type { SelectValues } from "../../types"
import type { LaravelRequest, TPaginatedData } from "../../../datatable/types"
import SkeletonText from "../../../utils/SkeletonText.vue";
import { asyncTimeout } from "../../../utils/global";
import InputText from "primevue/inputtext";

const props = defineProps<{
  modelValue: SelectValues
  selectLabel: string
  selectValue: string
  filter?: boolean
  fetcher: (p: LaravelRequest) => Promise<TPaginatedData<any>>
  oneFetcher: (id: string | number) => Promise<any>
}>()

const emits = defineEmits<{
  (e: "update:modelValue", value: SelectValues): void
}>()

const target = ref(null)
const isLast = ref(false)
const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    if (typeof value === "string" && value.startsWith("___________"))
      return
    emits("update:modelValue", value)
  }
})

const options = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const loading = ref(false)
const total = ref(0)
const search = ref("")

const optionsWithSkel = computed(() => {
  const skelArray = Array.from({ length: !loading.value ? 0 : 5 }, (v, k) => ({
    [props.selectLabel]: 'Chargement...',
    [props.selectValue]: `_________________________________${k}`
  }))
  return options.value.concat(skelArray)
})

const getOptions = async (page: number, search = "") => {
  try {
    loading.value = true
    const _options = await props.fetcher({ page, limit: limit.value, sort: props.selectLabel, search })
    total.value = _options.last_page
    loading.value = false
    return _options.data
  } catch (error) {
    loading.value = false
    console.log(error)
  }
}

const onLazyLoad = async () => {
  if (page.value >= total.value) {
    isLast.value = true
    return
  }
  isLast.value = false
  page.value++
  const _options = await getOptions(page.value, search.value)
  options.value = options.value.concat(_options)
}

const conditionnalRef = (el: any, index: number) => {
  if (index !== options.value.length - 1) return
  target.value = el
}

useIntersectionObserver(
  target,
  ([{ isIntersecting }],) => {
    if (!isIntersecting) return
    onLazyLoad()
  },
)

const onFilter = async (value: string | undefined = "") => {
  loading.value = true
  search.value = value
  options.value = await getOptions(1, value) || []
  loading.value = false

}

const debouncedFilter = useDebounceFn(onFilter, 500)

const getLabelFromValue = async (id: unknown) => {
  if (typeof id !== "string" && typeof id !== "number")
    return ""
  const response = await props.oneFetcher(id)
  return response[props.selectLabel] || ""
}

onMounted(async () => {
  await asyncTimeout(100)
  if (props.modelValue) {
    search.value = await getLabelFromValue(props.modelValue)
  }
  options.value = await getOptions(page.value, search.value) || []
})

// focus
const inputFilter = ref()
const { focused } = useFocus(inputFilter)

</script>


<style scoped lang="scss"></style>
