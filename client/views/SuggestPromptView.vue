<script setup lang="ts">
import TextContainer from "@/components/TextContainer.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const categoryText = ref("");
const promptText = ref("");
const errorText = ref("");
const successText = ref("");
const loaded = ref(false);

const maxCategoryChars = 40;
const maxPromptChars = 200;

async function submitSuggestion() {
  if (promptText.value === "") {
    errorText.value = "Please enter a prompt.";
    return;
  }
  if (categoryText.value === "") {
    errorText.value = "Please enter a category.";
    return;
  }
  try {
    await fetchy("/api/debate/newPrompt", "POST", {
      body: {
        prompt: promptText.value,
        category: categoryText.value,
      },
      alert: false,
    });
  } catch (_) {
    errorText.value = "An error has occurred. Please try again.";
    return;
  }
  errorText.value = "";
  successText.value = "Your suggestion has been submitted!";
  promptText.value = "";
  categoryText.value = "";
}

onBeforeMount(async () => {
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded" class="py-4">
    <TextContainer>
      <p class="text-base font-bold">Suggest a debate</p>
    </TextContainer>

    <label class="form-control w-full px-2">
      <div class="label">
        <span class="label-text">Category</span>
        <!-- <span class="label-text-alt">Top Right label</span> -->
      </div>
      <input v-model="categoryText" type="text" :maxlength="maxCategoryChars" placeholder="Category..." class="input input-bordered input-sm w-full" />
      <div class="label">
        <span class="label-text-alt"></span>
        <span class="label-text-alt">({{ categoryText.length }}/{{ maxCategoryChars }})</span>
      </div>
    </label>

    <div class="form-control px-2">
      <label class="label">
        <span class="label-text">Prompt</span>
        <span class="label-text-alt"></span>
      </label>
      <textarea v-model="promptText" :maxlength="maxPromptChars" class="textarea textarea-bordered h-24 font-base" placeholder="Suggest a prompt to debate..."></textarea>
      <label class="label">
        <span class="label-text"></span>
        <span class="label-text-alt">({{ promptText.length }}/{{ maxPromptChars }})</span>
      </label>
    </div>

    <div class="flex justify-center space-x-2">
      <button @click="submitSuggestion" class="btn">Submit</button>
    </div>

    <div v-if="errorText !== ''" class="flex pt-4 text-red-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="m-1">{{ errorText }}</p>
    </div>

    <div v-if="successText !== ''" class="flex pt-4 text-green-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="m-1">{{ successText }}</p>
    </div>
  </div>
</template>
