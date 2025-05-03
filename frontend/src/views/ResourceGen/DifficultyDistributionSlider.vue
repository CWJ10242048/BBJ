<template>
  <div class="difficulty-slider-container" ref="containerRef">
    <!-- Slider Bar -->
    <div class="distribution-bar">
      <!-- Segments -->
      <div 
        v-for="(level, index) in levels" 
        :key="index" 
        class="bar-segment"
        :style="{ width: `${localPercentages[index]}%`, backgroundColor: level.color }"
      >
        <span class="segment-label">{{ level.label }}</span>
      </div>

      <!-- Drag Handles -->
      <div
        v-for="(handlePos, index) in handlePositions" 
        :key="index"
        class="drag-handle"
        :style="{ left: `${handlePos}%` }"
        @mousedown.prevent="startDrag($event, index)"
      >
        <div class="handle-line"></div>
      </div>
    </div>

    <!-- Percentage Display & Input Controls -->
    <div class="controls-wrapper">
      <div v-for="(level, index) in levels" :key="index" class="control-item">
        <span class="percentage-label" :style="{ color: level.color }">
          {{ level.label }}
        </span>
        <div class="input-wrapper">
          <el-input-number
            :model-value="localPercentages[index]"
            @update:modelValue="(currentValue: number | undefined) => handleInputChange(index, currentValue)"
            :min="0"
            :max="100"
            :step="1"
            :controls="false" 
            size="small"
            class="percentage-input"
          />
          <span class="percent-sign">%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Level {
  label: string;
  color: string;
}

const levels: Level[] = [
  { label: '极易', color: '#95d475' }, 
  { label: '简单', color: '#67c23a' }, 
  { label: '中等', color: '#e6a23c' }, 
  { label: '困难', color: '#f56c6c' }, 
  { label: '极难', color: '#c45656' }  
];

const props = defineProps<{ modelValue: number[] }>()
const emit = defineEmits(['update:modelValue'])

const containerRef = ref<HTMLElement | null>(null)
// Initialize local state with a known valid default, will be synced with prop on mount
const localPercentages = ref<number[]>([10, 20, 40, 20, 10]) 
let isInternalUpdate = false; 

// --- Dragging State ---
const isDragging = ref(false)
const activeHandleIndex = ref(-1)
const startX = ref(0)
const startPercentages = ref<number[]>([])

// --- Computed Properties ---
const handlePositions = computed(() => {
  const positions: number[] = []
  let cumulative = 0
  // Ensure localPercentages has values before calculating
  if (localPercentages.value && localPercentages.value.length === 5) {
      for (let i = 0; i < localPercentages.value.length - 1; i++) {
        cumulative += localPercentages.value[i];
        positions.push(cumulative);
      }
  }
  return positions
})

// --- Normalization Logic ---
// This function takes an array, ensures values are 0-100, sum is 100, and are integers.
const normalizePercentages = (percentages: number[]): number[] => {
    if (!Array.isArray(percentages) || percentages.length !== 5) {
        console.error("Invalid input to normalizePercentages");
        return [10, 20, 40, 20, 10]; // Return default if input is invalid
    }

    let currentPercentages = percentages.map(p => Math.max(0, Math.min(100, p || 0)));
    let currentTotal = currentPercentages.reduce((sum, p) => sum + p, 0);

    if (Math.abs(currentTotal - 100) > 0.01) {
        if (currentTotal <= 0.01) {
             const equalPart = Math.round(100 / levels.length);
             const remainder = 100 - equalPart * levels.length;
             const result = Array(levels.length).fill(equalPart);
             if (remainder !== 0 && result.length > 0) result[0] += remainder; // Add remainder to first element
             return result;
        }
        const scale = 100 / currentTotal;
        currentPercentages = currentPercentages.map(p => p * scale);
    }

    let roundedPercentages = currentPercentages.map(p => Math.round(p));
    let roundedSum = roundedPercentages.reduce((sum, p) => sum + p, 0);
    let diff = 100 - roundedSum;

    if (diff !== 0) {
        let adjustIndex = 0;
        let maxValue = -Infinity;
        // Find index of largest element to adjust
        // Use original non-rounded value for comparison to avoid rounding bias
        for (let i = 0; i < currentPercentages.length; i++) {
            if (currentPercentages[i] > maxValue) {
                maxValue = currentPercentages[i];
                adjustIndex = i;
            }
        }
        roundedPercentages[adjustIndex] = Math.max(0, roundedPercentages[adjustIndex] + diff);
        
        // Final sum check and correction if needed (should be rare)
         let finalSumCheck = roundedPercentages.reduce((sum, p) => sum + p, 0);
         if (finalSumCheck !== 100 && roundedPercentages.length > 0) { // Check length too
             console.warn(`Final sum correction needed: ${100 - finalSumCheck}`);
             roundedPercentages[adjustIndex] = Math.max(0, roundedPercentages[adjustIndex] + (100 - finalSumCheck));
         }
    }
    
    return roundedPercentages.map(p => Math.max(0, Math.min(100, p)));
};

// --- Update Emitter ---
// This function updates local state (if needed) and emits the normalized value
const updateAndEmit = (newPercentages: number[]) => {
    isInternalUpdate = true;
    const normalized = normalizePercentages(newPercentages);
    
    // Update local state only if it actually changed after normalization
    if (JSON.stringify(normalized) !== JSON.stringify(localPercentages.value)) {
        localPercentages.value = normalized;
    }
    
    // Always emit to keep parent in sync with the internally corrected value.
    emit('update:modelValue', [...normalized]); 

    nextTick(() => {
      isInternalUpdate = false;
    });
};

// --- Drag Handling ---
const startDrag = (event: MouseEvent, index: number) => {
  if (!containerRef.value) return;
  isDragging.value = true;
  activeHandleIndex.value = index;
  startX.value = event.clientX;
  startPercentages.value = [...localPercentages.value]; 
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  document.body.style.cursor = 'ew-resize'; 
};

// Modified handleDrag for integer steps
const handleDrag = (event: MouseEvent) => {
  if (!isDragging.value || !containerRef.value || activeHandleIndex.value < 0) return;
  const containerWidth = containerRef.value.offsetWidth;
  if (containerWidth === 0) return; 
  const currentX = event.clientX;
  const deltaX = currentX - startX.value;
  const deltaPercent = (deltaX / containerWidth) * 100;
  
  // Round the percentage change to the nearest integer
  const intDeltaPercent = Math.round(deltaPercent);

  const leftIndex = activeHandleIndex.value;
  const rightIndex = activeHandleIndex.value + 1;

  // Calculate potential new values based on integer delta
  let newLeft = startPercentages.value[leftIndex] + intDeltaPercent;
  let newRight = startPercentages.value[rightIndex] - intDeltaPercent;

  // Ensure we don't move beyond the original sum of the two affected segments
  const originalSum = startPercentages.value[leftIndex] + startPercentages.value[rightIndex];
  newLeft = Math.max(0, Math.min(newLeft, originalSum));
  newRight = originalSum - newLeft; // Ensure sum is preserved for the pair
  newRight = Math.max(0, newRight); // Clamp right side as well
  newLeft = originalSum - newRight; // Recalculate left based on clamped right

  // Create a new array based on the start state and apply integer changes
  const newPercentages = [...startPercentages.value];
  newPercentages[leftIndex] = Math.round(newLeft); // Round final values
  newPercentages[rightIndex] = Math.round(newRight);

  // Quick adjustment if rounding caused sum mismatch for the pair
  const pairSum = newPercentages[leftIndex] + newPercentages[rightIndex];
  if (pairSum !== Math.round(originalSum)) {
       newPercentages[leftIndex] += (Math.round(originalSum) - pairSum);
  }

  // Update local state for visual feedback (still allows temporary != 100% total)
  localPercentages.value = newPercentages.map(p => Math.max(0, p)); 
};

const stopDrag = () => {
  if (isDragging.value) {
    isDragging.value = false;
    activeHandleIndex.value = -1;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.body.style.cursor = ''; 
    updateAndEmit([...localPercentages.value]); // Normalize and emit final value
  }
};

// --- Input Handling ---
// Handles changes from the el-input-number
const handleInputChange = (changedIndex: number, currentValue: number | undefined) => {
    if (isInternalUpdate) return; 

    let currentPercentages = [...localPercentages.value];
    const oldValue = currentPercentages[changedIndex];
    // Ensure currentValue is a number before proceeding, default to old value if undefined
    const clampedValue = Math.max(0, Math.min(100, typeof currentValue === 'number' ? currentValue : oldValue));

    if (clampedValue === oldValue) return; // No actual change

    const delta = clampedValue - oldValue;
    currentPercentages[changedIndex] = clampedValue;

    // Distribute the NEGATIVE delta among OTHERS
    let sumOthers = 0;
    let distributableIndices: number[] = [];
    let canDecreaseCount = 0;
    let canIncreaseCount = 0;

    for (let i = 0; i < currentPercentages.length; i++) {
        if (i !== changedIndex) {
            const otherValue = currentPercentages[i] || 0; 
            sumOthers += otherValue;
            distributableIndices.push(i);
            if (otherValue > 0) canDecreaseCount++;
            if (otherValue < 100) canIncreaseCount++;
        }
    }

    if (delta > 0 && canDecreaseCount > 0) { // We increased, need to decrease others
        let sumDistributable = distributableIndices
                                .filter(i => (currentPercentages[i] || 0) > 0)
                                .reduce((s, i) => s + (currentPercentages[i] || 0), 0);
                                
        if (sumDistributable > 0.01) {
            const scale = -delta / sumDistributable;
            for (const i of distributableIndices) {
                 const otherValue = currentPercentages[i] || 0;
                 if (otherValue > 0) { 
                     currentPercentages[i] = otherValue + otherValue * scale;
                 }
            }
        } else {
             console.warn("Cannot distribute proportionally to decrease, sum too small.");
        }
    } else if (delta < 0 && canIncreaseCount > 0) { // We decreased, need to increase others
        const adjustmentPerOther = -delta / canIncreaseCount;
        for (const i of distributableIndices) {
            const otherValue = currentPercentages[i] || 0;
            if (otherValue < 100) { 
                currentPercentages[i] = otherValue + adjustmentPerOther;
            }
        }
    }

    updateAndEmit(currentPercentages);
};

// --- Watch for external prop changes ---
watch(() => props.modelValue, (newValue) => {
  if (isInternalUpdate) return; 
  
  const currentLocalNormalized = normalizePercentages([...localPercentages.value]);
  const newPropNormalized = normalizePercentages([...(newValue || [10, 20, 40, 20, 10])]); 

  if (JSON.stringify(newPropNormalized) !== JSON.stringify(currentLocalNormalized)) {
      console.log("Prop changed, updating internal state:", newPropNormalized);
      localPercentages.value = newPropNormalized;
  }
}, { deep: true });

// --- Lifecycle Hooks ---
onBeforeUnmount(() => {
  if (isDragging.value) {
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.body.style.cursor = '';
  }
});

onMounted(() => {
    const normalizedInitial = normalizePercentages([...props.modelValue]);
    localPercentages.value = normalizedInitial;
    if (JSON.stringify(normalizedInitial) !== JSON.stringify(props.modelValue)) {
        console.log("Initial prop value normalized, emitting back:", normalizedInitial);
        emit('update:modelValue', [...normalizedInitial]);
    }
});

</script>

<style scoped>
.difficulty-slider-container {
  width: 100%;
  padding: 5px 0; 
}

.distribution-bar {
  position: relative; 
  display: flex;
  width: 100%;
  height: 28px; 
  border-radius: 14px; 
  overflow: hidden;
  background-color: #ebeef5; 
  margin-bottom: 10px; 
  cursor: default; 
}

.bar-segment {
  height: 100%;
  /* Smoother transition for final snap */
  transition: width 0.1s ease-out; 
  display: flex;
  align-items: center; 
  justify-content: center;
  overflow: hidden;
}

.segment-label {
  color: white;
  font-size: 12px;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  padding: 0 5px; 
}

.drag-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px; 
  transform: translateX(-50%); 
  cursor: ew-resize; 
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.handle-line {
  width: 2px; 
  height: 60%; 
  background-color: rgba(0, 0, 0, 0.4); 
  border-radius: 1px;
  box-shadow: 0 0 3px rgba(0,0,0,0.2);
}

.controls-wrapper {
  display: flex;
  justify-content: space-between; 
  /* Use baseline alignment */
  align-items: baseline; 
  flex-wrap: wrap; 
  gap: 10px; 
  margin-top: 8px; 
}

.control-item {
  display: flex;
  /* Align items to baseline */
  align-items: baseline;
  /* Reduced gap */
  gap: 3px; 
}

.percentage-label {
  font-size: 14px; 
  font-weight: 600; 
  white-space: nowrap;
  width: 35px; 
  text-align: right;
  /* Adjust line-height or padding if needed for baseline alignment */
  line-height: 24px; /* Match input-number's small size line-height roughly */
}

/* Wrapper for input and % sign */
.input-wrapper {
  position: relative;
  display: inline-flex; /* Use flex for alignment */
  align-items: baseline; /* Align input and % sign */
}

.percentage-input :deep(.el-input__wrapper) {
  border-radius: 12px !important; 
  padding-right: 20px !important; 
  padding-left: 8px !important; 
  box-shadow: none !important;
  /* Explicitly set height for baseline calculation? */
  height: 24px; 
  line-height: 24px;
}
.percentage-input :deep(input) {
    height: 22px; /* Adjust inner input height */
    line-height: 22px;
}

/* Hide native arrows */
.percentage-input :deep(input[type=number]::-webkit-inner-spin-button),
.percentage-input :deep(input[type=number]::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
.percentage-input :deep(input[type=number]) {
  -moz-appearance: textfield; 
}


.percentage-input {
  width: 60px; 
}

.percent-sign {
    /* Adjust positioning relative to baseline */
    font-size: 13px;
    color: #909399; 
    margin-left: 2px; /* Small space after input */
    line-height: 24px; /* Match input */
}

</style> 