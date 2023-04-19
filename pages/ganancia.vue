<template>
  <div class="pb-12">
    <h1
      class="text-center text-gray-900 font-medium text-3xl lg:text-5xl mb-12"
    >
      Ganancia
    </h1>
    <div class="flex flex-row flex-wrap items-center justify-between mb-4">
      <div
        class="flex flex-row flex-wrap datepickers items-center font-semibold"
      >
        <div
          class="flex items-center flex-row md:mr-4 md:mb-0 mb-4 md:w-auto w-full"
        >
          <span class="mr-2">Desde</span>
          <input v-model="startDate" :max="today" type="date" />
        </div>

        <div class="flex items-center flex-row md:w-auto w-full">
          <span class="mr-2">Hasta</span>
          <input v-model="endDate" :max="today" type="date" />
        </div>
      </div>
      <Button
        :class="loading ? 'opacity-70 cursor-not-allowed' : ''"
        class="button-md md:mt-0 mt-4 md:w-auto w-full md:mx-0 mx-8 text-white bg-green-alt-800"
        @click="calcular"
      >
        Calcular
      </Button>
    </div>

    <div class="flex flex-row flex-wrap mt-8">
      <div class="w-full md:w-1/2 mb-4 md:mb-0">
        <div class="piece black">
          <h1>Importe de compra</h1>
          <p>
            Se suman los costos que usted ha tenido de los productos que ha
            vendido y gastos de utileria en las fechas estipuladas.
          </p>
          <span>${{ importeDeCompra }}</span>
        </div>
        <div class="piece black">
          <h1>Importe de venta</h1>
          <p>
            Se suman los precios de la cantidad de productos que ha vendido en
            las fechas estipuladas.
          </p>
          <span>${{ importeDeVenta }}</span>
        </div>
        <div class="piece">
          <h1>Ganancia</h1>
          <span
            :class="
              ganancia > 0
                ? 'border-green-600 text-green-600'
                : 'border-red-500 text-red-500'
            "
            >${{ ganancia }}</span
          >
        </div>
      </div>
      <div class="w-full md:w-1/2 mb-4 md:mb-0 text-sm md:text-base">
        <div
          class="md:ml-8 shadow-lg rounded-md bg-white h-full w-full md:px-6 md:py-4 p-1"
        >
          <span v-if="!calculated" class="text-2xl font-semibold text-gray-700">
            No se ha presionado el botón de calcular
          </span>
          <div v-else class="flex flex-col">
            <span
              v-if="
                Object.keys(nonDamagedArticles).length === 0 &&
                Object.keys(damagedArticles).length === 0 &&
                gastos.length === 0
              "
              class="text-2xl font-semibold text-gray-700"
            >
              No se han registrado operaciones en el rango de fechas
              seleccionado.
            </span>
            <!-- Articulos vendidos no dañados -->
            <button
              v-if="Object.keys(nonDamagedArticles).length > 0"
              :class="
                showNonDamagedArticles
                  ? 'text-white bg-blue-500'
                  : 'text-blue-600'
              "
              class="rounded p-1 underline cursor-pointer text-left"
              @click="() => (showNonDamagedArticles = !showNonDamagedArticles)"
            >
              Ver detalles de los artículos vendidos...
            </button>

            <div
              v-if="
                showNonDamagedArticles &&
                Object.keys(nonDamagedArticles).length > 0
              "
              class="flex flex-col text-xs md:text-base"
            >
              <div
                class="mt-3 mb-2 grid ganancia-grid text-right text-xs md:text-sm"
              >
                <span class="uppercase text-gray-600 font-semibold text-left"
                  >Artículo</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Cantidad</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Precio Compra</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Precio Venta</span
                >
              </div>
              <div class="overflow-y-auto">
                <div
                  v-for="(item, key) in nonDamagedArticles"
                  :key="key"
                  class="border-t-2 border-gray-500 grid ganancia-grid text-right"
                >
                  <span class="text-left">{{ item.name }}</span>
                  <span>{{ item.amount }}</span>
                  <span>${{ item.buyCost }}</span>
                  <span>${{ item.price }}</span>
                </div>
              </div>
              <div class="grid mt-4 ganancia-grid text-white text-right">
                <div
                  class="md:pl-8 pl-3 rounded-l-full bg-gray-800 flex flex-col py-2 col-start-3"
                >
                  <span>TOTAL</span>
                  <span>${{ nonDamagedTotalBuyCost }}</span>
                </div>
                <div class="bg-gray-800 flex flex-col py-2 col-start-4 pr-2">
                  <span>TOTAL</span>
                  <span>${{ nonDamagedTotalSellPrice }}</span>
                </div>
              </div>
              <div class="grid mt-4 ganancia-grid text-white text-right">
                <div
                  class="pl-8 rounded-l-full bg-green-alt-800 flex flex-col py-2 pr-2 col-start-4 col-end-5"
                >
                  <span>DIFERENCIA</span>
                  <span
                    >$
                    {{
                      nonDamagedTotalSellPrice - nonDamagedTotalBuyCost
                    }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Articulos dañados -->
            <button
              v-if="Object.keys(damagedArticles).length > 0"
              :class="
                showDamagedArticles ? 'text-white bg-blue-500' : 'text-blue-600'
              "
              class="underline cursor-pointer mt-8 text-left"
              @click="() => (showDamagedArticles = !showDamagedArticles)"
            >
              Ver detalles de los artículos vendidos dañados...
            </button>
            <div
              v-if="
                showDamagedArticles && Object.keys(damagedArticles).length > 0
              "
              class="flex flex-col text-xs md:text-base"
            >
              <div
                class="mt-3 mb-2 grid ganancia-grid text-right text-xs md:text-sm"
              >
                <span class="uppercase text-gray-600 font-semibold text-left"
                  >Artículo</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Cantidad</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Precio Compra</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Precio Venta</span
                >
              </div>
              <div class="overflow-y-auto">
                <div
                  v-for="(item, key) in damagedArticles"
                  :key="key"
                  class="border-t-2 border-gray-500 grid ganancia-grid text-right"
                >
                  <span class="text-left">{{ item.name }}</span>
                  <span>{{ item.amount }}</span>
                  <span>${{ item.buyCost }}</span>
                  <span>${{ item.price }}</span>
                </div>
              </div>
              <div class="grid mt-4 ganancia-grid text-white text-right">
                <div
                  class="md:pl-8 pl-3 rounded-l-full bg-gray-800 flex flex-col py-2 col-start-3"
                >
                  <span>TOTAL</span>
                  <span>${{ damagedTotalBuyCost }}</span>
                </div>
                <div class="bg-gray-800 flex flex-col py-2 col-start-4 pr-2">
                  <span>TOTAL</span>
                  <span>${{ damagedTotalSellPrice }}</span>
                </div>
              </div>
              <div class="grid mt-4 ganancia-grid text-white text-right">
                <div
                  class="pl-8 rounded-l-full bg-green-alt-800 flex flex-col py-2 pr-2 col-start-4 col-end-5"
                >
                  <span>DIFERENCIA</span>
                  <span
                    >${{ damagedTotalSellPrice - damagedTotalBuyCost }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Gastos -->
            <button
              v-if="gastos.length > 0"
              :class="showGastos ? 'text-white bg-blue-500' : 'text-blue-600'"
              class="underline cursor-pointer mt-8 text-left"
              @click="() => (showGastos = !showGastos)"
            >
              Ver detalles de los gastos de utilería...
            </button>
            <div
              v-if="showGastos && gastos.length > 0"
              class="flex flex-col text-xs md:text-base"
            >
              <div
                class="mt-3 mb-2 grid ganancia-gastos-grid text-right text-xs md:text-sm"
              >
                <span class="uppercase text-gray-600 font-semibold text-left"
                  >Nombre</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Cantidad</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Precio Compra</span
                >
              </div>
              <div class="overflow-y-auto">
                <div
                  v-for="(gasto, key) in gastos"
                  :key="key"
                  class="border-t-2 border-gray-500 grid ganancia-gastos-grid text-right"
                >
                  <span class="text-left">{{ gasto.displayName }}</span>
                  <span>{{ gasto.amount }}</span>
                  <span>${{ gasto.buyPrice }}</span>
                </div>
              </div>
              <div class="grid mt-4 ganancia-grid text-white text-right">
                <div
                  class="bg-red-700 rounded-l-full pl-2 flex flex-col py-2 col-start-4 pr-2"
                >
                  <span>TOTAL</span>
                  <span>${{ gastosCost }}</span>
                </div>
              </div>
            </div>

            <!-- Waste -->
            <button
              v-if="waste.length > 0"
              :class="showWaste ? 'text-white bg-blue-500' : 'text-blue-600'"
              class="underline cursor-pointer mt-8 text-left"
              @click="() => (showWaste = !showWaste)"
            >
              Ver detalles de los artículos irrecuperables...
            </button>
            <div
              v-if="showWaste && waste.length > 0"
              class="flex flex-col text-xs md:text-base"
            >
              <div
                class="mt-3 mb-2 grid ganancia-gastos-grid text-right text-xs md:text-sm"
              >
                <span class="uppercase text-gray-600 font-semibold text-left"
                  >Nombre</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Cantidad</span
                >
                <span class="uppercase text-gray-600 font-semibold"
                  >Precio Compra</span
                >
              </div>
              <div class="overflow-y-auto">
                <div
                  v-for="(entry, key) in computedWaste"
                  :key="key"
                  class="border-t-2 border-gray-500 grid ganancia-gastos-grid text-right"
                >
                  <span class="text-left">{{ entry.displayName }}</span>
                  <span>{{ entry.amount }}</span>
                  <span>${{ entry.buyCost }}</span>
                </div>
              </div>
              <div class="grid mt-4 ganancia-grid text-white text-right">
                <div
                  class="bg-red-700 rounded-l-full pl-2 flex flex-col py-2 col-start-4 pr-2"
                >
                  <span>TOTAL</span>
                  <span>${{ wasteCost }}</span>
                </div>
              </div>
            </div>

            <!-- Debt -->
            <button
              v-if="unpaidFacturas.length > 0"
              :class="
                showUnpaidFacturas ? 'text-white bg-blue-500' : 'text-blue-600'
              "
              class="underline cursor-pointer mt-8 text-left"
              @click="() => (showUnpaidFacturas = !showUnpaidFacturas)"
            >
              Ver detalles de las facturas no pagas...
            </button>
            <div
              v-if="showUnpaidFacturas && unpaidFacturas.length > 0"
              class="flex flex-col"
            >
              <div
                class="mt-3 mb-2 grid ganancia-debt-grid text-right text-xs md:text-sm"
              >
                <span class="uppercase text-gray-600 font-semibold text-left"
                  >Cliente</span
                >
                <span class="uppercase text-gray-600 font-semibold">Fecha</span>
                <span class="uppercase text-gray-600 font-semibold"
                  >Enlace</span
                >
                <span class="uppercase text-gray-600 font-semibold">Deuda</span>
              </div>
              <div class="overflow-y-auto text-xs md:text-base">
                <div
                  v-for="(entry, key) in unpaidFacturas"
                  :key="key"
                  class="border-t-2 border-gray-500 grid ganancia-debt-grid text-right"
                >
                  <span class="text-left">{{ entry.customer }}</span>
                  <span>{{ entry.date.toDate().toLocaleDateString() }}</span>
                  <nuxt-link
                    :to="'/facturas/' + entry.id"
                    class="text-blue-500 underline"
                    >Ver</nuxt-link
                  >
                  <span>${{ entry.sellPrice - entry.paidAmount }}</span>
                </div>
              </div>
              <div class="grid mt-4 ganancia-grid text-white text-right">
                <div
                  class="bg-red-700 rounded-l-full pl-2 flex flex-col py-2 col-start-4 pr-2"
                >
                  <span>TOTAL</span>
                  <span>${{ debt }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Button from "~/components/Button.vue";
export default {
  components: { Button },
  data: () => ({
    gastos: [],
    facturas: [],
    startDate: "",
    endDate: "",
    calculated: false,
    showNonDamagedArticles: false,
    showDamagedArticles: false,
    showGastos: false,
    showWaste: false,
    showUnpaidFacturas: false,
    loading: false,
    waste: [],
  }),
  computed: {
    today() {
      return new Date().toISOString().split("T")[0];
    },
    importeDeCompra() {
      let importe = 0;
      this.gastos.forEach((gasto) => {
        importe += gasto.buyPrice;
      });

      this.facturas.forEach((factura) => {
        importe += factura.buyCost;
      });

      this.waste.forEach((waste) => {
        importe += waste.buyCost;
      });

      return importe;
    },
    importeDeVenta() {
      let importe = 0;

      this.facturas.forEach((factura) => {
        importe += factura.sellPrice;
      });

      return importe - this.debt;
    },
    ganancia() {
      return this.importeDeVenta - this.importeDeCompra;
    },
    gastosCost() {
      let cost = 0;
      this.gastos.forEach((gasto) => {
        cost += gasto.buyPrice;
      });

      return cost;
    },
    wasteCost() {
      let cost = 0;
      this.waste.forEach((waste) => {
        cost += waste.buyCost;
      });

      return cost;
    },
    nonDamagedArticles() {
      const items = {};
      this.facturas.forEach((factura) => {
        factura.items.forEach((item) => {
          if (!(item.undamagedAmount > 0)) {
            return;
          }

          let previous = items[item.code];
          if (!previous) {
            items[item.code] = {
              amount: 0,
              price: 0,
              name: item.name,
              buyCost: 0,
            };
            previous = items[item.code];
          }

          previous.amount += item.undamagedAmount;
          previous.price += item.undamagedPrice;
          previous.buyCost += item.buyCostUndamaged;
        });
      });

      return items;
    },
    nonDamagedTotalBuyCost() {
      let cost = 0;
      Object.keys(this.nonDamagedArticles).forEach((key) => {
        const article = this.nonDamagedArticles[key];
        cost += article.buyCost;
      });

      return cost;
    },
    damagedTotalBuyCost() {
      let cost = 0;
      Object.keys(this.damagedArticles).forEach((key) => {
        const article = this.damagedArticles[key];
        cost += article.buyCost;
      });

      return cost;
    },
    nonDamagedTotalSellPrice() {
      let price = 0;
      Object.keys(this.nonDamagedArticles).forEach((key) => {
        const article = this.nonDamagedArticles[key];
        price += article.price;
      });

      return price;
    },
    damagedTotalSellPrice() {
      let price = 0;
      Object.keys(this.damagedArticles).forEach((key) => {
        const article = this.damagedArticles[key];
        price += article.price;
      });

      return price;
    },
    unpaidFacturas() {
      const unpaidFacturas = [];
      this.facturas.forEach((factura) => {
        if (factura.paidAmount >= factura.sellPrice) return;
        unpaidFacturas.push(factura);
      });

      return unpaidFacturas;
    },
    debt() {
      let debt = 0;
      this.unpaidFacturas.forEach((factura) => {
        debt += factura.sellPrice - factura.paidAmount;
      });

      return debt;
    },
    damagedArticles() {
      const items = {};
      this.facturas.forEach((factura) => {
        factura.items.forEach((item) => {
          if (!(item.damagedAmount > 0)) {
            return;
          }

          let previous = items[item.code];
          if (!previous) {
            items[item.code] = {
              amount: 0,
              price: 0,
              name: item.name,
              buyCost: 0,
            };
            previous = items[item.code];
          }

          previous.amount += item.damagedAmount;
          previous.price += item.damagedPrice;
          previous.buyCost += item.buyCostDamaged;
        });
      });

      return items;
    },
    computedWaste() {
      const result = {};
      this.waste.forEach((waste) => {
        let entry = result[waste.code];

        if (!entry) {
          result[waste.code] = {
            displayName: waste.name,
            buyCost: 0,
            amount: 0,
          };

          entry = result[waste.code];
        }

        entry.amount += waste.amount;
        entry.buyCost += waste.buyCost;
      });

      return result;
    },
  },
  created() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) return;

      this.$router.push("/login");
    });
  },
  mounted() {
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    this.startDate =
      oneMonthAgo.getFullYear() +
      "-" +
      ("0" + (oneMonthAgo.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + oneMonthAgo.getDate()).slice(-2);

    this.endDate =
      currentDate.getFullYear() +
      "-" +
      ("0" + (currentDate.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + currentDate.getDate()).slice(-2);
  },
  methods: {
    getGastosInDateRange(start, end) {
      return this.$fire.firestore
        .collection("gastos")
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();
    },
    getFacturasInDateRange(start, end) {
      return this.$fire.firestore
        .collection("purchases")
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();
    },
    getWasteInDateRange(start, end) {
      return this.$fire.firestore
        .collection("waste")
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();
    },
    async calcular() {
      if (this.loading) {
        return;
      }

      this.gastos = [];
      this.facturas = [];
      this.waste = [];
      this.loading = true;
      const start = new Date(this.startDate);
      start.setTime(start.getTime() + start.getTimezoneOffset() * 60 * 1000);

      const end = new Date(this.endDate);
      end.setTime(end.getTime() + end.getTimezoneOffset() * 60 * 1000);
      end.setHours(24);

      const [
        gastosSnapshot,
        facturasSnapshot,
        wasteSnapshot,
      ] = await Promise.all([
        this.getGastosInDateRange(start, end),
        this.getFacturasInDateRange(start, end),
        this.getWasteInDateRange(start, end),
      ]);

      gastosSnapshot.forEach((gasto) => {
        this.gastos.push(gasto.data());
      });

      facturasSnapshot.forEach((factura) => {
        this.facturas.push({ ...factura.data(), id: factura.id });
      });

      wasteSnapshot.forEach((waste) => {
        this.waste.push(waste.data());
      });

      this.loading = false;
      this.calculated = true;
    },
  },
};
</script>

<style scoped>
.datepickers input {
  @apply bg-gray-200 text-gray-800 py-3 px-5 rounded-md shadow-md;
}
.datepickers span {
  @apply text-xl;
}

.piece {
  @apply flex flex-col mb-12;
}

.piece h1 {
  @apply font-semibold text-2xl mb-4;
}

.piece p {
  @apply text-lg;
}

.piece span {
  @apply mt-4 border w-36 text-center py-2 block mr-auto rounded-full;
}

.piece.black span {
  @apply border-black;
}

.ganancia-grid {
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
}

.ganancia-gastos-grid {
  grid-template-columns: 2fr 1fr 1fr;
}

.ganancia-debt-grid {
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
</style>
