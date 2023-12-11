
<template>
<button class="" onclick="my_modal_3.showModal()">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
</button>
<dialog id="my_modal_3" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 class="font-bold text-lg">Welcome!</h3>
    <p class="py-4">    
      Participate in a phase to unlock the next one!<br>
      <div class="pt-4">
        <b>I. Opinions</b><br>
        Everyone writes their opinion during the given time
      </div>
      
      <div class="pt-4">
        <b>II. Reviews</b><br>
        Participants are assigned opinions to evaluate
      </div>
      
      <div class="pt-4">
      <b>III. Results</b><br>
      Everyone can view the debate summary and how impactful each opinion was
      </div>
    </p>
  </div>
</dialog>
</template>