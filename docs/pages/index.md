# Getting started

## Installation
::: warning
These components rely heavily on **Vue** and **Primevue**
:::
First, run the following command to install the dependencies needed : 

```bash
npm i @vee-validate/rules @vueuse/core filepond filepond-plugin-file-validate-type filepond-plugin-image-preview primeflex primeicons primevue vee-validate vue@>=3.3.11 vue-filepond vue-router vuedraggable@>=4.1.0
```

## Configuration

### Vue 3

Insert these lines into your main.js/main.ts file :

```js
...
import router from './router'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'
...
app.use(router)
app.use(PrimeVue)
...

```
Don't forget to put the css theme file you need for primevue components

### Nuxt 3

Install nuxt-primevue first :

```bash
npm install --save-dev nuxt-primevue
```
Then, add nuxt-primevue to your nuxt.config file

```js
// nuxt.config.js/nuxt.config.ts
...
modules: [..., "nuxt-primevue"],
...
```

## Components avalaible

### Datatable

A datatable that speeds up the development of dashboard. JavaScript object as input,  columns and rows as output. It can be lazy or not. It's **always** paginated.

### Dynamic form

A dynamic form that accepts javascript object as input and render a form accordingly to it.

### Dynamic modal

A modal that is a child of the dynamic form. Globally same parameters.