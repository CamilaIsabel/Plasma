<template>
  <div
    class="bg-white my-4 rounded shadow-product md:h-24 text-sm md:text-base 2xl:text-lg items-center justify-between md:justify-start px-3 py-4 tracking-wide flex flex-row md:grid-flow-row flex-wrap md:grid grid-rows-2 md:grid-rows-1 gasto-rows"
  >
    <div
      class="w-full flex flex-row h-full items-center justify-start md:pr-2 col-span-4 md:col-span-1 mb-4 md:mb-0 min-w-0"
    >
      <img :src="image" class="h-24 md:h-full block" />
      <h1
        class="ml-4 text-xl max-w-3xl font-semibold w-full md:truncate break-all md:break-normal"
      >
        {{ displayName }}
      </h1>
    </div>
    <div class="text-center font-semibold">
      {{ amount }}
    </div>
    <div class="uppercase font-semibold text-center">
      {{ dateString }}
    </div>
    <div class="uppercase font-semibold text-center">$ {{ buyPrice }}</div>
    <div class="flex flex-row items-center justify-end">
      <button class="action-button" title="Editar" @click="$emit('edit', id)">
        <img class="h-full block" src="/svg/editar.svg" alt="Editar" />
      </button>
      <button
        title="Eliminar"
        class="action-button md:ml-2"
        @click="$emit('delete', id)"
      >
        <img class="h-full block" src="/svg/borrar.svg" alt="Eliminar" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    image: {
      type: String,
      default: "/sin-imagen.jpg",
    },
    displayName: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      default: 0,
    },
    buyPrice: {
      type: Number,
      default: 0,
    },
    date: {
      type: [Object, Date],
      default: null,
    },
  },
  computed: {
    dateString() {
      let date = this.date;
      if (typeof this.date.toDate === "function") {
        date = this.date.toDate();
      }

      return date.toLocaleDateString();
    },
  },
};
</script>

<style></style>
