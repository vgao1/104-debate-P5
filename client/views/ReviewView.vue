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
const debateId = typeof route.params.id === "string" ? route.params.id : "";
const debate = ref<Record<string, string>>({});
const opinions = ref<Array<Record<string, string>>>([]);
const revisedOpinionSliderValue = ref(50);
const maxOpinionChars = 1000;
const opinionText = ref("");
const errorText = ref("");
const successText = ref("");
const buttonText = ref("");
const cantReviewMsg = ref("");
const loaded = ref(false);
const { isLoggedIn } = storeToRefs(useUserStore());
const timeLeft = ref();
const timeUnit = ref("hr");
const timeLeftString = ref("");
const routePath = route.path.slice(-1) === "/" ? route.path.substring(0, route.path.length - 1) : route.path;

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
    debate.value = res;
    // less than 1 hour left
    if (timeLeft.value == 0) {
      timeUnit.value = "min";
      timeLeft.value = Math.floor((debateDeadline - currentTime) / 6e4);
      // less than 1 min left
      if (timeLeft.value == 0) {
        const numSecsLeft = Math.floor((debateDeadline - currentTime) / 1e3);
        if (numSecsLeft > 0) {
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
    await matchUserToOpinions();
  } catch (_) {
    try {
      res = await fetchy(`/api/historyDebates/${debateId}`, "GET", {});
      debate.value = { curPhase: res.curPhase, prompt: res.prompt, category: res.category };
    } catch (_) {
      return;
    }
  }
  return;
}

async function matchUserToOpinions() {
  let matches;
  try {
    matches = await fetchy(`/api/debate/matchOpinions`, "POST", {
      body: { debate: debateId },
      alert: false,
    });
    opinions.value = matches;
    await getReviewData();
  } catch (error: any) {
    cantReviewMsg.value = error.message;
  }
  return;
}

async function getReviewData() {
  let revisedOpinion;
  try {
    revisedOpinion = await fetchy(`/api/debate/getMyRevisedOpinion/${debateId}`, "GET", {});
  } catch (_) {
    return;
  }
  revisedOpinionSliderValue.value = revisedOpinion.likertScale ? revisedOpinion.likertScale : 50;
  opinionText.value = revisedOpinion.content;
  buttonText.value = revisedOpinion.buttonText;

  try {
    for (let i = 0; i < opinions.value.length; i++) {
      const currentOpinion = opinions.value[i].opinionId;
      let query: Record<string, string> = { debateID: debateId, opinion: currentOpinion };
      sliderValues.value[i] = await fetchy(`/api/review/score/`, "GET", { query });
    }
  } catch (_) {
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

async function submitOpinion() {
  for (let i = 0; i < opinions.value.length; i++) {
    const matchedOpinion = opinions.value[i];
    try {
      await fetchy(`/api/opinion/submitReview`, "POST", {
        body: { opinion: matchedOpinion.opinionId, debateId, score: sliderValues.value[i] },
        alert: false,
      });
    } catch {
      try {
        await fetchy(`/api/reviews/${debateId}`, "DELETE", {});
      } catch (_) {
        errorText.value = "Unsuccessful submission of score. Previously submitted scores not cleared successfully";
        return;
      }
      let currentAction = "submitted";
      if (buttonText.value === "Update") {
        currentAction = "updated";
      }
      errorText.value = "Scores not " + currentAction + "successfully";
      return;
    }
  }
  try {
    await fetchy("/api/debate/submitRevisedOpinion", "POST", {
      body: {
        debate: debateId,
        content: opinionText.value,
        likertScale: revisedOpinionSliderValue.value,
      },
      alert: false,
    });
    errorText.value = "";
    let currentAction = "submitted";
    if (buttonText.value === "Update") {
      currentAction = "updated";
    }
    successText.value = "Your review has been " + currentAction + "!";
    await getReviewData();
  } catch (_) {
    errorText.value = "Your revised opinion was not successfully submitted!";
    return;
  }
}
</script>

<template>
  <div v-if="loaded" class="py-4">
    <TextContainer>
      <BackArrowHeader text="Debate" />
    </TextContainer>

    <TextContainer v-if="debate.curPhase === 'Review'">
      <div class="flex justify-center">
        <div>
          <p class="text-base" v-if="cantReviewMsg.length == 0 && opinions">
            <b class="text-orange-400">Review</b> due
            <b>{{ formatDate(debate.deadline) }}</b>
          </p>
          <p class="text-base" v-else>
            Phase II <b class="text-orange-400">(Reviews)</b> ends on <br /><b>{{ formatDate(debate.deadline) }}</b>
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

    <div v-if="debate.curPhase === 'Review'">
      <div v-if="cantReviewMsg.length == 0 && opinions && opinions.length > 0">
        <div v-for="(opinion, index) in opinions" :key="opinion._id" class="flex flex-col">
          <TextContainer>
            <b class="text-sm">Opinion {{ index + 1 }}</b>
            <p>{{ opinion.content }}</p>
          </TextContainer>
        </div>

        <TextContainer>
          <b>Your review</b>
          <p class="pb-2">How compelling is each opinion? How likely are you to change your mind after reading each opinion?</p>
          <div class="space-y-2">
            <div v-for="(opinion, index) in opinions" :key="opinion._id">
              Opinion {{ index + 1 }}
              <OpinionSlider v-model="sliderValues[index]" />
            </div>
          </div>
        </TextContainer>

        <TextContainer>
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
            <button @click="submitOpinion" class="btn">{{ buttonText }}</button>
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
        </TextContainer>
      </div>
      <TextContainer v-else-if="cantReviewMsg.length > 0">
        {{ cantReviewMsg }}
      </TextContainer>
      <TextContainer v-else-if="!opinions">
        No users submitted an opinion with a different Likert agreeness value than yours, so you don't have opinions to review. Please come back at the end of Phase II (Reviews) to view other users'
        written responses.
      </TextContainer>
    </div>
    <TextContainer v-else-if="debate.curPhase === 'Recently Completed' || debate.curPhase === 'Archived'">
      Debate is past Phase II (Reviews) where users review other users' different opinions. Please view this debate <a style="color: blue" href="./opinions">here</a>
    </TextContainer>
    <TextContainer v-else-if="debate.curPhase === 'Start'">
      Unavailable because this debate is in Phase I (Opinions) where users submit opinions. Please view this debate
      <a style="color: blue" :href="'/' + routePath.substring(1, routePath.lastIndexOf('/'))">here</a>
    </TextContainer>
    <TextContainer v-else-if="debate.curPhase"> Review Opinions page will be unlocked when a debate is initialized with this prompt. </TextContainer>
    <TextContainer v-else>No debate with ID {{ debateId }} found.</TextContainer>
  </div>
</template>
