<template>
  <div class="interaction-container">
    <h2>互动环节设计</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>互动环节信息</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="互动类型">
          <el-select v-model="form.type" placeholder="请选择互动类型">
            <el-option label="课堂讨论" value="discussion" />
            <el-option label="小组活动" value="group" />
            <el-option label="角色扮演" value="roleplay" />
            <el-option label="案例分析" value="case" />
          </el-select>
        </el-form-item>
        <el-form-item label="互动时长">
          <el-input-number v-model="form.duration" :min="5" :max="60" />
          <span class="unit">分钟</span>
        </el-form-item>
        <el-form-item label="参与人数">
          <el-input-number v-model="form.participants" :min="2" :max="50" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>互动内容</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="互动主题">
          <el-input
            v-model="form.topic"
            type="textarea"
            :rows="2"
            placeholder="请输入互动主题"
          />
        </el-form-item>
        <el-form-item label="互动目标">
          <el-input
            v-model="form.objectives"
            type="textarea"
            :rows="3"
            placeholder="请输入互动目标"
          />
        </el-form-item>
        <el-form-item label="互动流程">
          <el-input
            v-model="form.procedure"
            type="textarea"
            :rows="5"
            placeholder="请输入互动流程"
          />
        </el-form-item>
        <el-form-item label="评价标准">
          <el-input
            v-model="form.evaluation"
            type="textarea"
            :rows="3"
            placeholder="请输入评价标准"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSubmit">生成互动方案</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  type: '',
  duration: 15,
  participants: 30,
  topic: '',
  objectives: '',
  procedure: '',
  evaluation: ''
})

const handleSubmit = () => {
  console.log('提交表单', form.value)
}

const handleReset = () => {
  form.value = {
    type: '',
    duration: 15,
    participants: 30,
    topic: '',
    objectives: '',
    procedure: '',
    evaluation: ''
  }
}
</script>

<style scoped>
.interaction-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.unit {
  margin-left: 10px;
  color: #606266;
}
</style>
