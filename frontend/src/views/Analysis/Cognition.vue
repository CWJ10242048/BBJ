<template>
  <div class="cognition-container">
    <h2>认知诊断</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据说明与诊断</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="学生答题数据" prop="studentDataOrigin">
           <el-radio-group v-model="form.studentDataOrigin">
             <el-radio label="select">选择记录</el-radio>
             <el-radio label="upload">上传文件</el-radio>
           </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.studentDataOrigin === 'select'" label="选择答题记录" prop="selectedStudentRecord">
           <!-- 这里暂时使用模拟数据，后续可以替换为从API获取 -->
           <el-select v-model="form.selectedStudentRecord" placeholder="请选择历史答题记录">
              <el-option label="软件工程2201班 期末考试" value="swe_2201_final"></el-option>
              <el-option label="计算机科学2202班 平时作业1" value="cs_2202_hw1"></el-option>
              <el-option label="网络工程2201班 单元测试2" value="ne_2201_unit2"></el-option>
           </el-select>
        </el-form-item>

        <el-form-item v-else label="上传学生文件" prop="studentFileList">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            v-model:file-list="form.studentFileList"
            accept=".xlsx,.csv"
          >
            <el-button size="small" type="primary">选择学生数据文件</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="诊断说明">
          <el-input v-model="form.desc" type="textarea" :rows="2" placeholder="可填写诊断目的、数据来源、格式说明等" />
        </el-form-item>
      </el-form>
      <div style="text-align:center;margin-top:16px;">
        <el-button type="primary" :loading="analyzing" :disabled="analyzing" @click="handleAnalyze">
          {{ analyzing ? '正在认知诊断...' : '开始认知诊断' }}
        </el-button>
      </div>
    </el-card>

    <!-- 结果展示区域 -->
    <div v-if="analysis.time" class="results-section">
      <h2>认知诊断分析结果</h2>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="诊断时间">{{ analysis.time }}</el-descriptions-item>
        <el-descriptions-item label="诊断模型">{{ analysis.model }}</el-descriptions-item>
        <el-descriptions-item label="诊断结论" :span="2">
          <pre class="desc-pre">{{ analysis.conclusion }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="诊断说明" :span="2">
          <pre class="desc-pre">{{ form.desc }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="学生数据" :span="2">
          <span v-if="form.studentDataOrigin === 'upload'">{{ form.studentFileList.length ? '已上传文件' : '未上传文件' }}</span>
          <span v-else>{{ form.selectedStudentRecord ? `已选择记录: ${getRecordLabel(form.selectedStudentRecord)}` : '未选择记录' }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <div class="chart-row">
        <div class="chart-block">
          <h3>学生能力分布</h3>
          <div ref="abilityChartRef" class="chart-box"></div>
        </div>
        <div class="chart-block">
          <h3>学生能力雷达图</h3>
          <div ref="radarChartRef" class="chart-box"></div>
        </div>
      </div>
      <div class="chart-row">
        <div class="chart-block">
          <h3>知识点掌握热力图</h3>
          <div ref="heatmapChartRef" class="chart-box heatmap-chart-box"></div>
        </div>
        <div class="chart-block">
          <h3>薄弱知识点</h3>
          <el-table :data="analysis.weakPoints" border size="small" style="width:100%">
            <el-table-column prop="knowledge" label="知识点" min-width="120" />
            <el-table-column prop="question" label="题目" min-width="180" />
            <el-table-column prop="mastery" label="掌握率(%)" width="180">
              <template #default="scope">
                <el-progress :percentage="scope.row.mastery" :stroke-width="16" color="#67C23A" :show-text="true" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="chart-row">
        <div class="chart-block">
          <h3>学生能力分层</h3>
          <el-table :data="analysis.levels" border size="small" style="width:100%;margin-bottom:0;">
            <el-table-column prop="level" label="能力层级" width="120" />
            <el-table-column prop="count" label="学生人数" width="120" />
            <el-table-column prop="desc" label="层级描述" />
          </el-table>
        </div>
        <div class="chart-block">
          <h3>知识点掌握分布</h3>
          <div ref="pieChartRef" class="chart-box"></div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div v-if="analysis.time" class="button-group" style="margin-top: 20px;">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="warning" @click="handleExport">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, UploadUserFile } from 'element-plus'
import * as echarts from 'echarts'

// 定义数据结构类型
interface NameValue {
  name: string;
  value: number;
}

interface HeatmapData {
  x: string[];
  y: string[];
  data: number[][];
}

interface RadarIndicator {
  name: string;
  max: number;
}

interface RadarData {
  indicators: RadarIndicator[];
  values: number[];
}

interface WeakPoint {
  knowledge: string;
  mastery: number;
  question: string;
}

interface Level {
  level: string;
  count: number;
  desc: string;
}

interface AnalysisData {
  time: string;
  model: string;
  conclusion: string;
  abilityDist: NameValue[];
  heatmap: HeatmapData;
  radar: RadarData;
  weakPoints: WeakPoint[];
  levels: Level[];
  pie: NameValue[];
}

// 定义表单状态类型
interface FormState {
  studentDataOrigin: 'upload' | 'select';
  studentFileList: UploadUserFile[]; // 使用 Element Plus 的类型
  selectedStudentRecord: string; // 明确为字符串，初始为空字符串
  questionFileList: UploadUserFile[];
  desc: string;
}

const formRef = ref()
const analyzing = ref(false)
const abilityChartRef = ref<HTMLDivElement | null>(null)
const heatmapChartRef = ref<HTMLDivElement | null>(null)
const radarChartRef = ref<HTMLDivElement | null>(null)
const pieChartRef = ref<HTMLDivElement | null>(null)

// 使用类型初始化表单
const form = ref<FormState>({
  studentDataOrigin: 'select', // 默认选择记录
  studentFileList: [],
  selectedStudentRecord: '', // 初始为空字符串
  questionFileList: [],
  desc: ''
})
const rules = {}

// 使用类型初始化分析结果
const analysis = reactive<AnalysisData>({
  time: '',
  model: '',
  conclusion: '',
  abilityDist: [],
  heatmap: { x: [], y: [], data: [] },
  radar: { indicators: [], values: [] },
  weakPoints: [],
  levels: [],
  pie: []
})

const handleAnalyze = async () => {
  // 更新校验逻辑
  if (
    (form.value.studentDataOrigin === 'upload' && form.value.studentFileList.length === 0) ||
    (form.value.studentDataOrigin === 'select' && form.value.selectedStudentRecord === '')
  ) {
    ElMessage.error('请上传学生数据文件或选择有效的答题记录')
    return
  }

  analyzing.value = true
  setTimeout(async () => {
    analyzing.value = false
    // 模拟认知诊断结果
    const now = new Date()
    analysis.time = now.toLocaleString()
    analysis.model = 'DINA模型'
    analysis.conclusion = '大部分学生在"神经网络""支持向量机"等知识点掌握较弱，整体能力分布呈正态，建议针对薄弱知识点进行专项训练。'
    // 能力分布
    analysis.abilityDist = [
      { name: '40-49', value: 2 },
      { name: '50-59', value: 5 },
      { name: '60-69', value: 8 },
      { name: '70-79', value: 10 },
      { name: '80-89', value: 7 },
      { name: '90-100', value: 3 }
    ]
    // 热力图
    analysis.heatmap = {
      x: ['线性回归', '逻辑回归', '决策树', '支持向量机', '神经网络'],
      y: ['张宇轩', '李佳悦', '王诗涵', '赵梓萱', '刘逸凡', '陈静怡', '杨子墨', '黄雨桐', '吴梦琪', '郑晨曦'],
      data: Array.from({ length: 10 }, (_, i) => Array.from({ length: 5 }, () => Math.round(Math.random() * 100)))
    }
    // 雷达图
    analysis.radar = {
      indicators: [
        { name: '线性回归', max: 100 },
        { name: '逻辑回归', max: 100 },
        { name: '决策树', max: 100 },
        { name: '支持向量机', max: 100 },
        { name: '神经网络', max: 100 }
      ],
      values: [80, 70, 65, 60, 55]
    }
    // 薄弱知识点
    analysis.weakPoints = [
      { knowledge: '神经网络', mastery: 55, question: '请简述反向传播算法的基本原理。' },
      { knowledge: '支持向量机', mastery: 60, question: '什么是核函数？请举例说明其作用。' },
      { knowledge: '逻辑回归', mastery: 62, question: '逻辑回归模型的损失函数是什么？' },
      { knowledge: '集成学习', mastery: 65, question: '简述Bagging和Boosting的区别。' },
      { knowledge: '降维', mastery: 68, question: '主成分分析（PCA）主要解决什么问题？' },
      { knowledge: '聚类', mastery: 70, question: 'K-means聚类算法的核心步骤有哪些？' }
    ]
    // 能力分层
    analysis.levels = [
      { level: 'A', count: 3, desc: '能力突出，知识点掌握全面' },
      { level: 'B', count: 7, desc: '能力较好，部分知识点有待提升' },
      { level: 'C', count: 12, desc: '能力一般，存在明显薄弱环节' },
      { level: 'D', count: 8, desc: '能力较弱，需重点辅导' }
    ]
    // 知识点掌握分布（饼图）
    analysis.pie = [
      { name: '线性回归', value: 80 },
      { name: '逻辑回归', value: 70 },
      { name: '决策树', value: 65 },
      { name: '支持向量机', value: 60 },
      { name: '神经网络', value: 55 }
    ]
    await nextTick()
    renderCharts()
    ElMessage.success('诊断完成')
  }, 1000) // 缩短等待时间
}

function renderCharts() {
  // 能力分布柱状图
  if (abilityChartRef.value) {
    const chart = echarts.init(abilityChartRef.value)
    chart.setOption({
      tooltip: {},
      xAxis: { type: 'category', data: analysis.abilityDist.map(i => i.name) },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: analysis.abilityDist.map(i => i.value),
        itemStyle: { color: '#409EFF' }
      }]
    })
  }
  // 知识点掌握热力图
  if (heatmapChartRef.value) {
    const chart = echarts.init(heatmapChartRef.value)
    chart.setOption({
      tooltip: { position: 'top' },
      grid: { left: 60, right: 20, bottom: 60, top: 30 },
      xAxis: { type: 'category', data: analysis.heatmap.x, splitArea: { show: true } },
      yAxis: { type: 'category', data: analysis.heatmap.y, splitArea: { show: true } },
      visualMap: {
        min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 0
      },
      series: [{
        name: '掌握度',
        type: 'heatmap',
        data: analysis.heatmap.data.flatMap((row, i) => row.map((v, j) => [j, i, v])),
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
      }]
    })
  }
  // 能力雷达图
  if (radarChartRef.value) {
    const chart = echarts.init(radarChartRef.value)
    chart.setOption({
      tooltip: {},
      radar: { indicator: analysis.radar.indicators },
      series: [{
        type: 'radar',
        data: [{ value: analysis.radar.values, name: '平均能力' }],
        areaStyle: { opacity: 0.2 },
        lineStyle: { color: '#67C23A' },
        itemStyle: { color: '#67C23A' }
      }]
    })
  }
  // 知识点掌握分布饼图
  if (pieChartRef.value) {
    const chart = echarts.init(pieChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom' },
      series: [
        {
          name: '知识点掌握分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, position: 'outside', formatter: '{b}: {d}%' },
          data: analysis.pie
        }
      ]
    })
  }
}

const handleSave = async () => {
  ElMessage.success('保存成功')
}
const handleExport = () => {
  ElMessage.success('导出成功')
}
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  // 重置表单为初始状态
  form.value = {
    studentDataOrigin: 'select',
    studentFileList: [],
    selectedStudentRecord: '',
    questionFileList: [],
    desc: ''
  }
  // 重置分析结果
  Object.assign(analysis, {
    time: '',
    model: '',
    conclusion: '',
    abilityDist: [],
    heatmap: { x: [], y: [], data: [] },
    radar: { indicators: [], values: [] },
    weakPoints: [],
    levels: [],
    pie: []
  })
  // 清空图表
  // (可选：根据需要决定是否需要清空图表实例)
}

function getRecordLabel(record: string): string {
  switch (record) {
    case 'swe_2201_final':
      return '软件工程2201班 期末考试'
    case 'cs_2202_hw1':
      return '计算机科学2202班 平时作业1'
    case 'ne_2201_unit2':
      return '网络工程2201班 单元测试2'
    default:
      return '未知记录'
  }
}
</script>

<style scoped>
.cognition-container {
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
.results-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
}
.results-section h2 {
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
.chart-row {
  display: flex;
  gap: 32px;
  margin: 32px 0 0 0;
}
.chart-block {
  flex: 1;
  min-width: 320px;
}
.chart-box {
  width: 100%;
  height: 260px; /* 确保高度一致 */
  background: #f7f8fa;
  border-radius: 8px;
}
.heatmap-chart-box {
  height: 360px; /* 增加热力图高度 */
}
</style>
