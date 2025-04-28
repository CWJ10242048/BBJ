<template>
  <div class="home-page">
    <div class="page-header">
      <div class="title-section">
        <div class="line-decoration"></div>
        教学设计自动化
        <div class="line-decoration"></div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-label">学段:</div>
        <div class="filter-options">
          <el-button size="small" class="filter-option active">小学</el-button>
          <el-button size="small" class="filter-option">初中</el-button>
          <el-button size="small" class="filter-option">高中</el-button>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-label">学科:</div>
        <div class="filter-options">
          <el-button size="small" class="filter-option active">语文</el-button>
          <el-button size="small" class="filter-option">数学</el-button>
          <el-button size="small" class="filter-option">英语</el-button>
          <el-button size="small" class="filter-option">道德与法治</el-button>
          <el-button size="small" class="filter-option">科学</el-button>
          <el-button size="small" class="filter-option">历史</el-button>
          <el-button size="small" class="filter-option">美术</el-button>
          <el-button size="small" class="filter-option">体育与健康</el-button>
          <el-button size="small" class="filter-option">信息技术</el-button>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-label">版本:</div>
        <div class="filter-options">
          <el-button size="small" class="filter-option active">统编版</el-button>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-label">年级:</div>
        <div class="filter-options">
          <el-button size="small" class="filter-option">一年级</el-button>
          <el-button size="small" class="filter-option active">二年级</el-button>
          <el-button size="small" class="filter-option">三年级</el-button>
          <el-button size="small" class="filter-option">四年级</el-button>
          <el-button size="small" class="filter-option">五年级</el-button>
          <el-button size="small" class="filter-option">六年级</el-button>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-label">学期:</div>
        <div class="filter-options">
          <el-button size="small" class="filter-option active">上册</el-button>
          <el-button size="small" class="filter-option">下册</el-button>
        </div>
      </div>
    </div>

    <!-- AI助手对话框 -->
    <el-card class="ai-assistant-card">
      <div class="card-header">
        <div class="header-icon">
          <el-icon><ChatLineRound /></el-icon>
        </div>
        <div class="header-title">教育AI助手</div>
        <div class="header-actions">
          <el-button size="small" type="primary" plain>新建会话</el-button>
        </div>
      </div>
      <div class="card-content">
        <div class="message ai-message">
          <p>你好！我是教学设计AI助手。你可以问我任何有关教学设计的问题，我将尽力为你提供帮助。例如，你可以这样问我：</p>
          <ul>
            <li>请帮我设计一节语文课的教学大纲</li>
            <li>如何制作互动性强的教学课件？</li>
            <li>二年级学生的认知特点是什么？</li>
          </ul>
        </div>
      </div>
      <div class="input-area">
        <el-input 
          v-model="prompt" 
          type="textarea" 
          rows="2" 
          placeholder="想问什么？在这里输入您的问题..."
          resize="none"
        ></el-input>
        <div class="action-buttons">
          <el-button type="primary" :disabled="!prompt">发送</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChatLineRound } from '@element-plus/icons-vue'

const prompt = ref('')
</script>

<style scoped>
.home-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.title-section {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #4a8ccf;
}

.line-decoration {
  height: 2px;
  width: 50px;
  background: #4a8ccf;
  margin: 0 15px;
}

.filter-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  margin-bottom: 15px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  width: 60px;
  font-weight: bold;
  color: #333;
  line-height: 32px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-option {
  margin: 0 !important;
  background: transparent;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.filter-option.active {
  background-color: #4a8ccf;
  border-color: #4a8ccf;
  color: white;
}

.ai-assistant-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  background-color: #f5f9ff;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e6f0ff;
}

.header-icon {
  color: #4a8ccf;
  font-size: 20px;
  margin-right: 10px;
}

.header-title {
  font-weight: bold;
  flex-grow: 1;
}

.card-content {
  padding: 20px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.message {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
}

.ai-message {
  background-color: #f5f9ff;
  color: #333;
}

.ai-message p {
  margin-top: 0;
  margin-bottom: 10px;
}

.ai-message ul {
  padding-left: 20px;
}

.ai-message li {
  margin-bottom: 5px;
}

.input-area {
  padding: 15px 20px;
  background-color: #f9fbfd;
  border-top: 1px solid #eee;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.action-buttons .el-button--primary {
  background-color: #4a8ccf;
  border-color: #4a8ccf;
}

.action-buttons .el-button--primary:hover,
.action-buttons .el-button--primary:focus {
  background-color: #6ba4e2;
  border-color: #6ba4e2;
}

.header-actions .el-button--primary {
  color: #4a8ccf;
  border-color: #4a8ccf;
}

.header-actions .el-button--primary:hover,
.header-actions .el-button--primary:focus {
  color: #6ba4e2;
  border-color: #6ba4e2;
}
</style>