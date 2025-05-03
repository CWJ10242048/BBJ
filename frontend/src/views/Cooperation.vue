<template>
  <div class="coop-container">
    <h2>协作空间</h2>
    <div class="top-bar">
      <el-button type="primary" @click="dialogVisible = true">发起集体备课</el-button>
      <el-select v-model="filterSubject" placeholder="全部学科" style="width:140px;margin-left:20px;">
        <el-option label="全部学科" value="" />
        <el-option label="计算机" value="计算机" />
        <el-option label="数学" value="数学" />
        <el-option label="人工智能" value="人工智能" />
        <el-option label="大数据" value="大数据" />
      </el-select>
      <el-input v-model="filterKeyword" placeholder="搜索课题/主持人" style="width:200px;margin-left:20px;" clearable />
    </div>
    <div class="coop-list">
      <el-card v-for="item in filteredList" :key="item.id" class="coop-card">
        <div class="coop-title">{{ item.title }}</div>
        <div class="coop-meta">
          主持人：{{ item.host }} | 学科范围：{{ item.subject }} | 备课时间：{{ item.time }}
        </div>
        <div class="coop-desc">{{ item.desc }}</div>
        <el-button type="primary" size="small" style="float:right;margin-top:8px;" @click="handleEnter(item)">进入备课</el-button>
      </el-card>
    </div>
    <!-- <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" @click="handleExport">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div> -->
    <el-dialog v-model="dialogVisible" title="发起集体备课" width="480px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="课题名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入课题名称" />
        </el-form-item>
        <el-form-item label="主持人" prop="host">
          <el-input v-model="form.host" placeholder="请输入主持人姓名" />
        </el-form-item>
        <el-form-item label="学科范围" prop="subject">
          <el-select v-model="form.subject" placeholder="请选择学科">
            <el-option label="计算机" value="计算机" />
            <el-option label="数学" value="数学" />
            <el-option label="人工智能" value="人工智能" />
            <el-option label="大数据" value="大数据" />
          </el-select>
        </el-form-item>
        <el-form-item label="备课时间" prop="time">
          <el-date-picker v-model="form.time" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="简介" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="上传文件" prop="file">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="false"
            @change="handleFileChange"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.rar,.py,.cpp,.java,.txt"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持PDF、Word、PPT、图片、代码等格式</div>
            </template>
          </el-upload>
          <div v-if="form.fileName" class="file-info">
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ form.fileName }}</span>
            <el-button type="danger" link @click="removeFile">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <div style="text-align:right;margin-top:10px;">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">发起</el-button>
      </div>
    </el-dialog>
    <el-dialog v-model="previewVisible" title="协作课题预览" width="480px" destroy-on-close>
      <div class="preview-content">
        <h2 style="text-align:center;">{{ form.title }}</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="主持人">{{ form.host }}</el-descriptions-item>
          <el-descriptions-item label="学科范围">{{ form.subject }}</el-descriptions-item>
          <el-descriptions-item label="备课时间">{{ form.time && form.time.length ? form.time[0] + ' 至 ' + form.time[1] : '' }}</el-descriptions-item>
          <el-descriptions-item label="简介"><pre class="desc-pre">{{ form.desc }}</pre></el-descriptions-item>
          <el-descriptions-item label="上传文件">
            <span v-if="form.fileName">已上传文件</span>
            <span v-else>无</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
    <el-dialog v-model="coopDetailVisible" :title="selectedCoopItem?.title + ' - 备课详情'" width="600px" destroy-on-close>
       <div v-if="selectedCoopItem" class="detail-dialog-content">
         <h3 class="section-title">基本信息</h3>
         <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="主持人">{{ selectedCoopItem.host }}</el-descriptions-item>
            <el-descriptions-item label="学科范围">{{ selectedCoopItem.subject }}</el-descriptions-item>
            <el-descriptions-item label="备课时间">{{ selectedCoopItem.time }}</el-descriptions-item>
            <el-descriptions-item label="简介">{{ selectedCoopItem.desc }}</el-descriptions-item>
          </el-descriptions>

         <h3 class="section-title">参与人员</h3>
         <div class="member-list">
            <el-tag v-for="member in selectedCoopItem.members" :key="member" class="member-tag" type="info" size="small">
              {{ member }}
            </el-tag>
         </div>

         <h3 class="section-title">备课任务</h3>
         <div v-for="(stageData, stage) in selectedCoopItem.tasks" :key="stage" class="task-stage">
           <div class="stage-name">
             <span>{{ stage }} ({{ stageData.stageMembers.length }}/{{ maxStageMembers }}人)</span>
              <el-button
                v-if="stageData.stageMembers.length < maxStageMembers && stageData.taskList.some(task => task.status !== '已完成')"
                type="primary"
                link
                size="small"
                @click="handleJoinStage(String(stage))"
              >
                加入
              </el-button>
           </div>
           <div v-if="stageData.taskList.length > 0">
             <div v-for="task in stageData.taskList" :key="task.id" class="task-item">
                <div>
                  <span class="task-content">{{ task.content }}</span>
                  <span class="task-responsible">
                     <el-tag v-for="person in task.responsible" :key="person" size="small" type="info" effect="plain">
                       {{ person }}
                     </el-tag>
                  </span>
                </div>
                <el-tag
                  :type="task.status === '已完成' ? 'success' : task.status === '进行中' ? 'warning' : 'info'"
                  size="small"
                  class="task-status"
                >
                  {{ task.status }}
                </el-tag>
             </div>
           </div>
           <div v-else style="color: #999; font-size: 13px; padding: 5px 0;">暂无任务</div>
         </div>
       </div>
       <template #footer>
        <span class="dialog-footer">
          <el-button @click="coopDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Delete } from '@element-plus/icons-vue'

// --- 新增类型定义 ---
interface Task {
  id: string;
  content: string;
  status: '未开始' | '进行中' | '已完成';
  responsible: string[]; // 修改：负责人可以是多人
}

// 修改 Tasks 结构
interface StageTasks {
  taskList: Task[];
  stageMembers: string[]; // 新增：负责该阶段的成员
}

interface Tasks {
  [stage: string]: StageTasks;
}

interface CoopItem {
  id: number;
  title: string;
  host: string;
  subject: string;
  time: string;
  desc: string;
  members: string[];
  tasks: Tasks;
}
// --- 结束新增类型定义 ---

const dialogVisible = ref(false)
const previewVisible = ref(false)
const coopDetailVisible = ref(false)
const selectedCoopItem = ref<CoopItem | null>(null)
const formRef = ref()
const filterSubject = ref('')
const filterKeyword = ref('')
const maxStageMembers = 3; // 定义每个阶段最大成员数

const form = ref({
  title: '',
  host: '',
  subject: '',
  time: [],
  desc: '',
  file: null,
  fileName: ''
})
const rules = {
  title: [{ required: true, message: '请输入课题名称', trigger: 'blur' }],
  host: [{ required: true, message: '请输入主持人', trigger: 'blur' }],
  subject: [{ required: true, message: '请选择学科', trigger: 'change' }],
  time: [{ required: true, message: '请选择备课时间', trigger: 'change' }],
  desc: [{ required: true, message: '请输入简介', trigger: 'blur' }]
}

// 定义备课阶段（用于创建新项目时的模板）
const preparationStages = [
  '教学大纲设计',
  '教案生成',
  '互动环节设计',
  'PPT生成',
  '图文资源生成',
  '习题生成'
];

const coopList = ref<CoopItem[]>([
  {
    id: 1,
    title: '数据结构',
    host: '李老师',
    subject: '计算机',
    time: '2025/03/01-至今',
    desc: '数据结构课程协作备课空间，共同设计教学方案和实验内容。',
    members: ['李老师', '张老师', '王助教', '刘学生代表'],
    tasks: {
      '教学大纲设计': {
        taskList: [
          { id: 't1-1', content: '完成第一、二章大纲初稿', status: '进行中', responsible: ['张老师'] },
          { id: 't1-2', content: '审核知识点覆盖度', status: '未开始', responsible: ['李老师', '张老师'] }
        ],
        stageMembers: ['李老师', '张老师']
      },
      '教案生成': {
        taskList: [
          { id: 't2-1', content: '栈与队列章节教案编写', status: '已完成', responsible: ['王助教', '李老师'] }
        ],
        stageMembers: ['李老师', '王助教']
      },
      '互动环节设计': {
        taskList: [
           { id: 't1-3', content: '设计课堂讨论题', status: '未开始', responsible: ['刘学生代表'] } // 占位任务
        ],
        stageMembers: ['刘学生代表'] // 人数未满
      },
      'PPT生成': {
        taskList: [
          { id: 't4-1', content: '制作绪论和链表部分的PPT', status: '进行中', responsible: ['张老师', '王助教'] }
        ],
        stageMembers: ['李老师', '张老师', '王助教'] // 人数已满
      },
      '图文资源生成': {
         taskList: [
           { id: 't1-5', content: '查找相关算法动画', status: '未开始', responsible: ['王助教', '刘学生代表'] } // 占位任务
         ],
        stageMembers: ['王助教', '刘学生代表'] // 人数未满
      },
      '习题生成': {
        taskList: [
          { id: 't6-1', content: '设计5道关于树的选择题', status: '未开始', responsible: ['李老师'] }
        ],
        stageMembers: ['李老师', '张老师']
      }
    }
  },
  {
    id: 2,
    title: '高等数学',
    host: '王老师',
    subject: '数学',
    time: '2025/02/15-至今',
    desc: '高等数学课程集体备课，聚焦难点讲解与案例分析。',
    members: ['王老师', '赵教授', '孙博士'],
    tasks: {
      '教学大纲设计': {
        taskList: [{ id: 't2-1-1', content: '微积分部分大纲细化', status: '已完成', responsible: ['赵教授', '王老师'] }],
        stageMembers: ['王老师', '赵教授']
      },
      '教案生成': {
        taskList: [
          { id: 't2-2-1', content: '极限章节教案讨论', status: '进行中', responsible: ['王老师', '孙博士'] },
          { id: 't2-2-2', content: '导数应用教案编写', status: '未开始', responsible: ['孙博士'] }
        ],
        stageMembers: ['王老师', '孙博士']
      },
      '互动环节设计': {
        taskList: [{ id: 't2-3-1', content: '设计课堂测验题目', status: '进行中', responsible: ['赵教授'] }],
        stageMembers: ['赵教授', '孙博士'] // 人数未满
      },
      'PPT生成': {
        taskList: [{ id: 't2-4-1', content: '制作泰勒公式PPT', status: '未开始', responsible: ['王老师', '孙博士'] }], // 占位任务
        stageMembers: ['王老师'] // 人数未满
      },
      '图文资源生成': {
        taskList: [{ id: 't2-5-1', content: '收集典型例题图解', status: '已完成', responsible: ['孙博士'] }],
        stageMembers: ['孙博士']
      },
      '习题生成': {
        taskList: [{ id: 't2-6-1', content: '编写积分练习题', status: '未开始', responsible: ['赵教授', '王老师'] }], // 占位任务
        stageMembers: ['赵教授', '王老师', '孙博士'] // 人数已满
      }
    }
  },
  {
    id: 3,
    title: '人工智能基础',
    host: '赵老师',
    subject: '人工智能',
    time: '2025/04/01-至今',
    desc: '人工智能基础课程协作空间，涵盖算法、应用与实验。',
    members: ['赵老师', '吴研究员', '周助教'],
    tasks: {
      '教学大纲设计': {
        taskList: [{ id: 't3-1-1', content: '确定AI伦理部分内容', status: '进行中', responsible: ['吴研究员'] }],
        stageMembers: ['赵老师', '吴研究员']
      },
      '教案生成': {
        taskList: [{id: 't3-2-1', content: '编写神经网络基础教案', status: '未开始', responsible: ['周助教']}], // 占位
        stageMembers: ['周助教'] // 未满
      },
      '互动环节设计': {
        taskList: [{ id: 't3-3-1', content: '设计AI应用案例讨论', status: '未开始', responsible: ['赵老师'] }],
        stageMembers: ['赵老师', '吴研究员']
      },
      'PPT生成': {
        taskList: [{ id: 't3-4-1', content: '完成机器学习基础PPT', status: '已完成', responsible: ['周助教'] }],
        stageMembers: ['周助教', '赵老师', '吴研究员'] // 已满
      },
      '图文资源生成': {
        taskList: [{id: 't3-5-1', content: '收集相关论文资料', status: '未开始', responsible: ['吴研究员']}], // 占位
        stageMembers: ['吴研究员'] // 未满
      },
      '习题生成': {
        taskList: [{ id: 't3-6-1', content: '编写搜索算法练习题', status: '进行中', responsible: ['赵老师'] }],
        stageMembers: ['赵老师', '周助教']
      }
    }
  },
  {
    id: 4,
    title: '大数据分析',
    host: '陈老师',
    subject: '大数据',
    time: '2025/03/10-至今',
    desc: '大数据分析课程集体备课，分享数据处理与可视化经验。',
    members: ['陈老师', '钱工程师', '李博士后'],
    tasks: {
      '教学大纲设计': {
        taskList: [{id: 't4-1-1', content: '确认课程目标与要求', status: '已完成', responsible: ['陈老师']}], // 占位
        stageMembers: ['陈老师', '钱工程师']
      },
      '教案生成': {
        taskList: [{ id: 't4-2-1', content: 'Hadoop HDFS 教案', status: '已完成', responsible: ['钱工程师'] }],
        stageMembers: ['钱工程师', '李博士后']
      },
      '互动环节设计': {
        taskList: [{id: 't4-3-1', content: '设计数据处理实践案例', status: '未开始', responsible: ['李博士后']}], // 占位
        stageMembers: ['李博士后'] // 未满
      },
      'PPT生成': {
        taskList: [{ id: 't4-4-1', content: '数据可视化工具介绍PPT', status: '进行中', responsible: ['陈老师'] }],
        stageMembers: ['陈老师', '钱工程师', '李博士后'] // 已满
      },
      '图文资源生成': {
        taskList: [{ id: 't4-5-1', content: '整理常用数据集链接', status: '未开始', responsible: ['钱工程师'] }],
        stageMembers: ['钱工程师'] // 未满
      },
      '习题生成': {
        taskList: [{id: 't4-6-1', content: '编写MapReduce习题', status: '未开始', responsible: ['李博士后']}], // 占位
        stageMembers: ['李博士后', '陈老师']
      }
    }
  },
  {
    id: 5,
    title: '操作系统原理',
    host: '孙老师',
    subject: '计算机',
    time: '2025/05/01-至今',
    desc: '操作系统核心概念、进程管理、内存管理等内容的协作备课。',
    members: ['孙老师', '冯老师', '杨助教'],
    tasks: {
      '教学大纲设计': {
        taskList: [{ id: 't5-1-1', content: '审核内存管理章节大纲', status: '未开始', responsible: ['冯老师'] }],
        stageMembers: ['孙老师', '冯老师']
      },
      '教案生成': {
        taskList: [{ id: 't5-2-1', content: '进程同步教案初稿', status: '进行中', responsible: ['孙老师'] }],
        stageMembers: ['孙老师', '杨助教']
      },
      '互动环节设计': {
        taskList: [{id: 't5-3-1', content: '设计哲学家就餐问题讨论', status: '未开始', responsible: ['杨助教']}], // 占位
        stageMembers: ['杨助教'] // 未满
      },
      'PPT生成': {
        taskList: [{id: 't5-4-1', content: '制作文件系统PPT', status: '未开始', responsible: ['冯老师']}], // 占位
        stageMembers: ['冯老师', '孙老师', '杨助教'] // 已满
      },
      '图文资源生成': {
        taskList: [{id: 't5-5-1', content: '查找进程调度算法演示', status: '未开始', responsible: ['孙老师']}], // 占位
        stageMembers: ['孙老师'] // 未满
      },
      '习题生成': {
        taskList: [{ id: 't5-6-1', content: '设计死锁相关的编程题', status: '已完成', responsible: ['杨助教'] }],
        stageMembers: ['杨助教', '冯老师']
      }
    }
  },
  {
    id: 6,
    title: '线性代数',
    host: '周老师',
    subject: '数学',
    time: '2025/04/20-至今',
    desc: '线性代数课程的教学资源共享与习题库建设。',
    members: ['周老师', '吴老师'],
    tasks: {
      '教学大纲设计': {
        taskList: [{id: 't6-1-1', content: '完善矩阵理论部分大纲', status: '未开始', responsible: ['吴老师']}], // 占位
        stageMembers: ['周老师', '吴老师']
      },
      '教案生成': {
        taskList: [{id: 't6-2-1', content: '编写行列式计算教案', status: '未开始', responsible: ['周老师']}], // 占位
        stageMembers: ['周老师'] // 未满
      },
      '互动环节设计': {
        taskList: [{ id: 't6-3-1', content: '矩阵运算在线练习设计', status: '进行中', responsible: ['吴老师'] }],
        stageMembers: ['吴老师'] // 未满
      },
      'PPT生成': {
        taskList: [{ id: 't6-4-1', content: '向量空间PPT整理', status: '已完成', responsible: ['周老师'] }],
        stageMembers: ['周老师', '吴老师'] // 已满，但实际只有2人
      },
      '图文资源生成': {
        taskList: [{id: 't6-5-1', content: '收集线性方程组应用案例', status: '未开始', responsible: ['吴老师']}], // 占位
        stageMembers: ['吴老师', '周老师']
      },
      '习题生成': {
        taskList: [{ id: 't6-6-1', content: '特征值与特征向量习题收集', status: '未开始', responsible: ['周老师'] }],
        stageMembers: ['周老师', '吴老师']
      }
    }
  },
  {
    id: 7,
    title: '机器学习入门',
    host: '吴老师',
    subject: '人工智能',
    time: '2025/06/01-至今',
    desc: '面向初学者的机器学习课程，共同探讨教学案例与实践项目。',
    members: ['吴老师', '郑老师', '刘实习生'],
    tasks: {
      '教学大纲设计': {
        taskList: [{ id: 't7-1-1', content: '完成课程大纲终稿', status: '已完成', responsible: ['吴老师'] }],
        stageMembers: ['吴老师', '郑老师']
      },
      '教案生成': {
        taskList: [{ id: 't7-2-1', content: '决策树章节教案编写', status: '进行中', responsible: ['郑老师'] }],
        stageMembers: ['郑老师', '刘实习生']
      },
      '互动环节设计': {
        taskList: [{id: 't7-3-1', content: '设计模型评估方法讨论', status: '未开始', responsible: ['刘实习生']}], // 占位
        stageMembers: ['刘实习生'] // 未满
      },
      'PPT生成': {
        taskList: [{id: 't7-4-1', content: '制作聚类算法PPT', status: '未开始', responsible: ['吴老师']}], // 占位
        stageMembers: ['吴老师', '郑老师', '刘实习生'] // 已满
      },
      '图文资源生成': {
        taskList: [{ id: 't7-5-1', content: '寻找合适的入门项目数据集', status: '未开始', responsible: ['郑老师'] }],
        stageMembers: ['郑老师'] // 未满
      },
      '习题生成': {
        taskList: [{id: 't7-6-1', content: '编写回归模型练习题', status: '未开始', responsible: ['刘实习生']}], // 占位
        stageMembers: ['刘实习生', '吴老师']
      }
    }
  },
  {
    id: 8,
    title: '云计算技术',
    host: '郑老师',
    subject: '大数据',
    time: '2025/05/15-至今',
    desc: '云计算基础架构、服务模型及应用的集体备课与资源整合。',
    members: ['郑老师', '王架构师'],
    tasks: {
      '教学大纲设计': {
        taskList: [{id: 't8-1-1', content: '确定虚拟化技术内容', status: '未开始', responsible: ['王架构师']}], // 占位
        stageMembers: ['郑老师', '王架构师']
      },
      '教案生成': {
        taskList: [{id: 't8-2-1', content: '编写容器技术教案', status: '未开始', responsible: ['郑老师']}], // 占位
        stageMembers: ['郑老师'] // 未满
      },
      '互动环节设计': {
        taskList: [{ id: 't8-3-1', content: '设计云服务选型讨论案例', status: '进行中', responsible: ['王架构师'] }],
        stageMembers: ['王架构师'] // 未满
      },
      'PPT生成': {
        taskList: [{ id: 't8-4-1', content: 'IaaS, PaaS, SaaS对比PPT', status: '已完成', responsible: ['郑老师'] }],
        stageMembers: ['郑老师', '王架构师'] // 已满，但只有2人
      },
      '图文资源生成': {
        taskList: [{id: 't8-5-1', content: '收集主流云平台文档链接', status: '未开始', responsible: ['王架构师']}], // 占位
        stageMembers: ['王架构师', '郑老师']
      },
      '习题生成': {
        taskList: [{id: 't8-6-1', content: '编写云安全相关习题', status: '未开始', responsible: ['郑老师']}], // 占位
        stageMembers: ['郑老师', '王架构师']
      }
    }
  }
])

const filteredList = computed(() => {
  let list = coopList.value
  if (filterSubject.value) {
    list = list.filter(r => r.subject === filterSubject.value)
  }
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    list = list.filter(r => r.title.toLowerCase().includes(kw) || r.host.toLowerCase().includes(kw))
  }
  return list
})

const handleFileChange = (file: any) => {
  form.value.file = file.raw
  form.value.fileName = file.name
  ElMessage.success('文件选择成功')
}
const removeFile = () => {
  form.value.file = null
  form.value.fileName = ''
}
const beforeUpload = (file: File) => {
  return true
}

// 新增：格式化日期范围辅助函数
const formatDateRange = (timeRange: (Date | number)[] | null): string => {
  if (!timeRange || timeRange.length !== 2) {
    return '';
  }
  try {
    const start = new Date(timeRange[0]);
    const end = new Date(timeRange[1]);
    // 手动格式化为 YYYY/MM/DD
    const startStr = `${start.getFullYear()}/${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}`;
    const endStr = `${end.getFullYear()}/${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}`;
    return `${startStr} - ${endStr}`;
  } catch (e) {
    console.error("Error formatting date range:", e);
    return ''; // 出错时返回空字符串
  }
};

const handleCreate = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()

    // 创建新项目时，包含 members 和 tasks
    // 格式化日期
    const timeString = formatDateRange(form.value.time as (Date | number)[]); // 使用辅助函数并断言类型

    const newCoopItem: CoopItem = {
      id: Date.now(),
      title: form.value.title,
      host: form.value.host,
      subject: form.value.subject,
      time: timeString, // 使用格式化后的字符串
      desc: form.value.desc,
      members: [form.value.host], // 默认主持人为成员
      tasks: preparationStages.reduce((acc, stage) => {
        acc[stage] = { taskList: [], stageMembers: [form.value.host] }; // 正确初始化 StageTasks 结构
        return acc;
      }, {} as Tasks)
    };

    coopList.value.unshift(newCoopItem) // 添加完整结构的对象

    dialogVisible.value = false
    formRef.value.resetFields()
    form.value = { title: '', host: '', subject: '', time: [], desc: '', file: null, fileName: '' }
    ElMessage.success('发起成功')
  } catch {
    ElMessage.error('请填写完整信息')
  }
}
const handleEnter = (item: CoopItem) => {
  selectedCoopItem.value = item;
  coopDetailVisible.value = true;
}
const handleSave = async () => {
  ElMessage.success('保存成功')
}
const handlePreview = () => {
  previewVisible.value = true
}
const handleExport = () => {
  ElMessage.success('导出成功')
}
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = { title: '', host: '', subject: '', time: [], desc: '', file: null, fileName: '' }
}

// 新增：处理加入阶段的函数
const handleJoinStage = (stageName: string) => {
  // 这里仅做提示，实际应用可能需要调用API发送请求
  ElMessage.info(`已发送加入【${stageName}】阶段的申请`);
  // 可以在这里添加逻辑，例如更新UI状态或禁用按钮
}
</script>

<style scoped>
.coop-container {
  padding: 20px;
}
.top-bar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.coop-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 32px;
}
.coop-card {
  flex: 1 1 300px;
  max-width: calc(50% - 9px);
  box-sizing: border-box;
  background: #fcf9f7;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 22px 28px 18px 28px;
}
.coop-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #a55;
}
.coop-meta {
  font-size: 14px;
  color: #7a6d6d;
  margin-bottom: 4px;
}
.coop-desc {
  font-size: 15px;
  color: #444;
  margin-bottom: 8px;
  min-height: 32px;
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
.desc-pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}
.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}
.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upload-demo {
  margin-bottom: 10px;
}
.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
.detail-dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}
.section-title:first-child {
  margin-top: 0;
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.member-tag {
  margin-bottom: 5px;
}

.task-stage {
  margin-bottom: 15px;
}

.stage-name {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
  display: flex; /* 让按钮能和文字在同一行 */
  justify-content: space-between; /* 让文字和按钮分开 */
  align-items: center; /* 垂直居中 */
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 14px;
  border-bottom: 1px dashed #eee;
}
.task-item:last-child {
  border-bottom: none;
}

.task-content {
  color: #606266;
  margin-right: 10px; /* 给负责人留出空间 */
}

.task-responsible {
  font-size: 12px;
  color: #909399;
  display: inline-flex; /* 改为 inline-flex 以容纳多个标签 */
  gap: 4px; /* 标签间距 */
  margin-left: 8px; /* 与任务内容间距 */
}

.task-status {
  font-size: 12px;
}
</style>
