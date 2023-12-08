<script setup lang="ts">
import BackArrowHeader from "@/components/Nav/BackArrowHeader.vue";
import TextContainer from "@/components/TextContainer.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, Ref } from "vue";
import { useRoute } from "vue-router";
import router from "../router";

const route = useRoute();
const debateId = route.params.id;
const opinions = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);
const debatePhase = ref("");
const prompt = ref("");
const category = ref("");
const deltas: Ref<Map<string, number>> = ref(new Map());

const { isLoggedIn } = storeToRefs(useUserStore());

async function getOpinions() {
  let res;
  try {
    res = await fetchy(`/api/historyDebates/${debateId}`, "GET", {});
  } catch (_) {
    console.log("error");
    return;
  }

  opinions.value = res.opinions;
  debatePhase.value = res.curPhase;
  category.value = res.category;
  prompt.value = res.prompt;
}

async function getDeltas() {
  let res;
  try {
    res = await fetchy(`/api/reviews/deltas/${debateId}`, "GET");
  } catch (_) {
    console.log("error");
    return;
  }

  deltas.value = res;
}

onBeforeMount(async () => {
  if (!isLoggedIn.value) {
    void router.push({
      path: `/login`,
    });
  } else {
    await getOpinions();
    await getDeltas();
    loaded.value = true;
    console.log(loaded.value && debatePhase.value === "Recently Completed");
  }
});
</script>

<template>
  <div v-if="loaded" class="py-4">
    <TextContainer>
      <BackArrowHeader text="Debate" />
    </TextContainer>

    <TextContainer v-if="debatePhase">
      <div class="border-l-0 border-neutral-300 space-y-1">
        <div class="flex justify-between items-center">
          <b class="text-sm">{{ category }}</b>
          <!-- <p class="text-sm text-lime-400">Due in 6h</p> -->
        </div>
        <p class="pb-1 text-base">{{ prompt }}</p>
      </div>
    </TextContainer>

    <div v-if="debatePhase === 'Recently Completed' || debatePhase === 'Archived'">
      <section v-if="opinions.length > 0">
        <div v-for="opinion in opinions" :key="opinion._id" class="flex flex-col">
          <TextContainer>
            <b class="text-sm">User Opinion: </b>
            {{ opinion.content }}
          </TextContainer>
        </div>
      </section>
      <TextContainer v-else> No opinions were submitted for this prompt </TextContainer>
    </div>
    <div v-else-if="debatePhase === 'Start'">
      <TextContainer> Unavailable because debate is in Start phase where users submit opinions. Please view debate <a style="color: blue" href=".">here</a> </TextContainer>
    </div>
    <div v-else-if="debatePhase">
      <TextContainer> Opinion Submission page will be unlocked when a debate is initialized with this prompt. </TextContainer>
    </div>
    <div v-else>
      <TextContainer> No debate with ID {{ debateId }} found. </TextContainer>
    </div>
  </div>
</template>
