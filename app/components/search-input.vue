<template>
  <div class="input-container d-flex align-items-center m-0">
    <icon-search class="input-icon"/>
    <input type="text" v-model="content" @input="handleInput" placeholder="Search" class="w-100">
  </div>
</template>

<script>
export default {
  prop: ['value'],
  data () {
    return {
      content: this.value
    }
  },
  methods: {
    handleInput (e) {
      this.$emit('input', this.content)
    }
  }
}
</script>


<style lang="scss" scoped>
    .input-container {
        background: #FFFFFF;
        border-radius: 20px;
        min-width: 15vw;
        box-sizing: border-box;

        position: relative;

        input {
          font-size: .8em;
          outline: none;
          border-radius: 20px;
          background: #FFFFFF;
          border: none;
          padding-left: 3em;

        }

        .input-icon {
          position: absolute;
          height: 15px;
          left: .75em;
        }
    }
</style>
