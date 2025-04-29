<template>
  <div class="knowtrack-container">
    <h2>知识追踪</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据上传与说明</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="习题文件">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            v-model:file-list="form.exerciseFileList"
            accept=".xlsx,.csv,.doc,.docx,.pdf"
          >
            <el-button size="small" type="primary">上传习题</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="交互记录">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            v-model:file-list="form.logFileList"
            accept=".xlsx,.csv"
          >
            <el-button size="small" type="primary">上传交互记录</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="追踪说明">
          <el-input v-model="form.desc" type="textarea" :rows="2" placeholder="可填写追踪目的、数据来源、格式说明等" />
        </el-form-item>
      </el-form>
      <div style="text-align:center;margin-top:16px;">
        <el-button type="primary" :loading="analyzing" :disabled="analyzing" @click="handleAnalyze">
          {{ analyzing ? '正在知识追踪分析...' : '开始知识追踪分析' }}
        </el-button>
      </div>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" @click="handleExport">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-dialog v-model="previewVisible" title="知识追踪分析结果预览" width="90%" destroy-on-close @opened="onDialogOpened">
      <div class="preview-content">
        <h2>知识追踪分析结果</h2>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分析时间">{{ analysis.time }}</el-descriptions-item>
          <el-descriptions-item label="学生人数">30人</el-descriptions-item>
          <el-descriptions-item label="知识追踪模型">KANOptiKT</el-descriptions-item>
          <el-descriptions-item label="追踪说明" :span="2">
            <pre class="desc-pre">{{ form.desc }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="习题文件">
            <span v-if="form.exerciseFileList.length">已上传文件</span>
            <span v-else>未上传</span>
          </el-descriptions-item>
          <el-descriptions-item label="交互记录">
            <span v-if="form.logFileList.length">已上传文件</span>
            <span v-else>未上传</span>
          </el-descriptions-item>
        </el-descriptions>
        <div class="chart-row">
          <div class="chart-block">
            <h3>知识点掌握动态变化</h3>
            <div ref="lineChartRef" class="chart-box"></div>
          </div>
          <div class="chart-block">
            <h3>未来表现预测</h3>
            <div ref="barChartRef" class="chart-box"></div>
          </div>
        </div>
        <div class="chart-row">
          <div class="chart-block">
            <h3>学习路径规划建议</h3>
            <pre class="desc-pre">{{ analysis.pathAdvice }}</pre>
            <div ref="flowChartRef" class="chart-box"></div>
          </div>
          <div class="chart-block">
            <h3>知识状态演变分析</h3>
            <div ref="sankeyChartRef" class="chart-box"></div>
          </div>
        </div>
        <div class="chart-row">
          <div class="chart-block">
            <h3>学习效果评估</h3>
            <el-table :data="showAllEval ? analysis.eval : analysis.eval.slice(0, 5)" border size="small" style="width:100%;margin-bottom:0;">
              <el-table-column prop="name" label="学生姓名" width="120" />
              <el-table-column prop="improve" label="知识提升(%)" width="120" />
              <el-table-column prop="finalScore" label="最终得分" width="120" />
              <el-table-column prop="effect" label="学习效果" />
            </el-table>
            <div style="text-align:right;margin-top:8px;">
              <el-button size="small" @click="showAllEval = !showAllEval">{{ showAllEval ? '收起' : '展开全部' }}</el-button>
            </div>
          </div>
          <div class="chart-block">
            <h3>教学活动优化建议</h3>
            <pre class="desc-pre">{{ analysis.teachAdvice }}</pre>
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
const lineChartRef = ref()
const barChartRef = ref()
const flowChartRef = ref()
const sankeyChartRef = ref()
const showAllEval = ref(false)

const form = ref({
  exerciseFileList: [],
  logFileList: [],
  desc: ''
})
const rules = {}

const analysis = reactive({
  time: '',
  pathAdvice: '',
  teachAdvice: '',
  line: { x: [], series: [] },
  bar: { x: [], y: [] },
  flow: { nodes: [], links: [] },
  sankey: { nodes: [], links: [] },
  eval: []
})

const studentNames = [
  '张宇轩', '李佳悦', '王诗涵', '赵梓萱', '刘逸凡',
  '陈静怡', '杨子墨', '黄雨桐', '吴梦琪', '郑晨曦',
  '孙浩然', '周子涵', '徐梓涵', '马思远', '高子涵',
  '彭思源', '宋子墨', '杜思远', '谢梓萱', '邓子墨',
  '冯思远', '蒋梓萱', '韩子墨', '贾思远', '廖梓萱',
  '秦子墨', '石思远', '陶梓萱', '魏子墨', '尤思远'
]
const effectList = ['提升明显', '进步较大', '有进步', '有提升', '略有提升', '需加强']
const knowledgeNames = ['线性回归', '逻辑回归', '决策树', '支持向量机', '神经网络', '集成学习']

const handleAnalyze = async () => {
  if (!form.value.exerciseFileList.length || !form.value.logFileList.length) {
    ElMessage.error('请上传习题和交互记录文件')
    return
  }
  analyzing.value = true
  setTimeout(async () => {
    analyzing.value = false
    // 模拟分析结果
    const now = new Date()
    analysis.time = now.toLocaleString()
    // 知识点动态变化（有波动）
    analysis.line = {
      x: ['第1次', '第2次', '第3次', '第4次', '第5次'],
      series: knowledgeNames.map((name, idx) => {
        let base = 40 + idx * 5
        let arr = []
        let last = base
        for (let i = 0; i < 5; i++) {
          // 每次增长速率有波动
          let delta = 5 + Math.floor(Math.random() * 6) - Math.floor(Math.random() * 4)
          last = Math.max(30, Math.min(100, last + delta))
          arr.push(last)
        }
        return { name, data: arr }
      })
    }
    // 未来表现预测
    analysis.bar = {
      x: studentNames.slice(0, 10),
      y: Array.from({ length: 10 }, () => Math.floor(Math.random() * 21) + 75)
    }
    // 学习路径建议
    analysis.pathAdvice = '建议优先巩固"神经网络""支持向量机"等薄弱知识点，逐步提升"决策树""逻辑回归"等，最后攻克"线性回归"相关内容。'
    // 流程图（用简单节点链模拟）
    analysis.flow = {
      nodes: knowledgeNames.map(name => ({ name })),
      links: knowledgeNames.slice(0, -1).map((name, i) => ({ source: name, target: knowledgeNames[i + 1], value: 1 }))
    }
    // 知识状态演变（桑基图）
    const sankeyNodes = [{ name: '初始状态' }, ...knowledgeNames.map(k => ({ name: k }))];
    const sankeyLinks = [];
    for (let i = 0; i < knowledgeNames.length; i++) {
      sankeyLinks.push({
        source: i === 0 ? '初始状态' : knowledgeNames[i - 1],
        target: knowledgeNames[i],
        value: Math.max(1, 10 - i * 2)
      });
    }
    analysis.sankey = {
      nodes: sankeyNodes,
      links: sankeyLinks
    };
    // 学习效果评估（30人，数据多样化）
    analysis.eval = studentNames.map((name, i) => {
      const improve = Math.floor(Math.random() * 21) + 5 // 5~25
      const finalScore = Math.floor(Math.random() * 31) + 70 // 70~100
      const effect = effectList[(improve + finalScore + i) % effectList.length]
      return { name, improve, finalScore, effect }
    })
    // 教学活动优化建议
    analysis.teachAdvice = `
1. 动态调整题目难度，针对薄弱知识点适当降低难度，提升学生信心。
2. 增加"集成学习"等新知识点的专项训练。
3. 推荐题目：线性回归预测实战、决策树剪枝应用、神经网络反向传播推导、集成学习方法对比等。
4. 推荐课程资源：《机器学习实战》《深度学习入门》《统计学习方法》《集成学习原理与应用》。
5. 鼓励小组合作与阶段性自测，及时反馈学习效果。
6. 采用分层教学、个性化推送习题、阶段性反馈等方式，动态调整教学内容，关注学生知识状态变化，提升整体学习效果。
7. 本次知识追踪分析采用 KANOptiKT 知识追踪模型，动态预测学生未来表现并为学习路径规划提供科学依据。`
    await nextTick()
    renderCharts()
    ElMessage.success('分析完成')
    previewVisible.value = true
  }, 4000)
}

function renderCharts() {
  // 知识点动态变化曲线
  if (lineChartRef.value) {
    const chart = echarts.init(lineChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: analysis.line.series.map(s => s.name) },
      xAxis: { type: 'category', data: analysis.line.x },
      yAxis: { type: 'value', min: 40 },
      series: analysis.line.series.map(s => ({ name: s.name, type: 'line', data: s.data }))
    })
  }
  // 未来表现预测
  if (barChartRef.value) {
    const chart = echarts.init(barChartRef.value)
    chart.setOption({
      tooltip: {},
      xAxis: { type: 'category', data: analysis.bar.x },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: analysis.bar.y, itemStyle: { color: '#409EFF' } }]
    })
  }
  // 学习路径规划（流程图用桑基图模拟）
  if (flowChartRef.value) {
    const chart = echarts.init(flowChartRef.value)
    chart.setOption({
      tooltip: {},
      series: [{
        type: 'sankey',
        data: analysis.flow.nodes,
        links: analysis.flow.links,
        lineStyle: { color: 'gradient', curveness: 0.5 },
        label: { show: true }
      }]
    })
  }
  // 知识状态演变（桑基图）
  if (sankeyChartRef.value) {
    const chart = echarts.init(sankeyChartRef.value)
    chart.setOption({
      tooltip: {},
      series: [{
        type: 'sankey',
        data: analysis.sankey.nodes,
        links: analysis.sankey.links,
        lineStyle: { color: 'gradient', curveness: 0.5 },
        label: { show: true }
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
  form.value = { exerciseFileList: [], logFileList: [], desc: '' }
  Object.assign(analysis, {
    time: '', pathAdvice: '', teachAdvice: '', line: { x: [], series: [] }, bar: { x: [], y: [] }, flow: { nodes: [], links: [] }, sankey: { nodes: [], links: [] }, eval: []
  })
}
</script>

<style scoped>
.knowtrack-container {
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
