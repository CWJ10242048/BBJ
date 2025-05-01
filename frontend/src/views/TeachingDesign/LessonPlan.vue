<template>
  <div class="lesson-plan-container">
    <h2>教案生成</h2>
    
    <!-- 教学大纲上传卡片 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学大纲</span>
        </div>
      </template>
      <div class="upload-container">
        <el-radio-group v-model="syllabusSource" size="small" class="syllabus-source">
          <el-radio-button label="upload">上传新大纲</el-radio-button>
          <el-radio-button label="history">选择历史大纲</el-radio-button>
        </el-radio-group>

        <div v-if="syllabusSource === 'upload'" class="upload-section">
        <el-upload
          class="upload-demo"
          :auto-upload="false"
          :show-file-list="false"
          @change="handleFileChange"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          :before-upload="beforeUpload"
        >
          <el-button type="primary">上传教学大纲</el-button>
          <template #tip>
            <div class="el-upload__tip">支持PDF、Word文档格式</div>
          </template>
        </el-upload>
        </div>

        <div v-else class="history-section">
          <el-select
            v-model="selectedHistorySyllabus"
            placeholder="请选择历史教学大纲"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in historySyllabusList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>

        <el-progress
          v-if="uploadProgress > 0"
          :percentage="uploadProgress"
          :status="uploadStatus"
          class="upload-progress"
        />
        <div v-if="form.syllabus" class="file-info">
          <el-icon><Document /></el-icon>
          <span class="file-name">{{ form.syllabus }}</span>
          <el-button type="danger" link @click="removeFile">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 教案基本信息 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教案基本信息</span>
          <el-tag v-if="isBasicInfoAIGenerated" type="success" effect="dark">AI自动生成</el-tag>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程主题" prop="topic">
          <el-input v-model="form.topic" placeholder="请输入课程主题" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacher">
          <el-input v-model="form.teacher" placeholder="请输入授课教师" />
        </el-form-item>
        <el-form-item label="授课班级" prop="class">
          <el-select
            v-model="form.class"
            placeholder="请选择或输入授课班级"
            filterable
            allow-create
            default-first-option
            style="width: 100%"
          >
            <el-option
              v-for="item in classOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="授课时间" prop="date">
          <div class="time-range-picker">
          <el-date-picker
              v-model="form.startTime"
            type="datetime"
              placeholder="开始时间"
              :disabled-date="disabledDate"
              :disabled-hours="disabledHours"
              :disabled-minutes="disabledMinutes"
            />
            <span class="time-separator">至</span>
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="结束时间"
              :disabled-date="disabledDate"
              :disabled-hours="disabledHours"
              :disabled-minutes="disabledMinutes"
            />
          </div>
        </el-form-item>
        <el-form-item label="课次" prop="lessonNumber">
          <div class="number-control">
            <el-button size="small" @click="form.lessonNumber = Math.max(1, form.lessonNumber - 1)">-</el-button>
            <span class="number">{{ form.lessonNumber }}</span>
            <el-button size="small" @click="form.lessonNumber = Math.min(32, form.lessonNumber + 1)">+</el-button>
          </div>
        </el-form-item>
        <el-form-item label="课时" prop="duration">
          <div class="number-control">
            <el-button size="small" @click="form.duration = Math.max(1, form.duration - 1)">-</el-button>
            <span class="number">{{ form.duration }}</span>
            <el-button size="small" @click="form.duration = Math.min(4, form.duration + 1)">+</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 教学资源上传 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学资源</span>
          <div class="header-right">
            <el-radio-group v-model="resourceSource" size="small">
              <el-radio-button label="upload">上传资源</el-radio-button>
              <el-radio-button label="ai">AI推荐</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      <div class="upload-container">
        <div v-if="resourceSource === 'upload'">
        <el-upload
          class="upload-demo"
          :auto-upload="false"
          :show-file-list="true"
          multiple
          :on-preview="handlePreviewResource"
          :on-remove="handleRemoveResource"
          :before-remove="beforeRemoveResource"
          :on-exceed="handleExceed"
          :limit="5"
            :on-change="handleResourceChange"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
        >
          <el-button type="primary">上传教学资源</el-button>
          <template #tip>
            <div class="el-upload__tip">支持PDF、Word、PPT、视频、图片等格式，最多上传5个文件</div>
          </template>
        </el-upload>
        </div>
        <div v-else class="ai-resources">
          <div class="resource-filters">
            <el-select v-model="selectedResourceType" placeholder="选择资源类型" style="width: 200px">
              <el-option label="全部" value="all" />
              <el-option label="课件" value="ppt" />
              <el-option label="文档" value="doc" />
              <el-option label="视频" value="video" />
              <el-option label="图片" value="image" />
            </el-select>
            <el-button type="primary" @click="handleGenerateResources" :loading="generating">
              {{ generating ? '生成中...' : '生成推荐资源' }}
            </el-button>
          </div>
          <div v-if="aiResources.length > 0" class="resource-list">
            <el-card v-for="resource in filteredResources" :key="resource.id" class="resource-card">
              <div class="resource-info">
                <el-icon :size="24" :color="getResourceIconColor(resource.type)">
                  <component :is="getResourceIcon(resource.type)" />
                </el-icon>
                <div class="resource-details">
                  <h4>{{ resource.name }}</h4>
                  <p>{{ resource.description }}</p>
                  <div class="resource-tags">
                    <el-tag size="small" v-for="tag in resource.tags" :key="tag">{{ tag }}</el-tag>
                  </div>
                </div>
              </div>
              <div class="resource-actions">
                <el-button type="primary" link @click="handlePreviewAIResource(resource)">预览</el-button>
                <el-button type="success" link @click="handleUseAIResource(resource)">使用</el-button>
              </div>
            </el-card>
          </div>
          <div v-else-if="!generating" class="empty-resources">
            <el-empty description="点击生成按钮获取AI推荐资源" />
          </div>
        </div>

        <!-- 已使用资源列表 -->
        <div class="used-resources">
          <div class="section-header">
            <span class="section-title">已使用资源</span>
            <el-button type="primary" link @click="handleSortResources">
              <el-icon><Sort /></el-icon>
              排序
            </el-button>
          </div>
          <el-table
            v-if="usedResources.length > 0"
            :data="usedResources"
            style="width: 100%"
            row-key="id"
            :row-class-name="tableRowClassName"
            size="small"
            :header-cell-style="{
              background: '#f5f7fa',
              color: '#606266',
              fontWeight: 'normal',
              fontSize: '14px'
            }"
          >
            <el-table-column type="index" width="40" />
            <el-table-column label="资源名称" min-width="180">
              <template #default="{ row }">
                <div class="resource-name-cell">
                  <el-icon :size="16" :color="getResourceIconColor(row.type)">
                    <component :is="getResourceIcon(row.type)" />
                  </el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="getResourceTagType(row.type)">
                  {{ getResourceTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handlePreviewResource(row)">预览</el-button>
                <el-button type="danger" link size="small" @click="handleRemoveUsedResource(row)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无已使用资源" :image-size="60" />
        </div>
      </div>
    </el-card>

    <!-- 教学环节时间分配 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学环节时间分配</span>
          <el-button type="primary" size="small" @click="showAddDialog = true">增加环节</el-button>
        </div>
      </template>
      <div class="stages-list">
        <div v-for="(stage, idx) in stages" :key="stage.id" class="stage-card" :style="{ background: getStageColor(stage.type) + '20' }">
          <div class="stage-header">
            <el-select v-model="stage.type" placeholder="选择环节" style="width: 140px" @change="handleStageTypeChange(stage, idx)">
              <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
              <el-option label="自定义" value="custom" />
            </el-select>
            <el-input v-if="stage.type==='custom'" v-model="stage.name" placeholder="输入环节名称" style="width: 120px; margin-left: 8px" />
            <el-button type="danger" link @click="removeStage(idx)" style="margin-left: 8px">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div class="stage-body">
            <div class="stage-time">
              <el-input-number 
                v-model="stage.time" 
                :min="1" 
                :max="180" 
                :step="1" 
                controls-position="right" 
                style="width: 100px"
                @change="handleTimeChange"
              />
              <span class="time-unit">分钟</span>
            </div>
            <el-input
              v-model="stage.desc"
              type="textarea"
              :rows="2"
              placeholder="详细描述"
              style="margin-top: 8px"
            />
          </div>
        </div>
      </div>
      <div class="timeline-bar">
        <div
          v-for="(item, idx) in timeline"
          :key="item.id"
          class="timeline-segment"
          :style="{ width: item.percent + '%', background: item.color }"
          :title="item.name + '：' + item.time + '分钟'"
          draggable="true"
          @dragstart="handleDragStart($event, idx)"
          @dragover.prevent="handleDragOver($event, idx)"
          @drop="handleDrop($event, idx)"
          @dragend="handleDragEnd"
        >
          <span class="timeline-label">{{ item.name }}<span v-if="item.time">({{ item.time }})</span></span>
          <div class="resize-handle left" @mousedown="startResize($event, idx, 'left')"></div>
          <div class="resize-handle right" @mousedown="startResize($event, idx, 'right')"></div>
        </div>
      </div>
      <div class="total-time-info">
        总时间 <span class="total-time">{{ form.duration * 45 }}分钟</span>
      </div>
      <el-dialog v-model="showAddDialog" title="增加环节" width="320px" :close-on-click-modal="false">
        <el-select v-model="addStageType" placeholder="选择环节类型" style="width: 100%">
          <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
          <el-option label="自定义" value="custom" />
        </el-select>
        <el-input v-if="addStageType==='custom'" v-model="addStageName" placeholder="输入自定义环节名称" style="margin-top: 12px" />
        <div style="margin-top: 18px; text-align: right">
          <el-button @click="showAddDialog=false">取消</el-button>
          <el-button type="primary" @click="addStage">确定</el-button>
        </div>
      </el-dialog>
    </el-card>

    <!-- 教学内容 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学内容</span>
          <div class="header-right">
            <el-tag v-if="isContentAIGenerated" type="success" effect="dark" class="ai-tag">AI自动生成</el-tag>
            <el-button type="primary" size="small" @click="handleAutoGenerateContent" :disabled="typing">
              {{ typing ? '生成中...' : '重新生成' }}
            </el-button>
          </div>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="教学目标" prop="objectives">
          <el-input
            v-model="form.objectives"
            type="textarea"
            :rows="5"
            placeholder="请输入教学目标"
            :readonly="typing"
          />
        </el-form-item>
        <el-form-item label="教学重点" prop="keyPoints">
          <el-input
            v-model="form.keyPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入教学重点"
            :readonly="typing"
          />
        </el-form-item>
        <el-form-item label="教学难点" prop="difficultPoints">
          <el-input
            v-model="form.difficultPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入教学难点"
            :readonly="typing"
          />
        </el-form-item>
        <el-form-item label="教学过程" prop="procedure">
          <el-input
            v-model="form.procedure"
            type="textarea"
            :rows="5"
            placeholder="请输入教学过程"
            :readonly="typing"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 教学反思与总结 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学反思与总结</span>
          <div class="header-right">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleAnalyzeReflection" 
              :disabled="!canGenerateAnalysis || analyzing"
            >
              {{ analyzing ? '分析中...' : 'AI分析' }}
            </el-button>
          </div>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <div v-if="isReflectionAIGenerated" class="analysis-section">
          <div class="analysis-header">
            <h3>AI分析报告</h3>
            <div class="total-score">
              教案总分：<span class="score">{{ totalScore }}</span>
            </div>
          </div>
          <div class="analysis-content">
            <div v-for="(item, index) in analysisItems" :key="index" class="analysis-item">
              <div class="analysis-item-header">
                <span class="item-name">{{ item.name }}</span>
                <el-rate
                  v-model="item.score"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}分"
                />
              </div>
              <div class="analysis-details">
                <div class="strengths" v-if="item.strengths.length">
                  <h4>优点：</h4>
                  <ul>
                    <li v-for="(strength, idx) in item.strengths" :key="idx">{{ strength }}</li>
                  </ul>
                </div>
                <div class="weaknesses" v-if="item.weaknesses.length">
                  <h4>不足：</h4>
                  <ul>
                    <li v-for="(weakness, idx) in item.weaknesses" :key="idx">{{ weakness }}</li>
                  </ul>
                </div>
                <div class="suggestions" v-if="item.suggestions.length">
                  <h4>改进建议：</h4>
                  <ul>
                    <li v-for="(suggestion, idx) in item.suggestions" :key="idx">{{ suggestion }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-form-item label="教学效果" prop="teachingEffect">
          <el-rate v-model="form.teachingEffect" :texts="['很差', '较差', '一般', '较好', '很好']" show-text />
        </el-form-item>
        <el-form-item label="学生反馈" prop="studentFeedback">
          <el-input
            v-model="form.studentFeedback"
            type="textarea"
            :rows="3"
            placeholder="记录学生的反馈意见"
          />
        </el-form-item>
        <el-form-item label="教学反思" prop="teachingReflection">
          <el-input
            v-model="form.teachingReflection"
            type="textarea"
            :rows="4"
            placeholder="记录教学过程中的问题和改进建议"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSubmit">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" :loading="exporting" @click="handleExport">
        {{ exporting ? '导出中...' : '导出' }}
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="教案预览"
      width="70%"
      destroy-on-close
    >
      <div class="preview-content">
        <h2>{{ form.courseName }}教案</h2>
        <div v-for="(value, key) in previewData" :key="key">
          <h3>{{ key }}</h3>
          <div v-if="Array.isArray(value)" class="preview-list">
            <div v-for="(item, index) in value" :key="index" class="preview-item">
              <template v-if="key === '教学环节'">
                <div class="stage-info">
                  <span class="stage-name">{{ item.name }}</span>
                  <span class="stage-time">{{ item.time }}分钟</span>
                </div>
                <p class="stage-desc">{{ item.desc }}</p>
              </template>
              <template v-else-if="key === '教学资源'">
                <div class="resource-info">
                  <span class="resource-name">{{ item.name }}</span>
                  <el-tag size="small" :type="getResourceTagType(item.type)">{{ item.type }}</el-tag>
                </div>
                <p class="resource-desc">{{ item.description }}</p>
              </template>
            </div>
          </div>
          <p v-else>{{ value }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Delete, Picture, VideoPlay, Collection, Sort } from '@element-plus/icons-vue'
import { nanoid } from 'nanoid'
import axios from 'axios'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import * as docx from 'docx'

const formRef = ref()
const previewVisible = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const exporting = ref(false)

const form = ref({
  courseName: '',
  topic: '',
  teacher: '李老师',
  class: '',
  startTime: (() => { 
    const d = new Date(); 
    d.setHours(8, 0, 0, 0); 
    return d; 
  })(),
  endTime: (() => { 
    const d = new Date(); 
    d.setHours(9, 40, 0, 0); 
    return d; 
  })(),
  lessonNumber: 1,
  duration: 2,
  objectives: '',
  keyPoints: '',
  difficultPoints: '',
  procedure: '',
  syllabus: '',
  importTime: 0,
  lectureTime: 0,
  interactionTime: 0,
  practiceTime: 0,
  summaryTime: 0,
  teachingEffect: 3,
  studentFeedback: '',
  teachingReflection: '',
  resources: [] as any[]
})

const rules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  topic: [{ required: true, message: '请输入课程主题', trigger: 'blur' }],
  teacher: [{ required: true, message: '请输入授课教师', trigger: 'blur' }],
  class: [{ required: true, message: '请输入授课班级', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  lessonNumber: [{ required: true, message: '请选择课次', trigger: 'change' }],
  duration: [{ required: true, message: '请选择课时', trigger: 'change' }],
  objectives: [{ required: true, message: '请输入教学目标', trigger: 'blur' }],
  keyPoints: [{ required: true, message: '请输入教学重点', trigger: 'blur' }],
  difficultPoints: [{ required: true, message: '请输入教学难点', trigger: 'blur' }],
  procedure: [{ required: true, message: '请输入教学过程', trigger: 'blur' }]
}

const previewData = computed(() => {
  const {
    courseName, topic, teacher, class: className, startTime, endTime, lessonNumber, duration,
    objectives, keyPoints, difficultPoints, procedure, syllabus, teachingEffect, studentFeedback, teachingReflection
  } = form.value

  // 格式化时间
  const formatTime = (date: Date) => {
    if (!date) return ''
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 格式化教学效果
  const formatTeachingEffect = (effect: number) => {
    const texts = ['很差', '较差', '一般', '较好', '很好']
    return texts[effect - 1] || '未评价'
  }

  // 格式化教学环节
  const formatStages = () => {
    return stages.value.map(stage => ({
      name: stage.name,
      time: stage.time,
      desc: stage.desc
    }))
  }

  // 格式化已使用资源
  const formatResources = () => {
    return usedResources.value.map(resource => ({
      name: resource.name,
      type: getResourceTypeLabel(resource.type),
      description: resource.description
    }))
  }

  return {
    '课程名称': courseName,
    '课程主题': topic,
    '授课教师': teacher,
    '授课班级': className,
    '授课时间': `${formatTime(startTime)} 至 ${formatTime(endTime)}`,
    '课次': `第${lessonNumber}次课`,
    '课时': `${duration}课时（${duration * 45}分钟）`,
    '教学大纲': syllabus,
    '教学目标': objectives,
    '教学重点': keyPoints,
    '教学难点': difficultPoints,
    '教学过程': procedure,
    '教学环节': formatStages(),
    '教学资源': formatResources(),
    '教学效果': formatTeachingEffect(teachingEffect),
    '学生反馈': studentFeedback,
    '教学反思': teachingReflection
  }
})

const syllabusSource = ref('upload')
const selectedHistorySyllabus = ref('')
const historySyllabusList = ref([
  { 
    id: '1', 
    name: '计算机导论教学大纲',
    content: {
      courseName: '计算机导论',
      topic: '计算机系统概述',
      objectives: '1. 了解计算机的基本组成和工作原理\n2. 掌握计算机系统的基本概念\n3. 理解计算机的发展历程',
      keyPoints: '计算机硬件组成、操作系统基本概念、计算机网络基础',
      difficultPoints: '计算机工作原理、数据表示与存储'
    }
  },
  { 
    id: '2', 
    name: '数据结构教学大纲',
    content: {
      courseName: '数据结构',
      topic: '线性表',
      objectives: '1. 掌握线性表的基本概念和操作\n2. 理解顺序表和链表的实现原理\n3. 能够应用线性表解决实际问题',
      keyPoints: '线性表的定义、顺序存储结构、链式存储结构',
      difficultPoints: '链表的操作实现、时间复杂度分析'
    }
  },
  { 
    id: '3', 
    name: '操作系统教学大纲',
    content: {
      courseName: '操作系统',
      topic: '进程管理',
      objectives: '1. 理解进程的概念和状态转换\n2. 掌握进程调度算法\n3. 了解进程同步与通信机制',
      keyPoints: '进程控制块、进程调度、进程同步',
      difficultPoints: '死锁问题、进程通信机制'
    }
  },
  { 
    id: '4', 
    name: '机器学习教学大纲',
    content: {
      courseName: '机器学习',
      topic: '线性回归',
      objectives: '1. 理解线性回归的基本原理和数学推导\n2. 掌握最小二乘估计和梯度下降算法\n3. 能够使用Python实现线性回归模型\n4. 理解正则化在防止过拟合中的作用',
      keyPoints: '线性回归模型、最小二乘估计、梯度下降、正则化',
      difficultPoints: '梯度下降的收敛性分析、多重共线性问题、正则化参数的选择'
    }
  }
])

const isBasicInfoAIGenerated = ref(false)
const isContentAIGenerated = ref(false)
const isReflectionAIGenerated = ref(false)

// 添加评估状态
const analyzing = ref(false)
const totalScore = ref(0)
const analysisItems = ref([
  {
    name: '教学目标',
    score: 0,
    strengths: [],
    weaknesses: [],
    suggestions: []
  },
  {
    name: '教学内容',
    score: 0,
    strengths: [],
    weaknesses: [],
    suggestions: []
  },
  {
    name: '教学步骤',
    score: 0,
    strengths: [],
    weaknesses: [],
    suggestions: []
  },
  {
    name: '教学资源',
    score: 0,
    strengths: [],
    weaknesses: [],
    suggestions: []
  }
])

// 检查是否可以生成评估
const canGenerateAnalysis = computed(() => {
  return form.value.courseName && 
         form.value.topic && 
         form.value.objectives && 
         form.value.keyPoints && 
         form.value.difficultPoints && 
         form.value.procedure
})

// 处理AI评估
const handleAnalyzeReflection = async () => {
  if (!canGenerateAnalysis.value) {
    ElMessage.warning('请先填写基本信息和教学内容')
    return
  }

  analyzing.value = true
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 根据课程类型生成不同的评估结果
    if (form.value.courseName === '机器学习') {
      totalScore.value = 4.3
      analysisItems.value = [
        {
          name: '教学目标',
          score: 4.5,
          strengths: [
            '目标设置明确，涵盖知识、技能和态度三个维度',
            '目标层次分明，从理解到应用再到创新',
            '目标与课程主题紧密相关'
          ],
          weaknesses: [
            '部分目标表述可以更具体',
            '缺少对实践环节的具体要求'
          ],
          suggestions: [
            '增加对模型评估指标的具体要求',
            '补充对代码实现的具体规范'
          ]
        },
        {
          name: '教学内容',
          score: 4.0,
          strengths: [
            '重点难点把握准确',
            '内容组织逻辑清晰',
            '理论与实践结合紧密'
          ],
          weaknesses: [
            '部分数学推导可以更详细',
            '缺少对异常情况的处理说明'
          ],
          suggestions: [
            '补充梯度下降收敛性证明',
            '增加对数据异常处理的讲解'
          ]
        },
        {
          name: '教学步骤',
          score: 4.2,
          strengths: [
            '时间分配合理',
            '环节设计完整',
            '注重学生实践'
          ],
          weaknesses: [
            '案例分析时间可以适当延长',
            '缺少对学习效果的即时反馈'
          ],
          suggestions: [
            '增加课堂小测验环节',
            '添加学生互评环节'
          ]
        },
        {
          name: '教学资源',
          score: 4.3,
          strengths: [
            '资源类型丰富',
            '内容与课程匹配度高',
            '实践性强'
          ],
          weaknesses: [
            '缺少在线练习平台',
            '参考资料可以更丰富'
          ],
          suggestions: [
            '添加在线编程练习平台',
            '补充更多实际案例'
          ]
        }
      ]
    } else if (form.value.courseName === '数据结构') {
      totalScore.value = 4.2
      analysisItems.value = [
        {
          name: '教学目标',
          score: 4.3,
          strengths: [
            '目标设置合理，符合课程要求',
            '注重实践能力的培养',
            '目标可衡量性强'
          ],
          weaknesses: [
            '缺少对算法复杂度的要求',
            '目标可以更具体'
          ],
          suggestions: [
            '增加对时间复杂度分析的要求',
            '补充对代码质量的具体标准'
          ]
        },
        {
          name: '教学内容',
          score: 4.1,
          strengths: [
            '内容组织合理',
            '重点难点突出',
            '理论与实践结合'
          ],
          weaknesses: [
            '缺少对边界情况的处理',
            '部分内容可以更深入'
          ],
          suggestions: [
            '补充异常处理的内容',
            '增加对性能优化的讲解'
          ]
        },
        {
          name: '教学步骤',
          score: 4.0,
          strengths: [
            '环节设计合理',
            '时间分配得当',
            '注重实践操作'
          ],
          weaknesses: [
            '练习时间可以适当延长',
            '缺少互动环节'
          ],
          suggestions: [
            '增加小组讨论环节',
            '添加代码评审环节'
          ]
        },
        {
          name: '教学资源',
          score: 4.4,
          strengths: [
            '资源类型多样',
            '内容实用性强',
            '示例代码完整'
          ],
          weaknesses: [
            '缺少可视化工具',
            '参考资料可以更新'
          ],
          suggestions: [
            '添加数据结构可视化工具',
            '更新最新的参考资料'
          ]
        }
      ]
    } else {
      // 默认评估结果
      totalScore.value = 4.0
      analysisItems.value = [
        {
          name: '教学目标',
          score: 4.0,
          strengths: [
            '目标设置合理',
            '符合课程要求',
            '层次分明'
          ],
          weaknesses: [
            '目标可以更具体',
            '缺少量化指标'
          ],
          suggestions: [
            '增加具体的学习目标',
            '补充可衡量的标准'
          ]
        },
        {
          name: '教学内容',
          score: 4.0,
          strengths: [
            '内容组织合理',
            '重点突出',
            '逻辑清晰'
          ],
          weaknesses: [
            '部分内容可以更深入',
            '缺少实践环节'
          ],
          suggestions: [
            '增加实践内容',
            '补充更多案例'
          ]
        },
        {
          name: '教学步骤',
          score: 4.0,
          strengths: [
            '环节完整',
            '时间分配合理',
            '循序渐进'
          ],
          weaknesses: [
            '互动环节可以增加',
            '缺少反馈机制'
          ],
          suggestions: [
            '增加互动环节',
            '添加即时反馈'
          ]
        },
        {
          name: '教学资源',
          score: 4.0,
          strengths: [
            '资源类型多样',
            '内容实用',
            '易于获取'
          ],
          weaknesses: [
            '资源可以更丰富',
            '缺少在线资源'
          ],
          suggestions: [
            '补充在线学习资源',
            '增加互动性资源'
          ]
        }
      ]
    }

    isReflectionAIGenerated.value = true
    ElMessage.success('评估完成')
  } catch (error) {
    ElMessage.error('评估失败，请重试')
  } finally {
    analyzing.value = false
  }
}

// 监听历史大纲选择变化
watch(selectedHistorySyllabus, (newVal) => {
  if (newVal) {
    const selectedSyllabus = historySyllabusList.value.find(item => item.id === newVal)
    if (selectedSyllabus && selectedSyllabus.content) {
      // 自动填充表单内容
      form.value.courseName = selectedSyllabus.content.courseName
      form.value.topic = selectedSyllabus.content.topic
      form.value.objectives = selectedSyllabus.content.objectives
      form.value.keyPoints = selectedSyllabus.content.keyPoints
      form.value.difficultPoints = selectedSyllabus.content.difficultPoints
      form.value.syllabus = selectedSyllabus.name
      
      // 根据课程类型自动设置课次和课时
      if (selectedSyllabus.content.courseName === '机器学习') {
        form.value.lessonNumber = 4  // 第4次课
        form.value.duration = 2      // 2课时
        // 自动生成教学过程
        form.value.procedure = `1. 【复习旧知】（10分钟）
- 回顾上节课的线性回归基本概念
- 复习最小二乘估计的基本原理
- 检查学生对数学推导的理解程度

2. 【导入】（10分钟）
- 通过房价预测案例引入线性回归的应用场景
- 展示实际数据集，激发学习兴趣
- 引导学生思考如何建立预测模型

3. 【讲授】（45分钟）
- 详细讲解梯度下降算法的原理
  * 损失函数的定义和几何意义
  * 梯度下降的迭代过程
  * 学习率的选择和收敛性分析
- 介绍正则化方法
  * 过拟合问题的产生原因
  * 岭回归和Lasso的原理
  * 正则化参数的选择方法

4. 【案例分析】（20分钟）
- 使用Python实现线性回归模型
- 演示数据预处理和特征工程
- 展示模型训练和评估过程
- 分析不同参数对模型性能的影响

5. 【练习】（20分钟）
- 学生动手实现简单的线性回归模型
- 完成数据可视化和结果分析
- 教师巡视指导，解答疑问

6. 【总结】（10分钟）
- 总结本节课重点内容
- 强调梯度下降和正则化的应用
- 布置课后作业和预习任务`
      } else if (selectedSyllabus.content.courseName === '数据结构') {
        form.value.lessonNumber = 2  // 第2次课
        form.value.duration = 2      // 2课时
        // 自动生成教学过程
        form.value.procedure = `1. 【复习旧知】（10分钟）
- 回顾线性表的基本概念
- 复习顺序存储结构的特点
- 检查学生对基本操作的掌握情况

2. 【导入】（10分钟）
- 通过实际应用场景引入链表的概念
- 分析顺序表的局限性
- 引导学生思考新的存储结构需求

3. 【讲授】（45分钟）
- 详细讲解链表的实现原理
  * 单链表的结构和特点
  * 结点的定义和操作
  * 基本操作的实现方法
- 分析链表与顺序表的比较
  * 存储结构的差异
  * 操作效率的对比
  * 适用场景的选择

4. 【练习】（30分钟）
- 实现链表的基本操作
  * 创建和初始化链表
  * 插入和删除结点
  * 查找和遍历操作
- 完成课后习题
- 教师巡视指导，解答疑问

5. 【总结】（10分钟）
- 总结两种存储结构的特点
- 强调链表操作的关键点
- 布置课后作业和预习任务`
      } else if (selectedSyllabus.content.courseName === '操作系统') {
        form.value.lessonNumber = 3  // 第3次课
        form.value.duration = 2      // 2课时
        // 自动生成教学过程
        form.value.procedure = `1. 【复习旧知】（10分钟）
- 回顾进程的基本概念
- 复习进程状态转换
- 检查学生对进程控制块的理解

2. 【导入】（10分钟）
- 通过实际系统运行场景引入进程调度
- 分析多进程并发执行的问题
- 引导学生思考调度策略的重要性

3. 【讲授】（45分钟）
- 详细讲解进程调度算法
  * 先来先服务（FCFS）
  * 短作业优先（SJF）
  * 时间片轮转（RR）
  * 多级反馈队列（MLFQ）
- 分析各种算法的特点
  * 公平性和效率
  * 响应时间和周转时间
  * 适用场景的选择

4. 【课堂讨论】（20分钟）
- 讨论不同调度算法的适用场景
- 分析算法优缺点
- 探讨实际系统中的调度策略

5. 【练习】（20分钟）
- 模拟进程调度过程
- 计算各种调度指标
- 比较不同算法的性能

6. 【总结】（10分钟）
- 总结各种调度算法的特点
- 强调调度策略的选择原则
- 布置课后作业和预习任务`
      } else {
        form.value.lessonNumber = 1  // 默认第1次课
        form.value.duration = 2      // 默认2课时
        // 生成默认教学过程
        form.value.procedure = `1. 【复习旧知】（10分钟）
- 回顾上节课重点内容
- 检查学生掌握情况
- 解答学生疑问

2. 【导入】（10分钟）
- 引入本节课主题
- 激发学习兴趣
- 明确学习目标

3. 【讲授】（45分钟）
- 讲解核心知识点
- 分析重点难点
- 举例说明应用

4. 【练习】（20分钟）
- 课堂练习
- 互动讨论
- 教师指导

5. 【总结】（10分钟）
- 归纳重点内容
- 布置课后作业
- 预告下节课内容`
      }
      
      // 根据课程类型自动设置教学环节
      if (selectedSyllabus.content.courseName === '机器学习') {
        stages.value = [
          { id: nanoid(), type: 'review', name: '复习旧知', time: 10, desc: '回顾上节课的线性回归基本概念和数学原理' },
          { id: nanoid(), type: 'import', name: '导入', time: 10, desc: '通过实际案例引入线性回归的应用场景' },
          { id: nanoid(), type: 'lecture', name: '讲授', time: 45, desc: '详细讲解最小二乘估计和梯度下降算法' },
          { id: nanoid(), type: 'case', name: '案例分析', time: 20, desc: '分析实际数据集，演示模型训练过程' },
          { id: nanoid(), type: 'practice', name: '练习', time: 20, desc: '学生动手实现简单的线性回归模型' },
          { id: nanoid(), type: 'summary', name: '总结', time: 10, desc: '总结本节课重点，布置课后作业' }
        ]
      } else if (selectedSyllabus.content.courseName === '数据结构') {
        stages.value = [
          { id: nanoid(), type: 'review', name: '复习旧知', time: 10, desc: '回顾线性表的基本概念' },
          { id: nanoid(), type: 'import', name: '导入', time: 10, desc: '引入顺序表和链表的概念' },
          { id: nanoid(), type: 'lecture', name: '讲授', time: 45, desc: '讲解顺序表和链表的实现原理' },
          { id: nanoid(), type: 'practice', name: '练习', time: 30, desc: '实现基本的链表操作' },
          { id: nanoid(), type: 'summary', name: '总结', time: 10, desc: '总结两种存储结构的优缺点' }
        ]
      } else if (selectedSyllabus.content.courseName === '操作系统') {
        stages.value = [
          { id: nanoid(), type: 'review', name: '复习旧知', time: 10, desc: '回顾进程的基本概念' },
          { id: nanoid(), type: 'import', name: '导入', time: 10, desc: '引入进程调度的问题' },
          { id: nanoid(), type: 'lecture', name: '讲授', time: 45, desc: '讲解进程调度算法' },
          { id: nanoid(), type: 'discussion', name: '课堂讨论', time: 20, desc: '讨论不同调度算法的适用场景' },
          { id: nanoid(), type: 'practice', name: '练习', time: 20, desc: '模拟进程调度过程' },
          { id: nanoid(), type: 'summary', name: '总结', time: 10, desc: '总结各种调度算法的特点' }
        ]
      } else {
        stages.value = [
          { id: nanoid(), type: 'review', name: '复习旧知', time: 10, desc: defaultStageDesc('review') },
          { id: nanoid(), type: 'import', name: '导入', time: 10, desc: defaultStageDesc('import') },
          { id: nanoid(), type: 'lecture', name: '讲授', time: 45, desc: defaultStageDesc('lecture') },
          { id: nanoid(), type: 'practice', name: '练习', time: 20, desc: defaultStageDesc('practice') },
          { id: nanoid(), type: 'summary', name: '总结', time: 10, desc: defaultStageDesc('summary') }
        ]
      }

      // 设置AI生成标记
      isBasicInfoAIGenerated.value = true
      isContentAIGenerated.value = true
      
      // 显示成功提示
      ElMessage.success('已根据教学大纲自动填充内容')
    }
  }
})

const handleFileChange = (file: any) => {
  uploadProgress.value = 0
  uploadStatus.value = ''
  selectedHistorySyllabus.value = '' // 清除历史大纲选择
  
  // 模拟上传进度
  const timer = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += 20
    } else {
      clearInterval(timer)
      uploadStatus.value = 'success'
      form.value.syllabus = file.name
      
      // 将上传的资源添加到已使用资源列表
      const fileType = getFileType(file.name)
      usedResources.value.push({
        id: nanoid(),
        name: file.name,
        type: fileType,
        description: `上传的${getResourceTypeLabel(fileType)}资源`,
        tags: ['上传资源'],
        url: URL.createObjectURL(file.raw)
      })
      
      ElMessage.success('上传成功')
    }
  }, 100)
}

// 获取文件类型
const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'pdf': 'doc',
    'doc': 'doc',
    'docx': 'doc',
    'ppt': 'ppt',
    'pptx': 'ppt',
    'mp4': 'video',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image'
  }
  return typeMap[extension || ''] || 'doc'
}

const removeFile = () => {
  form.value.syllabus = ''
  uploadProgress.value = 0
  uploadStatus.value = ''
  selectedHistorySyllabus.value = ''
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
  previewVisible.value = true
}

const handleExport = async () => {
  // 检查必要字段是否填写
  if (!form.value.courseName || !form.value.topic) {
    ElMessage.warning('请先填写课程名称和主题')
    return
  }

  exporting.value = true
  try {
    // 创建Word文档
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          // 标题
          new docx.Paragraph({
            text: `${form.value.courseName}教案`,
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
              new docx.TextRun({ text: '课程主题：', bold: true }),
              new docx.TextRun({ text: form.value.topic }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '授课教师：', bold: true }),
              new docx.TextRun({ text: form.value.teacher }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '授课班级：', bold: true }),
              new docx.TextRun({ text: form.value.class }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '授课日期：', bold: true }),
              new docx.TextRun({ text: form.value.startTime ? form.value.startTime.toLocaleDateString('zh-CN') : '' }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '授课时间：', bold: true }),
              new docx.TextRun({ text: form.value.startTime && form.value.endTime ? 
                `${form.value.startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} - ${form.value.endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '' }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '课次：', bold: true }),
              new docx.TextRun({ text: `第${form.value.lessonNumber}次课` }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '课时：', bold: true }),
              new docx.TextRun({ text: `${form.value.duration}课时（${form.value.duration * 45}分钟）` }),
            ],
          }),

          // 教学目标
          new docx.Paragraph({
            text: '二、教学目标',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          ...(form.value.objectives ? form.value.objectives.split('\n')
            .filter((line: string) => line.trim())
            .map((obj: string) => new docx.Paragraph({
              text: obj,
              bullet: {
                level: 0
              }
            })) : []),

          // 教学重点
          new docx.Paragraph({
            text: '三、教学重点',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          ...(form.value.keyPoints ? form.value.keyPoints.split('\n')
            .filter((line: string) => line.trim())
            .map((point: string) => new docx.Paragraph({
              text: point,
              bullet: {
                level: 0
              }
            })) : []),

          // 教学难点
          new docx.Paragraph({
            text: '四、教学难点',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          ...(form.value.difficultPoints ? form.value.difficultPoints.split('\n')
            .filter((line: string) => line.trim())
            .map((point: string) => new docx.Paragraph({
              text: point,
              bullet: {
                level: 0
              }
            })) : []),

          // 教学环节
          new docx.Paragraph({
            text: '五、教学环节',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          ...stages.value.map(stage => [
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: `【${stage.name}】`, bold: true }),
                new docx.TextRun({ text: `（${stage.time}分钟）` }),
              ],
              spacing: {
                before: 200,
              },
            }),
            new docx.Paragraph({
              text: stage.desc || '暂无描述',
              indent: {
                left: 400,
              },
            }),
          ]).flat(),

          // 教学过程
          new docx.Paragraph({
            text: '六、教学过程',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          ...(form.value.procedure ? form.value.procedure.split('\n')
            .filter((line: string) => line.trim())
            .map((proc: string) => new docx.Paragraph({
              text: proc,
              indent: {
                left: proc.startsWith('-') ? 400 : (proc.startsWith('*') ? 800 : 0),
              },
            })) : []),

          // 教学资源
          new docx.Paragraph({
            text: '七、教学资源',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          ...usedResources.value.map(resource => [
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: `• ${resource.name}`, bold: true }),
                new docx.TextRun({ text: `（${getResourceTypeLabel(resource.type)}）` }),
              ],
            }),
            new docx.Paragraph({
              text: `说明：${resource.description || '暂无描述'}`,
              indent: {
                left: 400,
              },
            }),
          ]).flat(),

          // 教学反思与总结
          new docx.Paragraph({
            text: '八、教学反思与总结',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '教学效果：', bold: true }),
              new docx.TextRun({ text: ['很差', '较差', '一般', '较好', '很好'][form.value.teachingEffect - 1] || '未评价' }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '学生反馈：', bold: true }),
            ],
          }),
          new docx.Paragraph({
            text: form.value.studentFeedback || '暂无反馈',
            indent: {
              left: 400,
            },
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '教学反思：', bold: true }),
            ],
          }),
          new docx.Paragraph({
            text: form.value.teachingReflection || '暂无反思',
            indent: {
              left: 400,
            },
          }),
        ],
      }],
    })

    // 生成文档并下载
    const blob = await docx.Packer.toBlob(doc)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${form.value.courseName}教案.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = {
    courseName: '',
    topic: '',
    teacher: '李老师',
    class: '',
    startTime: (() => { 
      const d = new Date(); 
      d.setHours(8, 0, 0, 0); 
      return d; 
    })(),
    endTime: (() => { 
      const d = new Date(); 
      d.setHours(9, 40, 0, 0); 
      return d; 
    })(),
    lessonNumber: 1,
    duration: 2,
    objectives: '',
    keyPoints: '',
    difficultPoints: '',
    procedure: '',
    syllabus: '',
    importTime: 0,
    lectureTime: 0,
    interactionTime: 0,
    practiceTime: 0,
    summaryTime: 0,
    teachingEffect: 3,
    studentFeedback: '',
    teachingReflection: '',
    resources: []
  }
  uploadProgress.value = 0
  uploadStatus.value = ''
  selectedHistorySyllabus.value = ''
  // 重置时清除AI生成标记
  isBasicInfoAIGenerated.value = false
  isContentAIGenerated.value = false
  isReflectionAIGenerated.value = false
  totalScore.value = 0
  analysisItems.value = analysisItems.value.map(item => ({
    ...item,
    score: 0,
    strengths: [],
    weaknesses: [],
    suggestions: []
  }))
  // 清空资源列表
  usedResources.value = []
  aiResources.value = []
}

const handleTimeChange = () => {
  const totalMinutes = stages.value.reduce((sum, stage) => sum + stage.time, 0)
  const expectedMinutes = form.value.duration * 45
  
  if (totalMinutes !== expectedMinutes) {
    ElMessageBox.confirm(
      `当前总时间(${totalMinutes}分钟)与课时时间(${expectedMinutes}分钟)不匹配，是否自动调整各环节时间？`,
      '时间调整',
      {
        confirmButtonText: '自动调整',
        cancelButtonText: '手动调整',
        type: 'warning'
      }
    ).then(() => {
      autoAllocateTime()
      ElMessage.success('已自动调整时间分配')
    }).catch(() => {
      ElMessage.info('您可以手动调整各环节时间')
    })
  }
}

// 添加课时变化的监听
watch(() => form.value.duration, (newDuration, oldDuration) => {
  if (newDuration > 0 && oldDuration > 0) {
    ElMessageBox.confirm(
      '课时已更改，是否自动调整各环节时间？',
      '时间调整',
      {
        confirmButtonText: '自动调整',
        cancelButtonText: '手动调整',
        type: 'warning'
      }
    ).then(() => {
      autoAllocateTime()
      ElMessage.success('已自动调整时间分配')
    }).catch(() => {
      ElMessage.info('您可以手动调整各环节时间')
    })
  }
})

const handleAutoAllocate = () => {
  const totalMinutes = form.value.duration * 45
  const stageCount = stages.value.length
  
  if (stageCount > 0 && totalMinutes > 0) {  // 添加判断，确保stageCount和totalMinutes大于0
    // 根据环节类型分配时间比例
    stages.value = stages.value.map(stage => {
      let percent = 0
      switch (stage.type) {
        case 'lecture':
          percent = 40
          break
        case 'practice':
        case 'interaction':
          percent = 20
          break
        case 'review':
        case 'import':
        case 'summary':
          percent = 10
          break
        default:
          percent = 10
      }
      
      // 计算实际时间
      const time = Math.round((percent / 100) * totalMinutes)
      return { ...stage, time, percent }
    })
    
    // 调整总时间
    const currentTotal = stages.value.reduce((sum, stage) => sum + (stage.time || 0), 0)
    if (currentTotal !== totalMinutes) {
      const diff = totalMinutes - currentTotal
      // 将剩余时间加到讲授环节
      const lectureStage = stages.value.find(stage => stage.type === 'lecture')
      if (lectureStage) {
        lectureStage.time += diff
        lectureStage.percent = Math.round((lectureStage.time / totalMinutes) * 100)
      }
    }
  }
}

const handlePreviewResource = (file: any) => {
  // 如果是已使用资源列表中的资源
  if (file.url) {
    window.open(file.url, '_blank')
  } else {
    // 如果是上传的文件
    const url = URL.createObjectURL(file.raw)
    window.open(url, '_blank')
  }
}

const handleRemoveResource = (file: any) => {
  // 从已使用资源列表中移除
  const index = usedResources.value.findIndex(r => r.name === file.name)
  if (index > -1) {
    usedResources.value.splice(index, 1)
    ElMessage.success('资源已移除')
  }
}

const beforeRemoveResource = (file: any) => {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`)
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传5个文件')
}

const timeline = computed(() => {
  const totalMinutes = form.value.duration * 45
  return stages.value.map(stage => ({
    id: stage.id,
    name: stage.name,
    time: stage.time,
    color: colorMap[stage.type] || '#BDBDBD',
    percent: Math.round((stage.time / totalMinutes) * 100)
  }))
})

const stageOptions = [
  { label: '复习旧知', value: 'review', desc: '回顾上节课内容，帮助学生温故知新。' },
  { label: '导入', value: 'import', desc: '引入新课题，激发学生兴趣。' },
  { label: '讲授', value: 'lecture', desc: '系统讲解本节课核心知识点。' },
  { label: '案例分析', value: 'case', desc: '通过实际案例加深理解。' },
  { label: '小组合作学习', value: 'group', desc: '学生分组合作，提升协作能力。' },
  { label: '课堂讨论', value: 'discussion', desc: '围绕主题展开讨论，培养思辨能力。' },
  { label: '互动', value: 'interaction', desc: '师生互动，答疑解惑。' },
  { label: '练习', value: 'practice', desc: '通过练习巩固所学知识。' },
  { label: '课堂小测验', value: 'quiz', desc: '检测学生对知识点的掌握情况。' },
  { label: '总结', value: 'summary', desc: '归纳本节课内容，布置课后任务。' }
]

const defaultStageName = (type: string) => {
  const found = stageOptions.find(i => i.value === type)
  return found ? found.label : ''
}

const defaultStageDesc = (type: string) => {
  const found = stageOptions.find(i => i.value === type)
  return found ? found.desc : ''
}

const colorMap: Record<string, string> = {
  review: '#409EFF', // 复习旧知 - 蓝色
  import: '#9C27B0', // 导入 - 紫色
  lecture: '#67C23A', // 讲授 - 绿色
  case: '#E6A23C', // 案例分析 - 橙色
  group: '#F56C6C', // 小组合作学习 - 红色
  discussion: '#795548', // 课堂讨论 - 棕色
  interaction: '#00BCD4', // 互动 - 青色
  practice: '#FF9800', // 练习 - 橙黄色
  quiz: '#8BC34A', // 课堂小测验 - 浅绿色
  summary: '#607D8B', // 总结 - 蓝灰色
  custom: '#BDBDBD' // 自定义 - 灰色
}

const stages = ref([
  { id: nanoid(), type: 'review', name: '复习旧知', time: 10, desc: defaultStageDesc('review') },
  { id: nanoid(), type: 'import', name: '导入', time: 10, desc: defaultStageDesc('import') },
  { id: nanoid(), type: 'lecture', name: '讲授', time: 60, desc: defaultStageDesc('lecture') },
  { id: nanoid(), type: 'practice', name: '练习', time: 30, desc: defaultStageDesc('practice') },
  { id: nanoid(), type: 'summary', name: '总结', time: 10, desc: defaultStageDesc('summary') }
])

const showAddDialog = ref(false)
const addStageType = ref('')
const addStageName = ref('')

const addStage = () => {
  let name = ''
  let desc = ''
  if (addStageType.value === 'custom') {
    name = addStageName.value.trim() || '自定义环节'
    desc = ''
  } else {
    name = defaultStageName(addStageType.value)
    desc = defaultStageDesc(addStageType.value)
  }
  if (!name) return
  
  stages.value.push({
    id: nanoid(),
    type: addStageType.value,
    name,
    time: 0, // 初始时间设为0，后面自动分配
    desc
  })
  
  // 添加后自动重新分配时间
  autoAllocateTime()
  
  showAddDialog.value = false
  addStageType.value = ''
  addStageName.value = ''
  ElMessage.success('已添加新环节')
}

const removeStage = (idx: number) => {
  ElMessageBox.confirm('确定要删除该环节吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    stages.value.splice(idx, 1)
    // 删除后自动重新分配时间
    autoAllocateTime()
    ElMessage.success('已删除该环节')
  }).catch(() => {})
}

const handleStageTypeChange = (stage: any, idx: number) => {
  if (stage.type !== 'custom') {
    stage.name = defaultStageName(stage.type)
    stage.desc = defaultStageDesc(stage.type)
  } else {
    stage.name = ''
    stage.desc = ''
  }
}

const totalTime = computed(() => stages.value.reduce((sum, s) => sum + (s.time || 0), 0))
const isTimeMismatch = computed(() => totalTime.value !== form.value.duration * 45)

const classOptions = [
  '计算机科学与技术2201班',
  '软件工程2202班',
  '数据科学与大数据技术2201班',
  '人工智能2301班'
]

// 打字机效果相关
const typing = ref(false)
const autoContent = {
  objectives: `| 维度 | 具体目标 |
|------|----------|
| **知识目标** | 1. 说出线性回归的模型最小二乘估计思想。<br>2. 理解正规方程与梯度下降两类求解方式及其数值特点。<br>3. 解释欠拟合、过拟合与正则化（岭回归 / Lasso）在回归中的作用。 |
| **技能目标** | 1. 能够独立使用 Python/NumPy 或 scikit-learn 训练一元和多元线性回归模型，并完成模型评估。<br>2. 能对给定数据集选择合适的特征缩放、交叉验证和正则化策略。 |
| **情感与态度目标** | 1. 形成"模型简单性 vs. 表达能力"平衡的工程思维。<br>2. 培养用数据与实验而非直觉作决策的科学态度。 |`,
  keyPoints: `损失函数 → 最优化：均方误差的由来、几何含义与凸优化特性。\n解析解 vs. 数值解：正规方程与梯度下降的条件、效率、数值稳定性比较。\n正则化：λ 的物理意义，岭回归与 L1 正则对参数的不同影响。`,
  difficultPoints: `| 难点 | 化解策略 |
|------|----------|
| **梯度下降的收敛性与学习率选择** | 动画记录 loss 曲线并评价收敛速度。 |
| **多重共线性引发的矩阵不可逆** | 通过可视化列空间、演示正规方程求解失败，再引入岭回归作为解决方案。 |
| **正则化超参数 λ 的调优** | 课堂现场用交叉验证网格搜索，展示"U 形"验证误差曲线，帮助学生直观体会。 |`
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const handleAutoGenerateContent = async () => {
  typing.value = true
  form.value.objectives = ''
  form.value.keyPoints = ''
  form.value.difficultPoints = ''
  form.value.procedure = ''
  
  await sleep(2000)
  // 打字机效果
  for (let i = 0; i < autoContent.objectives.length; i++) {
    form.value.objectives += autoContent.objectives[i]
    await nextTick()
    await sleep(18)
  }
  for (let i = 0; i < autoContent.keyPoints.length; i++) {
    form.value.keyPoints += autoContent.keyPoints[i]
    await nextTick()
    await sleep(18)
  }
  for (let i = 0; i < autoContent.difficultPoints.length; i++) {
    form.value.difficultPoints += autoContent.difficultPoints[i]
    await nextTick()
    await sleep(18)
  }
  // 教学过程自动生成
  let proc = ''
  stages.value.forEach((stage, idx) => {
    proc += `${idx + 1}. 【${stage.name}】（${stage.time}分钟）：${stage.desc || '……'}\n`
  })
  form.value.procedure = ''
  for (let i = 0; i < proc.length; i++) {
    form.value.procedure += proc[i]
    await nextTick()
    await sleep(10)
  }
  typing.value = false
  
  // 在所有内容生成完成后再设置AI生成标记
  if (form.value.objectives && form.value.keyPoints && form.value.difficultPoints && form.value.procedure) {
    isContentAIGenerated.value = true
    ElMessage.success('教学内容已自动生成')
  }
}

// 监听内容是否为空，如果全部为空则移除AI标记
watch([
  () => form.value.objectives,
  () => form.value.keyPoints,
  () => form.value.difficultPoints,
  () => form.value.procedure
], ([objectives, keyPoints, difficultPoints, procedure]) => {
  if (!objectives && !keyPoints && !difficultPoints && !procedure) {
    isContentAIGenerated.value = false
  }
}, { deep: true })

// 禁用日期（只能选择今天及以后的日期）
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 禁用非工作时间（8:00-21:00）
const disabledHours = () => {
  const hours = []
  for (let i = 0; i < 24; i++) {
    if (i < 8 || i > 21) {
      hours.push(i)
    }
  }
  return hours
}

// 禁用非整点时间（只能选择整点或30分）
const disabledMinutes = (hour: number) => {
  const minutes = []
  for (let i = 0; i < 60; i++) {
    if (i % 30 !== 0) {
      minutes.push(i)
    }
  }
  return minutes
}

// 监听时间变化，自动计算课时
watch([() => form.value.startTime, () => form.value.endTime], ([start, end]) => {
  if (start && end) {
    const diff = end.getTime() - start.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    form.value.duration = Math.ceil(minutes / 45) // 每45分钟一节课
  }
})

const draggedIndex = ref(-1)
const draggedOverIndex = ref(-1)

const handleDragStart = (event: DragEvent, index: number) => {
  if (isResizing.value) {
    event.preventDefault()
    return
  }
  draggedIndex.value = index
  event.dataTransfer?.setData('text/plain', index.toString())
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  draggedOverIndex.value = index
}

const handleDrop = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (draggedIndex.value === -1 || draggedOverIndex.value === -1) return
  
  // 交换教学环节顺序
  const stagesCopy = [...stages.value]
  const [draggedStage] = stagesCopy.splice(draggedIndex.value, 1)
  stagesCopy.splice(index, 0, draggedStage)
  stages.value = stagesCopy
  
  // 询问是否要重新分配时间
  ElMessageBox.confirm(
    '是否要重新自动分配各环节时间？',
    '时间调整',
    {
      confirmButtonText: '自动分配',
      cancelButtonText: '保持不变',
      type: 'info'
    }
  ).then(() => {
    autoAllocateTime()
    ElMessage.success('已自动调整时间分配')
  }).catch(() => {})
  
  // 重置拖拽状态
  draggedIndex.value = -1
  draggedOverIndex.value = -1
}

const handleDragEnd = () => {
  draggedIndex.value = -1
  draggedOverIndex.value = -1
}

// 监听教学环节时间变化，更新总时间
watch(stages, (newStages) => {
  const totalMinutes = newStages.reduce((sum, stage) => sum + (stage.time || 0), 0)
  if (totalMinutes > 0) {  // 添加判断，确保totalMinutes大于0
    form.value.duration = Math.ceil(totalMinutes / 45)
  }
}, { deep: true })

const isResizing = ref(false)
const resizeDirection = ref('')
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)
const resizeStageIndex = ref(-1)

const startResize = (event: MouseEvent, index: number, direction: string) => {
  isResizing.value = true
  resizeDirection.value = direction
  resizeStartX.value = event.clientX
  resizeStartWidth.value = stages.value[index].time
  resizeStageIndex.value = index
  
  // 添加全局鼠标事件监听
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return
  
  const timelineBar = document.querySelector('.timeline-bar')
  if (!timelineBar) return
  
  const barWidth = timelineBar.clientWidth
  const deltaX = event.clientX - resizeStartX.value
  const totalMinutes = form.value.duration * 45
  const deltaPercent = (deltaX / barWidth) * 100
  
  if (resizeDirection.value === 'left') {
    // 调整左侧环节的时间
    if (resizeStageIndex.value > 0) {
      const prevStage = stages.value[resizeStageIndex.value - 1]
      const currentStage = stages.value[resizeStageIndex.value]
      
      // 计算最小时间（5分钟）对应的百分比
      const minPercent = (5 / totalMinutes) * 100
      
      // 确保时间不会小于5分钟
      if (currentStage.percent - deltaPercent >= minPercent && prevStage.percent + deltaPercent >= minPercent) {
        currentStage.percent -= deltaPercent
        prevStage.percent += deltaPercent
        
        // 更新实际时间
        currentStage.time = Math.round((currentStage.percent / 100) * totalMinutes)
        prevStage.time = Math.round((prevStage.percent / 100) * totalMinutes)
      }
    }
  } else {
    // 调整右侧环节的时间
    if (resizeStageIndex.value < stages.value.length - 1) {
      const currentStage = stages.value[resizeStageIndex.value]
      const nextStage = stages.value[resizeStageIndex.value + 1]
      
      // 计算最小时间（5分钟）对应的百分比
      const minPercent = (5 / totalMinutes) * 100
      
      // 确保时间不会小于5分钟
      if (currentStage.percent + deltaPercent >= minPercent && nextStage.percent - deltaPercent >= minPercent) {
        currentStage.percent += deltaPercent
        nextStage.percent -= deltaPercent
        
        // 更新实际时间
        currentStage.time = Math.round((currentStage.percent / 100) * totalMinutes)
        nextStage.time = Math.round((nextStage.percent / 100) * totalMinutes)
      }
    }
  }
  
  resizeStartX.value = event.clientX
}

const stopResize = () => {
  isResizing.value = false
  resizeDirection.value = ''
  resizeStartX.value = 0
  resizeStartWidth.value = 0
  resizeStageIndex.value = -1
  
  // 移除全局鼠标事件监听
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 资源来源选择
const resourceSource = ref('upload')
const selectedResourceType = ref('all')
const generating = ref(false)

// AI推荐资源列表
const aiResources = ref([])

// 根据类型过滤资源
const filteredResources = computed(() => {
  if (selectedResourceType.value === 'all') {
    return aiResources.value
  }
  return aiResources.value.filter(resource => resource.type === selectedResourceType.value)
})

// 获取资源图标
const getResourceIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    ppt: Collection,
    doc: Document,
    video: VideoPlay,
    image: Picture
  }
  return iconMap[type] || Document
}

// 获取资源图标颜色
const getResourceIconColor = (type: string) => {
  const colorMap: Record<string, string> = {
    ppt: '#FF9800',
    doc: '#2196F3',
    video: '#F44336',
    image: '#4CAF50'
  }
  return colorMap[type] || '#909399'
}

// 生成AI推荐资源
const handleGenerateResources = async () => {
  generating.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 生成推荐资源
    aiResources.value = [
      {
        id: '1',
        name: '线性回归基础概念PPT',
        type: 'ppt',
        description: '包含线性回归的基本概念、数学原理和实际应用案例',
        tags: ['基础概念', '数学原理', '案例分析'],
        url: 'https://example.com/ppt1'
      },
      {
        id: '2',
        name: '梯度下降算法详解',
        type: 'doc',
        description: '详细讲解梯度下降算法的原理、实现方法和优化技巧',
        tags: ['算法', '优化', '实现'],
        url: 'https://example.com/doc1'
      },
      {
        id: '3',
        name: '线性回归实战案例',
        type: 'video',
        description: '通过实际案例演示线性回归模型的训练和评估过程',
        tags: ['实战', '案例', '演示'],
        url: 'https://example.com/video1'
      },
      {
        id: '4',
        name: '正则化方法图解',
        type: 'image',
        description: '直观展示不同正则化方法对模型参数的影响',
        tags: ['正则化', '可视化', '图解'],
        url: 'https://example.com/image1'
      }
    ]
    
    ElMessage.success('资源生成成功')
  } catch (error) {
    ElMessage.error('资源生成失败')
  } finally {
    generating.value = false
  }
}

// 预览AI推荐资源
const handlePreviewAIResource = (resource: any) => {
  // TODO: 实现资源预览功能
  ElMessage.info(`预览资源：${resource.name}`)
}

// 使用AI推荐资源
const handleUseAIResource = (resource: any) => {
  // 检查是否已经添加过该资源
  const exists = usedResources.value.some(r => r.id === resource.id)
  if (exists) {
    ElMessage.warning('该资源已经添加过了')
    return
  }
  
  // 添加到已使用资源列表
  usedResources.value.push({
    ...resource,
    id: nanoid() // 生成新的ID
  })
  ElMessage.success(`已添加资源：${resource.name}`)
}

// 已使用资源列表
const usedResources = ref([])

// 获取资源类型标签
const getResourceTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    ppt: '课件',
    doc: '文档',
    video: '视频',
    image: '图片'
  }
  return typeMap[type] || '其他'
}

// 获取资源标签类型
const getResourceTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    ppt: 'warning',
    doc: 'info',
    video: 'danger',
    image: 'success'
  }
  return typeMap[type] || ''
}

// 表格行样式
const tableRowClassName = ({ row }: { row: any }) => {
  return 'resource-table-row'
}

// 移除已使用资源
const handleRemoveUsedResource = (resource: any) => {
  const index = usedResources.value.findIndex(r => r.id === resource.id)
  if (index > -1) {
    usedResources.value.splice(index, 1)
    ElMessage.success('资源已移除')
  }
}

// 排序资源
const handleSortResources = () => {
  // TODO: 实现资源排序功能
  ElMessage.info('资源排序功能开发中')
}

// 初始化时设置时间比例
onMounted(() => {
  // 确保初始课时大于0
  if (form.value.duration <= 0) {
    form.value.duration = 2
  }
  handleAutoAllocate()
})

// 处理资源上传变化
const handleResourceChange = (file: any) => {
  if (file.status === 'ready') {
    // 将上传的资源添加到已使用资源列表
    const fileType = getFileType(file.name)
    usedResources.value.push({
      id: nanoid(),
      name: file.name,
      type: fileType,
      description: `上传的${getResourceTypeLabel(fileType)}资源`,
      tags: ['上传资源'],
      url: URL.createObjectURL(file.raw)
    })
    ElMessage.success(`已添加资源：${file.name}`)
  }
}

const handleSyllabusSelect = (selectedSyllabus: any) => {
  if (selectedSyllabus) {
    // 填充基本信息
    form.value.courseName = selectedSyllabus.content.courseName
    form.value.topic = selectedSyllabus.content.topic
    form.value.objectives = selectedSyllabus.content.objectives
    form.value.keyPoints = selectedSyllabus.content.keyPoints
    form.value.difficultPoints = selectedSyllabus.content.difficultPoints
    
    // 根据课程类型提供默认的教学环节建议
    let suggestedStages = []
    if (selectedSyllabus.content.courseName === '机器学习') {
      suggestedStages = [
        { id: nanoid(), type: 'review', name: '复习旧知', time: 10, desc: '回顾上节课的线性回归基本概念和数学原理' },
        { id: nanoid(), type: 'import', name: '导入', time: 10, desc: '通过实际案例引入线性回归的应用场景' },
        { id: nanoid(), type: 'lecture', name: '讲授', time: 45, desc: '详细讲解最小二乘估计和梯度下降算法' },
        { id: nanoid(), type: 'case', name: '案例分析', time: 20, desc: '分析实际数据集，演示模型训练过程' },
        { id: nanoid(), type: 'practice', name: '练习', time: 20, desc: '学生动手实现简单的线性回归模型' },
        { id: nanoid(), type: 'summary', name: '总结', time: 10, desc: '总结本节课重点，布置课后作业' }
      ]
    } else if (selectedSyllabus.content.courseName === '数据结构') {
      suggestedStages = [
        { id: nanoid(), type: 'review', name: '复习旧知', time: 10, desc: '回顾线性表的基本概念' },
        { id: nanoid(), type: 'import', name: '导入', time: 10, desc: '引入顺序表和链表的概念' },
        { id: nanoid(), type: 'lecture', name: '讲授', time: 45, desc: '讲解顺序表和链表的实现原理' },
        { id: nanoid(), type: 'practice', name: '练习', time: 30, desc: '实现基本的链表操作' },
        { id: nanoid(), type: 'summary', name: '总结', time: 10, desc: '总结两种存储结构的优缺点' }
      ]
    } else {
      // 默认建议
      suggestedStages = [
        { id: nanoid(), type: 'review', name: '复习旧知', time: 10, desc: defaultStageDesc('review') },
        { id: nanoid(), type: 'import', name: '导入', time: 10, desc: defaultStageDesc('import') },
        { id: nanoid(), type: 'lecture', name: '讲授', time: 45, desc: defaultStageDesc('lecture') },
        { id: nanoid(), type: 'practice', name: '练习', time: 20, desc: defaultStageDesc('practice') },
        { id: nanoid(), type: 'summary', name: '总结', time: 10, desc: defaultStageDesc('summary') }
      ]
    }

    // 显示建议对话框
    ElMessageBox.confirm(
      '系统已根据课程内容生成教学环节建议，是否采用？',
      '教学环节建议',
      {
        confirmButtonText: '采用建议',
        cancelButtonText: '自定义设置',
        type: 'info'
      }
    ).then(() => {
      // 用户选择采用建议
      stages.value = suggestedStages
      ElMessage.success('已采用建议的教学环节设置')
    }).catch(() => {
      // 用户选择自定义设置
      stages.value = [
        { id: nanoid(), type: 'custom', name: '自定义环节', time: 10, desc: '' }
      ]
      ElMessage.info('您可以自由设置教学环节')
    })
    
    // 设置AI生成标记
    isBasicInfoAIGenerated.value = true
    isContentAIGenerated.value = true
    
    // 显示成功提示
    ElMessage.success('已根据教学大纲自动填充基本信息')
  }
}

// 修改自动分配时间函数
const autoAllocateTime = () => {
  const totalMinutes = form.value.duration * 45
  if (stages.value.length === 0) return
  
  // 定义各类型环节的默认时间权重
  const weightMap = {
    'review': 1,    // 复习
    'import': 1,    // 导入
    'lecture': 4,   // 讲授
    'case': 2,      // 案例分析
    'practice': 2,  // 练习
    'discussion': 2,// 讨论
    'quiz': 1,      // 测验
    'summary': 1,   // 总结
    'custom': 1     // 自定义
  }
  
  // 计算总权重
  let totalWeight = stages.value.reduce((sum, stage) => {
    return sum + (weightMap[stage.type] || 1)
  }, 0)
  
  // 按权重分配时间
  let remainingTime = totalMinutes
  let lastStageIndex = stages.value.length - 1
  
  stages.value.forEach((stage, index) => {
    if (index === lastStageIndex) {
      // 最后一个环节分配剩余的所有时间，避免舍入误差
      stage.time = remainingTime
    } else {
      const weight = weightMap[stage.type] || 1
      const allocatedTime = Math.round((weight / totalWeight) * totalMinutes)
      stage.time = Math.max(5, allocatedTime) // 确保每个环节至少5分钟
      remainingTime -= stage.time
    }
  })
  
  // 如果最后一个环节时间太短，从其他环节借时间
  if (stages.value[lastStageIndex].time < 5) {
    let timeNeeded = 5 - stages.value[lastStageIndex].time
    for (let i = 0; i < lastStageIndex && timeNeeded > 0; i++) {
      if (stages.value[i].time > 5) {
        let canReduce = Math.min(timeNeeded, stages.value[i].time - 5)
        stages.value[i].time -= canReduce
        stages.value[lastStageIndex].time += canReduce
        timeNeeded -= canReduce
      }
    }
  }
  
  // 更新时间百分比
  updateTimePercentages()
}

// 添加更新时间百分比的函数
const updateTimePercentages = () => {
  const totalMinutes = form.value.duration * 45
  stages.value.forEach(stage => {
    stage.percent = (stage.time / totalMinutes) * 100
  })
}

const getStageColor = (type: string) => {
  const colorMap: Record<string, string> = {
    review: '#409EFF', // 复习旧知 - 蓝色
    import: '#9C27B0', // 导入 - 紫色
    lecture: '#67C23A', // 讲授 - 绿色
    case: '#E6A23C', // 案例分析 - 橙色
    group: '#F56C6C', // 小组合作学习 - 红色
    discussion: '#795548', // 课堂讨论 - 棕色
    interaction: '#00BCD4', // 互动 - 青色
    practice: '#FF9800', // 练习 - 橙黄色
    quiz: '#8BC34A', // 课堂小测验 - 浅绿色
    summary: '#607D8B', // 总结 - 蓝灰色
    custom: '#BDBDBD' // 自定义 - 灰色
  }
  return colorMap[type] || '#BDBDBD'
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

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.syllabus-source {
  margin-bottom: 16px;
}

.upload-section,
.history-section {
  width: 100%;
}

.upload-progress {
  margin-top: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.number-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.number {
  min-width: 40px;
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding: 20px 0;
}

.button-group .el-button {
  min-width: 100px;
}

.preview-content {
  padding: 20px;
  line-height: 1.6;
}

.preview-content h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #303133;
}

.preview-content h3 {
  margin: 20px 0 12px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 8px;
}

.preview-content p {
  margin: 8px 0;
  color: #606266;
  white-space: pre-wrap;
}

.preview-list {
  margin: 8px 0;
}

.preview-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.stage-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stage-name {
  font-weight: 500;
  color: #303133;
}

.stage-time {
  color: #409EFF;
  font-size: 14px;
}

.stage-desc {
  color: #606266;
  margin: 0;
}

.resource-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.resource-name {
  font-weight: 500;
  color: #303133;
}

.resource-desc {
  color: #606266;
  margin: 0;
  font-size: 14px;
}

.time-unit {
  margin-left: 8px;
  color: #909399;
}

.total-time {
  font-weight: bold;
  color: #409EFF;
}

.time-warning {
  margin-left: 8px;
  color: #E6A23C;
}

.el-rate {
  margin-top: 8px;
}

.timeline-bar {
  display: flex;
  height: 48px;
  margin: 24px 0 12px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px #0001;
  background: #f7f8fa;
  width: 100%;
  min-width: 600px;
  max-width: 100%;
}
.timeline-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  transition: width 0.3s;
  white-space: nowrap;
  border-right: 2px solid #fff;
  cursor: move;
  user-select: none;
}
.timeline-segment:last-child {
  border-right: none;
}
.resize-handle {
  position: absolute;
  width: 4px;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  cursor: ew-resize;
  transition: background-color 0.2s;
}
.resize-handle:hover {
  background: rgba(255, 255, 255, 0.6);
}
.resize-handle.left {
  left: 0;
}
.resize-handle.right {
  right: 0;
}
.timeline-segment.dragging {
  opacity: 0.5;
}
.timeline-segment.drag-over {
  border: 2px dashed #fff;
}
.timeline-label {
  width: 100%;
  text-align: center;
  padding: 0 8px;
  text-shadow: 0 1px 2px #0002;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.stages-list {
  display: flex;
  flex-direction: row;
  gap: 18px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.stage-card {
  border-radius: 8px;
  box-shadow: 0 1px 4px #0001;
  padding: 16px 18px 12px 18px;
  min-width: 220px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  position: relative;
}
.stage-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.stage-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stage-time {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.total-time-info {
  margin-top: 8px;
  font-size: 15px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-tag {
  margin-left: 8px;
}

.time-range-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-separator {
  color: #909399;
  font-size: 14px;
}

.ai-resources {
  padding: 16px 0;
}

.resource-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.resource-card {
  transition: all 0.3s;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-info {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.resource-details {
  flex: 1;
}

.resource-details h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.resource-details p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.resource-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
}

.empty-resources {
  padding: 40px 0;
}

.used-resources {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  color: #606266;
  font-weight: normal;
}

.resource-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

:deep(.resource-table-row) {
  transition: background-color 0.3s;
}

:deep(.resource-table-row:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  font-size: 14px;
}

:deep(.el-table--small) {
  font-size: 14px;
}

:deep(.el-table--small .el-table__cell) {
  padding: 4px 0;
}

:deep(.el-empty__description) {
  font-size: 14px;
  color: #909399;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-tag {
  font-weight: normal;
}

.analysis-section {
  padding: 20px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.analysis-header h3 {
  margin: 0;
  color: #303133;
}

.total-score {
  font-size: 16px;
  color: #606266;
}

.total-score .score {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.analysis-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.analysis-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-details h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.analysis-details ul {
  margin: 0;
  padding-left: 20px;
}

.analysis-details li {
  margin-bottom: 4px;
  color: #606266;
  line-height: 1.5;
}

.strengths h4 {
  color: #67C23A;
}

.weaknesses h4 {
  color: #E6A23C;
}

.suggestions h4 {
  color: #409EFF;
}

.empty-analysis {
  padding: 40px 0;
}

.time-info {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

.time-bar {
  height: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  margin: 8px 0;
  overflow: hidden;
}

.time-segment {
  height: 100%;
  float: left;
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
}

.time-segment:hover {
  filter: brightness(0.9);
}

.time-segment:hover::after {
  content: attr(data-time);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  margin-bottom: 4px;
}
</style> 