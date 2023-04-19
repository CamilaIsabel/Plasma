<template>
  <div>
    <img src="/svg/cohete.svg" class="mx-auto" alt="SAS" />
    <h1 class="text-center text-gray-900 font-medium text-3xl mb-12">
      Restablecer contraseña
    </h1>
    <form
      ref="form"
      class="mx-auto max-w-md w-full pb-6 px-8 pt-4 text-left flex flex-col items-stretch rounded-xl shadow-lg bg-gray-100"
      @submit.prevent="sendResetPasswordEmail"
    >
      <Input
        v-model="email"
        :required="true"
        type="email"
        placeholder="correo@mail.com"
        label="Correo electrónico"
        class="mb-4"
      />
      <Button
        class="rounded bg-green-700 shadow mt-12 py-4 tracking-wider text-xl uppercase text-white font-bold"
        @click="submitForm"
      >
        Enviar correo
      </Button>
    </form>
  </div>
</template>

<script>
export default {
  data: () => ({
    email: "",
  }),
  methods: {
    sendResetPasswordEmail() {
      this.$fire.auth
        .sendPasswordResetEmail(this.email)
        .then(this.handleSuccess);
    },
    submitForm() {
      this.$refs.form.submit();
    },
    handleSuccess() {
      alert("Correo de reinicio de contraseña enviado");
      this.$router.push("/login");
    },
    handleError() {
      alert("Error inesperado");
    },
  },
};
</script>

<style></style>
