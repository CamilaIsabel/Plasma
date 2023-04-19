<template>
  <div class="flex justify-center">
    <label
      for="toogleButton"
      class="flex items-center cursor-pointer"
      :class="value ? 'active' : 'inactive'"
    >
      <div class="relative">
        <input
          id="toogleButton"
          type="checkbox"
          class="hidden"
          :value="value"
          @input="handleInput"
        />
        <div
          class="toggle-path bg-gray-400 w-9 h-5 rounded-full shadow-inner"
        ></div>
        <div
          class="toggle-circle absolute w-3.5 h-3.5 bg-white rounded-full shadow inset-y-0 left-0"
        ></div>
      </div>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleInput(event) {
      this.$emit("input", event.target.value === "false");
    },
  },
};
</script>

<style>
.toggle-path {
  transition: background-color 0.3s ease-in-out;
}
.toggle-circle {
  top: 0.2rem;
  left: 0.25rem;
  transition: all 0.3s ease-in-out;
  transform: translateX(0);
}

.active .toggle-path {
  @apply bg-green-300;
}

.active .toggle-circle {
  transform: translateX(100%);
}
</style>
