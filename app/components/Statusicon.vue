<template>
  <div>
    <div class="circle"></div>
    <!-- <div class="circle orange"></div>
    <div class="circle red"></div> -->
  </div>
</template>

<script>
export default {
    props: {
        status: {
            type: Number,
            default: 0
        }
    },
    mounted() {
        console.log(this.status)
    },
    computed: {
        stat() {
            console.log(this.status)
        }
    }
}
</script>

<style lang="scss" scoped>
.red {
    background: red;
}

.orange {
    background: orange;
}
</style>

