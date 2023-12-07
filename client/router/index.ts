import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import SuggestPromptViewVue from "@/views/SuggestPromptView.vue";
import DebateView from "../views/DebateView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import OpinionsView from "../views/OpinionsView.vue";
import SettingView from "../views/SettingView.vue";
import TestingView from "../views/TestingView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/testing",
      name: "Testing",
      component: TestingView,
    },
    {
      path: "/debates/:id",
      name: "Debate",
      component: DebateView,
    },
    {
      path: "/debates/:id/opinions",
      name: "Opinions",
      component: OpinionsView,
    },
    {
      path: "/suggest",
      name: "Suggest",
      component: SuggestPromptViewVue,
    },
    {
      path: "/setting",
      name: "Settings",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
