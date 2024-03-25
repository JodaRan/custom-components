import type { TDynamicForm } from "../types"

export function useFillFormKey(
  formToFill: TDynamicForm[],
  fieldId: string,
  fieldKey: string,
  filler: any
) {
  const index = formToFill.findIndex((el) => el.id === fieldId)
  if (!formToFill[index]) return
  // if (!Object.prototype.hasOwnProperty.call(formToFill[index], fieldKey)) return
  if (formToFill[index].type === 'number') {
    formToFill[index][fieldKey] = Number(filler)
    return
  }
  formToFill[index][fieldKey] = filler
}

export function usePrefillForm(formToFill: TDynamicForm[], formBack?: { [key: string]: any }) {
  if (typeof formBack !== 'object' || !formBack) return
  Object.keys(formBack).forEach((key) => {
    useFillFormKey(formToFill, key, 'value', formBack[key])
  })
}

export function getOneValueFromKey(formToFetch: TDynamicForm[], fieldId: string, fieldKey: string) {
  const form = formToFetch.find((el) => el.id === fieldId)
  if (!form) return
  return form[fieldKey]
}

export function getOneFormValue(formToFetch: TDynamicForm[], fieldId: string) {
  return getOneValueFromKey(formToFetch, fieldId, 'value')
}
