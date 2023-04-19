<template>
  <div class="relative">
    <slot />
    <div
      v-if="shown"
      class="left-1/2 mt-2 absolute transform -translate-x-1/2 bg-gray-100 shadow rounded text-gray-600 font-bold py-3 px-8"
      @click="click"
    >
      <div
        class="triangle absolute transform"
        :class="'orientation-' + direction"
      ></div>
      {{ value }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    direction: {
      type: String,
      default: "top",
    },
    value: {
      type: String,
      default: "",
    },
    shown: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    class() {
      return "";
    },
  },
  methods: {
    click(event) {
      this.$emit("click", event);
    },
  },
};
</script>

<style>
.triangle {
  width: 0;
  height: 0;
  border: 0;
}

.triangle.orientation-top {
  border-right: 0.5em solid transparent;
  border-left: 0.5em solid transparent;
  border-bottom: 0.5em solid rgba(243, 244, 246, var(--tw-bg-opacity));
  @apply top-0 -translate-y-1/2 right-1/2 -mt-1 translate-x-1/2;
}

.triangle.orientation-bottom {
  border-right: 0.5em solid transparent;
  border-left: 0.5em solid transparent;
  border-top: 0.5em solid rgba(243, 244, 246, var(--tw-bg-opacity));
  @apply bottom-0 translate-y-1/2 right-1/2 -mb-1 translate-x-1/2;
}
</style>
