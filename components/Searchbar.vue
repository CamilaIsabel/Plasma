<template>
  <label
    class="text-gray-900 text-lg font-medium flex flex-row shadow-md rounded-full bg-gray-200"
  >
    <input
      :value="value.text"
      class="w-full px-8 py-3 placeholder-gray-400 bg-gray-200 rounded-l-full text-gray-700 focus:outline-none font-medium"
      :placeholder="placeholder"
      type="text"
      @input="handleInput"
    />
    <div v-if="options.length > 0" class="px-8 py-3">
      <div
        class="border-l-2 pl-4 border-gray-400 capitalize"
        :class="options.length > 1 ? 'cursor-pointer' : ''"
      >
        <Tooltip
          :value="anotherOption"
          :shown="showOption"
          @click="toggleOption"
        >
          <span
            :class="options.length > 1 ? 'cursor-pointer' : ''"
            class="font-bold select-none"
            @click="toggleModal"
            >{{ getSelectedOption }}</span
          >
        </Tooltip>
      </div>
    </div>
  </label>
</template>

<script>
export default {
  props: {
    placeholder: {
      type: String,
      default: "",
    },
    value: {
      type: Object,
      default: () => ({ text: "", option: "" }),
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    selectedOption: 0,
    showOption: false,
  }),
  computed: {
    anotherOption() {
      return this.options.filter(
        (option) => this.options.indexOf(option) !== this.selectedOption
      )[0];
    },
    getSelectedOption() {
      return this.options[this.selectedOption];
    },
  },
  methods: {
    toggleModal() {
      if (this.options.length < 2) {
        return;
      }

      this.showOption = !this.showOption;
    },
    handleInput(event) {
      this.$emit("input", {
        text: event.target.value,
        option: this.getSelectedOption,
      });
    },
    toggleOption() {
      this.showOption = false;
      if (this.selectedOption === 0) {
        this.selectedOption++;
      } else {
        this.selectedOption = 0;
      }

      this.$emit("input", {
        text: "",
        option: this.getSelectedOption,
      });
    },
  },
};
</script>

<style></style>
