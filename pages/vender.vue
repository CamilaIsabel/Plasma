<template>
  <div class="pb-24">
    <h1
      class="text-center text-gray-900 font-medium text-3xl lg:text-5xl mb-12"
    >
      Vender artículo
    </h1>

    <div class="flex flex-row flex-wrap items-center mx-auto">
      <Searchbar
        v-model="searchResult"
        class="sm:ml-auto sm:mr-4 w-full max-w-3xl mb-4 md:mb-0"
        placeholder="Buscar por..."
        :options="['articulo', 'codigo']"
      />
      <Button class="mr-auto text-white bg-blue-500 button-md" @click="search"
        >Buscar</Button
      >
    </div>
    <button
      v-if="selectedItems.length > 0"
      class="md:hidden py-3 px-5 rounded-lg w-full bg-red-600 text-white shadow font-bold uppercase my-2"
      @click="toggleEmptyCartDialog"
    >
      Vaciar carrito
    </button>

    <Dialog v-if="showEmptyCartDialog" class="flex items-center justify-center">
      <div
        class="bg-gray-100 rounded-2xl max-w-md w-full mx-auto py-4 px-5 md:px-12 flex flex-col"
      >
        <h1 class="text-2xl text-gray-800 text-center font-bold mb-4">
          Vaciar carrito
        </h1>
        <p class="text-center text-md text-gray-700">
          ¿Desea vaciar todos los artículos del carrito?
        </p>
        <div class="flex mt-8 flex-row flex-wrap md:flex-nowrap">
          <Button
            class="button-md bg-gray-700 text-white mb-3 md:mb-0 md:mr-3 w-full"
            @click="toggleEmptyCartDialog"
            >Cancelar</Button
          >
          <Button
            class="button-md bg-red-600 text-white w-full"
            @click="emptyCart"
            >Vaciar</Button
          >
        </div>
      </div>
    </Dialog>

    <Dialog
      v-if="showAddToCartForm"
      class="flex items-center justify-center"
      @close="toggleAddToCartFormDialog"
    >
      <div
        class="bg-gray-100 rounded-2xl max-w-4xl mx-auto py-4 px-5 md:px-12 flex-grow"
      >
        <add-to-cart-form
          :article="currentArticle"
          @addToCart="addToCart"
          @close="toggleAddToCartFormDialog"
        />
      </div>
    </Dialog>
    <Dialog
      v-if="showConfirmDialog"
      class="flex items-center justify-center"
      @close="toggleConfirmDialog"
    >
      <div
        class="flex flex-col max-w-sm w-full rounded bg-white text-black p-4"
      >
        <h1 class="text-center text-2xl font-semibold">
          ¿Desea confirmar la compra?
        </h1>
        <div class="flex flex-row mt-6 text-white">
          <button
            class="py-3 px-5 text-center font-semibold uppercase rounded-md shadow-md bg-gray-800 w-full mr-2"
            @click="toggleConfirmDialog"
          >
            Cancelar
          </button>
          <button
            class="py-3 px-5 text-center font-semibold uppercase rounded-md shadow-md bg-green-alt-800 w-full"
            @click="purchase"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Dialog>

    <div class="pb-24 mt-8">
      <div
        class="hidden uppercase font-bold bg-white my-4 rounded shadow-product text-md 2xl:text-2xl items-center justify-start px-3 py-4 tracking-wide grid-flow-row md:grid grid-rows-1 vender-rows"
      >
        <span class="ml-4">Artículo</span>
        <span class="ml-4 text-center">Precio</span>
        <span class="ml-4 text-center">Código</span>
        <span class="ml-4 text-center">Stock</span>
        <span class="ml-4 text-center">Daños</span>
      </div>

      <h3
        v-if="!loaded"
        class="text-3xl font-bold text-center mt-20 text-gray-700"
      >
        Cargando...
      </h3>

      <h3
        v-if="loaded && articles.length === 0"
        class="text-3xl font-bold text-center mt-20 text-gray-700"
      >
        No hay artículos
      </h3>
      <listable-article
        v-for="article in filteredArticles"
        :key="article.code"
        class="vender-rows"
        :code="article.code"
        :display-name="article.displayName"
        :stock="article.stock"
        :image="article.image"
        :amount-damaged="article.amountDamaged"
        :useless-item-count="article.uselessItemCount"
        :show-price="true"
        :price="article.sellPrice"
        :buttons="['buy']"
        :selected="article.selected"
        @selectionUpdate="selectionUpdate"
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
    <div
      v-if="selectedItems.length > 0"
      class="fixed left-0 bottom-0 p-4 flex flex-row flex-wrap w-full items-center"
    >
      <button
        class="hidden md:block py-3 px-5 rounded-lg w-auto bg-red-600 text-white shadow mr-4 ml-auto font-bold uppercase"
        @click="toggleEmptyCartDialog"
      >
        Vaciar carrito
      </button>
      <button
        class="w-full md:w-auto py-3 px-5 rounded-lg shadow bg-green-alt-800 text-white font-bold uppercase"
        @click="toggleConfirmDialog"
      >
        Finalizar Compra <span class="font-normal">($ {{ sellPrice }})</span>
      </button>
    </div>
  </div>
</template>

<script>
import AddToCartForm from "~/components/forms/AddToCartForm.vue";
export default {
  components: { AddToCartForm },
  data: () => ({
    searchResult: {
      text: "",
      option: "",
    },
    articles: [],
    loaded: false,
    showAddToCartForm: false,
    currentArticle: null,
    selectedItems: [],
    showConfirmDialog: false,
    itemsPerPage: 25,
    currentPage: 1,
    firstCodes: [],
    customSearch: false,
    showEmptyCartDialog: false,
  }),
  computed: {
    filteredArticles() {
      const filter =
        this.searchResult.option === "articulo" ? "displayName" : "code";
      const searchQuery = this.searchResult.text.toLowerCase();
      return this.articles.filter((article) => {
        return article[filter].toLowerCase().includes(searchQuery);
      });
    },
    processedItems() {
      return this.selectedItems;
    },
    sellPrice() {
      if (this.processedItems.length === 0) return 0;

      let price = 0;

      this.processedItems.forEach((item) => {
        price += item.sellPrice;
      });

      return Math.ceil(price);
    },
  },
  created() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) return;

      this.$router.push("/login");
    });
  },
  async mounted() {
    this.$store.state.selectedItems.forEach((item) => {
      this.selectedItems.push(item);
    });
    this.articles = await this.loadData();
  },
  methods: {
    toggleEmptyCartDialog() {
      this.showEmptyCartDialog = !this.showEmptyCartDialog;
    },
    emptyCart() {
      this.selectedItems.forEach((item) => {
        const article = this.articles.find(
          (article) => article.code === item.code
        );
        if (article.selected) {
          article.selected = false;
          this.$set(this.articles, this.articles.indexOf(article), article);
        }
      });
      this.selectedItems = [];
      this.currentArticle = null;
      this.showEmptyCartDialog = false;
      this.$store.commit("clear");
      this.$store.commit("clearCustomerName");
    },
    isSelected(code) {
      const indexInSelectedItems = this.selectedItems.findIndex(
        (entry) => entry.code === code
      );

      return indexInSelectedItems !== -1;
    },
    toggleConfirmDialog() {
      this.showConfirmDialog = !this.showConfirmDialog;
    },
    toggleAddToCartFormDialog() {
      this.showAddToCartForm = !this.showAddToCartForm;
    },
    async loadPreviousPage() {
      if (this.currentPage === 1) return;

      const lastCode = this.articles[0].code;
      const articles = await this.$fire.firestore
        .collection("articles")
        .orderBy("code", "desc")
        .startAt(this.firstCodes.pop())
        .endBefore(lastCode)
        .limit(this.itemsPerPage)
        .get();

      if (articles.size === 0) {
        alert("No hay anterior página.");
        return;
      }

      const result = [];
      await articles.forEach((doc) => {
        const elem = doc.data();
        if (this.isSelected(elem.code)) {
          elem.selected = true;
        }
        result.push(elem);
      });

      this.articles = result;
      this.currentPage = this.currentPage - 1;
    },
    async loadNextPage() {
      const lastCode = this.articles[this.articles.length - 1].code;
      const articles = await this.$fire.firestore
        .collection("articles")
        .orderBy("code", "desc")
        .startAfter(lastCode)
        .limit(this.itemsPerPage)
        .get();

      if (articles.size === 0) {
        alert("No hay siguiente página.");
        return;
      }

      this.firstCodes.push(this.articles[0].code);

      const result = [];
      await articles.forEach((doc) => {
        const elem = doc.data();
        if (this.isSelected(elem.code)) {
          elem.selected = true;
        }
        result.push(elem);
      });

      this.articles = result;
      this.currentPage = this.currentPage + 1;
    },
    async loadData() {
      const articles = await this.$fire.firestore
        .collection("articles")
        .orderBy("code", "desc")
        .limit(this.itemsPerPage)
        .get();
      const result = [];
      await articles.forEach((doc) => {
        const elem = doc.data();
        if (this.isSelected(elem.code)) {
          elem.selected = true;
        }
        result.push(elem);
      });

      this.loaded = true;
      return result;
    },
    selectionUpdate(code) {
      this.$store.commit("clear");
      const article = this.articles.find((article) => article.code === code);
      if (article.selected) {
        article.selected = false;
        this.$set(this.articles, this.articles.indexOf(article), article);

        const indexInSelectedItems = this.selectedItems.findIndex(
          (entry) => entry.code === code
        );
        this.selectedItems.splice(indexInSelectedItems, 1);

        if (this.selectedItems.length === 0) {
          this.$store.commit("clearCustomerName");
        }
        return;
      }

      this.currentArticle = article;
      this.toggleAddToCartFormDialog();
    },
    addToCart(item) {
      this.$store.commit("clear");
      const code = item.code;
      const article = this.articles.find((article) => article.code === code);
      article.selected = true;

      this.selectedItems.push(item);
      this.toggleAddToCartFormDialog();
    },
    error(error) {
      if (typeof error === "string") {
        alert(error);
        return;
      }

      alert("Ha ocurrido un error inesperado.");
    },
    async success(response) {
      const articlesRef = this.$fire.firestore.collection("articles");
      await this.processedItems.forEach(async (item) => {
        const id = item.code;

        if (item.damagedAmount > 0) {
          const damagedDecrement = this.$fireModule.firestore.FieldValue.increment(
            -item.damagedAmount
          );
          await articlesRef.doc(id).update({ amountDamaged: damagedDecrement });
        }

        const stockDecrement = this.$fireModule.firestore.FieldValue.increment(
          -item.amount
        );
        await articlesRef.doc(id).update({ stock: stockDecrement });
      });
      this.$router.push("/facturas/" + response.id);
    },
    calculateDiscount() {
      let discount = 0;
      this.processedItems.forEach((item) => {
        discount += item.discount;
      });

      return discount;
    },
    calculateBuyCost() {
      if (this.processedItems.length === 0) return 0;
      if (this.processedItems.length === 1)
        return this.processedItems[0].buyCost;

      let cost = 0;
      this.processedItems.forEach((item) => {
        cost += item.buyCost;
      });

      return cost;
    },
    async search() {
      const searchQuery = this.searchResult.text;
      if (searchQuery.length === 0) {
        this.articles = await this.loadData();
        return;
      }

      if (searchQuery.length < 3) {
        alert("Para realizar una búsqueda introduzca al menos 3 caracteres.");
        return;
      }

      const whereClause =
        this.searchResult.option === "articulo" ? "displayName" : "code";
      let articles;

      if (whereClause === "code") {
        articles = await this.$fire.firestore
          .collection("articles")
          .where(whereClause, ">=", searchQuery)
          .where(whereClause, "<=", searchQuery + "\uF8FF")
          .get();
      } else {
        articles = await this.$fire.firestore
          .collection("articles")
          .where("keywords", "array-contains", searchQuery.toLowerCase())
          .get();
      }
      const result = [];
      await articles.forEach((doc) => {
        const elem = doc.data();
        if (this.isSelected(elem.code)) {
          elem.selected = true;
        }
        result.push(elem);
      });
      this.articles = result;
      this.customSearch = true;
    },
    async clearSearch() {
      this.articles = await this.loadData();

      this.searchResult.text = "";
      this.customSearch = false;
    },
    purchase() {
      let customerName = this.$store.state.currentCustomerName;
      if (!customerName) {
        customerName = "Sin nombre";
      }
      let message = this.$store.state.description;
      if (!message) {
        message = "";
      }

      this.$fire.firestore
        .collection("purchases")
        .add({
          items: this.processedItems,
          date: new Date(),
          buyCost: this.calculateBuyCost(),
          discount: this.calculateDiscount(),
          sellPrice: this.sellPrice,
          paidAmount: 0,
          paid: false,
          customer: customerName,
          pickedUp: false,
          message,
        })
        .then(this.success)
        .catch(this.error);
    },
  },
};
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
