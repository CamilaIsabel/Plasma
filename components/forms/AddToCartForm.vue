<template>
  <form class="flex flex-col" @submit.prevent="submit">
    <h1 class="text-2xl text-center font-bold mb-4">Agregar al carrito</h1>

    <div class="flex flex-row flex-wrap">
      <div class="w-full pr-0 md:w-1/2 md:pr-5 flex flex-col text-left">
        <img
          :src="image"
          class="block rounded-lg shadow-lg max-h-96 h-full object-contain"
        />
      </div>

      <div class="w-full pl-0 mt-4 md:mt-0 md:w-1/2 md:pl-5 flex flex-col">
        <div>
          <span class="text-lg">Nombre artículo</span>
          <p class="input">{{ displayName }}</p>
        </div>
        <div>
          <span class="text-lg">Código artículo</span>
          <p class="input">{{ code }}</p>
        </div>
        <div>
          <span class="text-lg">Precio venta</span>
          <p class="input">{{ sellPrice }}</p>
        </div>
        <div class="flex flex-row items-center flex-wrap my-2">
          <input
            v-model="setCustomPrice"
            type="checkbox"
            class="checkbox mr-2"
          />

          <span class="text-lg">Restablecer precio venta por articulo</span>
          <Input
            v-model.number="individualArticlePrice"
            :required="false"
            type="number"
            class="w-full"
            :disabled="!setCustomPrice"
            :min="0"
          />
        </div>
        <div class="mt-2">
          <span class="text-lg">Descripción</span>
          <p class="input">{{ description }}</p>
        </div>
      </div>

      <div
        v-if="stock > 0 || damagedStock > 0"
        class="w-full md:w-1/2 grid grid-rows-2 mt-4 grid-article-amounts"
      >
        <span />
        <span class="text-center uppercase font-semibold text-sm">Stock</span>
        <span class="text-center uppercase font-semibold text-sm"
          >Cantidad</span
        >
        <label
          v-if="stock > 0"
          class="flex flex-row items-center mr-2 col-auto"
        >
          <span class="mr-auto text-xl font-bold text-green-800"
            >Sin daños</span
          >
          <input v-model="buyUndamaged" type="checkbox" class="checkbox ml-4" />
        </label>
        <div
          v-if="stock > 0"
          class="flex flex-col items-center text-center justify-center"
          :class="buyUndamaged ? 'visible' : 'invisible'"
        >
          <span>{{ stock }}</span>
        </div>
        <minus-plus-input
          v-if="stock > 0"
          v-model.number="amount"
          :class="buyUndamaged ? 'visible' : 'invisible'"
          :min="0"
          :max="stock"
        />
        <label v-if="damagedStock > 0" class="flex flex-row items-center mr-2">
          <span class="mr-auto text-xl font-bold text-green-800">Dañado</span>
          <input
            v-model="buyDamaged"
            type="checkbox"
            class="checkbox checkbox ml-4"
          />
        </label>
        <div
          v-if="damagedStock > 0"
          class="flex flex-col items-center text-center justify-center"
          :class="buyDamaged ? 'visible' : 'invisible'"
        >
          <span>{{ damagedStock }}</span>
        </div>
        <minus-plus-input
          v-if="damagedStock > 0"
          v-model.number="damagedAmount"
          :class="buyDamaged ? 'visible' : 'invisible'"
          :min="0"
          :max="damagedStock"
        />
      </div>
      <div v-else>No hay artículos en stock</div>
      <Input
        v-if="damagedStock > 0 && buyDamaged"
        v-model.number="damagedArticlePrice"
        class="w-full md:pl-5 md:mt-auto mt-8 md:w-1/2"
        :required="true"
        :min="0"
        type="number"
        label="Precio de todos los articulos dañados"
      />
    </div>
    <div class="w-full mt-12">
      <div class="flex flex-row items-center">
        <span class="text-lg font-semibold mr-2">Aplicar descuento de</span>
        <input
          v-model.number="discountValue"
          placeholder="0"
          type="number"
          min="0"
          max="100"
          class="px-2 bg-gray-200 font-bold text-lg py-1 mr-2 w-16 rounded shadow text-center"
        />
        <span class="text-lg font-semibold mr-4">%</span>
        <ToggleSwitch :value="applyDiscount" @input="updateDiscount" />
      </div>
    </div>
    <div class="w-full text-left text-2xl font-bold mt-4">
      Total $ {{ totalPrice }}
    </div>
    <div v-if="errors.length > 0" class="mt-4">
      <span
        v-for="message in errors"
        :key="message"
        class="text-sm font-medium block text-red-500"
      >
        {{ message }}
      </span>
    </div>
    <div class="flex flex-row actions w-full md:w-auto md:ml-auto mt-8">
      <Button
        :disabled="loading"
        class="border-2 border-green-alt-800 text-green-alt-800"
        @click="close"
      >
        Cancelar
      </Button>
      <Button
        :disabled="loading"
        type="submit"
        class="text-white bg-green-alt-800 ml-4"
      >
        Agregar
      </Button>
    </div>
  </form>
</template>

<script>
import MinusPlusInput from "../MinusPlusInput.vue";
export default {
  components: { MinusPlusInput },
  props: {
    article: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    loading: false,
    errors: [],
    sellPrice: 0,
    individualArticlePrice: 0,
    image: "/sin-imagen.jpg",
    displayName: "Sin nombre",
    code: "Sin código",
    description: "Sin descripción",
    stock: 0,
    damagedStock: 0,
    damagedAmount: 0,
    damagedArticlePrice: 0,
    amount: 0,
    discountValue: "",
    applyDiscount: false,
    buyUndamaged: false,
    buyDamaged: false,
    setCustomPrice: false,
  }),
  computed: {
    discount() {
      const number = Number(this.discountValue);
      if (isNaN(number)) return 0;

      return number;
    },
    pricing() {
      const nonDamagedPrice =
        this.nonDamagedInvididualArticlePrice * this.nonDamagedArticleAmount;

      const damagedPrice =
        this.damagedArticleAmount > 0 ? this.damagedArticlePrice : 0;

      const subTotal = nonDamagedPrice + damagedPrice;
      let total = subTotal;
      let discount = 0;
      if (this.applyDiscount && this.discount > 0) {
        total = Math.ceil(this.getDiscountedPrice(subTotal));
        discount = subTotal - total;
      }

      return { subTotal, total, discount };
    },
    pricingDiscount() {
      return this.pricing.discount;
    },
    totalPrice() {
      return this.pricing.total;
    },
    nonDamagedInvididualArticlePrice() {
      const individualPriceIsSet =
        this.setCustomPrice &&
        this.individualArticlePrice &&
        !isNaN(this.individualArticlePrice) &&
        this.individualArticlePrice > 0;
      return individualPriceIsSet
        ? this.individualArticlePrice
        : this.sellPrice;
    },
    nonDamagedArticleAmount() {
      if (this.buyUndamaged) return this.amount;

      return 0;
    },
    damagedArticleAmount() {
      if (this.buyDamaged) return this.damagedAmount;

      return 0;
    },
  },
  beforeMount() {
    if (this.article === null) return;

    this.stock = this.article.stock - this.article.amountDamaged;

    this.damagedStock = this.article.amountDamaged;

    this.sellPrice = this.article.sellPrice;

    if (this.article.description) {
      this.description = this.article.description;
    }

    if (this.article.displayName) {
      this.displayName = this.article.displayName;
    }

    if (this.article.code) {
      this.code = this.article.code;
    }

    if (this.article.image) {
      this.image = this.article.image;
    }
  },
  methods: {
    validateForm() {
      this.errors = [];

      if (!this.buyDamaged && !this.buyUndamaged) {
        this.errors.push("Debe agregar por lo menos un artículo");
      }

      if (
        (this.buyDamaged && this.damagedAmount <= 0) ||
        (this.buyUndamaged && this.amount <= 0)
      ) {
        this.errors.push("Seleccione una cantidad positiva de artículos");
      }

      return this.errors.length === 0;
    },
    submit() {
      if (!this.validateForm()) return;

      let totalAmountOfItems = 0;
      if (this.buyUndamaged) {
        totalAmountOfItems += this.amount;
      }
      if (this.buyDamaged) {
        totalAmountOfItems += this.damagedAmount;
      }

      const item = {
        code: this.code,
        price: this.totalPrice,
        name: this.displayName,
        amount: totalAmountOfItems,
        buyCost: totalAmountOfItems * this.article.buyPrice,
        sellPrice: this.totalPrice,
        discount: this.pricingDiscount,
      };

      if (this.damagedArticleAmount > 0 && this.buyDamaged) {
        item.damagedAmount = this.damagedAmount;
        item.damagedPrice = Math.ceil(
          this.getDiscountedPrice(this.damagedArticlePrice)
        );
        item.buyCostDamaged = this.article.buyPrice * this.damagedAmount;
      }

      if (this.nonDamagedArticleAmount > 0 && this.buyUndamaged) {
        item.undamagedAmount = this.amount;
        item.undamagedPrice = Math.ceil(
          this.getDiscountedPrice(
            this.nonDamagedArticleAmount * this.nonDamagedInvididualArticlePrice
          )
        );
        item.buyCostUndamaged = this.article.buyPrice * this.amount;
      }

      this.$emit("addToCart", item);
    },
    close() {
      this.$emit("close");
    },
    error(error) {
      if (typeof error === "string") {
        alert(error);
        return;
      }

      alert("Ha ocurrido un error inesperado.");
    },
    success() {
      this.$emit("reload");
      this.close();
    },
    getDiscountedPrice(number) {
      return number - number * (this.discount / 100);
    },
    updateDiscount(value) {
      this.applyDiscount = value;
    },
  },
};
</script>

<style lang="scss" scoped>
.actions {
  button {
    max-width: 180px;

    @apply md:w-full w-1/2 block font-bold rounded-lg py-4 md:px-5;
  }
}

p.input {
  margin-bottom: 0.5rem;
}

.grid-article-amounts {
  grid-template-columns: auto 1fr 1fr;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
