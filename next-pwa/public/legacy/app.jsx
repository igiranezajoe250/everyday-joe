// app.jsx — root app for Poketee prototype

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentKey": "teal",
  "typeKey": "manrope",
  "showTabBar": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const accent = (CC_PALETTES[t.accentKey] || CC_PALETTES.teal).accent;
  const fontStack = CC_TYPES[t.typeKey] || CC_TYPES.manrope;

  // route: 'hub' | 'shop' | 'capital' | 'pay' | 'plan' | 'listen' | 'commute' | ...
  const TRANSIENT = ['money'];
  const MAIN_TABS = ['shop', 'capital', 'pay', 'plan', 'listen', 'commute', 'credit'];
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

  // Lock gate — re-prompts on a true cold start (new session); a refresh
  // inside the same session stays unlocked. Face ID / passcode unlock both
  // set the session flag.
  const [unlocked, setUnlocked] = React.useState(
    () => sessionStorage.getItem('pk_sess') === '1'
  );
  const handleUnlock = () => {
    try { sessionStorage.setItem('pk_sess', '1'); } catch (e) {}
    setUnlocked(true);
    PoketeePush.init();
  };
  const handleSignOut = () => {
    try { sessionStorage.removeItem('pk_sess'); } catch (e) {}
    setUnlocked(false);
    setTab('hub'); setRoute('hub');
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
      if (window.caches) caches.keys().then((ks) => ks.forEach((k) => k.startsWith('poketee') && caches.delete(k))).catch(() => {});
    }
    if (unlocked) PoketeePush.init();
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
    setMoneyReturn(route === 'credit' ? 'credit' : 'capital');
    setRoute('money');
  };
  const closeMoney = () => {
    const r = moneyReturn === 'credit' ? 'credit' : 'capital';
    setTab(r); setRoute(r);
  };

  const openCredit = () => { setTab('credit'); setRoute('credit'); };
  const openGrowth = () => { setRoute('growth'); };
  const backFromGrowth = () => { const r = tab === 'credit' ? 'credit' : 'capital'; setRoute(r); };

  const openWallet   = () => { setTab('capital'); setRoute('wallet'); };
  const openSettings = () => { setTab('capital'); setRoute('settings'); };
  const openActivity = () => { setTab('capital'); setRoute('activity'); };
  const backToCapital = () => { setTab('capital'); setRoute('capital'); };
  const backToHub = () => { setTab('hub'); setRoute('hub'); };
  const openModeFromHub = (id) => { pkHaptic('select'); setTab(id); setRoute(id); };
  const openSaveFromHub = () => { pkHaptic('select'); setTab('capital'); setRoute('capital'); };
  const openCreditFromHub = () => { pkHaptic('select'); setTab('credit'); setRoute('credit'); };

  const dailyModes = [
    { id: 'shop', label: 'Shop', route: 'shop' },
    { id: 'save', label: 'Save', route: 'capital' },
    { id: 'pay', label: 'Pay', route: 'pay' },
    { id: 'plan', label: 'Plan', route: 'plan' },
    { id: 'listen', label: 'Listen', route: 'listen' },
    { id: 'commute', label: 'Commute', route: 'commute' },
  ];
  const activeMode = route === 'capital' ? 'save' : route;
  const showModeSwitch = dailyModes.some((m) => m.id === activeMode);
  const switchMode = (mode) => {
    pkHaptic('select');
    setTab(mode.route);
    setRoute(mode.route);
  };

  const showTab = false;

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
            <Onboarding native={PK_NATIVE} accent={accent} onDone={finishOnboarding} />
          ) : !unlocked ? (
            <LockGate accent={accent} native={PK_NATIVE} onUnlock={handleUnlock} />
          ) : (
          <React.Fragment>
          <div style={{
            height: PK_NATIVE ? 'max(16px, env(safe-area-inset-top, 16px))' : 54,
            flexShrink: 0,
          }} />

          <div style={{
            flex: 1, overflow: 'auto', position: 'relative',
            scrollbarWidth: 'none',
          }}>
            <style>{`.cc-scroll::-webkit-scrollbar { display: none; }`}</style>
            <div className="cc-scroll" style={{ height: '100%' }}>
              {route === 'hub' && (
                <EverydayHub
                  web={PK_WEB}
                  onShop={() => openModeFromHub('shop')}
                  onSave={openSaveFromHub}
                  onPay={() => openModeFromHub('pay')}
                  onPlan={() => openModeFromHub('plan')}
                  onListen={() => openModeFromHub('listen')}
                  onCommute={() => openModeFromHub('commute')}
                  onSettings={openSettings}
                />
              )}
              {route === 'shop' && (
                <EverydayFunctionScreen
                  mode="shop"
                  web={PK_WEB}
                  onBack={backToHub}
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
                />
              )}
              {route === 'listen' && (
                <EverydayFunctionScreen
                  mode="listen"
                  web={PK_WEB}
                  onBack={backToHub}
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
                  onBack={backToCapital}
                  onMoney={openMoney}
                  onActivity={openActivity} />
              )}
              {route === 'activity' && (
                <ActivityScreen accent={accent}
                  onBack={backToCapital} />
              )}
              {route === 'settings' && (
                <SettingsScreen accent={accent}
                  onBack={backToCapital}
                  onSignOut={handleSignOut} />
              )}
            </div>
          </div>

          {showModeSwitch && (
            <ModeSwitch
              modes={dailyModes}
              active={activeMode}
              onSelect={switchMode}
              native={PK_NATIVE}
            />
          )}

          {showTab && (
            <TabBar active={tab} onChange={goTab} accent={accent} native={PK_NATIVE} />
          )}
          </React.Fragment>
          )}
        </div>
    </AppShell>

      {!PK_NATIVE && (
      <TweaksPanel title="Everyday">
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
            else if (v === 'wallet')   { setTab('capital'); setRoute('wallet'); }
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

function ModeSwitch({ modes, active, onSelect, native }) {
  const activeIndex = Math.max(0, modes.findIndex((mode) => mode.id === active));
  const [expanded, setExpanded] = React.useState(false);
  const total = modes.length;
  const prev = modes[(activeIndex - 1 + total) % total];
  const current = modes[activeIndex];
  const next = modes[(activeIndex + 1) % total];
  const switchBy = (direction) => {
    const target = modes[(activeIndex + direction + total) % total];
    onSelect(target);
    setExpanded(true);
  };
  const onWheel = (event) => {
    if (!expanded) return;
    event.preventDefault();
    if (event.deltaY > 0) switchBy(1);
    if (event.deltaY < 0) switchBy(-1);
  };

  return (
    <div style={{
      flexShrink: 0,
      padding: native ? '6px 12px max(12px, env(safe-area-inset-bottom, 0px))' : '6px 16px 14px',
      background: canvas,
    }}>
      <div onWheel={onWheel} style={{
        width: 162,
        margin: '0 auto',
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
      }}>
        {expanded && <button onClick={() => switchBy(-1)} aria-label="Previous section" style={{
          width: 38,
          height: 16,
          border: 0,
          background: 'transparent',
          color: ink40,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="16" height="9" viewBox="0 0 18 10" fill="none">
            <path d="M3 8L9 2L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>}
        {expanded && <button onClick={() => { onSelect(prev); setExpanded(true); }} style={{
          height: 16,
          border: 0,
          background: 'transparent',
          color: ink25,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 10,
          fontWeight: 760,
        }}>{prev.label}</button>}
        <button onClick={() => setExpanded((open) => !open)} aria-current="page" aria-expanded={expanded} style={{
          minWidth: 116,
          height: 30,
          border: 0,
          borderRadius: 14,
          background: ink,
          color: paper,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 820,
          letterSpacing: '-0.01em',
          boxShadow: '0 10px 24px rgba(10,10,10,0.14)',
        }}>{current.label}</button>
        {expanded && <button onClick={() => { onSelect(next); setExpanded(true); }} style={{
          height: 16,
          border: 0,
          background: 'transparent',
          color: ink25,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 10,
          fontWeight: 760,
        }}>{next.label}</button>}
        {expanded && <button onClick={() => switchBy(1)} aria-label="Next section" style={{
          width: 38,
          height: 16,
          border: 0,
          background: 'transparent',
          color: ink40,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="16" height="9" viewBox="0 0 18 10" fill="none">
            <path d="M3 2L9 8L15 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
