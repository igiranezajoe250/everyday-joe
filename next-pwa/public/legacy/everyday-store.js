// everyday-store.js — reactive cache over the Everyday microservices.
//
// The Go services are the source of truth. This store is a thin client-side
// cache that hydrates from them on session-ready, exposes one snapshot to
// React, and routes writes back through the owning service before re-reading.
//
// Each slice mirrors one service. No screen should reach into Supabase
// directly — they read from the snapshot and call store actions to mutate.
(function () {
  function emptySlice() {
    return { loaded: false, loading: false, error: null };
  }

  function initialState() {
    return {
      ready: false,
      userId: null,
      shop:    Object.assign(emptySlice(), { shops: [], products: [] }),
      save:    Object.assign(emptySlice(), { wallet: null, transactions: [], goals: [], schedules: [], proposals: [], interestApr: 0.08 }),
      pay:     Object.assign(emptySlice(), { transactions: [] }),
      plan:    Object.assign(emptySlice(), { folders: [], files: [] }),
      listen:  Object.assign(emptySlice(), { sources: [], episodes: [] }),
      commute: Object.assign(emptySlice(), { options: [] }),
      activity: Object.assign(emptySlice(), { transactions: [], events: [] }),
      bounty:  Object.assign(emptySlice(), { snapshot: null }),
    };
  }

  var state = initialState();
  var listeners = new Set();

  function emit() {
    state = Object.assign({}, state); // new top-level ref so React re-renders
    listeners.forEach(function (fn) { try { fn(state); } catch (e) {} });
  }

  function patch(key, next) {
    state[key] = Object.assign({}, state[key], next);
    emit();
  }

  function subscribe(fn) {
    listeners.add(fn);
    return function () { listeners.delete(fn); };
  }

  function getState() { return state; }

  // ── slice hydrators ──
  // Each one writes loading -> success/error into its slice. Callers can await
  // a single slice or call hydrateAll() to fan out.

  async function hydrateShop() {
    if (!window.EverydayAPI) return;
    patch("shop", { loading: true, error: null });
    try {
      var data = await window.EverydayAPI.shop.list();
      patch("shop", { loading: false, loaded: true, shops: data.shops || [], products: data.products || [] });
    } catch (err) {
      patch("shop", { loading: false, error: err.message || String(err) });
    }
  }

  async function hydrateSave() {
    if (!window.EverydayAPI) return;
    patch("save", { loading: true, error: null });
    try {
      var data = await window.EverydayAPI.save.get();
      patch("save", {
        loading: false, loaded: true,
        wallet: data.wallet || null,
        transactions: data.transactions || [],
        goals: data.goals || [],
        schedules: data.schedules || [],
        proposals: data.proposals || [],
        interestApr: typeof data.interest_apr === "number" ? data.interest_apr : 0.08,
      });
    } catch (err) {
      patch("save", { loading: false, error: err.message || String(err) });
    }
  }

  async function hydratePay() {
    if (!window.EverydayAPI) return;
    patch("pay", { loading: true, error: null });
    try {
      var data = await window.EverydayAPI.pay.get();
      patch("pay", { loading: false, loaded: true, transactions: data.transactions || [] });
    } catch (err) {
      patch("pay", { loading: false, error: err.message || String(err) });
    }
  }

  async function hydratePlan() {
    if (!window.EverydayAPI) return;
    patch("plan", { loading: true, error: null });
    try {
      var data = await window.EverydayAPI.planService.list();
      patch("plan", { loading: false, loaded: true, folders: data.folders || [], files: data.files || [] });
    } catch (err) {
      patch("plan", { loading: false, error: err.message || String(err) });
    }
  }

  async function hydrateListen() {
    if (!window.EverydayAPI) return;
    patch("listen", { loading: true, error: null });
    try {
      var data = await window.EverydayAPI.listen.list();
      patch("listen", { loading: false, loaded: true, sources: data.sources || [], episodes: data.episodes || [] });
    } catch (err) {
      patch("listen", { loading: false, error: err.message || String(err) });
    }
  }

  async function hydrateCommute() {
    if (!window.EverydayAPI) return;
    patch("commute", { loading: true, error: null });
    try {
      var data = await window.EverydayAPI.commute.list();
      patch("commute", { loading: false, loaded: true, options: Array.isArray(data) ? data : (data.options || []) });
    } catch (err) {
      patch("commute", { loading: false, error: err.message || String(err) });
    }
  }

  async function hydrateActivity() {
    if (!window.EverydayAPI) return;
    patch("activity", { loading: true, error: null });
    try {
      var data = await window.EverydayAPI.activity.get();
      patch("activity", { loading: false, loaded: true, transactions: data.transactions || [], events: data.events || [] });
    } catch (err) {
      patch("activity", { loading: false, error: err.message || String(err) });
    }
  }

  // Bounty is the bridge — used by the assistant panel, not auto-hydrated.
  async function ask(question) {
    if (!window.EverydayAPI) return null;
    patch("bounty", { loading: true, error: null });
    try {
      var data = await window.EverydayAPI.bounty.ask(question || "");
      patch("bounty", { loading: false, loaded: true, snapshot: data });
      return data;
    } catch (err) {
      patch("bounty", { loading: false, error: err.message || String(err) });
      return null;
    }
  }

  // hydrateAll fans out. Public slices always load; private slices need a user.
  async function hydrateAll(opts) {
    opts = opts || {};
    var publicJobs = [hydrateShop(), hydrateListen(), hydrateCommute()];
    var privateJobs = opts.userId
      ? [hydrateSave(), hydratePay(), hydratePlan(), hydrateActivity()]
      : [];
    if (opts.userId) state.userId = opts.userId;
    await Promise.all(publicJobs.concat(privateJobs));
    state.ready = true;
    emit();
  }

  function reset() {
    state = initialState();
    emit();
  }

  // ── mutations ── always go through the owning service, then re-hydrate
  // just that slice. Keeps the cache honest without a full refresh.

  async function deposit(amountRwf, title, goalId) {
    var res = await window.EverydayAPI.save.deposit(amountRwf, title, goalId);
    await Promise.all([hydrateSave(), hydrateActivity()]);
    return res;
  }
  async function withdraw(amountRwf, title) {
    var res = await window.EverydayAPI.save.withdraw(amountRwf, title);
    await Promise.all([hydrateSave(), hydrateActivity()]);
    return res;
  }
  async function createGoal(label, targetRwf, deadline) {
    var res = await window.EverydayAPI.save.createGoal(label, targetRwf, deadline);
    await hydrateSave();
    return res;
  }
  async function updateGoal(goalId, patch) {
    var res = await window.EverydayAPI.save.updateGoal(goalId, patch);
    await hydrateSave();
    return res;
  }
  async function deleteGoal(goalId) {
    var res = await window.EverydayAPI.save.deleteGoal(goalId);
    await hydrateSave();
    return res;
  }
  async function cancelSchedule(scheduleId) {
    var res = await window.EverydayAPI.save.cancelSchedule(scheduleId);
    await hydrateSave();
    return res;
  }
  async function createSchedule(amountRwf, cadence, goalId) {
    var res = await window.EverydayAPI.save.createSchedule(amountRwf, cadence, goalId);
    await hydrateSave();
    return res;
  }
  async function confirmProposal(proposalId) {
    var res = await window.EverydayAPI.save.confirmProposal(proposalId);
    await hydrateSave();
    return res;
  }
  async function rejectProposal(proposalId) {
    var res = await window.EverydayAPI.save.rejectProposal(proposalId);
    await hydrateSave();
    return res;
  }
  async function order(productId, quantity) {
    var res = await window.EverydayAPI.shop.order(productId, quantity);
    await Promise.all([hydrateShop(), hydrateSave(), hydrateActivity()]); // stock + wallet + ledger
    return res;
  }
  async function pay(amountRwf, recipient, note) {
    var res = await window.EverydayAPI.pay.send(amountRwf, recipient, note);
    await Promise.all([hydratePay(), hydrateSave(), hydrateActivity()]); // pay log + wallet + ledger
    return res;
  }
  async function savePlan(folders, files) {
    var res = await window.EverydayAPI.planService.save(folders, files);
    await hydratePlan();
    return res;
  }

  window.EverydayStore = {
    getState: getState,
    subscribe: subscribe,
    hydrateAll: hydrateAll,
    hydrate: {
      shop: hydrateShop,
      save: hydrateSave,
      pay: hydratePay,
      plan: hydratePlan,
      listen: hydrateListen,
      commute: hydrateCommute,
      activity: hydrateActivity,
    },
    actions: {
      deposit: deposit,
      withdraw: withdraw,
      createGoal: createGoal,
      updateGoal: updateGoal,
      deleteGoal: deleteGoal,
      createSchedule: createSchedule,
      cancelSchedule: cancelSchedule,
      confirmProposal: confirmProposal,
      rejectProposal: rejectProposal,
      order: order,
      pay: pay,
      savePlan: savePlan,
      ask: ask,
    },
    reset: reset,
  };

  // React bridge — components subscribe via this hook and re-render on emit.
  // Loaded after React in Everyday.html, so React is available here.
  if (typeof React !== "undefined") {
    window.useEveryday = function useEveryday() {
      var pair = React.useState(state);
      React.useEffect(function () {
        // Catch any emit that landed between render and effect.
        if (pair[0] !== state) pair[1](state);
        return subscribe(pair[1]);
      }, []);
      return pair[0];
    };
  }
})();
