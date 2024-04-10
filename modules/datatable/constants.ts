import type { KeyString } from "../utils/types";
import type { TDatatableHeader } from './types'

export const DEFAULT_PAGE_NUMBER = 0
export const DEFAULT_PAGE_LIMIT = 10
export const DATATABLE_FILTER_STRING: TDatatableHeader['filter'] = {
  type: 'input'
}
export const DATATABLE_FILTER_NUMBER: TDatatableHeader['filter'] = {
  type: 'number'
}

export const DATATABLE_FILTER_STATUS = (status: KeyString) => ({
  type: 'select',
  selectOption: status
})
