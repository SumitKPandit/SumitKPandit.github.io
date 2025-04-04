<template>
    <span v-html="icon" class="feather-icon inline-block"></span>
  </template>
  
  <script setup>
  const { $feather } = useNuxtApp()
  const props = defineProps({
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 24
    }
  })
  
  const icon = computed(() => {
    return $feather.icons[props.name].toSvg({
      width: props.size,
      height: props.size,
      'stroke-width': 2
    })
  })
  </script>
  
  <style>
  .feather-icon svg {
    display: inline-block;
    vertical-align: middle;
  }
  </style>