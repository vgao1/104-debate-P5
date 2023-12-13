<script setup lang="ts">
import BackArrowHeader from "@/components/Nav/BackArrowHeader.vue";
import OpinionForm from "@/components/OpinionForm.vue";
import TextContainer from "@/components/TextContainer.vue";
import { useRoute } from "vue-router";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "@/utils/fetchy";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import router from "../router";

const route = useRoute();
const debateId = route.params.id;
const debate = ref<Record<string, string>>({});
const loaded = ref(false);
const timeLeft = ref();
const timeUnit = ref("hr");
const timeLeftString = ref("");
const { isLoggedIn } = storeToRefs(useUserStore());
const routePath = route.path.slice(-1) === "/" ? route.path.substring(0, route.path.length - 1) : route.path;

function routeBasedOnPhase(curPhase: string) {
  if (curPhase == "Start") {
    void router.push({
      path: `/debates/${debateId}/reviews`,
    });
  } else if (curPhase == "Proposed") {
    void router.push({
      path: `/debates/${debateId}`,
    });
  } else {
    void router.push({
      path: `/debates/${debateId}/opinions`,
    });
  }
}

async function getDebate() {
  let res;
  try {
    res = await fetchy(`/api/activeDebates/${debateId}`, "GET", {});
    const currentTime = new Date().getTime();
    const debateDeadline = new Date(res.deadline).getTime();
    const curPhase = res.curPhase;
    const numMilliSecLeft = Math.floor(debateDeadline - currentTime);
    timeLeft.value = Math.floor((debateDeadline - currentTime) / 36e5);
    setTimeout(() => {
      routeBasedOnPhase(curPhase);
    }, numMilliSecLeft);
    // less than 1 hour left
    if (timeLeft.value == 0) {
      timeUnit.value = "min";
      timeLeft.value = Math.floor((debateDeadline - currentTime) / 6e4);
      // less than 1 min left
      if (timeLeft.value == 0) {
        const numSecLeft = Math.floor((debateDeadline - currentTime) / 1e3);
        if (numSecLeft > 0) {
          timeLeftString.value = "<1 min";
        } else {
          timeLeftString.value = timeLeft.value + " " + timeUnit.value;
        }
      } else {
        timeLeftString.value = timeLeft.value + " " + timeUnit.value;
      }
    } else {
      timeLeftString.value = timeLeft.value + " " + timeUnit.value;
    }
  } catch (_) {
    return;
  }
  debate.value = res;
  return;
}

function formatDate(dateString: string) {
  const options = {
    // year: null,
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    // timeZoneName: 'short' // Include this to show timezone information
  };
  return new Date(dateString).toLocaleDateString("en-US", options as Intl.DateTimeFormatOptions);
}

onBeforeMount(async () => {
  if (!isLoggedIn.value) {
    void router.push({
      path: `/login`,
    });
  } else {
    await getDebate();
    loaded.value = true;
  }
});
</script>

<template>
  <div v-if="loaded" class="py-4">
    <TextContainer>
      <BackArrowHeader text="Debate" />
    </TextContainer>

    <TextContainer v-if="debate.curPhase === 'Start'">
      <div class="flex justify-center">
        <div>
          <p class="text-base">
            <b class="text-lime-400">Opinion</b> due
            <b>{{ formatDate(debate.deadline) }}</b>
          </p>
          <p class="text-sm">{{ timeLeftString }} remaining</p>
        </div>
      </div>
    </TextContainer>

    <TextContainer v-if="debate.curPhase">
      <div class="border-l-0 border-neutral-300 space-y-1">
        <div class="flex justify-between items-center">
          <b class="text-sm">{{ debate.category }}</b>
        </div>
        <p class="pb-1 text-base">{{ debate.prompt }}</p>
      </div>
    </TextContainer>

    <TextContainer v-if="debate.curPhase === 'Start'">
      <OpinionForm />
    </TextContainer>
    <div v-else-if="debate.curPhase === 'Proposed'">
      <TextContainer> Opinion Submission page will be unlocked when a debate is initialized with this prompt. </TextContainer>
    </div>
    <div v-else-if="debate.curPhase === 'Review'">
      <TextContainer> Debate is past Phase I (Opinions) where users can submit opinions. Please view this debate <a style="color: blue" :href="routePath + '/reviews'">here</a> </TextContainer>
    </div>
    <div v-else-if="debate.curPhase">
      <TextContainer> Debate is past Phase I (Opinions) where users can submit opinions. Please view this debate <a style="color: blue" :href="routePath + '/opinions'">here</a> </TextContainer>
    </div>
    <TextContainer v-else> No active debate with ID {{ debateId }} is found.</TextContainer>
  </div>
</template>
