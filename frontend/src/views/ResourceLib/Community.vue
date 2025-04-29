<template>
  <div class="community-container">
    <h2>资源社区</h2>
    <div class="top-bar">
      <el-button type="primary" @click="uploadDialogVisible = true">上传资源</el-button>
      <el-select v-model="filterType" placeholder="全部类型" style="width:140px;margin-left:20px;">
        <el-option label="全部类型" value="" />
        <el-option label="教案" value="教案" />
        <el-option label="课件" value="课件" />
        <el-option label="习题" value="习题" />
        <el-option label="教材" value="教材" />
      </el-select>
      <el-input v-model="filterKeyword" placeholder="搜索资源名称/标签" style="width:200px;margin-left:20px;" clearable />
      <el-select v-model="sortType" placeholder="排序" style="width:120px;margin-left:20px;">
        <el-option label="默认排序" value="default" />
        <el-option label="下载量最多" value="download" />
        <el-option label="评分最高" value="score" />
      </el-select>
    </div>
    <div class="resource-list">
      <div v-for="item in pagedList" :key="item.id" class="resource-card">
        <div class="res-title">{{ item.name }}</div>
        <div class="res-type">{{ item.type }}</div>
        <div class="res-desc">{{ item.desc }}</div>
        <div class="res-meta">
          <span>下载量 {{ item.downloads }}</span>
          <span style="margin-left:18px;">{{ item.score }} <el-rate v-model="item.score" disabled show-score :max="5" style="margin-left:2px;" /></span>
        </div>
        <div class="res-actions">
          <el-button size="small" type="success" @click="handleDownload(item)">下载</el-button>
          <el-button size="small" type="primary" @click="handlePreview(item)">预览</el-button>
          <el-button size="small" :type="item.liked ? 'primary' : 'info'" @click="handleLike(item)"><el-icon><i-ep-thumb-up /></el-icon> {{ item.likes }}</el-button>
          <el-button size="small" :type="item.disliked ? 'danger' : 'info'" @click="handleDislike(item)"><el-icon><i-ep-thumb-down /></el-icon> {{ item.dislikes }}</el-button>
        </div>
      </div>
    </div>
    <el-pagination
      v-if="filteredList.length > pageSize"
      background
      layout="prev, pager, next"
      :total="filteredList.length"
      :page-size="pageSize"
      v-model:current-page="currentPage"
      style="margin: 24px auto 0; display: flex; justify-content: center;"
    />
    <el-dialog v-model="uploadDialogVisible" title="上传资源" width="480px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入资源名称" />
        </el-form-item>
        <el-form-item label="资源类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="教案" value="教案" />
            <el-option label="课件" value="课件" />
            <el-option label="习题" value="习题" />
            <el-option label="教材" value="教材" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="请输入标签，多个标签用逗号分隔" />
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
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpload">上传</el-button>
      </div>
    </el-dialog>
    <el-dialog v-model="previewVisible" title="资源预览" width="480px" destroy-on-close>
      <div class="preview-content">
        <h2 style="text-align:center;">{{ previewItem.name }}</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="类型">{{ previewItem.type }}</el-descriptions-item>
          <el-descriptions-item label="简介"><pre class="desc-pre">{{ previewItem.desc }}</pre></el-descriptions-item>
          <el-descriptions-item label="标签">{{ previewItem.tags }}</el-descriptions-item>
          <el-descriptions-item label="下载量">{{ previewItem.downloads }}</el-descriptions-item>
          <el-descriptions-item label="评分">{{ previewItem.score }}</el-descriptions-item>
          <el-descriptions-item label="上传者">{{ previewItem.uploader }}</el-descriptions-item>
          <el-descriptions-item label="上传文件">
            <span v-if="previewItem.fileName">已上传文件</span>
            <span v-else>无</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>交流区</span>
        </div>
      </template>
      <div class="chat-list">
        <div v-for="msg in chatList" :key="msg.id" class="chat-item">
          <span class="chat-nick">{{ msg.nick }}</span>
          <span class="chat-time">{{ msg.time }}</span>
          <div class="chat-content">{{ msg.content }}</div>
        </div>
      </div>
      <div class="chat-input-row">
        <el-input v-model="chatInput" placeholder="畅所欲言，文明交流~" class="chat-input" />
        <el-button type="primary" @click="handleSend">发送</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Delete } from '@element-plus/icons-vue'
import { ThumbUp, ThumbDown } from '@element-plus/icons-vue'

const formRef = ref()
const uploadDialogVisible = ref(false)
const previewVisible = ref(false)
const previewItem = ref({})
const form = ref({
  name: '',
  type: '',
  desc: '',
  tags: '',
  file: null,
  fileName: ''
})
const rules = {
  name: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  desc: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  tags: [{ required: true, message: '请输入标签', trigger: 'blur' }]
}

const resourceList = ref([
  { id: 1, name: '高等数学第一章教案', type: '教案', desc: '包含教学目标、重难点分析、教学过程等完整教案内容', downloads: 156, score: 4.8, tags: '高数,教案', uploader: '李老师', fileName: '高数教案.pdf', likes: 12, dislikes: 1, liked: false, disliked: false },
  { id: 2, name: 'Python编程基础课件', type: '课件', desc: 'Python语言基础入门课件，包含代码示例和练习题', downloads: 243, score: 4.9, tags: 'Python,课件', uploader: '王老师', fileName: 'python课件.pptx', likes: 21, dislikes: 0, liked: false, disliked: false },
  { id: 3, name: '数据结构与算法习题集', type: '习题', desc: '包含常见数据结构和算法的练习题及解答', downloads: 189, score: 4.7, tags: '数据结构,算法,习题', uploader: '张老师', fileName: 'ds_algo_exercise.zip', likes: 9, dislikes: 2, liked: false, disliked: false },
  { id: 4, name: '机器学习实验指导书', type: '教材', desc: '机器学习课程实验指导材料，包含详细步骤和代码', downloads: 312, score: 4.9, tags: '机器学习,实验,教材', uploader: '赵老师', fileName: 'ml_lab.pdf', likes: 30, dislikes: 1, liked: false, disliked: false },
  { id: 5, name: 'C语言程序设计讲义', type: '课件', desc: 'C语言基础知识、语法、常用算法讲解', downloads: 201, score: 4.6, tags: 'C语言,课件', uploader: '陈老师', fileName: 'c_lang.pptx', likes: 15, dislikes: 0, liked: false, disliked: false },
  { id: 6, name: 'Java面向对象编程案例', type: '课件', desc: 'Java OOP核心概念与实战案例', downloads: 178, score: 4.7, tags: 'Java,OOP,案例', uploader: '孙老师', fileName: 'java_oop.pptx', likes: 18, dislikes: 1, liked: false, disliked: false },
  { id: 7, name: '数据库系统复习提纲', type: '教案', desc: '数据库系统知识点梳理与复习要点', downloads: 134, score: 4.5, tags: '数据库,教案,复习', uploader: '周老师', fileName: 'db_review.pdf', likes: 8, dislikes: 0, liked: false, disliked: false },
  { id: 8, name: '操作系统实验报告模板', type: '教材', desc: '操作系统实验报告标准模板，含格式说明', downloads: 156, score: 4.6, tags: '操作系统,实验,模板', uploader: '吴老师', fileName: 'os_lab_template.docx', likes: 10, dislikes: 0, liked: false, disliked: false },
  { id: 9, name: '线性代数知识点总结', type: '教案', desc: '线性代数各章节知识点归纳总结', downloads: 120, score: 4.4, tags: '线性代数,教案,总结', uploader: '郑老师', fileName: 'linear_algebra.pdf', likes: 7, dislikes: 0, liked: false, disliked: false },
  { id: 10, name: '深度学习入门PPT', type: '课件', desc: '深度学习基础理论与典型网络结构介绍', downloads: 210, score: 4.8, tags: '深度学习,课件', uploader: '钱老师', fileName: 'dl_intro.pptx', likes: 22, dislikes: 1, liked: false, disliked: false },
  { id: 11, name: '概率论与数理统计习题', type: '习题', desc: '概率论常见题型与详细解答', downloads: 98, score: 4.3, tags: '概率论,统计,习题', uploader: '冯老师', fileName: 'prob_stat_exercise.pdf', likes: 5, dislikes: 0, liked: false, disliked: false },
  { id: 12, name: 'Web开发项目实战', type: '教材', desc: 'Web开发全流程项目实战案例', downloads: 175, score: 4.7, tags: 'Web,开发,项目', uploader: '蒋老师', fileName: 'web_project.zip', likes: 13, dislikes: 1, liked: false, disliked: false },
  { id: 13, name: '人工智能导论讲义', type: '课件', desc: '人工智能发展历程与核心技术讲解', downloads: 142, score: 4.6, tags: '人工智能,讲义', uploader: '沈老师', fileName: 'ai_intro.pptx', likes: 11, dislikes: 0, liked: false, disliked: false },
  { id: 14, name: '数据分析实用工具包', type: '教材', desc: '数据分析常用工具与方法汇总', downloads: 199, score: 4.8, tags: '数据分析,工具,教材', uploader: '韩老师', fileName: 'data_tools.zip', likes: 17, dislikes: 0, liked: false, disliked: false },
  { id: 15, name: '网络安全基础习题', type: '习题', desc: '网络安全基础知识与典型攻防题目', downloads: 88, score: 4.2, tags: '网络安全,习题', uploader: '罗老师', fileName: 'netsec_exercise.pdf', likes: 4, dislikes: 1, liked: false, disliked: false },
  { id: 16, name: 'C++程序设计案例集', type: '课件', desc: 'C++常用算法与项目案例集锦', downloads: 132, score: 4.5, tags: 'C++,案例,课件', uploader: '贾老师', fileName: 'cpp_cases.pptx', likes: 8, dislikes: 0, liked: false, disliked: false },
  { id: 17, name: '操作系统原理讲义', type: '教案', desc: '操作系统核心原理与经典算法讲解', downloads: 110, score: 4.4, tags: '操作系统,教案', uploader: '石老师', fileName: 'os_principle.pdf', likes: 6, dislikes: 0, liked: false, disliked: false },
  { id: 18, name: 'JavaScript开发实战', type: '教材', desc: 'JavaScript开发技巧与项目实战', downloads: 160, score: 4.7, tags: 'JavaScript,开发,教材', uploader: '秦老师', fileName: 'js_dev.zip', likes: 12, dislikes: 1, liked: false, disliked: false },
  { id: 19, name: '数据可视化案例集', type: '课件', desc: '数据可视化常用方法与案例演示', downloads: 123, score: 4.6, tags: '数据可视化,案例,课件', uploader: '尤老师', fileName: 'dataviz.pptx', likes: 9, dislikes: 0, liked: false, disliked: false },
  { id: 20, name: '机器学习算法习题集', type: '习题', desc: '机器学习常见算法题及详细解析', downloads: 140, score: 4.8, tags: '机器学习,算法,习题', uploader: '陶老师', fileName: 'ml_algo_exercise.pdf', likes: 10, dislikes: 0, liked: false, disliked: false },
  { id: 21, name: '深度学习算法解析', type: '教材', desc: '深入解析深度学习中常用的算法与应用', downloads: 250, score: 4.8, tags: '深度学习,算法', uploader: '李老师', fileName: 'deep_learning_algo.pdf', likes: 22, dislikes: 0, liked: false, disliked: false },
  { id: 22, name: '图像处理课件', type: '课件', desc: '图像处理基础知识与常用算法介绍', downloads: 175, score: 4.7, tags: '图像处理,课件', uploader: '王老师', fileName: 'image_processing.pptx', likes: 19, dislikes: 1, liked: false, disliked: false },
  { id: 23, name: '操作系统实验指导书', type: '教材', desc: '操作系统课程实验指导书，包含详细步骤与代码', downloads: 300, score: 4.9, tags: '操作系统,实验,教材', uploader: '赵老师', fileName: 'os_lab_guide.pdf', likes: 33, dislikes: 0, liked: false, disliked: false },
  { id: 24, name: 'Java高级编程案例', type: '课件', desc: 'Java语言高级编程技巧与实际案例分析', downloads: 220, score: 4.6, tags: 'Java,高级编程,案例', uploader: '孙老师', fileName: 'java_advanced.pptx', likes: 24, dislikes: 1, liked: false, disliked: false },
  { id: 25, name: '数据库设计与实现', type: '教材', desc: '数据库设计原理及其实现方法', downloads: 280, score: 4.8, tags: '数据库,设计,教材', uploader: '陈老师', fileName: 'db_design.pdf', likes: 28, dislikes: 0, liked: false, disliked: false },
  { id: 26, name: '深度学习进阶课件', type: '课件', desc: '深度学习中的进阶知识与应用案例', downloads: 160, score: 4.7, tags: '深度学习,进阶,课件', uploader: '李老师', fileName: 'deep_learning_advanced.pptx', likes: 16, dislikes: 0, liked: false, disliked: false },
  { id: 27, name: '机器学习实战指南', type: '教材', desc: '机器学习应用与项目实战指南', downloads: 230, score: 4.9, tags: '机器学习,实战,教材', uploader: '赵老师', fileName: 'ml_practical_guide.pdf', likes: 34, dislikes: 1, liked: false, disliked: false },
  { id: 28, name: 'Python数据分析入门', type: '课件', desc: 'Python数据分析基础课程内容与实践案例', downloads: 210, score: 4.8, tags: 'Python,数据分析,入门', uploader: '吴老师', fileName: 'python_data_analysis.pptx', likes: 22, dislikes: 0, liked: false, disliked: false },
  { id: 29, name: '人工智能核心算法', type: '教材', desc: '人工智能领域核心算法及其应用案例', downloads: 180, score: 4.6, tags: '人工智能,算法,教材', uploader: '沈老师', fileName: 'ai_core_algo.pdf', likes: 14, dislikes: 0, liked: false, disliked: false },
  { id: 30, name: 'C#面向对象编程案例', type: '课件', desc: 'C#编程语言面向对象编程应用实例', downloads: 175, score: 4.7, tags: 'C#,OOP,案例', uploader: '石老师', fileName: 'csharp_oop.pptx', likes: 18, dislikes: 1, liked: false, disliked: false },
  { id: 31, name: '数据科学基础课件', type: '课件', desc: '数据科学基础概念及方法介绍', downloads: 190, score: 4.7, tags: '数据科学,基础,课件', uploader: '冯老师', fileName: 'data_science_intro.pptx', likes: 20, dislikes: 0, liked: false, disliked: false },
  { id: 32, name: '网络协议与安全讲义', type: '教案', desc: '计算机网络协议基础与网络安全讲解', downloads: 140, score: 4.5, tags: '网络协议,安全,教案', uploader: '罗老师', fileName: 'network_protocol_security.pdf', likes: 9, dislikes: 0, liked: false, disliked: false },
  { id: 33, name: '机器学习Python实战', type: '教材', desc: '使用Python实现常见的机器学习算法与案例', downloads: 250, score: 4.9, tags: 'Python,机器学习,实战', uploader: '赵老师', fileName: 'ml_python_practical.pdf', likes: 32, dislikes: 1, liked: false, disliked: false },
  { id: 34, name: 'Android开发入门教程', type: '教材', desc: 'Android应用开发基础与案例', downloads: 220, score: 4.8, tags: 'Android,开发,教程', uploader: '周老师', fileName: 'android_dev_intro.pdf', likes: 21, dislikes: 0, liked: false, disliked: false },
  { id: 35, name: 'Linux操作系统实战', type: '教材', desc: 'Linux操作系统的实际应用与管理技巧', downloads: 180, score: 4.6, tags: 'Linux,操作系统,实战', uploader: '沈老师', fileName: 'linux_practical.pdf', likes: 14, dislikes: 0, liked: false, disliked: false },
  { id: 36, name: '数据科学项目案例集', type: '教材', desc: '数据科学项目实战案例与经验分享', downloads: 160, score: 4.7, tags: '数据科学,项目,案例', uploader: '王老师', fileName: 'data_science_projects.pdf', likes: 17, dislikes: 1, liked: false, disliked: false },
  { id: 37, name: 'Java编程语言课程', type: '课件', desc: '深入讲解Java语言基础与面向对象编程', downloads: 210, score: 4.7, tags: 'Java,编程,课程', uploader: '赵老师', fileName: 'java_programming.pptx', likes: 22, dislikes: 1, liked: false, disliked: false },
  { id: 38, name: '数据库管理系统课件', type: '课件', desc: '数据库管理系统基础与操作演示', downloads: 220, score: 4.8, tags: '数据库,管理,课件', uploader: '张老师', fileName: 'db_management.pptx', likes: 25, dislikes: 0, liked: false, disliked: false },
  { id: 39, name: '大数据分析入门', type: '教材', desc: '大数据分析基础知识与应用场景', downloads: 210, score: 4.9, tags: '大数据,分析,入门', uploader: '韩老师', fileName: 'big_data_analysis_intro.pdf', likes: 28, dislikes: 0, liked: false, disliked: false },
  { id: 40, name: '机器学习理论与算法', type: '教材', desc: '机器学习的理论基础与常见算法讲解', downloads: 300, score: 4.9, tags: '机器学习,理论,算法', uploader: '李老师', fileName: 'ml_theory_algo.pdf', likes: 35, dislikes: 2, liked: false, disliked: false },
  { id: 41, name: 'Web前端开发基础', type: '课件', desc: 'Web前端开发常用技术与项目实战', downloads: 190, score: 4.6, tags: 'Web,前端,开发', uploader: '冯老师', fileName: 'web_frontend.pptx', likes: 20, dislikes: 0, liked: false, disliked: false },
  { id: 42, name: '深度学习实战案例', type: '教材', desc: '深度学习在实际项目中的应用案例', downloads: 220, score: 4.7, tags: '深度学习,实战,案例', uploader: '李老师', fileName: 'deep_learning_projects.pdf', likes: 24, dislikes: 0, liked: false, disliked: false },
  { id: 43, name: '区块链技术与应用', type: '教材', desc: '区块链技术原理与实际应用', downloads: 200, score: 4.8, tags: '区块链,技术,应用', uploader: '周老师', fileName: 'blockchain_tech.pdf', likes: 22, dislikes: 1, liked: false, disliked: false },
  { id: 44, name: '人工智能应用实践', type: '教材', desc: '人工智能应用领域案例与实践分析', downloads: 160, score: 4.9, tags: '人工智能,应用,实践', uploader: '沈老师', fileName: 'ai_applications.pdf', likes: 19, dislikes: 0, liked: false, disliked: false },
  { id: 45, name: 'JavaScript编程语言基础', type: '课件', desc: 'JavaScript语言基础及应用实例', downloads: 185, score: 4.7, tags: 'JavaScript,编程,基础', uploader: '秦老师', fileName: 'js_programming.pptx', likes: 16, dislikes: 0, liked: false, disliked: false },
  { id: 46, name: '机器学习优化算法', type: '教材', desc: '机器学习中常见优化算法的讲解与应用', downloads: 210, score: 4.8, tags: '机器学习,优化,算法', uploader: '张老师', fileName: 'ml_optimization.pdf', likes: 23, dislikes: 1, liked: false, disliked: false },
  { id: 47, name: '大数据技术概论', type: '教材', desc: '大数据技术基础与应用案例分析', downloads: 195, score: 4.7, tags: '大数据,技术,概论', uploader: '吴老师', fileName: 'big_data_intro.pdf', likes: 20, dislikes: 0, liked: false, disliked: false },
  { id: 48, name: 'Python高级编程技巧', type: '课件', desc: 'Python高级编程技巧与项目实战', downloads: 210, score: 4.7, tags: 'Python,高级编程,技巧', uploader: '陈老师', fileName: 'python_advanced.pptx', likes: 22, dislikes: 0, liked: false, disliked: false },
  { id: 49, name: '数据挖掘与应用', type: '教材', desc: '数据挖掘基本理论与实践应用', downloads: 230, score: 4.8, tags: '数据挖掘,应用,教材', uploader: '李老师', fileName: 'data_mining.pdf', likes: 29, dislikes: 0, liked: false, disliked: false },
  { id: 50, name: '数字图像处理', type: '教材', desc: '数字图像处理的理论基础与应用实践', downloads: 210, score: 4.9, tags: '图像处理,数字,教材', uploader: '赵老师', fileName: 'digital_image_processing.pdf', likes: 32, dislikes: 0, liked: false, disliked: false }
])

const filterType = ref('')
const filterKeyword = ref('')
const sortType = ref('default')

const pageSize = ref(8)
const currentPage = ref(1)
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const filteredList = computed(() => {
  let list = resourceList.value
  if (filterType.value) {
    list = list.filter(r => r.type === filterType.value)
  }
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    list = list.filter(r => r.name.toLowerCase().includes(kw) || r.tags.toLowerCase().includes(kw))
  }
  if (sortType.value === 'download') {
    list = [...list].sort((a, b) => b.downloads - a.downloads)
  } else if (sortType.value === 'score') {
    list = [...list].sort((a, b) => b.score - a.score)
  }
  return list
})

const chatList = ref([
  { id: 1, nick: 'Alice', time: '2025-05-01 10:12', content: '请问有推荐的深度学习教材吗？' },
  { id: 2, nick: 'Bob', time: '2025-05-01 10:15', content: '我上传了一个算法题库，欢迎下载！' },
  { id: 3, nick: '王老师', time: '2025-05-01 10:18', content: '大家可以多多分享优质资源~' },
  { id: 4, nick: 'Alice', time: '2025-05-01 10:20', content: '我也有一个深度学习教材推荐，《深度学习》这本书非常不错。' },
  { id: 5, nick: 'Bob', time: '2025-05-01 10:22', content: '谢谢王老师推荐，我马上去看看。' },
  { id: 6, nick: '王老师', time: '2025-05-01 10:25', content: '不客气，希望你们都能在深度学习领域取得好成绩。' },
  { id: 7, nick: 'Alice', time: '2025-05-01 10:28', content: '我刚刚下载了那个算法题库，谢谢张老师。' },
  { id: 8, nick: '张老师', time: '2025-05-01 10:30', content: '不客气，希望对你有帮助。' },
  { id: 9, nick: 'Bob', time: '2025-05-01 10:32', content: '我正在看那个深度学习教材，感觉很棒。' },
  { id: 10, nick: 'Alice', time: '2025-05-01 10:35', content: '是吗？那太好了，我也很喜欢这本书。' },
  { id: 11, nick: '张老师', time: '2025-05-01 10:38', content: '我上传的那个数据结构与算法习题集，你们有谁下载了？' },
  { id: 12, nick: 'Bob', time: '2025-05-01 10:40', content: '我下载了，正在做呢。' },
  { id: 13, nick: 'Alice', time: '2025-05-01 10:42', content: '我也在做，感觉有点难。' },
  { id: 14, nick: '张老师', time: '2025-05-01 10:45', content: '不要气馁，多做几次就会好起来的。' },
  { id: 15, nick: 'Bob', time: '2025-05-01 10:48', content: '我刚刚下载了那个机器学习实验指导书，感觉很实用。' },
  { id: 16, nick: 'Alice', time: '2025-05-01 10:50', content: '是吗？那太好了，我也很喜欢这本书。' },
  { id: 17, nick: '张老师', time: '2025-05-01 10:52', content: '我上传的那个数据分析实用工具包，你们有谁下载了？' },
  { id: 18, nick: 'Bob', time: '2025-05-01 10:55', content: '我下载了，正在用呢。' },
  { id: 19, nick: 'Alice', time: '2025-05-01 10:58', content: '我也在用，感觉很方便。' },
  { id: 20, nick: '张老师', time: '2025-05-01 11:00', content: '不客气，希望你们都能在数据分析领域取得好成绩。' }
])
const chatInput = ref('')

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
const handleUpload = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    resourceList.value.unshift({
      id: Date.now(),
      name: form.value.name,
      type: form.value.type,
      desc: form.value.desc,
      downloads: 0,
      score: 5.0,
      tags: form.value.tags,
      uploader: '我',
      fileName: form.value.fileName,
      likes: 0,
      dislikes: 0,
      liked: false,
      disliked: false
    })
    uploadDialogVisible.value = false
    formRef.value.resetFields()
    form.value = { name: '', type: '', desc: '', tags: '', file: null, fileName: '' }
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('请填写完整信息')
  }
}
const handleDownload = (item: any) => {
  item.downloads++
  ElMessage.success('下载成功（模拟）')
}
const handlePreview = (item: any) => {
  previewItem.value = item
  previewVisible.value = true
}
const handleLike = (item: any) => {
  if (item.liked) return
  item.likes++
  item.liked = true
  if (item.disliked) {
    item.dislikes--
    item.disliked = false
  }
}
const handleDislike = (item: any) => {
  if (item.disliked) return
  item.dislikes++
  item.disliked = true
  if (item.liked) {
    item.likes--
    item.liked = false
  }
}
const handleSend = () => {
  if (!chatInput.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  chatList.value.push({
    id: Date.now(),
    nick: '我',
    time: new Date().toLocaleString(),
    content: chatInput.value
  })
  chatInput.value = ''
  ElMessage.success('发送成功')
}
</script>

<style scoped>
.community-container {
  padding: 20px;
}
.top-bar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.resource-list {
  display: flex;
  flex-wrap: wrap;
  gap: 28px 32px;
  margin-bottom: 32px;
}
.resource-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 22px 28px 18px 28px;
  width: 340px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}
.res-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 2px;
}
.res-type {
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
}
.res-desc {
  font-size: 15px;
  color: #444;
  margin-bottom: 8px;
  min-height: 32px;
}
.res-meta {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}
.res-actions {
  display: flex;
  gap: 12px;
  margin-top: 2px;
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
.preview-content {
  padding: 20px;
}
.desc-pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-list {
  max-height: 220px;
  overflow-y: auto;
  margin-bottom: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 10px 12px;
}
.chat-item {
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
}
.chat-nick {
  color: #409EFF;
  font-weight: 500;
  margin-right: 10px;
}
.chat-time {
  color: #aaa;
  font-size: 12px;
  margin-right: 10px;
}
.chat-content {
  margin-top: 2px;
  word-break: break-all;
}
.chat-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}
.chat-input {
  flex: 1;
}
</style>
