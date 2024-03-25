import type { TPaginatedData, LaravelRequest } from '../datatable/types'
import type { KeyString } from '../utils/types'

export type TDynamicForm = CommonType &
  (
    | Input
    | Select
    | Number
    | Checkbox
    | Radio
    | Template
    | Image
    | MultiSelect
    | TreeSelect
    | PaginatedLazySelect
    | Mask
  )

export type DynamicFormProps = {
  modelValue: TDynamicForm[]
  id: string
  submitLoading?: boolean
  getLoading?: boolean
  paginated?: boolean
  limit?: number
  submitLabel?: string
  submitIcon?: string
}

export type SelectValues = string | number | boolean

export type LabelValue = { label: string; value: SelectValues }

export type FileTypes = 'image' | 'video' | 'doc'

export type TempImgFromServer = { path: string; name: string; original_url?: string }
export type ImgFromServer = {
  id: number
  model_type: string
  model_id: number
  uuid: string
  collection_name: string
  name: string
  file_name: string
  mime_type: string
  disk: string
  conversions_disk: string
  size: number
  manipulations: []
  custom_properties: []
  generated_conversions: []
  responsive_images: []
  order_column: number
  created_at: string
  updated_at: string
  original_url: string
  preview_url: string
}

type FormId = TDynamicForm['id']
export type FormResult = { [key in FormId]: any }

export type PossibleFormType = TDynamicForm['type']

type CommonType = {
  id: string
  label: string
  validation?: ((value?: SelectValues) => boolean | string) | string
  containerClass: string
  disabled?: boolean
}

type Input = {
  type: 'input' | 'textarea' | 'date' | 'password'
  value: string
}

type Select = {
  type: 'select'
  selectOption: (KeyString | SelectValues)[]
  filter?: boolean
  value: SelectValues
  selectValue?: string
  selectLabel?: string
  virtualScrollerOptions?: { itemSize: number }
}

type PaginatedLazySelect = {
  type: 'lazyselect'
  selectLabel?: string
  selectValue?: string
  filter?: boolean
  value: SelectValues
  fetcher: (p: LaravelRequest) => Promise<TPaginatedData<any>>
  oneFetcher: (id: string | number) => Promise<any>
}

type TreeSelect = {
  type: 'treeselect'
  selectOption: (KeyString | SelectValues)[]
  filter?: boolean
  value: SelectValues
  selectLabel?: string
  selectValue?: string
  childrenKey?: string
}

type MultiSelect = {
  type: 'multiselect'
  selectOption: (KeyString | SelectValues)[]
  filter?: boolean
  value: SelectValues[]
  selectValue?: string
  selectLabel?: string
}

type Number = {
  type: 'number'
  value: number
  prefix?: string
  suffix?: string
}

interface Mask {
  type: 'mask'
  value: string
  mask?: string
  autoClear?: boolean
}

type Radio = {
  type: 'radio'
  selectOption: (KeyString | SelectValues)[]
  value: SelectValues
  alignement?: 'vertical' | 'horizontal'
  selectValue?: string
  selectLabel?: string
}

type Checkbox = {
  type: 'checkbox'
  selectOption: (KeyString | SelectValues)[]
  value: SelectValues[]
  alignement?: 'vertical' | 'horizontal'
  selectValue?: string
  selectLabel?: string
}

type Template = {
  type: 'template'
  value: any
  options?: any
}

type ImageValue = ImgFromServer | TempImgFromServer
export type InputFileModelValue = "formData" | "directUpload";

type DirectUpload = {
  valueType?: 'directUpload' | undefined
  uploader: (file: File) => Promise<TempImgFromServer>
  value?: ImageValue | ImageValue[]
}

type FormDataUpload = {
  valueType: "formData";
  uploader?: undefined;
  value?: File[];
};

type Image = {
  type: "file" | "filepond";
  fileType: FileTypes;
  deleter?: (file_id: number) => Promise<void>;
  allowMultiple?: boolean;
  readFiles?: ImgFromServer[];
  maxFileSize?: number;
  docPreviewImgUrl?: string;
  videoPreviewImgUrl?: string;
  reorderer?: (product_id: number, reordered_ids: number[]) => Promise<void>;
  invalidFileSizeMessage?: string;
  invalidFileTypeMessage?: string;
  fileLimit?: number;
  invalidFileLimitMessage?: string;
} & ( DirectUpload | FormDataUpload );
