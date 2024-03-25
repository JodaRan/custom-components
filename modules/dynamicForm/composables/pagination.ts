import type { TDynamicForm } from '../types'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()

export function useFormPagination(
  form: TDynamicForm[],
  isPaginated: boolean = false,
  fieldLimit?: number
) {
  const route = useRoute()
  const limit = computed(() => fieldLimit || 0)
  const totalPage = computed(() => (limit.value > 0 ? Math.ceil(form.length / limit.value) : 0))
  const first = computed(() => (page.value - 1) * limit.value)
  const last = computed(() => first.value + limit.value)

  const showItem = (id: number) => !isPaginated || (id >= first.value && id < last.value)
  const page = computed({
    get: () => +(route.query.page || 1),
    set: (value) =>
      router.push({ name: route.name || undefined, query: { ...route.query, page: value } })
  })

  const hasPrev = computed(() => isPaginated && page.value > 1)
  const hasNext = computed(() => isPaginated && page.value < totalPage.value)

  const goToPage = (p: number) => {
    if (p <= totalPage.value && p > 0) page.value = p
  }

  const prevPage = () => {
    if (hasPrev.value) page.value--
  }
  const nextPage = () => {
    if (hasNext.value) page.value++
  }

  const paginatedForm = computed(() => form.filter((el, id) => showItem(id)))

  const activeStep = computed(() => page.value - 1)
  const stepper = computed(() =>
    Array.from({ length: totalPage.value }, (_, k) => k).map((el) => ({ label: `Etape ${el + 1}` }))
  )

  return {
    prevPage,
    nextPage,
    goToPage,
    paginatedForm,
    activeStep,
    stepper,
    hasPrev,
    hasNext,
    limit,
    totalPage
  }
}
