import type { Ref } from 'vue'
import type { LocationQueryValue } from 'vue-router'
import type { TDynamicForm } from '../dynamicForm/types'

export type TDatatableHeader = {
  label: string
  id: string
  sortable?: boolean
  filter?: Partial<TDynamicForm>
  numeric?: boolean
  noWrapHeader?: boolean
  transformerFn?: (value: any) => any
}

export type TDatatableData = {
  [key: string]: any
}

type TLinkPaginatedResponse = {
  url: string | null
  label: string
  active: boolean
}

export type TPaginatedData<ListType> = {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: TLinkPaginatedResponse[];
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  [totalOrData: string]: ListType | number;
};

export type TGetParams = {
  page?: number
  limit?: number
  sort?: { asc: string; [key: string]: string }
  filter?: any
}

export type TPrimeTableRequestParams = {
  page: Ref<number>
  limit: Ref<number>
  sort?: Ref<LocationQueryValue | undefined>
  filter?: Ref<{ [key: string]: string } | undefined>
  search?: Ref<LocationQueryValue | undefined>
}

export type LaravelRequest = {
  page: number
  limit: number
  sort?: LocationQueryValue | undefined
  filter?: { [key: string]: string } | undefined
  search?: LocationQueryValue | undefined
}

export type DatatableSelectEvent = {
  type: 'selectRow' | 'selectAll' | 'unSelectRow' | 'unSelectAll'
  data: any[]
}