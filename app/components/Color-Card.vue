<template>
    <div class="card p-3" :style="{backgroundColor: `rgba(${color}, .3)`}">
        <div class="icon p-3">B</div>
        <div class="card-body">
            <h2>$1200</h2>
            <p class="text-muted"><span class="fw-bold">45%</span> This week</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.card {
    border-radius: 15px;
}
.icon {
    background: black;
    color: white;
    width: fit-content;
    font-size: 1.5em;
    border-radius: 15px;
}
</style>

<script>
export default {
    props: {
        color: {
            type: String, 
            default: "141, 198, 154"
        }
    }
}
</script>