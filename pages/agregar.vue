<template>
  <div>
    <h1
      class="text-center text-gray-900 font-medium text-3xl lg:text-5xl mb-12"
    >
      Agregar artículo
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

    <div class="pb-24 mt-8">
      <Dialog
        v-if="addArticleDialogIsVisible"
        class="flex items-center justify-center"
        @close="closeAddArticleDialog"
      >
        <div
          class="bg-gray-100 rounded-2xl max-w-4xl mx-auto py-4 px-5 md:px-12"
        >
          <add-article-form
            @close="closeAddArticleDialog"
            @reload="reloadList"
          />
        </div>
      </Dialog>
      <Dialog
        v-if="editArticleDialogIsVisible"
        class="flex items-center justify-center"
        @close="closeEditArticleDialog"
      >
        <div
          class="bg-gray-100 rounded-2xl max-w-4xl mx-auto py-4 px-5 md:px-12"
        >
          <edit-article-form
            :article="currentArticle"
            @close="closeEditArticleDialog"
            @reload="reloadList"
          />
        </div>
      </Dialog>
      <Dialog
        v-if="confirmDeleteDialogIsVisible"
        class="flex items-center justify-center"
        @close="closeDeleteDialog"
      >
        <div class="bg-gray-100 py-8 px-5 md:px-12 text-black rounded">
          <h1 class="text-2xl font-bold mb-12 text-center">
            Confirmar eliminación
          </h1>
          <div
            class="flex flex-row bg-white shadow rounded items-center py-2 px-5 mb-12"
          >
            <img
              :src="currentArticle.image"
              class="block h-12 object-contain mr-8"
            />
            <div class="text-lg mr-8 mb-auto">
              <span class="block uppercase font-bold text-sm opacity-90"
                >Nombre</span
              >
              {{ currentArticle.displayName }}
            </div>
            <div class="text-lg mb-auto">
              <span class="block uppercase font-bold text-sm opacity-90"
                >Codigo</span
              >
              {{ currentArticle.code }}
            </div>
          </div>
          <div class="flex flex-row ml-auto">
            <Button
              class="button-md border-2 border-red-500 text-red-500 w-1/2 mr-4"
              @click="closeDeleteDialog"
            >
              Cancelar
            </Button>
            <Button
              class="button-md border-2 text-white bg-red-500 w-1/2"
              @click="deleteArticle"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>

      <Button
        class="button-md bg-green-alt-800 text-white mb-12 ml-auto shadow-md"
        @click="showAddArticleDialog"
      >
        <img src="/svg/agregar.svg" class="block h-6 mr-4" /> Nuevo
      </Button>

      <div
        class="hidden uppercase font-bold bg-white my-4 rounded shadow-product text-md 2xl:text-2xl items-center justify-start px-3 py-4 tracking-wide grid-flow-row md:grid grid-rows-1 article-rows"
      >
        <span class="ml-4">Artículo</span>
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
        class="article-rows"
        :code="article.code"
        :display-name="article.displayName"
        :stock="article.stock"
        :image="article.image"
        :amount-damaged="article.amountDamaged"
        :useless-item-count="article.uselessItemCount"
        :buttons="['delete', 'edit']"
        @delete="showDeleteDialog"
        @edit="editArticle"
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
  </div>
</template>

<script>
import AddArticleForm from "~/components/forms/AddArticleForm.vue";
import EditArticleForm from "~/components/forms/EditArticleForm.vue";
export default {
  components: { AddArticleForm, EditArticleForm },
  data: () => ({
    searchResult: {
      text: "",
      option: "",
    },
    articles: [],
    addArticleDialogIsVisible: false,
    editArticleDialogIsVisible: false,
    confirmDeleteDialogIsVisible: false,
    loaded: false,
    currentArticle: null,
    itemsPerPage: 20,
    currentPage: 1,
    firstCodes: [],
    customSearch: false,
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
  },
  created() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) return;

      this.$router.push("/login");
    });
  },
  async mounted() {
    this.articles = await this.loadData();
  },
  methods: {
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
        const data = doc.data();
        result.push(data);
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
        const data = doc.data();
        result.push(data);
      });

      this.articles = result;
      this.currentPage = this.currentPage + 1;
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
        result.push(elem);
      });
      this.articles = result;
      this.customSearch = true;
    },
    async clearSearch() {
      this.$set(this.searchResult, "text", "");
      this.customSearch = false;
      this.articles = await this.loadData();
    },
    async reloadList() {
      this.articles = await this.loadData();
    },
    async loadData() {
      const articles = await this.$fire.firestore
        .collection("articles")
        .orderBy("code", "desc")
        .limit(this.itemsPerPage)
        .get();
      const result = [];
      await articles.forEach((doc) => {
        result.push(doc.data());
      });

      this.loaded = true;
      return result;
    },
    showAddArticleDialog() {
      this.addArticleDialogIsVisible = true;
    },
    closeAddArticleDialog() {
      this.addArticleDialogIsVisible = false;
    },
    showEditArticleDialog() {
      this.editArticleDialogIsVisible = true;
    },
    closeEditArticleDialog() {
      this.editArticleDialogIsVisible = false;
    },
    showDeleteDialog(code) {
      const article = this.articles.find((entry) => entry.code === code);

      this.currentArticle = article;
      this.confirmDeleteDialogIsVisible = true;
    },
    closeDeleteDialog() {
      this.confirmDeleteDialogIsVisible = false;
    },
    deleteArticle() {
      const article = this.currentArticle;
      this.$fire.firestore.collection("articles").doc(article.code).delete();
      const index = this.articles.indexOf(article);
      this.articles.splice(index, 1);
      this.closeDeleteDialog();
    },
    editArticle(code) {
      const article = this.articles.find((entry) => entry.code === code);
      if (article === null) {
        alert("Error al editar artículo.");
        return;
      }

      this.currentArticle = article;
      this.showEditArticleDialog();
    },
  },
};
</script>
