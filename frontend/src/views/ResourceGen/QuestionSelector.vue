<template>
  <div class="question-selector">
    <el-card class="box-card" :body-style="{ opacity: isConfirmed ? 0.7 : 1 }">
      <template #header>
        <div class="card-header">
          <span>{{ isConfirmed ? '已选条件' : '题库及出题方式选择' }}</span>
          <el-button v-if="isConfirmed" type="primary" link @click="resetSelection">重新选择</el-button>
        </div>
      </template>

      <el-radio-group v-model="selectionMethod" style="margin-bottom: 20px;" :disabled="isConfirmed">
        <el-radio-button label="select">多级选择</el-radio-button>
        <el-radio-button label="upload">上传题库文件</el-radio-button>
      </el-radio-group>

      <!-- 多级选择流程 -->
      <template v-if="selectionMethod === 'select'">
        <el-steps :active="isConfirmed ? 4 : currentStep" finish-status="success" simple style="margin-bottom: 20px">
          <el-step title="选择专业" />
          <el-step title="选择课程" />
          <el-step title="选择知识点" />
          <el-step title="选择出题模式" />
        </el-steps>

        <el-form :model="selectorForm" :rules="rules" ref="formRef" label-width="100px">
          <!-- Step 1: Major -->
          <div v-show="currentStep === 0">
            <el-form-item label="专业" prop="major">
              <el-select v-model="selectorForm.major" placeholder="请选择专业" filterable @change="handleMajorChange" :disabled="isConfirmed">
                <el-option v-for="item in majorOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </div>

          <!-- Step 2: Course -->
          <div v-show="currentStep === 1">
            <el-form-item label="课程" prop="course">
              <el-select v-model="selectorForm.course" placeholder="请选择课程" filterable :disabled="isConfirmed || !selectorForm.major" @change="handleCourseChange">
                <el-option v-for="item in courseOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </div>

          <!-- Step 3: Knowledge Points -->
          <div v-show="currentStep === 2">
            <el-form-item label="知识点" prop="knowledgePoints">
              <el-select v-model="selectorForm.knowledgePoints" placeholder="请选择知识点(可多选)" filterable multiple :disabled="isConfirmed || !selectorForm.course">
                <el-option v-for="item in knowledgeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </div>

          <!-- Step 4: Mode -->
          <div v-show="currentStep === 3">
            <el-form-item label="出题模式" prop="mode">
              <el-radio-group v-model="selectorForm.mode" :disabled="isConfirmed">
                <el-radio label="作业">作业</el-radio>
                <el-radio label="组卷">组卷</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </el-form>

        <div class="button-wrapper" v-if="!isConfirmed">
          <el-button @click="prevStep" :disabled="currentStep === 0">上一步</el-button>
          <el-button type="primary" @click="nextStep" v-if="currentStep < 3">下一步</el-button>
          <el-button type="primary" @click="handleConfirm" v-if="currentStep === 3">确认选择</el-button>
        </div>
      </template>

      <!-- 上传题库文件流程 -->
      <template v-if="selectionMethod === 'upload'">
        <el-form :model="selectorForm" ref="uploadFormRef" label-width="100px">
          <el-form-item label="题库文件">
            <el-upload
              class="upload-demo"
              :auto-upload="false"
              :show-file-list="true"
              :on-change="handleFileChange"
              :limit="1"
              :on-exceed="handleFileExceed"
              accept=".xlsx,.csv,.txt,.doc,.docx,.pdf"
              :disabled="isConfirmed"
            >
              <el-button size="small" type="primary" :disabled="isConfirmed">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持.xlsx, .csv, .txt, .doc, .docx, .pdf格式文件，仅限上传1个文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <el-form-item label="文件描述">
            <el-input
              v-model="selectorForm.fileDesc"
              type="textarea"
              :rows="2"
              placeholder="请输入题库描述文本 (上传文件或描述至少填一项)"
              :disabled="isConfirmed"
            />
          </el-form-item>
          <div class="button-wrapper" v-if="!isConfirmed">
            <el-button type="primary" @click="handleConfirm">确认上传信息</el-button>
          </div>
        </el-form>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormItemRule, UploadFile, UploadFiles } from 'element-plus'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['confirm', 'reset'])

const formRef = ref<FormInstance>()
const uploadFormRef = ref<FormInstance>()
const currentStep = ref(0)
const selectionMethod = ref('select') // 'select' or 'upload'
const isConfirmed = ref(false) // New state to track confirmation

// 数据定义
const majorOptions = [
  '计算机科学与技术',
  '软件工程',
  '数据科学与大数据技术',
  '人工智能',
  '网络工程',
  '信息安全',
  '物联网工程',
  '电子信息工程',
  '通信工程'
]

// 课程映射表
const courseMappings: Record<string, string[]> = {
  '计算机科学与技术': [
    '数据结构与算法',
    '计算机组成原理',
    '操作系统',
    '计算机网络',
    '数据库系统',
    '编译原理',
    '软件工程'
  ],
  '软件工程': [
    '软件工程导论',
    'Web开发技术',
    '软件测试',
    '软件项目管理',
    '需求工程',
    '软件架构',
    'DevOps实践'
  ],
  '数据科学与大数据技术': [
    '数据挖掘',
    '机器学习',
    '大数据处理技术',
    '数据可视化',
    '分布式计算',
    '云计算',
    'Hadoop生态系统'
  ],
  '人工智能': [
    '人工智能导论',
    '机器学习',
    '深度学习',
    '自然语言处理',
    '计算机视觉',
    '知识图谱',
    '强化学习'
  ],
  '网络工程': [
    '网络协议',
    '路由与交换',
    '网络安全',
    '网络规划与设计',
    '无线网络',
    '5G技术',
    '网络编程'
  ],
  '信息安全': [
    '密码学',
    '网络安全',
    '系统安全',
    '安全协议',
    '渗透测试',
    '安全编程',
    '数字取证'
  ],
  '物联网工程': [
    '传感器技术',
    '嵌入式系统',
    '无线通信',
    '物联网协议',
    '边缘计算',
    'RFID技术',
    '物联网安全'
  ]
}

// 知识点映射表 (更新机器学习部分)
const knowledgeMappings: Record<string, string[]> = {
  '数据结构与算法': ['数组', '链表', '栈', '队列', '树', '图', '排序算法', '查找算法', '动态规划', '贪心算法'],
  '计算机网络': ['TCP/IP协议', 'HTTP协议', '网络安全', '路由算法', '网络拓扑', 'DNS', '子网划分', '网络编程'],
  '操作系统': ['进程管理', '内存管理', '文件系统', '设备管理', '调度算法', '死锁', '并发控制', '虚拟化'],
  '数据库系统': ['SQL语言', '关系代数', '数据库设计', '事务', '索引', '范式', '并发控制', '恢复技术'],
  '机器学习': [
    '线性回归',
    '逻辑回归',
    '支持向量机 (SVM)',
    '决策树',
    '随机森林',
    '神经网络',
    '深度学习',
    '聚类 (K-Means)',
    '降维 (PCA)',
    '梯度下降',
    '损失函数',
    '过拟合与欠拟合',
    '正则化 (L1/L2)',
    '交叉验证',
    '模型评估指标',
    '特征工程',
    '监督学习',
    '无监督学习',
    '强化学习'
  ],
  '深度学习': ['神经网络基础', 'CNN', 'RNN', 'Transformer', '优化算法', '迁移学习', '对抗学习', '模型压缩'],
  '人工智能导论': ['搜索算法', '知识表示', '专家系统', '不确定性推理', '规划', '机器学习', '神经网络', '自然语言处理'],
  '编译原理': ['词法分析', '语法分析', '语义分析', '中间代码生成', '代码优化', '目标代码生成', '运行时环境']
}

const courseOptions = ref<string[]>([])
const knowledgeOptions = ref<string[]>([])

const selectorForm = reactive({
  major: '',
  course: '',
  knowledgePoints: [] as string[],
  mode: '作业',
  fileList: [] as UploadFile[],
  fileDesc: ''
})

const rules = computed(() => {
  const currentRules: Record<string, FormItemRule[]> = {}
  if (selectionMethod.value === 'select' && !isConfirmed.value) { // Only apply rules before confirmation
    if (currentStep.value >= 0) {
      currentRules.major = [{ required: true, message: '请选择专业', trigger: 'change' }]
    }
    if (currentStep.value >= 1) {
      currentRules.course = [{ required: true, message: '请选择课程', trigger: 'change' }]
    }
    if (currentStep.value >= 2) {
      currentRules.knowledgePoints = [{ required: true, type: 'array', min: 1, message: '请选择至少一个知识点', trigger: 'change' }]
    }
    if (currentStep.value >= 3) {
      currentRules.mode = [{ required: true, message: '请选择出题模式', trigger: 'change' }]
    }
  }
  // upload 模式不需要这里的 rules (unless adding required file/desc validation)
  return currentRules
})

watch(selectionMethod, (newVal) => {
  if (isConfirmed.value) return; // Don't reset if already confirmed
  resetForm(newVal);
  currentStep.value = 0; // 重置步骤
});

const resetForm = (method: string) => {
  selectorForm.major = '';
  selectorForm.course = '';
  selectorForm.knowledgePoints = [];
  selectorForm.mode = '作业';
  selectorForm.fileList = [];
  selectorForm.fileDesc = '';
  isConfirmed.value = false; // Reset confirmation state
  currentStep.value = 0; // Reset step
  // 清除校验状态
  if (method === 'select' && formRef.value) {
    formRef.value.clearValidate();
  } else if (method === 'upload' && uploadFormRef.value) {
    uploadFormRef.value.clearValidate();
  }
}

const resetSelection = () => {
  resetForm(selectionMethod.value);
  emit('reset'); // Notify parent to reset its state
}

const handleMajorChange = () => {
  if (isConfirmed.value) return;
  selectorForm.course = ''
  selectorForm.knowledgePoints = []
  courseOptions.value = courseMappings[selectorForm.major] || []
  knowledgeOptions.value = []
  if (currentStep.value > 0 && formRef.value) {
    formRef.value.clearValidate(['course', 'knowledgePoints', 'mode']);
  }
}

const handleCourseChange = () => {
  if (isConfirmed.value) return;
  selectorForm.knowledgePoints = []
  knowledgeOptions.value = knowledgeMappings[selectorForm.course] || []
  if (currentStep.value > 1 && formRef.value) {
     formRef.value.clearValidate(['knowledgePoints', 'mode']);
  }
}

const handleFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  if (isConfirmed.value) return;
  selectorForm.fileList = uploadFiles;
}

const handleFileExceed = () => {
  if (isConfirmed.value) return;
  ElMessage.warning('只能上传一个文件，请先移除已有文件再上传');
}

const nextStep = async () => {
  if (isConfirmed.value || !formRef.value) return;
  let fieldsToValidate: string[] = [];
  if (currentStep.value === 0) fieldsToValidate = ['major'];
  else if (currentStep.value === 1) fieldsToValidate = ['course'];
  else if (currentStep.value === 2) fieldsToValidate = ['knowledgePoints'];
  
  try {
    await formRef.value.validateField(fieldsToValidate);
    if (currentStep.value < 3) {
      currentStep.value++;
    }
  } catch (error) {
    console.log('Validation failed:', error);
    // Error messages are handled by form item validation
  }
}

const prevStep = () => {
  if (isConfirmed.value || currentStep.value <= 0) return;
  currentStep.value--;
}

const handleConfirm = async () => {
  if (isConfirmed.value) return; 

  if (selectionMethod.value === 'select') {
    if (!formRef.value) return;
    try {
      // Validate final step fields if currentStep is 3
      if (currentStep.value === 3) {
          await formRef.value.validateField(['mode']);
      } else {
          // This case ideally shouldn't happen if button logic is correct
          // but validate all just in case
           await formRef.value.validate(); 
      }
      
      const payload = {
        source: 'select',
        data: {
          major: selectorForm.major,
          course: selectorForm.course,
          knowledgePoints: selectorForm.knowledgePoints,
          mode: selectorForm.mode
        }
      };
      // Set confirmed BEFORE emitting may prevent UI flicker
      isConfirmed.value = true; 
      // No need to manually set currentStep = 4, the :active binding handles it
      emit('confirm', payload);
      ElMessage.success('选择确认成功');
    } catch (error) {
      console.error("Validation failed on confirm:", error)
      ElMessage.error('请完成当前步骤的必填项');
    }
  } else { // upload
    if (selectorForm.fileList.length === 0 && !selectorForm.fileDesc) {
      ElMessage.error('请上传文件或输入题库描述');
      return;
    }
    const payload = {
      source: 'upload',
      data: {
        // Ensure fileList contains the raw file object if available
        fileList: selectorForm.fileList.map(f => f.raw || f),
        fileDesc: selectorForm.fileDesc
      }
    };
    isConfirmed.value = true; // Set confirmed state
    emit('confirm', payload);
    ElMessage.success('上传信息确认成功');
  }
}
</script>

<style scoped>
.question-selector {
  margin-bottom: 20px;
}
.box-card {
  margin-bottom: 20px;
  transition: opacity 0.3s ease;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.button-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
.el-upload__tip {
  line-height: 1.2;
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}
.upload-demo :deep(.el-upload-list__item:first-child) {
    margin-top: 0;
}
/* Style adjustments for confirmed state */
:deep(.el-select.is-disabled .el-input__inner),
:deep(.el-input.is-disabled .el-input__inner),
:deep(.el-textarea.is-disabled .el-textarea__inner),
:deep(.el-radio-button.is-disabled .el-radio-button__inner),
:deep(.el-upload.is-disabled) {
  cursor: not-allowed;
  background-color: #f5f7fa; /* Lighter grey background */
}

</style> 