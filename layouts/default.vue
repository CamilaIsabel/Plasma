<template>
  <div>
    <div class="container mx-auto mt-8">
      <div class="overflow-x-auto py-2 mb-8">
        <nav class="flex flex-row items-center justify-end w-max ml-auto">
          <nuxt-link
            v-for="link in links"
            :key="link.url"
            :to="link.url"
            :class="
              $route.path.startsWith(link.url)
                ? 'text-indigo-500'
                : 'text-gray-600'
            "
            class="p-1 mx-2 font-semibold hover:text-indigo-500"
          >
            {{ link.label }}
          </nuxt-link>
        </nav>
      </div>

      <div class="px-2">
        <Nuxt />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    links: [
      { url: "/vender", label: "Vender artículo" },
      { url: "/gastos", label: "Gastos de utilería" },
      { url: "/agregar", label: "Agregar artículo" },
      { url: "/facturas", label: "Facturas" },
      { url: "/ganancia", label: "Ganancia" },
    ],
  }),
};
</script>

<style>
body {
  background-color: #f7f7fc;
}
</style>
