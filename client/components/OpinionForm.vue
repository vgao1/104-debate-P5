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
const errorText = ref("");
const successText = ref("");
const maxOpinionChars = 1000;

async function getOpinion() {
  let res;
  try {
    res = await fetchy(`/api/debate/getMyOpinion/${debateId}`, "GET", { alert: false });
  } catch (_) {
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
      alert: false,
    });
    successText.value = "Your opinion has been submitted!";
    canEdit.value = true;
    buttonText.value = "Update";
  } catch (_) {
    errorText.value = "Unsuccessful submission of opinion.";
    return;
  }
}

async function deleteOpinion() {
  localStorage.removeItem("userOpinion");
  try {
    await fetchy(`/api/debate/deleteMyOpinion/${debateId}`, "DELETE", {});
  } catch (_) {
    return;
  }
  void router.push({
    path: "/",
  });
}

async function editOpinion() {
  await submitOpinion();
  successText.value = "Your opinion has been updated!";
}
</script>

<template>
  <div v-if="loaded">
    <p class="font-bold pb-3 text-base">Your opinion</p>
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
