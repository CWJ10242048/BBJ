<template>
  <el-card class="generated-questions-card" v-if="questions && questions.length > 0">
    <template #header>
      <div class="card-header">
        <span>题目预览</span>
        <div>
          <el-button
            type="primary"
            link
            :icon="isCollapsed ? ArrowDownBold : ArrowUpBold"
            @click="toggleCollapse"
            style="margin-left: 10px;"
          >
            {{ isCollapsed ? '展开' : '收起' }}
          </el-button>
          <el-button
            class="ai-analysis-btn"
            :icon="DataAnalysis"
            @click="handleAiAnalysisClick"
            style="margin-left: 10px;"
            title="显示AI分析标签页"
          >
            AI 分析
          </el-button>
        </div>
      </div>
    </template>

    <!-- Type Filter Tabs (Always Visible) -->
    <el-tabs v-model="selectedType" class="type-filter-tabs">
      <el-tab-pane
        v-for="type in availableTypes"
        :key="type"
        :label="type === 'AI 分析' ? 'AI 分析' : `${type} (${getQuestionCountByType(type)})`"
        :name="type"
      ></el-tab-pane>
    </el-tabs>

    <!-- Content that can be collapsed -->
    <div v-show="!isCollapsed">
      <!-- Display Filtered Questions -->
      <div v-if="selectedType !== 'AI 分析'">
        <div v-if="filteredQuestions.length > 0">
          <div v-for="(q, index) in filteredQuestions" :key="q.id || index" class="question-item">
            <div class="question-header">
              <p class="question-stem"><strong>{{ index + 1 }}. [{{ q.type }}]</strong> {{ q.stem }}</p>
              <el-button 
                type="primary" 
                :icon="EditPen" 
                size="small" 
                circle 
                plain
                title="编辑此题"
                @click="requestQuestionEdit(q.id)"
              />
            </div>
            <div v-if="q.options && Array.isArray(q.options)" class="options-list">
              <div v-for="(opt, optIndex) in q.options" :key="optIndex" class="option-item">
                {{ String.fromCharCode(65 + optIndex) }}. {{ opt }}
              </div>
            </div>
            <div v-if="q.answer" class="answer-section">
              <strong>答案:</strong> {{ q.answer }}
            </div>
            <div v-if="q.analysis" class="analysis-section">
              <strong>解析:</strong> {{ q.analysis }}
            </div>
            <el-divider v-if="index < filteredQuestions.length - 1" />
          </div>
        </div>
        <el-empty v-else :description="'暂无' + selectedType + '类型的题目'" />
      </div>
      
      <!-- Display AI Analysis Section (if AI Analysis tab is selected) -->
      <div v-else-if="selectedType === 'AI 分析'">
        <el-card v-if="aiAnalysisResults" shadow="never" class="analysis-card">
          <el-descriptions title="整体概览" :column="3" border class="overview-descriptions">
            <el-descriptions-item label="总题数" label-align="right" align="center">
              <el-tag type="primary" size="large" effect="dark" class="overview-tag">
                 <el-icon><Document /></el-icon> <span>{{ aiAnalysisResults.totalQuestions }}</span>
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="题型种类" label-align="right" align="center">
               <el-tag type="success" size="large" effect="dark" class="overview-tag">
                 <el-icon><CollectionTag /></el-icon> <span>{{ aiAnalysisResults.totalTypes }}</span>
               </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="涉及知识点" label-align="right" align="center">
              <el-tag type="warning" size="large" effect="dark" class="overview-tag">
                <el-icon><CollectionTag /></el-icon> <span>{{ aiAnalysisResults.totalKnowledgePoints }}</span>
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="题型分布评价" label-align="right" align="center">
              <el-tag :type="aiAnalysisResults.typeDistributionStatus.type" size="large" effect="light" class="overview-tag">
                 <el-icon><component :is="aiAnalysisResults.typeDistributionStatus.icon" /></el-icon> 
                 <span>{{ aiAnalysisResults.typeDistributionStatus.text }}</span>
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="平均质量评价" label-align="right" align="center">
               <el-tag :type="aiAnalysisResults.averageQualityStatus.type" size="large" effect="light" class="overview-tag">
                  <el-icon><component :is="aiAnalysisResults.averageQualityStatus.icon" /></el-icon> 
                  <span>{{ aiAnalysisResults.averageQualityStatus.text }} ({{ aiAnalysisResults.averageQualityScore }}/5.0)</span>
               </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="-" label-align="right" align="center">
               <!-- Placeholder for alignment if needed -->
            </el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">详细分析</el-divider>

          <el-row :gutter="20">
            <!-- Knowledge Point Coverage -->
            <el-col :span="12">
              <el-card shadow="hover">
                <template #header>
                   <div class="analysis-card-header">
                      <el-icon><Histogram /></el-icon> 知识点覆盖度
                   </div>
                </template>
                <div ref="radarChartRef" class="radar-chart-container"></div>
                <el-empty v-if="!aiAnalysisResults || aiAnalysisResults.radarIndicators.length === 0" description="暂无知识点数据或题目" :image-size="60" style="padding: 10px 0;"/>
              </el-card>
            </el-col>

            <!-- Type Distribution -->
            <el-col :span="12">
              <el-card shadow="hover">
                 <template #header>
                   <div class="analysis-card-header">
                      <el-icon><DataLine /></el-icon> 题型数量分布
                   </div>
                </template>
                 <div ref="barChartRef" class="bar-chart-container"></div>
                 <el-empty v-if="!aiAnalysisResults || aiAnalysisResults.barChartCategories.length === 0" description="暂无题型数据" :image-size="60" style="padding: 10px 0;"/>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px;">
             <!-- Difficulty -->
             <el-col :span="12">
               <el-card shadow="hover">
                  <template #header>
                    <div class="analysis-card-header">
                       <el-icon><PieChartIcon /></el-icon> 难度分布
                    </div>
                  </template>
                  <div ref="pieChartRef" class="pie-chart-container"></div>
                  <el-empty v-if="!aiAnalysisResults.hasDifficulty || aiAnalysisResults.pieChartData.length === 0" description="暂无难度数据" :image-size="60" style="padding: 10px 0;"/>
                  
                  <!-- Expected Score Rate Section -->
                  <el-divider v-if="aiAnalysisResults.expectedScoreRates.length > 0" content-position="left">各题型预计得分率</el-divider>
                  <div v-if="aiAnalysisResults.expectedScoreRates.length > 0" class="score-rate-list score-rate-in-card">
                      <div v-for="item in aiAnalysisResults.expectedScoreRates" :key="item.type" class="score-rate-item">
                         <span class="type-name">{{ item.type }}</span>
                         <div class="score-rate-bar-container">
                             <div class="score-rate-bar" :style="{ width: item.rate + '%' }"></div>
                         </div>
                         <span class="score-rate-value">{{ item.rate }}%</span>
                      </div>
                   </div>
               </el-card>
             </el-col>

             <!-- Per-Type Quality -->
             <el-col :span="12">
               <el-card shadow="hover">
                 <template #header>
                    <div class="analysis-card-header">
                       <el-icon><Trophy /></el-icon> 各题型质量评估
                    </div>
                 </template>
                 <div class="type-quality-list">
                    <div v-for="item in aiAnalysisResults.typeQuality" :key="item.type" class="type-quality-item">
                        <div class="quality-info">
                            <span class="type-name">{{ item.type }}:</span> 
                            <el-tag :type="item.score > 3.5 ? 'success' : item.score > 2.0 ? 'warning' : 'danger'" size="small" effect="light">
                                <el-icon><component :is="item.icon" /></el-icon> {{ item.assessment }}
                            </el-tag>
                            <span class="type-score"> ({{ item.score }}/5.0)</span>
                        </div>
                        <div v-if="item.assessment === '有待改进' && item.questionsToImprove.length > 0" class="improvement-needed">
                           需改进题目 (ID): 
                           <span v-for="(id, idx) in item.questionsToImprove" :key="id" class="improvement-id-link">
                               <el-link type="primary" @click="requestQuestionEdit(id)">{{ id }}</el-link>{{ idx < item.questionsToImprove.length - 1 ? ', ' : '' }}
                           </span>
                        </div>
                    </div>
                 </div>
               </el-card>
             </el-col>
          </el-row>

        </el-card>
        <el-empty v-else description="暂无题目可供分析" />
      </div>

    </div>

    <!-- Action Buttons Below Content -->
    <div class="action-buttons-footer">
        <el-button 
            type="success" 
            :icon="FolderChecked"
            @click="handleSaveQuestions"
            :disabled="isExporting"
        >
            保存题目
        </el-button>
        <el-button 
            type="warning" 
            :icon="Download"
            @click="handleExportQuestions"
            :loading="isExporting"
        >
            {{ isExporting ? '导出中...' : '导出 Word' }}
        </el-button>
    </div>

    <!-- Edit Question Dialog -->
    <el-dialog 
      v-model="editDialogVisible" 
      title="编辑题目" 
      width="60%" 
      top="5vh"
      destroy-on-close
      draggable
    >
      <el-form 
        v-if="editingQuestion" 
        :model="editingQuestion" 
        ref="formRef" 
        label-width="100px" 
        label-position="top"
      >
        <el-form-item label="题型">
          <el-input v-model="editingQuestion.type" disabled />
        </el-form-item>
        <el-form-item 
          label="题干" 
          prop="stem" 
          :rules="[{ required: true, message: '题干不能为空', trigger: 'blur' }]"
        >
          <el-input v-model="editingQuestion.stem" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" />
        </el-form-item>
        
        <!-- Options for Multiple Choice -->
        <template v-if="editingQuestion.type === '选择题'">
           <el-divider content-position="left">选项</el-divider>
           <div v-if="editingQuestion.options" v-for="(option, index) in editingQuestion.options" :key="index" class="option-edit-item">
              <el-form-item
                 :label="`选项 ${String.fromCharCode(65 + index)}`" 
                 :prop="`options[${index}]`" 
                 :rules="[{ required: true, message: '选项内容不能为空', trigger: 'blur' }]"
                 class="option-input-item"
              >
                 <el-input v-model="editingQuestion.options[index]" placeholder="请输入选项内容" />
              </el-form-item>
              <el-button type="danger" plain circle :icon="Delete" @click="removeOption(index)" size="small"></el-button>
           </div>
           <el-button type="success" plain @click="addOption" size="small" :icon="Plus">添加选项</el-button>
        </template>

        <el-divider content-position="left">答案与解析</el-divider>
        <el-row :gutter="20">
           <el-col :span="12">
              <el-form-item 
                label="答案" 
                prop="answer" 
                :rules="[{ required: true, message: '答案不能为空', trigger: 'blur' }]"
              >
                <el-input v-model="editingQuestion.answer" placeholder="请输入答案" />
              </el-form-item>
           </el-col>
           <el-col :span="12">
               <el-form-item label="难度 (1极易-5极难)" prop="difficulty">
                   <el-input-number v-model="editingQuestion.difficulty" :min="1" :max="5" />
               </el-form-item>
           </el-col>
        </el-row>
        <el-form-item label="解析" prop="analysis">
          <el-input v-model="editingQuestion.analysis" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" placeholder="请输入题目解析"/>
        </el-form-item>
        <el-form-item label="知识点" prop="knowledgePoint">
          <el-input v-model="editingQuestion.knowledgePoint" placeholder="请输入知识点" />
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelQuestionEdit">取消</el-button>
          <el-button type="primary" @click="saveQuestionEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Export Configuration Dialog -->
    <el-dialog 
      v-model="exportDialogVisible" 
      title="导出选项" 
      width="400px"
      class="export-dialog"
      destroy-on-close
      draggable
    >
      <el-form 
        :model="exportForm" 
        :rules="exportFormRules" 
        ref="exportFormRef" 
        label-width="80px"
      >
        <el-form-item label="文件名" prop="filename">
          <el-input v-model="exportForm.filename" placeholder="请输入文件名（无需后缀）" />
        </el-form-item>
        <el-form-item label="选择题型" prop="selectedTypes">
          <el-checkbox-group v-model="exportForm.selectedTypes" class="export-type-checkbox-group">
            <el-checkbox 
              v-for="type in exportAvailableTypes" 
              :key="type" 
              :label="type"
            >
              {{ type }} ({{ getQuestionCountByType(type) }})
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelExport">取消</el-button>
          <el-button type="primary" @click="confirmExport" :loading="isExporting">
            {{ isExporting ? '导出中...' : '确认导出' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

  </el-card>
  <el-empty v-else description="暂无生成的题目" />
</template>

<script setup lang="ts">
import { ref, computed, defineProps, watch, nextTick, reactive } from 'vue';
import type { PropType } from 'vue';
import {
  ArrowUpBold,
  ArrowDownBold,
  DataAnalysis,
  Document,
  CollectionTag,
  Histogram,
  Trophy,
  CircleCheck,
  CircleClose,
  WarningFilled,
  InfoFilled,
  DataLine,
  PieChart as PieChartIcon,
  TrendCharts,
  EditPen,
  Delete,
  Plus,
  Download,
  FolderChecked
} from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { RadarChart, BarChart, PieChart } from 'echarts/charts';
import { 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent, 
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import * as docx from 'docx';
import { saveAs } from 'file-saver';

// Register ECharts components
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  RadarChart,
  BarChart,
  PieChart,
  GridComponent,
  CanvasRenderer
]);

// Define the structure of a question object (adjust as needed)
interface Question {
  id: number | string;
  type: string;
  knowledgePoint: string;
  stem: string;
  options?: string[];
  answer?: string;
  analysis?: string;
  difficulty?: number;
}

const props = defineProps({
  questions: {
    type: Array as PropType<Question[]>,
    required: true,
    default: () => []
  }
});

// State for the selected filter type
const selectedType = ref<string>('全部');

// State for collapse/expand
const isCollapsed = ref(false);

// State to show the AI Analysis tab
const showAiAnalysisTab = ref(false);

// Toggle collapse state
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Watch for tab changes to auto-expand if collapsed
watch(selectedType, (newType) => {
  if (isCollapsed.value) {
    isCollapsed.value = false;
  }
});

// Handle AI Analysis button click
const handleAiAnalysisClick = () => {
  showAiAnalysisTab.value = true;
  ElMessage.success('分析结果已生成'); // 添加成功提示
  // Optionally switch to the new tab immediately
  // selectedType.value = 'AI 分析';
};

// Compute available types including '全部' and potentially 'AI 分析'
const availableTypes = computed(() => {
  const types = new Set(props.questions.map(q => q.type));
  const baseTypes = ['全部', ...Array.from(types)];
  if (showAiAnalysisTab.value) {
    return [...baseTypes, 'AI 分析'];
  }
  return baseTypes;
});

// Compute filtered questions based on selected type
const filteredQuestions = computed(() => {
  if (selectedType.value === '全部') {
    return props.questions;
  } else {
    return props.questions.filter(q => q.type === selectedType.value);
  }
});

// --- Refs ---
const radarChartRef = ref<HTMLElement | null>(null); // Ref for Radar Chart DOM
let radarChartInstance: echarts.ECharts | null = null; // To hold chart instance
const barChartRef = ref<HTMLElement | null>(null); // Ref for Bar Chart DOM
let barChartInstance: echarts.ECharts | null = null; // To hold bar chart instance
const pieChartRef = ref<HTMLElement | null>(null); // Ref for Pie Chart DOM
let pieChartInstance: echarts.ECharts | null = null; // To hold pie chart instance
const editDialogVisible = ref(false);
const editingQuestion = ref<Question | null>(null);
const formRef = ref<FormInstance | null>(null); // Ref for the dialog form
const isExporting = ref(false); // Add exporting state

// --- State for Export Dialog ---
const exportDialogVisible = ref(false);
const exportFormRef = ref<FormInstance | null>(null);
const exportForm = reactive({
  filename: '',
  selectedTypes: [] as string[]
});

// --- Computed Properties ---
// Available types for the export dialog checkboxes
const exportAvailableTypes = computed(() => {
  if (!props.questions) return [];
  const types = new Set(props.questions.map(q => q.type));
  return Array.from(types);
});

// Validation rules for the export form
const exportFormRules = reactive<Record<string, any>>({
  filename: [
    { required: true, message: '请输入文件名', trigger: 'blur' },
    { pattern: /^[^\/\\:*?\"<>|]+$/, message: '文件名不能包含特殊字符 \\ / : * ? \" < > |', trigger: 'blur' }
  ],
  selectedTypes: [
    { type: 'array', required: true, message: '请至少选择一种题型导出', trigger: 'change' }
  ]
});

// --- AI Analysis Computed Property ---
const aiAnalysisResults = computed(() => {
  const questions = props.questions;
  if (!questions || questions.length === 0) {
    return null; // No analysis if no questions
  }

  const totalQuestions = questions.length;
  const types = new Set(questions.map(q => q.type));
  const knowledgePoints = new Set(questions.map(q => q.knowledgePoint).filter(kp => kp)); // Filter out potential undefined/null KPs

  // 1. Knowledge Point Coverage (Now using kpCounts for data)
  const kpCounts: Record<string, number> = {};
  questions.forEach(q => {
    if (q.knowledgePoint) { 
        kpCounts[q.knowledgePoint] = (kpCounts[q.knowledgePoint] || 0) + 1;
    }
  });

  // Prepare data for ECharts Radar
  const radarIndicators: { name: string; max: number }[] = [];
  const radarDataValues: number[] = [];
  const kpNames = Object.keys(kpCounts);
  const maxCount = Math.max(...Object.values(kpCounts), 0); // Find max count, default 0 if empty
  const radarMax = Math.ceil(maxCount * 1.2) || 5; // Set max axis value slightly higher, min 5

  kpNames.forEach(name => {
      radarIndicators.push({ name, max: radarMax });
      radarDataValues.push(kpCounts[name]);
  });

  // 2. Type Distribution
  const typeCounts: Record<string, number> = {};
  questions.forEach(q => { typeCounts[q.type] = (typeCounts[q.type] || 0) + 1; });
  let typeDistributionStatus: { text: string; type: 'success' | 'warning' | 'danger'; icon: any };
  const typeVarietyScore = types.size / Math.max(1, totalQuestions / 5); 
  const maxRatio = Math.max(...Object.values(typeCounts)) / Math.max(1, totalQuestions);
  
  if (typeVarietyScore > 0.8 && maxRatio < 0.6) {
     typeDistributionStatus = { text: '分布均衡', type: 'success', icon: CircleCheck };
  } else if (typeVarietyScore < 0.5 || maxRatio > 0.8) {
     typeDistributionStatus = { text: '可能失衡', type: 'danger', icon: CircleClose };
  } else {
     typeDistributionStatus = { text: '分布尚可', type: 'warning', icon: WarningFilled };
  }
  // Prepare data for Bar Chart
  const barChartCategories = Object.keys(typeCounts);
  const barChartData = barChartCategories.map(type => typeCounts[type]);

  // 3. Difficulty Distribution
  const difficultyCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let hasDifficulty = false;
  const difficultyLabels = ['极易', '简单', '中等', '困难', '极难']; // Difficulty labels
  questions.forEach(q => {
    if (q.difficulty && q.difficulty >= 1 && q.difficulty <= 5) {
      difficultyCounts[q.difficulty]++;
      hasDifficulty = true;
    }
  });
  // Prepare data for Pie Chart
  const pieChartData = Object.keys(difficultyCounts)
      .map(levelStr => {
          const level = parseInt(levelStr);
          return { 
              value: difficultyCounts[level], 
              name: difficultyLabels[level - 1] // Use Chinese labels (level-1 for 0-based index)
          };
      })
      .filter(item => item.value > 0); // Only include levels with questions

  // 4. Per-Type Quality
  const typeQuality: Array<{ 
      type: string; 
      score: number; 
      assessment: string; 
      icon: any; 
      questionsToImprove: (string | number)[]; // Add IDs here
  }> = [];
  types.forEach(t => {
    const qualityScore = Math.random() * 5; // Random score 0-5
    let assessment: string;
    let icon: any;
    let questionsToImprove: (string | number)[] = [];

    if (qualityScore > 4) { assessment = '优秀'; icon = CircleCheck; }
    else if (qualityScore > 3) { assessment = '良好'; icon = CircleCheck; }
    else if (qualityScore > 2) { assessment = '一般'; icon = WarningFilled; }
    else { 
        assessment = '有待改进'; 
        icon = CircleClose; 
        // Finding question IDs needing improvement for this type
        const questionsOfType = questions.filter(q => q.type === t);
        questionsToImprove = questionsOfType
            .slice(0, Math.floor(questionsOfType.length * (Math.random() * 0.3 + 0.1))) // Take 10-40% random questions
            .map(q => q.id);
    }
    typeQuality.push({ 
        type: t, 
        score: parseFloat(qualityScore.toFixed(1)), 
        assessment, 
        icon, 
        questionsToImprove 
    });
  });

  // 5. Calculate Average Quality
  let averageQualityScore = 0;
  let averageQualityStatus: { text: string; type: 'success' | 'warning' | 'danger'; icon: any };
  if (typeQuality.length > 0) {
    averageQualityScore = typeQuality.reduce((sum, item) => sum + item.score, 0) / typeQuality.length;
  }
  if (averageQualityScore > 3.8) { averageQualityStatus = { text: '整体良好', type: 'success', icon: CircleCheck }; }
  else if (averageQualityScore > 2.5) { averageQualityStatus = { text: '整体尚可', type: 'warning', icon: WarningFilled }; }
  else { averageQualityStatus = { text: '有待提升', type: 'danger', icon: CircleClose }; }

  // 6. Expected Score Rates
  const expectedScoreRates: Array<{ type: string; rate: number }> = [];
  types.forEach(t => {
      // Score rate between 60% and 95%
      const rate = Math.floor(Math.random() * 36) + 60; 
      expectedScoreRates.push({ type: t, rate });
  });

  return {
    totalQuestions,
    totalTypes: types.size,
    totalKnowledgePoints: knowledgePoints.size,
    typeDistributionStatus,
    typeCounts,
    hasDifficulty,
    pieChartData,
    typeQuality,
    radarIndicators,
    radarDataValues,
    averageQualityScore: parseFloat(averageQualityScore.toFixed(1)),
    averageQualityStatus,
    barChartCategories,
    barChartData,
    expectedScoreRates,
  };
});

// Helper to get count for each type tab label
const getQuestionCountByType = (type: string): number => {
  if (type === '全部') {
    return props.questions.length;
  } else if (type === 'AI 分析') {
    return 0; // AI Analysis tab doesn't represent question count
  } else {
    return props.questions.filter(q => q.type === type).length;
  }
};

// --- Methods ---
const requestQuestionEdit = (questionId: number | string) => {
  const questionToEdit = props.questions.find(q => q.id === questionId);
  if (questionToEdit) {
    // Deep copy to avoid modifying the prop directly
    editingQuestion.value = JSON.parse(JSON.stringify(questionToEdit));
    // Ensure options is an array for the form, even if initially undefined
    if (editingQuestion.value && editingQuestion.value.type === '选择题' && !Array.isArray(editingQuestion.value.options)) {
         editingQuestion.value.options = [];
    }
    editDialogVisible.value = true;
    // Clear previous validation if form exists
    nextTick(() => {
        formRef.value?.clearValidate();
    });

  } else {
    ElMessage.error('找不到要编辑的题目');
  }
};

const saveQuestionEdit = async () => {
  if (!editingQuestion.value || !formRef.value) return;

  try {
    await formRef.value.validate(); // Validate the form
    // Emit event to parent component with the updated question data
    emit('update-question', editingQuestion.value);
    editDialogVisible.value = false;
    ElMessage.success('题目更新请求已发送'); // Notify user
  } catch (error) {
     console.error("Form validation failed:", error);
     ElMessage.error('请检查表单项是否填写正确');
  }

};

const cancelQuestionEdit = () => {
  editDialogVisible.value = false;
};

// Helper functions for editing options in the dialog
const addOption = () => {
  if (editingQuestion.value && editingQuestion.value.options) {
    editingQuestion.value.options.push('');
  }
};

const removeOption = (index: number) => {
  if (editingQuestion.value && editingQuestion.value.options) {
    editingQuestion.value.options.splice(index, 1);
  }
};

// --- Placeholder Methods for Save/Export Below Questions ---
const handleSaveQuestions = () => {
    console.log("Saving questions:", props.questions);
    ElMessage.success('保存请求已发送 (功能待实现)');
    // Implement actual save logic here (e.g., API call)
};

// --- Export Logic ---
// Opens the export configuration dialog
const handleExportQuestions = async () => {
    if (!props.questions || props.questions.length === 0) {
        ElMessage.warning('没有题目可供导出');
        return;
    }
    // Reset form and set defaults
    exportForm.filename = '生成的题目'; // TODO: Use course name if available
    exportForm.selectedTypes = exportAvailableTypes.value; // Select all by default
    exportDialogVisible.value = true;
    await nextTick(); // Wait for dialog to render
    exportFormRef.value?.clearValidate(); // Clear previous validation
};

// Generates the .docx file and triggers download
const generateAndSaveWord = async (questionsToExport: Question[], filename: string) => {
    isExporting.value = true;
    ElMessage.info('正在生成 Word 文档...');

    try {
        const questionParagraphs: docx.Paragraph[] = [];

        questionsToExport.forEach((q, index) => {
            // Question Number, Type and Stem
            questionParagraphs.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({ text: `${index + 1}. `, bold: true }),
                        new docx.TextRun({ text: `[${q.type}] `, bold: true }),
                        new docx.TextRun(q.stem),
                    ],
                    spacing: { before: index > 0 ? 200 : 0, after: 100 }, // Add space before new question
                })
            );

            // Options (if any)
            if (q.options && Array.isArray(q.options)) {
                q.options.forEach((option, optIndex) => {
                    questionParagraphs.push(
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun(`${String.fromCharCode(65 + optIndex)}. ${option}`),
                            ],
                            indent: { left: 400 }, // Indent options
                        })
                    );
                });
            }

            // Answer
            questionParagraphs.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({ text: '答案：', bold: true }),
                        new docx.TextRun(q.answer || '无'),
                    ],
                    indent: { left: 400 },
                    spacing: { before: 100 },
                })
            );

            // Analysis (if any)
            if (q.analysis) {
                questionParagraphs.push(
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({ text: '解析：', bold: true }),
                            new docx.TextRun(q.analysis),
                        ],
                        indent: { left: 400 },
                    })
                );
            }
        });

        const doc = new docx.Document({
            sections: [{
                properties: {},
                children: questionParagraphs,
            }],
        });

        // Generate blob and save
        const blob = await docx.Packer.toBlob(doc);
        // Ensure filename ends with .docx
        const finalFilename = filename.endsWith('.docx') ? filename : `${filename}.docx`;
        saveAs(blob, finalFilename);

        ElMessage.success('Word 文件导出成功');

    } catch (error) {
        console.error('导出 Word 失败:', error);
        ElMessage.error('导出失败，请重试');
    } finally {
        isExporting.value = false;
    }
};

// Called when the export dialog's confirm button is clicked
const confirmExport = async () => {
    if (!exportFormRef.value) return;
    try {
        await exportFormRef.value.validate();

        const filteredQuestions = props.questions.filter(q => 
            exportForm.selectedTypes.includes(q.type)
        );

        if (filteredQuestions.length === 0) {
             ElMessage.warning('未选中任何题目或所选类型的题目不存在');
             return;
        }

        exportDialogVisible.value = false; // Close dialog before exporting
        await generateAndSaveWord(filteredQuestions, exportForm.filename);

    } catch (error) {
        console.error('导出表单校验失败:', error);
        ElMessage.error('请检查导出选项是否填写正确');
    }
};

// Called when the export dialog's cancel button is clicked
const cancelExport = () => {
    exportDialogVisible.value = false;
};

// --- ECharts Rendering ---
const renderRadarChart = () => {
  if (!radarChartRef.value || !aiAnalysisResults.value || aiAnalysisResults.value.radarIndicators.length === 0) {
    // Destroy existing chart if no data or element
    if (radarChartInstance) {
        radarChartInstance.dispose();
        radarChartInstance = null;
    }
    return; 
  }

  // Initialize or get existing chart instance
  if (!radarChartInstance) {
      radarChartInstance = echarts.init(radarChartRef.value);
  } else {
      // Ensure responsiveness or clear previous options if necessary
      // radarChartInstance.resize(); // Optional: Call if container size might change
      // radarChartInstance.clear(); // Optional: If previous structure was very different
  }

  const option = {
    tooltip: { trigger: 'item' },
    legend: {
      data: ['覆盖度'],
      bottom: 5,
    },
    radar: {
      indicator: aiAnalysisResults.value.radarIndicators,
      radius: '65%', // Adjust size
      center: ['50%', '50%'],
    },
    series: [
      {
        name: '知识点分析',
        type: 'radar',
        data: [
          {
            value: aiAnalysisResults.value.radarDataValues,
            name: '覆盖度',
            areaStyle: { color: 'rgba(64, 158, 255, 0.2)' }, // Light blue area fill
            lineStyle: { color: '#409EFF' },
            itemStyle: { color: '#409EFF' },
          },
        ],
      },
    ],
  };

  radarChartInstance.setOption(option);
};

const renderBarChart = () => {
  if (!barChartRef.value || !aiAnalysisResults.value || aiAnalysisResults.value.barChartCategories.length === 0) {
    if (barChartInstance) {
        barChartInstance.dispose();
        barChartInstance = null;
    }
    return;
  }

  if (!barChartInstance) {
      barChartInstance = echarts.init(barChartRef.value);
  } 

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: { // Adjust grid to prevent label cutoff
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: aiAnalysisResults.value.barChartCategories,
        axisTick: { alignWithLabel: true },
        axisLabel: { interval: 0, rotate: 30 } // Rotate labels if too many
      }
    ],
    yAxis: [
      { type: 'value', name: '题目数量' }
    ],
    series: [
      {
        name: '数量',
        type: 'bar',
        barWidth: '60%',
        data: aiAnalysisResults.value.barChartData,
        itemStyle: {
           color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
           ])
        },
        emphasis: {
            itemStyle: {
               color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                 { offset: 0, color: '#2378f7' },
                 { offset: 0.7, color: '#2378f7' },
                 { offset: 1, color: '#83bff6' }
               ])
            }
        },
      }
    ]
  };

  barChartInstance.setOption(option);
};

const renderPieChart = () => {
  if (!pieChartRef.value || !aiAnalysisResults.value || aiAnalysisResults.value.pieChartData.length === 0) {
    if (pieChartInstance) {
      pieChartInstance.dispose();
      pieChartInstance = null;
    }
    return;
  }

  if (!pieChartInstance) {
    pieChartInstance = echarts.init(pieChartRef.value);
  }

  // Define custom colors for difficulty levels first
  const difficultyColors = [
      '#67C23A', // 难度1
      '#95d475', // 难度2
      '#E6A23C', // 难度3
      '#F56C6C', // 难度4
      '#c45656'  // 难度5
  ];

  const option = {
    title: {
        // text: '难度分布', // Title can be in the card header
        left: 'center'
    },
    tooltip: {
        trigger: 'item',
        formatter: '{b} : {c} ({d}%)'
    },
    color: difficultyColors, // Apply the defined colors
    legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center'
    },
    series: [
        {
            name: '难度分布',
            type: 'pie',
            radius: ['40%', '70%'], // Make it a donut chart
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '16',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: aiAnalysisResults.value.pieChartData
        }
    ]
  };

  pieChartInstance.setOption(option);
};

// Watch analysis results to trigger chart rendering
watch(aiAnalysisResults, (newResults) => {
  if (selectedType.value === 'AI 分析' && newResults) {
    nextTick(() => {
      renderRadarChart();
      renderBarChart();
      renderPieChart();
    });
  }
}, { deep: true });

// Also render when switching TO the AI tab if results exist
watch(selectedType, (newType) => {
  if (newType === 'AI 分析' && aiAnalysisResults.value) {
     nextTick(() => {
        renderRadarChart();
        renderBarChart();
        renderPieChart();
     });
  } else {
     // Dispose charts when switching away
     if (radarChartInstance) { radarChartInstance.dispose(); radarChartInstance = null; }
     if (barChartInstance) { barChartInstance.dispose(); barChartInstance = null; }
     if (pieChartInstance) { pieChartInstance.dispose(); pieChartInstance = null; }
  }
  // Auto-expand logic (keep existing)
  if (isCollapsed.value) {
    isCollapsed.value = false;
  }
});

// Handle component unmount to destroy charts
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (radarChartInstance) { radarChartInstance.dispose(); }
  if (barChartInstance) { barChartInstance.dispose(); }
  if (pieChartInstance) { pieChartInstance.dispose(); }
});

// Define emits
const emit = defineEmits(['update-question']);

</script>

<style scoped>
.generated-questions-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  /* Ensure header doesn't collapse */
  min-height: 32px; /* Adjust as needed */
}

/* Styles for the filter tabs */
.type-filter-tabs {
  margin-bottom: 20px;
  margin-top: -10px; /* Adjust to pull tabs closer to header */
}

/* Optional: Style the active tab differently */
:deep(.el-tabs__item.is-active) {
  /* color: #409EFF; */
  font-weight: bold;
}

:deep(.el-tabs__active-bar) {
  /* background-color: #409EFF; */
}

.question-item {
  margin-bottom: 20px;
  padding-bottom: 15px; /* Add padding instead of relying solely on divider */
}

.question-item p {
  margin: 8px 0;
  line-height: 1.6;
  font-size: 14px;
}

.options-list {
  margin-left: 20px;
  margin-top: 8px;
  font-size: 14px;
}

.option-item {
  margin-bottom: 5px;
}

.answer-section,
.analysis-section {
  margin-top: 10px;
  font-size: 13px;
  color: #606266;
  background-color: #f9f9f9; /* Slight background for distinction */
  border-radius: 4px;
  padding: 8px 12px;
  line-height: 1.5;
}

.answer-section strong,
.analysis-section strong {
  color: #303133;
  margin-right: 5px;
}

/* Add margin to the divider for better spacing */
.question-item .el-divider {
  margin: 20px 0 15px 0; 
}

/* Style for the empty state */
.el-empty {
  margin-top: 20px;
}

/* Style for the AI Analysis button (similar to Question.vue) */
.ai-analysis-btn {
  background: linear-gradient(45deg, #409eff, #67c23a);
  border: none;
  color: white !important; 
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 6px 10px; 
  border-radius: 4px; 
  text-decoration: none !important; 
  display: inline-flex; 
  align-items: center; 
}

.ai-analysis-btn:hover:not(.is-disabled) {
  transform: translateY(-1px); 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
  background: linear-gradient(45deg, #67c23a, #409eff);
  color: white !important;
}

.ai-analysis-btn .el-icon {
  margin-right: 4px;
  font-size: 14px; 
}

/* Style for the AI Analysis tab label */
:deep(.el-tabs__item[aria-controls="pane-AI 分析"]) {
  color: #E6A23C; /* Warning color */
  font-weight: bold;
}
/* Optional: Style for the active AI Analysis tab */
:deep(.el-tabs__item[aria-controls="pane-AI 分析"].is-active) {
  color: #E6A23C; 
  /* You might want a different active color or keep it the same */
}

.analysis-card {
  margin-top: 10px;
  padding: 15px;
}

.overview-descriptions .overview-tag {
  display: inline-flex; /* Use flex for alignment */
  align-items: center; /* Vertically center */
  justify-content: center; /* Horizontally center */
  width: 100%; /* Make tag take full width of cell */
  padding: 5px 0; /* Adjust padding */
}

.overview-descriptions .overview-tag .el-icon {
  margin-right: 5px; /* Space between icon and text */
}

.analysis-card-header {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 15px;
}

.analysis-card-header .el-icon {
  margin-right: 6px;
}

.analysis-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
  line-height: 1.4;
}

.type-quality-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-quality-item {
  display: flex;
  flex-direction: column; /* Stack info and improvement suggestions */
  align-items: flex-start; /* Align items left */
  gap: 5px; /* Space between info and suggestions */
  border-bottom: 1px dashed #eee;
  padding-bottom: 8px;
  margin-bottom: 8px;
}
.type-quality-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}
.quality-info {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%; /* Ensure it takes full width */
}
.improvement-needed {
    font-size: 12px;
    color: #909399;
    padding-left: 0; /* Remove indent */
    margin-top: 4px;
}

.score-rate-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-rate-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-rate-item .type-name {
   min-width: 60px;
   text-align: right;
   font-weight: 500;
   font-size: 13px;
}

.score-rate-bar-container {
  flex-grow: 1;
  height: 10px;
  background-color: #ebeef5;
  border-radius: 5px;
  overflow: hidden;
}

.score-rate-bar {
  height: 100%;
  background-color: #67c23a; /* Green color for score rate */
  border-radius: 5px;
  transition: width 0.3s ease-in-out;
}

.score-rate-value {
  font-size: 12px;
  color: #606266;
  min-width: 35px; /* Ensure alignment */
  text-align: right;
}

.radar-chart-container {
  width: 100%;
  height: 280px; /* Adjust height as needed */
}

.bar-chart-container {
  width: 100%;
  height: 280px; /* Adjust height as needed */
}

.pie-chart-container {
  width: 100%;
  height: 240px; /* Adjust height for pie chart */
}

.score-rate-in-card {
    margin-top: 15px; /* Add margin when inside the card */
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Align button top */
}

.question-stem {
    flex-grow: 1; /* Allow stem to take available space */
    margin-right: 10px; /* Space between stem and button */
    margin-top: 8px; /* Align with original p margin */
    margin-bottom: 8px;
    line-height: 1.6;
    font-size: 14px;
}

.improvement-id-link .el-link {
    font-size: 12px;
    vertical-align: baseline; /* Adjust alignment if needed */
    margin: 0 2px;
}

.option-edit-item {
    display: flex;
    align-items: center; /* Align input and button vertically */
    margin-bottom: 10px; /* Space between option items */
    gap: 10px; /* Space between input and button */
}

.option-input-item {
    flex-grow: 1; /* Allow input to take available space */
    margin-bottom: 0 !important; /* Override default form item margin */
}

/* Make dialog form labels bold */
:deep(.el-dialog .el-form-item__label) {
    font-weight: bold;
}

.action-buttons-footer {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 25px; /* Add space above buttons */
    padding-top: 15px; /* Add padding top */
    border-top: 1px solid #ebeef5; /* Separator line */
}

/* Export Dialog Styles */
.export-dialog :deep(.el-dialog__body) {
  padding-top: 10px; /* Reduce top padding */
  padding-bottom: 0; /* Remove bottom padding */
}

.export-type-checkbox-group {
  display: flex;
  flex-direction: column; /* Stack checkboxes vertically */
  gap: 5px;
}
</style> 