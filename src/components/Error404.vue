<template>
  <div>
    <i class="el-icon-warning"></i>
    <span class="error">ERROR: 404 NOT FOUND</span>
  </div>
</template>

<script>
export default {
  name: "Error404"
}
</script>

<style lang="less" scoped>
div{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  .error{
    margin-left: 5px;
  }
}
</style>
