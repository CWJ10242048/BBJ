<template>
  <div class="knowtrack-container">
    <h2>知识追踪</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据来源选择</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="数据来源">
          <el-radio-group v-model="form.dataSource" @change="handleDataSourceChange">
            <el-radio label="class">选择班级</el-radio>
            <el-radio label="file">上传答题数据文件</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.dataSource === 'class'" label="选择班级">
          <el-select v-model="form.classId" placeholder="请选择班级">
            <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <template v-if="form.dataSource === 'file'">
          <el-form-item label="答题数据文件">
            <el-upload
              class="upload-demo"
              :auto-upload="false"
              :show-file-list="true"
              v-model:file-list="form.exerciseFileList"
              accept=".xlsx,.csv,.doc,.docx,.pdf"
            >
              <el-button size="small" type="primary">上传文件</el-button>
            </el-upload>
          </el-form-item>
        </template>

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

    <!-- Loading / Result Container -->
    <div style="margin-top: 20px;">
      <!-- Analysis Result Section (inside loading container) -->
      <div v-if="analysis.time" class="analysis-result">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <h2>知识追踪分析结果</h2>
          <el-tag type="success" size="small" style="margin-left: 10px;">AI自动生成</el-tag>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分析时间">{{ analysis.time }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ analysis.className }}</el-descriptions-item>
          <el-descriptions-item label="学生人数">{{ analysis.studentCount }}人</el-descriptions-item>
          <el-descriptions-item label="知识追踪模型">KANOptiKT</el-descriptions-item>
          <el-descriptions-item label="追踪说明" :span="2">
            <pre class="desc-pre">{{ form.desc }}</pre>
          </el-descriptions-item>
          <template v-if="form.dataSource === 'file'">
            <el-descriptions-item label="答题数据文件">
              <span v-if="form.exerciseFileList.length">已上传文件</span>
              <span v-else>未上传</span>
            </el-descriptions-item>
          </template>
        </el-descriptions>
        <div class="chart-row">
          <div class="chart-block">
            <h3>知识点掌握动态变化</h3>
            <div ref="lineChartRef" class="chart-box"></div>
          </div>
          <div class="chart-block">
            <div class="chart-header-controls">
              <h3>未来表现预测</h3>
              <el-button-group size="small">
                <el-button :type="currentPredictionStep === 1 ? 'primary' : 'default'" @click="changePredictionStep(1)">第1次</el-button>
                <el-button :type="currentPredictionStep === 2 ? 'primary' : 'default'" @click="changePredictionStep(2)">第2次</el-button>
                <el-button :type="currentPredictionStep === 3 ? 'primary' : 'default'" @click="changePredictionStep(3)">第3次</el-button>
              </el-button-group>
            </div>
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
            <div class="chart-header-controls">
              <h3>学习效果评估</h3>
              <el-button-group size="small">
                <el-button :type="evalSortType === 'default' ? 'primary' : 'default'" @click="evalSortType = 'default'">默认排序</el-button>
                <el-button :type="evalSortType === 'scoreAsc' ? 'primary' : 'default'" @click="evalSortType = 'scoreAsc'">得分升序</el-button>
                <el-button :type="evalSortType === 'scoreDesc' ? 'primary' : 'default'" @click="evalSortType = 'scoreDesc'">得分降序</el-button>
              </el-button-group>
            </div>
            <el-table :data="showAllEval ? sortedEvalData : sortedEvalData.slice(0, 5)" border size="small" style="width:100%;margin-bottom:0;">
              <el-table-column prop="name" label="学生姓名" width="120" />
              <el-table-column prop="improve" label="知识提升(%)" width="120" />
              <el-table-column prop="finalScore" label="最终得分" width="120" />
              <el-table-column label="学习效果">
                <template #default="scope">
                  <el-tag :type="getEffectTagType(scope.row.effect)">{{ scope.row.effect }}</el-tag>
                </template>
              </el-table-column>
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
        <div class="button-group" style="margin-top: 30px;">
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button type="warning" @click="handleExport">导出</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- Initial Button Group (only show when no results and not loading) -->
    <div v-if="!analysis.time && !analyzing" class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="warning" :disabled="true">导出</el-button> <!-- Initially disable export -->
      <el-button @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

interface AnalysisData {
  time: string;
  className: string;
  studentCount: number;
  pathAdvice: string;
  teachAdvice: string;
  line: {
    x: string[];
    series: { name: string; data: number[] }[];
  };
  bar: {
    x: string[];
    predictions: Record<number, number[]>;
  };
  flow: {
    nodes: { name: string; x: number; y: number; method: string; symbolSize?: number; itemStyle?: any; label?: any }[];
    links: { source: string; target: string; lineStyle?: any }[];
  };
  stateEvolution: {
    stages: string[];
    series: echarts.SeriesOption[];
  };
  eval: { name: string; improve: number; finalScore: number; effect: string }[];
}

const formRef = ref()
const analyzing = ref(false)
const lineChartRef = ref()
const barChartRef = ref()
const flowChartRef = ref()
const sankeyChartRef = ref()
const showAllEval = ref(false)
const evalSortType = ref('default')
const currentPredictionStep = ref(1)
let barChartInstance: echarts.ECharts | null = null

const classOptions = [
  { value: '1', label: '计算机2201班' },
  { value: '2', label: '计算机2202班' },
  { value: '3', label: '软件工程2201班' },
  { value: '4', label: '软件工程2202班' },
  { value: '5', label: '人工智能2201班' },
  { value: '6', label: '大数据2201班' }
]

const form = ref({
  exerciseFileList: [],
  desc: '',
  dataSource: 'class',
  classId: '1'
})
const rules = {}

const analysis = reactive<AnalysisData>({
  time: '',
  className: '',
  studentCount: 0,
  pathAdvice: '',
  teachAdvice: '',
  line: { x: [], series: [] },
  bar: { x: [], predictions: {} },
  flow: { nodes: [], links: [] },
  stateEvolution: { stages: [], series: [] },
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

const getSelectedClassName = () => {
  const found = classOptions.find(item => item.value === form.value.classId)
  return found ? found.label : '未选择班级'
}

const handleDataSourceChange = (value: string | number | boolean | undefined) => {
  if (value === 'class') {
    form.value.exerciseFileList = []
  } else {
    form.value.classId = '1'
  }
}

let completionTimer: NodeJS.Timeout | number | null = null; // Timer for overall analysis completion

const handleAnalyze = async () => {
  if (form.value.dataSource === 'file') {
    if (!form.value.exerciseFileList.length) {
      ElMessage.error('请上传答题数据文件')
      return
    }
  } else if (form.value.dataSource === 'class') {
    if (!form.value.classId) {
      ElMessage.error('请选择班级')
      return
    }
  }

  analyzing.value = true

  // Show sequential messages
  ElMessage.info('正在获取班级答题数据...');
  setTimeout(() => {
    if (!analyzing.value) return; // Check if cancelled
    ElMessage.info('正在调用模型...');
  }, 800);
  setTimeout(() => {
    if (!analyzing.value) return; // Check if cancelled
    ElMessage.info('正在分析数据...');
  }, 1600);

  // Set a separate timer for the actual completion
  completionTimer = setTimeout(() => {
    // Check if analysis was reset during the process
    if (!analyzing.value) {
      console.log("Analysis was reset, completion timer cancelled.");
      return;
    }

    // Simulate final result processing
    const now = new Date()
    analysis.time = now.toLocaleString()
    let studentCount = 30
    let className = '上传文件数据'; // Default for file upload
    if (form.value.dataSource === 'class') {
      const selectedClass = form.value.classId
      className = getSelectedClassName(); // Get selected class name
      if (selectedClass === '1' || selectedClass === '2') {
        studentCount = 30
      } else if (selectedClass === '3' || selectedClass === '4') {
        studentCount = 25
      } else {
        studentCount = 20
      }
    }
    // Store count and name in analysis object
    analysis.studentCount = studentCount;
    analysis.className = className;

    const currentStudentNames = studentNames.slice(0, studentCount)
    analysis.line = {
      x: ['第1次', '第2次', '第3次', '第4次', '第5次'],
      series: knowledgeNames.map((name, idx) => {
        let base = 40 + idx * 5
        let arr = []
        let last = base
        for (let i = 0; i < 5; i++) {
          let delta = 5 + Math.floor(Math.random() * 6) - Math.floor(Math.random() * 4)
          last = Math.max(30, Math.min(100, last + delta))
          arr.push(last)
        }
        return { name, data: arr }
      })
    }
    analysis.bar = {
      x: currentStudentNames,
      predictions: {
        1: Array.from({ length: studentCount }, () => Math.floor(Math.random() * 16) + 70),
        2: Array.from({ length: studentCount }, () => Math.floor(Math.random() * 16) + 75),
        3: Array.from({ length: studentCount }, () => Math.floor(Math.random() * 16) + 80)
      }
    }
    analysis.pathAdvice = `针对 ${getSelectedClassName()} 的学生情况，建议优先巩固"神经网络""支持向量机"等薄弱知识点，逐步提升"决策树""逻辑回归"等，最后攻克"线性回归"相关内容。`
    // Generate nodes with coordinates for graph layout
    const pathSteps = [
      { name: '线性回归', method: '练习', x: 100, y: 150 },
      { name: '逻辑回归', method: '练习', x: 300, y: 100 },
      { name: '决策树', method: '实验', x: 300, y: 200 },
      { name: '支持向量机', method: '测试', x: 500, y: 150 },
      { name: '神经网络', method: '项目', x: 700, y: 150 },
      { name: '集成学习', method: '复习', x: 900, y: 150 },
    ];

    const graphNodes = pathSteps.map(step => ({
      ...step,
      symbolSize: 60,
      itemStyle: { color: echarts.color.random() },
      label: {
        formatter: `{b}\n(${step.method})`,
        fontSize: 10,
      }
    }));

    analysis.flow = {
      nodes: graphNodes,
      links: [
        { source: '线性回归', target: '逻辑回归', lineStyle: { color: '#aaa', width: 2 } },
        { source: '线性回归', target: '决策树', lineStyle: { color: '#aaa', width: 2 } },
        { source: '逻辑回归', target: '支持向量机', lineStyle: { color: '#aaa', width: 2 } },
        { source: '决策树', target: '支持向量机', lineStyle: { color: '#aaa', width: 2 } },
        { source: '支持向量机', target: '神经网络', lineStyle: { color: '#aaa', width: 2 } },
        { source: '神经网络', target: '集成学习', lineStyle: { color: '#aaa', width: 2 } },
      ].map(link => ({
        ...link,
      }))
    };

    // Generate data for state evolution (Stacked Area Chart)
    const stages = ['初始阶段', '中期阶段', '末期阶段'];
    analysis.stateEvolution = {
      stages: stages,
      series: [
        {
          name: '掌握很差',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: [30, 20, 10].map(p => Math.round(p / 100 * analysis.studentCount))
        },
        {
          name: '掌握较差',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: [30, 25, 15].map(p => Math.round(p / 100 * analysis.studentCount))
        },
        {
          name: '掌握一般',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: [25, 35, 35].map(p => Math.round(p / 100 * analysis.studentCount))
        },
        {
          name: '掌握良好',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: [10, 15, 25].map(p => Math.round(p / 100 * analysis.studentCount))
        },
        {
          name: '掌握优秀',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: [5, 5, 15].map(p => Math.round(p / 100 * analysis.studentCount))
        }
      ]
    };

    analysis.teachAdvice = `
针对 ${getSelectedClassName()} 的教学建议：
1. 动态调整题目难度，针对薄弱知识点适当降低难度，提升学生信心。
2. 增加"集成学习"等新知识点的专项训练。
3. 推荐题目：线性回归预测实战、决策树剪枝应用、神经网络反向传播推导、集成学习方法对比等。
4. 推荐课程资源：《机器学习实战》《深度学习入门》《统计学习方法》《集成学习原理与应用》。
5. 鼓励小组合作与阶段性自测，及时反馈学习效果。
6. 采用分层教学、个性化推送习题、阶段性反馈等方式，动态调整教学内容，关注学生状态变化，提升整体学习效果。
7. 本次知识追踪分析采用 KANOptiKT 知识追踪模型，动态预测学生未来表现并为学习路径规划提供科学依据。`

    // Ensure analysis.eval is generated correctly HERE
    analysis.eval = currentStudentNames.map((name, i) => {
      const improve = Math.floor(Math.random() * 21) + 5
      const finalScore = Math.floor(Math.random() * 31) + 70
      const effect = effectList[(improve + finalScore + i) % effectList.length]
      return { name, improve, finalScore, effect }
    })

    nextTick(() => {
      renderCharts()
    })
    ElMessage.success('分析完成')

    analyzing.value = false; // Mark analysis as complete
  }, 2400);
}

function renderCharts() {
  if (lineChartRef.value) {
    const chart = echarts.init(lineChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: {
        data: analysis.line.series.map(s => s.name),
        top: 25
      },
      grid: {
        top: 80,
        left: 50,
        right: 30,
        bottom: 30
      },
      xAxis: { type: 'category', data: analysis.line.x },
      yAxis: { type: 'value', min: 40 },
      series: analysis.line.series.map(s => ({ name: s.name, type: 'line', data: s.data }))
    })
  }
  if (barChartRef.value) {
    barChartInstance = echarts.init(barChartRef.value)
    barChartInstance.setOption({
      tooltip: {},
      xAxis: { type: 'category', data: analysis.bar.x },
      yAxis: { type: 'value' },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          startValue: 0,
          endValue: 9
        }
      ],
      series: [{ type: 'bar', data: currentBarData.value, itemStyle: { color: '#409EFF' } }]
    })
  }
  if (flowChartRef.value) {
    const flowChart = echarts.init(flowChartRef.value)
    flowChart.setOption({
      tooltip: {
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            return `${params.data.name} <br/>建议方法: ${params.data.method}`;
          }
          return '';
        }
      },
      series: [{
        type: 'graph',
        layout: 'none',
        roam: true,
        data: analysis.flow.nodes,
        links: analysis.flow.links,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [4, 10],
        label: {
          show: true,
          position: 'inside',
          color: '#fff',
          fontSize: 10
        }
      }]
    })
  }
  if (sankeyChartRef.value) {
    const stateChart = echarts.init(sankeyChartRef.value)
    stateChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }
      },
      legend: {
        data: analysis.stateEvolution.series.map(s => s.name as string)
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: [
        { type: 'category', boundaryGap: false, data: analysis.stateEvolution.stages }
      ],
      yAxis: [
        { type: 'value', name: '学生人数' }
      ],
      series: analysis.stateEvolution.series
    });
  }
}

const handleSave = async () => {
  ElMessage.success('保存成功')
}
const handleExport = () => {
  if (!analysis.time) {
    ElMessage.error('请先分析数据')
    return
  }
  ElMessage.success('导出成功')
}
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = {
    exerciseFileList: [],
    desc: '',
    dataSource: 'class',
    classId: '1'
  }
  lineChartRef.value = null
  barChartRef.value = null
  flowChartRef.value = null
  sankeyChartRef.value = null
  clearCompletionTimer();
  analyzing.value = false;
  currentPredictionStep.value = 1;
  evalSortType.value = 'default';
  Object.assign(analysis, {
    time: '', className: '', studentCount: 0, pathAdvice: '', teachAdvice: '',
    line: { x: [], series: [] },
    bar: { x: [], predictions: {} },
    flow: { nodes: [], links: [] },
    stateEvolution: { stages: [], series: [] },
    eval: []
  });
}

const clearCompletionTimer = () => {
  if (completionTimer !== null) {
    clearTimeout(completionTimer as any);
    completionTimer = null;
  }
}

const currentBarData = computed(() => {
  return analysis.bar.predictions[currentPredictionStep.value] || [];
})

const changePredictionStep = (step: number) => {
  currentPredictionStep.value = step;
  if (barChartInstance) {
    barChartInstance.setOption({
      series: [{ data: currentBarData.value }]
    });
  }
  clearCompletionTimer();
  analyzing.value = false;
  currentPredictionStep.value = 1;
  evalSortType.value = 'default';
}

const sortedEvalData = computed(() => {
  const data = analysis.eval.slice();
  if (evalSortType.value === 'scoreAsc') {
    return data.sort((a, b) => a.finalScore - b.finalScore);
  } else if (evalSortType.value === 'scoreDesc') {
    return data.sort((a, b) => b.finalScore - a.finalScore);
  }
  return data;
});

const getEffectTagType = (effect: string): ('success' | 'info' | 'warning' | 'danger') => {
  if ([ '提升明显', '进步较大' ].includes(effect)) return 'success';
  if ([ '有进步', '有提升' ].includes(effect)) return 'info';
  if ('略有提升' === effect) return 'warning';
  if ('需加强' === effect) return 'danger';
  return 'info';
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
.analysis-result {
  margin-top: 30px;
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.preview-content h2 {
  text-align: center;
  margin-bottom: 24px;
}
.chart-header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0px; /* Reduced space below header */
}
</style>

