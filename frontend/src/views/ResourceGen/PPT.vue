<template>
  <div class="pptgen-container">
    <h2>PPT生成</h2>

    <!-- 教案选择卡片 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教案选择</span>
          <el-button type="primary" size="small" @click="handleSearchLessonPlans">
            <el-icon><Search /></el-icon>
            浏览教案
          </el-button>
        </div>
      </template>
      <div class="lesson-plan-selection">
        <el-radio-group v-model="lessonPlanSource" size="small" class="source-selector">
          <el-radio-button label="history">历史教案</el-radio-button>
          <el-radio-button label="upload">上传教案</el-radio-button>
        </el-radio-group>

        <!-- 历史教案选择 -->
        <div v-if="lessonPlanSource === 'history'" class="history-section">
          <el-select
            v-model="selectedHistoryPlan"
            placeholder="选择历史教案"
            filterable
            class="wide-select"
            @change="handleHistoryPlanChange"
          >
            <el-option
              v-for="item in historyPlans"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <div class="history-option">
                <div class="name-tag-group">
                  <span>{{ item.name }}</span>
                  <el-tag size="small" :type="getRecordTypeTag(item.type)" class="type-tag">{{ item.type }}</el-tag>
                </div>
                <span class="option-time">{{ formatDate(item.time) }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 上传教案 -->
        <div v-else class="upload-section">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleFileChange"
            accept=".pdf,.doc,.docx"
          >
            <el-button type="primary">选择教案文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持PDF、Word等格式</div>
            </template>
          </el-upload>
        </div>
      </div>
    </el-card>

    <!-- PPT章节编辑卡片 -->
    <el-card v-if="selectedHistoryPlan" class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span>PPT章节编辑</span>
            <span v-if="isAIGenerated" class="ai-tag">
              <span class="ai-dot"></span>
              AI自动生成
            </span>
          </div>
          <div class="header-buttons">
            <el-button 
              type="primary"
              size="small" 
              @click="handleBatchGenerateGraphics" 
              :loading="batchGeneratingGraphics"
            >
              <el-icon><Picture /></el-icon>
              一键生成资源
            </el-button>
          </div>
        </div>
      </template>
      <div class="chapters-container">
        <el-collapse v-model="activeChapters">
          <el-collapse-item 
            v-for="(chapter, index) in pptChapters" 
            :key="index"
            :name="index"
          >
            <template #title>
              <div class="chapter-header">
                <span class="chapter-title">第{{ index + 1 }}章：{{ chapter.title }}</span>
                <el-tag class="chapter-duration-tag" type="info" effect="light">
                  <el-icon class="chapter-duration-icon"><Clock /></el-icon>
                  <span class="chapter-duration-num">{{ chapter.duration }}</span>
                  <span class="chapter-duration-unit">分钟</span>
                </el-tag>
              </div>
            </template>
            <template #extra>
              <el-button 
                type="primary" 
                link 
                @click.stop="handleGenerateGraphic(chapter)"
              >
                <el-icon><Picture /></el-icon>
                生成资源
              </el-button>
            </template>
            <div class="chapter-content">
              <el-form :model="chapter" label-width="100px">
                <el-form-item label="章节标题">
                  <el-input v-model="chapter.title" placeholder="请输入章节标题" />
                </el-form-item>
                <el-form-item label="章节内容">
                  <el-input
                    v-model="chapter.content"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入章节内容"
                  />
                </el-form-item>
                <el-form-item label="资源">
                  <div v-if="chapter.graphic && chapter.graphicType.length > 0" class="graphic-preview">
                    <el-tag
                      v-for="tagType in chapter.graphicType"
                      :key="tagType"
                      :type="tagType.startsWith('视频') ? 'warning' : 'success'"
                      effect="light"
                      style="margin-right: 5px; display: inline-flex; align-items: center;"
                      closable
                      @close="removeGraphic(chapter, tagType)"
                    >
                      <el-icon style="margin-right: 3px;">
                        <VideoPlay v-if="tagType.startsWith('视频')" />
                        <Picture v-else />
                      </el-icon>
                      {{ tagType }}
                    </el-tag>
                  </div>
                  <div v-else class="graphic-actions">
                    <el-button type="primary" @click="handleGenerateGraphic(chapter)">
                      <el-icon><Picture /></el-icon>
                      生成资源
                    </el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>

    <!-- PPT基本信息卡片 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span>PPT基本信息</span>
            <span v-if="isBasicInfoAIGenerated" class="ai-tag">
              <span class="ai-dot"></span>
              AI自动填充
            </span>
          </div>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="PPT主题" prop="title">
          <el-input v-model="form.title" placeholder="请输入PPT主题" />
        </el-form-item>
        <el-form-item label="章节/用途" prop="usage">
          <el-input v-model="form.usage" placeholder="如第3章、课程汇报、答辩等" />
        </el-form-item>
        <el-form-item label="教学大纲" prop="syllabus">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'syllabus')"
            accept=".pdf,.doc,.docx"
          >
            <el-button size="small" type="primary">上传文件</el-button>
          </el-upload>
          <el-input
            v-model="form.syllabusText"
            type="textarea"
            :rows="3"
            placeholder="或直接粘贴教学大纲文本"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="参考教材" prop="reference">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'reference')"
            accept=".pdf,.doc,.docx"
          >
            <el-button size="small" type="primary">上传文件</el-button>
          </el-upload>
          <el-input
            v-model="form.referenceText"
            type="textarea"
            :rows="2"
            placeholder="可选，输入参考教材信息"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可填写PPT生成的特殊要求、风格等" />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" :loading="exporting" @click="handleExport">
        {{ exporting ? '导出中...' : '导出' }}
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="PPT生成预览" width="60%" destroy-on-close>
      <div class="preview-content">
        <h2>{{ form.title || 'PPT预览' }}</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="PPT主题">{{ form.title }}</el-descriptions-item>
          <el-descriptions-item label="章节/用途">{{ form.usage }}</el-descriptions-item>
          <el-descriptions-item label="教学大纲">
            <span v-if="form.syllabusFile.length">已上传文件</span>
            <pre v-else class="desc-pre">{{ form.syllabusText }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="参考教材">
            <span v-if="form.referenceFile.length">已上传文件</span>
            <pre v-else class="desc-pre">{{ form.referenceText }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ form.remark }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 章节预览 -->
        <div class="chapters-preview">
          <h3>章节内容</h3>
          <div v-for="(chapter, index) in pptChapters" :key="index" class="chapter-preview-item">
            <h4>第{{ index + 1 }}章：{{ chapter.title }}</h4>
            <p>{{ chapter.content }}</p>
            <img v-if="chapter.graphic" :src="chapter.graphic" alt="资源" class="chapter-graphic" />
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 资源生成对话框 -->
    <el-dialog v-model="graphicDialogVisible" title="资源生成" width="70%" destroy-on-close>
      <GraphicGenerator
        v-if="graphicDialogVisible"  
        :chapter="currentChapter" 
        mode="dialog" 
        @generate="handleGraphicGenerated" 
        @cancel="graphicDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, MagicStick, Picture, Delete, Clock, VideoPlay } from '@element-plus/icons-vue'
import axios from 'axios'
import GraphicGenerator from './Graphic.vue'

const formRef = ref()
const previewVisible = ref(false)
const exporting = ref(false)
const form = ref({
  title: '',
  usage: '',
  syllabusFile: [],
  syllabusText: '',
  referenceFile: [],
  referenceText: '',
  remark: ''
})
const rules = {
  title: [{ required: true, message: '请输入PPT主题', trigger: 'blur' }],
  usage: [{ required: true, message: '请输入章节/用途', trigger: 'blur' }],
  syllabus: [
    { validator: (rule, value, callback) => {
      if (!form.value.syllabusFile.length && !form.value.syllabusText) {
        callback(new Error('请上传教学大纲文件或输入文本'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 教案选择相关
const lessonPlanSource = ref<'history' | 'upload'>('history')
const selectedHistoryPlan = ref('')
const lessonPlanDialogVisible = ref(false)
const historyPlans = ref([
  {
    id: '1',
    name: '机器学习线性回归教案',
    type: '教案',
    time: '2025-05-10 15:32:10',
    content: {
      title: '机器学习线性回归',
      usage: '第4章',
      syllabus: '机器学习课程教学大纲',
      stages: [
        {
          name: '复习旧知',
          time: 10,
          content: '回顾上节课的线性回归基本概念和最小二乘估计原理'
        },
        {
          name: '导入新课',
          time: 15,
          content: '通过房价预测案例引入线性回归的应用场景'
        },
        {
          name: '讲解新知',
          time: 45,
          content: '详细讲解梯度下降算法原理和实现'
        },
        {
          name: '案例分析',
          time: 20,
          content: '通过实际数据集演示线性回归模型的训练过程'
        },
        {
          name: '总结提升',
          time: 10,
          content: '总结本节课重点，布置课后作业'
        }
      ],
      reference: '《机器学习实战》',
      remark: '重点讲解梯度下降算法'
    }
  }
])

// PPT章节相关
const activeChapters = ref([0])
const pptChapters = ref([])
const graphicDialogVisible = ref(false)
const currentChapter = ref(null)
const isAIGenerated = ref(false)
const isTyping = ref(false)
const batchGeneratingGraphics = ref(false)

// 新增：标记基本信息是否 AI 填充
const isBasicInfoAIGenerated = ref(false)

// 根据记录类型获取标签类型
const getRecordTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '教案': 'success',
    'PPT': 'warning',
    '习题': 'danger',
    '教学大纲': 'info',
    '资源': 'primary'
  }
  return typeMap[type] || ''
}

// 格式化日期显示
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 打开教案浏览对话框
const handleSearchLessonPlans = () => {
  lessonPlanDialogVisible.value = true
}

// 选择历史教案
const handleHistoryPlanChange = (planId: string) => {
  const plan = historyPlans.value.find(p => p.id === planId)
  if (plan && plan.content) {
    // 模拟 AI 填充基本信息
    form.value.title = `${plan.content.title} (PPT)`
    form.value.usage = plan.content.usage
    form.value.syllabusText = `根据教案 "${plan.name}" 生成的教学大纲要点：\n${plan.content.syllabus || '(无具体文本，请参考源文件)'}`
    form.value.referenceText = plan.content.reference || '无'
    form.value.remark = `AI 生成备注：基于教案 "${plan.name}" 的内容，${plan.content.remark || '无特殊备注'}`
    form.value.syllabusFile = []
    form.value.referenceFile = []

    // 标记为 AI 填充
    isBasicInfoAIGenerated.value = true

    // 根据教案环节生成PPT章节
    generateChaptersFromStages(plan.content.stages)
    isAIGenerated.value = false

    ElMessage.success('已根据所选教案自动填充PPT基本信息和章节')
  } else {
    // 如果找不到计划或内容，重置表单和标记
    handleReset()
  }
}

// 根据教案环节生成PPT章节
const generateChaptersFromStages = (stages) => {
  pptChapters.value = stages.map(stage => ({
    title: stage.name,
    content: stage.content,
    duration: stage.time,
    graphic: null,
    graphicType: [],
    graphicRequirements: {
      type: '',
      style: '',
      subject: '',
      knowledge: '',
      custom: ''
    }
  }))
}

// 一键生成章节
const handleAutoGenerateChapters = async () => {
  typing.value = true
  try {
    for (const chapter of pptChapters.value) {
      // 根据章节名称生成更详细的内容
      const name = chapter.title.toLowerCase()
      let customContent = ''
      
      if (name.includes('复习') || name.includes('回顾')) {
        customContent = `1. 回顾上节课重点内容
2. 检查学生掌握情况
3. 解答学生疑问
4. 为新课做铺垫`
      } else if (name.includes('导入') || name.includes('引入')) {
        customContent = `1. 通过案例引入新课
2. 激发学生学习兴趣
3. 明确本节课学习目标
4. 建立新旧知识联系`
      } else if (name.includes('讲解') || name.includes('讲授')) {
        customContent = `1. 详细讲解核心概念
2. 通过实例加深理解
3. 重点难点突破
4. 课堂互动问答`
      } else if (name.includes('互动') || name.includes('讨论')) {
        customContent = `1. 组织课堂讨论
2. 小组合作探究
3. 展示交流成果
4. 教师点评总结`
      } else if (name.includes('总结') || name.includes('提升')) {
        customContent = `1. 总结本节课重点
2. 梳理知识体系
3. 布置课后作业
4. 预告下节课内容`
      } else {
        customContent = `1. 明确学习目标
2. 讲解核心内容
3. 课堂互动练习
4. 总结提升`
      }

      chapter.content = customContent
      await sleep(100)
    }

    isAIGenerated.value = true
    ElMessage.success('AI已成功生成所有章节内容')
  } catch (error) {
    ElMessage.error('章节生成失败')
  } finally {
    typing.value = false
  }
}

// 新增：一键生成所有章节资源 (Updated Logic)
const handleBatchGenerateGraphics = async () => {
  if (!pptChapters.value || pptChapters.value.length === 0) {
    ElMessage.warning('请先选择或生成章节')
    return
  }
  
  batchGeneratingGraphics.value = true
  
  // Simplified preset logic based on chapter titles for simulation
  const getPresetResourceInfo = (title: string): { resourceType: string; types: string[]; duration?: number } => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('复习') || lowerTitle.includes('总结')) {
      return { resourceType: 'image', types: ['思维导图', '概念图'] }
    } else if (lowerTitle.includes('导入') || lowerTitle.includes('引入')) {
      return { resourceType: 'video', types: ['动画科普', '快速剪辑'], duration: 45 }
    } else if (lowerTitle.includes('讲解新知') || lowerTitle.includes('梯度下降')) {
      return { resourceType: 'video', types: ['教学演示', '动画科普'], duration: 90 }
    } else if (lowerTitle.includes('讲解') || lowerTitle.includes('讲授')) {
      return { resourceType: 'image', types: ['概念图', '流程图'] }
    } else if (lowerTitle.includes('案例分析')) {
      return { resourceType: 'image', types: ['数据图表', '示意图'] }
    } else if (lowerTitle.includes('练习')) {
      return { resourceType: 'image', types: ['示意图'] }
    } else if (lowerTitle.includes('互动') || lowerTitle.includes('讨论')) {
      return { resourceType: 'video', types: ['教学演示(模拟)'], duration: 60 }
    } else {
      return { resourceType: 'image', types: ['示意图'] } // Default
    }
  }

  try {
    for (const chapter of pptChapters.value) {
      const resourceInfo = getPresetResourceInfo(chapter.title)
      let graphicUrl = ''
      let descriptiveTags: string[] = []

      if (resourceInfo.resourceType === 'video') {
        graphicUrl = `https://via.placeholder.com/150x100/000000/FFFFFF/?text=Video:${encodeURIComponent(chapter.title)}`
        descriptiveTags = resourceInfo.types.map(t => `视频-${t}${resourceInfo.duration ? ` (${resourceInfo.duration}s)` : ''}`)
      } else {
        graphicUrl = `https://via.placeholder.com/150x100.png?text=Image:${encodeURIComponent(chapter.title)}`
        descriptiveTags = resourceInfo.types.map(t => `图片-${t}`)
      }
      
      chapter.graphic = graphicUrl
      chapter.graphicType = descriptiveTags
      
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    
    isAIGenerated.value = true
    ElMessage.success('所有章节资源已生成')
  } catch (error) {
    console.error("批量生成资源失败:", error)
    ElMessage.error('批量生成资源失败')
  } finally {
    batchGeneratingGraphics.value = false
  }
}

// AI填充资源需求
const handleAutoFillGraphic = async (chapter) => {
  if (!currentChapter.value) return
  
  isTyping.value = true
  const name = currentChapter.value.title.toLowerCase()
  const content = currentChapter.value.content.toLowerCase()
  
  // 根据章节名称和内容自动填充资源需求
  let requirements = {}
  
  if (name.includes('复习') || name.includes('回顾') || content.includes('回顾')) {
    requirements = {
      type: '思维导图',
      style: '简约',
      subject: form.value.title,
      knowledge: '知识回顾',
      custom: '清晰展示上节课重点内容，便于学生快速回顾'
    }
  } else if (name.includes('导入') || name.includes('引入') || content.includes('引入')) {
    requirements = {
      type: '示意图',
      style: '科技',
      subject: form.value.title,
      knowledge: '新课导入',
      custom: '生动有趣的场景，激发学生学习兴趣'
    }
  } else if (name.includes('讲解') || name.includes('讲授') || content.includes('讲解')) {
    requirements = {
      type: '概念图',
      style: '写实',
      subject: form.value.title,
      knowledge: '核心概念',
      custom: '清晰展示知识点之间的逻辑关系'
    }
  } else if (name.includes('互动') || name.includes('讨论') || content.includes('互动')) {
    requirements = {
      type: '流程图',
      style: '卡通',
      subject: form.value.title,
      knowledge: '互动环节',
      custom: '展示互动流程，便于学生理解活动规则'
    }
  } else if (name.includes('总结') || name.includes('提升') || content.includes('总结')) {
    requirements = {
      type: '思维导图',
      style: '简约',
      subject: form.value.title,
      knowledge: '知识总结',
      custom: '系统梳理本节课重点内容'
    }
  } else {
    // 根据内容关键词智能判断
    if (content.includes('概念') || content.includes('定义')) {
      requirements = {
        type: '概念图',
        style: '简约',
        subject: form.value.title,
        knowledge: '概念解析',
        custom: '清晰展示概念定义和关系'
      }
    } else if (content.includes('步骤') || content.includes('流程')) {
      requirements = {
        type: '流程图',
        style: '科技',
        subject: form.value.title,
        knowledge: '操作流程',
        custom: '展示操作步骤和流程'
      }
    } else if (content.includes('比较') || content.includes('对比')) {
      requirements = {
        type: '对比图',
        style: '简约',
        subject: form.value.title,
        knowledge: '对比分析',
        custom: '清晰展示对比内容'
      }
    } else {
      requirements = {
        type: '示意图',
        style: '写实',
        subject: form.value.title,
        knowledge: currentChapter.value.title,
        custom: '生动展示章节内容'
      }
    }
  }

  // 模拟打字效果填充内容
  for (const [key, value] of Object.entries(requirements)) {
    currentChapter.value.graphicRequirements[key] = ''
    for (const char of value.toString()) {
      currentChapter.value.graphicRequirements[key] += char
      await sleep(10)
    }
  }

  currentChapter.value.isAIGenerated = true
  isTyping.value = false
  ElMessage.success('AI已填充资源需求')
}

// 生成资源
const handleGenerateGraphic = (chapter) => {
  currentChapter.value = {
    ...chapter,
    isAIGenerated: false,
    subject: form.value.title,
    planTitle: form.value.title,
  }
  graphicDialogVisible.value = true
}

// 处理资源生成结果 (Ensure it handles potentially richer types if needed later)
const handleGraphicGenerated = (generatedData: { resourceType: string, url: string, details: any }) => {
  if (currentChapter.value) {
    const chapter = pptChapters.value.find(c => c.title === currentChapter.value.title)
    if (chapter) {
      chapter.graphic = generatedData.url
      // Simple assignment for now, assuming details structure matches or is adapted
      let types = []
      if (generatedData.resourceType === 'image') {
        types = (generatedData.details?.imageTypes || ['示意图']).map(t => `图片-${t}`)
      } else if (generatedData.resourceType === 'video') {
        types = (generatedData.details?.videoStyle || ['教学演示']).map(t => 
          `视频-${t}${generatedData.details?.duration ? ` (${generatedData.details.duration}s)` : ''}`)
      }
      chapter.graphicType = types
      // chapter.isAIGenerated = currentChapter.value.isAIGenerated; // Keep track if needed
      graphicDialogVisible.value = false
      ElMessage.success('资源生成成功')
    }
  }
}

// 删除资源或资源类型标签 (No change needed if graphicType remains string array)
const removeGraphic = (chapter, tagTypeToRemove) => {
  const index = chapter.graphicType.indexOf(tagTypeToRemove)
  if (index > -1) {
    chapter.graphicType.splice(index, 1)
  }
  
  if (chapter.graphicType.length === 0) {
    chapter.graphic = null
    ElMessage.success('资源已删除')
  } else {
    ElMessage.success(`标签 "${tagTypeToRemove}" 已删除`)
  }
}

// 处理上传教案文件
const handleFileChange = (file: any, type: string) => {
  if (file && file.raw) {
    if (type === 'syllabus') {
      form.value.syllabusFile = [file.raw]
      form.value.syllabusText = ''
      isBasicInfoAIGenerated.value = false
    } else if (type === 'reference') {
      form.value.referenceFile = [file.raw]
      form.value.referenceText = ''
      isBasicInfoAIGenerated.value = false
    } else {
      // Handle lesson plan upload
      ElMessage.success('教案文件 ' + file.name + ' 已选择，待处理...')
      // TODO: Logic for handling lesson plan file upload
    }
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error('请填写完整信息')
  }
}
const handlePreview = () => {
  previewVisible.value = true
}
const handleExport = async () => {
  exporting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2秒延迟
    const response = await axios.get('/api/export/ppt', {
      responseType: 'blob'
    })
    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '机器学习线性回归PPT.pptx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = {
    title: '',
    usage: '',
    syllabusFile: [],
    syllabusText: '',
    referenceFile: [],
    referenceText: '',
    remark: ''
  }
  selectedHistoryPlan.value = ''
  pptChapters.value = []
  isAIGenerated.value = false
  isBasicInfoAIGenerated.value = false
}
</script>

<style scoped>
.pptgen-container {
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
.lesson-plan-selection {
  padding: 10px 0;
}
.source-selector {
  margin-bottom: 16px;
}
.history-section {
  margin-bottom: 16px;
}
.wide-select {
  width: 100%;
}
.history-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.name-tag-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.type-tag {
  margin-left: 0;
}
.option-time {
  color: #909399;
  font-size: 12px;
}
.upload-section {
  margin-bottom: 16px;
}
.chapters-container {
  margin-top: 16px;
}
.chapter-content {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
.graphic-preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.graphic-preview img {
  max-width: 200px;
  max-height: 150px;
  object-fit: contain;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.chapters-preview {
  margin-top: 24px;
}
.chapter-preview-item {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
.chapter-preview-item h4 {
  margin: 0 0 12px 0;
  color: #303133;
}
.chapter-graphic {
  max-width: 100%;
  margin-top: 12px;
  border-radius: 4px;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
.preview-content {
  padding: 20px;
}
.preview-content h2 {
  text-align: center;
  margin-bottom: 24px;
}
.desc-pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}
.upload-demo {
  margin-bottom: 8px;
}
.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chapter-title {
  font-size: 16px;
  font-weight: 500;
}

.chapter-duration-tag {
  background: #f0f6ff;
  color: #409eff;
  border: none;
  border-radius: 16px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.chapter-duration-icon {
  font-size: 16px;
}

.chapter-duration-num {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
}

.chapter-duration-unit {
  font-size: 12px;
  font-weight: 500;
  margin: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-tag {
  margin-left: 8px;
  font-size: 14px;
  height: 20px;
  line-height: 20px;
  color: #67c23a;
  display: flex;
  align-items: center;
}

.ai-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #67c23a;
  border-radius: 50%;
  margin-right: 4px;
}

.graphic-actions {
  display: flex;
  gap: 12px;
}

.auto-fill-btn {
  background: linear-gradient(45deg, #409eff, #67c23a);
  border: none;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.auto-fill-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(45deg, #67c23a, #409eff);
}

.auto-fill-btn .el-icon {
  margin-right: 4px;
  font-size: 16px;
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

.typing-effect {
  overflow: hidden;
  white-space: nowrap;
  animation: typing 0.5s steps(40, end);
}
</style>
