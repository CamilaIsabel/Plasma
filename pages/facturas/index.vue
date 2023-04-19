<template>
  <div>
    <div v-if="loaded">
      <h1
        class="text-center text-gray-900 font-medium text-3xl lg:text-5xl mb-12"
      >
        Historial de Facturas
      </h1>

      <div class="flex flex-row flex-wrap items-center mx-auto">
        <Searchbar
          v-model="searchResult"
          class="sm:ml-auto sm:mr-4 w-full max-w-3xl mb-4 md:mb-0"
          placeholder="Buscar por..."
          :options="['cliente']"
        />
        <Button class="mr-auto text-white bg-blue-500 button-md" @click="search"
          >Buscar</Button
        >
      </div>

      <div v-if="filteredFacturas.length > 0" class="mt-8">
        <div
          class="hidden uppercase font-bold bg-white my-4 rounded shadow-product text-md 2xl:text-2xl items-center justify-start px-3 py-4 tracking-wide grid-flow-row md:grid grid-rows-1 factura-rows"
        >
          <span>Nombre Cliente</span>
          <span>Fecha</span>
          <span>Estado</span>
        </div>
        <listable-factura
          v-for="factura in filteredFacturas"
          :id="factura.id"
          :key="factura.id"
          :date="factura.date"
          :customer="factura.customer"
          :paga="factura.paid"
          @delete="(id) => openDeleteDialog(id)"
        />
        <div
          v-if="loaded && !customSearch"
          class="mx-auto flex flex-row justify-between flex-wrap max-w-md mt-8"
        >
          <div class="w-full text-center text-2xl mb-2">
            Página: {{ currentPage }}
          </div>
          <Button
            class="button-md text-white bg-green-alt-800"
            @click="loadPreviousPage"
            >Anterior</Button
          >
          <Button
            class="button-md text-white bg-green-alt-800"
            @click="loadNextPage"
            >Siguiente</Button
          >
        </div>
        <div v-if="customSearch">
          <Button class="button-md text-white bg-red-500" @click="clearSearch"
            >Limpiar búsqueda</Button
          >
        </div>
      </div>
      <div v-else class="mt-12 text-center font-semibold text-3xl">
        No hay resultados
      </div>
      <Dialog
        v-if="showDeleteDialog"
        class="flex items-center justify-center"
        @close="closeDeleteDialog"
      >
        <div class="bg-gray-100 py-8 px-5 md:px-12 text-black rounded">
          <h1 class="text-2xl font-bold mb-12 text-center">
            Confirmar eliminación
          </h1>
          <div class="flex flex-row items-center justify-center mt-4">
            <span class="text-lg block">Reestablecer stock de artículos</span>
            <input
              v-model="restoreStock"
              type="checkbox"
              class="checkbox checkbox ml-2"
            />
          </div>
          <p class="mb-8 mt-2 text-gray-700 text-sm text-center">
            Si marca la opción, la cantidad de stock correspondiente de los
            artículos en la factura se reestablecerá.
          </p>
          <div class="flex flex-row ml-auto">
            <Button
              :disabled="deletionInProcess"
              class="button-md border-2 border-red-500 text-red-500 w-1/2 mr-4"
              @click="closeDeleteDialog"
            >
              Cancelar
            </Button>
            <Button
              :disabled="deletionInProcess"
              class="button-md border-2 text-white bg-red-500 w-1/2"
              @click="deleteFactura"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
    <div v-else>
      <div class="flex flex-col mt-48 text-center items-center justify-center">
        <loading-spinner class="text-gray-900 w-32 h-32" />
        <span class="text-2xl mt-8">Cargando facturas...</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    facturas: [],
    loaded: false,
    selectedFactura: null,
    showDeleteDialog: false,
    searchResult: {
      text: "",
      option: "",
    },
    itemsPerPage: 20,
    currentPage: 1,
    firstCodes: [],
    customSearch: false,
    restoreStock: true,
    deletionInProcess: false,
  }),
  computed: {
    filteredFacturas() {
      const filter =
        this.searchResult.option === "cliente" ? "customer" : "date";
      const searchQuery = this.searchResult.text.toLowerCase();
      return this.facturas.filter((factura) => {
        if (filter === "date") {
          return factura.date
            .toDate()
            .toLocaleDateString()
            .toLowerCase()
            .includes(searchQuery);
        }

        if (factura.customer == null) {
          return "sin nombre".includes(searchQuery);
        }

        return factura.customer.toLowerCase().includes(searchQuery);
      });
    },
  },
  created() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) return;

      this.$router.push("/login");
    });
  },
  async mounted() {
    this.facturas = await this.loadData();
  },
  methods: {
    async loadPreviousPage() {
      if (this.currentPage === 1) return;

      const lastCode = this.facturas[0].date;
      const purchases = await this.$fire.firestore
        .collection("purchases")
        .orderBy("date", "desc")
        .startAt(this.firstCodes.pop())
        .endBefore(lastCode)
        .limit(this.itemsPerPage)
        .get();

      if (purchases.size === 0) {
        alert("No hay anterior página.");
        return;
      }

      const result = [];
      await purchases.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        result.push(data);
      });

      this.facturas = result;
      this.currentPage = this.currentPage - 1;
    },
    async loadNextPage() {
      const lastCode = this.facturas[this.facturas.length - 1].date;
      const purchases = await this.$fire.firestore
        .collection("purchases")
        .orderBy("date", "desc")
        .startAfter(lastCode)
        .limit(this.itemsPerPage)
        .get();

      if (purchases.size === 0) {
        alert("No hay siguiente página.");
        return;
      }

      this.firstCodes.push(this.facturas[0].date);

      const result = [];
      await purchases.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        result.push(data);
      });

      this.facturas = result;
      this.currentPage = this.currentPage + 1;
    },
    async reloadList() {
      this.facturas = await this.loadData();
    },
    openDeleteDialog(id) {
      this.selectedFactura = this.facturas.find((factura) => factura.id === id);
      this.showDeleteDialog = true;
    },
    closeDeleteDialog() {
      this.deletionInProcess = false;
      this.showDeleteDialog = false;
    },
    async deleteFactura() {
      this.deletionInProcess = true;
      const factura = this.selectedFactura;
      const index = this.facturas.indexOf(factura);

      if (this.restoreStock) {
        const articlesRef = this.$fire.firestore.collection("articles");
        factura.items.forEach(async (item) => {
          const id = item.code;

          if (item.damagedAmount > 0) {
            const damagedDecrement = this.$fireModule.firestore.FieldValue.increment(
              item.damagedAmount
            );
            await articlesRef
              .doc(id)
              .update({ amountDamaged: damagedDecrement });
          }

          const stockIncrement = this.$fireModule.firestore.FieldValue.increment(
            item.amount
          );
          await articlesRef.doc(id).update({ stock: stockIncrement });
        });
      }

      await this.$fire.firestore
        .collection("purchases")
        .doc(factura.id)
        .delete();
      this.facturas.splice(index, 1);
      this.closeDeleteDialog();
    },
    async loadData() {
      const facturas = await this.$fire.firestore
        .collection("purchases")
        .orderBy("date", "desc")
        .limit(this.itemsPerPage)
        .get();

      const result = [];
      await facturas.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        result.push(data);
      });

      this.loaded = true;
      return result;
    },
    async search() {
      const searchQuery = this.searchResult.text;
      if (searchQuery.length === 0) {
        this.facturas = await this.loadData();
        return;
      }

      const whereClause = "customer";
      const purchases = await this.$fire.firestore
        .collection("purchases")
        .where(whereClause, ">=", searchQuery)
        .where(whereClause, "<=", searchQuery + "\uF8FF")
        .get();
      const result = [];
      await purchases.forEach((doc) => {
        const elem = doc.data();
        elem.id = doc.id;
        result.push(elem);
      });
      this.facturas = result;
      this.customSearch = true;
    },
    async clearSearch() {
      this.$set(this.searchResult, "text", "");
      this.customSearch = false;
      this.facturas = await this.loadData();
    },
  },
};
</script>

<style></style>
