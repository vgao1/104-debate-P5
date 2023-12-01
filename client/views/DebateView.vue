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
const { isLoggedIn } = storeToRefs(useUserStore());

async function getDebate() {
  let res;
  try {
    res = await fetchy(`/api/activeDebates/${debateId}`, "GET", {});
  } catch (_) {
    console.log("error");
    return;
  }
  const currentTime = new Date().getTime();
  const debateDeadline = new Date(res.deadline).getTime();
  timeLeft.value = Math.floor((debateDeadline - currentTime) / 36e5);
  // less than 1 hour left
  if (timeLeft.value == 0) {
    timeUnit.value = "min";
    timeLeft.value = Math.floor((debateDeadline - currentTime) / 6e4);
    // no time left
    if (timeLeft.value <= 0) {
      if (res.curPhase === "Review") {
        void router.push({
          path: `/debates/${debateId}/reviews`,
        });
      } else {
        void router.push({
          path: `/debates/${debateId}/opinions`,
        });
      }
    }
  }
  debate.value = res;
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

    <TextContainer>
      <div class="flex justify-center">
        <div>
          <p class="text-base">
            Due at <b>{{ debate.deadline }}</b>
          </p>
          <p class="text-sm">{{ timeLeft + " " + timeUnit }} remaining</p>
        </div>
      </div>
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

    <TextContainer>
      <OpinionForm />
    </TextContainer>
  </div>
</template>
