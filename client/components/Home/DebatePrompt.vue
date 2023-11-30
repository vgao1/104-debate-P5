<script setup lang="ts">
import WriteOpinionButton from "./WriteOpinionButton.vue";
import ViewOpinionsButton from "./ViewOpinionsButton.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const props = defineProps(["debate", "numHoursLeft"]);
const debate = props.debate;
const numHoursLeft = props.numHoursLeft;
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

        <div v-if="debate.status != 'done'">
          <p class="text-xs text-lime-400">Due in {{ numHoursLeft }}h</p>
        </div>
        <div v-else>
          <p class="text-xs text-neutral-400">Done</p>
        </div>
      </div>
      <p class="pb-1">{{ debate.prompt }}</p>
    </div>

    <!-- </button> -->
    <WriteOpinionButton v-if="!isLoggedIn" @click="redirectToLogin" />
    <WriteOpinionButton v-else-if="debate.curPhase != 'Archived'" @click="openDebate" />
    <ViewOpinionsButton v-else @click="openOpinions" />
  </div>
</template>
