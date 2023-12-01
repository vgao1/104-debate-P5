<script setup lang="ts">
import BackArrowHeader from "@/components/Nav/BackArrowHeader.vue";
import TextContainer from "@/components/TextContainer.vue";
import { useRoute } from "vue-router";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import router from "../router";

const route = useRoute();
const debateId = route.params.id;
const debate = ref<Record<string, string>>({});
const opinions = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);
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
  debate.value = res.debate;
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

    <TextContainer>
      <div class="border-l-0 border-neutral-300 space-y-1">
        <div class="flex justify-between items-center">
          <b class="text-sm">{{ debate.category }}</b>
          <!-- <p class="text-sm text-lime-400">Due in 6h</p> -->
        </div>
        <p class="pb-1 text-base">{{ debate.prompt }}</p>
      </div>
    </TextContainer>

    <div v-for="opinion in opinions" :key="opinion._id" class="flex flex-col">
      <TextContainer>
        <b class="text-sm">User Opinion: </b>
        {{ opinion.content }}
      </TextContainer>
    </div>
  </div>
</template>
