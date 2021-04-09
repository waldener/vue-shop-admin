<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--搜索-->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--列表-->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUser(scope.row.id)"></el-button>
            <el-tooltip effect="dark" placement="top" content="分配角色" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1,2,5,10]" :page-size="queryInfo.pagesize" layout="total,sizes,prev,pager,next,jumper" :total="total">
      </el-pagination>
    </el-card>

    <!--添加用户对话框-->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改用户对话框-->
    <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserinfo">确 定</el-button>
  </span>
    </el-dialog>

    <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userinfo.username}}</p>
        <p>当前的角色：{{userinfo.role_name}}</p>
        <p>分配新角色：
          <el-select placeholder="请选择" v-model="selectedRoleId">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Users",
  data(){
    // 自定义邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        // 合法邮箱
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    // 自定义手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      // 返回一个错误提示
      callback(new Error('请输入合法的手机号码'))
    }
    return {
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:2,
      },
      setRoleDialogVisible:false,
      userList:[],
      roleList:[],
      total:0,
      addDialogVisible:false,
      userinfo:{},
      selectedRoleId:[],
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      addFormRules:{
        username:[
          {required:true,message:'请输入用户名',trigger:"blur"},
          {min:3,max:10,message: '用户名的长度在3~10个字符之间',trigger: 'blur'}
        ],
        password:[
          {required:true,message:'请输入密码',trigger:"blur"},
          {min:6,max:15,message: '用户名的长度在6~15个字符之间',trigger: 'blur'}
        ],
        email:[
          {required:true,message:'请输入邮箱',trigger:"blur"},
          {validator:checkEmail,trigger: 'blur'}
        ],
        mobile:[
          {required:true,message:'请输入手机',trigger:"blur"},
          {validator:checkMobile,trigger: 'blur'}
        ]
      },
      editDialogVisible:false,
      editForm:{}
    }
  },
  created() {
    this.getUserList()
  },
  methods:{
    async getUserList(){
      const { data } = await this.$http.get('users',{params: this.queryInfo})
      if(data.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = data.data.users
      this.total = data.data.total
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChanged(userinfo){
      const { data } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      console.log(data);
      if(data.meta.status !== 200){
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    addUser(){
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const {data} = await this.$http.post('users',this.addForm)
        if(data.meta.status !== 201){
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog(id){
      this.editDialogVisible = true
      const {data} = await this.$http.get('users/' + id)
      if(data.meta.status !== 200){
        return this.$message.error('获取用户信息失败')
      }
      this.editForm = data.data
    },
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    editUserinfo(){
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data} = await this.$http.put('users/' + this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile})

        if(data.meta.status !== 200){
          return this.$message.error(('更新用户信息失败'))
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('更新用户信息成功')
      })
    },
    async removeUser(id){
      const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？','提示',{
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('取消了删除')
      }
      const {data} = await this.$http.delete('users/' + id)
      if(data.meta.status !== 200){
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    async setRole(userinfo){
      this.userinfo = userinfo
      const {data} = await this.$http.get('roles')
      if(data.meta.status !== 200){
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = data.data
      this.setRoleDialogVisible = true
    },
    async saveRoleInfo(){
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色')
      }
      const {data} = await this.$http.put(`users/${this.userinfo.id}}/role`,{rid:this.selectedRoleId})
      if(data.meta.status !== 200){
        return this.$message.error('分配角色失败')
      }
      await this.getUserList()
      this.$message.success('分配角色成功')
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed(){
      this.userinfo = {}
      this.selectedRoleId = []
    }
  }
};
</script>

<style scoped>
  p{
    margin-bottom: 15px;
  }
</style>
