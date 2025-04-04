import { defineNuxtPlugin } from '#app'
import feather from 'feather-icons'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('feather', feather)
})