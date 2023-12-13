<script setup lang="ts">
import HelpPopup from "@/components/HelpPopup.vue";
import DebatePrompt from "@/components/Home/DebatePrompt.vue";
import TextContainer from "@/components/TextContainer.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const debates = ref<Array<Record<string, string>>>([]);
const historyDebates = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);

async function getDebates() {
  let res;
  try {
    res = await fetchy("/api/activeDebates", "GET", { alert: false });
  } catch (_) {
    return;
  }
  debates.value = res;
}

async function getHistoryDebates() {
  let res;
  try {
    res = await fetchy("/api/historyDebates", "GET", { alert: false });
  } catch (_) {
    return;
  }
  historyDebates.value = res;
}

function timeLeft(debate: Record<string, string>) {
  const deadline = debate.deadline;
  const currentTime = new Date().getTime();
  const debateDeadline = new Date(deadline).getTime();
  let timeLeft = Math.floor((debateDeadline - currentTime) / 36e5);
  let timeUnit = "hr";
  // less than 1 hour left
  if (timeLeft == 0) {
    timeUnit = "min";
    timeLeft = Math.floor((debateDeadline - currentTime) / 6e4);
    if (timeLeft == 0) {
      const numSecsLeft = Math.floor((debateDeadline - currentTime) / 1e3);
      if (numSecsLeft > 0) {
        return "<1 min";
      }
    }
  }
  return timeLeft.toString() + " " + timeUnit;
}

onBeforeMount(async () => {
  await getDebates();
  await getHistoryDebates();
  // await fetchy("/api/debate/testerPrompts", "GET");
  loaded.value = true;

  // uncomment for testing review button frontend
  // debates.value[debates.value.length - 1].curPhase = "Review";
});
</script>

<template>
  <!-- TODO: show history even when no active debates? -->
  <!-- <div v-if="loaded && debates.length !== 0" class="py-4"> -->
  <div v-if="loaded" class="py-4">
    <TextContainer>
      <div class="flex flex-row justify-between">
        <p class="text-base font-bold">Today's debates</p>
        <HelpPopup />
      </div>
      <!-- <p class="text-base font-bold">Today's debates</p>
      <HelpPopup /> -->
    </TextContainer>
    <div v-for="debate in debates" class="flex flex-col" :key="debate._id">
      <TextContainer>
        <DebatePrompt :debate="debate" :timeLeft="timeLeft(debate)" />
      </TextContainer>
    </div>

    <TextContainer>
      <p class="text-base font-bold">Past debates</p>
    </TextContainer>

    <!-- TODO: ok to reverse past debate list to show more recent first? -->
    <div v-for="debate in historyDebates" class="flex flex-col" :key="debate._id">
      <TextContainer>
        <DebatePrompt :debate="debate" :timeLeft="0" />
      </TextContainer>
    </div>
  </div>
</template>
