<script setup lang="ts">
import BackArrowHeader from "@/components/Nav/BackArrowHeader.vue";
import TextContainer from "@/components/TextContainer.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import router from "../router";

const route = useRoute();
const debateId = typeof route.params.id === "string" ? route.params.id : "";
const opinions = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);
const debatePhase = ref("");
const prompt = ref("");
const category = ref("");
const routePath = route.path.slice(-1) === "/" ? route.path.substring(0, route.path.length - 1) : route.path;

const { isLoggedIn } = storeToRefs(useUserStore());

async function getOpinions() {
  let res;
  try {
    res = await fetchy(`/api/historyDebates/${debateId}`, "GET", {});
  } catch (_) {
    return;
  }
  opinions.value = res.opinions;
  debatePhase.value = res.curPhase;
  category.value = res.category;
  prompt.value = res.prompt;
  return;
}

onBeforeMount(async () => {
  if (!isLoggedIn.value) {
    void router.push({
      path: `/login`,
    });
  } else {
    await getOpinions();
    loaded.value = true;
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
            <p class="text-right">{{ opinion.score || 0 }} Deltas</p>
          </TextContainer>
        </div>
      </section>
      <TextContainer v-else> No opinions were submitted for this prompt </TextContainer>
    </div>
    <div v-else-if="debatePhase === 'Review'">
      <TextContainer> Unavailable because this debate is in Phase II (Reviews) where users review opinions. Please view this debate <a style="color: blue" href="./reviews">here</a> </TextContainer>
    </div>
    <div v-else-if="debatePhase === 'Start'">
      <TextContainer>
        Unavailable because this debate is in Phase I (Opinions) where users submit opinions. Please view this debate
        <a style="color: blue" :href="'/' + routePath.substring(1, routePath.lastIndexOf('/'))">here</a>
      </TextContainer>
    </div>
    <div v-else-if="debatePhase === 'Proposed'">
      <TextContainer> Opinion Submission page will be unlocked when a debate is initialized with this prompt. </TextContainer>
    </div>
    <div v-else>
      <TextContainer> No debate with ID {{ debateId }} found. </TextContainer>
    </div>
  </div>
</template>
