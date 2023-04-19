<template>
  <form @submit.prevent="() => save(true)">
    <div
      v-if="loading"
      class="flex flex-col mt-48 text-center items-center justify-center"
    >
      <loading-spinner class="text-gray-900 w-32 h-32" />
      <span class="text-2xl mt-8">Cargando factura...</span>
    </div>
    <div v-if="!loading && !notFound" class="pb-12 relative">
      <button type="button" class="mr-auto p-2 text-black" @click="goBack">
        <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"
          />
        </svg>
      </button>
      <div
        :class="hasBeenSaved ? 'opacity-0 select-none' : 'opacity-100'"
        class="max-w-sm rounded shadow bg-red-100 text-red-600 border-2 border-red-600 font-bold text-center py-4 px-2 mx-auto mb-8"
      >
        Tiene cambios sin guardar en la factura.
        <br />
        Para guardarla utilice el botón "Guardar"
      </div>
      <h1
        class="text-center text-gray-900 font-medium text-3xl lg:text-5xl mb-12"
      >
        Configurar factura
      </h1>
      <button
        type="button"
        title="Eliminar"
        class="flex flex-row items-center text-red-500 border-1 border-red-500 bg-red-50 rounded-full py-2 px-5 mx-auto md:ml-auto md:mr-0"
        @click="toggleDeleteDialog"
      >
        Eliminar factura
        <img class="block ml-4 w-6 h-6" src="/svg/borrar.svg" alt="Eliminar" />
      </button>
      <div class="flex flex-row flex-wrap justify-around">
        <div ref="factura-comercio" class="my-8">
          <div class="factura-display">
            <span class="text-2xl text-center font-medium title block"
              >Factura comercio</span
            >
            <Factura
              ref="factura"
              :items="items"
              :date="date"
              :customer="customer"
              :paid-amount="paidAmount"
              :message="message"
              :picked-up="pickedUp"
              :discount="discount"
              @customerNameChange="updateCustomerName"
              @paidAmoutInput="updatePaidAmount"
              @descriptionInput="updateDescription"
            />
          </div>
        </div>
        <div ref="factura-cliente" class="my-8">
          <div class="factura-display">
            <span class="text-2xl block text-center font-medium mb-4 title"
              >Factura cliente</span
            >
            <Factura
              :items="items"
              :date="date"
              :customer="customer"
              :paid-amount="paidAmount"
              :picked-up="pickedUp"
              :discount="discount"
              :message-visible="false"
              @customerNameChange="updateCustomerName"
              @paidAmoutInput="updatePaidAmount"
              @descriptionInput="updateDescription"
            />
          </div>
        </div>
      </div>
      <div class="flex flex-row flex-wrap mt-12">
        <div class="flex flex-row items-center">
          <span class="text-2xl font-medium">Retiro artículo</span>
          <ToggleSwitch
            class="mx-4"
            :value="pickedUp"
            @input="togglePickedUp"
          />
          <div
            :class="pickedUp ? 'bg-green-600' : 'bg-red-500'"
            class="text-white px-2 py-1 rounded-full text-lg font-bold"
          >
            {{ pickedUp ? "si" : "no" }}
          </div>
        </div>
        <div class="flex flex-row flex-wrap ml-auto md:mt-0 mt-4">
          <Button
            class="button-md bg-yellow-500 text-white md:mr-4 mb-4 md:mb-0 md:w-auto w-full"
            @click="toggleRestoreModal"
          >
            <div class="flex flex-row items-center justify-center">
              <img
                src="/svg/refresh.svg"
                alt="Refrescar"
                class="block mr-2 h-6 w-6"
              />
              <span>Restaurar Factura</span>
            </div></Button
          >
          <Button
            class="button-md bg-gray-700 text-white md:mr-4 mb-4 md:mb-0 md:w-auto w-full"
            @click="() => (printing = true)"
            >Imprimir</Button
          >
          <Button
            class="button-md bg-green-alt-800 text-white md:w-auto w-full"
            type="submit"
            >Guardar</Button
          >
        </div>
      </div>
    </div>
    <Dialog
      v-if="showRestoreModal"
      class="flex items-center justify-center"
      @close="toggleRestoreModal"
    >
      <div
        class="bg-gray-100 rounded-2xl max-w-md w-full mx-auto py-4 px-5 md:px-12 flex flex-col"
      >
        <h1 class="text-2xl text-gray-800 text-center font-bold mb-4">
          Restaurar Factura
        </h1>
        <p class="text-center text-md text-gray-700">
          La factura se borrará y todos sus artículos y descuentos serán
          agregados al carrito automáticamente.
        </p>
        <div class="flex mt-8 flex-row flex-wrap md:flex-nowrap">
          <Button
            class="button-md bg-gray-700 text-white mb-3 md:mb-0 md:mr-3 w-full"
            @click="toggleRestoreModal"
            >Cancelar</Button
          >
          <Button
            class="button-md bg-yellow-500 text-white w-full"
            @click="restore"
            >Restaurar</Button
          >
        </div>
      </div>
    </Dialog>
    <Dialog
      v-if="showDeleteDialog"
      class="flex items-center justify-center"
      @close="toggleDeleteDialog"
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
            @click="toggleDeleteDialog"
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
    <Dialog
      v-if="printing"
      class="flex items-center justify-center"
      @close="() => (printing = false)"
    >
      <div
        class="bg-gray-100 rounded-2xl max-w-sm w-full mx-auto py-4 px-5 md:px-12 flex flex-col"
      >
        <label class="flex flex-row items-center mr-2 my-4">
          <span class="mr-auto text-xl font-bold text-green-800"
            >Factura comercio</span
          >
          <input
            v-model="printComercio"
            type="checkbox"
            class="checkbox checkbox ml-4"
          />
        </label>
        <label class="flex flex-row items-center mr-2">
          <span class="mr-auto text-xl font-bold text-green-800"
            >Factura cliente</span
          >
          <input
            v-model="printCliente"
            type="checkbox"
            class="checkbox checkbox ml-4"
          />
        </label>

        <Button
          class="mt-8 button-md bg-green-alt-800 shadow-md text-white"
          @click="print"
          >Imprimir</Button
        >
      </div>
    </Dialog>
  </form>
</template>

<script>
export default {
  beforeRouteLeave(to, from, next) {
    if (this.hasBeenSaved) return next();
    next(
      window.confirm(
        "Desea continuar? no ha guardado los cambios de la factura."
      )
    );
  },
  asyncData({ params, from }) {
    const id = params.id;
    return { id, from };
  },
  data: () => ({
    items: [],
    date: new Date(),
    customer: "",
    message: "",
    pickedUp: false,
    loading: true,
    notFound: false,
    paidAmount: 0,
    printing: false,
    printComercio: true,
    printCliente: true,
    hasBeenSaved: true,
    showRestoreModal: false,
    discount: 0,
    showDeleteDialog: false,
    restoreStock: false,
    deletionInProcess: false,
  }),
  async created() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) return;

      this.$router.push("/login");
    });
    const id = this.id;
    const doc = await this.$fire.firestore
      .collection("purchases")
      .doc(id)
      .get();

    this.loading = false;
    if (!doc.exists) {
      this.notFound = true;
      return;
    }

    const purchase = doc.data();
    this.items = purchase.items;
    this.date = new Date(purchase.date.seconds * 1000);

    if (purchase.discount) {
      this.discount = purchase.discount;
    }

    if (purchase.message) {
      this.message = purchase.message;
    }
    if (purchase.customer) {
      this.customer = purchase.customer;
    }
    if (purchase.paidAmount) {
      this.paidAmount = purchase.paidAmount;
    }
    if (purchase.pickedUp) {
      this.pickedUp = purchase.pickedUp;
    }
  },
  methods: {
    toggleRestoreModal() {
      this.showRestoreModal = !this.showRestoreModal;
    },
    updateCustomerName(value) {
      this.customer = value;
      this.edit();
    },
    updatePaidAmount(value) {
      this.paidAmount = value;
      this.edit();
    },
    updateDescription(value) {
      this.message = value;
      this.edit();
    },
    togglePickedUp(value) {
      this.pickedUp = value;
      this.edit();
    },
    edit() {
      this.hasBeenSaved = false;
    },
    async save(push) {
      this.$store.commit("clear");
      this.$store.commit("clearCustomerName");

      if (this.customer.trim() === "") {
        this.customer = "Sin nombre";
      }

      await this.$fire.firestore
        .collection("purchases")
        .doc(this.id)
        .update({
          date: new Date(),
          customer: this.customer,
          message: this.message,
          pickedUp: this.pickedUp,
          paidAmount: this.paidAmount,
          paid: this.$refs.factura.debt === 0,
        });
      this.hasBeenSaved = true;
      if (!push) return;
      alert("Factura guardada!");
      this.$router.push("/facturas");
    },
    async deletePurchase() {
      return await this.$fire.firestore
        .collection("purchases")
        .doc(this.id)
        .delete();
    },
    print() {
      if (!this.printComercio && !this.printCliente) {
        alert("Por favor seleccione al menos una opción.");
        return;
      }

      let facturaComercio = this.$refs["factura-comercio"];
      let facturaCliente = this.$refs["factura-cliente"];
      facturaComercio = facturaComercio.cloneNode(true);
      facturaCliente = facturaCliente.cloneNode(true);

      let section = document.getElementById("print");

      if (!section) {
        section = document.createElement("div");
        section.id = "print";
        document.body.appendChild(section);
      }

      section.innerHTML = "";

      if (this.printComercio) {
        section.innerHTML += facturaComercio.innerHTML;
      }
      if (this.printCliente) {
        section.innerHTML += facturaCliente.innerHTML;
      }

      setTimeout(() => {
        this.printing = false;

        window.print();
        this.save();
      }, 100);
    },
    async restore() {
      this.hasBeenSaved = true;
      // save items to vuex store
      this.$store.commit("setItems", this.items);

      // save current customer data to vuex store
      this.$store.commit("setCustomerName", this.customer);
      this.$store.commit("setDescription", this.message);

      // restock items
      const articlesRef = this.$fire.firestore.collection("articles");
      this.items.forEach(async (item) => {
        const id = item.code;

        if (item.damagedAmount > 0) {
          const damagedDecrement = this.$fireModule.firestore.FieldValue.increment(
            item.damagedAmount
          );
          await articlesRef.doc(id).update({ amountDamaged: damagedDecrement });
        }

        const stockIncrement = this.$fireModule.firestore.FieldValue.increment(
          item.amount
        );
        await articlesRef.doc(id).update({ stock: stockIncrement });
      });

      // delete the purchase
      await this.deletePurchase();

      this.$router.push("/vender");
    },
    toggleDeleteDialog() {
      this.deletionInProcess = false;
      this.showDeleteDialog = !this.showDeleteDialog;
    },
    async deleteFactura() {
      this.deletionInProcess = true;

      if (this.restoreStock) {
        const articlesRef = this.$fire.firestore.collection("articles");
        this.items.forEach(async (item) => {
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

      await this.$fire.firestore.collection("purchases").doc(this.id).delete();
      this.$router.push("/facturas");
    },
    goBack() {
      this.$router.back();
    },
  },
};
</script>

<style>
@media screen {
  #print {
    display: none;
  }

  .factura-display {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .factura-display .factura {
    flex-grow: 1;
  }
}

@media print {
  * {
    visibility: hidden !important;
  }

  .factura-display {
    min-height: 11.69in;
    break-after: page;
    break-before: page;
    page-break-after: always;
    page-break-before: always;
  }

  #print,
  #print * {
    visibility: visible !important;
    -webkit-print-color-adjust: exact;
  }
  #print *::placeholder {
    color: transparent !important;
  }
  input,
  textarea {
    display: none !important;
    opacity: 0;
  }
  #print {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    width: 100%;

    justify-content: center;
    align-items: center;
  }
}
</style>
