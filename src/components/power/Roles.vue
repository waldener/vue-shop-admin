<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['bdbot', i1 === 0 ? 'bdtop': '','vcenter']">
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id"  :class="[i2 === 0 ? '' : 'bdtop','vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRight(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="removeRight(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
    </el-dialog>

    <el-dialog
        title="修改角色信息"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRoleinfo">确 定</el-button>
  </span>
    </el-dialog>

    <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%" @close="setRightDialogClosed">
      <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data(){
    return {
      roleList:[],
      editDialogVisible:false,
      addDialogVisible:false,
      addForm:{
        roleName:'',
        roleDesc:''
      },
      editForm:{
        roleName:'',
        roleDesc:''
      },
      addFormRules:{
        roleName:[
          {required:true,message:'请输入角色名',trigger:"blur"},
          {min:3,max:6,message: '角色名的长度在3~6个字符之间',trigger: 'blur'}
        ],
        roleDesc:[
          {required:true,message:'请输入角色描述',trigger:"blur"},
          {min:2,max:15,message: '角色描述的长度在2~15个字符之间',trigger: 'blur'}
        ]
      },
      setRightDialogVisible:false,
      rightList:[],
      treeProps:{
        label:'authName',
        children:'children'
      },
      defKeys:[],
      roleId:''
    }
  },
  created() {
    this.getRoleList()
  },
  methods:{
    async getRoleList(){
      const {data} = await this.$http.get('roles')
      if(data.meta.status !== 200){
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = data.data
    },
    async showEditDialog(id){
      this.editDialogVisible = true
      const {data} = await this.$http.get('roles/' + id)
      if(data.meta.status !== 200){
        return this.$message.error('获取用户信息失败')
      }
      this.editForm = data.data
    },
    async removeRole(id){
      const confirmResult = await this.$confirm('此操作将永久删除该角色，是否继续？','提示',{
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('取消了删除')
      }
      const {data} = await this.$http.delete('roles/' + id)
      if(data.meta.status !== 200){
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      await this.getRoleList()
    },
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    editRoleinfo(){
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data} = await this.$http.put('roles/' + this.editForm.id,{roleName:this.editForm.roleName,roleDesc :this.editForm.desc})

        if(data.meta.status !== 200){
          return this.$message.error(('更新角色信息失败'))
        }
        this.editDialogVisible = false
        await this.getRoleList()
        this.$message.success('更新角色信息成功')
      })
    },
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    addRole(){
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const {data} = await this.$http.post('roles',this.addForm)
        if(data.meta.status !== 201){
          this.$message.error('添加角色失败')
        }
        await this.getRoleList()
        this.$message.success('添加角色成功')
        this.addDialogVisible = false
      })
    },
    async removeRight(role,rightId){
      const confirmResult = await this.$confirm('此操作将永久删除该权限，是否继续？','提示',{
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('取消了删除')
      }
      const {data} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if(data.meta.status !== 200){
        return this.$message.error('删除权限失败')
      }
      this.$message.success('删除权限成功')
      role.children = data.data
    },
    async showSetRightDialog(role){
      this.roleId = role.id
      const {data} = await this.$http.get('rights/tree')
      if(data.meta.status !== 200){
        return this.$message.error('获取权限数据失败')
      }
      this.rightList = data.data
      this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible = true
    },
    getLeafKeys(node,arr){
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item,arr))
    },
    setRightDialogClosed(){
      this.defKeys = []
    },
    async allotRights(){
      const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const{data} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(data.meta.status !== 200){
        return this.$message.error('分配权限失败')
      }
      await this.getRoleList()
      this.$message.success('分配权限成功')
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style scoped>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbot{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
