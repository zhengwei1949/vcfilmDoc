<template>
  <div class="container">
    <p>这里是座位号</p>
      <!-- {{ xy }} -->
      <div>
        <span v-for="(item,index) in xy" :key="index" @click="destroy(index)">
          {{ item[0] }}排{{ item[1] }}座
        </span>
      </div>
  </div>
</template>

<script>
  import { EventBus } from '../eventbus.js'
  export default {
    name: "seatnum",
    data () {
      return {
        xy: [],
        status: false
      }
    },
    methods: {
      destroy (index) {
        // 1.通知seat.vue清除'yixuan'样式---这里第几排第几座记录的是yCoord与xCoord---并且这里要在seat.vue中实现countNum--
        let code = this.xy[index][2]
        EventBus.$emit('destroyYiXuan',{code})
        // 2.在该组件的xy数组中清掉index指向的值
        this.xy.splice(index,1)
        // 4.如果长度为0,通知app.vue
        if (this.xy.length === 0) {
        EventBus.$emit('changeView',{chooseOrNot: false})
        }
      }
    },
    created () {
      // 判断传过来的数组是一维数组还是二维数组,自选座位采用一维数组push,推荐座位采用二维数组=
      EventBus.$on('getSeatNum',obj => {
        if (typeof(obj.seatNum[0]) !== 'object') {
          this.xy.push(obj.seatNum)
        } else {
          console.log('二维数组')
          console.log(obj.seatNum)
          this.xy = obj.seatNum
        }
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

<style lang="less" scoped>
.container {
  height: 80px;
  margin-top: 10px;
  span {
    background-color: #eee;
    color: #00bcd4;
    display: inline-block;
    margin: .5em;
    border-radius: 3px;
    padding: .2em;
  }
}
</style>
