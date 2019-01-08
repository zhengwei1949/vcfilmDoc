<template>
  <div class="seat">
    <div class="container">
      <ul class="lis">
        <li v-for="item1 in data" :key="data.code">
        <span v-for="item2 in item1">
          <img :src="(item2.status !== 'available')?images[0]: (item2.loveSeat?images[1]:images[2])" alt="">
        </span>
        </li>
      </ul>
      <!--红色虚线-->
      <div class="mid_line"></div>
      <!--左侧提示行数-->
      <div class="get_rows">
        <ul>
          <li v-for="num in rows">{{ num }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import datas from '@/assets/data.js'
  console.log(datas)
  export default {
    name: "seat",
    data () {
      return {
        // 已售 情侣 可选
        images: ['http://img.vcdianying.com/nwx/images/green/yixuan_icon.png','http://img.vcdianying.com/nwx/images/qinglv_icon.png','http://img.vcdianying.com/nwx/images/kexuan_icon.png'],
        data: null,
        // 记录下行数
        rows: null
      }
    },
    methods: {
      handler () {
      //  处理 datas  把属性data中的cinemaSeatpicDataList(对象)的属性0000000000000001对应的数组中的对象
        let arr = datas.data.cinemaSeatpicDataList['0000000000000001']
        console.log(arr)
      //  得到数组arr,应该遍历,根据y的最大值来创建数组容器个数,再遍历根据x相同时,扔进同一个数组 item.yCoord
        let ylist = []
        let xlist = []
        arr.forEach((item) => {
          ylist.push(Number(item.yCoord))
          xlist.push(Number(item.xCoord))
        })
        console.log(ylist,xlist)
      //  得到y的最大值
        let ymax = Math.max.apply(null,ylist)
        this.rows = ymax
      //  定义总容器数组,根据ymax创建数组,并判断x
        let resultArr = []
        for (let i = 0;i < ymax;i++) {
          resultArr[i] = []
          //  遍历arr , 其中的 y 如果等于 i,直接把当前项push
          for (let j = 0;j < arr.length;j++) {
            if (Number(arr[j].yCoord) === (i+1)) {
              resultArr[i].push(arr[j])
            }
          }
          // 由于x顺序不规则,所以要将x重新按照从小到大的顺序进行排列
          resultArr.forEach((item) => {
            for (let n = 0;n < item.length; n++) {
              // 冒泡排序
              this.sort(item)
            }
          })
          // 得到最后要使用的数据
          this.data = resultArr
          console.log(resultArr)
        }
      },
      sort (arr) {
          for (let i=0; i<arr.length-1; i++){
            for (let j=0; j<arr.length-i-1; j++){
              if (Number(arr[j].xCoord) > (Number(arr[j+1].xCoord))) {
                let oldVal = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = oldVal;
              }
            }
          }
      }
    },
    created () {
      this.handler()
    }
  }
</script>

<style scoped>
 .seat {
   width: 500px;
   height: 220px;
   background-color: #ccc;
   display: flex;
   justify-content: center;
   align-items: center;
 }
 .container {
   position: relative;

 }
 .lis li {
   height: 30px;
 }
 .lis span {
   float: left;
   width: 30px;
   height: 30px;
 }
 .lis span img {
   width: 100%;
   height: 100%;
 }
 .mid_line {
   position: absolute;
   height: 100%;
   width: 0;
   top: -3px;
   left: 50%;
   border-right: 1px dashed rgb(226, 43, 43);
   z-index: 99;
 }
 .get_rows {
   position: absolute;
   top: -20px;
   left: -10px;
   background-color: rgba(0,0,0,0.5);
   border-radius: 10px;
 }
 .get_rows ul {
  margin-top: 20px;
  margin-bottom: 20px;
 }
 .get_rows li {
   width: 20px;
   height: 30px;
   color: #fff;
   font-size: 12px;
   text-align: center;
   line-height: 30px;
 }
</style>
