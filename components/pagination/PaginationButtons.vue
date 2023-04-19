<template>
  <div v-if="totalPages > 0" class="flex flex-row justify-center items-center">
    <PageButton
      v-for="(pageNumber, i) in displayedPages"
      :key="i"
      :total-pages="totalPages"
      :page-number="pageNumber"
      :selected="currentPage == pageNumber"
      class="flex-grow md:flex-grow-0 md:mx-2"
      @clicked="moveToPage"
    />
  </div>
</template>

<script>
import PageButton from "./PageButton.vue";

export default {
  components: {
    PageButton,
  },
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },
  computed: {
    displayedPages() {
      const currentPage = this.currentPage;
      const totalPages = this.totalPages;

      const pages = [];

      if (currentPage >= 3) {
        pages.push(1);
      }

      if (currentPage > 3) {
        pages.push("...");
      }

      pages.push(currentPage - 1, currentPage, currentPage + 1);

      if (currentPage <= totalPages - 3) {
        pages.push("...");
      }

      if (currentPage <= totalPages - 2) {
        pages.push(totalPages);
      }

      return pages;
    },
  },
  methods: {
    moveToPage(number) {
      this.$emit("pageChange", number);
    },
  },
};
</script>

<style></style>
