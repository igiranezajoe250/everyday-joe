// app.jsx — root app for Ingoga Invest

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentKey": "teal",
  "typeKey": "manrope",
  "showTabBar": true
}/*EDITMODE-END*/;

function LeftRailButton({ label, active, onClick, badge, children }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} style={{
      position: 'relative',
      width: 40,
      height: 40,
      borderRadius: 999,
      border: 0,
      background: active ? ink : 'transparent',
      color: active ? paper : ink55,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 180ms ease, color 180ms ease, transform 180ms ease',
      padding: 0,
    }}>
      {children}
      {badge ? (
        <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 14, height: 14, padding: '0 4px', borderRadius: 999, background: '#C8102E', color: '#fff', fontFamily: CC_MONO, fontSize: 8.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${canvas}` }}>{badge}</span>
      ) : null}
    </button>
  );
}

function EverydayLeftRail({ active, onHome, onMarketplace, onWallet, onPlan, onBounty, onInbox, unread = 0, onProfile, initials = 'JK', showOperator = false, isOperator = false, onOperator }) {
  const stroke = 'currentColor';
  const iconProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const railWidth = PK_WEB ? 58 : 52;
  const items = [
    { id: 'hub', label: 'Home', onClick: onHome, icon: (<svg {...iconProps}><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/></svg>) },
    { id: 'shop', label: 'Marketplace', onClick: onMarketplace, icon: (<svg {...iconProps}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>) },
    { id: 'wallet', label: 'Wallet', onClick: onWallet, icon: (<svg {...iconProps}><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18"/><circle cx="16.5" cy="14.5" r="1.05" fill="currentColor" stroke="none"/></svg>) },
    { id: 'plan', label: 'Plan', onClick: onPlan, icon: (<svg {...iconProps}><rect x="4" y="4" width="16" height="17" rx="2"/><path d="M4 9h16M8 2v4M16 2v4M8 14h5M8 18h3"/></svg>) },
  ];
  return (
    <nav aria-label="Ingoga Invest shortcuts" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: railWidth,
      zIndex: 44,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: PK_WEB ? '16px 0 18px' : '10px 0 max(12px, env(safe-area-inset-bottom, 12px))',
      borderRight: `1px dashed ${DASH}`,
      background: 'rgba(250,246,241,0.78)',
      backdropFilter: 'blur(12px)',
    }}>
      <button onClick={onHome} aria-label="Ingoga Invest home" title="Ingoga Invest" style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        border: 0,
        background: 'transparent',
        color: ink,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5 18.5 7v7L12 20.5 5.5 14V7z"/><path d="M12 3.5v17M5.5 7 12 10.5 18.5 7M5.5 14 12 10.5 18.5 14"/></svg>
      </button>
      <div style={{ display: 'grid', gap: 8, marginTop: PK_WEB ? 24 : 18 }}>
        {items.map((item) => (
          <LeftRailButton key={item.id} label={item.label} active={active === item.id || (active === 'capital' && item.id === 'wallet')} onClick={item.onClick}>
            {item.icon}
          </LeftRailButton>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'grid', gap: 8 }}>
        <LeftRailButton label="Ask Bounty" active={false} onClick={onBounty}>
          <svg {...iconProps}><path d="M12 3a7.5 7.5 0 0 1 7.5 7.5c0 4.6-4.3 7.5-7.5 10.5-3.2-3-7.5-5.9-7.5-10.5A7.5 7.5 0 0 1 12 3z"/><path d="M9 10h6M9.5 13h5"/></svg>
        </LeftRailButton>
        <LeftRailButton label="Notifications" active={false} onClick={onInbox} badge={unread}>
          <svg {...iconProps}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        </LeftRailButton>
        {showOperator && (
          <LeftRailButton label={isOperator ? 'Switch to client mode' : 'Switch to operator mode'} active={isOperator} onClick={onOperator}>
            <svg {...iconProps}><path d="M3 7h18M3 12h18M3 17h12"/></svg>
          </LeftRailButton>
        )}
        <button onClick={onProfile} aria-label="Profile" title="Profile" style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          border: `1px solid ${ink25}`,
          background: 'transparent',
          color: ink70,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: CC_MONO,
          fontSize: 11,
          fontWeight: 800,
          padding: 0,
        }}>{initials}</button>
      </div>
    </nav>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const accent = (CC_PALETTES[t.accentKey] || CC_PALETTES.teal).accent;
  const fontStack = CC_TYPES[t.typeKey] || CC_TYPES.manrope;

  // route: 'hub' | 'shop' | 'capital' | 'pay' | 'plan' | 'listen' | 'commute' | ...
  const TRANSIENT = ['money'];
  const MAIN_TABS = ['shop', 'wallet', 'plan'];
  const ALLOWED_ROUTES = ['hub', 'shop', 'capital', 'pay', 'plan', 'listen', 'commute', 'credit', 'growth', 'money', 'wallet', 'settings', 'activity'];
  const [route, setRoute] = React.useState(() => {
    return 'hub';
  });
  const [tab, setTab] = usePersisted('tab', 'hub');
  const [ventureId, setVentureId] = usePersisted('ventureId', null);
  // Reset a stale persisted tab on load.
  React.useEffect(() => { if (!['hub', ...MAIN_TABS].includes(tab)) setTab('hub'); }, []);
  // Persist non-transient routes so a cold start returns the user where they were.
  React.useEffect(() => {
    if (!TRANSIENT.includes(route)) PKStore.set('route', route);
  }, [route]);

  // First-run onboarding — shown once, before the lock gate.
  const [onboarded, setOnboarded] = React.useState(() => PKStore.get('onboarded', false));
  const finishOnboarding = () => { PKStore.set('onboarded', true); setOnboarded(true); };

  const [authReady, setAuthReady] = React.useState(false);
  const [authConfigured, setAuthConfigured] = React.useState(false);
  const [session, setSession] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [authError, setAuthError] = React.useState('');
  const [demoAuth, setDemoAuth] = React.useState(() => PKStore.get('demo_auth', false));
  const demoProfile = {
    id: 'demo-user',
    display_name: 'Joseph Karangwa',
    email: 'demo@everyday.local',
    phone: '',
    language: PKStore.get('profile_language', 'en'),
    country: 'RW',
    city: 'Kigali',
    onboarding_completed: true,
  };
  const activeProfile = demoAuth ? demoProfile : profile;

  const refreshAuth = React.useCallback(async () => {
    if (!window.EverydayAPI) {
      setAuthReady(true);
      setAuthConfigured(false);
      return;
    }
    setAuthError('');
    const apiState = await window.EverydayAPI.init();
    setAuthConfigured(!!apiState.configured);
    if (!apiState.configured) {
      setAuthReady(true);
      return;
    }
    try {
      const current = await window.EverydayAPI.auth.getSession();
      setSession(current.session);
      if (current.session) {
        const nextProfile = await window.EverydayAPI.profile.get();
        setProfile(nextProfile);
        if (nextProfile && nextProfile.language) PKStore.set('profile_language', nextProfile.language);
        // Hydrate the microservice cache for the real user. Public slices
        // (shop/listen/commute) always load; private slices (save/pay/plan)
        // load with the session JWT so RLS scopes them to this user.
        if (window.EverydayStore) {
          const userId = (current.session.user && current.session.user.id) || null;
          window.EverydayStore.hydrateAll({ userId }).catch(() => {});
        }
      } else {
        setProfile(null);
        if (window.EverydayStore) {
          // Anonymous: hydrate just the public slices so the catalog still loads.
          window.EverydayStore.hydrateAll({ userId: null }).catch(() => {});
        }
      }
    } catch (err) {
      setAuthError(err && err.message ? err.message : 'Could not load your account.');
    } finally {
      setAuthReady(true);
    }
  }, []);

  React.useEffect(() => {
    let off = null;
    refreshAuth().then(() => {
      if (window.EverydayAPI && window.EverydayAPI.state && window.EverydayAPI.state.configured) {
        off = window.EverydayAPI.auth.onAuthStateChange((nextSession) => {
          setSession(nextSession);
          if (!nextSession) {
            if (!PKStore.get('demo_auth', false)) {
              setProfile(null);
            }
          } else {
            refreshAuth();
          }
        });
      }
    });
    return () => { if (off) off(); };
  }, [refreshAuth]);

  const handleSignOut = async () => {
    PKStore.del('demo_auth');
    setDemoAuth(false);
    if (authConfigured && window.EverydayAPI) {
      try { await window.EverydayAPI.auth.signOut(); } catch (e) {}
      setSession(null);
      setProfile(null);
    }
    if (window.EverydayStore) window.EverydayStore.reset();
    setTab('hub'); setRoute('hub');
  };
  const handleDemoSignIn = async () => {
    if (authConfigured && window.EverydayAPI) {
      try {
        const data = await window.EverydayAPI.auth.signInAnonymously();
        const nextProfile = await window.EverydayAPI.profile.update({
          display_name: 'Joseph Karangwa',
          language: PKStore.get('profile_language', 'en'),
          country: 'RW',
          city: 'Kigali',
          onboarding_completed: true,
        });
        PKStore.del('demo_auth');
        setDemoAuth(false);
        setSession(data && data.session ? data.session : null);
        setProfile(nextProfile);
        PKStore.set('onboarded', true);
        setOnboarded(true);
        setTab('hub');
        setRoute('hub');
        return;
      } catch (e) {
        // If anonymous auth is not enabled yet, keep the local demo path usable.
      }
    }
    PKStore.set('demo_auth', true);
    PKStore.set('onboarded', true);
    setDemoAuth(true);
    setOnboarded(true);
    setTab('hub');
    setRoute('hub');
  };
  // Register the service worker for offline — only in the installed/native
  // runtime. In the editable preview we skip it so design edits are never
  // masked by a stale cache.
  React.useEffect(() => {
    if (PK_NATIVE && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    } else if ('serviceWorker' in navigator) {
      // Preview: ensure no old worker keeps serving stale assets.
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
      if (window.caches) caches.keys().then((ks) => ks.forEach((k) => (k.startsWith('poke' + 'tee') || k.startsWith('everyday')) && caches.delete(k))).catch(() => {});
    }
  }, []);
  const [moneyMode, setMoneyMode] = React.useState('add');
  // Where a money flow returns to when closed (capital home vs credit tab).
  const [moneyReturn, setMoneyReturn] = React.useState('capital');
  const [opsIndex, setOpsIndex] = React.useState(0);
  // How the in-flight investment is allocated: 'fund' (diversified pool),
  // 'expert' (in-house expert deliberates), or 'company' (direct earmark).
  const [allocationMode, setAllocationMode] = React.useState('fund');
  // Where checkout was launched from, so closing it returns there.
  const [checkoutOrigin, setCheckoutOrigin] = React.useState('venture');

  const goTab = (id) => { pkHaptic('select'); setTab(id); setRoute(id); };

  const openVenture = (id) => {
    setVentureId(id);
    setTab('venture');
    setRoute('detail');
  };
  const openCompany = (companyId) => {
    setVentureId(companyId);
    setRoute('detail');
  };
  const openOpsDetail = (idx) => {
    setOpsIndex(idx);
    setRoute('ops-detail');
  };

  const beginCheckout = () => setRoute('checkout');
  // Launch checkout with an explicit target + allocation mode + origin.
  const beginInvest = (targetId, mode = 'fund', origin = 'venture') => {
    setVentureId(targetId);
    setAllocationMode(mode);
    setCheckoutOrigin(origin);
    setTab('venture');
    setRoute('checkout');
  };
  // Invest button on the detail page: funds default to 'fund', companies to 'company'.
  const beginCheckoutFromDetail = () => {
    const v = ccLookup(ventureId);
    beginInvest(ventureId, v && v.type === 'company' ? 'company' : 'fund', 'detail');
  };
  const finishCheckout = () => { setTab('hub'); setRoute('hub'); };
  // If viewing a company detail, back goes to its parent fund.
  // Otherwise back to the venture list.
  const backFromDetail = () => {
    const v = ccLookup(ventureId);
    if (v && v.type !== 'fund' && v.parent) {
      setVentureId(v.parent);
      setRoute('detail');
    } else {
      setTab('venture');
      setRoute('venture');
    }
  };
  const backFromOpsDetail = () => setRoute('detail');

  const openMoney = (mode) => {
    setMoneyMode(mode);
    setMoneyReturn(route === 'credit' ? 'credit' : route === 'wallet' ? 'wallet' : 'capital');
    setRoute('money');
  };
  const closeMoney = () => {
    const r = moneyReturn === 'credit' ? 'credit' : moneyReturn === 'wallet' ? 'wallet' : 'capital';
    setTab(r); setRoute(r);
  };

  const openCredit = () => { setTab('credit'); setRoute('credit'); };
  const openGrowth = () => { setRoute('growth'); };
  const backFromGrowth = () => { const r = tab === 'credit' ? 'credit' : 'capital'; setRoute(r); };

  const openWallet   = () => { setTab('wallet'); setRoute('wallet'); };
  const openSettings = () => { setTab('capital'); setRoute('settings'); };
  const openActivity = () => { setTab('capital'); setRoute('activity'); };
  const backToCapital = () => { setTab('capital'); setRoute('capital'); };
  const backToHub = () => { setTab('hub'); setRoute('hub'); };
  const openModeFromHub = (id) => { pkHaptic('select'); setTab(id); setRoute(id); };
  const openSaveFromHub = () => { pkHaptic('select'); setTab('capital'); setRoute('capital'); };
  const openCreditFromHub = () => { pkHaptic('select'); setTab('credit'); setRoute('credit'); };

  // Home "Ask anything" bar captures into Plan (the brain). A one-shot intent is
  // handed to the Plan screen, which acts on it once and clears it.
  const [planIntent, setPlanIntent] = React.useState(null);
  const captureToPlan = (intent) => { setPlanIntent(intent || { mode: 'write' }); setTab('plan'); setRoute('plan'); };
  const openPlanNote = (id) => { setPlanIntent({ mode: 'open', openId: id }); setTab('plan'); setRoute('plan'); };

  // Route a function id (from the + launcher) to its page. 'save' lives on the
  // 'capital' route; every other function id is its own route.
  const openFunctionById = (id) => {
    pkHaptic('select');
    if (id === 'wallet') { openWallet(); return; }
    const r = id === 'save' ? 'capital' : id;
    setTab(r); setRoute(r);
  };
  // Global header actions (notifications · wallet · profile) appear on the
  // primary browsing surfaces (hub + the six functions) where quick access is
  // useful. Secondary destinations — wallet, profile/settings, activity, credit,
  // growth, detail/checkout, money — have their own back-header chrome and are
  // reached *from* this cluster, so showing it there would be redundant and
  // would collide with their own headers.
  const [inboxOpen, setInboxOpen] = React.useState(false);
  const [bountyOpen, setBountyOpen] = React.useState(false);
  const [isOperator, setIsOperator] = usePersisted('cc_is_operator', false);

  // Inbox unread — for a signed-in user this counts real activity newer than the
  // last time they opened the inbox (an honest "unread" without a read-model).
  // The local/anon preview keeps the demo badge so the seed inbox still reads.
  const everyday = window.useEveryday ? window.useEveryday() : null;
  const hasRealUser = !!(everyday && everyday.userId);
  const [inboxSeen, setInboxSeen] = usePersisted('inbox_seen_at', 0);
  const [inboxSnap, setInboxSnap] = React.useState(0);
  const headerUnread = hasRealUser
    ? ((window.everydayUnreadCount && window.everydayUnreadCount(everyday, inboxSeen)) || 0)
    : 2;
  const openInbox = () => { pkHaptic('select'); setInboxSnap(inboxSeen); setInboxOpen(true); setInboxSeen(Date.now()); };
  // ── Global audio player ──
  // Lifted here so playback (and the mini player) persist while the user moves
  // through the rest of the app. `pl` is the current episode; the timer keeps
  // the simulated audio advancing regardless of which screen is mounted, and
  // the last position is persisted so listening resumes on a later visit.
  const [pl, setPl] = React.useState(() => {
    const saved = PKStore.get('listen_now', null);
    return saved ? { ...saved, playing: false } : null;
  });
  const [playerOpen, setPlayerOpen] = React.useState(false);
  React.useEffect(() => {
    if (!pl || !pl.playing) return;
    const id = setInterval(() => {
      setPl((p) => {
        if (!p || !p.playing) return p;
        const np = p.progress + (p.speed || 1) / p.dur;
        if (np >= 1) return { ...p, progress: 1, playing: false };
        return { ...p, progress: np };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pl && pl.playing, pl && pl.speed, pl && pl.ch, pl && pl.ep, pl && pl.dur]);
  React.useEffect(() => {
    try { if (pl) PKStore.set('listen_now', { ...pl, playing: false }); } catch (e) {}
  }, [pl && pl.ch, pl && pl.ep, pl && pl.progress]);
  const player = {
    state: pl,
    isOpen: playerOpen,
    load: (chId, epIdx) => { const it = ccBuildItem(chId, epIdx); if (!it) return; pkHaptic('select'); setPl((prev) => ({ ...it, progress: 0, playing: true, speed: (prev && prev.speed) || 1 })); setPlayerOpen(true); },
    toggle: () => { pkHaptic('select'); setPl((p) => (p ? { ...p, playing: !p.playing } : p)); },
    seek: (f) => setPl((p) => (p ? { ...p, progress: Math.max(0, Math.min(1, f)) } : p)),
    skip: (sec) => setPl((p) => (p ? { ...p, progress: Math.max(0, Math.min(1, p.progress + sec / p.dur)) } : p)),
    setSpeed: (s) => setPl((p) => (p ? { ...p, speed: s } : p)),
    next: () => setPl((p) => { if (!p) return p; const it = ccBuildItem(p.ch, p.ep + 1); return it ? { ...it, progress: 0, playing: true, speed: p.speed } : { ...p, playing: false }; }),
    prev: () => setPl((p) => { if (!p) return p; if (p.progress > 0.05) return { ...p, progress: 0 }; const it = ccBuildItem(p.ch, p.ep - 1); return it ? { ...it, progress: 0, playing: true, speed: p.speed } : { ...p, progress: 0 }; }),
    open: () => { pkHaptic('select'); setPl((p) => (p ? { ...p, playing: true } : p)); setPlayerOpen(true); },
    minimize: () => setPlayerOpen(false),
    close: () => { setPlayerOpen(false); setPl(null); try { PKStore.set('listen_now', null); } catch (e) {} },
  };
  // Mini player shows whenever something is loaded and the full player is closed.
  const showMini = !!pl && !playerOpen && route !== 'money';

  const showTab = false;
  const openBountyRoute = (id) => {
    const target = id === 'moto' ? 'commute' : id === 'save' ? 'capital' : id;
    if (target === 'wallet') { openWallet(); return; }
    if (target === 'settings') { openSettings(); return; }
    if (target === 'activity') { openActivity(); return; }
    if (target === 'capital' || target === 'shop' || target === 'pay' || target === 'plan' || target === 'listen' || target === 'commute' || target === 'credit') {
      setTab(target);
      setRoute(target);
      return;
    }
    setTab('hub');
    setRoute('hub');
  };

  return (
    <React.Fragment>
    <AppShell native={PK_NATIVE} web={PK_WEB} fontStack={fontStack}>
        <div style={{
          height: '100%',
          display: 'flex', flexDirection: 'column',
          background: canvas,
          position: 'relative',
        }}>
          {!onboarded ? (
            <Onboarding native={PK_NATIVE} accent={ink} onDone={finishOnboarding} />
          ) : authConfigured && !authReady ? (
            <div className="pk-rise" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: canvas, color: ink55, fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading account</div>
          ) : authConfigured && !session && !demoAuth ? (
            <EverydayAuthGate accent={ink} onReady={refreshAuth} onDemo={handleDemoSignIn} />
          ) : authConfigured && session && !profile && !authError ? (
            <div className="pk-rise" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: canvas, color: ink55, fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading profile</div>
          ) : authConfigured && session && profile && !profile.onboarding_completed ? (
            <EverydayProfileSetup profile={profile} accent={ink} onDone={(next) => { setProfile(next); }} />
          ) : (
          <React.Fragment>
          <div style={{
            height: PK_NATIVE ? 'max(16px, env(safe-area-inset-top, 16px))' : 54,
            flexShrink: 0,
          }} />

          <div style={{
            flex: 1, overflow: 'auto', position: 'relative',
            scrollbarWidth: 'none',
            marginLeft: PK_WEB ? 58 : 52,
          }}>
            <style>{`.cc-scroll::-webkit-scrollbar { display: none; }`}</style>
            <div className="cc-scroll" style={{ height: '100%' }}>
              {route === 'hub' && (
                <EverydayHub
                  web={PK_WEB}
                  profile={activeProfile}
                  onShop={() => openModeFromHub('shop')}
                  onWallet={openWallet}
                  onSave={openSaveFromHub}
                  onPay={() => openModeFromHub('pay')}
                  onPlan={() => openModeFromHub('plan')}
                  onListen={() => openModeFromHub('listen')}
                  onCommute={() => openModeFromHub('commute')}
                  onCapture={captureToPlan}
                  onOpenBounty={() => { pkHaptic('select'); setBountyOpen(true); }}
                  onOpenNote={openPlanNote}
                />
              )}
              {route === 'shop' && (
                <EverydayFunctionScreen
                  mode="shop"
                  web={PK_WEB}
                  onBack={backToHub}
                  isOperator={isOperator}
                  onOperatorChange={setIsOperator}
                  onOpenRoute={openBountyRoute}
                />
              )}
              {route === 'capital' && (
                <CapitalScreen accent={accent} web={PK_WEB}
                  onMoney={openMoney}
                  onWallet={openWallet}
                  onProfile={openSettings}
                  onCredit={openCredit}
                  onGrowth={openGrowth}
                  onBack={backToHub} />
              )}
              {route === 'pay' && (
                <EverydayFunctionScreen
                  mode="pay"
                  web={PK_WEB}
                  onBack={backToHub}
                />
              )}
              {route === 'plan' && (
                <EverydayFunctionScreen
                  mode="plan"
                  web={PK_WEB}
                  onBack={backToHub}
                  bottomInset={showMini ? 66 : 0}
                  intent={planIntent}
                  onIntentHandled={() => setPlanIntent(null)}
                />
              )}
              {route === 'listen' && (
                <EverydayFunctionScreen
                  mode="listen"
                  web={PK_WEB}
                  onBack={backToHub}
                  player={player}
                />
              )}
              {route === 'commute' && (
                <EverydayFunctionScreen
                  mode="commute"
                  web={PK_WEB}
                  onBack={backToHub}
                />
              )}
              {route === 'credit' && (
                <CreditScreen accent={accent}
                  onMoney={openMoney}
                  onGrowth={openGrowth}
                  onBack={backToHub} />
              )}
              {route === 'growth' && (
                <GrowthScreen accent={accent}
                  onBack={backFromGrowth} />
              )}
              {route === 'money' && (
                <MoneyFlowScreen mode={moneyMode} accent={accent}
                  onClose={closeMoney}
                  onDone={closeMoney} />
              )}
              {route === 'wallet' && (
                <WalletScreen accent={accent}
                  onBack={backToHub}
                  onMoney={openMoney}
                  onPay={() => openModeFromHub('pay')}
                  onCredit={openCredit}
                  onActivity={openActivity} />
              )}
              {route === 'activity' && (
                <ActivityScreen accent={accent}
                  onBack={backToHub} />
              )}
              {route === 'settings' && (
                <SettingsScreen accent={accent}
                  profile={activeProfile}
                  authConfigured={authConfigured}
                  onBack={backToHub}
                  onProfileUpdated={(next) => setProfile(next)}
                  onSignOut={handleSignOut} />
              )}
            </div>
          </div>

          <EverydayLeftRail
            active={route === 'wallet' ? 'wallet' : route}
            onHome={backToHub}
            onMarketplace={() => openModeFromHub('shop')}
            onWallet={openWallet}
            onPlan={() => openModeFromHub('plan')}
            onBounty={() => { pkHaptic('select'); setBountyOpen(true); }}
            unread={headerUnread}
            onInbox={openInbox}
            onProfile={openSettings}
            showOperator={route === 'shop'}
            isOperator={isOperator}
            onOperator={() => { pkHaptic('select'); setIsOperator((v) => !v); }}
          />

          {inboxOpen && <NotificationsPanel onClose={() => setInboxOpen(false)} seenAt={inboxSnap} />}

          {bountyOpen && (
            <BountyPanel
              onClose={() => setBountyOpen(false)}
              onRoute={openBountyRoute}
              onSaveToPlan={(plan) => { setBountyOpen(false); captureToPlan({ mode: 'plan', plan }); }}
            />
          )}

          {/* Persistent mini player — keeps audio one tap away while you browse */}
          {showMini && <MiniPlayer player={player} />}

          {showTab && (
            <TabBar active={tab} onChange={goTab} accent={accent} native={PK_NATIVE} />
          )}

          {/* Dedicated full-screen playback (overlays everything, like the inbox) */}
          {playerOpen && pl && <ListenPlayer player={player} />}
          </React.Fragment>
          )}
        </div>
    </AppShell>

      {!PK_NATIVE && (
      <TweaksPanel title="Ingoga Invest">
        <TweakSection label="Palette" />
        <TweakColor label="Accent"
          value={t.accentKey === 'teal'  ? '#2FAE9B' :
                 t.accentKey === 'amber' ? '#E2941F' :
                 t.accentKey === 'blue'  ? '#2A6FDB' : '#23241F'}
          options={['#2FAE9B', '#E2941F', '#2A6FDB', '#23241F']}
          onChange={(hex) => {
            const map = { '#2FAE9B': 'teal', '#E2941F': 'amber',
                          '#2A6FDB': 'blue', '#23241F': 'ink' };
            setTweak('accentKey', map[hex] || 'teal');
          }} />

        <TweakSection label="Typography" />
        <TweakRadio label="Type direction"
          value={t.typeKey}
          options={[
            { value: 'manrope', label: 'Manrope' },
            { value: 'jakarta', label: 'Jakarta' },
            { value: 'figtree', label: 'Figtree' },
          ]}
          onChange={(v) => setTweak('typeKey', v)} />

        <TweakSection label="Jump to screen" />
        <TweakSelect label="Save & Credit"
          value=""
          options={[
            { value: '',         label: '—' },
            { value: 'capital',  label: 'Save home' },
            { value: 'credit',   label: 'Credit line' },
            { value: 'growth',   label: 'Growth' },
            { value: 'wallet',   label: 'Wallet' },
            { value: 'settings', label: 'Profile / Settings' },
            { value: 'add',      label: 'Add money' },
            { value: 'withdraw', label: 'Withdraw' },
            { value: 'borrow',   label: 'Borrow' },
            { value: 'repay',    label: 'Repay' },
          ]}
          onChange={(v) => {
            if (!v) return;
            if (v === 'capital')   { setTab('capital'); setRoute('capital'); }
            else if (v === 'credit')   { setTab('credit'); setRoute('credit'); }
            else if (v === 'growth')   { setRoute('growth'); }
            else if (v === 'wallet')   { setTab('wallet'); setRoute('wallet'); }
            else if (v === 'settings') { setTab('capital'); setRoute('settings'); }
            else { setMoneyMode(v); setMoneyReturn('capital'); setRoute('money'); }
          }} />
        <TweakSection label="Chrome" />
        <TweakToggle label="Show tab bar"
          value={t.showTabBar}
          onChange={(v) => setTweak('showTabBar', v)} />
      </TweaksPanel>
      )}
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
