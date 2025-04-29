<template>
  <div class="cognition-container">
    <h2>认知诊断</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据上传与说明</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="学生答题数据">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            v-model:file-list="form.studentFileList"
            accept=".xlsx,.csv"
          >
            <el-button size="small" type="primary">上传学生数据</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="题目信息文件">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            v-model:file-list="form.questionFileList"
            accept=".xlsx,.csv,.doc,.docx,.pdf"
          >
            <el-button size="small" type="primary">上传题目信息</el-button>
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

    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" @click="handleExport">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-dialog v-model="previewVisible" title="认知诊断结果预览" width="80%" destroy-on-close @opened="onDialogOpened">
      <div class="preview-content">
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
          <el-descriptions-item label="学生数据文件">
            <span v-if="form.studentFileList.length">已上传文件</span>
            <span v-else>未上传</span>
          </el-descriptions-item>
          <el-descriptions-item label="题目信息文件">
            <span v-if="form.questionFileList.length">已上传文件</span>
            <span v-else>未上传</span>
          </el-descriptions-item>
        </el-descriptions>
        <div class="chart-row">
          <div class="chart-block">
            <h3>学生能力分布</h3>
            <div ref="abilityChartRef" class="chart-box"></div>
          </div>
          <div class="chart-block">
            <h3>知识点掌握热力图</h3>
            <div ref="heatmapChartRef" class="chart-box"></div>
          </div>
        </div>
        <div class="chart-row">
          <div class="chart-block">
            <h3>学生能力雷达图</h3>
            <div ref="radarChartRef" class="chart-box"></div>
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
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const formRef = ref()
const previewVisible = ref(false)
const analyzing = ref(false)
const abilityChartRef = ref()
const heatmapChartRef = ref()
const radarChartRef = ref()
const pieChartRef = ref()

const form = ref({
  studentFileList: [],
  questionFileList: [],
  desc: ''
})
const rules = {}

const analysis = reactive({
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
  if (!form.value.studentFileList.length || !form.value.questionFileList.length) {
    ElMessage.error('请上传学生数据和题目信息文件')
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
    previewVisible.value = true
  }, 4000)
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
      grid: { left: 60, right: 20, bottom: 40, top: 30 },
      xAxis: { type: 'category', data: analysis.heatmap.x, splitArea: { show: true } },
      yAxis: { type: 'category', data: analysis.heatmap.y, splitArea: { show: true } },
      visualMap: {
        min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 10
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
const handlePreview = () => {
  if (!analysis.time) handleAnalyze()
  previewVisible.value = true
}
const onDialogOpened = () => {
  renderCharts()
}
const handleExport = () => {
  ElMessage.success('导出成功')
}
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = { studentFileList: [], questionFileList: [], desc: '' }
  Object.assign(analysis, {
    time: '', model: '', conclusion: '', abilityDist: [], heatmap: { x: [], y: [], data: [] }, radar: { indicators: [], values: [] }, weakPoints: [], levels: [], pie: []
  })
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
  height: 260px;
  background: #f7f8fa;
  border-radius: 8px;
}
</style>
