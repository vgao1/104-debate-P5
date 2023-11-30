<script setup lang="ts">
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
    res = await fetchy("/api/activeDebates", "GET", {});
  } catch (_) {
    return;
  }
  debates.value = res;
}

async function getHistoryDebates() {
  let res;
  try {
      res = await fetchy("/api/historyDebates", "GET", {});
  } catch (_) {
      return;
  }
  console.log("getHistoryDebates");
  console.log(res);
  historyDebates.value = res;
}

function numHoursLeft(deadline: string) {
  const currentTime = new Date().getTime();
  const debateDeadline = new Date(deadline).getTime();
  return Math.floor(Math.abs(currentTime - debateDeadline) / 36e5);
}

onBeforeMount(async () => {
  await getDebates();
  await getHistoryDebates();
  loaded.value = true;
});
</script>

<template>
  <!-- TODO: show history even when no active debates? -->
  <!-- <div v-if="loaded && debates.length !== 0" class="py-4"> -->
  <div v-if="loaded" class="py-4">
    <TextContainer>
      <p class="text-base font-bold">Today's debates</p>
    </TextContainer>
    <div v-for="debate in debates" class="flex flex-col" :key="debate._id">
      <TextContainer>
        <DebatePrompt :debate="debate" :numHoursLeft="numHoursLeft(debate.deadline)" />
      </TextContainer>
    </div>
    <!-- <div v-for="id in debateIds" class="flex flex-col">
      <TextContainer>
        <DebatePrompt :id="id"/>
      </TextContainer>
    </div>     -->

    <TextContainer>
      <p class="text-base font-bold">Past debates</p>
    </TextContainer>

    <div v-for="debate in historyDebates" class="flex flex-col" :key="debate._id">
      <TextContainer>
        <DebatePrompt :debate="debate" :numHoursLeft="numHoursLeft(debate.deadline)" />
      </TextContainer>
    </div>

    <!-- <div v-for="id in pastDebateIds" class="flex flex-col">
      <TextContainer>
        <DebatePrompt :id="id"/>
      </TextContainer>
    </div>     -->
  </div>
</template>
