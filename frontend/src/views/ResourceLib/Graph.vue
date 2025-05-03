<template>
  <div class="graph-view-container">
    <div class="select-row">
      <el-select v-model="selectedType" placeholder="请选择知识图谱类型" @change="handleTypeChange" style="width:220px;margin-right:20px;">
        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="selectedGraph" placeholder="请选择具体图谱" style="width:220px;">
        <el-option v-for="item in graphOptions[selectedType]" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <el-card class="box-card" style="margin-top:24px;">
      <template #header>
        <div class="card-header">
          <span>知识图谱展示</span>
          <div class="legend">
            <span class="legend-item mastered"></span> 已掌握
            <span class="legend-item learning"></span> 学习中
            <span class="legend-item notstart"></span> 未开始
          </div>
        </div>
      </template>
      <div ref="chartRef" class="graph-chart"></div>
    </el-card>
    <el-card v-if="nodeDetail" class="detail-card">
      <div class="detail-title">知识详情</div>
      <div class="detail-name">{{ nodeDetail.name }}</div>
      <div class="detail-related">相关知识点：{{ nodeDetail.related.length }}个</div>
      <el-table :data="nodeDetail.related" border size="small" style="width:100%;margin-top:10px;">
        <el-table-column prop="name" label="知识点名称" />
        <el-table-column prop="score" label="关联度" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// Define NodeDetail interface
interface NodeDetail {
  name: string;
  related: { name: string; score: string; }[];
}

// Define GraphNode interface
interface GraphNode {
  name: string;
  status: string;
}

const typeOptions = [
  { label: '专业维度知识图谱', value: 'major' },
  { label: '学科维度知识图谱', value: 'subject' },
  { label: '技术维度知识图谱', value: 'tech' },
  { label: '课程体系知识图谱', value: 'curriculum' },
  { label: '能力维度知识图谱', value: 'ability' },
  { label: '职业发展知识图谱', value: 'career' },
  { label: '项目实践知识图谱', value: 'project' },
  { label: '跨学科知识图谱', value: 'cross' }
]

const selectedType = ref('major')
const selectedGraph = ref('cs')
const chartRef = ref()
const nodeDetail = ref<NodeDetail | null>(null)

const graphOptions: Record<string, { label: string; value: string }[]> = {
  major: [
    { label: '计算机科学与技术', value: 'cs' },
    { label: '软件工程', value: 'se' },
    { label: '网络工程', value: 'net' },
    { label: '信息安全', value: 'sec' },
    { label: '人工智能', value: 'ai_major' },
    { label: '数据科学与大数据技术', value: 'bigdata_major' },
    { label: '物联网工程', value: 'iot' }
  ],
  subject: [
    { label: '算法学科', value: 'algo' },
    { label: '机器学习学科', value: 'ml' },
    { label: '计算机系统学科', value: 'sys' },
    { label: '计算机网络学科', value: 'net_sub' },
    { label: '数据库学科', value: 'db' }
  ],
  tech: [
    { label: '程序设计技术', value: 'prog' },
    { label: '软件工程技术', value: 'se_tech' },
    { label: '数据处理技术', value: 'data_proc' },
    { label: '人工智能技术', value: 'ai_tech' },
    { label: '云计算与大数据技术', value: 'cloud_bigdata' }
  ],
  curriculum: [
    { label: '计算机基础课程', value: 'basic_course' },
    { label: '核心专业课程', value: 'core_course' },
    { label: '选修课程', value: 'optional_course' },
    { label: '实践课程', value: 'practice_course' }
  ],
  ability: [
    { label: '编程能力', value: 'coding' },
    { label: '系统设计能力', value: 'sys_design' },
    { label: '问题解决能力', value: 'problem' },
    { label: '创新能力', value: 'innovation' }
  ],
  career: [
    { label: '软件工程师', value: 'dev' },
    { label: '数据分析师', value: 'da' },
    { label: '系统架构师', value: 'arch' },
    { label: '人工智能工程师', value: 'ai_eng' },
    { label: '网络安全专家', value: 'sec_exp' }
  ],
  project: [
    { label: '课程设计项目', value: 'course_proj' },
    { label: '实习项目', value: 'intern_proj' },
    { label: '毕业设计项目', value: 'grad_proj' },
    { label: '科研项目', value: 'research_proj' }
  ],
  cross: [
    { label: '计算机与数学', value: 'comp_math' },
    { label: '计算机与物理学', value: 'comp_phy' },
    { label: '计算机与生物学', value: 'comp_bio' },
    { label: '计算机与经济学', value: 'comp_econ' }
  ]
}

// 每个图谱的节点和关系（部分示例，其他可仿照补充）
const graphDataMap = {
  cs: {
    nodes: [
      { name: '计算机组成原理', status: 'learning' },
      { name: '操作系统', status: 'mastered' },
      { name: '数据结构', status: 'learning' },
      { name: '计算机网络', status: 'notstart' },
      { name: '编译原理', status: 'notstart' },
      { name: '数据库系统', status: 'mastered' },
      { name: '离散数学', status: 'learning' },
      { name: 'C语言程序设计', status: 'mastered' },
      { name: '面向对象程序设计', status: 'learning' },
      { name: '软件工程', status: 'notstart' },
      { name: '人工智能', status: 'notstart' },
      { name: '信息安全', status: 'learning' },
      { name: '操作系统实验', status: 'notstart' },
      { name: '网络安全', status: 'notstart' },
      { name: 'Web开发', status: 'learning' }
    ],
    links: [
      { source: 'C语言程序设计', target: '数据结构' },
      { source: '数据结构', target: '操作系统' },
      { source: '数据结构', target: '数据库系统' },
      { source: '离散数学', target: '编译原理' },
      { source: '操作系统', target: '操作系统实验' },
      { source: '计算机组成原理', target: '操作系统' },
      { source: '计算机组成原理', target: '网络安全' },
      { source: '计算机网络', target: '网络安全' },
      { source: '面向对象程序设计', target: '软件工程' },
      { source: '软件工程', target: 'Web开发' },
      { source: '人工智能', target: '信息安全' },
      { source: '数据库系统', target: 'Web开发' },
      { source: 'Web开发', target: '网络安全' },
      { source: '信息安全', target: '网络安全' },
      { source: '离散数学', target: '人工智能' }
    ]
  },
  algo: {
    nodes: [
      { name: '算法基础', status: 'learning' },
      { name: '排序算法', status: 'learning' },
      { name: '分治算法', status: 'mastered' },
      { name: '贪心算法', status: 'mastered' },
      { name: '搜索算法', status: 'notstart' },
      { name: '动态规划', status: 'notstart' },
      { name: '递归与分治', status: 'learning' },
      { name: '回溯算法', status: 'notstart' },
      { name: '图算法', status: 'learning' },
      { name: '最短路径算法', status: 'notstart' },
      { name: '最小生成树', status: 'learning' },
      { name: '字符串算法', status: 'notstart' },
      { name: '数论算法', status: 'learning' },
      { name: '并查集', status: 'notstart' },
      { name: '堆与优先队列', status: 'mastered' }
    ],
    links: [
      { source: '算法基础', target: '排序算法' },
      { source: '算法基础', target: '递归与分治' },
      { source: '递归与分治', target: '分治算法' },
      { source: '分治算法', target: '回溯算法' },
      { source: '算法基础', target: '贪心算法' },
      { source: '贪心算法', target: '最小生成树' },
      { source: '算法基础', target: '搜索算法' },
      { source: '搜索算法', target: '图算法' },
      { source: '图算法', target: '最短路径算法' },
      { source: '图算法', target: '并查集' },
      { source: '算法基础', target: '动态规划' },
      { source: '动态规划', target: '堆与优先队列' },
      { source: '算法基础', target: '字符串算法' },
      { source: '算法基础', target: '数论算法' },
      { source: '排序算法', target: '堆与优先队列' }
    ]
  },
  // ... 其余图谱同理补充 ...
}

// 节点相关知识点
function getNodeDetail(nodeName: string): NodeDetail {
  // 返回2~4个相关知识点，名称和关联度随机
  const all = [
    '算法基础', '贪心算法', '数据结构', '操作系统', '数据库系统',
    '机器学习', '深度学习', '网络安全', '系统设计', '创新能力',
    '项目管理', '人工智能', '云计算', '大数据', '物联网'
  ]
  const related = []
  const used = new Set([nodeName])
  const n = Math.floor(Math.random() * 3) + 2
  for (let i = 0; i < n; i++) {
    let idx = Math.floor(Math.random() * all.length)
    while (used.has(all[idx])) idx = (idx + 1) % all.length
    used.add(all[idx])
    related.push({ name: all[idx], score: Math.floor(Math.random() * 61) + 30 + '%' })
  }
  return {
    name: nodeName,
    related
  }
}

function renderGraph() {
  const currentGraphKey = selectedGraph.value as keyof typeof graphDataMap;
  const data = graphDataMap[currentGraphKey] || { nodes: [], links: [] }
  if (!chartRef.value) return
  const chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: (params: any) => params.dataType === 'node' ? params.data.name : '' },
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      data: data.nodes.map((n: GraphNode) => ({
        name: n.name,
        symbolSize: 48,
        itemStyle: {
          color: n.status === 'mastered' ? '#5470C6' : n.status === 'learning' ? '#91CC75' : '#FAC858'
        },
        label: { fontSize: 16 }
      })),
      links: data.links,
      force: { repulsion: 300, edgeLength: 120 },
      lineStyle: { color: '#aaa', width: 2 },
      label: { show: true }
    }]
  })
  chart.off('click')
  chart.on('click', (params: any) => {
    if (params.dataType === 'node' && params.data && typeof params.data.name === 'string') {
      nodeDetail.value = getNodeDetail(params.data.name);
    } else {
      nodeDetail.value = null;
    }
  })
}

watch([selectedType, selectedGraph], () => {
  nodeDetail.value = null
  nextTick(() => renderGraph())
})

function handleTypeChange() {
  const currentTypeKey = selectedType.value as keyof typeof graphOptions;
  const arr = graphOptions[currentTypeKey];
  if (arr && arr.length) selectedGraph.value = arr[0].value
}

nextTick(() => {
  handleTypeChange()
  renderGraph()
})
</script>

<style scoped>
.graph-view-container {
  padding: 20px;
}
.select-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.legend {
  display: flex;
  align-items: center;
  gap: 18px;
}
.legend-item {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-right: 4px;
}
.mastered {
  background: #5470C6;
}
.learning {
  background: #91CC75;
}
.notstart {
  background: #FAC858;
}
.graph-chart {
  width: 100%;
  height: 480px;
  background: #fff;
  border-radius: 8px;
}
.detail-card {
  margin-top: 24px;
  padding: 18px 24px;
  background: #f7f8fa;
  border-radius: 8px;
  box-shadow: 0 1px 4px #0001;
}
.detail-title {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}
.detail-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}
.detail-related {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}
</style>
