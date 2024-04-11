<template>
    <div>
        <DataView :value="dataToDisplay" data-key="id" paginator :rows="limit" :lazy="true" @page="onPage"
            :total-records="totalRecords" :alwaysShowPaginator="false" :pt="{
            header: { class: 'p-0 pb-2 border-none bg-transparent' },
            content: { class: 'bg-transparent' },
            paginator: { class: 'bg-transparent' }
        }" :first="first"
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{currentPage} sur {totalPages}" :layout="layout">
            <template #header>
                <div class="flex justify-content-between">
                    <Dropdown v-model="sort" :options="sortOptions" optionLabel="label" placeholder="Tri"
                        v-if="sortOptions" @change="onSortChange" option-value="value" input-class="p-inputtext-sm" />
                    <DataViewLayoutOptions v-if="hasOptions"
                        :pt="{ listButton: { class: 'p-button-sm' }, gridButton: { class: 'p-button-sm' } }"
                        v-model="layout" />
                </div>
            </template>
            <template #list="slotProps">
                <div v-if="!slots.list">
                    <div class="border-1 border-gray-300 border-round-sm p-2 mb-2" v-for="item in slotProps.items"
                        :key="item.id">
                        <InlineMessage severity="info">
                            Mettez un template #list={ items } dans le composant
                        </InlineMessage>
                        <div>Liste des clés dispo : {{ Object.keys(item).join(", ") }}.</div>
                    </div>
                </div>
                <div v-else>
                    <slot name="list" v-bind="slotProps"></slot>
                </div>
            </template>
            <template #grid="slotProps">
                <div v-if="!slots.grid">
                    <div class="grid">
                        <div v-for="(item, index) in slotProps.items" :key="index"
                            class="col-12 sm:col-6 md:col-6 xl:col-4">
                            <div class="border-1 border-gray-300 border-round-sm p-2">
                                <InlineMessage severity="info">
                                    Mettez un template #grid={ items } dans le composant
                                </InlineMessage>
                                <div>Liste des clés dispo : {{ Object.keys(item).join(", ") }}.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <slot name="grid" v-bind="slotProps"></slot>
                </div>
            </template>
        </DataView>
    </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataView, { type DataViewPageEvent } from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
import InlineMessage from 'primevue/inlinemessage';
import { useToast } from 'primevue/usetoast';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NUMBER } from '../datatable/constants';
import type { TPaginatedData, TPrimeTableRequestParams } from '../datatable/types';
import { asyncTimeout, dynamicError, isArray } from '../utils/global';
import type { KeyString } from '../utils/types';
import type { LabelValue } from '../dynamicForm/types';

// Global
const route = useRoute()
const router = useRouter()
const toast = useToast()

// Props/slots
type TCommonProps = {
    noDataText?: string
    hasSearch?: boolean
    size?: "small" | "medium" | "large"
    selection?: any[]
    selectionKey?: string
    noFirstFetch?: boolean | undefined
    hasOptions?: boolean
    sortOptions?: LabelValue[]
    noRouterChange?: boolean
    perPage?: number
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

export type TDataViewProps = TCommonProps & (TIsLazyProps | TIsNotLazyProps)
const props = defineProps<TDataViewProps>()

const slots = defineSlots()

// Read // Get
const loading = ref<boolean>(false)
onMounted(async () => {
    if (props.noFirstFetch) return
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

const formatGetter = props.lazy && props.paramsFormatter ? props.paramsFormatter : formatToLaravelRequest;

const refresh = async () => {
    await asyncTimeout(50)
    try {
        if (!props.fetcher) return
        loading.value = true

        await props.fetcher(formatGetter({ page, limit, sort, /* filter */ }))
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

// Sorting
const sortRef = ref()
const sort = computed({
    get() {
        if (props.noRouterChange) return sortRef.value
        return route.query.sort || ""
    },
    async set(sort) {
        if (props.noRouterChange) {
            sortRef.value = sort
            return
        }
        await asyncTimeout(25)
        router.push({ name: route.name || undefined, query: { ...route.query, sort } })
    }
})

const onSortChange = () => {
    refresh()
}


// Pagination
const totalRecords = computed<number | undefined>(() => {
    if (!props.lazy) return undefined
    const total = props.datas?.[props.totalKey || "total"]
    return typeof total === "number" ? total : undefined
})

const perPage = computed(() => props.perPage || DEFAULT_PAGE_LIMIT)

const pageRef = ref(0)
const page = computed<number>({
    // if the props noRouterChange is true, the pagination doesn't change the route
    get() {
        if (props.noRouterChange) return pageRef.value
        return props.lazy ? +(route.query.page || DEFAULT_PAGE_NUMBER) : DEFAULT_PAGE_NUMBER
    },
    async set(page) {
        if (props.noRouterChange) {
            pageRef.value = page
            return
        }
        await asyncTimeout(25)
        router.push({ name: route.name || undefined, query: { ...route.query, page } })
    },
})

const limitRef = ref(0)
const limit = computed<number>({
    get() {
        if (props.noRouterChange) return limitRef.value || perPage.value
        return props.lazy ? +(route.query.limit || perPage.value) : perPage.value
    },
    async set(limit) {
        if (props.noRouterChange) {
            limitRef.value = limit
            return
        }
        await asyncTimeout(25)
        router.push({ name: route.name || undefined, query: { ...route.query, limit } })
    },
})

const first = computed<number>(() => page.value * limit.value)

const onPage = async (event: DataViewPageEvent) => {
    const { page: pageEvt, rows } = event
    page.value = pageEvt
    limit.value = rows
    refresh()
}

// Layout
const layout = ref<"grid" | "list">("list")


// Expose refresh
defineExpose({
    refresh
})

</script>


<style lang="scss">
.p-dataview .p-paginator {
    background-color: transparent;
}

</style>