<template>
    <div class="sidebar p-4">
        <h1 class="text-center mt-0">
            <Logo class="logo" />
        </h1>
        <div class="sidebar-content d-flex flex-column justify-content-center">
            <ul class="text-muted">
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .sidebar {
        background: #F4F1F1;
        height: 100vh;

        .sidebar-content {
            height: 70vh;
        }

        .logo {
            max-height: 30vh;
            max-width: 150px;
        }

    }
</style>
