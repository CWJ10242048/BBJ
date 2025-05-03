<template>
  <el-card class="generated-questions-card" v-if="questions && questions.length > 0">
    <template #header>
      <div class="card-header">
        <span>题目预览</span>
        <!-- 可以添加导出或清空按钮等 -->
      </div>
    </template>

    <!-- Type Filter Tabs -->
    <el-tabs v-model="selectedType" class="type-filter-tabs">
      <el-tab-pane 
        v-for="type in availableTypes" 
        :key="type" 
        :label="`${type} (${getQuestionCountByType(type)})`" 
        :name="type"
      ></el-tab-pane>
    </el-tabs>

    <!-- Display Filtered Questions -->
    <div v-if="filteredQuestions.length > 0">
      <div v-for="(q, index) in filteredQuestions" :key="q.id || index" class="question-item">
        <p><strong>{{ index + 1 }}. [{{ q.type }}]</strong> {{ q.stem }}</p>
        <div v-if="q.options && Array.isArray(q.options)" class="options-list">
          <div v-for="(opt, optIndex) in q.options" :key="optIndex" class="option-item">
            {{ String.fromCharCode(65 + optIndex) }}. {{ opt }}
          </div>
        </div>
        <div v-if="q.answer" class="answer-section">
          <strong>答案:</strong> {{ q.answer }}
        </div>
        <div v-if="q.analysis" class="analysis-section">
          <strong>解析:</strong> {{ q.analysis }}
        </div>
        <el-divider v-if="index < filteredQuestions.length - 1" />
      </div>
    </div>
    <el-empty v-else :description="'暂无' + selectedType + '类型的题目'" />

  </el-card>
  <el-empty v-else description="暂无生成的题目" />
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';
import type { PropType } from 'vue';

// Define the structure of a question object (adjust as needed)
interface Question {
  id: number | string;
  type: string;
  stem: string;
  options?: string[];
  answer?: string;
  analysis?: string;
}

const props = defineProps({
  questions: {
    type: Array as PropType<Question[]>,
    required: true,
    default: () => []
  }
});

// State for the selected filter type
const selectedType = ref<string>('全部');

// Compute available types including '全部'
const availableTypes = computed(() => {
  const types = new Set(props.questions.map(q => q.type));
  return ['全部', ...Array.from(types)];
});

// Compute filtered questions based on selected type
const filteredQuestions = computed(() => {
  if (selectedType.value === '全部') {
    return props.questions;
  } else {
    return props.questions.filter(q => q.type === selectedType.value);
  }
});

// Helper to get count for each type tab label
const getQuestionCountByType = (type: string): number => {
  if (type === '全部') {
    return props.questions.length;
  } else {
    return props.questions.filter(q => q.type === type).length;
  }
};

</script>

<style scoped>
.generated-questions-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

/* Styles for the filter tabs */
.type-filter-tabs {
  margin-bottom: 20px;
  margin-top: -10px; /* Adjust to pull tabs closer to header */
}

/* Optional: Style the active tab differently */
:deep(.el-tabs__item.is-active) {
  /* color: #409EFF; */
  font-weight: bold;
}

:deep(.el-tabs__active-bar) {
  /* background-color: #409EFF; */
}

.question-item {
  margin-bottom: 20px;
  padding-bottom: 15px; /* Add padding instead of relying solely on divider */
}

.question-item p {
  margin: 8px 0;
  line-height: 1.6;
  font-size: 14px;
}

.options-list {
  margin-left: 20px;
  margin-top: 8px;
  font-size: 14px;
}

.option-item {
  margin-bottom: 5px;
}

.answer-section,
.analysis-section {
  margin-top: 10px;
  font-size: 13px;
  color: #606266;
  background-color: #f9f9f9; /* Slight background for distinction */
  border-radius: 4px;
  padding: 8px 12px;
  line-height: 1.5;
}

.answer-section strong,
.analysis-section strong {
  color: #303133;
  margin-right: 5px;
}

/* Add margin to the divider for better spacing */
.question-item .el-divider {
  margin: 20px 0 15px 0; 
}

/* Style for the empty state */
.el-empty {
  margin-top: 20px;
}
</style> 