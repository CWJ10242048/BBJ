<template>
  <div class="studentboard-container">
    <h2>学生数据看板</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据上传与说明</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="答题数据文件">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            v-model:file-list="form.fileList"
            accept=".xlsx,.csv"
          >
            <el-button size="small" type="primary">上传文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="数据说明">
          <el-input v-model="form.desc" type="textarea" :rows="2" placeholder="可填写数据来源、格式说明等" />
        </el-form-item>
      </el-form>
      <div style="text-align:center;margin-top:16px;">
        <el-button type="primary" :loading="analyzing" :disabled="analyzing" @click="handleAnalyze">
          {{ analyzing ? '正在分析数据...' : '开始数据可视化分析' }}
        </el-button>
      </div>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" @click="handleExport">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-dialog v-model="previewVisible" title="学生数据看板预览" width="70%" destroy-on-close @opened="onDialogOpened">
      <div class="preview-content">
        <h2>学生数据分析结果</h2>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分析时间">{{ analysis.time }}</el-descriptions-item>
          <el-descriptions-item label="总学生数">{{ analysis.total }}</el-descriptions-item>
          <el-descriptions-item label="平均分">{{ analysis.avg }}</el-descriptions-item>
          <el-descriptions-item label="最高分">{{ analysis.max }}</el-descriptions-item>
          <el-descriptions-item label="最低分">{{ analysis.min }}</el-descriptions-item>
          <el-descriptions-item label="及格率">{{ analysis.passRate }}%</el-descriptions-item>
          <el-descriptions-item label="优秀率">{{ analysis.excellentRate }}%</el-descriptions-item>
          <el-descriptions-item label="数据说明">
            <pre class="desc-pre">{{ form.desc }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="数据文件">
            <span v-if="form.fileList.length">已上传文件</span>
            <span v-else>未上传</span>
          </el-descriptions-item>
        </el-descriptions>
        <div class="chart-row">
          <div class="chart-block">
            <h3>成绩分布</h3>
            <div ref="scoreChartRef" class="chart-box"></div>
          </div>
          <div class="chart-block">
            <h3>知识点掌握情况</h3>
            <div ref="radarChartRef" class="chart-box"></div>
          </div>
        </div>
        <h3 style="margin-top:24px;">学生成绩详情</h3>
        <el-table :data="studentRows" border size="small" style="width:100%;margin-bottom:16px;">
          <el-table-column label="姓名" width="100">
            <template #default="scope">{{ scope.row[0]?.name || '' }}</template>
          </el-table-column>
          <el-table-column label="分数" width="80">
            <template #default="scope">{{ scope.row[0]?.score || '' }}</template>
          </el-table-column>
          <el-table-column label="学号" width="80">
            <template #default="scope">{{ scope.row[0]?.rank || '' }}</template>
          </el-table-column>
          <el-table-column label="是否及格" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row[0]" :type="scope.row[0].pass ? 'success' : 'danger'">{{ scope.row[0].pass ? '及格' : '未及格' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="是否优秀" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row[0]?.excellent" type="warning">优秀</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="姓名" width="100">
            <template #default="scope">{{ scope.row[1]?.name || '' }}</template>
          </el-table-column>
          <el-table-column label="分数" width="80">
            <template #default="scope">{{ scope.row[1]?.score || '' }}</template>
          </el-table-column>
          <el-table-column label="学号" width="80">
            <template #default="scope">{{ scope.row[1]?.rank || '' }}</template>
          </el-table-column>
          <el-table-column label="是否及格" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row[1]" :type="scope.row[1].pass ? 'success' : 'danger'">{{ scope.row[1].pass ? '及格' : '未及格' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="是否优秀" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row[1]?.excellent" type="warning">优秀</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div style="text-align:right;margin-bottom:16px;">
          <el-button type="primary" size="small" @click="showAllDialog = true">查看全部成绩信息</el-button>
        </div>
        <h3>常见错题</h3>
        <el-table :data="analysis.errors" border size="small" style="width:100%">
          <el-table-column prop="question" label="题目" min-width="200" />
          <el-table-column prop="wrongCount" label="错误人数" width="100" />
          <el-table-column prop="knowledge" label="知识点" min-width="120" />
        </el-table>
      </div>
    </el-dialog>

    <el-dialog v-model="showAllDialog" title="全部学生成绩信息" width="80%" destroy-on-close>
      <div class="preview-content">
        <div style="margin-bottom:12px;display:flex;gap:16px;align-items:center;">
          <el-select v-model="filterType" placeholder="筛选类型" style="width:120px">
            <el-option label="全部" value="all" />
            <el-option label="及格" value="pass" />
            <el-option label="未及格" value="fail" />
            <el-option label="优秀" value="excellent" />
          </el-select>
          <el-select v-model="sortType" placeholder="排序方式" style="width:140px">
            <el-option label="按分数降序" value="scoreDesc" />
            <el-option label="按分数升序" value="scoreAsc" />
            <el-option label="按学号升序" value="rankAsc" />
            <el-option label="按学号降序" value="rankDesc" />
          </el-select>
        </div>
        <el-table :data="filteredSortedAllRows" border size="small" style="width:100%;">
          <el-table-column prop="rank" label="学号" width="80" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="score" label="分数" width="100" />
          <el-table-column label="是否及格" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.pass ? 'success' : 'danger'">{{ scope.row.pass ? '及格' : '未及格' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="是否优秀" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.excellent" type="warning">优秀</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const studentNames = [
  '张宇轩', '李佳悦', '王诗涵', '赵梓萱', '刘逸凡',
  '陈静怡', '杨子墨', '黄雨桐', '吴梦琪', '郑晨曦',
  '孙浩然', '周子涵', '徐梓涵', '马思远', '高子涵',
  '彭思源', '宋子墨', '杜思远', '谢梓萱', '邓子墨',
  '冯思远', '蒋梓萱', '韩子墨', '贾思远', '廖梓萱',
  '秦子墨', '石思远', '陶梓萱', '魏子墨', '尤思远'
]
const mlKnowledge = [
  '线性回归', '逻辑回归', '决策树', '支持向量机', '神经网络',
  '聚类', '降维', '集成学习', '贝叶斯方法', '特征选择'
]

const formRef = ref()
const previewVisible = ref(false)
const showAllDialog = ref(false)
const analyzing = ref(false)
const scoreChartRef = ref()
const radarChartRef = ref()

const filterType = ref('all')
const sortType = ref('scoreDesc')

const form = ref({
  fileList: [],
  desc: ''
})
const rules = {}

const analysis = reactive({
  time: '',
  total: 0,
  avg: 0,
  max: 0,
  min: 0,
  passRate: 0,
  excellentRate: 0,
  details: [],
  errors: [],
  scoreDist: [],
  radar: { indicators: [], values: [] }
})

const studentRows = computed(() => {
  // 只展示前10名，每两名学生为一行
  const arr = []
  for (let i = 0; i < 10; i += 2) {
    arr.push([analysis.details[i], analysis.details[i + 1]])
  }
  return arr
})

const filteredSortedAllRows = computed(() => {
  let arr = analysis.details.slice()
  if (filterType.value === 'pass') arr = arr.filter(s => s.pass)
  if (filterType.value === 'fail') arr = arr.filter(s => !s.pass)
  if (filterType.value === 'excellent') arr = arr.filter(s => s.excellent)
  if (sortType.value === 'scoreDesc') arr = arr.sort((a, b) => b.score - a.score)
  if (sortType.value === 'scoreAsc') arr = arr.sort((a, b) => a.score - b.score)
  if (sortType.value === 'rankAsc') arr = arr.sort((a, b) => a.rank - b.rank)
  if (sortType.value === 'rankDesc') arr = arr.sort((a, b) => b.rank - a.rank)
  return arr
})

const handleAnalyze = async () => {
  if (!form.value.fileList || !form.value.fileList.length) {
    ElMessage.error('请先上传答题数据文件')
    return
  }
  analyzing.value = true
  setTimeout(async () => {
    analyzing.value = false
    // 模拟分析结果
    const now = new Date()
    analysis.time = now.toLocaleString()
    analysis.total = 30
    // 生成30个学生，姓名为指定，分数随机，优秀为分数>=85
    analysis.details = studentNames.slice(0, 30).map((name, i) => {
      const score = Math.floor(Math.random() * 60) + 40
      return {
        name,
        score,
        rank: i + 1,
        pass: score >= 60,
        excellent: score >= 85
      }
    })
    // 统计分析
    const scores = analysis.details.map(s => s.score)
    analysis.avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    analysis.max = Math.max(...scores)
    analysis.min = Math.min(...scores)
    analysis.passRate = Math.round(analysis.details.filter(s => s.pass).length / 30 * 100)
    analysis.excellentRate = Math.round(analysis.details.filter(s => s.excellent).length / 30 * 100)
    // 常见错题用机器学习知识点
    analysis.errors = [
      { question: '线性回归的损失函数', wrongCount: 18, knowledge: '线性回归' },
      { question: '决策树剪枝原理', wrongCount: 15, knowledge: '决策树' },
      { question: '神经网络反向传播', wrongCount: 12, knowledge: '神经网络' }
    ]
    // 分数段统计
    analysis.scoreDist = [
      { range: '40-59', value: analysis.details.filter(s => s.score >= 40 && s.score <= 59).length },
      { range: '60-69', value: analysis.details.filter(s => s.score >= 60 && s.score <= 69).length },
      { range: '70-79', value: analysis.details.filter(s => s.score >= 70 && s.score <= 79).length },
      { range: '80-89', value: analysis.details.filter(s => s.score >= 80 && s.score <= 89).length },
      { range: '90-100', value: analysis.details.filter(s => s.score >= 90 && s.score <= 100).length }
    ]
    analysis.radar = {
      indicators: mlKnowledge.slice(0, 5).map(k => ({ name: k, max: 100 })),
      values: [80, 70, 65, 60, 75]
    }
    await nextTick()
    renderCharts()
    ElMessage.success('分析完成')
    previewVisible.value = true // 分析完成后自动弹窗
  }, 4000)
}

function renderCharts() {
  // 成绩分布柱状图
  if (scoreChartRef.value) {
    const chart = echarts.init(scoreChartRef.value)
    chart.setOption({
      tooltip: {},
      xAxis: { type: 'category', data: analysis.scoreDist.map(i => i.range) },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: analysis.scoreDist.map(i => i.value),
        itemStyle: { color: '#409EFF' }
      }]
    })
  }
  // 知识点掌握雷达图
  if (radarChartRef.value) {
    const chart = echarts.init(radarChartRef.value)
    chart.setOption({
      tooltip: {},
      radar: {
        indicator: analysis.radar.indicators
      },
      series: [{
        type: 'radar',
        data: [{ value: analysis.radar.values, name: '掌握度' }],
        areaStyle: { opacity: 0.2 },
        lineStyle: { color: '#67C23A' },
        itemStyle: { color: '#67C23A' }
      }]
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
  form.value = { fileList: [], desc: '' }
  Object.assign(analysis, {
    time: '', total: 0, avg: 0, max: 0, min: 0, passRate: 0, excellentRate: 0,
    details: [], errors: [], scoreDist: [], radar: { indicators: [], values: [] }
  })
}
</script>

<style scoped>
.studentboard-container {
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
