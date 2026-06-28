(function () {
  var PROJECT_URL = "https://eovubrcjtclkcuzvmzbk.supabase.co";
  var state = {
    ready: false,
    configured: false,
    client: null,
    config: null,
    error: null,
  };

  function normalizeProfile(row, user) {
    if (!row && !user) return null;
    var email = row && row.email ? row.email : user && user.email ? user.email : "";
    var name = row && row.display_name ? row.display_name : "";
    if (!name && email) name = email.split("@")[0].replace(/[._-]+/g, " ");
    return {
      id: row && row.id ? row.id : user && user.id,
      display_name: name || "Everyday user",
      phone: row && row.phone ? row.phone : user && user.phone ? user.phone : "",
      email: email,
      avatar_url: row && row.avatar_url ? row.avatar_url : "",
      language: row && row.language ? row.language : "en",
      country: row && row.country ? row.country : "RW",
      city: row && row.city ? row.city : "Kigali",
      onboarding_completed: !!(row && row.onboarding_completed),
      created_at: row && row.created_at,
      updated_at: row && row.updated_at,
    };
  }

  function profilePayload(user, patch) {
    var meta = user && user.user_metadata ? user.user_metadata : {};
    return Object.assign({
      id: user && user.id,
      display_name: meta.display_name || meta.name || "",
      phone: user && user.phone ? user.phone : "",
      email: user && user.email ? user.email : "",
      language: "en",
      country: "RW",
      city: "Kigali",
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    }, patch || {});
  }

  function requireClient() {
    if (!state.client) throw new Error(state.error || "Supabase is not configured yet.");
    return state.client;
  }

  async function init() {
    if (state.ready) return state;
    try {
      var res = await fetch("/api/everyday-config", { cache: "no-store" });
      var cfg = res.ok ? await res.json() : {};
      var url = cfg.supabaseUrl || PROJECT_URL;
      var anonKey = cfg.supabaseAnonKey || "";
      state.config = { supabaseUrl: url, supabaseAnonKey: anonKey ? "present" : "" };
      if (!anonKey) {
        state.ready = true;
        state.configured = false;
        return state;
      }
      if (!window.supabase || !window.supabase.createClient) {
        throw new Error("Supabase browser client did not load.");
      }
      state.client = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      state.ready = true;
      state.configured = true;
      return state;
    } catch (err) {
      state.ready = true;
      state.configured = false;
      state.error = err && err.message ? err.message : "Could not initialize Supabase.";
      return state;
    }
  }

  async function getSession() {
    await init();
    if (!state.client) return { session: null, user: null, configured: false };
    var result = await state.client.auth.getSession();
    if (result.error) throw result.error;
    var session = result.data && result.data.session;
    return { session: session || null, user: session && session.user ? session.user : null, configured: true };
  }

  async function signIn(email, password) {
    var client = requireClient();
    var result = await client.auth.signInWithPassword({ email: email, password: password });
    if (result.error) throw result.error;
    return result.data;
  }

  async function signUp(email, password, displayName) {
    var client = requireClient();
    var result = await client.auth.signUp({
      email: email,
      password: password,
      options: { data: { display_name: displayName || "" } },
    });
    if (result.error) throw result.error;
    if (result.data && result.data.user && result.data.session) {
      await upsertProfile(profilePayload(result.data.user, {
        display_name: displayName || "",
        onboarding_completed: false,
      }));
    }
    return result.data;
  }

  async function signInWithGoogle(redirectTo) {
    var client = requireClient();
    var result = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo || window.location.href,
      },
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async function signInAnonymously() {
    var client = requireClient();
    var result = await client.auth.signInAnonymously();
    if (result.error) throw result.error;
    return result.data;
  }

  async function sendEmailOtp(email, shouldCreateUser) {
    var client = requireClient();
    var result = await client.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: shouldCreateUser !== false,
        emailRedirectTo: window.location.href,
      },
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async function sendPhoneOtp(phone, shouldCreateUser) {
    var client = requireClient();
    var result = await client.auth.signInWithOtp({
      phone: phone,
      options: {
        shouldCreateUser: shouldCreateUser !== false,
      },
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async function verifyEmailOtp(email, token) {
    var client = requireClient();
    var result = await client.auth.verifyOtp({
      email: email,
      token: token,
      type: "email",
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async function verifyPhoneOtp(phone, token) {
    var client = requireClient();
    var result = await client.auth.verifyOtp({
      phone: phone,
      token: token,
      type: "sms",
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async function signOut() {
    var client = requireClient();
    var result = await client.auth.signOut();
    if (result.error) throw result.error;
  }

  function onAuthStateChange(cb) {
    if (!state.client) return function () {};
    var result = state.client.auth.onAuthStateChange(function (_event, session) {
      cb(session || null);
    });
    return function () {
      try { result.data.subscription.unsubscribe(); } catch (e) {}
    };
  }

  async function getProfile() {
    var client = requireClient();
    var sessionResult = await client.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    var session = sessionResult.data && sessionResult.data.session;
    var user = session && session.user;
    if (!user) return null;
    var result = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) {
      var created = await upsertProfile(profilePayload(user));
      return created;
    }
    return normalizeProfile(result.data, user);
  }

  async function upsertProfile(patch) {
    var client = requireClient();
    var sessionResult = await client.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    var session = sessionResult.data && sessionResult.data.session;
    var user = session && session.user;
    if (!user) throw new Error("Sign in before updating your profile.");
    var payload = profilePayload(user, patch);
    var result = await client.from("profiles").upsert(payload, { onConflict: "id" }).select("*").single();
    if (result.error) throw result.error;
    return normalizeProfile(result.data, user);
  }

  async function updateProfile(patch) {
    return upsertProfile(Object.assign({}, patch || {}, { updated_at: new Date().toISOString() }));
  }

  function normalizeFolder(row) {
    return {
      id: row.id,
      name: row.name || "Untitled",
      icon: row.icon || "folder",
    };
  }

  function normalizeFile(row) {
    return {
      id: row.id,
      folderId: row.folder_id,
      title: row.title || "",
      body: row.body || "",
      updated: row.updated || 0,
      attachments: Array.isArray(row.attachments) ? row.attachments : [],
      voice: Array.isArray(row.voice) ? row.voice : [],
      trashed: !!row.trashed,
      mode: row.mode || "personal",
      metadata: row.metadata || {},
      versions: Array.isArray(row.versions) ? row.versions : [],
      aiHistory: Array.isArray(row.ai_history) ? row.ai_history : [],
      privacy: row.privacy || { level: "private", bount_access: true },
      links: Array.isArray(row.links) ? row.links : [],
    };
  }

  async function currentUser() {
    var client = requireClient();
    var sessionResult = await client.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    var session = sessionResult.data && sessionResult.data.session;
    var user = session && session.user;
    if (!user) throw new Error("Sign in before syncing Everyday data.");
    return user;
  }

  async function seedPlan(user) {
    var client = requireClient();
    var now = Date.now();
    var folders = [
      { id: "personal", user_id: user.id, name: "Personal", icon: "user" },
      { id: "work", user_id: user.id, name: "Work", icon: "work" },
      { id: "finance", user_id: user.id, name: "Finance", icon: "wallet" },
      { id: "ideas", user_id: user.id, name: "Ideas", icon: "bulb" },
    ];
    var files = [
      { id: "pf1", user_id: user.id, folder_id: "finance", title: "Savings goal - RWF 1.5M by December", body: "Put aside RWF 120,000 each month. Keep the emergency fund untouched. This covers school fees and a laptop.", updated: now - 9000000, attachments: [], voice: [], trashed: false },
      { id: "pf2", user_id: user.id, folder_id: "work", title: "Q3 priorities", body: "Ship the retail report. Weekly founder calls. Prep the markets brief. Meeting Tuesday 9am at Kigali Heights.", updated: now - 5200000, attachments: [], voice: [], trashed: false },
      { id: "pf3", user_id: user.id, folder_id: "personal", title: "This weekend", body: "Groceries at Kimironko market. Visit family in Nyamirambo. Try that podcast about building a loyal audience.", updated: now - 3000000, attachments: [], voice: [], trashed: false },
      { id: "pf4", user_id: user.id, folder_id: "ideas", title: "App ideas", body: "A calm place to keep everything in one spot. Voice notes that turn into searchable text. Let the app suggest a ride before a meeting.", updated: now - 1000000, attachments: [], voice: [], trashed: false },
    ];
    var folderResult = await client.from("plan_folders").upsert(folders, { onConflict: "user_id,id" });
    if (folderResult.error) throw folderResult.error;
    var fileResult = await client.from("plan_files").upsert(files, { onConflict: "user_id,id" });
    if (fileResult.error) throw fileResult.error;
    return { folders: folders.map(normalizeFolder), files: files.map(normalizeFile) };
  }

  async function getPlan() {
    var client = requireClient();
    var user = await currentUser();
    var folderResult = await client.from("plan_folders").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
    if (folderResult.error) throw folderResult.error;
    if (!folderResult.data || !folderResult.data.length) return seedPlan(user);
    var fileResult = await client.from("plan_files").select("*").eq("user_id", user.id).order("updated", { ascending: false });
    if (fileResult.error) throw fileResult.error;
    return {
      folders: folderResult.data.map(normalizeFolder),
      files: (fileResult.data || []).map(normalizeFile),
    };
  }

  async function savePlan(folders, files) {
    var client = requireClient();
    var user = await currentUser();
    var folderRows = (folders || []).map(function (folder) {
      return {
        id: folder.id,
        user_id: user.id,
        name: folder.name || "Untitled",
        icon: folder.icon || "folder",
      };
    });
    var fileRows = (files || []).map(function (file) {
      return {
        id: file.id,
        user_id: user.id,
        folder_id: file.folderId || (folderRows[0] && folderRows[0].id) || "personal",
        title: file.title || "",
        body: file.body || "",
        attachments: Array.isArray(file.attachments) ? file.attachments : [],
        voice: Array.isArray(file.voice) ? file.voice : [],
        trashed: !!file.trashed,
        updated: file.updated || Date.now(),
        mode: file.mode || "personal",
        metadata: file.metadata || {},
        versions: Array.isArray(file.versions) ? file.versions : [],
        ai_history: Array.isArray(file.aiHistory) ? file.aiHistory : [],
        privacy: file.privacy || { level: "private", bount_access: true },
        links: Array.isArray(file.links) ? file.links : [],
      };
    });
    var deleteFiles = await client.from("plan_files").delete().eq("user_id", user.id);
    if (deleteFiles.error) throw deleteFiles.error;
    var deleteFolders = await client.from("plan_folders").delete().eq("user_id", user.id);
    if (deleteFolders.error) throw deleteFolders.error;
    if (folderRows.length) {
      var folderResult = await client.from("plan_folders").insert(folderRows);
      if (folderResult.error) throw folderResult.error;
    }
    if (fileRows.length) {
      var fileResult = await client.from("plan_files").insert(fileRows);
      if (fileResult.error) throw fileResult.error;
    }
    return { ok: true };
  }

  async function bearerHeaders() {
    var headers = { "Content-Type": "application/json" };
    if (!state.client) return headers;
    try {
      var sessionResult = await state.client.auth.getSession();
      var token = sessionResult && sessionResult.data && sessionResult.data.session && sessionResult.data.session.access_token;
      if (token) headers["Authorization"] = "Bearer " + token;
    } catch (e) {}
    return headers;
  }

  async function callService(path, options) {
    options = options || {};
    var init = { method: options.method || "GET", cache: "no-store" };
    var headers = await bearerHeaders();
    if (options.body !== undefined) init.body = JSON.stringify(options.body);
    init.headers = Object.assign(headers, options.headers || {});
    var res = await fetch(path, init);
    var payload = null;
    try { payload = await res.json(); } catch (e) {}
    if (!res.ok) {
      var msg = (payload && payload.error) || ("Request to " + path + " failed (" + res.status + ")");
      throw new Error(msg);
    }
    return payload;
  }

  // Commute service — /api/commute
  async function listCommute() {
    return callService("/api/commute");
  }
  // Request a ride — persists a per-user commute request and returns the saved
  // row. `payload` carries the chosen ride (driver_name, vehicle, mode, eta_min,
  // price_rwf), the trip (origin, destination) and pay_mode.
  async function requestRide(payload) {
    return callService("/api/commute", { method: "POST", body: payload || {} });
  }

  // Listen service — /api/listen
  async function listListen() {
    return callService("/api/listen");
  }

  // Save service — /api/save
  async function getSave() {
    return callService("/api/save");
  }
  async function deposit(amountRwf, title, goalId) {
    var body = { amount_rwf: amountRwf, title: title || "" };
    if (goalId) body.goal_id = goalId;
    return callService("/api/save", { method: "POST", body: body });
  }
  async function withdraw(amountRwf, title) {
    return callService("/api/save", { method: "POST", body: { action: "withdraw", amount_rwf: amountRwf, title: title || "" } });
  }
  async function createGoal(label, targetRwf, deadline) {
    return callService("/api/save", { method: "POST", body: { action: "create_goal", label: label, target_rwf: targetRwf, deadline: deadline || "" } });
  }
  async function updateGoal(goalId, patch) {
    return callService("/api/save", { method: "POST", body: Object.assign({ action: "update_goal", goal_id: goalId }, patch || {}) });
  }
  async function deleteGoal(goalId) {
    return callService("/api/save", { method: "POST", body: { action: "delete_goal", goal_id: goalId } });
  }
  async function cancelSchedule(scheduleId) {
    return callService("/api/save", { method: "POST", body: { action: "cancel_schedule", schedule_id: scheduleId } });
  }
  async function createSchedule(amountRwf, cadence, goalId) {
    var body = { action: "create_schedule", amount_rwf: amountRwf, cadence: cadence };
    if (goalId) body.goal_id = goalId;
    return callService("/api/save", { method: "POST", body: body });
  }
  async function confirmProposal(proposalId) {
    return callService("/api/save", { method: "POST", body: { action: "confirm_proposal", proposal_id: proposalId } });
  }
  async function rejectProposal(proposalId) {
    return callService("/api/save", { method: "POST", body: { action: "reject_proposal", proposal_id: proposalId } });
  }

  // Plan service — /api/plan (replaces direct supabase plan calls)
  // After hydrate, re-sign every stored attachment/voice path so callers
  // never see an expired URL. Skips quietly when storage isn't configured
  // (e.g. demo mode) so the data still arrives.
  async function planList() {
    var data = await callService("/api/plan");
    try {
      if (state.client && data && Array.isArray(data.files)) {
        await Promise.all(data.files.map(refreshFileUrls));
      }
    } catch (e) { /* signing is best-effort */ }
    return data;
  }

  async function refreshFileUrls(file) {
    if (!file) return;
    var paths = [];
    var collect = (arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach((x) => { if (x && x.path) paths.push({ row: x, path: x.path }); });
    };
    collect(file.attachments);
    collect(file.voice);
    if (!paths.length) return;
    await Promise.all(paths.map(async ({ row, path }) => {
      try {
        var url = await signPlanAttachment(path, 60 * 60 * 24 * 7);
        if (url) row.url = url;
      } catch (e) { /* stale rows just lose their URL until next session */ }
    }));
  }
  async function planSave(folders, files) {
    return callService("/api/plan", { method: "POST", body: { folders: folders || [], files: files || [] } });
  }

  // Shop service — /api/shop
  async function listShop() {
    return callService("/api/shop");
  }
  async function placeOrder(productId, quantity) {
    return callService("/api/shop", { method: "POST", body: { product_id: productId, quantity: quantity || 1 } });
  }

  // UCP commerce — /api/ucp (Universal Commerce Protocol: checkout + order).
  // Shop now checks out through UCP; Everyday is Merchant of Record and settles
  // the total against the wallet. line_items: [{ product_id, quantity }].
  async function ucpDiscovery() {
    return callService("/.well-known/ucp");
  }
  async function ucpCreateCheckout(lineItems, fulfillment) {
    return callService("/api/ucp/checkout-sessions", {
      method: "POST",
      body: { checkout: { line_items: lineItems || [], fulfillment: fulfillment || { type: "delivery" } } },
    });
  }
  async function ucpGetCheckout(id) {
    return callService("/api/ucp/checkout-sessions/" + encodeURIComponent(id));
  }
  async function ucpUpdateCheckout(id, patch) {
    return callService("/api/ucp/checkout-sessions/" + encodeURIComponent(id), { method: "PATCH", body: patch || {} });
  }
  async function ucpCompleteCheckout(id) {
    return callService("/api/ucp/checkout-sessions/" + encodeURIComponent(id) + "/complete", { method: "POST", body: {} });
  }
  async function ucpGetOrder(id) {
    return callService("/api/ucp/orders/" + encodeURIComponent(id));
  }
  // One-shot purchase: create a session then complete it. Returns the completed
  // session including the created order.
  async function ucpCheckout(lineItems, fulfillment) {
    var created = await ucpCreateCheckout(lineItems, fulfillment);
    var session = created && created.session ? created.session : created;
    if (!session || !session.id) throw new Error("Could not start checkout");
    return ucpCompleteCheckout(session.id);
  }

  // Pay service — /api/pay
  async function getPay() {
    return callService("/api/pay");
  }
  async function sendPayment(amountRwf, recipient, note) {
    return callService("/api/pay", { method: "POST", body: { amount_rwf: amountRwf, recipient: recipient, note: note || "" } });
  }

  // Activity service — /api/activity (this user's real money + section activity)
  async function getActivity() {
    return callService("/api/activity");
  }

  // Bounty orchestrator — /api/bounty
  async function bountyAsk(ask) {
    return callService("/api/bounty", { method: "POST", body: { ask: ask || "" } });
  }

  // ── Storage: Plan attachments + voice notes ──
  // Bucket: plan_attachments (private). Path: <user_id>/<file_id>/<name>.
  // RLS scopes uploads/reads/deletes to the owner via storage.foldername()[1].
  // Reads use signed URLs so a private bucket can still render in <img>/<audio>.
  var PLAN_BUCKET = "plan_attachments";

  function sanitizeName(name) {
    return String(name || "attachment").replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 80);
  }

  async function uploadPlanAttachment(file, fileId) {
    var client = requireClient();
    var user = await currentUser();
    var safeName = Date.now() + "_" + sanitizeName(file && file.name);
    var key = user.id + "/" + (fileId || "unfiled") + "/" + safeName;
    var contentType = (file && file.type) || "application/octet-stream";
    var upload = await client.storage.from(PLAN_BUCKET).upload(key, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: contentType,
    });
    if (upload.error) throw upload.error;
    var signed = await client.storage.from(PLAN_BUCKET).createSignedUrl(key, 60 * 60 * 24 * 7);
    return {
      path: key,
      url: signed.data && signed.data.signedUrl ? signed.data.signedUrl : null,
      name: (file && file.name) || safeName,
      size: (file && file.size) || 0,
      contentType: contentType,
      uploadedAt: new Date().toISOString(),
    };
  }

  async function signPlanAttachment(path, expiresInSec) {
    var client = requireClient();
    var ttl = Math.max(60, Math.min(60 * 60 * 24 * 7, expiresInSec || 3600));
    var signed = await client.storage.from(PLAN_BUCKET).createSignedUrl(path, ttl);
    if (signed.error) throw signed.error;
    return signed.data && signed.data.signedUrl;
  }

  async function deletePlanAttachment(path) {
    var client = requireClient();
    var result = await client.storage.from(PLAN_BUCKET).remove([path]);
    if (result.error) throw result.error;
    return { ok: true };
  }

  window.EverydayAPI = {
    init: init,
    state: state,
    auth: {
      getSession: getSession,
      headers: bearerHeaders,
      signIn: signIn,
      signUp: signUp,
      signInWithGoogle: signInWithGoogle,
      signInAnonymously: signInAnonymously,
      sendEmailOtp: sendEmailOtp,
      sendPhoneOtp: sendPhoneOtp,
      verifyEmailOtp: verifyEmailOtp,
      verifyPhoneOtp: verifyPhoneOtp,
      signOut: signOut,
      onAuthStateChange: onAuthStateChange,
    },
    profile: {
      get: getProfile,
      upsert: upsertProfile,
      update: updateProfile,
      normalize: normalizeProfile,
    },
    plan: {
      // Legacy direct-Supabase path (kept for fallback); prefer planService.
      getAll: getPlan,
      saveAll: savePlan,
    },
    planService: {
      list: planList,
      save: planSave,
    },
    save: {
      get: getSave,
      deposit: deposit,
      withdraw: withdraw,
      createGoal: createGoal,
      updateGoal: updateGoal,
      deleteGoal: deleteGoal,
      createSchedule: createSchedule,
      cancelSchedule: cancelSchedule,
      confirmProposal: confirmProposal,
      rejectProposal: rejectProposal,
    },
    shop: {
      list: listShop,
      order: placeOrder, // legacy single-product order (kept for fallback)
      checkout: ucpCheckout, // UCP one-shot checkout
    },
    x402: {
      // x402 payment protocol (Everyday Wallet rail). Settlement also happens
      // automatically inside UCP checkout completion; these are for direct use.
      discovery: function () { return callService("/.well-known/x402"); },
      verify: function (requirements, payment) {
        return callService("/api/x402/verify", { method: "POST", body: { requirements: requirements, payment: payment } });
      },
      settle: function (requirements, section, title) {
        return callService("/api/x402/settle", { method: "POST", body: { requirements: requirements, section: section, title: title } });
      },
    },
    ucp: {
      discovery: ucpDiscovery,
      createCheckout: ucpCreateCheckout,
      getCheckout: ucpGetCheckout,
      updateCheckout: ucpUpdateCheckout,
      completeCheckout: ucpCompleteCheckout,
      checkout: ucpCheckout,
      getOrder: ucpGetOrder,
    },
    pay: {
      get: getPay,
      send: sendPayment,
    },
    commute: {
      list: listCommute,
      request: requestRide,
    },
    listen: {
      list: listListen,
    },
    activity: {
      get: getActivity,
    },
    bounty: {
      ask: bountyAsk,
    },
    storage: {
      uploadPlanAttachment: uploadPlanAttachment,
      signPlanAttachment: signPlanAttachment,
      deletePlanAttachment: deletePlanAttachment,
    },
  };
})();
