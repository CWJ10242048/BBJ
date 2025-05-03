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

// 每个图谱的节点和关系
const graphDataMap: Record<string, { nodes: GraphNode[]; links: { source: string; target: string }[] }> = {
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
      { name: 'Web开发', status: 'learning' },
      { name: '计算机图形学', status: 'notstart' },
      { name: '数字逻辑设计', status: 'mastered' },
      { name: '汇编语言', status: 'learning' }
    ],
    links: [
      { source: 'C语言程序设计', target: '数据结构' },
      { source: '数据结构', target: '操作系统' },
      { source: '数据结构', target: '数据库系统' },
      { source: '数据结构', target: '算法设计与分析' }, // 补充
      { source: '离散数学', target: '编译原理' },
      { source: '离散数学', target: '数据结构' }, // 补充
      { source: '操作系统', target: '操作系统实验' },
      { source: '计算机组成原理', target: '操作系统' },
      { source: '计算机组成原理', target: '网络安全' },
      { source: '计算机组成原理', target: '汇编语言' }, // 补充
      { source: '计算机组成原理', target: '数字逻辑设计' }, // 补充
      { source: '计算机网络', target: '网络安全' },
      { source: '计算机网络', target: 'Web开发' }, // 补充
      { source: '面向对象程序设计', target: '软件工程' },
      { source: '面向对象程序设计', target: 'Web开发' }, // 补充
      { source: '软件工程', target: 'Web开发' },
      { source: '人工智能', target: '信息安全' },
      { source: '数据库系统', target: 'Web开发' },
      { source: 'Web开发', target: '网络安全' },
      { source: '信息安全', target: '网络安全' },
      { source: '离散数学', target: '人工智能' },
      { source: '数据结构', target: '计算机图形学' }, // 补充
      { source: '数字逻辑设计', target: '计算机组成原理' } // 补充
    ]
  },
  algo: {
    nodes: [
      { name: '算法基础', status: 'learning' },
      { name: '排序算法', status: 'learning' },
      { name: '分治算法', status: 'mastered' },
      { name: '贪心算法', status: 'mastered' },
      { name: '搜索算法 (BFS, DFS)', status: 'notstart' },
      { name: '动态规划', status: 'notstart' },
      { name: '递归与分治', status: 'learning' },
      { name: '回溯算法', status: 'notstart' },
      { name: '图算法 (Dijkstra, Floyd)', status: 'learning' },
      { name: '最短路径算法', status: 'notstart' },
      { name: '最小生成树 (Prim, Kruskal)', status: 'learning' },
      { name: '字符串算法 (KMP)', status: 'notstart' },
      { name: '数论算法', status: 'learning' },
      { name: '并查集', status: 'notstart' },
      { name: '堆与优先队列', status: 'mastered' },
      { name: '计算几何', status: 'notstart' },
      { name: '近似算法', status: 'learning' },
      { name: '随机化算法', status: 'mastered' }
    ],
    links: [
      { source: '算法基础', target: '排序算法' },
      { source: '算法基础', target: '递归与分治' },
      { source: '算法基础', target: '搜索算法 (BFS, DFS)' },
      { source: '算法基础', target: '图算法 (Dijkstra, Floyd)' }, // 补充
      { source: '递归与分治', target: '分治算法' },
      { source: '分治算法', target: '回溯算法' },
      { source: '分治算法', target: '动态规划' }, // 补充
      { source: '算法基础', target: '贪心算法' },
      { source: '贪心算法', target: '最小生成树 (Prim, Kruskal)' },
      { source: '贪心算法', target: '近似算法' }, // 补充
      { source: '搜索算法 (BFS, DFS)', target: '图算法 (Dijkstra, Floyd)' },
      { source: '搜索算法 (BFS, DFS)', target: '回溯算法' }, // 补充
      { source: '图算法 (Dijkstra, Floyd)', target: '最短路径算法' },
      { source: '图算法 (Dijkstra, Floyd)', target: '并查集' },
      { source: '图算法 (Dijkstra, Floyd)', target: '最小生成树 (Prim, Kruskal)' }, // 补充
      { source: '算法基础', target: '动态规划' },
      { source: '动态规划', target: '堆与优先队列' },
      { source: '算法基础', target: '字符串算法 (KMP)' },
      { source: '算法基础', target: '数论算法' },
      { source: '算法基础', target: '计算几何' }, // 补充
      { source: '排序算法', target: '堆与优先队列' },
      { source: '算法基础', target: '随机化算法' }, // 补充
      { source: '近似算法', target: '随机化算法' } // 补充
    ]
  },
  se: { // 软件工程
    nodes: [
      { name: '需求分析', status: 'mastered' }, { name: '系统设计', status: 'learning' },
      { name: '软件测试', status: 'notstart' }, { name: '项目管理', status: 'mastered' },
      { name: '版本控制 (Git)', status: 'learning' }, { name: '敏捷开发 (Scrum)', status: 'notstart' },
      { name: '软件架构', status: 'learning' }, { name: 'UML建模', status: 'mastered' },
      { name: '持续集成/持续部署 (CI/CD)', status: 'learning' },
      { name: '软件质量保证 (SQA)', status: 'notstart' },
      { name: '设计模式', status: 'mastered' }
    ],
    links: [
      { source: '需求分析', target: '系统设计' },
      { source: '需求分析', target: 'UML建模' }, // 补充
      { source: '系统设计', target: '软件架构' },
      { source: '系统设计', target: 'UML建模' },
      { source: '系统设计', target: '设计模式' }, // 补充
      { source: '软件架构', target: '软件测试' },
      { source: '软件架构', target: '设计模式' }, // 补充
      { source: '项目管理', target: '敏捷开发 (Scrum)' },
      { source: '敏捷开发 (Scrum)', target: '版本控制 (Git)' },
      { source: '敏捷开发 (Scrum)', target: '持续集成/持续部署 (CI/CD)' }, // 补充
      { source: '版本控制 (Git)', target: '持续集成/持续部署 (CI/CD)' }, // 补充
      { source: '软件测试', target: '软件质量保证 (SQA)' }, // 补充
      { source: '持续集成/持续部署 (CI/CD)', target: '软件质量保证 (SQA)' } // 补充
    ]
  },
  net: { // 网络工程
      nodes: [
        { name: 'TCP/IP协议栈', status: 'mastered' }, { name: '路由与交换技术', status: 'learning' },
        { name: '网络安全基础', status: 'notstart' }, { name: '无线网络技术 (Wi-Fi)', status: 'mastered' },
        { name: '网络管理与运维', status: 'learning' }, { name: '软件定义网络 (SDN)', status: 'notstart' },
        { name: '网络规划与设计', status: 'learning' },
        { name: '云计算网络', status: 'notstart' },
        { name: 'IPv6协议', status: 'mastered' }
      ],
      links: [
        { source: 'TCP/IP协议栈', target: '路由与交换技术' },
        { source: 'TCP/IP协议栈', target: '网络安全基础' },
        { source: 'TCP/IP协议栈', target: 'IPv6协议' }, // 补充
        { source: '路由与交换技术', target: '网络管理与运维' },
        { source: '路由与交换技术', target: '软件定义网络 (SDN)' },
        { source: '路由与交换技术', target: '网络规划与设计' }, // 补充
        { source: '网络安全基础', target: '无线网络技术 (Wi-Fi)' },
        { source: '网络规划与设计', target: '无线网络技术 (Wi-Fi)' }, // 补充
        { source: '网络规划与设计', target: '云计算网络' }, // 补充
        { source: '软件定义网络 (SDN)', target: '云计算网络' }, // 补充
        { source: '网络管理与运维', target: '网络安全基础' } // 补充
      ]
  },
  sec: { // 信息安全
      nodes: [
        { name: '密码学原理与应用', status: 'learning' }, { name: '网络攻防技术', status: 'mastered' },
        { name: '安全协议分析', status: 'notstart' }, { name: '操作系统安全', status: 'learning' },
        { name: '应急响应与取证', status: 'notstart' }, { name: '安全审计与合规', status: 'mastered' },
        { name: '数据安全与隐私保护', status: 'learning' },
        { name: '恶意代码分析与防御', status: 'notstart' },
        { name: 'Web安全', status: 'mastered' }
      ],
      links: [
        { source: '密码学原理与应用', target: '安全协议分析' },
        { source: '密码学原理与应用', target: '数据安全与隐私保护' }, // 补充
        { source: '安全协议分析', target: '网络攻防技术' },
        { source: '网络攻防技术', target: '操作系统安全' },
        { source: '网络攻防技术', target: '恶意代码分析与防御' }, // 补充
        { source: '网络攻防技术', target: 'Web安全' }, // 补充
        { source: '操作系统安全', target: '应急响应与取证' },
        { source: '操作系统安全', target: '安全审计与合规' },
        { source: '操作系统安全', target: '恶意代码分析与防御' }, // 补充
        { source: '应急响应与取证', target: '安全审计与合规' }, // 补充
        { source: '数据安全与隐私保护', target: '安全审计与合规' }, // 补充
        { source: 'Web安全', target: '数据安全与隐私保护' } // 补充
      ]
  },
   ai_major: { // 人工智能
    nodes: [
      { name: '机器学习算法', status: 'mastered' }, { name: '深度学习模型 (CNN, RNN, Transformer)', status: 'learning' },
      { name: '自然语言处理 (NLP)', status: 'notstart' }, { name: '计算机视觉 (CV)', status: 'learning' },
      { name: '强化学习', status: 'notstart' }, { name: '知识图谱构建与应用', status: 'mastered' },
      { name: '推荐系统原理与实践', status: 'learning' },
      { name: 'AI伦理与社会影响', status: 'notstart' },
      { name: '机器人学基础', status: 'mastered' }
    ],
    links: [
      { source: '机器学习算法', target: '深度学习模型 (CNN, RNN, Transformer)' },
      { source: '机器学习算法', target: '强化学习' },
      { source: '机器学习算法', target: '推荐系统原理与实践' }, // 补充
      { source: '深度学习模型 (CNN, RNN, Transformer)', target: '自然语言处理 (NLP)' },
      { source: '深度学习模型 (CNN, RNN, Transformer)', target: '计算机视觉 (CV)' },
      { source: '深度学习模型 (CNN, RNN, Transformer)', target: '机器人学基础' }, // 补充
      { source: '自然语言处理 (NLP)', target: '知识图谱构建与应用' },
      { source: '计算机视觉 (CV)', target: '机器人学基础' }, // 补充
      { source: '知识图谱构建与应用', target: '推荐系统原理与实践' }, // 补充
      { source: '机器学习算法', target: 'AI伦理与社会影响' }, // 补充
      { source: '强化学习', target: '机器人学基础' } // 补充
    ]
  },
  bigdata_major: { // 数据科学与大数据技术
      nodes: [
        { name: '分布式系统原理', status: 'mastered' }, { name: 'Hadoop生态系统 (HDFS, MapReduce, Hive)', status: 'learning' },
        { name: 'Spark核心与SQL', status: 'notstart' }, { name: '数据仓库与ETL', status: 'mastered' },
        { name: '数据挖掘算法', status: 'learning' }, { name: '实时计算 (Storm, Flink, Spark Streaming)', status: 'notstart' },
        { name: 'NoSQL数据库 (MongoDB, HBase, Redis)', status: 'learning' },
        { name: '数据可视化工具与技术', status: 'mastered' },
        { name: '大数据平台运维', status: 'notstart' }
      ],
      links: [
        { source: '分布式系统原理', target: 'Hadoop生态系统 (HDFS, MapReduce, Hive)' },
        { source: '分布式系统原理', target: 'NoSQL数据库 (MongoDB, HBase, Redis)' }, // 补充
        { source: 'Hadoop生态系统 (HDFS, MapReduce, Hive)', target: 'Spark核心与SQL' },
        { source: 'Hadoop生态系统 (HDFS, MapReduce, Hive)', target: '数据仓库与ETL' },
        { source: 'Hadoop生态系统 (HDFS, MapReduce, Hive)', target: '数据挖掘算法' }, // 补充
        { source: 'Spark核心与SQL', target: '实时计算 (Storm, Flink, Spark Streaming)' },
        { source: '数据仓库与ETL', target: '数据挖掘算法' },
        { source: '数据挖掘算法', target: '数据可视化工具与技术' }, // 补充
        { source: '实时计算 (Storm, Flink, Spark Streaming)', target: '大数据平台运维' }, // 补充
        { source: 'NoSQL数据库 (MongoDB, HBase, Redis)', target: '大数据平台运维' }, // 补充
        { source: 'Hadoop生态系统 (HDFS, MapReduce, Hive)', target: '大数据平台运维' } // 补充
      ]
  },
  iot: { // 物联网工程
      nodes: [
        { name: '传感器原理与应用', status: 'learning' }, { name: '嵌入式系统开发 (MCU, Linux)', status: 'mastered' },
        { name: '无线通信技术 (Zigbee, LoRa, NB-IoT)', status: 'notstart' }, { name: '物联网平台与协议 (MQTT, CoAP)', status: 'learning' },
        { name: '边缘计算技术', status: 'notstart' }, { name: '物联网安全与隐私', status: 'mastered' },
        { name: '低功耗广域网 (LPWAN)', status: 'notstart' },
        { name: '数据采集与处理', status: 'mastered' },
        { name: '物联网应用开发', status: 'learning' },
        { name: '物联网数据分析', status: 'learning' },
        { name: '智能家居应用', status: 'notstart' },
        { name: '工业物联网 (IIoT)', status: 'mastered' },
        { name: 'NB-IoT通信详解', status: 'learning' }
      ],
      links: [
        { source: '传感器原理与应用', target: '嵌入式系统开发 (MCU, Linux)' },
        { source: '传感器原理与应用', target: '数据采集与处理' }, // 补充
        { source: '嵌入式系统开发 (MCU, Linux)', target: '无线通信技术 (Zigbee, LoRa, NB-IoT)' },
        { source: '嵌入式系统开发 (MCU, Linux)', target: '边缘计算技术' }, // 补充
        { source: '无线通信技术 (Zigbee, LoRa, NB-IoT)', target: '物联网平台与协议 (MQTT, CoAP)' },
        { source: '无线通信技术 (Zigbee, LoRa, NB-IoT)', target: '低功耗广域网 (LPWAN)' }, // 补充
        { source: '物联网平台与协议 (MQTT, CoAP)', target: '边缘计算技术' },
        { source: '物联网平台与协议 (MQTT, CoAP)', target: '物联网安全与隐私' },
        { source: '物联网平台与协议 (MQTT, CoAP)', target: '物联网应用开发' }, // 补充
        { source: '边缘计算技术', target: '物联网安全与隐私' }, // 补充
        { source: '数据采集与处理', target: '物联网平台与协议 (MQTT, CoAP)' }, // 补充
        { source: '物联网应用开发', target: '数据采集与处理' }, // 补充
        { source: '数据采集与处理', target: '物联网数据分析' },
        { source: '物联网数据分析', target: '物联网应用开发' },
        { source: '物联网应用开发', target: '智能家居应用' },
        { source: '物联网应用开发', target: '工业物联网 (IIoT)' },
        { source: '无线通信技术 (Zigbee, LoRa, NB-IoT)', target: 'NB-IoT通信详解' },
        { source: 'NB-IoT通信详解', target: '低功耗广域网 (LPWAN)' },
        { source: '工业物联网 (IIoT)', target: '物联网安全与隐私' }
      ]
  },
  ml: { // 机器学习学科
      nodes: [
        { name: '线性回归与逻辑回归', status: 'mastered' }, { name: '支持向量机 (SVM)', status: 'learning' },
        { name: '决策树与随机森林', status: 'notstart' }, { name: '聚类算法 (K-Means, DBSCAN)', status: 'mastered' },
        { name: '降维方法 (PCA, LDA)', status: 'learning' }, { name: '贝叶斯分类器', status: 'notstart' },
        { name: '集成学习 (Boosting, Bagging)', status: 'learning' },
        { name: '模型评估与选择 (交叉验证)', status: 'mastered' },
        { name: '特征工程', status: 'notstart' },
        { name: '神经网络基础', status: 'learning' },
        { name: '过拟合与欠拟合', status: 'mastered' },
        { name: '模型正则化 (L1, L2)', status: 'notstart' },
        { name: '梯度下降优化', status: 'learning' }
      ],
      links: [
        { source: '线性回归与逻辑回归', target: '支持向量机 (SVM)' },
        { source: '线性回归与逻辑回归', target: '特征工程' }, // 补充
        { source: '支持向量机 (SVM)', target: '降维方法 (PCA, LDA)' },
        { source: '支持向量机 (SVM)', target: '模型评估与选择 (交叉验证)' }, // 补充
        { source: '决策树与随机森林', target: '聚类算法 (K-Means, DBSCAN)' },
        { source: '决策树与随机森林', target: '集成学习 (Boosting, Bagging)' }, // 补充
        { source: '聚类算法 (K-Means, DBSCAN)', target: '降维方法 (PCA, LDA)' }, // 补充
        { source: '贝叶斯分类器', target: '模型评估与选择 (交叉验证)' }, // 补充
        { source: '集成学习 (Boosting, Bagging)', target: '模型评估与选择 (交叉验证)' }, // 补充
        { source: '特征工程', target: '模型评估与选择 (交叉验证)' }, // 补充
        { source: '线性回归与逻辑回归', target: '神经网络基础' },
        { source: '神经网络基础', target: '梯度下降优化' },
        { source: '梯度下降优化', target: '过拟合与欠拟合' },
        { source: '过拟合与欠拟合', target: '模型正则化 (L1, L2)' },
        { source: '神经网络基础', target: '集成学习 (Boosting, Bagging)' },
        { source: '模型正则化 (L1, L2)', target: '模型评估与选择 (交叉验证)' }
      ]
  },
  sys: { // 计算机系统学科
      nodes: [
        { name: '进程与线程管理', status: 'mastered' }, { name: '内存管理 (虚拟内存, 分页)', status: 'learning' },
        { name: '文件系统与磁盘管理', status: 'notstart' }, { name: '并发编程与同步机制', status: 'mastered' },
        { name: '虚拟化技术 (Hypervisor)', status: 'learning' }, { name: '分布式系统一致性', status: 'notstart' },
        { name: 'I/O系统与设备驱动', status: 'learning' },
        { name: '操作系统安全机制', status: 'mastered' },
        { name: '实时操作系统原理', status: 'notstart' }
      ],
      links: [
        { source: '进程与线程管理', target: '内存管理 (虚拟内存, 分页)' },
        { source: '进程与线程管理', target: '并发编程与同步机制' },
        { source: '内存管理 (虚拟内存, 分页)', target: '文件系统与磁盘管理' },
        { source: '内存管理 (虚拟内存, 分页)', target: '虚拟化技术 (Hypervisor)' },
        { source: '文件系统与磁盘管理', target: 'I/O系统与设备驱动' }, // 补充
        { source: '并发编程与同步机制', target: '分布式系统一致性' },
        { source: '并发编程与同步机制', target: '实时操作系统原理' }, // 补充
        { source: '虚拟化技术 (Hypervisor)', target: '分布式系统一致性' }, // 补充
        { source: 'I/O系统与设备驱动', target: '操作系统安全机制' }, // 补充
        { source: '进程与线程管理', target: '操作系统安全机制' } // 补充
      ]
  },
  net_sub: { // 计算机网络学科
      nodes: [
        { name: 'OSI模型与TCP/IP模型', status: 'mastered' }, { name: '数据链路层协议 (Ethernet, PPP)', status: 'learning' },
        { name: '网络层协议 (IP, ICMP, ARP, RIP, OSPF, BGP)', status: 'notstart' }, { name: '传输层协议 (TCP, UDP)', status: 'mastered' },
        { name: '应用层协议 (HTTP, DNS, SMTP, FTP)', status: 'learning' }, { name: '网络协议分析工具 (Wireshark)', status: 'notstart' },
        { name: '网络地址转换 (NAT) 与子网划分', status: 'learning' },
        { name: '网络服务质量 (QoS)', status: 'mastered' },
        { name: '网络安全基础 (防火墙, VPN)', status: 'notstart' }
      ],
      links: [
        { source: 'OSI模型与TCP/IP模型', target: '数据链路层协议 (Ethernet, PPP)' },
        { source: '数据链路层协议 (Ethernet, PPP)', target: '网络层协议 (IP, ICMP, ARP, RIP, OSPF, BGP)' },
        { source: '数据链路层协议 (Ethernet, PPP)', target: '网络地址转换 (NAT) 与子网划分' }, // 补充
        { source: '网络层协议 (IP, ICMP, ARP, RIP, OSPF, BGP)', target: '传输层协议 (TCP, UDP)' },
        { source: '网络层协议 (IP, ICMP, ARP, RIP, OSPF, BGP)', target: '网络协议分析工具 (Wireshark)' },
        { source: '网络层协议 (IP, ICMP, ARP, RIP, OSPF, BGP)', target: '网络安全基础 (防火墙, VPN)' }, // 补充
        { source: '传输层协议 (TCP, UDP)', target: '应用层协议 (HTTP, DNS, SMTP, FTP)' },
        { source: '传输层协议 (TCP, UDP)', target: '网络服务质量 (QoS)' }, // 补充
        { source: '应用层协议 (HTTP, DNS, SMTP, FTP)', target: '网络协议分析工具 (Wireshark)' }, // 补充
        { source: '网络地址转换 (NAT) 与子网划分', target: '网络安全基础 (防火墙, VPN)' } // 补充
      ]
  },
  db: { // 数据库学科
      nodes: [
        { name: '关系模型与关系代数', status: 'mastered' }, { name: 'SQL语言 (DDL, DML, DCL)', status: 'learning' },
        { name: '数据库设计与范式理论', status: 'notstart' }, { name: '事务管理与并发控制 (锁, MVCC)', status: 'mastered' },
        { name: '数据库索引与查询优化', status: 'learning' }, { name: 'NoSQL数据库模型与应用', status: 'notstart' },
        { name: '数据库恢复与备份技术', status: 'learning' },
        { name: '分布式数据库与一致性', status: 'mastered' },
        { name: '数据仓库与OLAP技术', status: 'notstart' },
        { name: '数据库安全 (权限, 注入)', status: 'learning' },
        { name: '数据复制与同步', status: 'mastered' },
        { name: '内存数据库 (Redis)', status: 'notstart' },
        { name: '列式存储数据库', status: 'learning' }
      ],
      links: [
        { source: '关系模型与关系代数', target: 'SQL语言 (DDL, DML, DCL)' },
        { source: '关系模型与关系代数', target: '数据库设计与范式理论' }, // 补充
        { source: 'SQL语言 (DDL, DML, DCL)', target: '数据库设计与范式理论' },
        { source: 'SQL语言 (DDL, DML, DCL)', target: '数据库索引与查询优化' }, // 补充
        { source: '数据库设计与范式理论', target: '事务管理与并发控制 (锁, MVCC)' },
        { source: '事务管理与并发控制 (锁, MVCC)', target: '数据库索引与查询优化' },
        { source: '事务管理与并发控制 (锁, MVCC)', target: '数据库恢复与备份技术' }, // 补充
        { source: '关系模型与关系代数', target: 'NoSQL数据库模型与应用' },
        { source: '数据库恢复与备份技术', target: '分布式数据库与一致性' }, // 补充
        { source: '分布式数据库与一致性', target: '数据仓库与OLAP技术' }, // 补充
        { source: 'NoSQL数据库模型与应用', target: '分布式数据库与一致性' }, // 补充
        { source: '事务管理与并发控制 (锁, MVCC)', target: '数据库安全 (权限, 注入)' },
        { source: '数据库安全 (权限, 注入)', target: '数据库恢复与备份技术' },
        { source: '分布式数据库与一致性', target: '数据复制与同步' },
        { source: 'NoSQL数据库模型与应用', target: '内存数据库 (Redis)' },
        { source: '数据仓库与OLAP技术', target: '列式存储数据库' },
        { source: '数据库索引与查询优化', target: '内存数据库 (Redis)' }
      ]
  },
  prog: { // 程序设计技术
      nodes: [
        { name: '编程范式 (面向过程, 面向对象, 函数式)', status: 'mastered' }, { name: '面向对象设计原则 (SOLID)', status: 'learning' },
        { name: '函数式编程范式与高阶函数', status: 'notstart' }, { name: '常见设计模式及其应用', status: 'mastered' },
        { name: '代码风格、规范与重构技巧', status: 'learning' }, { name: '调试技术与性能分析工具', status: 'notstart' },
        { name: '单元测试、集成测试与TDD', status: 'learning' },
        { name: '并发与多线程编程基础', status: 'mastered' },
        { name: '元编程、反射与代码生成', status: 'notstart' }
      ],
      links: [
        { source: '编程范式 (面向过程, 面向对象, 函数式)', target: '面向对象设计原则 (SOLID)' },
        { source: '编程范式 (面向过程, 面向对象, 函数式)', target: '函数式编程范式与高阶函数' },
        { source: '面向对象设计原则 (SOLID)', target: '常见设计模式及其应用' },
        { source: '面向对象设计原则 (SOLID)', target: '代码风格、规范与重构技巧' }, // 补充
        { source: '函数式编程范式与高阶函数', target: '并发与多线程编程基础' }, // 补充
        { source: '常见设计模式及其应用', target: '代码风格、规范与重构技巧' },
        { source: '代码风格、规范与重构技巧', target: '调试技术与性能分析工具' },
        { source: '代码风格、规范与重构技巧', target: '单元测试、集成测试与TDD' }, // 补充
        { source: '调试技术与性能分析工具', target: '单元测试、集成测试与TDD' }, // 补充
        { source: '并发与多线程编程基础', target: '元编程、反射与代码生成' } // 补充
      ]
  },
  se_tech: { // 软件工程技术
      nodes: [
        { name: '需求获取、分析与建模', status: 'mastered' }, { name: '软件设计原则与架构模式', status: 'learning' },
        { name: '软件测试类型与方法 (黑盒, 白盒, 灰盒)', status: 'notstart' }, { name: '版本控制系统 (Git) 与协作流程', status: 'mastered' },
        { name: 'DevOps理念与实践 (CI/CD)', status: 'learning' }, { name: '软件质量度量与保证 (SQA)', status: 'notstart' },
        { name: '软件过程模型与方法论 (敏捷, RUP)', status: 'learning' },
        { name: '项目管理与估算技术', status: 'mastered' },
        { name: '软件维护与演化', status: 'notstart' }
      ],
      links: [
        { source: '软件过程模型与方法论 (敏捷, RUP)', target: '需求获取、分析与建模' }, // 补充
        { source: '需求获取、分析与建模', target: '软件设计原则与架构模式' },
        { source: '需求获取、分析与建模', target: '项目管理与估算技术' }, // 补充
        { source: '软件设计原则与架构模式', target: '软件测试类型与方法 (黑盒, 白盒, 灰盒)' },
        { source: '软件测试类型与方法 (黑盒, 白盒, 灰盒)', target: '软件质量度量与保证 (SQA)' },
        { source: '版本控制系统 (Git) 与协作流程', target: 'DevOps理念与实践 (CI/CD)' },
        { source: 'DevOps理念与实践 (CI/CD)', target: '软件质量度量与保证 (SQA)' }, // 补充
        { source: '项目管理与估算技术', target: '软件维护与演化' }, // 补充
        { source: '软件质量度量与保证 (SQA)', target: '软件维护与演化' }, // 补充
        { source: 'DevOps理念与实践 (CI/CD)', target: '软件维护与演化' } // 补充
      ]
  },
  data_proc: { // 数据处理技术
      nodes: [
        { name: '数据清洗、转换与集成', status: 'mastered' }, { name: 'ETL工具与流程设计', status: 'learning' },
        { name: '数据可视化原理与工具', status: 'notstart' }, { name: '特征工程技术与实践', status: 'mastered' },
        { name: '大数据存储技术 (HDFS, NoSQL)', status: 'learning' }, { name: '大数据计算框架 (MapReduce, Spark)', status: 'notstart' },
        { name: '流式数据处理技术 (Kafka, Flink)', status: 'learning' },
        { name: '数据挖掘核心算法', status: 'mastered' },
        { name: '数据质量管理', status: 'notstart' }
      ],
      links: [
        { source: '数据清洗、转换与集成', target: 'ETL工具与流程设计' },
        { source: '数据清洗、转换与集成', target: '特征工程技术与实践' },
        { source: '数据清洗、转换与集成', target: '数据质量管理' }, // 补充
        { source: 'ETL工具与流程设计', target: '大数据存储技术 (HDFS, NoSQL)' }, // 补充
        { source: 'ETL工具与流程设计', target: '大数据计算框架 (MapReduce, Spark)' },
        { source: '数据可视化原理与工具', target: '特征工程技术与实践' }, // 补充
        { source: '特征工程技术与实践', target: '数据挖掘核心算法' }, // 补充
        { source: '大数据存储技术 (HDFS, NoSQL)', target: '大数据计算框架 (MapReduce, Spark)' },
        { source: '大数据计算框架 (MapReduce, Spark)', target: '流式数据处理技术 (Kafka, Flink)' },
        { source: '流式数据处理技术 (Kafka, Flink)', target: '数据挖掘核心算法' } // 补充
      ]
  },
  ai_tech: { // 人工智能技术
      nodes: [
        { name: '神经网络模型 (MLP, CNN, RNN)', status: 'mastered' }, { name: '模型训练技巧与优化器', status: 'learning' },
        { name: '模型评估与性能度量', status: 'notstart' }, { name: '迁移学习与领域自适应', status: 'mastered' },
        { name: '模型压缩与加速', status: 'learning' }, { name: '自动化机器学习 (AutoML)', status: 'notstart' },
        { name: '深度学习平台与框架', status: 'learning' },
        { name: '模型部署与服务化', status: 'mastered' },
        { name: '模型可解释性与公平性', status: 'notstart' }
      ],
      links: [
        { source: '神经网络模型 (MLP, CNN, RNN)', target: '模型训练技巧与优化器' },
        { source: '神经网络模型 (MLP, CNN, RNN)', target: '深度学习平台与框架' }, // 补充
        { source: '模型训练技巧与优化器', target: '模型评估与性能度量' },
        { source: '模型训练技巧与优化器', target: '迁移学习与领域自适应' },
        { source: '模型训练技巧与优化器', target: '模型压缩与加速' }, // 补充
        { source: '模型评估与性能度量', target: '模型部署与服务化' },
        { source: '模型评估与性能度量', target: '模型可解释性与公平性' }, // 补充
        { source: '模型训练技巧与优化器', target: '自动化机器学习 (AutoML)' },
        { source: '深度学习平台与框架', target: '模型部署与服务化' }, // 补充
        { source: '迁移学习与领域自适应', target: '模型部署与服务化' }, // 补充
        { source: '模型压缩与加速', target: '模型部署与服务化' } // 补充
      ]
  },
  cloud_bigdata: { // 云计算与大数据技术
      nodes: [
        { name: '虚拟化与容器化技术', status: 'mastered' }, { name: '分布式文件系统与存储', status: 'learning' },
        { name: '分布式计算框架与模型', status: 'notstart' }, { name: '公有云平台服务 (AWS, Azure, GCP)', status: 'mastered' },
        { name: '私有云与混合云部署', status: 'learning' }, { name: '大数据处理与分析平台', status: 'notstart' },
        { name: 'Serverless与微服务架构', status: 'learning' },
        { name: '云原生技术与生态 (K8s)', status: 'mastered' },
        { name: '云安全与合规', status: 'notstart' }
      ],
      links: [
        { source: '虚拟化与容器化技术', target: '分布式文件系统与存储' },
        { source: '虚拟化与容器化技术', target: '分布式计算框架与模型' },
        { source: '虚拟化与容器化技术', target: '公有云平台服务 (AWS, Azure, GCP)' }, // 补充
        { source: '虚拟化与容器化技术', target: '云原生技术与生态 (K8s)' }, // 补充
        { source: '分布式文件系统与存储', target: '大数据处理与分析平台' },
        { source: '分布式计算框架与模型', target: '大数据处理与分析平台' }, // 补充
        { source: '公有云平台服务 (AWS, Azure, GCP)', target: '私有云与混合云部署' },
        { source: '公有云平台服务 (AWS, Azure, GCP)', target: 'Serverless与微服务架构' }, // 补充
        { source: '云原生技术与生态 (K8s)', target: 'Serverless与微服务架构' }, // 补充
        { source: '公有云平台服务 (AWS, Azure, GCP)', target: '云安全与合规' }, // 补充
        { source: '大数据处理与分析平台', target: '云安全与合规' } // 补充
      ]
  },
  basic_course: { // 计算机基础课程
      nodes: [
        { name: '计算机科学导论', status: 'mastered' }, { name: '数字逻辑与数字系统', status: 'learning' },
        { name: '线性代数及其应用', status: 'notstart' }, { name: '概率论与数理统计基础', status: 'mastered' },
        { name: '离散数学 (集合论, 图论, 逻辑)', status: 'learning' }, { name: 'C/C++程序设计基础', status: 'mastered' },
        { name: '大学物理基础', status: 'learning' },
        { name: '计算机导论', status: 'mastered' }, { name: '数字逻辑', status: 'learning' },
        { name: '线性代数', status: 'notstart' }, { name: '概率论', status: 'mastered' },
        { name: '离散数学', status: 'learning' }, { name: 'C语言', status: 'mastered' }
      ],
      links: [
        { source: '计算机导论', target: '数字逻辑' }, { source: '计算机导论', target: 'C语言' },
        { source: '线性代数', target: '概率论' }, { source: '离散数学', target: '概率论' },
        { source: '数字逻辑', target: '离散数学' }
      ]
  },
  core_course: { // 核心专业课程
      nodes: [
        { name: '数据结构', status: 'mastered' }, { name: '算法设计', status: 'learning' },
        { name: '操作系统原理', status: 'notstart' }, { name: '计算机网络原理', status: 'mastered' },
        { name: '数据库原理', status: 'learning' }, { name: '编译原理', status: 'notstart' }
      ],
      links: [
        { source: '数据结构', target: '算法设计' }, { source: '数据结构', target: '操作系统原理' },
        { source: '操作系统原理', target: '计算机网络原理' }, { source: '计算机网络原理', target: '数据库原理' },
        { source: '算法设计', target: '编译原理' }
      ]
  },
  optional_course: { // 选修课程
      nodes: [
        { name: 'Python编程', status: 'mastered' }, { name: 'Web开发技术', status: 'learning' },
        { name: '移动应用开发', status: 'notstart' }, { name: '信息安全技术', status: 'mastered' },
        { name: '机器学习入门', status: 'learning' }, { name: '云计算基础', status: 'notstart' }
      ],
      links: [
        { source: 'Python编程', target: 'Web开发技术' }, { source: 'Web开发技术', target: '移动应用开发' },
        { source: 'Python编程', target: '机器学习入门' }, { source: '机器学习入门', target: '云计算基础' },
        { source: 'Web开发技术', target: '信息安全技术' }
      ]
  },
  practice_course: { // 实践课程
      nodes: [
        { name: '操作系统实验', status: 'mastered' }, { name: '数据库课程设计', status: 'learning' },
        { name: '网络编程实践', status: 'notstart' }, { name: '软件工程实训', status: 'mastered' },
        { name: '编译技术实践', status: 'learning' }, { name: 'Web综合实践', status: 'notstart' }
      ],
      links: [
        { source: '操作系统实验', target: '网络编程实践' }, { source: '数据库课程设计', target: 'Web综合实践' },
        { source: '网络编程实践', target: '软件工程实训' }, { source: '软件工程实训', target: '编译技术实践' }
      ]
  },
  coding: { // 编程能力
      nodes: [
        { name: '语言掌握度', status: 'mastered' }, { name: '算法实现能力', status: 'learning' },
        { name: '代码风格与规范', status: 'notstart' }, { name: '调试与测试', status: 'mastered' },
        { name: '工具链使用', status: 'learning' }, { name: '性能优化', status: 'notstart' }
      ],
      links: [
        { source: '语言掌握度', target: '算法实现能力' }, { source: '算法实现能力', target: '性能优化' },
        { source: '语言掌握度', target: '代码风格与规范' }, { source: '代码风格与规范', target: '调试与测试' },
        { source: '调试与测试', target: '工具链使用' }
      ]
  },
  sys_design: { // 系统设计能力
      nodes: [
        { name: '需求理解', status: 'mastered' }, { name: '架构设计', status: 'learning' },
        { name: '模块划分', status: 'notstart' }, { name: '接口设计', status: 'mastered' },
        { name: '可扩展性', status: 'learning' }, { name: '可靠性', status: 'notstart' }
      ],
      links: [
        { source: '需求理解', target: '架构设计' }, { source: '架构设计', target: '模块划分' },
        { source: '模块划分', target: '接口设计' }, { source: '架构设计', target: '可扩展性' },
        { source: '架构设计', target: '可靠性' }
      ]
  },
  problem: { // 问题解决能力
      nodes: [
        { name: '问题定义', status: 'mastered' }, { name: '分析与诊断', status: 'learning' },
        { name: '方案设计', status: 'notstart' }, { name: '方案实施', status: 'mastered' },
        { name: '结果评估', status: 'learning' }, { name: '经验总结', status: 'notstart' }
      ],
      links: [
        { source: '问题定义', target: '分析与诊断' }, { source: '分析与诊断', target: '方案设计' },
        { source: '方案设计', target: '方案实施' }, { source: '方案实施', target: '结果评估' },
        { source: '结果评估', target: '经验总结' }
      ]
  },
  innovation: { // 创新能力
      nodes: [
        { name: '好奇心', status: 'mastered' }, { name: '发散思维', status: 'learning' },
        { name: '跨界学习', status: 'notstart' }, { name: '实验精神', status: 'mastered' },
        { name: '原型实现', status: 'learning' }, { name: '持续改进', status: 'notstart' }
      ],
      links: [
        { source: '好奇心', target: '发散思维' }, { source: '发散思维', target: '跨界学习' },
        { source: '跨界学习', target: '实验精神' }, { source: '实验精神', target: '原型实现' },
        { source: '原型实现', target: '持续改进' }
      ]
  },
  dev: { // 软件工程师
      nodes: [
        { name: '前端开发 (HTML/CSS/JS)', status: 'mastered' }, { name: '后端开发 (Java/Python/Go)', status: 'learning' },
        { name: '数据库管理 (SQL/NoSQL)', status: 'notstart' }, { name: '测试与运维 (Testing/DevOps)', status: 'mastered' },
        { name: '移动开发 (iOS/Android)', status: 'learning' }, { name: '全栈能力 (Full Stack)', status: 'notstart' },
        { name: 'API设计与开发 (RESTful/GraphQL)', status: 'mastered' },
        { name: '微服务架构', status: 'learning' },
        { name: '容器化技术 (Docker/K8s)', status: 'learning' },
        { name: '云原生开发 (Cloud Native)', status: 'notstart' }
      ],
      links: [
        { source: '前端开发 (HTML/CSS/JS)', target: '后端开发 (Java/Python/Go)' }, { source: '后端开发 (Java/Python/Go)', target: '数据库管理 (SQL/NoSQL)' },
        { source: '后端开发 (Java/Python/Go)', target: '测试与运维 (Testing/DevOps)' }, { source: '前端开发 (HTML/CSS/JS)', target: '移动开发 (iOS/Android)' },
        { source: '前端开发 (HTML/CSS/JS)', target: '全栈能力 (Full Stack)' }, { source: '后端开发 (Java/Python/Go)', target: '全栈能力 (Full Stack)' },
        { source: '后端开发 (Java/Python/Go)', target: 'API设计与开发 (RESTful/GraphQL)' },
        { source: 'API设计与开发 (RESTful/GraphQL)', target: '微服务架构' },
        { source: '微服务架构', target: '容器化技术 (Docker/K8s)' },
        { source: '容器化技术 (Docker/K8s)', target: '测试与运维 (Testing/DevOps)' },
        { source: '容器化技术 (Docker/K8s)', target: '云原生开发 (Cloud Native)' },
        { source: '全栈能力 (Full Stack)', target: '微服务架构' }
      ]
  },
  da: { // 数据分析师
      nodes: [
        { name: '业务理解', status: 'mastered' }, { name: '数据采集', status: 'learning' },
        { name: '数据处理', status: 'notstart' }, { name: '统计学知识', status: 'mastered' },
        { name: '数据可视化', status: 'learning' }, { name: '分析报告撰写', status: 'notstart' }
      ],
      links: [
        { source: '业务理解', target: '数据采集' }, { source: '数据采集', target: '数据处理' },
        { source: '数据处理', target: '统计学知识' }, { source: '统计学知识', target: '数据可视化' },
        { source: '数据可视化', target: '分析报告撰写' }
      ]
  },
  arch: { // 系统架构师
      nodes: [
        { name: '技术选型', status: 'mastered' }, { name: '高可用设计', status: 'learning' },
        { name: '高性能设计', status: 'notstart' }, { name: '安全性设计', status: 'mastered' },
        { name: '成本控制', status: 'learning' }, { name: '团队沟通', status: 'notstart' }
      ],
      links: [
        { source: '技术选型', target: '高可用设计' }, { source: '技术选型', target: '高性能设计' },
        { source: '高可用设计', target: '安全性设计' }, { source: '高性能设计', target: '成本控制' },
        { source: '技术选型', target: '团队沟通' }
      ]
  },
  ai_eng: { // 人工智能工程师
      nodes: [
        { name: '算法理解与选择', status: 'mastered' }, { name: '模型开发与调优', status: 'learning' },
        { name: '数据工程', status: 'notstart' }, { name: '模型部署与监控', status: 'mastered' },
        { name: '领域知识结合', status: 'learning' }, { name: '前沿技术跟踪', status: 'notstart' }
      ],
      links: [
        { source: '算法理解与选择', target: '模型开发与调优' }, { source: '模型开发与调优', target: '数据工程' },
        { source: '模型开发与调优', target: '模型部署与监控' }, { source: '算法理解与选择', target: '领域知识结合' },
        { source: '领域知识结合', target: '前沿技术跟踪' }
      ]
  },
  sec_exp: { // 网络安全专家
      nodes: [
        { name: '威胁建模', status: 'mastered' }, { name: '渗透测试', status: 'learning' },
        { name: '安全加固', status: 'notstart' }, { name: '应急响应处理', status: 'mastered' },
        { name: '安全策略制定', status: 'learning' }, { name: '合规与审计', status: 'notstart' }
      ],
      links: [
        { source: '威胁建模', target: '渗透测试' }, { source: '渗透测试', target: '安全加固' },
        { source: '安全加固', target: '应急响应处理' }, { source: '应急响应处理', target: '安全策略制定' },
        { source: '安全策略制定', target: '合规与审计' }
      ]
  },
  course_proj: { // 课程设计项目
      nodes: [
        { name: '选题与调研', status: 'mastered' }, { name: '方案设计', status: 'learning' },
        { name: '编码实现', status: 'notstart' }, { name: '测试与调试', status: 'mastered' },
        { name: '文档撰写', status: 'learning' }, { name: '成果答辩', status: 'notstart' }
      ],
      links: [
        { source: '选题与调研', target: '方案设计' }, { source: '方案设计', target: '编码实现' },
        { source: '编码实现', target: '测试与调试' }, { source: '测试与调试', target: '文档撰写' },
        { source: '文档撰写', target: '成果答辩' }
      ]
  },
  intern_proj: { // 实习项目
      nodes: [
        { name: '熟悉业务', status: 'mastered' }, { name: '任务分解', status: 'learning' },
        { name: '协作开发', status: 'notstart' }, { name: '代码Review', status: 'mastered' },
        { name: '项目上线', status: 'learning' }, { name: '实习总结', status: 'notstart' }
      ],
      links: [
        { source: '熟悉业务', target: '任务分解' }, { source: '任务分解', target: '协作开发' },
        { source: '协作开发', target: '代码Review' }, { source: '代码Review', target: '项目上线' },
        { source: '项目上线', target: '实习总结' }
      ]
  },
  grad_proj: { // 毕业设计项目
      nodes: [
        { name: '文献综述', status: 'mastered' }, { name: '系统设计', status: 'learning' },
        { name: '关键技术实现', status: 'notstart' }, { name: '性能评估', status: 'mastered' },
        { name: '论文撰写', status: 'learning' }, { name: '论文答辩', status: 'notstart' }
      ],
      links: [
        { source: '文献综述', target: '系统设计' }, { source: '系统设计', target: '关键技术实现' },
        { source: '关键技术实现', target: '性能评估' }, { source: '性能评估', target: '论文撰写' },
        { source: '论文撰写', target: '论文答辩' }
      ]
  },
  research_proj: { // 科研项目
      nodes: [
        { name: '问题提出', status: 'mastered' }, { name: '方案探索', status: 'learning' },
        { name: '实验设计', status: 'notstart' }, { name: '数据分析', status: 'mastered' },
        { name: '论文发表', status: 'learning' }, { name: '成果转化', status: 'notstart' }
      ],
      links: [
        { source: '问题提出', target: '方案探索' }, { source: '方案探索', target: '实验设计' },
        { source: '实验设计', target: '数据分析' }, { source: '数据分析', target: '论文发表' },
        { source: '论文发表', target: '成果转化' }
      ]
  },
  comp_math: { // 计算机与数学
      nodes: [
        { name: '计算理论', status: 'mastered' }, { name: '数值分析', status: 'learning' },
        { name: '图论', status: 'notstart' }, { name: '密码学基础', status: 'mastered' },
        { name: '优化理论', status: 'learning' }, { name: '统计建模', status: 'notstart' }
      ],
      links: [
        { source: '计算理论', target: '图论' }, { source: '数值分析', target: '优化理论' },
        { source: '图论', target: '密码学基础' }, { source: '优化理论', target: '统计建模' }
      ]
  },
  comp_phy: { // 计算机与物理学
      nodes: [
        { name: '计算物理', status: 'mastered' }, { name: '模拟仿真', status: 'learning' },
        { name: '高性能计算', status: 'notstart' }, { name: '量子计算', status: 'mastered' },
        { name: '物理信息学', status: 'learning' }, { name: '科学可视化', status: 'notstart' }
      ],
      links: [
        { source: '计算物理', target: '模拟仿真' }, { source: '模拟仿真', target: '高性能计算' },
        { source: '高性能计算', target: '量子计算' }, { source: '量子计算', target: '物理信息学' },
        { source: '模拟仿真', target: '科学可视化' }
      ]
  },
  comp_bio: { // 计算机与生物学
      nodes: [
        { name: '生物信息学基础', status: 'mastered' }, { name: '基因组学分析', status: 'learning' },
        { name: '蛋白质结构预测', status: 'notstart' }, { name: '计算神经科学', status: 'mastered' },
        { name: '药物设计与发现', status: 'learning' }, { name: '系统生物学建模', status: 'notstart' },
        { name: '转录组学分析 (RNA-Seq)', status: 'learning' },
        { name: '蛋白质组学数据处理', status: 'mastered' },
        { name: '生物数据可视化', status: 'notstart' },
        { name: '生物医学图像分析', status: 'learning' }
      ],
      links: [
        { source: '生物信息学基础', target: '基因组学分析' }, { source: '基因组学分析', target: '蛋白质结构预测' },
        { source: '生物信息学基础', target: '计算神经科学' }, { source: '计算神经科学', target: '药物设计与发现' },
        { source: '蛋白质结构预测', target: '系统生物学建模' },
        { source: '基因组学分析', target: '转录组学分析 (RNA-Seq)' },
        { source: '转录组学分析 (RNA-Seq)', target: '蛋白质组学数据处理' },
        { source: '蛋白质组学数据处理', target: '生物数据可视化' },
        { source: '生物信息学基础', target: '生物数据可视化' },
        { source: '计算神经科学', target: '生物医学图像分析' },
        { source: '药物设计与发现', target: '蛋白质结构预测' }
      ]
  },
  comp_econ: { // 计算机与经济学
      nodes: [
        { name: '计算经济学', status: 'mastered' }, { name: '金融科技', status: 'learning' },
        { name: '算法交易', status: 'notstart' }, { name: '计量经济模型', status: 'mastered' },
        { name: '区块链应用', status: 'learning' }, { name: '市场模拟', status: 'notstart' }
      ],
      links: [
        { source: '计算经济学', target: '金融科技' }, { source: '金融科技', target: '算法交易' },
        { source: '计量经济模型', target: '金融科技' }, { source: '金融科技', target: '区块链应用' },
        { source: '计算经济学', target: '市场模拟' }
      ]
  }
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
