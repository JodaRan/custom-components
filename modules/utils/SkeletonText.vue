<template>
    <div class="is-loading w-100">
        <slot></slot>
    </div>
</template>


<script setup lang="ts">

</script>


<style scoped lang="scss">
.is-loading {
    background-color: #E5E7EB;
    color:#E5E7EB;
    border-radius: 5px;
    background-size: 200% 100%;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        background-color: #E5E7EB;
        color: #E5E7EB;
    }

    50% {
        background-color: hsl(220, 13%, 98%);
        color: hsl(220, 13%, 98%);
        ;
    }

    100% {
        background-color: #E5E7EB;
        color: #E5E7EB;
    }
}
</style>