<template>
  <nuxt-link
    :to="url"
    class="w-40 h-40 md:h-60 md:w-60 2xl:w-72 2xl:h-72 flex items-center flex-col justify-center rounded-xl shadow-lucas bg-gray-800 text-white md:m-4 m-1"
  >
    <img :src="icon" class="block w-1/3 h-auto mt-auto mb-auto" />
    <label class="2xl:text-2xl md:text-xl text-md md:mb-6 mb-2 text-center">{{
      label
    }}</label>
  </nuxt-link>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      default: "/",
    },
    label: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
  },
};
</script>
