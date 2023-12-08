<script setup lang="ts">
import BackArrowHeader from "@/components/Nav/BackArrowHeader.vue";
import OpinionSlider from "@/components/OpinionSlider.vue";
import TextContainer from "@/components/TextContainer.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import router from "../router";

// const totalValue = 100;
const totalValue = 150;
const numberOfSliders = 3;
const sliderValues = ref(Array(numberOfSliders).fill(totalValue / numberOfSliders));
const route = useRoute();
const debateId = route.params.id;
const debate = ref<Record<string, string>>({});
const opinions = ref<Array<Record<string, string>>>([]);
const revisedOpinionSliderValue = ref(50);
const maxOpinionChars = 1000;
const opinionText = ref("");
const loaded = ref(false);
const { isLoggedIn } = storeToRefs(useUserStore());

// TODO: get the 3 assigned opinions for the user
async function getDebate() {
  let res;
  try {
    res = await fetchy(`/api/activeDebates/${debateId}`, "GET", {});
    debate.value = res;
    opinions.value = res.opinions;
  } catch (_) {
    console.log("error");
    try {
      res = await fetchy(`/api/historyDebates/${debateId}`, "GET", {});
      console.log(res);
      debate.value = { curPhase: res.curPhase, prompt: res.prompt, category: res.category };
      opinions.value = res.opinions;
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
    (newValue) => {
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

async function submitOpinion() {}
</script>

<template>
  <div v-if="loaded" class="py-4">
    <TextContainer>
      <BackArrowHeader text="Debate" />
    </TextContainer>

    <TextContainer v-if="debate.curPhase">
      <div class="border-l-0 border-neutral-300 space-y-1">
        <div class="flex justify-between items-center">
          <b class="text-sm">{{ debate.category }}</b>
          <!-- <p class="text-sm text-lime-400">Due in 6h</p> -->
        </div>
        <p class="pb-1 text-base">{{ debate.prompt }}</p>
      </div>
    </TextContainer>

    <TextContainer v-if="debate.curPhase === 'Review'">
      <div v-for="(opinion, index) in opinions" :key="opinion._id" class="flex flex-col">
        <TextContainer>
          <b class="text-sm">Opinion {{ index + 1 }}</b>
          <p>{{ opinion.content }}</p>
        </TextContainer>
      </div>

      <TextContainer>
        <b>Your review</b>
        <p class="pb-2">How interesting is each opinion?</p>
        <div class="space-y-2">
          <div v-for="(sliderValue, index) in sliderValues" :key="index">
            Opinion {{ index + 1 }}
            <OpinionSlider v-model="sliderValues[index]" />
          </div>
        </div>
      </TextContainer>

      <p class="font-bold py-3 text-base">Revise your opinion</p>
      <OpinionSlider v-model="revisedOpinionSliderValue" />

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
        <textarea v-model="opinionText" class="textarea textarea-bordered h-24 font-base" placeholder=""></textarea>
        <label class="label">
          <span class="label-text"></span>
          <span class="label-text-alt">({{ opinionText.length }}/{{ maxOpinionChars }})</span>
        </label>
      </div>

      <div class="flex justify-center space-x-2 pt-3">
        <button @click="submitOpinion" class="btn">Submit</button>
      </div>
    </TextContainer>
    <TextContainer v-else-if="debate.curPhase === 'Recently Completed' || debate.curPhase === 'Archived'">
      Debate is past Review phase where users review other users' different opinions. Please view debate <a style="color: blue" href="./opinions">here</a>
    </TextContainer>
    <TextContainer v-else-if="debate.curPhase === 'Start'">
      Unavailable because debate is in Start phase where users submit opinions. Please view debate <a style="color: blue" href=".">here</a>
    </TextContainer>
    <TextContainer v-else-if="debate.curPhase"> Review Opinions page will be unlocked when a debate is initialized with this prompt. </TextContainer>
    <TextContainer v-else>No debate with ID {{ debateId }} found.</TextContainer>
  </div>
</template>
