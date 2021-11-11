<template>
    <div class="sidebar p-1">
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
        padding-top: 1em !important;

        .sidebar-content {
            height: 70vh;
        }

        .logo {
            max-height: 30vh;
            max-width: 90%;
        }

    }
</style>
