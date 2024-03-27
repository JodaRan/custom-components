# Datatable usage example

## Example with *ref*

```vue
<!-- RecipeList.vue -->
<template>
    <div>
        <AdminDatatable 
            :lazy="true" 
            :headers="headers" 
            :datas="recipes"
            :fetcher="getRecipes" 
            dataKey="recipes" 
            :paramsFormatter="paramsFormatter"
        >
        </AdminDatatable>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from "axios"
import AdminDatatable from '@/modules/datatable/components/AdminDatatable.vue';
import type { 
    TDatatableHeader, 
    TPrimeTableRequestParams, 
    TGetParams 
} from '@/modules/datatable/types';

const recipes = ref({})

const getRecipes = async (params: TGetParams) => {
    const response = await axios.get('https://dummyjson.com/recipes', { params })
    recipes.value = response.data
    return response.data
}

const headers = ref<TDatatableHeader[]>([
    { id: "name", label: "Nom"},
    { 
        id: "prepTimeMinutes", 
        label: "Temps de préparation", 
        transformerFn: (data) => `${data} min` 
    },
    { id: "difficulty", label: "Difficulté"},
    { id: "cuisine", label: "Cuisine"},
])

const paramsFormatter = (req: TPrimeTableRequestParams) => {
    return {
        limit: req.limit.value,
        skip: req.page.value * req.limit.value
    }
}
</script>
```
The data example in <https://dummyjson.com/recipes>

```json
{ 
    "recipes": [
        {
            "name": "Spaghetti Bolognese",
            "prepTimeMinutes": 45,
            "difficulty": "Easy",
            "cuisine": "Italian"
        },
        ...
    ], 
    "total": 80
    ...
}
```

In this example, we fake the data because we only want to show how to use the header.
Briefly these are the most basic example for datatable : 

- **lazy** : Type <u>boolean</u>. It represents the way to fetch data, *true* if paginated data, *false* if not;
- **headers** : Type <!-- TODO -->[TDatatableHeader[]](#). It render the columns to display, the most basic keys required to a column to be displayed is `{ id: "name", label: "Nom" }`, *id* is the key from backend or object to display, *label* is the header to show;
- **datas** : Type <u>any[]</u>. The data (paginated or not) list to be displayed. Depending of **lazy** value, if true, it has to be object that has at least two keys : the data to be displayed (array of objects recipes here) and the total count, else, it only want an array of objects;
- **fetcher** : Fetcher is a promise that update the *datas* and has argument *params* for search, filter, sort and pagination;
- **dataKeys** : Type <u>string</u>. The key of *datas* that contains the array of objects to be displayed;
- **paramsFormatter** : Type <code>(req: <!-- TODO -->[TPrimeTableRequestParams](#)) => { [key: string]: any }</code>. A function that transform the params from *fetcher*, the default is like the [laravel spatie](https://spatie.be/docs/laravel-query-builder/v5/introduction) params format ([pagination](https://spatie.be/docs/laravel-query-builder/v5/advanced-usage/pagination), search, [filter](https://spatie.be/docs/laravel-query-builder/v5/features/filtering), [sort](https://spatie.be/docs/laravel-query-builder/v5/features/sorting)).

## Example with *pinia*

```vue
<!-- Recipes.vue -->
<template>
    <div>
        <AdminDatatable 
            :lazy="true" 
            :headers="headers" 
            :fetcher="recipeStore.getFakeRecipes" 
            dataKey="recipes" 
            :datas="recipes"
            :paramsFormatter="paramsFormatter"
        >
        </AdminDatatable>
    </div>
</template>


<script setup lang="ts">
import AdminDatatable from '@/modules/datatable/components/AdminDatatable.vue';
import type { TDatatableHeader, TPrimeTableRequestParams } from '@/modules/datatable/types';
import { useRecipeStore } from '@/stores/fake/recipe';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
const recipeStore = useRecipeStore()
const { recipes } = storeToRefs(recipeStore)
const headers = ref<TDatatableHeader[]>([
    { id: "name", label: "Nom"},
    { id: "prepTimeMinutes", label: "Temps de préparation", transformerFn: (data) => `${data} min` },
    { id: "cookTimeMinutes", label: "Temps de cuisson", transformerFn: (data) => `${data} min`},
    { id: "difficulty", label: "Difficulté"},
    { id: "cuisine", label: "Cuisine"},
    { id: "caloriesPerServing", label: "Calories", transformerFn: (data) => `${data} / part`},
])
const paramsFormatter = (req: TPrimeTableRequestParams) => {
    return {
        limit: req.limit.value,
        skip: req.page.value * req.limit.value
    }
}
</script>
```
Here's the store : 

```ts
// stores/fake/recipe.ts
import type { TGetParams, TPaginatedData } from "@/modules/datatable/types";
import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useRecipeStore = defineStore("recipeStore", () => {
    const recipes = ref<TPaginatedData<any[]>>()
    const getFakeRecipes = async (params?: TGetParams) => {
        try {
            const response = await axios.get('https://dummyjson.com/recipes', { params })
            recipes.value = response.data
            return response.data
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    return {
      recipes,
      getFakeRecipes,
      pending
    }
})
```

The principle is that the *fetcher* is a function that update the *datas*.
