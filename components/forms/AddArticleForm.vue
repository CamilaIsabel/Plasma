<template>
  <form class="flex flex-col" @submit.prevent="submit">
    <h1 class="text-2xl text-center font-bold mb-4">Nuevo Artículo</h1>

    <div class="flex flex-row flex-wrap">
      <div class="w-full pr-0 md:w-1/2 md:pr-5 flex flex-col text-left">
        <img
          ref="image"
          :src="imagePreviewURL"
          class="block rounded-lg shadow-lg max-h-96 object-contain h-auto"
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
          label="Nombre artículo"
        />
        <Input
          v-model="code"
          :required="true"
          type="text"
          label="Código artículo"
        />
        <div class="flex flex-row">
          <Input
            v-model.number="buyPrice"
            class="flex-grow"
            :required="true"
            type="number"
            label="Precio compra"
          />
          <Input
            v-model.number="sellPrice"
            class="flex-grow ml-4"
            :required="true"
            type="number"
            label="Precio venta"
          />
        </div>
        <Input
          v-model.number="stock"
          :required="true"
          type="number"
          label="Stock total"
        />
        <Input
          v-model.number="uselessItemCount"
          :required="true"
          type="number"
          label="Artículos irrecuperables"
        />
        <Input
          v-model.number="amountDamaged"
          :required="true"
          type="number"
          label="Artículos dañados revendibles"
        />
      </div>
      <div class="w-full">
        <Input
          v-model="description"
          mode="textarea"
          label="Descripción"
          :required="false"
        />
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
        Crear
      </Button>
    </div>
  </form>
</template>

<script>
import ImageUploader from "vue-image-upload-resize";
import { generateKeywords } from "@/lib/KeywordUtils.js";

export default {
  components: {
    ImageUploader,
  },
  data: () => ({
    loading: false,
    displayName: "",
    code: "",
    sellPrice: 0,
    buyPrice: 0,
    stock: 0,
    uselessItemCount: 0,
    amountDamaged: 0,
    description: "",
    image: null,
    progress: 0,
    imagePreviewURL: "/sin-imagen.jpg",
    errors: [],
  }),
  methods: {
    keywords() {
      return generateKeywords(this.displayName);
    },
    validateForm() {
      this.errors = [];

      if (this.buyPrice > this.sellPrice) {
        this.errors.push(
          "El precio de compra no puede superar el precio de venta"
        );
      }

      if (this.buyPrice < 0) {
        this.errors.push("El precio de compra debe ser mayor a 0");
      }

      if (this.uselessItemCount + this.amountDamaged > this.stock) {
        this.errors.push(
          "La cantidad de artículos irrecuperables y artículos revendibles no puede superar el stock"
        );
      }

      if (
        this.uselessItemCount < 0 ||
        this.stock < 0 ||
        this.amountDamaged < 0
      ) {
        this.errors.push(
          "Los valores de stock no pueden ser números negativos"
        );
      }

      return this.errors.length === 0;
    },
    async submit() {
      if (!this.validateForm() || this.loading) return;

      this.loading = true;
      const {
        displayName,
        code,
        sellPrice,
        buyPrice,
        stock,
        uselessItemCount,
        amountDamaged,
        description,
      } = this;
      const article = {
        displayName,
        code,
        sellPrice,
        buyPrice,
        stock,
        uselessItemCount,
        amountDamaged,
        description,
        keywords: this.keywords(),
      };

      const docRef = this.$fire.firestore.collection("articles").doc(code);

      const doc = await docRef.get();
      if (doc.exists) {
        this.error("Ya existe un producto con ese codigo!");
        this.loading = false;
        return;
      }

      article.stock -= article.uselessItemCount;
      this.addCostOfUselessItems(article);
      article.uselessItemCount = 0;

      const image = this.image;
      if (image === null) {
        await docRef.set(article).then(this.success).catch(this.error);
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
          article.image = url;
          await docRef.set(article).then(this.success).catch(this.error);
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
    success() {
      this.loading = false;
      this.$emit("reload");
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
    addCostOfUselessItems(article) {
      if (article.uselessItemCount <= 0) return;

      const entry = {
        code: article.code,
        name: article.displayName,
        amount: article.uselessItemCount,
        buyCost: article.buyPrice * article.uselessItemCount,
        date: new Date(),
      };

      this.$fire.firestore.collection("waste").add(entry);
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
