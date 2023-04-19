<template>
  <form class="flex flex-col" @submit.prevent="submit">
    <h1 class="text-2xl text-center font-bold mb-4">
      Editar gasto de utilería
    </h1>

    <div class="flex flex-row flex-wrap">
      <div class="w-full pr-0 md:w-1/2 md:pr-5 flex flex-col text-left">
        <img
          ref="image"
          :src="imagePreviewURL"
          class="block rounded-lg shadow-lg max-h-96 h-auto object-contain"
          @load="onLoad"
        />
        <image-uploader
          :max-width="512"
          :quality="0.7"
          output-format="blob"
          :preview="false"
          :capture="false"
          accept="image/*"
          do-not-resize="['gif', 'svg']"
          @input="setImage"
        ></image-uploader>
      </div>

      <div class="w-full pl-0 mt-4 md:mt-0 md:w-1/2 md:pl-5 flex flex-col">
        <Input
          v-model="displayName"
          :required="true"
          type="text"
          label="Nombre gasto"
        />
        <Input
          v-model.number="buyPrice"
          :required="true"
          type="number"
          label="Precio total de compra"
        />
        <Input
          v-model.number="amount"
          :required="true"
          type="number"
          label="Cantidad"
        />
        <Input
          v-model="description"
          mode="textarea"
          label="Descripción"
          :required="false"
        />
      </div>
      <div class="w-full">
        <div
          class="bg-green-500 h-4 rounded-full my-2"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
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
    <div
      class="flex flex-row actions w-full md:w-auto md:ml-auto mt-8"
      :class="loading ? 'opacity-75' : ''"
    >
      <Button
        class="border-2 border-green-alt-800 text-green-alt-800"
        @click="close"
      >
        Cancelar
      </Button>
      <Button type="submit" class="text-white bg-green-alt-800 ml-4">
        Guardar
      </Button>
    </div>
  </form>
</template>

<script>
import ImageUploader from "vue-image-upload-resize";

export default {
  components: {
    ImageUploader,
  },
  props: {
    gasto: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    loading: false,
    displayName: "",
    buyPrice: 0,
    amount: 1,
    description: "",
    image: null,
    progress: 0,
    imagePreviewURL: "/sin-imagen.jpg",
    errors: [],
  }),
  created() {
    this.displayName = this.gasto.displayName;
    this.buyPrice = this.gasto.buyPrice;
    this.amount = this.gasto.amount;
    this.description = this.gasto.description;
    if (this.gasto.image) {
      this.imagePreviewURL = this.gasto.image;
    }
  },
  methods: {
    validateForm() {
      this.errors = [];

      if (this.buyPrice <= 0) {
        this.errors.push("El precio de compra debe ser mayor a 0");
      }

      if (this.amount <= 0) {
        this.errors.push("La cantidad debe ser mayor a 0");
      }

      return this.errors.length === 0;
    },
    getGasto() {
      const { displayName, buyPrice, amount, description } = this;
      const gasto = {
        displayName,
        buyPrice,
        amount,
        description,
        date: this.gasto.date,
      };
      return gasto;
    },
    async submit() {
      if (!this.validateForm() || this.loading) return;

      this.loading = true;
      const gasto = this.getGasto();

      const docRef = this.$fire.firestore
        .collection("gastos")
        .doc(this.gasto.id);

      const image = this.image;
      if (image === null) {
        await docRef.set(gasto).then(this.success).catch(this.error);
        this.loading = false;
        return;
      }

      const cloudName = "dhw01ntxa";
      const unsignedUploadPreset = "ucyetfty";

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

      // Update progress (can be used to show progress indicator)
      xhr.upload.onprogress = (e) => {
        this.progress = Math.round((e.loaded * 100.0) / e.total);
      };

      xhr.onreadystatechange = async () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          let url = response.secure_url;
          const urlsplit = url.split("/");
          urlsplit.splice(6, 0, "q_40,w_400");
          url = urlsplit.join("/");
          gasto.image = url;
          await docRef
            .set(gasto)
            .then(() => this.success(url))
            .catch(this.error);
          this.loading = false;
        }
      };

      fd.append("upload_preset", unsignedUploadPreset);
      fd.append("tags", "browser_upload"); // Optional - add tag for image admin in Cloudinary
      fd.append("file", image);
      xhr.send(fd);
    },
    close() {
      if (this.loading) return;
      this.$emit("close");
    },
    error(error) {
      this.loading = false;
      if (typeof error === "string") {
        alert(error);
        return;
      }

      alert("Ha ocurrido un error inesperado.");
    },
    success(image) {
      const id = this.gasto.id;
      const gasto = this.getGasto();
      if (image !== undefined) {
        gasto.image = image;
      }
      this.loading = false;
      this.$emit("update", { id, ...gasto });
      this.close();
    },
    onLoad() {
      URL.revokeObjectURL(this.$refs.image.src);
    },
    setImage(blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.imagePreviewURL = reader.result;
      };
      this.image = blob;
      reader.readAsDataURL(blob);
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

form {
  label {
    margin-bottom: 0.5rem;
  }
}
</style>
