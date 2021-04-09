<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3,5,10,15]" :page-size="queryInfo.pagesize" layout="total,sizes,prev,pager,next,jumper" :total="total">
      </el-pagination>
    </el-card>

    <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>

    <el-dialog
        title="修改分类信息"
        :visible.sync="editCateDialogVisible"
        width="50%" @close="editCateDialogClosed">
      <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="70px" @close="editCateDialogClosed">
        <el-form-item label="分类名" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCateInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data(){
    return {
      cateList:[],
      queryInfo:{
        type:3,
        pagenum:1,
        pagesize:5
      },
      total:0,
      columns:[
        {
          label:'分类名称',
          prop:'cat_name'
        },
        {
          label:'是否有效',
          type:'template',
          template:'isOk'
        },
        {
          label:'排序',
          type:'template',
          template:'order'
        },
        {
          label:'操作',
          type:'template',
          template:'opt'
        }
      ],
      addCateDialogVisible:false,
      addCateForm:{
        cat_name:'',
        cat_pid:0,
        cat_level:0
      },
      addCateFormRules:{
        cat_name:[
          {required:true,message:'请输入分类名称',trigger:'blur'}
        ]
      },
      parentCateList:[],
      cascaderProps:{
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      selectedKeys:[],
      editCateDialogVisible:false,
      editCateForm:{}
    }
  },
  created() {
    this.getCateList()
  },
  methods:{
    async getCateList(){
      const {data} = await this.$http.get('categories',{params:this.queryInfo})
      if(data.meta.status !== 200){
        return this.$message.error('获取分类数据失败')
      }
      this.cateList = data.data.result
      this.total = data.data.total
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog(){
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    async getParentCateList(){
      const {data} = await this.$http.get('categories',{params:{type:2}})
      if(data.meta.status !== 200){
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = data.data
    },
    parentCateChanged(){
      if(this.selectedKeys.length > 0){
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCateDialogClosed(){
      this.$refs.addCateFormRef.restFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
      this.addCateDialogVisible = false
    },
    addCate(){
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data} = await this.$http.post('categories',this.addCateForm)
        if(data.meta.status !== 201){
          return this.$message.error('添加分类失败')
        }
        await this.getCateList()
        this.$message.success('添加分类成功')
        this.addCateDialogVisible = false
      })
    },
    async showEditCateDialog(id){
      this.editCateDialogVisible = true
      const {data} = await this.$http.get('categories/' + id)
      if(data.meta.status !== 200){
        return this.$message.error('获取分类信息失败')
      }
      this.editCateForm = data.data
    },
    editCateInfo(){
      this.$refs.editCateFormRef.validate(async valid => {
        if(!valid) return
        const {data} = await this.$http.put('categories/' + this.editCateForm.cat_id,{cat_name:this.editCateForm.cat_name})

        if(data.meta.status !== 200){
          return this.$message.error(('更新分类信息失败'))
        }
        await this.getCateList()
        this.editCateDialogVisible = false
        this.$message.success('更新分类信息成功')
      })
    },
    editCateDialogClosed(){
      this.$refs.editCateFormRef.resetFields()
    },
    async removeCate(id){
      const confirmResult = await this.$confirm('此操作将永久删除该分类，是否继续？','提示',{
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('取消了删除')
      }
      const {data} = await this.$http.delete('categories/' + id)
      await this.getCateList()
      if(data.meta.status !== 200){
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
    },
  }
}
</script>

<style scoped>
.treeTable{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>
