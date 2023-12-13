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
  if (isLoggedIn) {
    void router.push({
      path: `/debates/${debateId}`,
    });
  } else {
    redirectToLogin();
  }
}

function openReviews() {
  if (isLoggedIn) {
    void router.push({
      path: `/debates/${debateId}/reviews`,
    });
  } else {
    redirectToLogin();
  }
}

function openOpinions() {
  if (isLoggedIn) {
    void router.push({
      path: `/debates/${debateId}/opinions`,
    });
  } else {
    redirectToLogin();
  }
}
</script>

<template>
  <div>
    <div class="border-l-2 pl-2 border-neutral-300 space-y-1">
      <div class="flex justify-between items-center">
        <b class="text-xs">{{ debate.category }}</b>

        <div v-if="debate.curPhase == 'Start'">
          <p class="text-xs text-lime-400">Opinion due in {{ timeLeft }}</p>
        </div>
        <div v-else-if="debate.curPhase == 'Review'">
          <p class="text-xs text-orange-400">Review due in {{ timeLeft }}</p>
        </div>
        <div v-else>
          <p class="text-xs text-neutral-400">Done</p>
        </div>
      </div>
      <p class="pb-1">{{ debate.prompt }}</p>
    </div>

    <!-- button variations based on phases -->
    <ViewOpinionsButton v-if="debate.curPhase == 'Recently Completed' || debate.curPhase == 'Archived'" @click="openOpinions" />
    <WriteOpinionButton v-else-if="debate.curPhase == 'Start'" @click="openDebate" />
    <ReviewOpinionsButton v-else-if="debate.curPhase == 'Review'" @click="openReviews" />
  </div>
</template>
