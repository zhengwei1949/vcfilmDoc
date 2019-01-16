<template>
  <div class="container">
    <p>单击座位区域选座,最多选4个座位</p>
    <div>
      <a href="javascript:;">选好了</a>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
.container {
  display: flex;
  p {
    color: #717171;
    font-size: 14px;
    flex: 1;
  }
  div {
    width: 90px;
    height: 32px;
    a {
      width: 100%;
      height: 100%;
      color: #fff;
      text-align: center;
      display: block;
    }
  }
}
</style>

