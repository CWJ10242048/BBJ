<template>
  <div class="questiongen-container">
    <h2>智能出题</h2>
    
    <!-- 使用选择器组件，始终显示 -->
    <QuestionSelector @confirm="handleSelectorConfirm" @reset="resetSelection" />
    
    <!-- 根据选择显示出题配置 -->
    <template v-if="selectedData">
      <el-alert
        v-if="selectedData.source === 'select'"
        type="info"
        :closable="false"
        style="margin-bottom: 20px;"
      >
        <div class="selected-info">
          已选：{{ selectedData.data.major }} - {{ selectedData.data.course }} - 
          <span class="knowledge-tags">
            <el-tag v-for="(item, index) in selectedData.data.knowledgePoints" :key="index" size="small">
              {{ item }}
            </el-tag>
          </span>
          <span class="mode-text">出题模式: {{ selectedData.data.mode }}</span>
        </div>
      </el-alert>
      <el-alert
        v-else 
        type="info"
        :closable="false"
        style="margin-bottom: 20px;"
      >
         <div class="selected-info">
            已选择：题库文件上传方式
            <span v-if="selectedData.data.fileList && selectedData.data.fileList.length > 0">
              ({{ selectedData.data.fileList[0]?.name || '未知文件名' }})
            </span>
          </div>
      </el-alert>

      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>
              出题信息
              <el-tag
                v-if="showAiGeneratedIndicator"
                size="small"
                type="success"
                effect="light"
                class="ai-indicator-tag"
              >
                AI自动生成
              </el-tag>
            </span>
            <el-button
              type="primary"
              link
              class="auto-fill-btn"
              @click="handleAiGenerate"
              :loading="isAiFilling"  
              title="智能生成下方选项内容"
            >
              <el-icon><MagicStick /></el-icon>
              AI 智能生成
            </el-button>
          </div>
        </template>
        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
          <!-- Difficulty Slider (Always Shown) -->
          <el-form-item label="难度分布" prop="difficultyDistribution" class="difficulty-form-item">
            <DifficultyDistributionSlider v-model="form.difficultyDistribution" />
          </el-form-item>

          <!-- Unified Type Selection & Config (Select Mode) -->
          <template v-if="selectedData.source === 'select'">
             <el-form-item label="选择题型" prop="selectedTypesForCheckboxes">
               <el-checkbox-group v-model="form.selectedTypesForCheckboxes">
                 <el-checkbox 
                    v-for="item in typeList" 
                    :key="item.value" 
                    :label="item.value" 
                    :style="getCheckboxStyle(item.value)" 
                 >
                   {{ item.label }}
                 </el-checkbox>
               </el-checkbox-group>
             </el-form-item>

             <!-- Draggable Type Config Cards -->
              <!-- No label needed here -->
             <el-form-item label="" prop="typeConfigs" label-width="0px">
                <div 
                    class="type-config-grid" 
                    @dragover.prevent="handleDragOver($event)" 
                >
                    <el-card 
                        v-for="(entry, index) in form.typeConfigs" 
                        :key="entry.id" 
                        class="type-config-card" 
                        shadow="hover"
                        draggable="true"
                        @dragstart="handleDragStart($event, entry)"
                        @dragend="handleDragEnd($event)"
                        @drop="handleDrop($event, entry)" 
                        :class="{ 'dragging-placeholder': entry.id === draggedItemId }" 
                        :style="getCardStyle(entry.type)"
                    >
                        <div class="config-card-content">
                             <div class="config-card-header">{{ entry.type }}</div>
                             <div class="config-card-body">
                                <el-form-item 
                                    label="知识点"
                                    :prop="`typeConfigs.${index}.knowledgePoints`"
                                    :rules="{ type: 'array', required: true, min: 1, message: '请选择知识点', trigger: 'change' }"
                                    label-width="60px"
                                    class="config-form-item knowledge-item"
                                >
                                  <el-select 
                                    v-model="entry.knowledgePoints" 
                                    multiple 
                                    collapse-tags
                                    tag-type="info"
                                    placeholder="选择知识点"
                                    size="small"
                                    :disabled="availableKnowledgePoints.length === 0"
                                    style="width: 170px;"
                                    @change="(newKps) => handleKnowledgePointChange(newKps, entry)"
                                  >
                                    <el-option 
                                       v-for="kp in availableKnowledgePoints" 
                                       :key="kp" 
                                       :label="kp" 
                                       :value="kp" 
                                    />
                                  </el-select>
                                </el-form-item>
                                <!-- Dynamic count inputs per selected KP -->
                                <div class="kp-count-inputs">
                                    <el-form-item
                                        v-for="kp in entry.knowledgePoints"
                                        :key="kp"
                                        :label="kp" 
                                        :prop="`typeConfigs.${index}.counts.${kp}`" 
                                        label-width="auto"
                                        class="config-form-item kp-count-item"
                                    >
                                         <el-input-number 
                                            v-model="entry.counts[kp]" 
                                            :min="1" 
                                            :max="50" 
                                            size="small" 
                                            controls-position="right" 
                                            style="width: 70px;" 
                                         />
                                     </el-form-item>
                                </div>
                                <!-- Display Total Count -->
                                <div class="config-card-total">
                                    总计: {{ typeTotalCounts[entry.id] || 0 }} 题
                                </div>
                            </div>
                        </div>
                    </el-card>
                     <span v-if="form.typeConfigs.length === 0" class="no-types-placeholder">
                         请先在上方"选择题型"中勾选需要的题型
                     </span>
                </div>
             </el-form-item>
          </template>

          <!-- File Upload Mode -->
          <template v-else-if="selectedData.source === 'upload'">
              <el-alert title="基于文件出题" type="info" :closable="false" show-icon>
                将根据上传的文件内容和难度分布要求生成题目。
              </el-alert>
          </template>
          
          <!-- Common settings -->
          <el-form-item label="题目语言" prop="lang">
            <el-select v-model="form.lang" placeholder="请选择题目语言">
              <el-option label="中文" value="中文" />
              <el-option label="英文" value="英文" />
              <el-option label="中英双语" value="中英双语" />
            </el-select>
          </el-form-item>
          <el-form-item label="包含解析" prop="explain">
            <el-switch v-model="form.explain" active-text="是" inactive-text="否" />
          </el-form-item>
          <el-form-item label="自定义要求">
            <el-input v-model="form.custom" type="textarea" :rows="2" placeholder="可填写特殊要求、出题风格等" />
          </el-form-item>
        </el-form>
      </el-card>

      <div class="button-group">
        <el-button type="primary" @click="handleGenerateQuestions">生成题目</el-button>
        <el-button type="success" @click="handlePreview">预览</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </template>

    <!-- 显示生成的题目 -->
    <GeneratedQuestionsDisplay 
      v-if="generatedQuestions" 
      :questions="generatedQuestions" 
    />

    <el-dialog v-model="previewVisible" title="智能出题预览" width="70%" destroy-on-close>
      <div class="preview-content">
        <h2>智能出题方案</h2>
        <el-descriptions :column="1" border>
          <template v-if="selectedData && selectedData.source === 'select'">
            <el-descriptions-item label="来源">多级选择</el-descriptions-item>
            <el-descriptions-item label="专业">{{ selectedData.data.major }}</el-descriptions-item>
            <el-descriptions-item label="课程">{{ selectedData.data.course }}</el-descriptions-item>
            <el-descriptions-item label="已选知识点">
              <el-tag v-for="(item, index) in selectedData.data.knowledgePoints" :key="index" size="small" style="margin-right: 5px;">
                {{ item }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="选择的出题模式">{{ selectedData.data.mode }}</el-descriptions-item>
          </template>
          <template v-else-if="selectedData">
            <el-descriptions-item label="来源">题库文件上传</el-descriptions-item>
            <el-descriptions-item label="题库文件">
              <span v-if="selectedData.data.fileList && selectedData.data.fileList.length">{{ selectedData.data.fileList[0]?.name || '未知文件名' }}</span>
              <pre v-else class="desc-pre">{{ selectedData.data.fileDesc || '无描述' }}</pre>
            </el-descriptions-item>
          </template>
          
          <el-descriptions-item label="难度分布">
            <DifficultyDistributionSlider :model-value="form.difficultyDistribution" style="pointer-events: none;" />
            <div style="font-size: 12px; margin-top: 5px; text-align: center;">
              极易: {{ form.difficultyDistribution[0] }}% | 
              简单: {{ form.difficultyDistribution[1] }}% | 
              中等: {{ form.difficultyDistribution[2] }}% | 
              困难: {{ form.difficultyDistribution[3] }}% | 
              极难: {{ form.difficultyDistribution[4] }}%
            </div>
          </el-descriptions-item>
          
          <!-- Type Config Details (Unified for select mode) -->
          <template v-if="selectedData && selectedData.source === 'select'">
             <el-descriptions-item label="题型配置详情">
                 <div v-if="form.typeConfigs && form.typeConfigs.length > 0" class="preview-allocation-list">
                    <div v-for="(entry, idx) in form.typeConfigs" :key="entry.id || idx" class="preview-allocation-item">
                       <el-tag type="primary" size="default" effect="dark">{{ entry.type || 'N/A' }}</el-tag>
                       <span style="margin: 0 5px;">|</span>
                       <span>知识点分配:</span>
                       <template v-if="entry.knowledgePoints && entry.knowledgePoints.length > 0 && entry.counts">
                           <div class="kp-count-preview-items">
                               <div v-for="kp in entry.knowledgePoints" :key="kp" class="kp-count-preview-item">
                                    <el-tag type="info" size="small" style="margin-right: 4px;">{{ kp }}</el-tag>
                                    <el-tag type="success" size="small">{{ entry.counts[kp] || 0 }}</el-tag>
                               </div>
                           </div>
                       </template>
                       <span v-else style="color: #909399;">未分配</span>
                    </div>
                 </div>
                 <span v-else>未配置题型</span>
             </el-descriptions-item>
          </template>
          
          <el-descriptions-item label="题目语言">{{ form.lang }}</el-descriptions-item>
          <el-descriptions-item label="包含解析">{{ form.explain ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="自定义要求"><pre class="desc-pre">{{ form.custom || '无' }}</pre></el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { MagicStick } from '@element-plus/icons-vue'
import type { FormInstance, FormItemRule } from 'element-plus'
import QuestionSelector from './QuestionSelector.vue'
import DifficultyDistributionSlider from './DifficultyDistributionSlider.vue'
import GeneratedQuestionsDisplay from './GeneratedQuestionsDisplay.vue'

// Interface for individual type configuration
interface TypeConfig {
  id: number; // Unique ID for v-for key and drag identification
  type: string; // The question type (e.g., '选择题')
  knowledgePoints: string[]; // KPs selected specifically for this type (v-model for select)
  counts: Record<string, number>; // Stores count per selected KP, e.g., { kp1: 5, kp2: 3 }
}

// Keep SelectorData interface
interface SelectorData {
  source: 'select' | 'upload';
  data: {
    major?: string;
    course?: string;
    knowledgePoints?: string[];
    mode?: string;
    fileList?: any[];
    fileDesc?: string;
  };
}

const typeList = [
  { label: '选择题', value: '选择题' },
  { label: '填空题', value: '填空题' },
  { label: '简答题', value: '简答题' },
  { label: '编程题', value: '编程题' },
  { label: '判断题', value: '判断题' },
  { label: '综合题', value: '综合题' },
  { label: '其他', value: '其他' }
]

const formRef = ref<FormInstance>()
const previewVisible = ref(false)
const exporting = ref(false)
const isAiFilling = ref(false)
const selectedData = ref<SelectorData | null>(null)
const showAiGeneratedIndicator = ref(false)
const generatedQuestions = ref<any[] | null>(null)

// --- Drag State ---
const draggedItemId = ref<number | null>(null);

// --- Form Data --- 
const form = ref({
  difficultyDistribution: [10, 20, 40, 20, 10],
  // Controls the checkboxes
  selectedTypesForCheckboxes: [] as string[], 
  // Holds the detailed configuration for each selected type
  typeConfigs: [] as TypeConfig[], 
  lang: '中文',
  explain: true,
  custom: ''
})

// --- Computed Properties ---
// Available KPs from the selector step
const availableKnowledgePoints = computed(() => {
    return selectedData.value?.source === 'select' 
           ? (selectedData.value.data.knowledgePoints || []) 
           : [];
});

// --- Computed property for total counts per type config ---
const typeTotalCounts = computed(() => {
    const totals: Record<number, number> = {};
    form.value.typeConfigs.forEach(config => {
        totals[config.id] = Object.values(config.counts || {}).reduce((sum, count) => sum + (count || 0), 0);
    });
    return totals;
});

// --- Watchers --- 
// Sync typeConfigs array based on selectedTypesForCheckboxes
watch(() => form.value.selectedTypesForCheckboxes, (newTypes, oldTypes) => {
    const addedTypes = newTypes.filter(t => !oldTypes?.includes(t));
    const removedTypes = oldTypes?.filter(t => !newTypes.includes(t)) || [];

    // Remove configurations for unchecked types
    if (removedTypes.length > 0) {
        form.value.typeConfigs = form.value.typeConfigs.filter(
            config => !removedTypes.includes(config.type)
        );
    }

    // Add new configurations for checked types
    for (const type of addedTypes) {
        // Avoid adding duplicates if logic somehow allows it
        if (!form.value.typeConfigs.some(config => config.type === type)) {
             form.value.typeConfigs.push({
                id: Date.now() + Math.random(), // More unique ID
                type: type,
                knowledgePoints: [], // Initialize selection array
                counts: {} // Initialize counts object
            });
        }
    }
    
    // Note: This doesn't preserve order if user unchecks then re-checks.
    // Order is now managed by drag-and-drop.

}, { deep: true });

// --- Validation Rules --- 
const rules = computed(() => {
    const baseRules: Record<string, FormItemRule[]> = {
        difficultyDistribution: [
            { required: true, message: '请设置难度分布', trigger: 'change' },
            { validator: (rule, value: number[], cb) => 
                (Math.abs(value.reduce((s, p) => s + (p || 0), 0) - 100) < 0.1) ? cb() : cb(new Error('难度比例总和必须为 100%')), 
              trigger: 'change' 
            }
        ],
        lang: [{ required: true, message: '请选择题目语言', trigger: 'change' }]
    };
    
    if (selectedData.value?.source === 'select') {
        // Rule for the checkbox group itself
        baseRules.selectedTypesForCheckboxes = [
            { type: 'array', required: true, min: 1, message: '请至少选择一种题型', trigger: 'change' }
        ];
        // Rule to validate the array of configurations
        baseRules.typeConfigs = [
            { type: 'array', required: true, message: '请配置所选题型', trigger: ['change','blur'] }, // Basic check
            { validator: (rule, value: TypeConfig[], cb) => {
                 if (!value || value.length === 0) return cb(); 
                 const selectedCheckboxTypes = form.value.selectedTypesForCheckboxes;
                 if(value.length !== selectedCheckboxTypes.length) {
                    // This mismatch could happen during transitions, maybe return early?
                    // Or just let individual validations catch it.
                 }
                 for (let i = 0; i < value.length; i++) {
                     const entry = value[i];
                     if (!entry.type) return cb(new Error(`配置项 ${i+1} 未指定类型`)); // Should not happen if synced
                     if (!entry.knowledgePoints || entry.knowledgePoints.length === 0) {
                         return cb(new Error(`请为题型 '${entry.type}' 选择知识点`));
                     }
                     // Validate counts for selected KPs
                     for (const kp of entry.knowledgePoints) {
                         if (!entry.counts || entry.counts[kp] === undefined || entry.counts[kp] <= 0) {
                             return cb(new Error(`请为题型 '${entry.type}' 的知识点 '${kp}' 输入有效的数量 (>0)`));
                         }
                     }
                 }
                 return cb();
             }, trigger: 'change' }
        ];
    }

    return baseRules;
});

// --- Methods --- 
const handleSelectorConfirm = (data: SelectorData) => {
  selectedData.value = data;
  // Reset type config related fields
  form.value.selectedTypesForCheckboxes = [];
  form.value.typeConfigs = []; 
  if (data.source === 'select') {
     // Set default checkboxes, watcher will create configs
     form.value.selectedTypesForCheckboxes = ['选择题', '填空题']; 
  }
  // Ensure counts are also reset if needed (e.g., if watcher doesn't handle removal perfectly)
  form.value.typeConfigs.forEach(config => {
      config.knowledgePoints = [];
      config.counts = {};
  });
  formRef.value?.clearValidate(); 
  showAiGeneratedIndicator.value = false;
}

const resetSelection = () => {
  selectedData.value = null;
  showAiGeneratedIndicator.value = false;
  handleReset(); 
}

// Drag and Drop Handlers
const handleDragStart = (event: DragEvent, item: TypeConfig) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', item.id.toString());
        event.dataTransfer.effectAllowed = 'move';
        draggedItemId.value = item.id; 
        const targetElement = event.target as HTMLElement;
        if (targetElement) {
             // Use closest card element if drag started on inner element
             const cardElement = targetElement.closest('.type-config-card');
             cardElement?.classList.add('dragging');
        }
    }
};

const handleDragOver = (event: DragEvent) => {
    event.preventDefault(); // Necessary to allow drop
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
    }
};

const handleDrop = (event: DragEvent, targetItem: TypeConfig) => {
    event.preventDefault();
    const sourceId = draggedItemId.value;
    const targetId = targetItem.id;
    
    if (sourceId === null || sourceId === targetId) {
        cleanupDragClasses();
        return; // No drop if same item or no source
    }

    const sourceIndex = form.value.typeConfigs.findIndex(item => item.id === sourceId);
    const targetIndex = form.value.typeConfigs.findIndex(item => item.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
        // Remove source item and insert at target position
        const [draggedItem] = form.value.typeConfigs.splice(sourceIndex, 1);
        form.value.typeConfigs.splice(targetIndex, 0, draggedItem);
    }
    draggedItemId.value = null; // Clear dragged item state
    cleanupDragClasses();
};

const handleDragEnd = (event: DragEvent) => {
    cleanupDragClasses();
};

const cleanupDragClasses = () => {
    draggedItemId.value = null;
    document.querySelectorAll('.type-config-card.dragging').forEach(el => el.classList.remove('dragging'));
};

// --- Interfaces ---

// Define the GenerationConfig type (Fixes Linter Error)
interface GenerationConfig {
    source: 'select' | 'upload';
    generationParams: typeof form.value;
    major?: string;
    course?: string;
    overallKnowledgePoints?: string[];
}

// Restore the MockQuestion interface definition
interface MockQuestion {
  id: number | string; // Allow string ID for generated ones
  type: string;
  knowledgePoint: string;
  stem: string;
  options?: string[];
  answer: string;
  analysis: string;
  difficulty?: number; // Optional: 1 (easy) to 5 (hard)
}

/* Comment out or remove the mockQuestionBank as it's no longer needed for generation logic
const mockQuestionBank: MockQuestion[] = [
// ... existing code ...
*/

// --- Generate Questions Navigation Handler ---
const handleGenerateQuestions = async () => {
  if (!formRef.value || !selectedData.value) {
      ElMessage.warning('请先完成所有配置步骤');
      return;
  }

  try {
    await formRef.value.validate();

    // Prepare configuration object (still useful even without navigation)
    const generationConfig: GenerationConfig = {
        source: selectedData.value.source,
        generationParams: { ...form.value },
        major: selectedData.value.data.major,
        course: selectedData.value.data.course,
        overallKnowledgePoints: selectedData.value.data.knowledgePoints,
    };

    console.log("准备生成题目，配置:", generationConfig);

    // --- New Logic to Generate Placeholder Questions --- 
    const generatedQuestionsList: MockQuestion[] = [];
    let questionIdCounter = 1; // Simple counter for unique IDs

    if (selectedData.value.source === 'select') {
        for (const config of form.value.typeConfigs) {
            const questionType = config.type;
            // Check if counts exist for the config
            if (config.counts) { 
                for (const kp in config.counts) {
                    // Check if kp is a valid key in counts
                    if (Object.prototype.hasOwnProperty.call(config.counts, kp)) {
                        const requiredCount = config.counts[kp] || 0; // Ensure count is a number
                        for (let i = 0; i < requiredCount; i++) {
                            const newQuestion: MockQuestion = {
                                id: `gen-${questionIdCounter++}`,
                                type: questionType,
                                knowledgePoint: kp, // Keep KP for display filtering
                                stem: `[${questionType}] 关于 "${kp}" 的题目 ${i + 1}`, 
                                // Add basic structure based on type (optional but good for display)
                                options: questionType === '选择题' ? ['选项A', '选项B', '选项C', '选项D'] : undefined,
                                answer: '示例答案',
                                analysis: '示例解析内容。',
                                difficulty: Math.floor(Math.random() * 5) + 1 // Assign random difficulty 1-5
                            };
                            generatedQuestionsList.push(newQuestion);
                        }
                    }
                }
            }
        }
    } else { // Handle 'upload' source
        console.log('基于文件上传，生成 5 个通用占位题目。');
        const typesForUpload = ['选择题', '填空题', '简答题', '判断题', '综合题'];
        for (let i = 0; i < 5; i++) {
            const randomType = typesForUpload[Math.floor(Math.random() * typesForUpload.length)];
            const newQuestion: MockQuestion = {
                 id: `upload-gen-${questionIdCounter++}`,
                 type: randomType,
                 knowledgePoint: '基于文件内容', // Generic KP for upload
                 stem: `[${randomType}] 基于上传文件的题目 ${i + 1}`,
                 options: randomType === '选择题' ? ['选项A', '选项B', '选项C'] : undefined,
                 answer: '示例答案',
                 analysis: '示例解析内容。',
                 difficulty: Math.floor(Math.random() * 3) + 2 // Medium difficulty for upload? (2-4)
             };
             generatedQuestionsList.push(newQuestion);
        }
    }

    // *** 更新状态以显示题目 ***
    generatedQuestions.value = generatedQuestionsList; // Assign the newly generated placeholder questions
    if (generatedQuestionsList.length > 0) {
         ElMessage.success('题目已生成');
    } else {
         ElMessage.warning('根据当前配置未能从题库中选取到题目');
    }


  } catch (e) {
    // Fix the console error message source
    console.error("表单校验失败或生成出错 (Question.vue):", e); 
    ElMessage.error('请填写/修正所有必填项后才能生成题目');
    generatedQuestions.value = null; // 出错时清空
  }
}

const handlePreview = async () => {
    if (!formRef.value) return;
    try {
      await formRef.value.validate()
      previewVisible.value = true
    } catch (e) {
        ElMessageBox.confirm(
          '表单信息校验未通过，部分预览内容可能不准确或缺失。是否继续查看预览？',
          '校验失败',
          {
            confirmButtonText: '继续预览',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).then(() => {
             previewVisible.value = true;
        }).catch(() => {
             ElMessage.info('已取消预览');
        });
    } 
}

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields(); 
  }
  form.value = {
    difficultyDistribution: [10, 20, 40, 20, 10], 
    selectedTypesForCheckboxes: [],
    typeConfigs: [], 
    lang: '中文',
    explain: true,
    custom: ''
  }
  // Need to manually clear counts if resetFields doesn't handle nested objects well
  form.value.typeConfigs = []; 
  showAiGeneratedIndicator.value = false;
}

const typeColorMap: Record<string, { background: string; border: string }> = {
  '选择题': { background: '#e9f7ff', border: '#b3e0ff' }, // Light Blue
  '填空题': { background: '#eefcee', border: '#bbf2bb' }, // Light Green
  '简答题': { background: '#fff8e6', border: '#ffecb3' }, // Light Orange
  '编程题': { background: '#ffeeee', border: '#ffcdd2' }, // Light Red
  '判断题': { background: '#f5f5f5', border: '#e0e0e0' }, // Light Gray
  '综合题': { background: '#e6f5e0', border: '#c8e6c9' }, // Different Light Green
  '其他':   { background: '#fafafa', border: '#eeeeee' }   // Off-white
};

const getCardStyle = (type: string): Record<string, string> => {
  const colors = typeColorMap[type] || typeColorMap['其他'];
  return {
    backgroundColor: colors.background,
    borderColor: colors.border // Also set border color for consistency
  };
};

const getCheckboxStyle = (type: string): Record<string, string> => {
  const colors = typeColorMap[type] || typeColorMap['其他'];
  // Using border color for better contrast usually
  return { 
    color: colors.border 
  };
};

// --- Handle KP Selection Change ---
const handleKnowledgePointChange = (selectedKps: string[], entry: TypeConfig) => {
    const currentKps = Object.keys(entry.counts);

    // Add new KPs with default count 1
    selectedKps.forEach(kp => {
        if (!entry.counts.hasOwnProperty(kp)) {
            entry.counts[kp] = 1; // Default count
        }
    });

    // Remove KPs that are no longer selected
    currentKps.forEach(kp => {
        if (!selectedKps.includes(kp)) {
            delete entry.counts[kp];
        }
    });
    
    // Also update the knowledgePoints array bound to the select's v-model
    entry.knowledgePoints = selectedKps; 
    
    // Trigger validation after changes
    nextTick(() => {
       formRef.value?.validateField(`typeConfigs`); 
    });
};

// --- Helper function for random distribution ---
const generateRandomDistribution = (numLevels = 5): number[] => {
  let total = 100;
  const distribution = new Array(numLevels).fill(0);
  for (let i = 0; i < numLevels - 1; i++) {
    const value = Math.floor(Math.random() * (total / (numLevels - i))) + 1; // Ensure at least 1
    distribution[i] = Math.min(total - (numLevels - 1 - i), value); // Ensure remaining can be at least 1
    total -= distribution[i];
  }
  distribution[numLevels - 1] = total; // Assign remaining to the last level
  // Simple shuffle to make it less predictable
  for (let i = distribution.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
    }
  return distribution;
};

// --- AI Generate Handler ---
const handleAiGenerate = async () => {
  if (!selectedData.value) {
    ElMessage.warning('请先完成上一步的选择');
    return;
  }

  // Simulate AI filling the form

  // 1. Difficulty Distribution
  form.value.difficultyDistribution = generateRandomDistribution();

  // 2. Types and Configs (only for 'select' source)
  if (selectedData.value.source === 'select') {
    const kps = availableKnowledgePoints.value;
    if (!kps || kps.length === 0) {
        ElMessage.warning('没有可用的知识点进行生成');
        return; // Or handle differently
    }

    // Select 2-4 random types (prioritize common ones)
    const commonTypes = ['选择题', '填空题', '简答题', '判断题'];
    const otherTypes = typeList.map(t => t.value).filter(t => !commonTypes.includes(t));
    let selectedTypes = [];
    // Aim for 4+ types: Select 2-4 common + 1-2 other
    const numCommon = Math.min(commonTypes.length, Math.floor(Math.random() * 3) + 2); // 2, 3 or 4 common
    const numOther = Math.min(otherTypes.length, Math.floor(Math.random() * 2) + 1); // 1 or 2 other
    
    // Get common types
    const shuffledCommon = [...commonTypes].sort(() => 0.5 - Math.random());
    selectedTypes.push(...shuffledCommon.slice(0, numCommon));
    
    // Get other types if needed and available
    if (numOther > 0 && otherTypes.length > 0) {
       const shuffledOther = [...otherTypes].sort(() => 0.5 - Math.random());
       selectedTypes.push(...shuffledOther.slice(0, numOther)); 
    }

    if (selectedTypes.length === 0) selectedTypes.push('选择题'); // Ensure at least one type

    form.value.selectedTypesForCheckboxes = selectedTypes;

    // Wait for watcher to update typeConfigs
    await nextTick();

    // Configure each selected type
    form.value.typeConfigs.forEach(config => {
      // Select 1 to all available KPs for this type
      // Aim for 3+ KPs
      const minKps = Math.min(kps.length, 3);
      const maxKps = kps.length;
      const numKpsToSelect = Math.floor(Math.random() * (maxKps - minKps + 1)) + minKps;
      const selectedKpsForType = [...kps].sort(() => 0.5 - Math.random()).slice(0, numKpsToSelect);

      config.knowledgePoints = selectedKpsForType; // Update the select model

      // Assign counts for selected KPs
      config.counts = {}; // Reset counts
      selectedKpsForType.forEach(kp => {
        config.counts[kp] = Math.floor(Math.random() * 5) + 1; // Assign count 1-5
      });
    });
  } else {
      // For upload mode, AI generation might be simpler or based on file analysis
      // For now, we just fill common fields.
       console.log("AI Generation for upload mode - simplified for now.");
  }

  // 3. Language
  const langs = ['中文', '英文', '中英双语'];
  form.value.lang = langs[Math.floor(Math.random() * langs.length)];

  // 4. Explanation
  form.value.explain = Math.random() > 0.3; // Higher chance of including explanation

  // 5. Custom Request
  const customRequests = [
    "请确保题目覆盖所选知识点，难度分布合理。",
    "题目需具有一定的区分度，避免过于简单或偏题。",
    "请注重考查学生对基本概念和原理的理解。",
    "可适当加入一些应用或拓展性题目。",
    "题干清晰，选项无歧义 (选择题)。"
  ];
  form.value.custom = selectedData.value.source === 'select' 
                       ? customRequests[Math.floor(Math.random() * customRequests.length)]
                       : "根据上传文档的核心内容生成对应习题。";

  ElMessage.success('内容已智能生成');
  showAiGeneratedIndicator.value = true;

  // Optional: Trigger validation after generation
  await nextTick();
  formRef.value?.validate(); 
};
</script>

<style scoped>
.questiongen-container {
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
.selected-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.knowledge-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 5px;
}
.mode-text {
  margin-left: 10px;
  font-weight: bold;
}
.type-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;
}
.type-count-item {
  display: flex;
  align-items: center;
  min-width: 180px;
  margin-bottom: 8px;
}

/* Add style for vertical alignment */
.difficulty-form-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center; /* Vertically center the content */
  margin-left: 0 !important; /* Override default margin if needed */
}

/* Optional: Adjust label alignment if needed */
.difficulty-form-item :deep(.el-form-item__label) {
   padding-top: 5px; /* Adjust based on slider height if needed */
   line-height: normal; /* Ensure label aligns well */
}

/* Reduce top margin of the slider component itself */
.difficulty-form-item .difficulty-slider-container {
  margin-top: -5px; /* Adjust this value to move the slider up */
}

.type-config-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 15px; /* Gap between cards */
    width: 100%;
    margin-top: 5px; 
    padding-top: 5px; /* Add padding if label is removed */
}

.type-config-card {
    border: 1px solid #dcdfe6;
    border-radius: 12px; /* More rounded */
    width: 300px; /* Fixed width - Increased */
    cursor: grab;
    transition: box-shadow 0.2s ease, opacity 0.2s ease, background-color 0.3s ease, border-color 0.3s ease; /* Added transitions */
}

.type-config-card.dragging {
    opacity: 0.5;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
/* Placeholder for drop target (optional) */
.type-config-card.drag-over {
    border: 1px dashed #409eff;
}

.type-config-card :deep(.el-card__body) {
    padding: 0; /* Remove default padding */
}

.config-card-content {
   padding: 12px 15px; /* Add padding inside */
}

.config-card-header {
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    padding-bottom: 8px;
}

.config-card-body {
    display: flex;
    flex-direction: column; /* Stack KP and count vertically */
    gap: 10px; /* Gap between KP row and count row */
    margin-top: 8px; /* Add some space below the select */
}

.config-form-item {
    margin-bottom: 0 !important; /* Remove default margin */
    display: flex;
    align-items: center; /* Center label and control vertically */
}

/* Align label and control in knowledge item */
.knowledge-item :deep(.el-form-item__content) {
    flex-grow: 1; /* Allow select to take remaining space */
    margin-left: 8px; /* Add space between label and select */
}

/* Ensure label doesn't wrap unexpectedly */
.knowledge-item :deep(.el-form-item__label) {
    white-space: nowrap; /* Prevent label text from wrapping */
    flex-shrink: 0; /* Prevent label from shrinking */
}

.count-item {
   justify-content: flex-start; /* Align count items left */
}

.no-types-placeholder {
    color: #909399;
    font-size: 13px;
    width: 100%;
    text-align: center;
    padding: 20px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
}

.preview-allocation-list { /* Reuse allocation styles */
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.preview-allocation-item { /* Reuse allocation styles */
    display: flex;
    align-items: center;
    flex-wrap: wrap; 
    gap: 4px 8px; 
    padding: 5px 0;
    border-bottom: 1px dashed #eee;
    align-items: flex-start; /* Align items at the start for multi-line kp counts */
}
.preview-allocation-item:last-child {
    border-bottom: none;
}

/* Optional: Adjust Checkbox Group Spacing */
.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px; 
}

.kp-count-inputs {
    display: grid; /* Use Grid layout */
    grid-template-columns: auto auto; /* Both columns size to content */
    gap: 8px 90px; /* Row gap and Even Further Increased Column gap */
    align-items: center; /* Vertically center items in each row */
    padding-left: 5px; /* Adjust indentation if needed */
    justify-content: center; /* Center the grid columns horizontally */
}

.kp-count-item {
    /* Styles for individual KP count item row */
    display: contents; /* Make the form item part of the grid layout */
}

.kp-count-item :deep(.el-form-item__label) {
    /* Style the KP label */
    text-align: center; /* Center text within the label cell */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal; /* Allow wrapping if needed, though centering might handle it */
    padding-right: 8px; /* Space between label and input */
    color: #606266; /* Standard label color */
    font-size: 13px; 
    justify-self: center; /* Horizontally center the label cell content */
    /* Use flexbox to center text vertically within the label element */
    display: flex;
    align-items: center; /* Vertically center flex items (the text) */
    justify-content: center; /* Horizontally center flex items */
    text-align: center; /* Fallback/reinforce horizontal centering */
}

.kp-count-item :deep(.el-form-item__content) {
    /* Ensure content (input) doesn't grow unnecessarily */
    margin-left: 0 !important; /* Override potential default margins */
    justify-self: center; /* Horizontally center the input cell content */
    align-self: center; /* Vertically center the input cell content */
}

.config-card-total {
    text-align: right;
    font-size: 13px;
    font-weight: bold;
    color: #606266;
    margin-top: 10px; /* Add some space above */
    padding-top: 8px; /* Add padding above */
    border-top: 1px solid #eee; /* Separator line */
}

.kp-count-preview-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-left: 8px; /* Indent */
}
.kp-count-preview-item {
    display: flex;
    align-items: center;
}

/* Style checked checkboxes based on typeColorMap */
.el-checkbox:has(input[value="选择题"]:checked) :deep(.el-checkbox__label) { color: #b3e0ff; }
.el-checkbox:has(input[value="填空题"]:checked) :deep(.el-checkbox__label) { color: #bbf2bb; }
.el-checkbox:has(input[value="简答题"]:checked) :deep(.el-checkbox__label) { color: #ffecb3; }
.el-checkbox:has(input[value="编程题"]:checked) :deep(.el-checkbox__label) { color: #ffcdd2; }
.el-checkbox:has(input[value="判断题"]:checked) :deep(.el-checkbox__label) { color: #e0e0e0; }
.el-checkbox:has(input[value="综合题"]:checked) :deep(.el-checkbox__label) { color: #c8e6c9; }
.el-checkbox:has(input[value="其他"]:checked) :deep(.el-checkbox__label) { color: #eeeeee; }

/* Styles for the AI fill button (copied from Graphic.vue) */
.auto-fill-btn {
  background: linear-gradient(45deg, #409eff, #67c23a);
  border: none;
  color: white !important; /* Ensure text is white, override link style */
  font-weight: 500;
  transition: all 0.3s ease;
  margin-left: 16px;
  padding: 6px 10px; /* Adjust padding if needed */
  border-radius: 4px; /* Add border radius */
  text-decoration: none !important; /* Override link underline */
  display: inline-flex; /* Ensure icon and text align */
  align-items: center; /* Align icon and text vertically */
}

.auto-fill-btn:hover:not(.is-disabled) { /* Add :not(.is-disabled) */
  transform: translateY(-1px); /* Smaller lift */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Softer shadow */
  background: linear-gradient(45deg, #67c23a, #409eff);
  color: white !important;
}

.auto-fill-btn .el-icon {
  margin-right: 4px;
  font-size: 14px; /* Slightly smaller icon */
}

/* Style for the AI indicator tag */
.ai-indicator-tag {
  margin-left: 8px;
  vertical-align: middle; /* Align tag with text */
  height: auto; /* Allow height to adjust */
  padding: 2px 6px; /* Adjust padding */
  line-height: normal; /* Ensure text is centered */
}
</style>
