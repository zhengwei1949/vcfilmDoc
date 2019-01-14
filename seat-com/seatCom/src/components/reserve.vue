  <template>
  <div class="seat">
    <div class="container">
      <div class="seats">
        <ul class="lis">
          <!--todo:key="item2.code" 绑定的key不显示,也没有报错-->
          <li v-for="(item1,index1) in data" :key="index1">
            <span v-for="(item2,index2) in item1" :key="index2" :class="[(item2.status !== 'available')?(item2.status === 'passway'?'':yishouclass): (item2.loveSeat?qinglvclass:kexuanclass)]" @click="choose(item2.code)" :ref="item2.code" :data-seatnum="[item2.yCoord,item2.xCoord]">
          <!--<img :src="(item2.status !== 'available')?images[0]: (item2.loveSeat?images[1]:images[2])" @click="choose(item2.code)" :ref="item2.code">-->
          <!-- <span v-if="(Number(item1[index2+1].xCoord)-Number(item1[index2].xCoord))!==1"></span> -->
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
