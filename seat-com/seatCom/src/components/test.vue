<template>
  <div class="seat">
    <div class="container">
      <div class="seats">
        <ul class="lis">
          <!--todo:key="item2.code" 绑定的key不显示,也没有报错-->
          <li v-for="m in rows" :key="m">
            <span v-for="n in cols" :key="n" v-if="data[m-1][n-1]" :class="[(data[m-1][n-1].status !== 'available')?(data[m-1][n-1].status === 'passway'?'':yishouclass): (data[m-1][n-1].loveSeat?qinglvclass:kexuanclass)]" @click="choose(data[m-1][n-1].code)" :ref="data[m-1][n-1].code" :data-seatnum="[data[m-1][n-1].yCoord,data[m-1][n-1].xCoord]">
            </span>
          </li>
        </ul>
      </div>
      <!--红色虚线-->
      <div class="mid_line"></div>
      <!--左侧提示行数-->
      <div class="get_rows">
        <ul>
          <li v-for="(num,index) in rows" :key="index">{{ num }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rows,
      cols
    }
  }
}
</script>

<style>

</style>
