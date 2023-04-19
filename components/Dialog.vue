<template>
  <transition name="fade" appear>
    <div
      ref="modal"
      class="fixed top-0 left-0 w-screen h-screen z-10 modal"
      tabindex="-1"
      @blur.capture="blur"
    >
      <div
        class="bg-black opacity-70 w-full h-full absolute top-0 left-0 z-20 modal-bg"
        @click.self="$emit('close')"
      />
      <slot />
    </div>
  </transition>
</template>

<script>
export default {
  mounted() {
    this.$refs.modal.focus();
  },
  methods: {
    blur(event) {
      if (this.$refs === undefined || this.$refs.modal === undefined) return;

      const modal = this.$refs.modal;

      setTimeout(() => {
        const focusedElement = document.activeElement;
        if (modal.contains(focusedElement)) return;

        this.$emit("close");
      }, 10);
    },
  },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.modal > *:not(.modal-background) {
  @apply absolute z-50 overflow-y-auto max-h-screen mx-auto;
}
</style>
