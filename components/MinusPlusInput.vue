<template>
  <div class="flex flex-row items-center justify-center minusplusinput">
    <button type="button" @click="subtract">
      <img class="block h-10" src="/svg/circled-minus-sign.svg" />
    </button>
    <input
      role="textbox"
      class="w-3/5 mx-2 px-2 py-1 text-lg bg-white focus:outline-none border-2 border-gray-300 focus:border-gray-700 rounded-lg whitespace-nowrap overflow-x-hidden text-center"
      contenteditable
      type="number"
      :value="value"
      :min="min"
      :max="max"
      @input="handleInput"
      @keypress="update"
    />
    <button type="button" @click="add">
      <img src="/svg/circled-add-sign.svg" class="block h-10" />
    </button>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: Number.MIN_VALUE,
    },
    max: {
      type: Number,
      default: Number.MAX_VALUE,
    },
  },
  methods: {
    handleInput(event) {
      this.emitValue(event.target.value);
    },
    add() {
      this.emitValue(this.value + 1);
    },
    subtract() {
      this.emitValue(this.value - 1);
    },
    emitValue(value) {
      let number = value;
      if (isNaN(number) || number < this.min) {
        number = 0;
      }

      if (number > this.max) {
        number = this.max;
      }

      this.$emit("input", Math.floor(number));
    },
    update(event) {
      if (event.key !== ".") return;

      event.preventDefault();
    },
  },
};
</script>

<style lang="scss" scoped>
.minusplusinput {
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  span {
    max-width: 80px;
    min-width: 4rem;
  }
}
</style>
