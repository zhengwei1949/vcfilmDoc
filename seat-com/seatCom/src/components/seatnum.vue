<template>
  <div class="container">
    <p>这里是座位号</p>
    <span v-for="item in xy">
      {{ item[0] }}排{{ item[1] }}座
    </span>
  </div>
</template>

<script>
  import { EventBus } from '../eventbus.js'
  export default {
    name: "seatnum",
    data () {
      return {
        xy: []
      }
    },
    created () {
      EventBus.$on('getSeatNum',obj => {
        this.xy.push(obj.seatNum)
      })
      EventBus.$on('reduceSeatNum',obj => {
        this.xy.forEach((item,i)=>{
          if (item[0]===obj.seatNum[0]&&item[1]===obj.seatNum[1]) {
            this.xy.splice(i,1)
          }
        })
      })
    }
  }
</script>

<style scoped>
.container {
  height: 50px;
  margin-top: 10px;
}
</style>
