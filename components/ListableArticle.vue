<template>
  <div
    :class="selected ? 'bg-green-200' : 'bg-white'"
    class="my-4 rounded shadow-product md:h-24 text-sm md:text-sm 2xl:text-lg items-center justify-between md:justify-start px-3 py-4 tracking-wide flex flex-row md:grid-flow-row flex-wrap md:grid grid-rows-2 md:grid-rows-1"
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
    <div
      v-if="showPrice"
      class="md:ml-4 text-center truncate min-w-0 w-full mb-4 md:mb-0 md:w-auto px-2 md:px-0"
    >
      <span
        class="rounded-full text-lg block tracking-tight sm:px-1 xl:px-5 py-1 md:py-2 font-semibold truncate"
      >
        $ {{ price }}
      </span>
    </div>
    <div
      class="md:ml-4 text-center truncate min-w-0 w-1/2 md:w-auto px-2 md:px-0"
    >
      <span class="md:hidden text-xs font-bold mb-2 block uppercase"
        >Código</span
      >
      <span
        class="rounded-full block tracking-tight bg-gray-300 text-black sm:px-1 xl:px-5 py-1 md:py-2 font-semibold truncate"
      >
        {{ code }}
      </span>
    </div>
    <div class="md:ml-4 text-center truncate w-1/2 md:w-auto px-2 md:px-0">
      <span class="md:hidden text-xs font-bold mb-2 block uppercase"
        >Stock</span
      >
      <span
        :class="
          stock > 0 ? 'border-black text-black' : 'border-red-500 text-red-500'
        "
        class="rounded-full w-full block tracking-tight border sm:px-1 lg:px-5 py-1 md:py-2 font-semibold truncate"
      >
        {{ stock }}
      </span>
    </div>
    <div
      class="w-1/3 md:w-auto md:ml-4 py-2 h-full flex flex-col items-center justify-center"
    >
      <div
        v-if="amountDamaged > 0"
        class="h-8 md:h-full mx-auto relative z-0 -bottom-2"
        title="Daños"
      >
        <img class="h-full mx-auto block" alt="Daños" src="/svg/damaged.svg" />
        <span
          class="rounded-full bg-red-500 text-white absolute px-2 flex items-center justify-center text-right -top-4 md:-top-6 left-6"
        >
          {{ amountDamaged }}
        </span>
      </div>
    </div>
    <div
      class="mt-4 md:mt-0 w-1/4 md:w-auto md:ml-4 flex flex-row justify-around"
    >
      <button
        v-if="buttons.includes('edit')"
        class="action-button"
        title="Editar"
        @click="$emit('edit', code)"
      >
        <img class="h-full block" src="/svg/editar.svg" alt="Editar" />
      </button>
      <button
        v-if="buttons.includes('delete')"
        title="Eliminar"
        class="action-button md:ml-2"
        @click="$emit('delete', code)"
      >
        <img class="h-full block" src="/svg/borrar.svg" alt="Eliminar" />
      </button>
      <button
        v-if="buttons.includes('buy') && !selected"
        title="Agregar"
        class="action-button md:ml-2"
        @click="toggleSelection"
      >
        <img
          class="h-full block"
          src="/svg/comprar-articulo.svg"
          alt="Agregar"
        />
      </button>
      <button
        v-if="buttons.includes('buy') && selected"
        title="Deseleccionar"
        class="action-button md:ml-2"
        @click="toggleSelection"
      >
        <img
          class="h-full block"
          src="/svg/deseleccionar-articulo.svg"
          alt="Deseleccionar"
        />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    displayName: {
      type: String,
      default: "",
    },
    code: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    amountDamaged: {
      type: Number,
      default: 0,
    },
    buttons: {
      type: Array,
      default: () => [],
    },
    image: {
      type: String,
      default: "/sin-imagen.jpg",
    },
    selected: {
      type: Boolean,
      default: false,
    },
    uselessItemCount: {
      type: Number,
      default: 0,
    },
    showPrice: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    toggleSelection() {
      this.$emit("selectionUpdate", this.code);
    },
  },
};
</script>

<style scoped>
.action-button {
  @apply cursor-pointer h-full md:py-3 w-8;
}
</style>
