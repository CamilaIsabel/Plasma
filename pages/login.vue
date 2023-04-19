<template>
  <div>
    <img src="/svg/cohete.svg" class="mx-auto" alt="SAS" />
    <h1 class="text-center text-gray-900 font-medium text-3xl mb-12">
      Inicie Sesión en SAP
    </h1>
    <form
      ref="form"
      class="mx-auto max-w-md w-full pb-6 px-8 pt-4 text-left flex flex-col items-stretch rounded-xl shadow-lg bg-gray-100"
      @submit.prevent="signIn"
    >
      <Input
        v-model="email"
        :required="true"
        type="email"
        placeholder="correo@mail.com"
        label="Correo electrónico"
        class="mb-8"
      />
      <Input
        v-model="password"
        :required="true"
        type="password"
        label="Contraseña"
        :help-link="{
          text: '¿Olvidaste tu contraseña?',
          url: '/password-reset',
        }"
      />
      <Button
        class="rounded bg-green-700 shadow mt-12 py-4 tracking-wider text-xl uppercase text-white font-bold"
        type="submit"
        >Ingresar</Button
      >
    </form>
  </div>
</template>

<script>
export default {
  data: () => ({
    email: "",
    password: "",
  }),
  methods: {
    signIn() {
      this.$fire.auth
        .signInWithEmailAndPassword(this.email, this.password)
        .then(this.handleSuccess)
        .catch(this.handleError);
    },
    handleSuccess() {
      this.$router.push("/");
    },
    handleError(error) {
      if (error.code === "auth/wrong-password") {
        alert("Contraseña incorrecta");
        return;
      }

      if (error.code === "auth/user-not-found") {
        alert("Usuario no encontrado");
        return;
      }

      alert("Error inesperado");
    },
  },
};
</script>

<style></style>
