<template>
    <Carousel v-if="(images?.length || 0) > 1" :value="images" :numVisible="1" :numScroll="1" circular :autoplayInterval="3000"
        orientation="vertical" verticalViewPortHeight="75px" :show-indicators="false" :show-navigators="false">
        <template #item="{ data: carouselData }">
            <img :src="carouselData?.[srcKey]" :alt="carouselData?.[altKey || ''] || 'image'" width="70" height="70"
                class="object-cover border-round-md">
        </template>
    </Carousel>
    <div v-else>
        <img :src="images?.[0]?.[srcKey] || DEFAULT_PRODUCT_IMAGE" :alt="images?.[0]?.[altKey || ''] || 'image'" width="70" height="70"
            class="object-cover border-round-md">
    </div>
</template>


<script setup lang="ts">
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/media";
import Carousel from "primevue/carousel"
type Keys = {
    srcKey: string
    altKey?: string
}

type ImageToView = {
    [key: Keys["srcKey"]]: string | undefined
}

type ImageViewerProps = {
    images?: ImageToView[]
    srcKey: string
    altKey?: string
}

defineProps<ImageViewerProps>()
</script>


<style scoped lang="scss"></style>