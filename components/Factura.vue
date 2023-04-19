<template>
  <div
    class="shadow-md bg-white py-3 flex flex-col max-w-xl w-full rounded text-sm factura"
  >
    <input
      :value="customer"
      placeholder="Nombre del cliente"
      class="input w-3/4 mx-auto text-2xl font-semibold text-center"
      @input="handleCustomerInput"
    />
    <span class="printer-text"> {{ customer }} </span>
    <time class="text-center mt-2 text-lg">{{
      date.toLocaleDateString()
    }}</time>
    <div class="mt-8 mb-2 table-grid grid item-grid text-right text-xs">
      <span class="uppercase text-gray-600 font-semibold text-left"
        >Artículo</span
      >
      <span class="uppercase text-gray-600 font-semibold">Cantidad</span>
      <span class="uppercase text-gray-600 font-semibold">Precio Art.</span>
      <span class="uppercase text-gray-600 font-semibold">Precio Venta</span>
    </div>
    <div class="overflow-y-auto items">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="border-t-2 border-gray-500 table-grid grid item-grid text-right"
      >
        <span class="text-left">{{ item.name }}</span>
        <span>{{ item.amount }}</span>
        <span
          >$ {{ item.price + (isNaN(item.discount) ? 0 : item.discount) }}</span
        >
        <span>$ {{ item.price }}</span>
      </div>
    </div>
    <div class="mt-4 flex flex-col ml-auto">
      <div
        :class="discount > 0 ? '' : 'opacity-0 select-none'"
        class="rounded-l-full bg-green-500 text-white font-bold py-2 pl-8 pr-12 mt-4 transition-opacity mb-4"
      >
        <span class="block text-sm font-bold tracking-wider uppercase"
          >Descuento</span
        >
        <span class="block font-normal text-lg">$ {{ discount }}</span>
      </div>
      <div
        class="rounded-l-full bg-gray-800 text-white font-bold py-2 pl-8 pr-12"
      >
        <span class="block text-sm font-semibold tracking-wider uppercase"
          >Total</span
        >
        <span class="block font-normal text-lg">$ {{ total }}</span>
      </div>
      <div
        class="rounded-l-full bg-green-alt-800 text-white font-bold py-2 pl-8 pr-12 mt-4"
      >
        <span class="block text-sm font-semibold tracking-wider uppercase"
          >Pagado</span
        >
        <div class="font-normal text-lg">
          $
          <input
            class="w-20 rounded-md shadow px-1 bg-white text-black"
            min="0"
            type="number"
            :max="total"
            :value="paidAmount"
            @input="handlePaidAmountInput"
          />
          <span class="printer-text">{{ paidAmount }}</span>
        </div>
      </div>
      <div
        :class="debt > 0 && paidAmount > 0 ? '' : 'opacity-0 select-none'"
        class="rounded-l-full bg-red-600 text-white font-bold py-2 pl-8 pr-12 mt-4 transition-opacity"
      >
        <span class="block text-sm font-bold tracking-wider uppercase"
          >Deuda</span
        >
        <span class="block font-normal text-lg">$ {{ debt }}</span>
      </div>
    </div>
    <div v-if="messageVisible" class="mt-4 bg-gray-200 px-4 py-2 text-gray-700">
      <textarea
        :value="message"
        class="bg-gray-200 w-full"
        cols="30"
        rows="4"
        placeholder="Descripción"
        @input="handleDescriptionInput"
      />
      <p class="printer-text max-w-full break-all">
        Descripción: {{ message }}
      </p>
    </div>
    <div class="mt-8 text-center text-2xl text-gray-600 font-semibold">
      <span v-if="pickedUp">Ha retirado el Artículo</span>
      <span v-else>No ha retirado el Artículo</span>
    </div>
    <div style="page-break-after: always"></div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    customer: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: () => new Date(),
    },
    message: {
      type: String,
      default: "",
    },
    pickedUp: {
      type: Boolean,
      default: false,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    customerName: {
      type: String,
      default: "",
    },
    messageVisible: {
      type: Boolean,
      default: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    debt() {
      return this.total - this.paidAmount;
    },
    total() {
      if (this.items.length === 0) return 0;
      if (this.items.length === 1) return this.items[0].price;
      let price = 0;
      this.items.forEach((item) => {
        price += item.price;
      });
      return price;
    },
  },
  methods: {
    handleCustomerInput(event) {
      this.$emit("customerNameChange", event.target.value);
    },
    handlePaidAmountInput(event) {
      const int = event.target.value ? event.target.value : "0";
      this.$emit("paidAmoutInput", Number(int));
    },
    handleDescriptionInput(event) {
      this.$emit("descriptionInput", event.target.value);
    },
  },
};
</script>

<style>
.table-grid > * {
  @apply px-3 py-1;
}
.table-grid span {
  @apply truncate;
}

.text-center * {
  text-align: center;
}

.item-grid {
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.items {
  max-height: 700px;
}

@media screen {
  .printer-text {
    visibility: hidden;
    display: none;
  }
  input {
    visibility: visible !important;
    display: unset;
  }
}

@media print {
  input {
    visibility: hidden !important;
    display: none !important;
  }
  .printer-text:not(.invisible) {
    visibility: visible;
  }
  .factura {
    min-height: 10in;
    box-shadow: none !important;
    border: 2px solid gray;
  }
}
</style>
