<template>
  <button
    :type="type"
    class="focus:outline-none focus:ring uppercase tracking-widest flex flex-row items-center text-center justify-center disabled:opacity-75"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "button",
    },
  },
};
</script>

<style lang="css" scoped>
.button-md {
  @apply py-4 px-7 text-lg font-bold rounded-xl;
}

.button-lg {
  @apply py-5 px-10 text-lg font-bold rounded-2xl;
}
</style>
