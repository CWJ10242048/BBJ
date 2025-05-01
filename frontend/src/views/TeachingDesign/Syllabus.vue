<template>
  <div class="syllabus-container">
    <!-- 顶部标题和AI助手 -->
    <div class="syllabus-header">
      <div class="syllabus-title">
        <h2>教学大纲设计</h2>
        <el-tag type="success" effect="dark">AI辅助</el-tag>
      </div>
      <div class="ai-assistant-button" @click="showAiAssistant = true">
        <el-icon><ChatDotRound /></el-icon>
        <span>AI助手</span>
      </div>
    </div>

    <!-- 书籍选择 -->
    <el-card class="box-card book-card">
      <template #header>
        <div class="card-header">
          <span>选择教材</span>
          <div class="book-actions">
            <el-radio-group v-model="bookSelectionMethod" size="small">
              <el-radio-button label="isbn">ISBN码</el-radio-button>
              <el-radio-button label="pdf">PDF导入</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      
      <!-- ISBN输入方式 -->
      <div v-if="bookSelectionMethod === 'isbn'" class="isbn-input">
        <el-input
          v-model="isbnCode"
          placeholder="请输入教材ISBN码"
          class="isbn-input-field"
        >
          <template #append>
            <el-button @click="searchBookByISBN" :loading="isSearching">
              <el-icon><Search /></el-icon>
              {{ isSearching ? '检索中...' : '搜索' }}
            </el-button>
          </template>
        </el-input>
        <div v-if="isSearching" class="searching-animation">
          <div class="searching-content">
            <el-icon class="searching-icon"><Loading /></el-icon>
            <div class="searching-text">
              <span class="searching-title">正在检索书籍信息</span>
              <span class="searching-dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
              </span>
            </div>
          </div>
        </div>
        <div v-if="bookInfo" class="book-info">
          <el-image
            v-if="bookInfo.cover"
            :src="bookInfo.cover"
            class="book-cover"
            fit="contain"
          />
          <div class="book-details">
            <h4>{{ bookInfo.title }}</h4>
            <p>作者：{{ bookInfo.author }}</p>
            <p>出版社：{{ bookInfo.publisher }}</p>
            <p>出版年份：{{ bookInfo.publishYear }}</p>
          </div>
        </div>
        <div v-if="selectedBook" class="selected-book">
          <el-tag type="success" effect="dark" class="selected-book-tag">
            <el-icon><Check /></el-icon>
            已选择教材：{{ selectedBook }}
          </el-tag>
        </div>
      </div>

      <!-- PDF导入方式 -->
      <div v-else class="pdf-upload">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          accept=".pdf"
          :on-change="handleBookFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽PDF文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持PDF格式，大小不超过20MB
            </div>
          </template>
        </el-upload>
        <div v-if="uploadedBook" class="uploaded-book-info">
          <el-icon><Document /></el-icon>
          <span class="book-name">{{ uploadedBook.name }}</span>
          <el-button type="danger" link @click="removeBookFile">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 模板选择 -->
    <el-card class="box-card template-card">
      <template #header>
        <div class="card-header">
          <span>选择模板</span>
          <el-button type="primary" size="small" @click="handleImportTemplate">导入模板</el-button>
        </div>
      </template>
      <el-radio-group v-model="selectedTemplate" @change="handleTemplateChange">
        <el-radio-button label="default">默认模板</el-radio-button>
        <el-radio-button label="professional">专业课程模板</el-radio-button>
        <el-radio-button label="practice">实践课程模板</el-radio-button>
        <el-radio-button label="general">通识课程模板</el-radio-button>
      </el-radio-group>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
          <span v-if="isBasicInfoAIGenerated" class="ai-generated-tag">AI自动生成</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程性质" prop="courseType">
          <el-select v-model="form.courseType" placeholder="请选择课程性质">
            <el-option label="公共基础课程" value="public" />
            <el-option label="专业课程" value="professional" />
            <el-option label="选修课程" value="optional" />
            <el-option label="实践课程" value="practice" />
            <el-option label="通识教育课程" value="general" />
          </el-select>
        </el-form-item>
        <el-form-item label="学时信息" prop="hours">
          <div class="hours-row">
            <div class="hours-block">
              <div class="hours-title">学分</div>
              <div class="number-control">
                <el-button size="small" @click="form.credits = Math.max(1, form.credits - 0.5)">-</el-button>
                <span class="number">{{ form.credits }}</span>
                <el-button size="small" @click="form.credits = Math.min(10, form.credits + 0.5)">+</el-button>
              </div>
              <el-slider
                v-model="form.credits"
                :min="1"
                :max="10"
                :step="0.5"
                :show-tooltip="true"
                class="long-slider"
              />
            </div>
            <div class="hours-block">
              <div class="hours-title">总学时</div>
              <div class="number-control">
                <el-button size="small" @click="form.totalHours = Math.max(16, form.totalHours - 8)">-</el-button>
                <span class="number">{{ form.totalHours }}</span>
                <el-button size="small" @click="form.totalHours = Math.min(128, form.totalHours + 8)">+</el-button>
              </div>
              <el-slider
                v-model="form.totalHours"
                :min="16"
                :max="128"
                :step="8"
                :show-tooltip="true"
                class="long-slider"
                @input="handleTotalHoursInput"
              />
            </div>
            <div class="hours-block">
              <div class="hours-title">实验学时</div>
              <div class="number-control">
                <el-button size="small" @click="form.labHours = Math.max(0, form.labHours - 4)">-</el-button>
                <span class="number">{{ form.labHours }}</span>
                <el-button size="small" @click="form.labHours = Math.min(form.totalHours, form.labHours + 4)">+</el-button>
              </div>
              <el-slider
                v-model="form.labHours"
                :min="0"
                :max="form.totalHours"
                :step="4"
                :show-tooltip="true"
                class="long-slider"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="适用专业" prop="targetStudents">
          <el-input
            v-model="form.targetStudents"
            type="textarea"
            :rows="2"
            placeholder="请输入适用专业"
          />
        </el-form-item>
        <!-- <el-form-item label="课程简介" prop="courseDescription">
          <el-input
            v-model="form.courseDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入课程简介"
          />
        </el-form-item> -->
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学方法与考核</span>
          <span v-if="isMethodsAIGenerated" class="ai-generated-tag">AI自动生成</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="教学方法" prop="teachingMethods">
          <el-checkbox-group v-model="form.teachingMethods">
            <el-checkbox label="讲授法">讲授法</el-checkbox>
            <el-checkbox label="案例教学">案例教学</el-checkbox>
            <el-checkbox label="讨论法">讨论法</el-checkbox>
            <el-checkbox label="实践教学">实践教学</el-checkbox>
            <el-checkbox label="项目教学">项目教学</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="教学手段" prop="teachingMeans">
          <el-checkbox-group v-model="form.teachingMeans">
            <el-checkbox label="多媒体教学">多媒体教学</el-checkbox>
            <el-checkbox label="网络教学">网络教学</el-checkbox>
            <el-checkbox label="实验教学">实验教学</el-checkbox>
            <el-checkbox label="实践教学">实践教学</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="考核方式" prop="assessmentMethods" class="form-item-with-ai">
          <el-input
            v-model="form.assessmentMethods"
            type="textarea"
            :rows="3"
            placeholder="请输入考核方式"
          />
          <el-button 
            class="ai-suggestion-button" 
            type="primary" 
            circle 
            size="small"
            @click="showAiSuggestionFor('assessmentMethods')">
            <el-icon><Mic /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 参考资料和自定义需求提前 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>参考资料</span>
          <span v-if="isReferencesAIGenerated" class="ai-generated-tag">AI自动生成</span>
          <div class="reference-actions">
            <el-button type="success" size="small" @click="showAiRecommendation">
              <el-icon><Cpu /></el-icon>
              AI推荐
            </el-button>
            <el-switch
              v-model="showReferences"
              active-text="添加参考资料"
            />
          </div>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" v-if="showReferences">
        <el-form-item label="推荐教材" prop="recommendedBooks" v-if="isReferencesAIGenerated">
          <div class="recommended-books">
            <el-checkbox-group v-model="selectedBooks">
              <el-checkbox 
                v-for="book in recommendedBooks" 
                :key="book.title" 
                :label="book.title"
                class="book-checkbox"
              >
                <div class="book-item">
                  <div class="book-info-small">
                    <div class="book-title">{{ book.title }}</div>
                    <div class="book-author">{{ book.author }}</div>
                  </div>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="推荐资源" prop="recommendedResources" v-if="isReferencesAIGenerated">
          <div class="recommended-resources">
            <el-checkbox-group v-model="selectedResources">
              <el-checkbox 
                v-for="resource in recommendedResources" 
                :key="resource.name" 
                :label="resource.name"
                class="resource-checkbox"
              >
                <div class="resource-item">
                  <el-icon><Link /></el-icon>
                  <span>{{ resource.name }}</span>
                  <el-tag size="small" type="info">{{ resource.type }}</el-tag>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="自定义教材" prop="textbook">
          <div class="upload-container">
            <el-upload
              class="upload-demo"
              :auto-upload="false"
              :show-file-list="false"
              @change="handleFileChange"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              :before-upload="beforeUpload"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持PDF、Word文档格式</div>
              </template>
            </el-upload>
            <el-progress
              v-if="uploadProgress > 0"
              :percentage="uploadProgress"
              :status="uploadStatus"
              class="upload-progress"
            />
            <div v-if="form.textbook" class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ form.textbook }}</span>
              <el-button type="danger" link @click="removeFile">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="自定义资源" prop="onlineResources">
          <el-input
            v-model="form.onlineResources"
            type="textarea"
            :rows="2"
            placeholder="请输入网络资源"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>自定义需求</span>
          <span v-if="isCustomRequirementsAIGenerated" class="ai-generated-tag">AI自动生成</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="特殊要求" class="form-item-with-ai">
          <el-input
            v-model="form.customRequirements"
            type="textarea"
            :rows="4"
            placeholder="请输入您的特殊要求，如：课程特色、教学创新点等"
          />
          <el-button 
            class="ai-suggestion-button" 
            type="primary" 
            circle 
            size="small"
            @click="showAiSuggestionFor('customRequirements')">
            <el-icon><Mic /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 教学内容卡片，右上角加自动生成按钮 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学内容</span>
          <span v-if="isContentAIGenerated" class="ai-generated-tag">重新生成</span>
          <el-button type="success" size="small" class="green-button" @click="handleAutoGenerateContent">
            <el-icon><Cpu /></el-icon>
            重新生成
          </el-button>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="章节安排" prop="chapters" class="form-item-with-ai">
          <el-input
            v-model="form.chapters"
            type="textarea"
            :rows="5"
            placeholder="请输入章节安排"
          />
          <el-button 
            class="ai-suggestion-button" 
            type="primary" 
            circle 
            size="small"
            @click="showAiSuggestionFor('chapters')">
            <el-icon><Mic /></el-icon>
          </el-button>
        </el-form-item>
        <el-form-item label="重点难点" prop="keyPoints" class="form-item-with-ai">
          <el-input
            v-model="form.keyPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入重点难点"
          />
          <el-button 
            class="ai-suggestion-button" 
            type="primary" 
            circle 
            size="small"
            @click="showAiSuggestionFor('keyPoints')">
            <el-icon><Mic /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSubmit">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button
        type="warning"
        :loading="exporting"
        @click="handleExport"
      >
        {{ exporting ? '导出中...' : '导出' }}
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="教学大纲预览"
      width="70%"
      destroy-on-close
    >
      <div class="preview-content">
        <h2>{{ form.courseName }}教学大纲</h2>
        
        <div class="preview-section">
          <h3>基本信息</h3>
          <p><strong>课程名称：</strong>{{ form.courseName }}</p>
          <p><strong>课程性质：</strong>{{ form.courseType }}</p>
          <p><strong>学分：</strong>{{ form.credits }}</p>
          <p><strong>总学时：</strong>{{ form.totalHours }}</p>
          <p><strong>实验学时：</strong>{{ form.labHours }}</p>
          <p><strong>适用专业：</strong>{{ form.targetStudents }}</p>
        </div>

        <div class="preview-section">
          <h3>教学内容</h3>
          <p><strong>章节安排：</strong></p>
          <pre>{{ form.chapters }}</pre>
          <p><strong>重点难点：</strong></p>
          <pre>{{ form.keyPoints }}</pre>
        </div>

        <div class="preview-section">
          <h3>教学方法与考核</h3>
          <p><strong>教学方法：</strong>{{ form.teachingMethods.join('、') }}</p>
          <p><strong>教学手段：</strong>{{ form.teachingMeans.join('、') }}</p>
          <p><strong>考核方式：</strong></p>
          <pre>{{ form.assessmentMethods }}</pre>
        </div>

        <div class="preview-section">
          <h3>参考资料</h3>
          <p><strong>推荐教材：</strong>{{ selectedBooks.join('、') }}</p>
          <p><strong>推荐资源：</strong>{{ selectedResources.join('、') }}</p>
          <p v-if="form.textbook"><strong>自定义教材：</strong>{{ form.textbook }}</p>
          <p v-if="form.onlineResources"><strong>自定义资源：</strong></p>
          <pre v-if="form.onlineResources">{{ form.onlineResources }}</pre>
        </div>

        <div class="preview-section" v-if="form.customRequirements">
          <h3>特殊要求</h3>
          <pre>{{ form.customRequirements }}</pre>
        </div>
      </div>
    </el-dialog>

    <!-- 导入模板对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入大纲模板"
      width="450px"
      destroy-on-close
    >
      <div class="import-template-content">
        <p>请选择要导入的大纲模板文件，支持Word、PDF或Excel格式</p>
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :limit="1"
          accept=".docx,.pdf,.xlsx"
          :on-change="handleImportFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .docx、.pdf、.xlsx 格式，大小不超过10MB
            </div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="startAiAnalysis">
            开始分析
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- AI分析进度对话框 -->
    <el-dialog
      v-model="aiAnalyzing"
      title="AI分析中"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="ai-analysis-content">
        <div class="ai-analysis-header">
          <el-icon class="analyzing-icon"><Loading /></el-icon>
          <span>AI正在分析您的模板</span>
        </div>
        <el-steps :active="aiAnalysisStep" direction="vertical" finish-status="success">
          <el-step v-for="(step, index) in aiAnalysisSteps" :key="index" :title="step"></el-step>
        </el-steps>
      </div>
    </el-dialog>

    <!-- AI助手对话框 -->
    <el-dialog
      v-model="showAiAssistant"
      title="AI教学助手"
      width="550px"
      class="ai-assistant-dialog"
      :append-to-body="true"
      destroy-on-close
    >
      <div class="ai-chat-container">
        <div class="ai-chat-messages" ref="messagesContainer">
          <div class="message ai-message">
            <div class="avatar-container">
              <el-avatar :size="40" class="ai-avatar" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
            <div class="ai-message-content">
              <p>您好！我是您的AI教学助手。请问有什么可以帮助您的？</p>
              <p>我可以：</p>
              <ul>
                <li>根据学科特点推荐章节设计</li>
                <li>提供教学重难点分析</li>
                <li>生成合适的考核方式</li>
                <li>推荐相关教学资源</li>
              </ul>
            </div>
          </div>
          <div v-for="(msg, index) in aiMessages" :key="index" 
               :class="['message', msg.type === 'user' ? 'user-message' : 'ai-message']">
            <template v-if="msg.type !== 'user'">
              <div class="avatar-container">
                <el-avatar :size="40" class="ai-avatar" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              </div>
              <div class="ai-message-content">
                <p v-html="formatMessage(msg.content)"></p>
              </div>
            </template>
            <template v-else>
              <div class="user-message-content">
                <p v-html="formatMessage(msg.content)"></p>
              </div>
              <div class="avatar-container">
                <el-avatar :size="40" class="user-avatar" :src="userAvatarUrl" />
              </div>
            </template>
          </div>
        </div>
        <div class="ai-chat-input">
          <el-input 
            v-model="aiInputMessage" 
            placeholder="输入您的问题..." 
            @keyup.enter="sendMessageToAi"
            clearable
          >
            <template #append>
              <el-button @click="sendMessageToAi" :disabled="!aiInputMessage.trim()" type="primary">
                <el-icon><Position /></el-icon>
              </el-button>
            </template>
          </el-input>
          <div class="ai-quick-actions">
            <el-button size="small" type="info" plain @click="useAiSuggestion('根据我的课程特点，推荐一个合理的章节结构')">推荐章节结构</el-button>
            <el-button size="small" type="info" plain @click="useAiSuggestion('分析我的课程可能的教学重难点')">分析重难点</el-button>
            <el-button size="small" type="info" plain @click="useAiSuggestion('为我的课程推荐合适的考核方式')">推荐考核方式</el-button>
            <el-button size="small" type="info" plain @click="useAiSuggestion('推荐相关教学资源')">推荐教学资源</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Document, Delete, UploadFilled, Loading, ChatDotRound, UserFilled, Position, Mic, Cpu, Search, Check, Link } from '@element-plus/icons-vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import * as docx from 'docx'

const router = useRouter()

// 确保组件挂载时能正确显示
onMounted(() => {
  console.log('Syllabus component mounted')
})

// 定义表单类型接口
interface SyllabusForm {
  courseName: string;
  courseType: string;
  credits: number;
  totalHours: number;
  labHours: number;
  targetStudents: string;
  chapters: string;
  keyPoints: string;
  teachingMethods: string[];
  teachingMeans: string[];
  assessmentMethods: string;
  textbook: string;
  onlineResources: string;
  customRequirements: string;
}

const formRef = ref()
const previewVisible = ref(false)
const showReferences = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const selectedTemplate = ref('default')
const exporting = ref(false)
const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const aiAnalyzing = ref(false)
const aiAnalysisStep = ref(0)
const aiAnalysisSteps = [
  '正在解析模板文件...',
  '正在提取课程基本信息...',
  '正在分析教学内容与目标...',
  '正在构建课程结构...',
  '正在优化内容格式...'
]

// AI自动生成标记
const isBasicInfoAIGenerated = ref(false)
const isMethodsAIGenerated = ref(false)
const isReferencesAIGenerated = ref(false)
const isCustomRequirementsAIGenerated = ref(false)
const isContentAIGenerated = ref(false)

const form = ref<SyllabusForm>({
  courseName: '',
  courseType: '',
  credits: 2,
  totalHours: 32,
  labHours: 0,
  targetStudents: '',
  chapters: '',
  keyPoints: '',
  teachingMethods: [],
  teachingMeans: [],
  assessmentMethods: '',
  textbook: '',
  onlineResources: '',
  customRequirements: ''
})

const rules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseType: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  credits: [{ required: true, message: '请输入学分', trigger: 'blur' }],
  totalHours: [{ required: true, message: '请输入总学时', trigger: 'blur' }],
  labHours: [{ required: true, message: '请输入实验学时', trigger: 'blur' }],
  chapters: [{ required: true, message: '请输入章节安排', trigger: 'blur' }],
  keyPoints: [{ required: true, message: '请输入重点难点', trigger: 'blur' }],
  teachingMethods: [{ required: true, type: 'array', min: 1, message: '请选择教学方法', trigger: 'change' }],
  teachingMeans: [{ required: true, type: 'array', min: 1, message: '请选择教学手段', trigger: 'change' }],
  assessmentMethods: [{ required: true, message: '请输入考核方式', trigger: 'blur' }],
}

// 模板预设内容
interface TemplatePreset {
  teachingMethods: string[];
  teachingMeans: string[];
  assessmentMethods: string;
}

const templates: Record<string, TemplatePreset> = {
  default: {
    teachingMethods: ['讲授法', '案例教学'],
    teachingMeans: ['多媒体教学', '网络教学'],
    assessmentMethods: '平时成绩（30%）+ 期末考试（70%）'
  },
  professional: {
    teachingMethods: ['讲授法', '案例教学', '项目教学'],
    teachingMeans: ['多媒体教学', '实验教学', '实践教学'],
    assessmentMethods: '平时成绩（20%）+ 实验成绩（30%）+ 期末考试（50%）'
  },
  practice: {
    teachingMethods: ['实践教学', '项目教学'],
    teachingMeans: ['实验教学', '实践教学'],
    assessmentMethods: '平时成绩（40%）+ 实践报告（60%）'
  },
  general: {
    teachingMethods: ['讲授法', '讨论法'],
    teachingMeans: ['多媒体教学', '网络教学'],
    assessmentMethods: '平时成绩（40%）+ 期末论文（60%）'
  }
}

const handleTemplateChange = (template: string) => {
  const selected = templates[template as keyof typeof templates]
  if (selected) {
    form.value.teachingMethods = selected.teachingMethods
    form.value.teachingMeans = selected.teachingMeans
    form.value.assessmentMethods = selected.assessmentMethods
  }
  // 自动设置课程性质
  if (template === 'professional') {
    form.value.courseType = 'professional'
  } else if (template === 'practice') {
    form.value.courseType = 'practice'
  } else if (template === 'general') {
    form.value.courseType = 'general'
  }
  // 默认模板不自动设置
}

const handleFileChange = (file: any) => {
  uploadProgress.value = 0
  uploadStatus.value = ''
  
  // 模拟上传进度，加快速度
  const timer = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += 20
    } else {
      clearInterval(timer)
      uploadStatus.value = 'success'
      ElMessage.success('上传成功')
      form.value.textbook = file.name
    }
  }, 100) // 加快上传速度
}

const removeFile = () => {
  form.value.textbook = ''
  uploadProgress.value = 0
  uploadStatus.value = ''
}

const getLabel = (key: string) => {
  const labelMap: Record<string, string> = {
    courseName: '课程名称',
    courseType: '课程类型',
    credits: '学分',
    totalHours: '总学时',
    labHours: '实验学时',
    targetStudents: '适用专业',
    chapters: '章节安排',
    keyPoints: '重点难点',
    teachingMethods: '教学方法',
    teachingMeans: '教学手段',
    assessmentMethods: '考核方式',
    textbook: '教材',
    onlineResources: '网络资源',
    customRequirements: '特殊需求'
  }
  return labelMap[key] || key
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    // TODO: 调用保存API
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('请填写完整信息')
  }
}

const handlePreview = () => {
  // 构建预览内容
  const previewContent = {
    courseName: form.value.courseName,
    courseType: form.value.courseType,
    credits: form.value.credits,
    totalHours: form.value.totalHours,
    labHours: form.value.labHours,
    targetStudents: form.value.targetStudents,
    chapters: form.value.chapters,
    keyPoints: form.value.keyPoints,
    teachingMethods: form.value.teachingMethods.join('、'),
    teachingMeans: form.value.teachingMeans.join('、'),
    assessmentMethods: form.value.assessmentMethods,
    selectedBooks: selectedBooks.value.join('、'),
    selectedResources: selectedResources.value.join('、'),
    customTextbook: form.value.textbook,
    customResources: form.value.onlineResources,
    customRequirements: form.value.customRequirements
  }
  
  previewVisible.value = true
}

const handleExport = async () => {
  exporting.value = true
  try {
    // 创建Word文档
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          // 标题
          new docx.Paragraph({
            text: `${form.value.courseName}教学大纲`,
            heading: docx.HeadingLevel.HEADING_1,
            alignment: docx.AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // 基本信息
          new docx.Paragraph({
            text: '一、基本信息',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '课程名称：', bold: true }),
              new docx.TextRun({ text: form.value.courseName }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '课程性质：', bold: true }),
              new docx.TextRun({ text: form.value.courseType }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '学分：', bold: true }),
              new docx.TextRun({ text: form.value.credits.toString() }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '总学时：', bold: true }),
              new docx.TextRun({ text: form.value.totalHours.toString() }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '实验学时：', bold: true }),
              new docx.TextRun({ text: form.value.labHours.toString() }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '适用专业：', bold: true }),
              new docx.TextRun({ text: form.value.targetStudents }),
            ],
          }),

          // 教学内容
          new docx.Paragraph({
            text: '二、教学内容',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '章节安排：', bold: true }),
            ],
          }),
          new docx.Paragraph({
            text: form.value.chapters,
            spacing: {
              before: 100,
              after: 200,
            },
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '重点难点：', bold: true }),
            ],
          }),
          new docx.Paragraph({
            text: form.value.keyPoints,
            spacing: {
              before: 100,
              after: 200,
            },
          }),

          // 教学方法与考核
          new docx.Paragraph({
            text: '三、教学方法与考核',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '教学方法：', bold: true }),
              new docx.TextRun({ text: form.value.teachingMethods.join('、') }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '教学手段：', bold: true }),
              new docx.TextRun({ text: form.value.teachingMeans.join('、') }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '考核方式：', bold: true }),
            ],
          }),
          new docx.Paragraph({
            text: form.value.assessmentMethods,
            spacing: {
              before: 100,
              after: 200,
            },
          }),

          // 参考资料
          new docx.Paragraph({
            text: '四、参考资料',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '推荐教材：', bold: true }),
              new docx.TextRun({ text: selectedBooks.value.join('、') }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '推荐资源：', bold: true }),
              new docx.TextRun({ text: selectedResources.value.join('、') }),
            ],
          }),
          ...(form.value.textbook ? [
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: '自定义教材：', bold: true }),
                new docx.TextRun({ text: form.value.textbook }),
              ],
            })
          ] : []),
          ...(form.value.onlineResources ? [
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: '自定义资源：', bold: true }),
              ],
            }),
            new docx.Paragraph({
              text: form.value.onlineResources,
              spacing: {
                before: 100,
                after: 200,
              },
            })
          ] : []),

          // 特殊要求
          ...(form.value.customRequirements ? [
            new docx.Paragraph({
              text: '五、特殊要求',
              heading: docx.HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new docx.Paragraph({
              text: form.value.customRequirements,
              spacing: {
                before: 100,
                after: 200,
              },
            })
          ] : [])
        ],
      }],
    })

    // 生成文档并下载
    const blob = await docx.Packer.toBlob(doc)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${form.value.courseName}课程大纲.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    console.error('导出失败:', e)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = {
    courseName: '',
    courseType: '',
    credits: 2,
    totalHours: 32,
    labHours: 0,
    targetStudents: '',
    chapters: '',
    keyPoints: '',
    teachingMethods: [],
    teachingMeans: [],
    assessmentMethods: '',
    textbook: '',
    onlineResources: '',
    customRequirements: ''
  }
  
  // 重置所有AI生成标记
  isBasicInfoAIGenerated.value = false
  isMethodsAIGenerated.value = false
  isReferencesAIGenerated.value = false
  isCustomRequirementsAIGenerated.value = false
  isContentAIGenerated.value = false
}

const handleTotalHoursInput = () => {
  // 处理总学时输入时的逻辑
}

let autoGenTimer: any = null

const handleAutoGenerateContent = () => {
  // 机器学习章节内容按段分割
  const chaptersArr = [
    '一、绪论',
    '介绍机器学习的基本术语、假设空间、归纳偏好等基础概念，并探讨其发展历程及应用现状。',
    '二、模型评估与选择',
    '讲解模型的评估方法、性能度量、偏差与方差的关系，如何避免过拟合，并介绍比较检验的方法。',
    '三、线性模型',
    '涵盖线性回归、对数几率回归、线性判别分析等内容，并讨论多分类问题和类别不平衡。',
    '四、决策树',
    '介绍决策树的基本流程、划分选择、剪枝处理等，以及如何处理连续和缺失值。',
    '五、神经网络',
    '讨论神经元模型、感知机与多层网络、误差逆传播算法等，并探讨深度学习的应用。',
    '六、支持向量机',
    '讲解支持向量机的基本理论、间隔、支持向量、核函数等，介绍支持向量回归及核方法。',
    '七、贝叶斯分类',
    '介绍贝叶斯决策论、极大似然估计、朴素贝叶斯分类器、EM算法等贝叶斯方法。',
    '八、集成学习',
    '讨论个体学习与集成学习的区别，介绍Boosting、Bagging、随机森林等集成学习方法。',
    '九、聚类',
    '探讨聚类的任务、性能度量、距离计算方法，介绍原型聚类、密度聚类和层次聚类。',
    '十、降维与度量学习',
    '涵盖k近邻学习、主成分分析（PCA）、核化线性降维、流形学习和度量学习等降维方法。',
    '十一、特征选择与稀疏学习',
    '讲解特征选择方法，包括子集搜索、过滤式选择、包裹式选择和嵌入式选择。',
    '十二、计算学习理论',
    '讨论PAC学习、VC维、Rademacher复杂度等基础理论，以及如何通过稳定性进行模型评估。',
    '十三、半监督学习',
    '探讨未标记样本的利用、半监督SVM、图半监督学习等方法。',
    '十四、概率图模型',
    '介绍隐马尔可夫模型、马尔可夫随机场、条件随机场等概率图模型。',
    '十五、规则学习',
    '讲解规则学习的基本概念和优化方法，包括一阶规则学习和归纳逻辑程序设计。',
    '十六、强化学习',
    '讨论强化学习的任务与奖赏、K-摇臂赌博机、有模型学习与免模型学习、值函数近似等。'
  ]
  const keyPointsArr = [
    '一、模型评估与选择',
    '理解过拟合、偏差-方差平衡的核心思想，掌握如何选择和评估模型性能。',
    '二、神经网络',
    '深度学习及误差逆传播算法的理解较为复杂，需要对神经网络的构建和优化有一定掌握。',
    '三、支持向量机',
    '核函数的理解和支持向量回归的应用，特别是在高维数据中的使用。',
    '四、集成学习',
    'Boosting与Bagging的区别，及其如何通过集成多模型来提高预测准确性。',
    '五、计算学习理论',
    'PAC学习和VC维的数学理论可能是较难理解的部分。',
    '六、强化学习',
    '强化学习的奖励机制、值函数近似、免模型学习等，需要具备较强的数学基础。'
  ]

  // 清空内容
  form.value.chapters = ''
  form.value.keyPoints = ''

  // 清除上一次的定时器
  if (autoGenTimer) clearTimeout(autoGenTimer)

  // 2秒后逐条显示
  let chapterIndex = 0
  let keyPointIndex = 0

  function showNextChapter() {
    if (chapterIndex < chaptersArr.length) {
      form.value.chapters += (chapterIndex > 0 ? '\n' : '') + chaptersArr[chapterIndex]
      chapterIndex++
      autoGenTimer = setTimeout(showNextChapter, 200)
    } else {
      // 章节显示完后再显示重点难点
      setTimeout(showNextKeyPoint, 200)
    }
  }
  function showNextKeyPoint() {
    if (keyPointIndex < keyPointsArr.length) {
      form.value.keyPoints += (keyPointIndex > 0 ? '\n' : '') + keyPointsArr[keyPointIndex]
      keyPointIndex++
      autoGenTimer = setTimeout(showNextKeyPoint, 200)
    } else {
      // 内容生成完成，设置AI生成标记
      isContentAIGenerated.value = true
    }
  }

  setTimeout(showNextChapter, 2000)
}

const beforeUpload = (file: File) => {
  const isPDF = file.type === 'application/pdf'
  const isWord = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (!isPDF && !isWord) {
    ElMessage.error('只能上传PDF或Word文件')
    return false
  }
  return true
}

const handleImportTemplate = () => {
  importDialogVisible.value = true
}

const handleImportFileChange = (uploadFile: { raw: File }) => {
  importFile.value = uploadFile.raw
}

const startAiAnalysis = () => {
  if (!importFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  
  importDialogVisible.value = false
  aiAnalyzing.value = true
  aiAnalysisStep.value = 0
  
  // 模拟AI分析过程
  const analyzeNextStep = () => {
    if (aiAnalysisStep.value < aiAnalysisSteps.length - 1) {
      aiAnalysisStep.value++
      setTimeout(analyzeNextStep, 1500)
    } else {
      // 分析完成，填充表单数据
      setTimeout(() => {
        aiAnalyzing.value = false
        ElMessage.success('模板分析完成！')
        
        // 添加绿色AI自动生成标识
        const aiTag = '<span style="color: #67c23a; margin-left: 5px;">[AI自动生成]</span>'
        
        // 模拟填充数据
        form.value = {
          courseName: '人工智能导论',
          courseType: 'professional',
          credits: 3,
          totalHours: 48,
          labHours: 16,
          targetStudents: '计算机科学与技术、软件工程、人工智能等相关专业',
          chapters: '第一章 人工智能概述\n第二章 智能Agent\n第三章 搜索与规划\n第四章 知识表示与推理\n第五章 机器学习\n第六章 自然语言处理\n第七章 计算机视觉\n第八章 机器人学',
          keyPoints: '难点：\n1. 搜索算法的复杂性分析\n2. 概率模型与贝叶斯网络\n3. 深度学习模型的训练与优化\n\n重点：\n1. 各种启发式搜索方法\n2. 机器学习的基本原理\n3. 自然语言处理的基础技术',
          teachingMethods: ['讲授法', '案例教学', '项目教学'],
          teachingMeans: ['多媒体教学', '实验教学', '网络教学'],
          assessmentMethods: '平时成绩（20%）+ 实验报告（30%）+ 期末考试（50%）',
          textbook: '人工智能：一种现代方法（第4版）.pdf',
          onlineResources: 'Coursera - AI for Everyone\nStanford CS231n\nDeepLearning.AI',
          customRequirements: '注重培养学生解决实际问题的能力，鼓励学生参与科研项目和人工智能竞赛。'
        }
        
        // 更新所有AI生成标记
        isBasicInfoAIGenerated.value = true
        isMethodsAIGenerated.value = true
        isReferencesAIGenerated.value = true
        isCustomRequirementsAIGenerated.value = true
        isContentAIGenerated.value = true
      }, 1000)
    }
  }
  
  // 开始分析
  setTimeout(analyzeNextStep, 1500)
}

// AI助手相关状态
const showAiAssistant = ref(false)
const aiInputMessage = ref('')
const aiMessages = ref<{type: 'user' | 'ai', content: string}[]>([])

// 用户头像URL
const userAvatarUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
const messagesContainer = ref<HTMLElement | null>(null)

// 格式化消息内容，支持换行
const formatMessage = (content: string) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

// 发送消息给AI
const sendMessageToAi = () => {
  if (!aiInputMessage.value.trim()) return
  
  // 添加用户消息
  aiMessages.value.push({
    type: 'user',
    content: aiInputMessage.value
  })
  
  // 清空输入并滚动到底部
  const tempMessage = aiInputMessage.value
  aiInputMessage.value = ''
  
  // 滚动到底部
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 50)
  
  // 模拟AI正在输入
  setTimeout(() => {
    let response = ''
    
    if (tempMessage.includes('章节') || tempMessage.includes('结构')) {
      response = '根据您的课程内容，我建议您可以采用以下章节结构：\n\n1. 绪论：介绍基本概念和历史背景\n2. 基础理论：讲解核心原理和方法论\n3. 技术应用：介绍实际应用场景和案例\n4. 前沿发展：探讨学科最新研究成果和趋势\n5. 综合实践：设计实践项目强化学习'
    } else if (tempMessage.includes('重难点') || tempMessage.includes('分析')) {
      response = '您的课程可能的教学重难点有：\n\n重点：\n1. 核心概念的准确理解\n2. 基本原理的应用能力\n3. 典型案例的分析方法\n\n难点：\n1. 复杂理论的推导过程\n2. 多因素问题的综合分析\n3. 创新性解决方案的设计与评估'
    } else if (tempMessage.includes('考核') || tempMessage.includes('评估')) {
      response = '建议采用多元化考核方式：\n\n1. 平时表现（30%）：课堂参与、讨论和小测验\n2. 实践项目（30%）：小组合作完成的实际案例分析\n3. 期末考试（40%）：闭卷笔试，注重应用能力考查'
    } else if (tempMessage.includes('资源') || tempMessage.includes('推荐')) {
      response = '为您的课程推荐以下教学资源：\n\n1. 教材推荐：《现代教育理论与实践》\n2. 在线课程：Coursera - "教学设计的艺术"\n3. 视频资源：教育部国家精品课程资源库\n4. 案例库：https://www.teachingcases.org\n5. 数字工具：Miro数字白板、Kahoot互动教学'
    } else {
      response = '感谢您的提问！我建议您可以考虑以下几点：\n\n1. 明确教学目标，针对不同层次学生设计差异化教学内容\n2. 融入案例教学，增强学生参与感和实践能力\n3. 采用多媒体教学手段，提高课堂教学效果\n4. 建立即时反馈机制，及时调整教学策略'
    }
    
    aiMessages.value.push({
      type: 'ai',
      content: response
    })
    
    // 滚动到底部
    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }, 50)
  }, 1000)
}

// 使用快捷提问
const useAiSuggestion = (suggestion: string) => {
  aiInputMessage.value = suggestion
  sendMessageToAi()
}

// 在各个表单项右侧添加AI建议按钮
const showAiSuggestionFor = (field: string) => {
  // 根据不同字段给出不同的AI建议
  let suggestion = ''
  
  switch(field) {
    case 'chapters':
      handleAutoGenerateContent()
      ElMessage.success('已生成章节建议')
      break
    case 'keyPoints':
      setTimeout(() => {
        form.value.keyPoints = '重点：\n1. 核心理论的基本原理和适用条件\n2. 关键算法的实现步骤和优化方法\n3. 典型应用场景的分析与设计\n\n难点：\n1. 复杂概念的深入理解和融会贯通\n2. 算法的性能分析和改进策略\n3. 实际问题中的创新应用'
        isContentAIGenerated.value = true
        ElMessage.success('已生成重难点建议')
      }, 500)
      break
    case 'assessmentMethods':
      setTimeout(() => {
        form.value.assessmentMethods = '平时成绩（30%）：课堂表现、出勤率、小作业\n课程项目（30%）：分组完成实践项目，提交报告并展示\n期末考试（40%）：闭卷笔试，注重应用能力测评'
        isMethodsAIGenerated.value = true
        ElMessage.success('已生成考核方式建议')
      }, 500)
      break
    case 'customRequirements':
      setTimeout(() => {
        form.value.customRequirements = '1. 注重理论与实践结合，增加案例教学和实验环节\n2. 采用混合式教学模式，线上线下相结合\n3. 引入前沿研究成果，保持教学内容的时效性\n4. 重视学生创新能力培养，鼓励参与相关竞赛和项目'
        isCustomRequirementsAIGenerated.value = true
        ElMessage.success('已生成特殊要求建议')
      }, 500)
      break
  }
}

// 显示AI推荐资料
const showAiRecommendation = () => {
  ElMessage.success('正在获取AI推荐...');
  
  // 显示加载状态
  const loading = ElLoading.service({
    lock: true,
    text: 'AI正在分析您的课程...',
    background: 'rgba(255, 255, 255, 0.7)',
  });
  
  // 模拟加载时间
  setTimeout(() => {
    loading.close();
    isReferencesAIGenerated.value = true;
    // 清空之前的选择
    selectedBooks.value = [];
    selectedResources.value = [];
    ElMessage.success('AI推荐资料已生成');
  }, 1500);
}

// AI生成卡片内容
const generateCardContent = (cardType: string) => {
  ElMessage.success('AI正在生成内容...')
  
  // 显示加载状态
  const loading = ElLoading.service({
    lock: true,
    text: 'AI智能生成中...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  
  // 模拟加载时间
  setTimeout(() => {
    loading.close()
    
    switch(cardType) {
      case 'basic':
        form.value.courseName = '计算机程序设计基础'
        form.value.courseType = 'professional'
        form.value.credits = 4
        form.value.totalHours = 64
        form.value.labHours = 32
        form.value.targetStudents = '计算机科学与技术、软件工程、人工智能等相关专业'
        isBasicInfoAIGenerated.value = true
        ElMessage.success('基本信息已生成')
        break
        
      case 'methods':
        form.value.teachingMethods = ['讲授法', '案例教学', '项目教学']
        form.value.teachingMeans = ['多媒体教学', '实验教学', '网络教学']
        form.value.assessmentMethods = '平时成绩（30%）：课堂表现、出勤率、小测验\n实验项目（30%）：程序设计实验与项目开发\n期末考试（40%）：综合性试题，注重编程能力考核'
        isMethodsAIGenerated.value = true
        ElMessage.success('教学方法与考核已生成')
        break
        
      case 'references':
        form.value.textbook = 'C语言程序设计（第4版）.pdf'
        form.value.onlineResources = 'Coursera - 编程入门\nMIT OpenCourseWare - Introduction to Programming\nLeetCode编程训练\nGitHub优秀项目案例库'
        isReferencesAIGenerated.value = true
        ElMessage.success('参考资料已生成')
        break
        
      case 'custom':
        form.value.customRequirements = '1. 注重理论与实践结合，增加上机练习时间\n2. 采用分层次教学，适应不同基础的学生\n3. 引入真实项目案例，培养学生解决实际问题的能力\n4. 鼓励学生参与编程竞赛，提高创新能力\n5. 重视代码规范和软件工程思想的培养'
        isCustomRequirementsAIGenerated.value = true
        ElMessage.success('自定义需求已生成')
        break
    }
  }, 1500)
}

// 书籍选择相关状态
const bookSelectionMethod = ref('isbn')
const isbnCode = ref('')
const isSearching = ref(false)
const selectedBook = ref('')
const bookInfo = ref<{
  title: string;
  author: string;
  publisher: string;
  publishYear: string;
  cover: string;
} | null>(null)
const uploadedBook = ref<{ name: string; file: File } | null>(null)

// 通过ISBN搜索书籍
const searchBookByISBN = async () => {
  if (!isbnCode.value) {
    ElMessage.warning('请输入ISBN码')
    return
  }
  
  isSearching.value = true
  bookInfo.value = null
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 这里应该调用实际的API，这里使用模拟数据
    bookInfo.value = {
      title: '机器学习',
      author: '周志华',
      publisher: '清华大学出版社',
      publishYear: '2016',
      cover: '/src/assets/image/machine_learning.png'
    }
    selectedBook.value = '机器学习'
    ElMessage.success('书籍信息获取成功')
  } catch (error) {
    ElMessage.error('获取书籍信息失败')
  } finally {
    isSearching.value = false
  }
}

// 处理PDF文件上传
const handleBookFileChange = (file: any) => {
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过20MB')
    return
  }
  
  uploadedBook.value = {
    name: file.name,
    file: file.raw
  }
  ElMessage.success('文件上传成功')
}

// 移除已上传的PDF文件
const removeBookFile = () => {
  uploadedBook.value = null
}

// 参考资料相关状态
const selectedBooks = ref<string[]>([])
const selectedResources = ref<string[]>([])
const recommendedBooks = ref([
  {
    title: '机器学习',
    author: '周志华',
    cover: '/src/assets/image/machine_learning.png'
  },
  {
    title: '深度学习',
    author: 'Ian Goodfellow',
    cover: '/src/assets/image/deep_learning.png'
  },
  {
    title: '人工智能：一种现代方法',
    author: 'Stuart Russell',
    cover: '/src/assets/image/ai_modern.png'
  },
  {
    title: '统计学习方法',
    author: '李航',
    cover: '/src/assets/image/statistical_learning.png'
  }
])

const recommendedResources = ref([
  {
    name: 'Coursera - 机器学习课程',
    type: '在线课程',
    url: 'https://www.coursera.org/learn/machine-learning'
  },
  {
    name: 'Kaggle - 机器学习竞赛平台',
    type: '实践平台',
    url: 'https://www.kaggle.com'
  },
  {
    name: 'Google Colab',
    type: '开发环境',
    url: 'https://colab.research.google.com'
  },
  {
    name: 'Papers With Code',
    type: '论文资源',
    url: 'https://paperswithcode.com'
  }
])
</script>

<style scoped>
.syllabus-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.syllabus-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #e0f2ff 0%, #f0f9ff 100%);
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
}

.syllabus-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.syllabus-title h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.ai-assistant-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #409EFF;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.ai-assistant-button:hover {
  background-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.ai-assistant-button .el-icon {
  font-size: 18px;
}

.box-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.box-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* AI自动生成标记样式 */
.ai-generated-tag {
  color: #67c23a;
  font-size: 14px;
  margin-right: auto;
  margin-left: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.ai-generated-tag::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #67c23a;
  border-radius: 50%;
  margin-right: 6px;
}

.hours-row {
  display: flex;
  flex-direction: row;
  gap: 32px;
  justify-content: space-between;
  align-items: flex-start;
  margin: 10px 0 5px 0;
}

.hours-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 140px;
  max-width: 180px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 10px 4px 10px 4px;
  box-shadow: 0 1px 4px #0001;
}

.hours-title {
  font-size: 15px;
  font-weight: 400;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  color: #222;
  text-align: center;
}

.number-control {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.number {
  display: inline-block;
  min-width: 28px;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: #409EFF;
}

.long-slider {
  width: 160px;
  margin-bottom: 0;
}

.long-slider :deep(.el-slider__runway) {
  height: 6px;
}

.long-slider :deep(.el-slider__bar) {
  height: 6px;
}

.long-slider :deep(.el-slider__button) {
  width: 14px;
  height: 14px;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-progress {
  width: 100%;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.preview-content {
  padding: 20px;
  line-height: 1.6;
}

.preview-content h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.preview-section {
  margin-bottom: 30px;
}

.preview-section h3 {
  color: #409EFF;
  margin: 20px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.preview-section p {
  margin: 10px 0;
}

.preview-section pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.preview-section strong {
  color: #606266;
  margin-right: 8px;
}

.upload-demo {
  margin-bottom: 10px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.import-btn {
  margin-left: 10px;
}

.import-template-content {
  padding: 10px;
  text-align: center;
}

.ai-analysis-content {
  padding: 20px 0;
}

.el-upload {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
  height: 180px;
}

.el-upload__text {
  margin-top: 10px;
}

.el-steps :deep(.el-step__title) {
  font-size: 14px;
}

.el-steps :deep(.el-step__head.is-process) {
  color: #409EFF;
  border-color: #409EFF;
}

.el-steps :deep(.el-step__head.is-finish) {
  color: #67C23A;
  border-color: #67C23A;
}

.el-steps :deep(.is-process .el-step__title) {
  font-weight: bold;
}

.ai-analysis-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  color: #409EFF;
  font-weight: bold;
}

.analyzing-icon {
  margin-right: 10px;
  font-size: 20px;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 550px;
}

.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
}

.message {
  display: flex;
  margin-bottom: 20px;
  max-width: 85%;
}

.message.ai-message {
  margin-right: auto;
}

.message.user-message {
  margin-left: auto;
  flex-direction: row-reverse;
}

.avatar-container {
  flex-shrink: 0;
  margin-top: 4px;
}

.ai-avatar, .user-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ai-message-content {
  margin-left: 12px;
  padding: 12px 16px;
  background-color: white;
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  animation: fadeIn 0.3s ease-out;
}

.ai-message-content::before {
  content: '';
  position: absolute;
  left: -10px;
  bottom: 0;
  width: 0;
  height: 0;
  border-right: 10px solid white;
  border-top: 10px solid transparent;
}

.user-message-content {
  margin-right: 12px;
  padding: 12px 16px;
  background-color: #e6f7ff;
  border-radius: 12px 12px 0 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  animation: fadeIn 0.3s ease-out;
}

.user-message-content::before {
  content: '';
  position: absolute;
  right: -10px;
  bottom: 0;
  width: 0;
  height: 0;
  border-left: 10px solid #e6f7ff;
  border-top: 10px solid transparent;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-chat-input {
  padding: 15px;
  border-top: 1px solid #ebeef5;
  background-color: white;
}

.ai-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.card-header .el-button {
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.card-header .el-button .el-icon {
  transition: transform 0.5s ease;
}

.card-header .el-button:hover .el-icon {
  transform: rotate(180deg);
}

.form-item-with-ai {
  position: relative;
}

.ai-suggestion-button {
  position: absolute;
  right: -45px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.form-item-with-ai:hover .ai-suggestion-button {
  opacity: 1;
}

.ai-assistant-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.ai-assistant-dialog :deep(.el-dialog__header) {
  background-color: #409EFF;
  color: white;
  padding: 15px 20px;
}

.ai-assistant-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: bold;
}

.ai-assistant-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

.ai-message ul {
  margin: 5px 0;
  padding-left: 20px;
}

.ai-message li {
  margin-bottom: 5px;
}

.button-group .el-button {
  padding: 12px 25px;
  font-size: 15px;
  transition: all 0.3s;
}

.button-group .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header .el-button.green-button {
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
}

.card-header .el-button.green-button:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}

.ai-recommend-button {
  margin-left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.ai-recommend-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.ai-recommend-button .el-icon {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.book-card {
  margin-bottom: 20px;
}

.book-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.isbn-input {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.isbn-input-field {
  width: 100%;
  max-width: 400px;
}

.book-info {
  display: flex;
  gap: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.book-cover {
  width: 120px;
  height: 160px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.book-details {
  flex: 1;
}

.book-details h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.book-details p {
  margin: 5px 0;
  color: #606266;
}

.pdf-upload {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.uploaded-book-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.book-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.searching-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-top: 15px;
}

.searching-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.searching-icon {
  font-size: 24px;
  color: #409EFF;
  animation: spin 1.5s linear infinite;
}

.searching-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.searching-title {
  font-size: 16px;
  color: #606266;
}

.searching-dots {
  display: flex;
  gap: 2px;
}

.dot {
  animation: dotAnimation 1.4s infinite;
  opacity: 0;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotAnimation {
  0%, 20% {
    opacity: 0;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-4px);
  }
  80%, 100% {
    opacity: 0;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.selected-book {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 8px;
}

.selected-book-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  padding: 8px 12px;
}

.selected-book-tag .el-icon {
  margin-right: 4px;
}

.content-main {
  height: 100%;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  background-color: #f5f7fa;
}

.reference-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.recommended-books {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.book-checkbox {
  margin-right: 20px;
}

.book-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  background-color: #f5f7fa;
}

.book-item:hover {
  background-color: #e6f7ff;
}

.book-info-small {
  display: flex;
  align-items: center;
  gap: 8px;
}

.book-title {
  font-weight: 500;
  color: #303133;
}

.book-author {
  font-size: 13px;
  color: #909399;
  margin-left: 8px;
}

.book-author::before {
  content: '|';
  margin-right: 8px;
  color: #dcdfe6;
}

.recommended-resources {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.resource-checkbox {
  width: 100%;
  margin-right: 0;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.resource-item:hover {
  background-color: #f5f7fa;
}

.resource-item .el-icon {
  color: #409EFF;
}

.resource-item .el-tag {
  margin-left: auto;
}
</style>