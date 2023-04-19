<template>
  <Button
    class="flex flex-row items-center justify-center px-8 rounded-lg font-bold shadow-md py-4 bg-blue-600 text-white"
    @click="$emit('refresh')"
  >
    <img
      src="/svg/refresh.svg"
      height="24"
      width="24"
      class="block mr-2 -mt-1"
    />
    Refrescar
  </Button>
</template>

<script>
export default {};
</script>

<style></style>
