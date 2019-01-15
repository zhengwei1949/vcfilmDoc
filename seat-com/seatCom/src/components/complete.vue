<template>
  <div class="chooseOk">
    <p @click="choose">选好了</p>
  </div>
</template>

<script>
import { EventBus } from '../eventbus.js'
export default {
  name: "complete",
  methods: {
    choose () {
      // 点击触发,传递信息
      EventBus.$emit('chooseOk')
    }
  }
}
</script>

<style scoped>
.chooseOk {
  margin-top: 10px;
  text-align: left
}

</style>
