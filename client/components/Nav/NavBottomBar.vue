<script setup lang="ts">
import router from "@/router";
import { onBeforeMount, onMounted, ref, computed } from "vue";
import { useRoute } from 'vue-router';

// use current route instead of props to determine which page is active (otherwise have some bugs, e.g. when refreshing on non-home page)
// const props = defineProps(["activeIcon"]);
// const activeIconId = props.activeIcon + "-icon-btn";

const route = useRoute()
const currentRouteName = computed(() => route.name)

const activeIconId = computed(() => {
  if (currentRouteName.value == "Home") {
    return "home-icon-btn";
  } else if (currentRouteName.value == "Suggest") {
    return "suggest-icon-btn";
  } else if (currentRouteName.value == "Settings") {
    return "login-icon-btn";
  }
});

onMounted(() => {
  removeActiveClass();
  if (activeIconId.value != undefined) {
    document.getElementById(activeIconId.value)!.classList.add("active");
  }
});

function openHome() {
  removeActiveClass();
  document.getElementById("home-icon-btn")!.classList.add("active");
  void router.push({
    path: `/`,
  });
}

function openSuggest() {
  removeActiveClass();
  document.getElementById("suggest-icon-btn")!.classList.add("active");
  void router.push({
    path: `/suggest`,
  });
}

function openLogin() {
  removeActiveClass();
  document.getElementById("login-icon-btn")!.classList.add("active");
  void router.push({
    path: `/login`,
  });
}

function removeActiveClass() {
  const activeElements = document.getElementsByClassName("active");
  while (activeElements.length > 0) {
    activeElements[0].classList.remove("active");
  }
}
</script>
<template>
  <div class="btm-nav" onload="setActiveClass">
    <button id="home-icon-btn" @click="openHome">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    </button>

    <button id="suggest-icon-btn" @click="openSuggest">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>

    <button>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    </button>

    <button id="login-icon-btn" @click="openLogin">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    </button>
  </div>
</template>
