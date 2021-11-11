<template>
  <div class="layout">
    <Navbar />
    <Nuxt/>
  </div>
</template>

<style lang="scss" scoped>
  .layout {
    display: grid;
    grid-template-columns: 100px 1fr;
    background-color: #f5f5fd;
    min-height: 100vh;
    max-width: 100vw;
  }
</style>
