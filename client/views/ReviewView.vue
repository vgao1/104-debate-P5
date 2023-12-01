<script setup lang="ts">
import BackArrowHeader from "@/components/Nav/BackArrowHeader.vue";
import OpinionSlider from "@/components/OpinionSlider.vue";
import TextContainer from "@/components/TextContainer.vue";
import { ref, watch, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { fetchy } from "@/utils/fetchy";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import router from "../router";

// TODO: sum larger than 100
const totalValue = 100;
const numberOfSliders = 3;
const sliderValues = ref(Array(numberOfSliders).fill(totalValue / numberOfSliders));
const route = useRoute();
const debateId = route.params.id;
const debate = ref<Record<string, string>>({});
const loaded = ref(false);
const { isLoggedIn } = storeToRefs(useUserStore());

async function getDebate() {
  let res;
  try {
    res = await fetchy(`/api/activeDebates/${debateId}`, "GET", {});
    debate.value = res;
  } catch (_) {
    console.log("error");
    try {
      res = await fetchy(`/api/historyDebates/${debateId}`, "GET", {});
      debate.value = { curPhase: res.curPhase, prompt: res.prompt, category: res.category };
    } catch (_) {
      console.log("no debate found");
    }
    return;
  }
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
// Setting up individual watchers for each slider
for (let i = 0; i < numberOfSliders; i++) {
  watch(
    () => sliderValues.value[i],
    (newValue, oldValue) => {
      const currentTotal = sliderValues.value.reduce((a, b) => a + b, 0);
      // don't update if the currentTotal is already close to total in absolute value
      if (Math.abs(currentTotal - totalValue) < 1) {
        return;
      }

      const remainingValue = totalValue - newValue;
      const otherSliders = sliderValues.value.filter((_, index) => index !== i);

      const otherSlidersSum = otherSliders.reduce((a, b) => a + b, 0);
      const multiplier = remainingValue / otherSlidersSum;

      for (let j = 0; j < numberOfSliders; j++) {
        if (j !== i) {
          sliderValues.value[j] = sliderValues.value[j] * multiplier;
        }
      }
    },
  );
}
</script>

<template>
  <div class="py-4">
    <TextContainer>
      <BackArrowHeader text="Debate" />
    </TextContainer>

    <TextContainer>
      <div class="border-l-0 border-neutral-300 space-y-1">
        <div class="flex justify-between items-center">
          <b class="text-sm">{{ debate.category }}</b>
          <!-- <p class="text-sm text-lime-400">Due in 6h</p> -->
        </div>
        <p class="pb-1 text-base">{{ debate.prompt }}</p>
      </div>
    </TextContainer>

    <TextContainer v-if="debate.curPhase === 'Review'">
      <div class="space-y-2">
        <div v-for="(sliderValue, index) in sliderValues" :key="index">
          Review {{ index + 1 }}
          <OpinionSlider v-model="sliderValues[index]" />
        </div>
      </div>
    </TextContainer>
    <TextContainer v-else-if="debate.curPhase === 'Recently Completed' || debate.curPhase === 'Archived'">
      Debate is past Review phase where users review other users' different opinions. Please view debate <a style="color: blue" href="./opinions">here</a>
    </TextContainer>
    <TextContainer v-else-if="debate.curPhase === 'Start'">
      Unavailable because debate is in Start phase where users submit opinions. Please view debate <a style="color: blue" href=".">here</a>
    </TextContainer>
    <TextContainer v-else> Review Opinions page will be unlocked when a debate is initialized with this prompt. </TextContainer>
  </div>
</template>
