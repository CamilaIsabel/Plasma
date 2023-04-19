<template>
  <div
    :class="paga ? 'bg-greeny' : 'bg-pinky'"
    class="my-4 rounded shadow-product md:h-24 text-sm md:text-base 2xl:text-lg items-center justify-between md:justify-start px-3 py-4 tracking-wide flex flex-row md:grid-flow-row flex-wrap md:grid grid-rows-2 md:grid-rows-1 factura-rows"
  >
    <div
      class="w-full flex flex-row h-full items-center justify-start md:pr-2 col-span-4 md:col-span-1 mb-4 md:mb-0 min-w-0"
    >
      <h1
        class="text-xl max-w-3xl font-semibold w-full md:truncate break-all md:break-normal"
      >
        {{ customer }}
      </h1>
    </div>
    <div>
      {{ date != null ? date.toDate().toLocaleDateString() : "No definida" }}
    </div>
    <div class="uppercase font-semibold">
      {{ paga ? "Paga" : "Impaga" }}
    </div>
    <div class="flex flex-row items-center justify-end">
      <nuxt-link
        :to="'/facturas/' + id"
        title="Configurar"
        class="w-8 h-8 mr-2 block"
      >
        <img class="h-full block" src="/svg/tuerca.svg" alt="Configurar" />
      </nuxt-link>
      <button title="Eliminar" class="w-8 h-8" @click="$emit('delete', id)">
        <img
          class="h-full block mx-auto"
          src="/svg/borrar.svg"
          alt="Eliminar"
        />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: "",
    },
    date: {
      type: Object,
      default: null,
    },
    paga: {
      type: Boolean,
      default: false,
    },
    customer: {
      type: String,
      default: "Sin nombre",
    },
  },
};
</script>

<style></style>
