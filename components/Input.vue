<template>
  <label
    class="text-gray-900 font-medium flex flex-col-reverse"
    :class="disabled ? 'cursor-not-allowed' : ''"
  >
    <input
      v-if="mode === 'input'"
      :value="value"
      class="input"
      :max="max"
      :min="min"
      :placeholder="placeholder"
      :required="required"
      :type="type"
      :disabled="disabled"
      @input="handleInput"
    />
    <textarea
      v-else
      :value="value"
      class="input"
      :placeholder="placeholder"
      :required="required"
      :type="type"
      :disabled="disabled"
      rows="4"
      @input="handleInput"
    />
    <div class="flex flex-row justify-between items-end">
      <span class="text-lg" :class="disabled ? 'opacity-40' : ''">{{
        label
      }}</span>
      <nuxt-link
        v-if="helpLink.text.length > 0"
        class="text-md text-green-700 hover:underline text-right"
        :to="helpLink.url"
      >
        {{ helpLink.text }}
      </nuxt-link>
    </div>
  </label>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
    value: {
      type: [String, Number],
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    helpLink: {
      type: Object,
      default: () => ({
        text: "",
        url: "",
      }),
    },
    mode: {
      type: String,
      default: "input",
    },
    max: {
      type: Number,
      default: null,
    },
    min: {
      type: Number,
      default: null,
    },
  },
  methods: {
    handleInput(event) {
      this.$emit("input", event.target.value);
    },
  },
};
</script>

<style></style>
