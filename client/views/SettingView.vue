<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();
const userDelta = ref("");

async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Home" });
}

async function getUserDelta() {
  let res;
  try {
    res = await fetchy(`/api/userDeltas`, "GET", { alert: false });
    userDelta.value = res;
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  await getUserDelta();
});
</script>

<template>
  <main class="column">
    <h1>Settings for {{ currentUsername }}</h1>
    <p>
      You currently have a total of <b>{{ userDelta }}</b
      >.
    </p>
    <button class="pure-button pure-button-primary" @click="logout">Logout</button>
    <button class="button-error pure-button" @click="delete_">Delete User</button>
    <UpdateUserForm />
  </main>
</template>
