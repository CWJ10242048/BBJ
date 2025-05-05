<template>
  <div class="function-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>功能管理</span>
          <el-button type="primary" @click="handleAdd">添加功能</el-button>
        </div>
      </template>
      <el-table :data="functionList" style="width: 100%">
        <el-table-column prop="name" label="功能名称" />
        <el-table-column prop="category" label="分类">
          <template #default="scope">
            <span>
              {{ categoryMap[scope.row.category] || scope.row.category }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="功能描述" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑功能对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加功能' : '编辑功能'"
      width="500px">
      <el-form :model="functionForm" label-width="80px">
        <el-form-item label="功能名称">
          <el-input v-model="functionForm.name" />
        </el-form-item>
        <el-form-item label="功能分类">
          <el-select v-model="functionForm.category" placeholder="请选择分类">
            <el-option label="教学设计" value="teaching-design" />
            <el-option label="资源生成" value="resource-gen" />
            <el-option label="学情分析" value="analysis" />
            <el-option label="资源库" value="resource-lib" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="功能描述">
          <el-input v-model="functionForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="functionForm.status"
            :active-value="'enabled'"
            :inactive-value="'disabled'"
            active-text="启用"
            inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟数据
const functionList = ref([
  {
    id: 1,
    name: '教学大纲设计',
    category: 'teaching-design',
    description: '智能生成教学大纲，支持课程目标、教学内容、教学进度等设计',
    status: 'enabled'
  },
  {
    id: 2,
    name: '教案生成',
    category: 'teaching-design',
    description: '基于教学大纲自动生成详细教案，包含教学目标、重难点、教学过程等',
    status: 'enabled'
  },
  {
    id: 3,
    name: '互动环节设计',
    category: 'teaching-design',
    description: '设计课堂互动环节，包括提问、讨论、小组活动等',
    status: 'enabled'
  },
  {
    id: 4,
    name: 'PPT生成',
    category: 'resource-gen',
    description: '根据教案自动生成教学PPT，支持多种模板和样式',
    status: 'enabled'
  },
  {
    id: 5,
    name: '资源生成',
    category: 'resource-gen',
    description: '生成教学图片、视频、音频等多媒体资源',
    status: 'enabled'
  },
  {
    id: 6,
    name: '智能出题',
    category: 'resource-gen',
    description: '根据知识点自动生成练习题和测试题',
    status: 'enabled'
  },
  {
    id: 7,
    name: '学生数据看板',
    category: 'analysis',
    description: '展示学生学习数据，包括成绩、参与度、作业完成情况等',
    status: 'enabled'
  },
  {
    id: 8,
    name: '认知诊断',
    category: 'analysis',
    description: '分析学生认知水平，识别学习难点和薄弱环节',
    status: 'enabled'
  },
  {
    id: 9,
    name: '知识追踪',
    category: 'analysis',
    description: '追踪学生知识掌握情况，预测学习效果',
    status: 'enabled'
  },
  {
    id: 10,
    name: '知识图谱',
    category: 'resource-lib',
    description: '展示知识点之间的关联关系，构建知识网络',
    status: 'enabled'
  },
  {
    id: 11,
    name: '资源社区',
    category: 'resource-lib',
    description: '教师共享教学资源，交流教学经验',
    status: 'enabled'
  },
  {
    id: 12,
    name: '一键个性化备课',
    category: 'other',
    description: '根据学生特点自动生成个性化教学方案',
    status: 'enabled'
  },
  {
    id: 13,
    name: '代码OJ',
    category: 'other',
    description: '在线编程练习和评测系统',
    status: 'enabled'
  }
])

const dialogVisible = ref(false)
const dialogType = ref('add')
const functionForm = reactive({
  name: '',
  category: '',
  description: '',
  status: 'enabled'
})

const categoryMap = {
  'teaching-design': '教学设计',
  'resource-gen': '资源生成',
  'analysis': '学情分析',
  'resource-lib': '资源库',
  'other': '其他'
}

const handleAdd = () => {
  dialogType.value = 'add'
  functionForm.name = ''
  functionForm.category = ''
  functionForm.description = ''
  functionForm.status = 'enabled'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(functionForm, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessage.confirm('确定要删除该功能吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = functionList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      functionList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const handleSubmit = () => {
  if (!functionForm.name) {
    ElMessage.warning('请输入功能名称')
    return
  }
  
  if (!functionForm.category) {
    ElMessage.warning('请选择功能分类')
    return
  }
  
  if (dialogType.value === 'add') {
    functionList.value.push({
      id: Date.now(),
      ...functionForm
    })
    ElMessage.success('添加成功')
  } else {
    const index = functionList.value.findIndex(item => item.id === functionForm.id)
    if (index !== -1) {
      functionList.value[index] = { ...functionForm }
      ElMessage.success('更新成功')
    }
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.function-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  margin-bottom: 20px;
}
</style> 