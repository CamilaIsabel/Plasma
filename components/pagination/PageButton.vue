<template>
  <div
    v-if="pageNumber === '...' || (pageNumber > 0 && pageNumber <= totalPages)"
  >
    <button
      v-if="pageNumber > 0 && pageNumber <= totalPages"
      :class="selected ? 'selected' : ''"
      @click="emitClick"
    >
      {{ pageNumber }}
    </button>
    <button v-if="pageNumber === '...'" class="opacity-50 pointer-events-none">
      ...
    </button>
  </div>
</template>

<script>
export default {
  props: {
    pageNumber: {
      type: [Number, String],
      required: false,
      default: 0,
    },
    totalPages: {
      type: Number,
      required: false,
      default: 0,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    selected: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    emitClick() {
      if (this.disabled || this.selected) return;
      if (this.pageNumber === "...") return;
      this.$emit("clicked", this.pageNumber);
    },
    handlePosition() {
      if (this.disabled) return;
      this.$emit("move", this.position);
    },
  },
};
</script>

<style scoped>
button {
  @apply rounded shadow border-green-alt-800 border-2 text-green-alt-800 font-bold px-0 lg:px-5 py-3 w-full;
}

button.selected {
  @apply bg-green-alt-800 text-white;
}
</style>
