<template>
  <div class="lesson-plan-container">
    <h2>教案生成</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教案基本信息</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="课程名称">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input v-model="form.teacher" placeholder="请输入授课教师" />
        </el-form-item>
        <el-form-item label="授课班级">
          <el-input v-model="form.class" placeholder="请输入授课班级" />
        </el-form-item>
        <el-form-item label="授课时间">
          <el-date-picker
            v-model="form.date"
            type="datetime"
            placeholder="选择授课时间"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学内容</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="教学目标">
          <el-input
            v-model="form.objectives"
            type="textarea"
            :rows="3"
            placeholder="请输入教学目标"
          />
        </el-form-item>
        <el-form-item label="教学重点">
          <el-input
            v-model="form.keyPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入教学重点"
          />
        </el-form-item>
        <el-form-item label="教学难点">
          <el-input
            v-model="form.difficultPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入教学难点"
          />
        </el-form-item>
        <el-form-item label="教学过程">
          <el-input
            v-model="form.procedure"
            type="textarea"
            :rows="5"
            placeholder="请输入教学过程"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSubmit">生成教案</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  courseName: '',
  teacher: '',
  class: '',
  date: '',
  objectives: '',
  keyPoints: '',
  difficultPoints: '',
  procedure: ''
})

const handleSubmit = () => {
  console.log('提交表单', form.value)
}

const handleReset = () => {
  form.value = {
    courseName: '',
    teacher: '',
    class: '',
    date: '',
    objectives: '',
    keyPoints: '',
    difficultPoints: '',
    procedure: ''
  }
}
</script>

<style scoped>
.lesson-plan-container {
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
</style> 