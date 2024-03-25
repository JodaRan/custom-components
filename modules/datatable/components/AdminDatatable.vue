<template>
  <div>
    <div v-if="hasSearch || hasFilter || selection" class="flex justify-content-between align-items-center">
      <div v-if="hasSearch" class="my-2 w-full">
        <span class="p-input-icon-left w-full lg:w-4">
          <i class="pi pi-search"></i>
          <InputText v-model.trim="search" class="w-full" placeholder="Rechercher" />
        </span>
      </div>
      <div v-else>&nbsp;</div>
      <div class="flex gap-2">
        <div v-if="selection">
          <Button text @click="selectedData = []" title="Désélectionner tout">
            <template #icon>
              <MaterialIcon class="mr-1">deselect</MaterialIcon>
            </template>
          </Button>
        </div>
        <div v-if="hasFilter">
          <Button icon="pi pi-filter-slash" text @click="resetFilter()"></Button>
        </div>
      </div>
    </div>
    <DataTable :lazy="lazy" :value="dataToDisplay" :stripedRows="true" :loading="loading" class="w-full" paginator
      :rows="limit" :first="first" @page="onPage" :rowsPerPageOptions="[5, 10, 20, 50, 100]"
      :totalRecords="totalRecords" :size="size === 'medium' ? undefined : (size || 'small')"
      v-model:selection="selectedData" dataKey="id"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="{first} à {last} dans {totalRecords}" @sort="onSort" removableSort sortMode="multiple"
      :multiSortMeta="preSort" filterDisplay="menu" @filter="onFilter" v-model:filters="preFilters"
      @row-select="handleSelect.row" @row-select-all="handleSelect.all" @row-unselect="handleSelect.unRow"
      @row-unselect-all="handleSelect.unAll">
      <template #empty>
        <div class="flex w-full justify-content-center">
          {{ noDataText || 'Pas de données' }}
        </div>
      </template>
      <Column v-if="selection" selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column v-for="header in headers" :key="header.id" :field="header.id" :header="header.label"
        :header-class="header.noWrapHeader ? 'white-space-nowrap' : ''" :sortable="header.sortable"
        :show-filter-menu="!!header.filterType" :filter-field="header.id" :show-filter-match-modes="false"
        :dataType="header.filterType">

        <template #body="slotProps" v-if="slots[`item(${header.id})`] || header.transformerFn">
          <slot v-if="slots[`item(${header.id})`]" :name="`item(${header.id})`" v-bind="{ data: slotProps.data }">
          </slot>
          <template v-else-if="header.transformerFn">
            {{ header.transformerFn(slotProps.data[header.id]) }}
          </template>
        </template>

        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter"
            :placeholder="`Rechercher par ${header.label}`" size="small" />
        </template>

        <template #filterclear="{ filterCallback }">
          <Button type="button" icon="pi pi-times" @click="filterCallback()" severity="help" size="small"></Button>
        </template>

        <template #filterapply="{ filterCallback }">
          <Button type="button" icon="pi pi-check" @click="filterCallback()" severity="secondary" size="small"></Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import DataTable from 'primevue/datatable'
import type {
  DataTableFilterEvent,
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableSortMeta,
  DataTableFilterMeta,
  DataTableRowSelectEvent,
  DataTableRowSelectAllEvent,
  DataTableRowUnselectEvent,
} from 'primevue/datatable'
import { useToast } from 'primevue/usetoast'
import { useDebounce } from '@vueuse/core'
import { asyncTimeout, dynamicError, isArray } from '../../utils/global'
import type { TDatatableHeader, TPaginatedData, TPrimeTableRequestParams, DatatableSelectEvent } from "../types"
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NUMBER } from '../constants'
import type { KeyString } from "../../utils/types"
import MaterialIcon from "../../utils/MaterialIcon.vue"

// Props/slots
type TCommonProps = {
  headers: TDatatableHeader[]
  noDataText?: string
  hasSearch?: boolean
  size?: "small" | "medium" | "large"
  selection?: any[]
  selectionKey?: string
}

type TIsLazyProps = {
  lazy: true
  datas?: TPaginatedData<any[]>
  fetcher?: (params?: any) => Promise<TPaginatedData<any[]>>
  paramsFormatter?: (req: TPrimeTableRequestParams) => KeyString
  dataKey?: string
  totalKey?: string
}

type TIsNotLazyProps = {
  lazy?: false
  datas?: any[]
  fetcher?: (params?: any) => Promise<any[]>
}

export type TAdminDatatableProps = TCommonProps & (TIsLazyProps | TIsNotLazyProps)

const props = defineProps<TAdminDatatableProps>()

export type TAdminDatatableEmits = {
  (e: 'update:selection', value?: any[]): void
  (e: 'select', value?: DatatableSelectEvent): void
}

const emits = defineEmits<TAdminDatatableEmits>()

const slots = defineSlots()

// Data
const toast = useToast()
onMounted(async () => {
  refresh()
})

const formatToLaravelRequest = (req: TPrimeTableRequestParams) => {
  return {
    page: req.page.value + 1,
    pagination: req.limit.value,
    sort: req.sort?.value || undefined,
    search: route.query.search,
    ...(req.filter?.value || {})
  }
}

const formatGetter = props.lazy && props.paramsFormatter ? props.paramsFormatter : formatToLaravelRequest

const refresh = async () => {
  await asyncTimeout(50)
  try {
    if (!props.fetcher) return
    loading.value = true

    await props.fetcher(formatGetter({ page, limit, sort, filter }))
    loading.value = false
  } catch (error) {
    toast.add({ closable: false, life: 3000, severity: 'error', summary: dynamicError(error) })
    loading.value = false
  }
}

const dataToDisplay = computed<any[]>(() => {
  if (!props.lazy) return props.datas || []
  const data = props.datas?.[props.dataKey || "data"]
  return isArray(data) ? data : []
}
)

// Sort
const router = useRouter()
const route = useRoute()
const sort = computed<LocationQueryValue | undefined>(() => {
  if (!props.lazy || !route.query.sort) return
  if (typeof route.query.sort === 'string') return route.query.sort
  return route.query.sort[0]
})

const preSort = ref<DataTableSortMeta[]>()

onMounted(() => {
  preSort.value =
    !props.lazy || !route.query.sort
      ? []
      : typeof route.query.sort === 'string'
        ? Sort.toSortMeta(route.query.sort)
        : Sort.toSortMeta(route.query.sort[0])
})

const onSort = async (event: DataTableSortEvent) => {
  const sortFields = event.multiSortMeta?.map((field) => Sort.toReqString(field))?.join(',')
  router.push({ name: route.name || undefined, query: { ...route.query, sort: sortFields } })
  refresh()
}

class Sort {
  static toReqString({ field, order }: DataTableSortMeta): string | undefined {
    if (!field || !order || typeof order !== 'number') return
    return `${order > 0 ? '-' : ''}${field}`
  }

  static toSortMeta(string?: LocationQueryValue): DataTableSortMeta[] {
    if (!string) return []
    const sortMeta: DataTableSortMeta[] = string.split(',').map((el) => ({
      order: el.startsWith('-') ? -1 : 1,
      field: el.startsWith('-') ? el.substring(1) : el
    }))

    return sortMeta
  }
}

// Pagination
const totalRecords = computed<number | undefined>(() => {
  if (!props.lazy) return undefined
  const total = props.datas?.[props.totalKey || "total"]
  return typeof total === "number" ? total : undefined
})

const page = computed<number>(() => {
  return props.lazy ? +(route.query.page || DEFAULT_PAGE_NUMBER) : DEFAULT_PAGE_NUMBER
})
const first = computed<number>(() => page.value * limit.value)
const limit = computed<number>(() => {
  return props.lazy ? +(route.query.limit || DEFAULT_PAGE_LIMIT) : DEFAULT_PAGE_LIMIT
})

const onPage = async (event: DataTablePageEvent) => {
  const { page, rows } = event
  router.push({ name: route.name || undefined, query: { ...route.query, page, limit: rows } })
  refresh()
}

// Search
const search = ref<string>('')
const debouncedSearch = useDebounce(search, 500)

const searchFn = async (search: string) => {
  router.push({ name: route.name || undefined, query: { ...route.query, search } })
  refresh()
}

watch(debouncedSearch, searchFn)

// Filter
const hasFilter = computed<boolean | undefined>(() => {
  return props.headers.some((header) => header.filterType)
})

const filterableHeaders = computed(() => props.headers.filter((el) => el.filterType))

const filter = ref<{ [key: string]: string }>()

const preFilters = ref<DataTableFilterMeta | undefined>()

class Filter {
  static toReq({ filters }: DataTableFilterEvent): { [key: string]: string } {
    return Object.entries(filters).reduce((acc, [filterKey, filterValue]) => {
      return {
        ...acc,
        [`filter[${filterKey}]`]:
          typeof filterValue !== 'string' && 'value' in filterValue
            ? filterValue.value
            : filterValue
      }
    }, {})
  }

  static toPrimeVueFilter() {
    filter.value = Object.entries(route.query)
      .filter(([key]) => /filter\[(\w+)\]/.test(key))
      .reduce((acc, [key, value]) => {
        return { ...acc, [key]: value }
      }, {})
  }

  static resetFilter() {
    filter.value = Object.entries(route.query)
      .filter(([key]) => /filter\[(\w+)\]/.test(key))
      .reduce((acc, [key]) => {
        return { ...acc, [key]: '' }
      }, {})
  }
}

const resetFilter = async () => {
  Filter.resetFilter()
  initFilters()
  router.push({ name: route.name || undefined, query: { ...route.query, ...filter.value } })
  await refresh()
}

const initFilters = () => {
  preFilters.value = filterableHeaders.value.reduce((acc, curr) => {
    const value = filter.value?.[`filter[${curr.id}]`]
    return { ...acc, [curr.id]: { value, matchMode: 'contains' } }
  }, {})
}

const onFilter = async (event: DataTableFilterEvent) => {
  filter.value = Filter.toReq(event)
  router.push({ name: route.name || undefined, query: { ...route.query, ...filter.value } })
  await refresh()
}

onMounted(() => {
  Filter.toPrimeVueFilter()
  initFilters()
})

// Select
const selectedData = computed({
  get() {
    return props.selectionKey
      ? props.selection?.map((id) =>
        dataToDisplay.value?.find(data =>
          data[props.selectionKey || 'id'] === id
        ) || { id }
      ) : props.selection
  },
  set(value) {
    const _value = props.selectionKey
      ? value?.map((val) => val[props.selectionKey || 'id'])
      : value
    emits("update:selection", _value)
  }
})

const handleSelect = {
  row: (event: DataTableRowSelectEvent) => {
    const data = [event.data]
    emits("select", { type: "selectRow", data })
  },
  all: (event: DataTableRowSelectAllEvent) => {
    const data = isArray(event.data) ? event.data : []
    emits("select", { type: "selectAll", data })
  },
  unRow: (event: DataTableRowUnselectEvent) => {
    const data = [event.data]
    emits("select", { type: "unSelectRow", data })
  },
  unAll: () => {
    emits("select", { type: "unSelectAll", data: [] })
  },
}

// Loading
const loading = ref<boolean>(false)

// Expose refresh
defineExpose({
  refresh
})
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  max-height: 700px;
  transition: max-height 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  max-height: 0;
  overflow: hidden;
}
</style>
