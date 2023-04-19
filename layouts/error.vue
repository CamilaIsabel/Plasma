<template>
  <div>
    <h1 class="text-7xl text-center mt-24">{{ error.statusCode }}</h1>
    <h2 class="text-lg text-center mt-4">Ha ocurrido un error 😟</h2>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: () => {},
    },
  },
};
</script>
