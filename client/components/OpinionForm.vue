<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import router from "../router";
import OpinionSlider from "./OpinionSlider.vue";

const loaded = ref(false);
const route = useRoute();
const debateId = route.params.id;
// true if the user has already submitted an opinion
const canEdit = ref(false);

const sliderValue = ref();
const opinionText = ref("");
const buttonText = ref("");

const maxOpinionChars = 1000;

// const sliderColor = computed(() => {
//   // Define an array of colors in the gradient
//   const colors = ['#e07a5f', '#de7c5d', '#d88258', '#ce8a53', '#c09453', '#b09d59', '#a0a466', '#93aa75', '#89ae84', '#84b090', '#81b297', '#81b29a'];
//   // Calculate the index of the color based on the slider value
//   const index = Math.floor((sliderValue.value / 100) * (colors.length - 1));
//   // Return the color at the calculated index
//   return colors[index];
// });

async function getOpinion() {
  let res;
  try {
    res = await fetchy(`/api/debate/getMyOpinion/${debateId}`, "GET", {});
  } catch (_) {
    console.log("error");
    return;
  }
  sliderValue.value = res.likertScale;
  opinionText.value = res.content;
  buttonText.value = res.buttonText;
  canEdit.value = res.buttonText == "Update";
}

onBeforeMount(async () => {
  await getOpinion();
  loaded.value = true;
});

async function submitOpinion() {
  try {
    await fetchy("/api/debate/submitOpinion", "POST", {
      body: {
        debate: debateId,
        content: opinionText.value,
        likertScale: sliderValue.value,
      },
    });
  } catch (_) {
    return;
  }

  void router.push({
    path: "/",
  });
}

async function deleteOpinion() {
  localStorage.removeItem("userOpinion");
  try {
    await fetchy(`/api/debate/deleteMyOpinion/${debateId}`, "DELETE", {});
  } catch (_) {
    console.log("error");
    return;
  }
  void router.push({
    path: "/",
  });
}

async function editOpinion() {
  await submitOpinion();
  void router.push({
    path: "/",
  });
}
</script>

<template>
  <div v-if="loaded">
    <p class="font-bold pb-3 text-base">Your opinion</p>
    <!-- https://github.com/tailwindlabs/tailwindcss/discussions/8748 -->
    <!-- <input type="range" min="0" max="100" v-model="sliderValue" 
    class="range range-xs custom-slider" 
    :style="{ '--range-shdw': sliderColor }" 
    /> -->
    <OpinionSlider v-model="sliderValue" />

    <div class="w-full flex justify-between text-sm px-2">
      <span>Disagree</span>
      <span>Neutral</span>
      <span>Agree</span>
    </div>

    <div class="form-control">
      <label class="label">
        <span class="label-text font-bold"></span>
        <span class="label-text-alt"></span>
      </label>
      <textarea v-model="opinionText" class="textarea textarea-bordered h-24 font-base" placeholder="Develop your opinion..."></textarea>
      <label class="label">
        <span class="label-text"></span>
        <span class="label-text-alt">({{ opinionText.length }}/{{ maxOpinionChars }})</span>
      </label>
    </div>

    <div class="flex justify-center">
      <div v-if="canEdit" class="flex justify-center space-x-2">
        <button @click="editOpinion" class="btn">{{ buttonText }}</button>
        <button @click="deleteOpinion" class="btn btn-outline btn-error">Delete</button>
      </div>
      <div v-else class="flex justify-center space-x-2">
        <button @click="submitOpinion" class="btn">{{ buttonText }}</button>
      </div>
    </div>
  </div>
</template>
