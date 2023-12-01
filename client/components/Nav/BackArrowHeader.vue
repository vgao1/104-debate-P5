<script setup lang="ts">
import router from "@/router";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

function goBack() {
  void router.back();
}
</script>

<template>
  <div class="flex align-middle space-x-3">
    <button @click="goBack">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
      </svg>
    </button>
    <p class="font-bold text-base">{{ props.text }}</p>
  </div>
</template>
