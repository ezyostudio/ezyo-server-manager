<template>
    <table class="w-100">
  <tr class="text-start">
    <th>Price</th>
    <th>Quantity</th>
    <th>Total</th>
  </tr>
  <tr v-for="line in data" :key="line.name">
    <td>{{line.data1}}</td>
    <td>{{line.data2}}</td>
    <td>{{line.data3}}</td>
  </tr>
</table>
</template>

<script>
export default {
    props: {
        data: {
            type: Array,
            default: []
        }
    }
}
</script>