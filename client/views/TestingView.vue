<script setup lang="ts">
import { ref } from "vue";

const statusCode = ref("");
const responseText = ref("");

const operations = [
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: ["input", "text"], password: ["input", "password"] },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Signup",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: ["input", "text"], password: ["input", "password"] },
  },
  {
    name: "Find a user by username (leave empty for all)",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: ["input", "text"] },
  },
  {
    name: "Get current logged in user (Session)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Update user",
    endpoint: "/api/users",
    method: "PATCH",
    fields: { update: { username: ["input", "text"], password: ["input", "password"] } },
  },
  {
    name: "Delete logged in user",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Phase Add",
    endpoint: "/api/phase",
    method: "POST",
    fields: { key: ["input", "text"] },
  },
  {
    name: "Update Phase",
    endpoint: "/api/debate/changeDeadline",
    method: "PATCH",
    fields: { key: ["input", "text"], newDeadline: ["input", "datetime-local"] },
  },
  {
    name: "Get Phase by item's ID (leave empty for all active phases)",
    endpoint: "/api/phase/:key",
    method: "GET",
    fields: { key: ["input", "text"] },
  },
  {
    name: "Delete an active Phase by item ID",
    endpoint: "/api/phase/active/:key",
    method: "DELETE",
    fields: { key: ["input", "text"] },
  },
  {
    name: "Delete expired Phases by item ID",
    endpoint: "/api/phase/expired/:key",
    method: "DELETE",
    fields: { key: ["input", "text"] },
  },
  {
    name: "Change max phase",
    endpoint: "/api/phase/maxPhase",
    method: "PATCH",
    fields: { maxMax: ["input", "number"] },
  },
  {
    name: "Change the hour extension",
    endpoint: "/api/phase/extension",
    method: "PATCH",
    fields: { newVal: ["input", "number"] },
  },
  {
    name: "Suggest Prompt",
    endpoint: "/api/debate/newPrompt",
    method: "POST",
    fields: { prompt: ["input", "text"], category: ["input", "text"] },
  },
  {
    name: "Initialize Debate",
    endpoint: "/api/debate/newDebate",
    method: "POST",
    fields: { prompt: ["input", "text"], category: ["input", "text"] },
  },
  {
    name: "Submit Opinion",
    endpoint: "/api/debate/submitOpinion",
    method: "POST",
    fields: { debate: ["input", "text"], content: ["input", "text"], likertScale: ["input", "text"] },
  },
  {
    name: "Match Participant to Different Opinions",
    endpoint: "/api/debate/matchOpinions",
    method: "GET",
    fields: { debate: ["input", "text"] },
  },
  {
    name: "Remove Matched Opinion",
    endpoint: "/api/debate/removeMatchedOpinion",
    method: "POST",
    fields: { debate: ["input", "text"], opinionId: ["input", "text"] },
  },
];

async function submitEventHandler(e: Event) {
  const form = e.target as HTMLFormElement;
  const formEntries = new FormData(form);
  const reqData: Record<string, any> = {};
  formEntries.forEach((val, key) => {
    if (key !== "$endpoint" && key !== "$method") {
      reqData[key as string] = val;
    }
  });

  // Replace :param with the actual value.
  let endpoint = (formEntries.get("$endpoint") as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const method = formEntries.get("$method") as string;
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      credentials: "same-origin",
    },
  };

  statusCode.value = "";
  responseText.value = "Loading...";

  if (reqData) {
    if (method === "GET" || method === "DELETE") {
      const queryString = new URLSearchParams(reqData).toString();
      endpoint = `${endpoint}?${queryString}`;
    } else {
      fetchOptions.body = JSON.stringify(reqData);
    }
  }

  const response = await fetch(endpoint, fetchOptions);
  const result = await response.json();
  statusCode.value = response.status.toString() + " (" + response.statusText + ")";
  responseText.value = JSON.stringify(result, null, 2);
}
</script>

<template>
  <main>
    <h1>Backend Tester</h1>
    <div style="overflow: hidden">
      <section id="response" style="overflow: scroll; height: 25vh">
        <h2>
          Response <span id="status-code">{{ statusCode }}</span>
        </h2>
        <pre id="response-text"> {{ responseText }}</pre>
      </section>
      <section id="operations" style="overflow: scroll; height: 55vh">
        <h2>API Operations</h2>
        <ul>
          <li v-for="op of operations" :key="op.name" style="margin-bottom: 10px; margin-top: 10px">
            <h3>{{ op.name }}:</h3>
            <form class="operation-form" @submit.prevent="submitEventHandler">
              <input type="hidden" name="$endpoint" :value="op.endpoint" />
              <input type="hidden" name="$method" :value="op.method" />
              <div v-for="[field, tag] of Object.entries(op.fields)" :key="field" class="field" style="margin-left: 20px; margin-top: 10px">
                <label :for="field + 'field'" style="margin-right: 8px">{{ field }}</label>
                <input v-if="tag[0] === 'input'" :type="tag[1]" :name="field" :id="field + 'field'" />
                <textarea v-else :name="field" :id="field + 'field'"></textarea>
              </div>
              <button type="submit" style="background-color: blue; margin-top: 10px; padding: 4px; margin-bottom: 10px">Submit</button>
            </form>
            <hr />
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
