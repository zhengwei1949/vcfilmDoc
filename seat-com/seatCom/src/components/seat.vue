<template>
  <div class="seat">
    <div class="container">
      <div class="seats">
        <ul class="lis">
          <li v-for="(item1,index1) in data" :key="index1">
            <span  v-for="(item2,index2) in item1" :key="index2" :class="[(item2.status !== 'available')?(item2.status === 'passway'?'':yishouclass): (item2.loveSeat?qinglvclass:kexuanclass)]" @click="choose(item2.code)" :ref="item2.code" :data-seatnum="[item2.yCoord,item2.xCoord]"> 
            </span>
            <!-- <span  v-if="!(Number(data[m-1][n-1].xCoord) === n+1)"></span> -->
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
  import datas from '@/assets/data3.js'
  console.log(JSON.parse(datas).data)
  import { EventBus } from '../eventbus.js'
  import AlloyFinger from 'alloyfinger'
  // console.log(AlloyFinger)
  export default {
    name: 'seat',
    data () {
      return {
        //存储优化后的数据 ---这个数据包含过道信息
        data: null,
        //存储没有已售座位的数据
        noyishouData: null,
        // 记录下行数
        rows: null,
        cols: null,
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
        //将传过来的obj的属性值num也挂载在vue上, num指的是推荐座位按钮具体的数据(比如是1,2,3,4)
        num: null,
        // 存储找到的推荐座位
        containArr: [],
        // 存储自选座位时所在行数 choose()保存 chooseOk使用
        chooseRows: [],
        bool: false,
        // 因为推荐座位是可以跨过道的,所以要在resultArr中添加对象前,对resultArr进行一个深拷贝,下面数组是为推荐算法中正则表达式判断准备的---不包含过道
        // 为什么推荐座位要舍弃过道? 假如推荐正则是0010,而如果使用data数组,匹配正则可能会是0undefined010导致匹配错误
        regArr: null

      }
    },
    mounted () {
      this.consoleData()
      this.makeZoom()
      // 监听eventbus,根据名,来选择座位个数
      EventBus.$on('getSeat',(obj) =>{
        //将传过来的obj的属性值num也挂载在vue上
        this.num = obj.num
        //  选择一个最优座位
        this.getBestSeat()
      })
      // 监听'选好了'事件
      EventBus.$on('chooseOk',() => {
        this.chooseOk()
      })
    },
    methods: {
      consoleData () {
        console.log('hello')
        console.log(this.data[1][1])
      },
      handler () {
        //  处理 datas  把属性data中的cinemaSeatpicDataList(对象)的属性0000000000000001对应的数组中的对象
        let arr = JSON.parse(datas).data.cinemaSeatpicDataList['0000000000000001']
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
        this.cols = xmax
      //  定义总容器数组,根据ymax创建数组,并判断x
        let resultArr = []
        for (let i = 0;i < ymax;i++) {
          resultArr[i] = []
          //  遍历arr , 其中的 y 如果等于 i,直接把当前项push  arr是总的一维数组
          for (let j = 0;j < arr.length;j++) {
            // 为规则2做标记:已售3 可选0 情侣2 ---后面已选是1
            if (arr[j].status !=='available') {
              arr[j].flag = '3'
            } else if (arr[j].loveSeat) {
              arr[j].flag = '2'
            } else {
              arr[j].flag = '0'
            }
            if (Number(arr[j].yCoord) === (i+1)) {
              resultArr[i].push(arr[j])
            }
          }
        }
        // 由于x顺序不规则,所以要将x重新按照从小到大的顺序进行排列---这一步完成之后就是规整的数据了
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
          this.regArr = this.deepCopy(resultArr)
          console.log('regArr')
          console.log(this.regArr)
        // 注意这里,上面与下面,我是先设置的权重,然后再去插入过道信息 ,所以不用再考虑过道会有权重的问题
        // 排完顺序之后,判断每一项xCoord与其索引之间的差值是否大于1,如果大于1 ,插入一个对象 i是行 j是列  ----设置纵向过道走廊
          for (let i = 0;i < resultArr.length;i++) {
            for (let j = 0;j < resultArr[i].length;j++) {
              if ( Number(resultArr[i][j].xCoord) - j !== 1) {
                // console.log(j)
                let passObj = this.createPassWay(i,j)
                resultArr[i].splice(j,0,passObj)
              }
            }
          }
          
        // 得到最后要使用的数据
          this.data = resultArr
          console.log(resultArr)
      },
      createPassWay (i,j) {
        let passWay = {}
        passWay.status = 'passway'
        passWay.xCoord = j + 1
        passWay.yCoord = i + 1
        passWay.code = '0001'
        return passWay
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
        // 判断code是否是过道的code,如果是'0001',直接return
        if (code === '0001') {
          return
        }
        console.log(this.$refs[code])
        const target = this.$refs[code][0].classList
        //得到的seatnum是个字符串,将其转为数组
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
          // 点击取消时,还应该把之前设置的flag='1',重新设置为'0',还要把bool设置为false
          this.data.forEach((item1,index1) => {
            item1.forEach((item2) => {
              if (item2.code === code) {
                item2.flag = '0'
                // this.chooseRows.push(index1)
                // 当用户自选点击取消时,从chooseRows中,删除一个等于index1的元素,无关索引,只要删除一个就行
                for (let i = 0;i < this.chooseRows.length;i++) {
                  if (this.chooseRows[i] === index1) {
                    this.chooseRows.splice(i,1)
                    break
                  }
                }
                console.log('pull')
                console.log(this.chooseRows)
              }
            })
          }) 
          this.bool = false
        }else{
          // 在添加已选状态时,为了这个可以联动chooseOk,要根据code判断数组中具体的元素,给其添加flag='1',另外为了chooseOk中可以判断,在此也将用户选中的所在行数也保存起来
          this.data.forEach((item1,index1) => {
            item1.forEach((item2) => {
              if (item2.code === code) {
                item2.flag = '1'
                this.chooseRows.push(index1)
                console.log('push')
                console.log(this.chooseRows)
              }
            })
          })
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
      // 选择最优座位
      getBestSeat () {
        // 遍历数组,筛选最大权重的座位  ---拿到最大权重的对象中的code属性,根据这个属性给页面中的对应元素设置背景图,排除掉已售,计算属性
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
        // 每次递归开始前,将chooseRows中的内容清空
        this.chooseRows = []
        // FIXME: 如果传过来的index的值,大于等于了weightSeats.length,则表示无可推荐座位,直接return ---整个推荐算法后续可以考虑优化
        if (index >= weightSeats.length) {
          return console.log('无可推荐座位')
        }
        let x = null
        let y = null
        // 找到best在this.regArr中的第二重数组中的位置  regArr是原始二维数组,包括已售座位,不包含过道,这里的x,y是索引
        for (let i = 0;i < this.regArr.length-1;i++) {
          for (let j = 0;j < this.regArr[i].length;j++) {
            if (this.regArr[i][j].code === weightSeats[index].code) {
              y = i
              x = j
              console.log(y + '---' + x)
            }
          }
        }
        // 找到最优座位时,为了'选好了'按钮,记录其所在行,将其保存在this.chooseRows中
        this.chooseRows.push(y) 
        // 给当前最优座位best(不是情侣座)加上 flag:'1', 因为weightSeats是权重数组,而我们下面要操作是原始二维数组,所以不能直接给weightSeats[index]设置flag
        if (this.regArr[y][x].flag !== '2') {
        this.regArr[y][x].flag = '1'
        // 获取最优座位所在行拼接的flag字符串--这串代码需要在给最优座位标记之后再执行
        let str = ''
        for (let i = 0;i < this.regArr[y].length;i++) {
          str += this.regArr[y][i].flag
        }
        console.log(str)
        /* 在这里时,可选 最高 情侣 已售 四种座位的flag已经全部添加完毕,而且知道当前最优座位的索引,所以要在最优座位的所在行中,从左至右将flag拼接
          利用正则表达式判断,
        */
        switch (num) {
          case 1:
          this.countNum = 1
          // 1.直接拿最优座位即可,无需正则表达式,拿到当前对应数据中的属性code,设置code,
          let code = this.regArr[y][x].code
          this.$refs[code][0].classList.add('yixuan')
          break
          case 2:
          this.countNum = 2
          // 2.两种情况,10 或者 01, reg=/01/ /10/
          if ((/01/).test(str)) {
            // 记录最优座位和其左边座位  ---如果最优座位周围选择的是过道,直接去找下一个权重座位
            let code1 = this.regArr[y][x].code
            let code2 = this.regArr[y][x-1].code
            this.$refs[code1][0].classList.add('yixuan')
            this.$refs[code2][0].classList.add('yixuan')
            break
          }
          if ((/10/).test(str)) {
            // 记录最优座位和其左边座位
            let code1 = this.regArr[y][x].code
            let code2 = this.regArr[y][x+1].code
            this.$refs[code1][0].classList.add('yixuan')
            this.$refs[code2][0].classList.add('yixuan')
            break
          } 
          // 如果到这里,说明当前最高权重座位不符合情况,去寻找第二权重高的座位
          this.initIndex++
          this.judge(this.weightSeats,this.initIndex,this.num)
          break
          case 3:
          this.countNum = 3
          if ((/010/).test(str)) {
            let code1 = this.regArr[y][x].code
            let code2 = this.regArr[y][x-1].code
            let code3 = this.regArr[y][x+1].code
            this.$refs[code1][0].classList.add('yixuan')
            this.$refs[code2][0].classList.add('yixuan')
            this.$refs[code3][0].classList.add('yixuan')
            break
          }
          if ((/001|221/).test(str)) {
            let code1 = this.regArr[y][x].code
            let code2 = this.regArr[y][x-1].code
            let code3 = this.regArr[y][x-2].code
            this.$refs[code1][0].classList.add('yixuan')
            this.$refs[code2][0].classList.add('yixuan')
            this.$refs[code3][0].classList.add('yixuan')
            break
          }
          if ((/100|122/).test(str)) {
            let code1 = this.regArr[y][x].code
            let code2 = this.regArr[y][x+1].code
            let code3 = this.regArr[y][x+2].code
            this.$refs[code1][0].classList.add('yixuan')
            this.$refs[code2][0].classList.add('yixuan')
            this.$refs[code3][0].classList.add('yixuan')
            break
          }
          this.initIndex++
          this.judge(this.weightSeats,this.initIndex,this.num)
          break
          case 4:
          this.countNum = 4
          if ((/0010|2210/).test(str)) {
            let code1 = this.regArr[y][x].code
            let code2 = this.regArr[y][x-1].code
            let code3 = this.regArr[y][x-2].code
            let code4 = this.regArr[y][x+1].code
            this.$refs[code1][0].classList.add('yixuan')
            this.$refs[code2][0].classList.add('yixuan')
            this.$refs[code3][0].classList.add('yixuan')
            this.$refs[code4][0].classList.add('yixuan')
            break
          }
          if ((/0100|0122/).test(str)) {
            let code1 = this.regArr[y][x].code
            let code2 = this.regArr[y][x-1].code
            let code3 = this.regArr[y][x+1].code
            let code4 = this.regArr[y][x+2].code
            this.$refs[code1][0].classList.add('yixuan')
            this.$refs[code2][0].classList.add('yixuan')
            this.$refs[code3][0].classList.add('yixuan')
            this.$refs[code4][0].classList.add('yixuan')
            break
          }
          if ((/1000|1022|1220/).test(str)) {
            let code1 = this.regArr[y][x].code
            let code2 = this.regArr[y][x+1].code
            let code3 = this.regArr[y][x+2].code
            let code4 = this.regArr[y][x+3].code
            this.$refs[code1][0].classList.add('yixuan')
            this.$refs[code2][0].classList.add('yixuan')
            this.$refs[code3][0].classList.add('yixuan')
            this.$refs[code4][0].classList.add('yixuan')
            break
          }
          if ((/0001|2201|0221/).test(str)) {
            let code1 = this.regArr[y][x].code
            let code2 = this.regArr[y][x-1].code
            let code3 = this.regArr[y][x-2].code
            let code4 = this.regArr[y][x-3].code
            this.$refs[code1][0].classList.add('yixuan')
            this.$refs[code2][0].classList.add('yixuan')
            this.$refs[code3][0].classList.add('yixuan')
            this.$refs[code4][0].classList.add('yixuan')
            break
          }
          this.initIndex++
          this.judge(this.weightSeats,this.initIndex,this.num)
          break
        }
        }
        // 如果最优座位是情侣座的话,
        if (this.regArr[y][x].flag === '2') {
          this.regArr[y][x].flag = '9'
          // 获取最优座位所在行拼接的flag字符串--这串代码需要在给最优座位标记之后再执行,-------后面这部分要考虑提取为公共的
          let str = ''
          for (let i = 0;i < this.regArr[y].length;i++) {
            str += this.regArr[y][i].flag
          }
          console.log(str)
          switch (num) {
            case 1:
            // 因为情侣座位不允许只选一个,所以直接去判断下一个权重的座位
            this.initIndex++
            this.judge(this.weightSeats,this.initIndex,this.num)
            break
            case 2:
            this.countNum = 2
            // 这种情况的话判断 92 29 不过要注意的是2922这种只能是29,不能92
            if ((/29|2922/).test(str)) {
              // 记录最优座位和其左边座位
              let code1 = this.regArr[y][x].code
              let code2 = this.regArr[y][x-1].code
              this.$refs[code1][0].classList.add('yixuan')
              this.$refs[code2][0].classList.add('yixuan')
              break
            }
            if ((/92|2292/).test(str)) {
              // 记录最优座位和其左边座位
              let code1 = this.regArr[y][x].code
              let code2 = this.regArr[y][x+1].code
              this.$refs[code1][0].classList.add('yixuan')
              this.$refs[code2][0].classList.add('yixuan')
              break
            }
            this.initIndex++
            this.judge(this.weightSeats,this.initIndex,this.num)
            break
            case 3:
            this.countNum = 3
            // fixme: 这里与之前的
            if ((/920/).test(str)) {
              let code1 = this.regArr[y][x].code
              let code2 = this.regArr[y][x+1].code
              let code3 = this.regArr[y][x+2].code
              this.$refs[code1][0].classList.add('yixuan')
              this.$refs[code2][0].classList.add('yixuan')
              this.$refs[code3][0].classList.add('yixuan')
              break
            }
            if ((/092|290/).test(str)) {
              let code1 = this.regArr[y][x].code
              let code2 = this.regArr[y][x+1].code
              let code3 = this.regArr[y][x-1].code
              this.$refs[code1][0].classList.add('yixuan')
              this.$refs[code2][0].classList.add('yixuan')
              this.$refs[code3][0].classList.add('yixuan')
              break
            }
            if ((/029/).test(str)) {
              let code1 = this.regArr[y][x].code
              let code2 = this.regArr[y][x-1].code
              let code3 = this.regArr[y][x-2].code
              this.$refs[code1][0].classList.add('yixuan')
              this.$refs[code2][0].classList.add('yixuan')
              this.$refs[code3][0].classList.add('yixuan')
              break
            }
            this.initIndex++
            this.judge(this.weightSeats,this.initIndex,this.num)
            break
            case 4:
            this.countNum = 4
            if ((/9200|9222/).test(str)) {
              let code1 = this.regArr[y][x].code
              let code2 = this.regArr[y][x+1].code
              let code3 = this.regArr[y][x+2].code
              let code4 = this.regArr[y][x+3].code
              this.$refs[code1][0].classList.add('yixuan')
              this.$refs[code2][0].classList.add('yixuan')
              this.$refs[code3][0].classList.add('yixuan')
              this.$refs[code4][0].classList.add('yixuan')
            break
            }
            if ((/0920|2922|2900/).test(str)) {
              let code1 = this.regArr[y][x].code
              let code2 = this.regArr[y][x-1].code
              let code3 = this.regArr[y][x+1].code
              let code4 = this.regArr[y][x+2].code
              this.$refs[code1][0].classList.add('yixuan')
              this.$refs[code2][0].classList.add('yixuan')
              this.$refs[code3][0].classList.add('yixuan')
              this.$refs[code4][0].classList.add('yixuan')
            break
            }
            if ((/0092|2292|0290/).test(str)) {
              let code1 = this.regArr[y][x].code
              let code2 = this.regArr[y][x-1].code
              let code3 = this.regArr[y][x-2].code
              let code4 = this.regArr[y][x+1].code
              this.$refs[code1][0].classList.add('yixuan')
              this.$refs[code2][0].classList.add('yixuan')
              this.$refs[code3][0].classList.add('yixuan')
              this.$refs[code4][0].classList.add('yixuan')
              break
            }
            if ((/0029|2229/).test(str)) {
              let code1 = this.regArr[y][x].code
              let code2 = this.regArr[y][x-1].code
              let code3 = this.regArr[y][x-2].code
              let code4 = this.regArr[y][x+1].code
              this.$refs[code1][0].classList.add('yixuan')
              this.$refs[code2][0].classList.add('yixuan')
              this.$refs[code3][0].classList.add('yixuan')
              this.$refs[code4][0].classList.add('yixuan')
              break
            }
            this.initIndex++
            this.judge(this.weightSeats,this.initIndex,this.num)
            break
          }
        }
      },
      // 点击选好了之后,触发的chooseOk()
      chooseOk () {
        /* 用户可能选1,2,3,4次.也就是说页面上拥有状态1的会是1,2,3,4个座位 不过在此之前要给用户自选选座点击事件时添加已选状态,choose()
          用户自选座位所在行数被保存在了chooseRows,进行一个数组去重
        */
        if (this.chooseRows.length === 0) {
          return
        }
        let rows = [...new Set(this.chooseRows)]
        console.log(rows)
        for (let i = 0;i < rows.length;i++) {
          let str = ''
          this.data[rows[i]].forEach((item) => {
            str += item.flag
            // console.log(str)
          })
          if ((/10[1,3]|[1,3]01/).test(str)) {
            // 为了防止多次触发,设置一个bool值
            this.bool = true
          }
          // 对str进行判断,如果存在10[1,3]或者[1,3]01,提示不能空座,如果不存在,则向后端接口请求,然后跳转其他页面
        }
        if (this.bool) {
          return console.log('座位之间不能留空一个座位')
        }
        // 到达这里说明,用户自选选座符合规则; 推荐座位也要走这里的逻辑,这里要做的就是把已选座位的code拿到

      }
      },
    created () {
      this.handler()
      //fixme:forEach没有返回值,暂时考虑使用深拷贝复制没有已售座位的数据

      //todo:深拷贝得到所有数据,再将已售的数据进行剔除---接下来就可以进行直接遍历找到最大权重的数据
      this.noyishouData = this.deepCopy(this.data)
      this.noyishouData.forEach((item1,index1) => {
        //找到数据中的属性status不等于'available'的数据,剔除它---另外这里也要删除过道数据
        item1.forEach((item2,index2) => {
          if (item2.status !== 'available' || item2.code === '0001') {
            item1.splice(index2,1)
          }
        })
      })
      console.log(this.noyishouData)
      // 根据后端

    },
   
  }
</script>

<style scoped>
 .seat {
   width: 100%;
   height: 500px;
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
