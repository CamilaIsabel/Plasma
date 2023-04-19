<template>
  <div>
    <h1
      class="text-center text-gray-900 font-bold tracking-wide text-6xl mb-12"
    >
      SAP
    </h1>
    <div
      class="flex flex-row flex-wrap items-center justify-center mx-auto 2xl:max-w-6xl lg:max-w-5xl"
    >
      <IndexButton
        label="Vender artículo"
        icon="/svg/carrito.svg"
        url="vender"
      />
      <IndexButton
        label="Gastos de utilería"
        icon="/svg/lista.svg"
        url="gastos"
      />
      <IndexButton
        label="Agregar artículo"
        icon="/svg/agregar.svg"
        url="agregar"
      />
      <IndexButton label="Facturas" icon="/svg/factura.svg" url="facturas" />
      <IndexButton label="Ganancia" icon="/svg/dinero.svg" url="ganancia" />
    </div>
  </div>
</template>

<script>
export default {};
</script>
