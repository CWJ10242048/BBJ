<template>
  <div style="color:red">这是Syllabus.vue内容</div>
  <div class="syllabus-container">
    <h2>教学大纲设计</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="课程名称">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select v-model="form.courseType" placeholder="请选择课程类型">
            <el-option label="必修课" value="required" />
            <el-option label="选修课" value="optional" />
          </el-select>
        </el-form-item>
        <el-form-item label="学分">
          <el-input-number v-model="form.credits" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="学时">
          <el-input-number v-model="form.hours" :min="16" :max="64" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学目标</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="知识目标">
          <el-input
            v-model="form.knowledgeObjectives"
            type="textarea"
            :rows="3"
            placeholder="请输入知识目标"
          />
        </el-form-item>
        <el-form-item label="能力目标">
          <el-input
            v-model="form.abilityObjectives"
            type="textarea"
            :rows="3"
            placeholder="请输入能力目标"
          />
        </el-form-item>
        <el-form-item label="素质目标">
          <el-input
            v-model="form.qualityObjectives"
            type="textarea"
            :rows="3"
            placeholder="请输入素质目标"
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
        <el-form-item label="章节安排">
          <el-input
            v-model="form.chapters"
            type="textarea"
            :rows="5"
            placeholder="请输入章节安排"
          />
        </el-form-item>
        <el-form-item label="重点难点">
          <el-input
            v-model="form.keyPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入重点难点"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSubmit">生成教学大纲</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  courseName: '',
  courseType: '',
  credits: 2,
  hours: 32,
  knowledgeObjectives: '',
  abilityObjectives: '',
  qualityObjectives: '',
  chapters: '',
  keyPoints: ''
})

const handleSubmit = () => {
  console.log('提交表单', form.value)
}

const handleReset = () => {
  form.value = {
    courseName: '',
    courseType: '',
    credits: 2,
    hours: 32,
    knowledgeObjectives: '',
    abilityObjectives: '',
    qualityObjectives: '',
    chapters: '',
    keyPoints: ''
  }
}
</script>

<style scoped>
.syllabus-container {
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
