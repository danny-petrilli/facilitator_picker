<script setup>
import { ref, onMounted, watch } from 'vue'

// Initialize names from localStorage or empty array
const names = ref(JSON.parse(localStorage.getItem('facilitatorNames') || '[]'))
const newName = ref('')
const isSpinning = ref(false)
const selectedName = ref('')
const wheelRef = ref(null)
const ctx = ref(null)
const currentRotation = ref(0)

// Watch for changes in names array and save to localStorage
watch(names, (newNames) => {
  localStorage.setItem('facilitatorNames', JSON.stringify(newNames))
}, { deep: true })

// Pastel colors for the wheel
const colors = [
  '#FFB3BA', // pink
  '#BAFFC9', // mint
  '#BAE1FF', // light blue
  '#FFFFBA', // light yellow
  '#FFE4B5', // peach
  '#E0BBE4', // lavender
  '#957DAD', // dusty purple
  '#D4A5A5', // dusty rose
  '#9DC8C8', // sage
]

const addName = () => {
  if (newName.value.trim()) {
    names.value.push(newName.value.trim())
    newName.value = ''
    drawWheel()
  }
}

const removeName = (index) => {
  names.value.splice(index, 1)
  drawWheel()
}

const drawWheel = () => {
  if (!ctx.value || names.value.length === 0) return

  const canvas = wheelRef.value
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 10
  const sliceAngle = (2 * Math.PI) / names.value.length

  // Clear canvas
  ctx.value.clearRect(0, 0, canvas.width, canvas.height)

  names.value.forEach((name, i) => {
    const startAngle = i * sliceAngle - Math.PI / 2
    const endAngle = startAngle + sliceAngle

    // Draw slice
    ctx.value.beginPath()
    ctx.value.moveTo(centerX, centerY)
    ctx.value.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.value.closePath()
    ctx.value.fillStyle = colors[i % colors.length]
    ctx.value.fill()
    ctx.value.stroke()

    // Add name
    ctx.value.save()
    ctx.value.translate(centerX, centerY)
    ctx.value.rotate(startAngle + sliceAngle / 2)
    ctx.value.textAlign = 'right'
    ctx.value.textBaseline = 'middle'
    ctx.value.fillStyle = '#000'
    ctx.value.font = 'bold 16px Arial'
    ctx.value.fillText(name, radius - 20, 0)
    ctx.value.restore()
  })
}

const spin = () => {
  if (isSpinning.value || names.value.length === 0) return

  isSpinning.value = true
  selectedName.value = ''
  
  // Select winning index first
  const winningIndex = Math.floor(Math.random() * names.value.length)
  
  // Calculate rotation to land on the winner (winner should stop at top)
  const sliceDegrees = 360 / names.value.length
  // Add half a slice to center the winning slice at the top
  const targetRotation = 360 - ((winningIndex * sliceDegrees) + (sliceDegrees / 2))
  const spinDegrees = 1800 + targetRotation // 5 full rotations + target
  
  // Animate the spin
  const startTime = performance.now()
  const duration = 4000 // 4 seconds
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function for smooth deceleration
    const easeOut = 1 - Math.pow(1 - progress, 3)
    
    // Calculate current rotation
    const rotation = spinDegrees * easeOut
    
    // Apply rotation
    ctx.value.save()
    ctx.value.translate(wheelRef.value.width / 2, wheelRef.value.height / 2)
    ctx.value.rotate(rotation * Math.PI / 180)
    ctx.value.translate(-wheelRef.value.width / 2, -wheelRef.value.height / 2)
    drawWheel()
    ctx.value.restore()

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isSpinning.value = false
      selectedName.value = names.value[winningIndex]
    }
  }

  requestAnimationFrame(animate)
}

onMounted(() => {
  const canvas = wheelRef.value
  ctx.value = canvas.getContext('2d')
  drawWheel()
})
</script>

<template>
  <div class="container">
    <h1>Facilitator Picker</h1>
    
    <div class="wheel-container">
      <canvas ref="wheelRef" width="400" height="400"></canvas>
      <div class="arrow"></div>
    </div>

    <div class="controls">
      <button 
        class="spin-button" 
        @click="spin"
        :disabled="isSpinning || names.length === 0"
      >
        SPIN!
      </button>
    </div>

    <div v-if="selectedName" class="result">
      Selected: {{ selectedName }}
    </div>

    <div class="input-group">
      <input 
        v-model="newName" 
        @keyup.enter="addName"
        placeholder="Enter name"
        :disabled="isSpinning"
      >
      <button @click="addName" :disabled="isSpinning || !newName.trim()">
        Add
      </button>
    </div>

    <div class="name-list">
      <div v-for="(name, index) in names" :key="index" class="name-item">
        {{ name }}
        <button 
          class="remove-button" 
          @click="removeName(index)"
          :disabled="isSpinning"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #ffffff;
  margin-bottom: 2rem;
}

.wheel-container {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 0 auto 2rem;

  canvas {
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    background: #ffffff;
  }
}

.arrow {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 30px solid #e74c3c;
}

.controls {
  margin-bottom: 2rem;
}

.input-group {
  margin: 3rem 0 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;

  input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    
    &:disabled {
      background: #f5f5f5;
      color: #000000;
    }
  }
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #42b983;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #3aa876;
  }

  &:disabled {
    background: #cccccc;
    color: #000000;
    cursor: not-allowed;
  }
}

.spin-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: #e74c3c;

  &:hover:not(:disabled) {
    background: #c0392b;
  }
}

.result {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.name-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 2rem;
}

.name-item {
  padding: 0.5rem 1rem;
  background: #000000;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .remove-button {
    padding: 0.2rem 0.5rem;
    background: #dc3545;
    font-size: 1rem;
    
    &:hover:not(:disabled) {
      background: #c82333;
    }
  }
}
</style>
