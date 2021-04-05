<template>
  <div class="login">
    <div class="login_box">
      <!--头像-->
      <div class="login_avatar">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!--登录表单-->
      <el-form
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
        class="login_form"
      >
        <!--用户名-->
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!--按钮-->
        <el-form-item class="login_btn">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456",
      },
      loginFormRules: {
        username: [
          { require: true, message: "请输入用户名", triggerL: "blur" },
          { min: 3, max: 10, message: "长度在3到10个字符", triggerL: "blur" },
        ],
        password: [
          { require: true, message: "请输登录密码", triggerL: "blur" },
          { min: 6, max: 15, message: "长度在6到15个字符", triggerL: "blur" },
        ],
      },
    };
  },
  methods:{
    reset(){
      this.$refs.loginFormRef.resetFields()
    },
    login(){
      this.$refs.loginFormRef.validate(async valid => {
        if(!valid) return;
        const { data } = await this.$http.post('login',this.loginForm)
        if(data.meta.status !== 200){
          this.$message.error('登录失败')
        }else {
          this.$message.success('登陆成功')
          window.sessionStorage.setItem('token',data.data.token)
          this.$router.push('/home')
        }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.login {
  height: 100%;
  background-color: #2b4b6b;
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .login_avatar {
      height: 130px;
      width: 130px;
      background-color: #fff;
      border-radius: 50%;
      border: 1px solid #eee;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      .login_btn {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
