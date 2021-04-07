<template>
  <el-container class="home">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出 </el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data(){
    return {
      menuList:[],
      isCollapse:false,
      activePath:'',
      iconsObj:{
        125:'el-icon-user-solid',
        103:'el-icon-s-cooperation',
        101:'el-icon-s-goods',
        102:'el-icon-s-order',
        145:'el-icon-s-marketing'
      }
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList(){
      const {data} = await this.$http.get('menus')
      if(data.meta.status !== 200) return this.$message.error((data.meta.msg))
      this.menuList = data.data
    },
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  },
};
</script>

<style lang="less" scoped>
.home {
  height: 100%;
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    div {
      display: flex;
      align-items: center;
      img {
        width: 15%;
        margin-right: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .toggle-button{
      background-color: #4a5064;
      color: #fff;
      font-size: 10px;
      line-height: 24px;
      text-align: center;
      letter-spacing: 0.2em;
      cursor: pointer;
    }
    i{
      margin-right: 10px;
    }
    .el-menu{
      border-right: none;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
}
</style>
