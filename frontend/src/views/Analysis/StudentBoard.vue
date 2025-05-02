<template>
  <div class="studentboard-container">
    <h2>学生数据看板</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据来源选择</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="数据来源">
          <el-radio-group v-model="form.dataSource" @change="handleDataSourceChange">
            <el-radio label="file">上传文件</el-radio>
            <el-radio label="class">选择班级</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <template v-if="form.dataSource === 'file'">
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
        </template>
        
        <el-form-item v-if="form.dataSource === 'class'" label="选择班级">
          <el-select v-model="form.classId" placeholder="请选择班级">
            <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:center;margin-top:16px;">
        <el-button type="primary" :loading="analyzing" :disabled="analyzing" @click="handleAnalyze">
          {{ analyzing ? '正在分析数据...' : '开始数据可视化分析' }}
        </el-button>
      </div>
    </el-card>

    <div v-if="analysis.time" class="analysis-result">
      <h2>{{ getSelectedClassName() }}学生数据分析结果</h2>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="班级">{{ getSelectedClassName() }}</el-descriptions-item>
        <el-descriptions-item label="分析时间">{{ analysis.time }}</el-descriptions-item>
        <el-descriptions-item label="总学生数">{{ analysis.total }}</el-descriptions-item>
        <el-descriptions-item label="平均分">{{ analysis.avg }}</el-descriptions-item>
        <el-descriptions-item label="最高分">{{ analysis.max }}</el-descriptions-item>
        <el-descriptions-item label="最低分">{{ analysis.min }}</el-descriptions-item>
        <el-descriptions-item label="及格率">{{ analysis.passRate }}%</el-descriptions-item>
        <el-descriptions-item label="优秀率">{{ analysis.excellentRate }}%</el-descriptions-item>
        <template v-if="form.dataSource === 'file'">
          <el-descriptions-item label="数据说明">
            <pre class="desc-pre">{{ form.desc }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="数据文件">
            <span v-if="form.fileList.length">已上传文件</span>
            <span v-else>未上传</span>
          </el-descriptions-item>
        </template>
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

      <div class="attention-students">
        <h3>重点关注学生</h3>
        <div class="attention-desc">以下学生未达到及格线（60分），需要重点关注：</div>
        <el-table :data="failedStudents" border size="small" style="width:100%;margin:12px 0 24px;">
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="score" label="分数" width="100" />
          <el-table-column prop="rank" label="学号" width="100" />
          <el-table-column label="差距" width="100">
            <template #default="scope">
              <span class="score-gap">{{ 60 - scope.row.score }}分</span>
            </template>
          </el-table-column>
          <el-table-column label="薄弱知识点" min-width="200">
            <template #default="scope">
              <el-tag 
                v-for="point in getWeakPoints(scope.row.score)" 
                :key="point" 
                type="danger" 
                effect="light"
                style="margin-right: 8px;margin-bottom: 4px;"
              >
                {{ point }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <h3>学生成绩详情</h3>
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
      <div style="text-align:right;margin-top:8px;">
        <el-button type="primary" size="small" @click="showAllErrorsDialog = true">查看全部错题</el-button>
      </div>

      <div class="button-group">
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button type="warning" @click="handleExport">导出</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div v-else class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="warning" :disabled="true">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-dialog v-model="showAllDialog" title="全部学生成绩信息" width="80%" destroy-on-close>
      <div class="preview-content">
        <h3>{{ getSelectedClassName() }}学生成绩信息</h3>
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

    <el-dialog v-model="showAllErrorsDialog" title="全部错题信息" width="90%" destroy-on-close>
      <div class="preview-content">
        <h3>{{ getSelectedClassName() }}错题分析</h3>
        <div style="margin-bottom:12px;display:flex;gap:16px;align-items:center;">
          <el-select v-model="errorSortType" placeholder="排序方式" style="width:140px">
            <el-option label="按错误人数降序" value="countDesc" />
            <el-option label="按错误人数升序" value="countAsc" />
            <el-option label="按知识点" value="knowledge" />
          </el-select>
        </div>
        <el-table :data="sortedAllErrors" border size="small" style="width:100%;">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="question" label="题目" min-width="300">
            <template #default="scope">
              <div style="white-space: pre-wrap;">{{ scope.row.question }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="wrongCount" label="错误人数" width="100" sortable />
          <el-table-column prop="wrongRate" label="错误率" width="100">
            <template #default="scope">
              {{ ((scope.row.wrongCount / analysis.total) * 100).toFixed(1) }}%
            </template>
          </el-table-column>
          <el-table-column prop="knowledge" label="知识点" width="120">
            <template #default="scope">
              <el-tag size="small" type="info">{{ scope.row.knowledge }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="suggestion" label="建议" min-width="300">
            <template #default="scope">
              <div style="white-space: pre-wrap;">{{ scope.row.suggestion }}</div>
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
import * as XLSX from 'xlsx'

// 定义学生数据类型
interface Student {
  name: string;
  score: number;
  rank: number;
  pass: boolean;
  excellent: boolean;
}

interface ErrorItem {
  question: string;
  wrongCount: number;
  knowledge: string;
  suggestion?: string;
}

interface ScoreDistItem {
  range: string;
  value: number;
}

interface RadarIndicator {
  name: string;
  max: number;
}

interface AnalysisData {
  time: string;
  total: number;
  avg: number;
  max: number;
  min: number;
  passRate: number;
  excellentRate: number;
  details: Student[];
  errors: ErrorItem[];
  scoreDist: ScoreDistItem[];
  radar: {
    indicators: RadarIndicator[];
    values: number[];
  };
}

const classOptions = [
  { value: '1', label: '计算机2201班' },
  { value: '2', label: '计算机2202班' },
  { value: '3', label: '软件工程2201班' },
  { value: '4', label: '软件工程2202班' },
  { value: '5', label: '人工智能2201班' },
  { value: '6', label: '大数据2201班' }
]

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
const showAllDialog = ref(false)
const analyzing = ref(false)
const scoreChartRef = ref()
const radarChartRef = ref()

const filterType = ref('all')
const sortType = ref('scoreDesc')

const showAllErrorsDialog = ref(false)
const errorSortType = ref('countDesc')

const form = ref({
  fileList: [],
  desc: '',
  classId: '1',
  dataSource: 'file'
})
const rules = {}

const analysis = reactive<AnalysisData>({
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

const sortedAllErrors = computed(() => {
  const errors = analysis.errors.slice()
  if (errorSortType.value === 'countDesc') {
    return errors.sort((a, b) => b.wrongCount - a.wrongCount)
  } else if (errorSortType.value === 'countAsc') {
    return errors.sort((a, b) => a.wrongCount - b.wrongCount)
  } else if (errorSortType.value === 'knowledge') {
    return errors.sort((a, b) => a.knowledge.localeCompare(b.knowledge))
  }
  return errors
})

const getSelectedClassName = () => {
  const found = classOptions.find(item => item.value === form.value.classId)
  return found ? found.label : '未选择班级'
}

const handleDataSourceChange = (value: string | number | boolean | undefined) => {
  if (value === 'class') {
    form.value.fileList = []
  } else {
    form.value.classId = '1'
  }
}

const handleAnalyze = async () => {
  if (form.value.dataSource === 'file' && (!form.value.fileList || !form.value.fileList.length)) {
    ElMessage.error('请先上传答题数据文件')
    return
  }
  if (form.value.dataSource === 'class' && !form.value.classId) {
    ElMessage.error('请先选择班级')
    return
  }
  analyzing.value = true
  setTimeout(async () => {
    analyzing.value = false
    // 模拟分析结果
    const now = new Date()
    analysis.time = now.toLocaleString()
    
    // 根据数据来源生成数据
    let studentCount = 30
    if (form.value.dataSource === 'class') {
      const selectedClass = form.value.classId
      if (selectedClass === '1' || selectedClass === '2') {
        studentCount = 30
      } else if (selectedClass === '3' || selectedClass === '4') {
        studentCount = 25
      } else {
        studentCount = 20
      }
    }
    
    analysis.total = studentCount
    // 生成学生数据，姓名为指定，分数随机，优秀为分数>=85
    analysis.details = studentNames.slice(0, studentCount).map((name, i) => {
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
    analysis.avg = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
    analysis.max = Math.max(...scores)
    analysis.min = Math.min(...scores)
    analysis.passRate = Math.round(analysis.details.filter(s => s.pass).length / studentCount * 100)
    analysis.excellentRate = Math.round(analysis.details.filter(s => s.excellent).length / studentCount * 100)
    // 常见错题用机器学习知识点
    analysis.errors = [
      { 
        question: '线性回归的损失函数', 
        wrongCount: Math.round(studentCount * 0.6), 
        knowledge: '线性回归',
        suggestion: '建议复习均方误差（MSE）的概念和推导过程，理解为什么选择MSE作为损失函数，以及它在优化过程中的作用。'
      },
      { 
        question: '决策树剪枝原理', 
        wrongCount: Math.round(studentCount * 0.5), 
        knowledge: '决策树',
        suggestion: '重点理解预剪枝和后剪枝的区别，以及过拟合与剪枝之间的关系。建议结合具体例子学习不同剪枝策略的应用场景。'
      },
      { 
        question: '神经网络反向传播', 
        wrongCount: Math.round(studentCount * 0.4), 
        knowledge: '神经网络',
        suggestion: '建议从梯度下降算法开始复习，理解链式法则在反向传播中的应用，并尝试手动推导简单网络的梯度计算过程。'
      },
      { 
        question: '支持向量机的核函数原理', 
        wrongCount: Math.round(studentCount * 0.35), 
        knowledge: '支持向量机',
        suggestion: '重点理解核函数的作用是将非线性问题转换为线性可分问题，建议学习常用核函数（如高斯核、多项式核）的特点和应用场景。'
      },
      { 
        question: '集成学习中Bagging与Boosting的区别', 
        wrongCount: Math.round(studentCount * 0.3), 
        knowledge: '集成学习',
        suggestion: '对比学习两种方法的核心思想、训练过程和应用场景，建议结合随机森林（Bagging）和AdaBoost（Boosting）的具体算法加深理解。'
      },
      { 
        question: '特征选择的方法与策略', 
        wrongCount: Math.round(studentCount * 0.25), 
        knowledge: '特征选择',
        suggestion: '系统复习过滤法、包装法和嵌入法三种特征选择方法，理解各自的优缺点和适用场景。建议结合实际案例练习。'
      }
    ]
    // 分数段统计
    analysis.scoreDist = [
      { range: '40-59', value: analysis.details.filter(s => s.score >= 40 && s.score <= 59).length },
      { range: '60-69', value: analysis.details.filter(s => s.score >= 60 && s.score <= 69).length },
      { range: '70-79', value: analysis.details.filter(s => s.score >= 70 && s.score <= 79).length },
      { range: '80-89', value: analysis.details.filter(s => s.score >= 80 && s.score <= 89).length },
      { range: '90-100', value: analysis.details.filter(s => s.score >= 90 && s.score <= 100).length }
    ]
    
    // 根据班级调整雷达图数据
    let radarValues = [80, 70, 65, 60, 75];
    if (form.value.dataSource === 'class') {
      const selectedClass = form.value.classId
      if (selectedClass === '1') {
        radarValues = [85, 75, 65, 80, 70];
      } else if (selectedClass === '2') {
        radarValues = [75, 85, 70, 65, 80];
      } else if (selectedClass === '3') {
        radarValues = [70, 65, 85, 75, 80];
      } else if (selectedClass === '4') {
        radarValues = [80, 70, 60, 85, 75];
      } else if (selectedClass === '5') {
        radarValues = [90, 85, 75, 70, 80];
      } else {
        radarValues = [75, 70, 80, 85, 75];
      }
    }
    
    analysis.radar = {
      indicators: mlKnowledge.slice(0, 5).map(k => ({ name: k, max: 100 })),
      values: radarValues
    }
    await nextTick()
    renderCharts()
    ElMessage.success('分析完成')
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
const handleExport = () => {
  if (!analysis.time) {
    ElMessage.error('请先分析数据')
    return
  }

  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 基本信息工作表
    const basicInfo = [
      ['班级', getSelectedClassName()],
      ['分析时间', analysis.time],
      ['总学生数', analysis.total],
      ['平均分', analysis.avg],
      ['最高分', analysis.max],
      ['最低分', analysis.min],
      ['及格率', `${analysis.passRate}%`],
      ['优秀率', `${analysis.excellentRate}%`],
    ]
    if (form.value.dataSource === 'file') {
      basicInfo.push(['数据说明', form.value.desc || '无'])
    }
    const basicSheet = XLSX.utils.aoa_to_sheet(basicInfo)
    XLSX.utils.book_append_sheet(workbook, basicSheet, '基本信息')

    // 学生成绩工作表
    const studentHeaders = [['学号', '姓名', '分数', '是否及格', '是否优秀']]
    const studentData = analysis.details.map(student => [
      student.rank,
      student.name,
      student.score,
      student.pass ? '是' : '否',
      student.excellent ? '是' : '否'
    ])
    const studentSheet = XLSX.utils.aoa_to_sheet([...studentHeaders, ...studentData])
    XLSX.utils.book_append_sheet(workbook, studentSheet, '学生成绩')

    // 分数分布工作表
    const scoreDistHeaders = [['分数段', '人数']]
    const scoreDistData = analysis.scoreDist.map(item => [item.range, item.value])
    const scoreDistSheet = XLSX.utils.aoa_to_sheet([...scoreDistHeaders, ...scoreDistData])
    XLSX.utils.book_append_sheet(workbook, scoreDistSheet, '分数分布')

    // 知识点掌握情况工作表
    const knowledgeHeaders = [['知识点', '掌握度(%)']]
    const knowledgeData = analysis.radar.indicators.map((indicator, index) => [
      indicator.name,
      analysis.radar.values[index]
    ])
    const knowledgeSheet = XLSX.utils.aoa_to_sheet([...knowledgeHeaders, ...knowledgeData])
    XLSX.utils.book_append_sheet(workbook, knowledgeSheet, '知识点掌握情况')

    // 错题分析工作表
    const errorHeaders = [
      ['序号', '题目', '错误人数', '错误率(%)', '知识点', '改进建议']
    ]
    const errorData = analysis.errors.map((error, index) => [
      index + 1,
      error.question,
      error.wrongCount,
      ((error.wrongCount / analysis.total) * 100).toFixed(1),
      error.knowledge,
      error.suggestion || ''
    ])
    const errorSheet = XLSX.utils.aoa_to_sheet([...errorHeaders, ...errorData])
    
    // 设置错题工作表的列宽
    const errorColWidths = [
      { wch: 8 },    // 序号
      { wch: 40 },   // 题目
      { wch: 12 },   // 错误人数
      { wch: 12 },   // 错误率
      { wch: 15 },   // 知识点
      { wch: 60 }    // 改进建议
    ]
    errorSheet['!cols'] = errorColWidths
    
    // 设置错题单元格自动换行
    const errorRange = XLSX.utils.decode_range(errorSheet['!ref'] || 'A1')
    for (let R = errorRange.s.r + 1; R <= errorRange.e.r; ++R) {
      // 设置题目和建议列的单元格格式
      const questionCell = XLSX.utils.encode_cell({ r: R, c: 1 })
      const suggestionCell = XLSX.utils.encode_cell({ r: R, c: 5 })
      if (errorSheet[questionCell]) errorSheet[questionCell].z = '@'
      if (errorSheet[suggestionCell]) errorSheet[suggestionCell].z = '@'
    }
    
    XLSX.utils.book_append_sheet(workbook, errorSheet, '错题分析')

    // 设置列宽
    const setCellWidth = (sheet: XLSX.WorkSheet) => {
      const cols: Partial<XLSX.ColInfo>[] = []
      // 遍历第一行设置列宽
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
      for (let i = range.s.c; i <= range.e.c; i++) {
        cols[i] = { wch: 20 } // 设置列宽为20个字符
      }
      sheet['!cols'] = cols
    }

    // 为其他工作表设置列宽
    ['基本信息', '学生成绩', '分数分布', '知识点掌握情况'].forEach(sheetName => {
      if (workbook.Sheets[sheetName]) {
        setCellWidth(workbook.Sheets[sheetName])
      }
    })

    // 生成文件名
    const fileName = `学生数据分析_${getSelectedClassName()}_${new Date().toLocaleDateString().replace(/\//g, '')}.xlsx`

    // 导出文件
    XLSX.writeFile(workbook, fileName)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = { fileList: [], desc: '', classId: '1', dataSource: 'file' }
  Object.assign(analysis, {
    time: '', total: 0, avg: 0, max: 0, min: 0, passRate: 0, excellentRate: 0,
    details: [], errors: [], scoreDist: [], radar: { indicators: [], values: [] }
  })
}

// 获取未及格学生列表
const failedStudents = computed(() => {
  return analysis.details
    .filter(student => !student.pass)
    .sort((a, b) => a.score - b.score) // 按分数从低到高排序
})

// 根据分数返回薄弱知识点
const getWeakPoints = (score: number) => {
  const points = []
  if (score < 50) {
    points.push(...mlKnowledge.slice(0, 3))
  } else if (score < 55) {
    points.push(...mlKnowledge.slice(0, 2))
  } else {
    points.push(mlKnowledge[0])
  }
  return points
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
  margin: 20px 0;
}
.analysis-result {
  margin-top: 30px;
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.analysis-result h2 {
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
.attention-students {
  margin: 32px 0;
  padding: 20px;
  background: #fef0f0;
  border-radius: 4px;
}
.attention-desc {
  color: #666;
  margin: 8px 0;
  font-size: 14px;
}
.score-gap {
  color: #f56c6c;
  font-weight: bold;
}
</style>
