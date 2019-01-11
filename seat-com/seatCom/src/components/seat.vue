<template>
  <div class="seat">
    <div class="container">
      <div class="seats">
        <ul class="lis">
          <!--todo:key="item2.code" 绑定的key不显示,也没有报错-->
          <li v-for="(item1) in data">
            <span v-for="(item2) in item1" :class="[(item2.status !== 'available')?yishouclass: (item2.loveSeat?qinglvclass:kexuanclass)]" @click="choose(item2.code)" :ref="item2.code" :data-seatnum="[item2.yCoord,item2.xCoord]">
          <!--<img :src="(item2.status !== 'available')?images[0]: (item2.loveSeat?images[1]:images[2])" @click="choose(item2.code)" :ref="item2.code">-->
            </span>
          </li>
        </ul>
      </div>
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
  import { EventBus } from '../eventbus.js'
  import AlloyFinger from 'alloyfinger'
  console.log(AlloyFinger)
  export default {
    name: 'seat',
    data () {
      return {
        // 已售 情侣 可选 已选  --后面根据需要,最后整理
        images: ['http://img.vcdianying.com/nwx/images/green/yixuan_icon.png','http://img.vcdianying.com/nwx/images/qinglv_icon.png','http://img.vcdianying.com/nwx/images/kexuan_icon.png','http://img.vcdianying.com/nwx/images/yishou_icon.png'],
        //存储优化后的数据
        data: null,
        //存储没有已售座位的数据
        noyishouData: null,
        // 记录下行数
        rows: null,
        // 判定座位类
        yishouclass: 'yishou',
        qinglvclass: 'qinglv',
        kexuanclass: 'kexuan',
        yixuanclass: 'yixuan',
        // 限制最多4次点击
        countNum: 0,
        // 从大到小的权重数组-- 一维数组
        weightSeats: null,
        // 默认从0开始遍历,传入一个initIndex
        initIndex: 0,
        //将传过来的obj的属性值num也挂载在vue上
        num: null,
        // 存储找到的推荐座位
        containArr: []
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
      //  得到y的最大值 x的最大值
        let ymax = Math.max(...ylist)
        let xmax = Math.max(...xlist)
        console.log('xmax:'+ xmax)
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
          //增加x权重
          resultArr.forEach((item,index) => {
            this.setXWeight(item)
          })
          //增加y权重
          this.setYWeight(resultArr)
          //计算权重和,并设置给每个对象的新属性totalWeight
          resultArr.forEach((item1,index1) => {
            item1.forEach((item2,index2) => {
              item2.totalWeight = item2.xnum + item2.ynum
            })
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
      },
      //设置x权重函数
      setXWeight (arr) {
        for (let i = 0;i < arr.length;i++) {
          if (i <= (arr.length/2)) {
            arr[i].xnum = i
          }else {
            arr[i].xnum = arr.length-1-i
          }
        }
        return arr
      },
      //设置y权重函数
      setYWeight (arr) {
          for (let i = 0; i < arr.length;i++) {
            for (let j = 0; j < arr[i].length;j++) {
              if (i <= (arr.length/2)) {
                arr[i][j].ynum = i
              }else {
                arr[i][j].ynum = arr.length-1-i
              }
            }
          }
          return arr
      },
      //选座点击事件
      choose (code) {
        console.log(this.$refs[code])
        const target = this.$refs[code][0].classList
        //得到的seatnum是个字符串
        const seatNum = this.$refs[code][0].dataset.seatnum.split(',')
        // 判断:如果已经有'yishou'的类名,则直接return
        if (target.contains('yishou')) {
          return
        }
        // 如果点击的不是已售的,并且点击的不是已选的,则判断当前是否大于等于4
        if (this.countNum >= 4 && !target.contains('yixuan')) {
          console.log('最多购买4个座位')
          return
        }
        if (target.contains('yixuan')) {
          target.remove('yixuan')
          EventBus.$emit('reduceSeatNum',{
            seatNum
          })
          this.countNum--
        }else{
          target.add('yixuan')
          // 选中时,通过data-seatnum 取出当前座位号
          // console.log(seatNum[0])
          // console.log(seatNum[1])
          // 将数组seatnum传递给eventbus
          EventBus.$emit('getSeatNum',{
            seatNum
          })
          this.countNum++
        }
      },
      //fixme:移动端缩放
      makeZoom () {
        const seats = document.getElementsByClassName('seats')[0]
        const initScale = 1
        const af = new AlloyFinger(seats,{
          touchStart () {
            // console.log('touchStart')
          },
          tap (e) {
            // console.log(e)
            // console.log('tap')
          },
          pinch(e) {
            seats.scaleX = seats.scaleY = initScale * e.scale;
          },
        })
      },
      getBestSeat () {
      //  遍历数组,筛选最大权重的座位  ---拿到最大权重的对象中的code属性,根据这个属性给页面中的对应元素设置背景图,排除掉已售,计算属性
        console.log('选择最优座位')
        // fixme:如果用户自选之后,点击推荐  (实际上自选与推荐是不能同时发生的)
        //得到从大到小的权重数组-- 一维数组
        this.weightSeats = this.sortWeight(this.noyishouData)
        console.log(this.weightSeats)
        //每次点击推荐时,都把containArr的元素来清除一下
        this.containArr = []
        //默认从0开始遍历,传入一个initIndex
        this.judge(this.weightSeats,this.initIndex,this.num)
      },
      // 深拷贝
      deepCopy (obj) {
          let objClone = Array.isArray(obj)?[]:{};
          if(obj && typeof obj ==="object"){
            for(let key in obj){
              if(obj.hasOwnProperty(key)){
                //判断obj子元素是否为对象，如果是，递归复制
                if(obj[key]&&typeof obj[key] ==="object"){
                  objClone[key] = this.deepCopy(obj[key]);
                }else{
                  //如果不是，简单复制
                  objClone[key] = obj[key];
                }
              }
            }
          }
          return objClone;
        },
      // 权重排序--arr指的是二维数组
      sortWeight (arr) {
        let resultArr = []
        for (let i = arr.length-1;i >= 0;i--) {
          for (let j = arr[i].length-1;j >=0;j--) {
            resultArr.push(arr[i][j])
          }
        }
        resultArr.sort(function (a,b) {
          return b.totalWeight - a.totalWeight
        })
        return resultArr
        },
      // 递归判断 是否最大权重的座位周围的个数满足推荐的座位数  参数是权重数组的第一项        判断this.data
      judge (weightSeats,index,num) {
        let x = null
        let y = null
      //  找到best在this.data中的第二重数组中的位置
        for (let i = 0;i < this.data.length-1;i++) {
          for (let j = 0;j < this.data[i].length;j++) {
            if (this.data[i][j].code === weightSeats[0].code) {
              y = i
              x = j
              console.log(y + '---' + x)
            }
          }
        }
      //  遍历this.data[y]  根据num取数
        for (let i = x-1; i < x+num-1; i++) {
          //如果存在已售的座位,开始数组中的下一个第二权重的元素,直接break
          if (this.data[y][i].status !== 'available') {
            this.initIndex++
            this.judge(this.weightSeats,this.initIndex,this.num)
            break
          } else {
          //  这里说明最优周围没有已售的,可以取到
            this.containArr.push(this.data[y][i])
          }
        }
        console.log(this.containArr)
      }
      },
    created () {
      this.handler()
      //fixme:forEach没有返回值,暂时考虑使用深拷贝复制没有已售座位的数据

      //todo:深拷贝得到所有数据,再将已售的数据进行剔除---接下来就可以进行直接遍历找到最大权重的数据
      this.noyishouData = this.deepCopy(this.data)
      this.noyishouData.forEach((item1,index1) => {
        //找到数据中的属性status不等于'available'的数据,剔除它
        item1.forEach((item2,index2) => {
          if (item2.status !== 'available') {
            item1.splice(index2,1)
          }
        })
      })
      console.log(this.noyishouData)
      // 根据后端

    },
    mounted () {
      this.makeZoom()
    //  监听eventbus,根据名,来选择座位个数
      EventBus.$on('getSeat',(obj) =>{
        //将传过来的obj的属性值num也挂载在vue上
        this.num = obj.num
        //  选择一个最优座位
        this.getBestSeat()
      })
    }
  }
</script>

<style scoped>
 .seat {
   width: 100%;
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
 .kexuan {
   background-image: url('../assets/images/kexuan_icon.png');
   background-size: 30px 30px;
 }
 .qinglv {
   background-image: url('../assets/images/qinglv_icon.png');
   background-size: 30px 30px;
 }
 .yishou {
   background-image: url('../assets/images/yishou_icon.png');
   background-size: 30px 30px;
 }
 .yixuan {
   background-image: url('../assets/images/yixuan_icon.png');
   background-size: 30px 30px;
 }
  /* iscroll */
 .seats {
   /* -- Attention: This line is extremely important in chrome 55+! -- */
   touch-action: none;
 }
</style>
