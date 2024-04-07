import type { ImgFromServer, TDynamicForm } from '../types'

export function useIdFor(propId: string, item: TDynamicForm) {
  return `${propId}-${item.id}`
}

export function useHydrateAttr(
  propId: string,
  item: TDynamicForm,
  errors?: Partial<Record<string, string | undefined>>
) {
  const isInvalid = !!errors?.[item.id]
  const invalidClass = isInvalid ? 'p-invalid' : ''
  const conditionnalInputClass =
    item.type === 'input' || item.type === 'textarea' ? item.inputClass : ''
  const returnValue = {
    class: `w-full ${invalidClass} ${conditionnalInputClass}`,
    id: useIdFor(propId, item),
    disabled: !!item.disabled,
    placeholder: item.placeholder
  }
  if (item.type === 'date')
    return {
      ...returnValue,
      pt: { input: { id: useIdFor(propId, item), class: item.inputClass } },
      id: null
    }
  if (item.type === 'number')
    return {
      ...returnValue,
      type: 'number',
      inputClass: `w-full ${item.inputClass}`,
      inputId: useIdFor(propId, item),
      id: null,
      useGrouping: true,
      invalid: isInvalid
    }
  if (item.type === 'password')
    return {
      ...returnValue,
      toggleMask: true,
      feedback: false,
      inputClass: `w-full ${item.inputClass}`,
      pt: { input: { autocomplete: 'current-password' } },
      inputId: useIdFor(propId, item),
      id: null,
      invalid: isInvalid
    }
  if (item.type === 'mask')
    return {
      ...returnValue,
      autoClear: item.autoClear || true,
      mask: item.mask,
      inputClass: `w-full ${item.inputClass}`,
      id: useIdFor(propId, item)
    }
  if (item.type === 'select')
    return {
      ...returnValue,
      options: item.selectOption,
      optionValue: typeof item.selectOption[0] !== 'string' ? item.selectValue || 'value' : null,
      optionLabel: typeof item.selectOption[0] !== 'string' ? item.selectLabel || 'label' : null,
      inputClass: `w-full ${item.inputClass}`,
      inputId: useIdFor(propId, item),
      filter: item.filter,
      id: null,
      invalid: isInvalid
    }
  if (item.type === 'multiselect')
    return {
      ...returnValue,
      options: item.selectOption,
      optionValue: typeof item.selectOption[0] !== 'string' ? item.selectValue || 'value' : null,
      optionLabel: typeof item.selectOption[0] !== 'string' ? item.selectLabel || 'label' : null,
      inputClass: `w-full ${item.inputClass}`,
      inputId: useIdFor(propId, item),
      filter: item.filter,
      id: null,
      invalid: isInvalid,
      emptyFilterMessage: 'Pas de résultat',
      display: 'chip'
    }
  if (item.type === 'treeselect')
    return {
      ...returnValue,
      options: item.selectOption,
      invalid: isInvalid,
      inputClass: `w-full ${item.inputClass}`,
      selectLabel: item.selectLabel,
      selectValue: item.selectValue,
      childrenKey: item.childrenKey,
      inputId: useIdFor(propId, item),
      id: null
    }
  if (item.type === 'lazyselect')
    return {
      ...returnValue,
      invalid: isInvalid,
      inputClass: `w-full ${item.inputClass}`,
      selectLabel: item.selectLabel,
      selectValue: item.selectValue,
      filter: item.filter,
      fetcher: item.fetcher,
      oneFetcher: item.oneFetcher,
      inputId: useIdFor(propId, item),
      id: null
    }
  if (item.type === 'radio')
    return {
      ...returnValue,
      alignement: item.alignement,
      options: item.selectOption,
      invalid: isInvalid,
      selectLabel: item.selectLabel,
      selectValue: item.selectValue
    }
  if (item.type === 'checkbox')
    return {
      ...returnValue,
      alignement: item.alignement,
      options: item.selectOption,
      invalid: isInvalid,
      selectLabel: item.selectLabel,
      selectValue: item.selectValue
    }
  if (item.type === 'file')
    return {
      ...returnValue,
      allowMultiple: item.allowMultiple,
      readFiles: item.readFiles || [],
      docPreviewImgUrl: item.docPreviewImgUrl || '/images/Doc.jpg',
      videoPreviewImgUrl: item.videoPreviewImgUrl || '/images/Video.jpg',
      uploader: item.uploader,
      deleter: item.deleter,
      reorderer: item.reorderer,
      acceptedFileTypes: item.fileType,
      invalidFileTypeMessage: item.invalidFileTypeMessage,
      maxFileSize: item.maxFileSize,
      invalidFileSizeMessage: item.invalidFileSizeMessage,
      fileLimit: item.fileLimit,
      invalidFileLimitMessage: item.invalidFileLimitMessage,
      valueType: item.valueType
    }
  return returnValue
}

export function useHydrateOn(item?: TDynamicForm) {
  const defaultOns = {}
  if (!item) return defaultOns
  if (item.type === 'file')
    return {
      ...defaultOns,
      'update:readFiles': (evt: ImgFromServer[]) => {
        item.readFiles = evt
      }
    }
  return defaultOns
}
