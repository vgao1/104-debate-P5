<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from "vue";

const props = defineProps({
  modelValue: Number,
});
const emit = defineEmits(["update:modelValue"]);

const sliderValue = ref(props.modelValue || 50);

// Function to interpolate between two values
function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

interface rgb {
  [key: string]: number;
}

// Function to interpolate between two colors
function interpolateColor(color1: rgb, color2: rgb, t: number) {
  return {
    r: Math.round(lerp(color1.r, color2.r, t)),
    g: Math.round(lerp(color1.g, color2.g, t)),
    b: Math.round(lerp(color1.b, color2.b, t)),
  };
}

// Convert a hex color to an RGB object
function hexToRgb(hex: string) {
  var bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

// Define an array of colors in the gradient
// const gradientColors = ['#e07a5f', '#de7c5d', '#d88258', '#ce8a53', '#c09453', '#b09d59', '#a0a466', '#93aa75', '#89ae84', '#84b090', '#81b297', '#81b29a'].map(hexToRgb);
// const gradientColors = ['#e05f59', '#df685a', '#dc7e5e', '#d89c63', '#d2bb68', '#c2cc6e', '#a1c673', '#89c078', '#7cba80', '#7fb68f', '#80b397', '#81b29a'].map(hexToRgb);
const gradientColors = ["#e05f59", "#df665a", "#dd785c", "#d99060", "#d5ab64", "#d0c569", "#bccb6d", "#a4c672", "#91c276", "#86be7a", "#7fbc7c", "#7dbb7d"].map(hexToRgb);

const sliderColor = computed(() => {
  // Calculate the position in the gradient
  const t = sliderValue.value / 100;

  // Determine the indices of the two nearest colors
  const index = Math.floor(t * (gradientColors.length - 1));
  const nextIndex = Math.min(index + 1, gradientColors.length - 1);

  // Interpolate between the two colors
  const color = interpolateColor(gradientColors[index], gradientColors[nextIndex], t * (gradientColors.length - 1) - index);

  // Return the color in RGB format
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
});

// TODO: currently disable this functionality because of some bug
// Update local value when prop changes
// watch(
//   () => props.modelValue,
//   (newValue) => {
//     if (newValue) {
//       sliderValue.value = newValue;
//     } else {
//       sliderValue.value = 50;
//     }
//   },
// );

// Emit an event when sliderValue changes
watch(sliderValue, (newValue) => {
  emit("update:modelValue", Number(newValue));
});
</script>
<template>
  <input type="range" min="0" max="100" v-model="sliderValue" class="range range-xs custom-slider" :style="{ '--range-shdw': sliderColor }" />
</template>
