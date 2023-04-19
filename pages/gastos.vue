<template>
  <div>
    <h1
      class="text-center text-gray-900 font-medium text-3xl lg:text-5xl mb-12"
    >
      Gastos de utilería
    </h1>

    <div class="flex flex-row flex-wrap items-center mx-auto">
      <Searchbar
        v-model="searchResult"
        class="sm:ml-auto sm:mr-4 w-full max-w-3xl mb-4 md:mb-0"
        placeholder="Buscar por..."
        :options="['nombre']"
      />
      <refresh-button class="mr-auto" @refresh="reloadList" />
    </div>

    <!-- Add gasto -->
    <div class="pb-24 mt-8">
      <Dialog
        v-if="addGastoDialogIsVisible"
        class="flex items-center justify-center"
        @close="toggleAddGastoDialog"
      >
        <div
          class="bg-gray-100 rounded-2xl max-w-4xl w-full mx-auto py-4 px-5 md:px-12"
        >
          <add-gasto-form @close="toggleAddGastoDialog" @add="addGasto" />
        </div>
      </Dialog>

      <!-- Edit gasto -->
      <Dialog
        v-if="editGastoDialogIsVisible"
        class="flex items-center justify-center"
        @close="toggleEditGastoDialog"
      >
        <div
          class="bg-gray-100 rounded-2xl max-w-4xl mx-auto py-4 px-5 md:px-12"
        >
          <edit-gasto-form
            :gasto="selectedGasto"
            @close="toggleEditGastoDialog"
            @update="updateGasto"
          />
        </div>
      </Dialog>

      <!-- Delete gasto -->
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
              :src="selectedGasto.image"
              class="block h-12 object-contain mr-8"
            />
            <div class="text-lg mb-auto">
              <span class="block uppercase font-bold text-sm opacity-90"
                >Nombre</span
              >
              {{ selectedGasto.displayName }}
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
              @click="deleteGasto"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>

      <!-- Open add gasto dialog -->
      <Button
        class="button-md bg-green-alt-800 text-white mb-12 ml-auto shadow-md"
        @click="toggleAddGastoDialog"
      >
        <img src="/svg/agregar.svg" class="block h-6 mr-4" /> Nuevo
      </Button>

      <div
        class="hidden uppercase font-bold bg-white my-4 rounded shadow-product text-md 2xl:text-2xl items-center justify-start px-3 py-4 tracking-wide grid-flow-row md:grid grid-rows-1 gasto-rows"
      >
        <span class="ml-4">Compra</span>
        <span class="ml-4 text-center">Cantidad</span>
        <span class="ml-4 text-center">Fecha</span>
        <span class="ml-4 text-center">Precio Total</span>
      </div>

      <h3
        v-if="!loaded"
        class="text-3xl font-bold text-center mt-20 text-gray-700"
      >
        Cargando...
      </h3>

      <h3
        v-if="loaded && gastos.length === 0"
        class="text-3xl font-bold text-center mt-20 text-gray-700"
      >
        No hay gastos
      </h3>

      <!-- list of gastos -->
      <listable-gasto
        v-for="gasto in filteredGastos"
        :id="gasto.id"
        :key="gasto.id"
        :display-name="gasto.displayName"
        :amount="gasto.amount"
        :image="gasto.image"
        :buy-price="gasto.buyPrice"
        :date="gasto.date"
        @edit="editGasto"
        @delete="showDeleteDialog"
      />
    </div>
  </div>
</template>

<script>
import RefreshButton from "~/components/buttons/RefreshButton.vue";
import AddGastoForm from "~/components/forms/gastos/AddGastoForm.vue";
import EditGastoForm from "~/components/forms/gastos/EditGastoForm.vue";
import ListableGasto from "~/components/ListableGasto.vue";
export default {
  components: { RefreshButton, AddGastoForm, ListableGasto, EditGastoForm },
  data: () => ({
    searchResult: {
      text: "",
      option: "",
    },
    gastos: [],
    addGastoDialogIsVisible: false,
    editGastoDialogIsVisible: false,
    confirmDeleteDialogIsVisible: false,
    loaded: false,
    selectedGasto: null,
  }),
  computed: {
    filteredGastos() {
      return this.gastos.filter((entry) =>
        entry.displayName
          .toLowerCase()
          .includes(this.searchResult.text.toLowerCase())
      );
    },
  },
  created() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) return;

      this.$router.push("/login");
    });
  },
  async mounted() {
    this.gastos = await this.loadData();
  },
  methods: {
    addGasto(gasto) {
      this.gastos.push(gasto);
    },
    updateGasto(newGasto) {
      const gasto = this.gastos.find((entry) => entry.id === newGasto.id);
      const index = this.gastos.indexOf(gasto);

      this.$set(this.gastos, index, newGasto);
    },
    async reloadList() {
      this.gastos = await this.loadData();
    },
    async loadData() {
      const gastos = await this.$fire.firestore.collection("gastos").get();
      const result = [];
      await gastos.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        result.push(data);
      });

      this.loaded = true;
      return result;
    },
    toggleAddGastoDialog() {
      this.addGastoDialogIsVisible = !this.addGastoDialogIsVisible;
    },
    toggleEditGastoDialog() {
      this.editGastoDialogIsVisible = !this.editGastoDialogIsVisible;
    },
    showDeleteDialog(id) {
      const gasto = this.gastos.find((entry) => entry.id === id);

      this.selectedGasto = gasto;
      this.confirmDeleteDialogIsVisible = true;
    },
    closeDeleteDialog() {
      this.confirmDeleteDialogIsVisible = false;
    },
    deleteGasto() {
      const gasto = this.selectedGasto;
      this.$fire.firestore.collection("gastos").doc(gasto.id).delete();
      const index = this.gastos.indexOf(gasto);
      this.gastos.splice(index, 1);
      this.closeDeleteDialog();
    },
    editGasto(id) {
      const gasto = this.gastos.find((entry) => entry.id === id);
      if (gasto === null) {
        alert("Error al editar artículo.");
        return;
      }

      this.selectedGasto = gasto;
      this.toggleEditGastoDialog();
    },
  },
};
</script>
