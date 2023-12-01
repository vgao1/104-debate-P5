<script setup lang="ts">
import WriteOpinionButton from "./WriteOpinionButton.vue";
import ViewOpinionsButton from "./ViewOpinionsButton.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import ReviewOpinionsButton from "./ReviewOpinionsButton.vue";

const props = defineProps(["debate", "timeLeft"]);
const debate = props.debate;
const timeLeft = props.timeLeft;
const debateId = debate.key;
const { isLoggedIn } = storeToRefs(useUserStore());

function redirectToLogin() {
  void router.push({
    path: `/login`,
  });
}

function openDebate() {
  void router.push({
    path: `/debates/${debateId}`,
  });
}

function openReviews() {
  void router.push({
    path: `/debates/${debateId}/reviews`,
  });
}

function openOpinions() {
  void router.push({
    path: `/debates/${debateId}/opinions`,
  });
}
</script>

<template>
  <div>
    <!-- <button @click="openDebate"> -->
    <div class="border-l-2 pl-2 border-neutral-300 space-y-1">
      <div class="flex justify-between items-center">
        <b class="text-xs">{{ debate.category }}</b>

        <div v-if="debate.curPhase != 'Recently Completed' && debate.curPhase != 'Archived'">
          <p class="text-xs text-lime-400">Due in {{ timeLeft }}</p>
        </div>
        <div v-else>
          <p class="text-xs text-neutral-400">Done</p>
        </div>
      </div>
      <p class="pb-1">{{ debate.prompt }}</p>
    </div>

    <!-- </button> -->
    <ViewOpinionsButton v-if="debate.curPhase == 'Recently Completed' || debate.curPhase == 'Archived'" @click="openOpinions" />
    <WriteOpinionButton v-else-if="!isLoggedIn" @click="redirectToLogin" />
    <WriteOpinionButton v-else-if="isLoggedIn && debate.curPhase == 'Start'" @click="openDebate" />
    <ReviewOpinionsButton v-else-if="isLoggedIn && debate.curPhase == 'Review'" @click="openReviews" />
  </div>
</template>
