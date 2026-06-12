// screens.jsx — Capital home, Venture feed, Detail, Checkout
// Everyday — low-fi swiss wireframes, pill-rounded geometry.


// ────────────────────────────── EVERYDAY HUB ──────────────────────────────
// Minimal home: a single premium "+" launcher. Tapping it opens a card of the
// functions the user chose at sign-up; tapping one opens that page. The old
// vertical scroll-wheel switcher has been retired in favour of this.

// Shared catalogue of the six Everyday functions. Each maps to a route the app
// already renders. `icon` is JSX; stroke colour is applied via cloneElement.
const EVERYDAY_FUNCTIONS = [
  { id: 'shop', label: 'Shop', sub: 'Find trusted shops', color: '#A37BF2',
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>) },
  { id: 'save', label: 'Save', sub: 'Save and grow', color: '#2FAE9B', locked: true,
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>) },
  { id: 'pay', label: 'Pay', sub: 'Schedule payments', color: '#C8102E',
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>) },
  { id: 'plan', label: 'Plan', sub: 'Plan your day', color: '#E2941F',
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M8 14h5M8 18h3"/></svg>) },
  { id: 'listen', label: 'Listen', sub: 'Play podcasts', color: '#5B7CFA',
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="7" rx="2"/><rect x="17" y="13" width="4" height="7" rx="2"/></svg>) },
  { id: 'commute', label: 'Commute', sub: 'Book vetted rides', color: '#3B82F6',
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v11z"/><path d="M5 17l-1.5 3M19 17l1.5 3M8 20h8"/><path d="M6 9h12"/></svg>) },
];
const DEFAULT_FUNCTION_IDS = EVERYDAY_FUNCTIONS.map((f) => f.id);

// Resolve the user's chosen functions (persisted at sign-up). Save is always
// present, and catalogue order is preserved.
function pkSelectedFunctions() {
  const ids = PKStore.get('functions', null);
  const chosen = Array.isArray(ids) && ids.length ? ids : DEFAULT_FUNCTION_IDS;
  const set = new Set(chosen); set.add('save');
  return EVERYDAY_FUNCTIONS.filter((f) => set.has(f.id));
}

// The "+" launcher + the function card it reveals. variant 'hero' centres a
// large button (home screen); 'fab' pins a smaller one bottom-centre (used on
// the function pages so the user can hop between them).
function FunctionLauncher({ functions, onSelect, variant = 'hero', bottomOffset = 22 }) {
  // Two-phase open/close: `open` mounts the sheet, `shown` drives the
  // transforms a frame later so the slide-up (and slide-down) animate smoothly.
  const [open, setOpen] = React.useState(false);
  const [shown, setShown] = React.useState(false);
  const fns = functions && functions.length ? functions : EVERYDAY_FUNCTIONS;
  const big = variant === 'hero';

  const openSheet = () => {
    pkHaptic('medium');
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };
  const closeSheet = () => {
    pkHaptic('light');
    setShown(false);
    setTimeout(() => setOpen(false), 300);
  };
  const toggle = () => (open ? closeSheet() : openSheet());
  const pick = (fn) => {
    pkHaptic('select');
    setShown(false);
    setTimeout(() => { setOpen(false); onSelect && onSelect(fn.id); }, 240);
  };

  const plusBtn = (
    <button onClick={toggle} aria-label={open ? 'Close functions' : 'Open functions'} aria-expanded={open}
      style={{
        width: big ? 78 : 44, height: big ? 78 : 44, borderRadius: 999,
        border: 0, cursor: 'pointer', background: ink, color: paper,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: big
          ? (shown ? '0 8px 20px rgba(10,10,10,0.22)' : '0 16px 38px rgba(10,10,10,0.26)')
          : '0 8px 20px rgba(10,10,10,0.18)',
        transition: 'transform 320ms cubic-bezier(.16,.84,.28,1), box-shadow 260ms ease',
        transform: shown ? 'rotate(45deg)' : 'rotate(0deg)',
      }}>
      <svg width={big ? 32 : 21} height={big ? 32 : 21} viewBox="0 0 24 24" fill="none"
        stroke={paper} strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );

  const overlay = open ? (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={closeSheet} style={{
        position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.30)',
        opacity: shown ? 1 : 0, transition: 'opacity 300ms ease',
      }} />
      <div style={{
        position: 'relative', background: paper,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '8px 22px max(24px, env(safe-area-inset-bottom, 20px))',
        boxShadow: '0 -20px 60px rgba(10,10,10,0.20)',
        transform: shown ? 'translateY(0)' : 'translateY(102%)',
        transition: 'transform 380ms cubic-bezier(.16,.84,.28,1)',
        willChange: 'transform',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: ink12, margin: '8px auto 14px' }} />
        <div style={{ fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink40, padding: '0 2px 6px' }}>Your functions</div>
        <div>
          {fns.map((fn, idx) => (
            <button key={fn.id} onClick={() => pick(fn)} style={{
              display: 'flex', alignItems: 'center', gap: 16, width: '100%',
              padding: '15px 2px', border: 0, borderTop: idx === 0 ? 'none' : `1px dashed ${DASH}`,
              background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }}>
              <span style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {React.cloneElement(fn.icon, { width: 23, height: 23, stroke: fn.color })}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 16, fontWeight: 650, letterSpacing: '-0.01em', color: ink }}>{fn.label}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: ink40, marginTop: 1 }}>{fn.sub}</span>
              </span>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={ink25} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5" /></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  if (variant === 'fab') {
    // Bottom-centre. bottomOffset lifts it clear of a screen's own bottom bar.
    return (
      <React.Fragment>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0px))`, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 }}>
          {/* canvas halo masks any content that scrolls behind the button */}
          <div style={{ pointerEvents: 'auto', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: 96, height: 96, borderRadius: '50%', background: `radial-gradient(circle, ${canvas} 52%, rgba(250,246,241,0) 72%)` }} />
            <div style={{ position: 'relative' }}>{plusBtn}</div>
          </div>
        </div>
        {overlay}
      </React.Fragment>
    );
  }
  return (<React.Fragment>{plusBtn}{overlay}</React.Fragment>);
}

// ── Global header actions: notifications · wallet · profile ──
// Rendered top-right on every main screen so payment balance and quick
// profile access are always one tap away.
function ActionIcon({ onClick, label, badge, children }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} style={{
      position: 'relative', width: 38, height: 38, borderRadius: '50%',
      border: `1px solid ${ink12}`, background: paper, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
    }}>
      {children}
      {badge ? (
        <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: '#C8102E', color: '#fff', fontFamily: CC_MONO, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${canvas}` }}>{badge}</span>
      ) : null}
    </button>
  );
}

function HeaderActions({ onInbox, onWallet, onProfile, onOperator, isOperator, unread = 0, initials = 'JK', showOperator = false }) {
  return (
    <div style={{ position: 'absolute', top: PK_NATIVE ? 'calc(max(16px, env(safe-area-inset-top, 16px)) + 8px)' : 62, right: 16, zIndex: 45, display: 'flex', alignItems: 'center', gap: 8 }}>
      {showOperator && (
        <button onClick={onOperator} aria-label={isOperator ? 'Switch to client mode' : 'Switch to operator mode'} title={isOperator ? 'Client mode' : 'Operator mode'} style={{
          position: 'relative', height: 38, padding: '0 14px', borderRadius: 999,
          border: `1px solid ${isOperator ? ink : ink12}`, background: isOperator ? ink : paper,
          color: isOperator ? paper : ink, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: '0.01em',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18M3 12h18M3 17h12"/></svg>
          <span>{isOperator ? 'Operator' : 'Client'}</span>
        </button>
      )}
      <ActionIcon onClick={onInbox} label="Notifications" badge={unread}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
      </ActionIcon>
      <ActionIcon onClick={onWallet} label="Wallet">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18"/><circle cx="16.5" cy="14.5" r="1.05" fill={ink} stroke="none"/></svg>
      </ActionIcon>
      <button onClick={onProfile} aria-label="Profile" style={{ width: 38, height: 38, borderRadius: '50%', border: `1px solid ${ink25}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: CC_MONO, fontSize: 11, fontWeight: 700, color: ink70, padding: 0 }}>{initials}</button>
    </div>
  );
}

function everydayProfileName(profile) {
  const raw = profile && profile.display_name ? String(profile.display_name).trim() : '';
  if (raw) return raw;
  const email = profile && profile.email ? String(profile.email) : '';
  if (email) return email.split('@')[0].replace(/[._-]+/g, ' ');
  return CC_PORTFOLIO.user.name + ' Karangwa';
}

function everydayFirstName(profile) {
  return everydayProfileName(profile).split(/\s+/)[0] || 'there';
}

function everydayProfileInitials(profile) {
  const parts = everydayProfileName(profile).split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return CC_PORTFOLIO.user.initials;
}

function EverydayAuthGate({ accent, onReady, onDemo }) {
  const [accountMode, setAccountMode] = React.useState('signin');
  const [method, setMethod] = React.useState('email');
  const [emailMode, setEmailMode] = React.useState('code');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [pending, setPending] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const isPassword = method === 'email' && emailMode === 'password';
  const isEmailCode = method === 'email' && emailMode === 'code';
  const isPhone = method === 'phone';
  const isSignUp = accountMode === 'signup';
  const emailReady = email.trim().includes('@');
  const nameReady = !isSignUp || !isPassword || name.trim().length >= 2;
  const phoneReady = phone.trim().replace(/\s+/g, '').length >= 8;
  const codeReady = code.trim().length >= 4;
  const ready = pending
    ? codeReady
    : isPassword
      ? emailReady && password.length >= 6 && nameReady
      : isEmailCode
        ? emailReady
        : isPhone
          ? phoneReady
          : false;

  const resetStatus = () => {
    setError('');
    setNotice('');
    setCode('');
    setPending(null);
  };

  const switchMethod = (next) => {
    pkHaptic('select');
    setMethod(next);
    setEmailMode('code');
    resetStatus();
  };

  const switchAccountMode = (next) => {
    pkHaptic('select');
    setAccountMode(next);
    resetStatus();
  };

  const sendGoogle = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.EverydayAPI.auth.signInWithGoogle(window.location.href);
    } catch (err) {
      setError(err && err.message ? err.message : 'Google sign-in is not ready yet.');
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (pending && pending.kind === 'email') {
        await window.EverydayAPI.auth.verifyEmailOtp(pending.to, code.trim());
        onReady && onReady();
      } else if (pending && pending.kind === 'phone') {
        await window.EverydayAPI.auth.verifyPhoneOtp(pending.to, code.trim());
        onReady && onReady();
      } else if (isPassword) {
        if (isSignUp) await window.EverydayAPI.auth.signUp(email.trim(), password, name.trim());
        else await window.EverydayAPI.auth.signIn(email.trim(), password);
        onReady && onReady();
      } else if (isEmailCode) {
        await window.EverydayAPI.auth.sendEmailOtp(email.trim(), isSignUp);
        setPending({ kind: 'email', to: email.trim() });
        setNotice(isSignUp ? 'We sent a verification code to create your account.' : 'We sent a verification code to your email.');
      } else if (isPhone) {
        await window.EverydayAPI.auth.sendPhoneOtp(phone.trim().replace(/\s+/g, ''), isSignUp);
        setPending({ kind: 'phone', to: phone.trim().replace(/\s+/g, '') });
        setNotice(isSignUp ? 'We sent a confirmation code to create your account.' : 'We sent a confirmation code to your phone.');
      }
    } catch (err) {
      setError(err && err.message ? err.message : 'Could not continue. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
      <div style={{ height: PK_NATIVE ? 'max(16px, env(safe-area-inset-top, 16px))' : 54, flexShrink: 0 }} />
      <div style={{ padding: '14px 24px 0' }}>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: ink70 }}>Everyday</span>
      </div>
      <form onSubmit={submit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px 36px', maxWidth: 440, width: '100%', margin: '0 auto' }}>
        <Eyebrow style={{ marginBottom: 16 }}>Your everyday trust</Eyebrow>
        <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.08, color: ink, marginBottom: 28 }}>
          {pending ? 'Enter your confirmation code.' : isSignUp ? 'Create your account.' : 'Welcome back.'}
        </div>
        {!pending && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[['signin', 'Sign in'], ['signup', 'Sign up']].map(([id, label]) => (
              <button key={id} type="button" onClick={() => switchAccountMode(id)} style={{
                flex: 1, height: 40, borderRadius: 999,
                border: `1px solid ${accountMode === id ? ink : ink12}`,
                background: accountMode === id ? ink : 'transparent',
                color: accountMode === id ? paper : ink,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 650,
              }}>{label}</button>
            ))}
          </div>
        )}
        {!pending && (
          <button type="button" onClick={sendGoogle} disabled={busy} style={{
            height: 48, borderRadius: 999, border: `1px solid ${ink12}`,
            background: paper, color: ink, cursor: busy ? 'default' : 'pointer',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 650,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 16,
          }}>
            <span style={{ fontFamily: CC_MONO, fontSize: 13, fontWeight: 800 }}>G</span>
            {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
          </button>
        )}

        {!pending && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
            {[['email', 'Email'], ['phone', 'Phone']].map(([id, label]) => (
              <button key={id} type="button" onClick={() => switchMethod(id)} style={{
                flex: 1, height: 40, borderRadius: 999,
                border: `1px solid ${method === id ? ink : ink12}`,
                background: method === id ? ink : 'transparent',
                color: method === id ? paper : ink,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 650,
              }}>{label}</button>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gap: 18 }}>
          {pending ? (
            <DashField label="Code" value={code} onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 8))} placeholder="Enter the code" inputMode="numeric" autoFocus />
          ) : isPhone ? (
            <DashField label="Phone" value={phone} onChange={setPhone} placeholder="+250 7..." type="tel" inputMode="tel" autoFocus />
          ) : (
            <React.Fragment>
              {isSignUp && isPassword && <DashField label="Name" value={name} onChange={setName} placeholder="Your name" autoFocus />}
              <DashField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" inputMode="email" autoFocus />
              {isPassword && <DashField label="Password" value={password} onChange={setPassword} placeholder="At least 6 characters" type="password" />}
            </React.Fragment>
          )}
        </div>
        {!pending && method === 'email' && (
          <button type="button" onClick={() => { setEmailMode(isPassword ? 'code' : 'password'); resetStatus(); }} style={{
            marginTop: 14, border: 0, background: 'transparent', color: ink55,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 650,
            textAlign: 'left', padding: 0,
          }}>{isPassword ? 'Send a code instead' : 'Use password instead'}</button>
        )}
        {notice && <div style={{ marginTop: 16, color: ink55, fontSize: 13, lineHeight: 1.45 }}>{notice}</div>}
        {error && <div style={{ marginTop: 16, color: '#A33', fontSize: 13, lineHeight: 1.45 }}>{error}</div>}
        <button type="submit" disabled={!ready || busy} style={{
          marginTop: 28, height: 54, borderRadius: 999, border: 0,
          background: ready && !busy ? ink : ink12, color: ready && !busy ? paper : ink40,
          cursor: ready && !busy ? 'pointer' : 'default', fontFamily: 'inherit',
          fontSize: 15, fontWeight: 650,
        }}>{busy ? 'Please wait...' : pending ? 'Verify code' : isPassword ? (isSignUp ? 'Create account' : 'Sign in') : 'Send code'}</button>
        {pending && (
          <button type="button" onClick={resetStatus} style={{
            marginTop: 14, height: 44, borderRadius: 999, border: `1px dashed ${ink25}`,
            background: 'transparent', color: ink70, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: 650,
          }}>Use a different sign-in method</button>
        )}
        {!pending && (
          <button type="button" onClick={() => { pkHaptic('select'); onDemo && onDemo(); }} style={{
            marginTop: 14, height: 44, borderRadius: 999, border: `1px dashed ${ink25}`,
            background: 'transparent', color: ink70, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: 650,
          }}>Continue in demo</button>
        )}
      </form>
    </div>
  );
}

function EverydayProfileSetup({ profile, accent, onDone }) {
  const [name, setName] = React.useState(() => everydayProfileName(profile));
  const [city, setCity] = React.useState(() => (profile && profile.city) || 'Kigali');
  const [language, setLanguage] = React.useState(() => (profile && profile.language) || 'en');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const save = async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const next = await window.EverydayAPI.profile.update({
        display_name: name.trim(),
        city: city.trim() || 'Kigali',
        language,
        country: 'RW',
        onboarding_completed: true,
      });
      PKStore.set('profile_language', language);
      onDone && onDone(next);
    } catch (err) {
      setError(err && err.message ? err.message : 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
      <div style={{ height: PK_NATIVE ? 'max(16px, env(safe-area-inset-top, 16px))' : 54, flexShrink: 0 }} />
      <form onSubmit={save} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px 36px', maxWidth: 440, width: '100%', margin: '0 auto' }}>
        <Eyebrow style={{ marginBottom: 16 }}>Profile</Eyebrow>
        <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.08, color: ink, marginBottom: 28 }}>
          Tell Everyday what to call you.
        </div>
        <div style={{ display: 'grid', gap: 18 }}>
          <DashField label="Display name" value={name} onChange={setName} placeholder="Your name" autoFocus />
          <DashField label="City" value={city} onChange={setCity} placeholder="Kigali" />
          <div>
            <Eyebrow style={{ marginBottom: 10 }}>Language</Eyebrow>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['en', 'English'], ['rw', 'Kinyarwanda']].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setLanguage(id)} style={{
                  flex: 1, height: 44, borderRadius: 999,
                  border: `1px solid ${language === id ? ink : ink12}`,
                  background: language === id ? ink : 'transparent',
                  color: language === id ? paper : ink,
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 650,
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
        {error && <div style={{ marginTop: 16, color: '#A33', fontSize: 13, lineHeight: 1.45 }}>{error}</div>}
        <button type="submit" disabled={!name.trim() || busy} style={{
          marginTop: 28, height: 54, borderRadius: 999, border: 0,
          background: name.trim() && !busy ? ink : ink12, color: name.trim() && !busy ? paper : ink40,
          cursor: name.trim() && !busy ? 'pointer' : 'default', fontFamily: 'inherit',
          fontSize: 15, fontWeight: 650,
        }}>{busy ? 'Saving...' : 'Continue'}</button>
      </form>
    </div>
  );
}

// Inbox: notifications + messages received from the app.
function NotificationsPanel({ onClose }) {
  const [tab, setTab] = React.useState('all');
  const items = [
    { id: 1, type: 'notif',   title: 'Savings interest credited', body: 'RWF 28,600 added to your savings.', time: '2h', unread: true },
    { id: 2, type: 'message', title: 'Aline N. · Moto',           body: 'I’m 3 minutes away — meet at the gate?', time: '10m', unread: true },
    { id: 3, type: 'notif',   title: 'Payment sent',              body: 'RWF 5,000 to Eric Kwizera.', time: '1d', unread: false },
    { id: 4, type: 'message', title: 'Green Hills School',        body: 'Receipt for school fees attached.', time: '2d', unread: false },
    { id: 5, type: 'notif',   title: 'New trusted shop',          body: 'House of Tayo just joined Everyday.', time: '3d', unread: false },
  ];
  const shown = tab === 'messages' ? items.filter((i) => i.type === 'message') : items;
  return (
    <div className="pk-rise" style={{ position: 'absolute', inset: 0, zIndex: 70, background: canvas, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: PK_NATIVE ? 'max(16px, env(safe-area-inset-top, 16px))' : 54, flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 0' }}>
        <span style={{ fontSize: 18, fontWeight: 820, letterSpacing: '-0.02em', color: ink }}>Inbox</span>
        <IconBtn onClick={onClose}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
        </IconBtn>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px 6px' }}>
        {[['all', 'All'], ['messages', 'Messages']].map(([k, l]) => {
          const on = tab === k;
          return (
            <button key={k} onClick={() => setTab(k)} style={{ height: 34, padding: '0 16px', borderRadius: 999, border: on ? '0' : `1px solid ${ink12}`, background: on ? ink : 'transparent', color: on ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700 }}>{l}</button>
          );
        })}
      </div>
      <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: '6px 20px 24px' }}>
        {shown.map((it, idx) => (
          <div key={it.id} style={{ display: 'flex', gap: 13, padding: '15px 0', borderTop: idx === 0 ? 'none' : `1px dashed ${DASH}`, alignItems: 'flex-start' }}>
            <span style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ink06, color: ink }}>
              {it.type === 'message' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8 9 9 0 0 1-4-1L3 20l1.5-4a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 17 0z"/></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
              )}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: ink }}>{it.title}</span>
                <span style={{ fontFamily: CC_MONO, fontSize: 10.5, color: ink40, flexShrink: 0 }}>{it.time}</span>
              </div>
              <div style={{ fontSize: 13, color: ink55, marginTop: 3, lineHeight: 1.4 }}>{it.body}</div>
            </div>
            {it.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C8102E', flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function BountyButton({ onOpen, bottomOffset = 18 }) {
  const [hover, setHover] = React.useState(false);
  const [down, setDown] = React.useState(false);
  const [compact, setCompact] = React.useState(() => {
    try { return window.innerWidth < 720; } catch (e) { return true; }
  });
  React.useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 720);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      aria-label="Open Bounty"
      title="Bounty"
      style={{
      position: 'absolute',
      right: compact ? 16 : 18,
      bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0px))`,
      zIndex: 46,
      height: compact ? 42 : 44,
      padding: compact ? '0 13px 0 12px' : '0 14px 0 13px',
      borderRadius: 999,
      border: `1px solid ${hover ? ink25 : ink12}`,
      background: hover ? paperSoft : paper,
      color: ink,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 760,
      boxShadow: hover ? '0 10px 26px rgba(10,10,10,0.13)' : '0 8px 22px rgba(10,10,10,0.09)',
      transform: down ? 'scale(0.97)' : 'none',
      transition: 'background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
    }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8 9 9 0 0 1-4-1L3 20l1.5-4a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 17 0z"/>
        <circle cx="9" cy="11.5" r="0.9" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="11.5" r="0.9" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="11.5" r="0.9" fill="currentColor" stroke="none"/>
      </svg>
      <span>Bounty</span>
    </button>
  );
}

function BountyPanel({ onClose, onRoute }) {
  const first = { id: 'b0', role: 'assistant', text: 'Tell me what you want to do. I can help with Moto, Shop, Pay, Save, Plan, or Listen.' };
  const [messages, setMessages] = usePersisted('bounty_messages', [first]);
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [error, setError] = React.useState('');
  const [compact, setCompact] = React.useState(() => {
    try { return window.innerWidth < 720; } catch (e) { return true; }
  });
  const chunksRef = React.useRef([]);
  const recorderRef = React.useRef(null);
  const streamRef = React.useRef(null);

  React.useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 720);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  React.useEffect(() => () => stopStream(), []);

  // Consume any home-bar preload — when the user typed in the home bar with
  // Bounty selected, or hit the mic, hand the intent off here.
  React.useEffect(() => {
    let preload = null;
    try { preload = window.__EVERYDAY_BOUNTY_PRELOAD__; window.__EVERYDAY_BOUNTY_PRELOAD__ = null; } catch (e) {}
    if (!preload) return;
    if (preload.text) {
      sendText(preload.text);
    } else if (preload.mode === 'voice') {
      startRecording();
    }
    // image/upload preload: nothing to auto-trigger yet — surfaced in the next pass.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopStream = () => {
    try { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); } catch (e) {}
    streamRef.current = null;
  };

  const pushAssistant = (base, data) => {
    const reply = {
      id: 'b' + Date.now() + '-a',
      role: 'assistant',
      text: data.text,
      route: data.route,
      action: data.action,
      model: data.model,
    };
    setMessages([...base, reply]);
  };

  const sendText = async (raw) => {
    const text = String(raw || '').trim();
    if (!text || busy) return;
    setError('');
    const userMsg = { id: 'b' + Date.now() + '-u', role: 'user', text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const data = await ccSendBountyMessage(text, next);
      pushAssistant(next, data);
    } catch (e) {
      pushAssistant(next, { text: e && e.message ? e.message : 'Bounty could not respond.', model: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const startRecording = async () => {
    if (recording || busy) return;
    setError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Microphone recording is not available in this browser.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const rec = new MediaRecorder(stream, { mimeType: mime });
      recorderRef.current = rec;
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stopStream();
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: mime });
        if (!blob.size) return;
        setBusy(true);
        try {
          const tx = await ccTranscribeVoice(blob);
          setBusy(false);
          await sendText(tx.text);
        } catch (e) {
          setBusy(false);
          setError(e && e.message ? e.message : 'Voice transcription failed.');
        }
      };
      rec.start();
      setRecording(true);
      pkHaptic('medium');
    } catch (e) {
      stopStream();
      setRecording(false);
      setError(e && e.message ? e.message : 'Microphone permission was not granted.');
    }
  };

  const stopRecording = () => {
    try {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    } catch (e) {
      stopStream();
      setRecording(false);
    }
  };

  const handleRoute = (route) => {
    if (!route) return;
    pkHaptic('select');
    onRoute && onRoute(route);
    onClose && onClose();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 76, display: 'flex', justifyContent: compact ? 'center' : 'flex-end', alignItems: compact ? 'flex-end' : 'stretch', pointerEvents: 'auto' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.24)' }} />
      <div className="pk-rise" style={{
        position: 'relative',
        width: compact ? '100%' : 420,
        maxWidth: compact ? '100%' : 'calc(100% - 32px)',
        height: compact ? 'min(86%, 680px)' : '100%',
        background: canvas,
        borderLeft: compact ? 'none' : `1px solid ${ink12}`,
        borderTopLeftRadius: compact ? 26 : 0,
        borderTopRightRadius: compact ? 26 : 0,
        boxShadow: compact ? '0 -20px 60px rgba(10,10,10,0.22)' : '-24px 0 70px rgba(10,10,10,0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ height: compact ? 10 : (PK_NATIVE ? 'max(16px, env(safe-area-inset-top, 16px))' : 54), flexShrink: 0 }} />
        {compact && <div style={{ width: 40, height: 4, borderRadius: 999, background: ink12, margin: '0 auto 10px', flexShrink: 0 }} />}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: compact ? '0 18px 8px' : '8px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: ink, color: paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
            <span style={{ fontSize: 18, fontWeight: 820, letterSpacing: '-0.02em', color: ink }}>Bounty</span>
          </div>
          <IconBtn onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          </IconBtn>
        </div>

        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: compact ? '12px 18px 12px' : '18px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m) => {
            const mine = m.role === 'user';
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: compact ? '86%' : '82%',
                  background: mine ? ink : paper,
                  color: mine ? paper : ink,
                  border: mine ? 0 : `1px solid ${ink12}`,
                  borderRadius: 18,
                  padding: '11px 13px',
                  fontSize: 14,
                  lineHeight: 1.45,
                  boxShadow: mine ? 'none' : '0 1px 0 rgba(10,10,10,0.02)',
                }}>
                  <div>{m.text}</div>
                  {m.route && m.action && (
                    <button onClick={() => handleRoute(m.route)} style={{
                      marginTop: 10,
                      height: 32,
                      padding: '0 12px',
                      borderRadius: 999,
                      border: `1px solid ${ink}`,
                      background: 'transparent',
                      color: ink,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 12,
                      fontWeight: 760,
                    }}>{m.action}</button>
                  )}
                </div>
              </div>
            );
          })}
          {busy && (
            <div style={{ alignSelf: 'flex-start', fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: ink40, padding: '6px 2px' }}>
              {recording ? 'Listening' : 'Thinking'}
            </div>
          )}
        </div>

        <div style={{ padding: '8px 18px max(18px, env(safe-area-inset-bottom, 16px))', borderTop: `1px solid ${ink06}`, background: canvas }}>
          {error && <div style={{ fontSize: 12.5, color: '#A33', margin: '0 2px 8px', lineHeight: 1.35 }}>{error}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: paper, border: `1px solid ${ink12}`, borderRadius: 16, padding: 7 }}>
            <button onClick={recording ? stopRecording : startRecording} disabled={busy && !recording} aria-label={recording ? 'Stop recording' : 'Start recording'} style={{ width: 36, height: 36, borderRadius: 999, border: 0, background: recording ? ink : ink06, color: recording ? paper : ink, cursor: busy && !recording ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HomeIcon kind="voice" size={17} color="currentColor" />
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendText(input); } }}
              placeholder={recording ? 'Listening...' : 'Ask Bounty'}
              disabled={busy || recording}
              style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 0, color: ink, fontFamily: 'inherit', fontSize: 15.5, fontWeight: 500, padding: '0 4px' }} />
            <button onClick={() => sendText(input)} disabled={!input.trim() || busy || recording} aria-label="Send to Bounty" style={{ width: 36, height: 36, borderRadius: 999, border: 0, background: 'transparent', color: input.trim() && !busy && !recording ? ink : ink25, cursor: input.trim() && !busy && !recording ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small glyphs for the Home input modes and contextual cards.
function HomeIcon({ kind, size = 16, color }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color || 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'write')   return (<svg {...p}><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>);
  if (kind === 'voice')   return (<svg {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>);
  if (kind === 'image')   return (<svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5L5 20"/></svg>);
  if (kind === 'upload')  return (<svg {...p}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></svg>);
  if (kind === 'listen')  return (<svg {...p}><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="7" rx="2"/><rect x="17" y="13" width="4" height="7" rx="2"/></svg>);
  if (kind === 'note')    return (<svg {...p}><path d="M14 3v5h5M7 3h8l5 5v13H7z"/></svg>);
  if (kind === 'doc')     return (<svg {...p}><path d="M14 3v5h5M7 3h8l5 5v13H7z"/><path d="M9.5 13h5M9.5 16.5h5"/></svg>);
  if (kind === 'save')    return (<svg {...p}><path d="M12 3v18M16.5 6H9.8a3.2 3.2 0 0 0 0 6.4h4.4a3.2 3.2 0 0 1 0 6.4H7"/></svg>);
  if (kind === 'commute') return (<svg {...p}><path d="M3 13l1.8-4.6A2 2 0 0 1 6.7 7h10.6a2 2 0 0 1 1.9 1.4L21 13v4h-2.2M5.2 17H3v-4m18 0v4h-2.2"/><circle cx="7.2" cy="17" r="1.6"/><circle cx="16.8" cy="17" r="1.6"/></svg>);
  if (kind === 'pay')     return (<svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>);
  return (<svg {...p}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>);
}

// Build a small set of contextual "continue" cards from real persisted state,
// then fill with evergreen entry points. Kept light — never a dashboard.
function buildHomeSuggestions(nav) {
  const out = [];
  const seen = new Set();
  const push = (s) => { if (!seen.has(s.key)) { seen.add(s.key); out.push(s); } };

  try {
    const ln = PKStore.get('listen_now', null);
    if (ln && ln.title) push({ key: 'listen', icon: 'listen', label: 'Listening', sub: ln.title, run: nav.onListen });
    const files = PKStore.get('plan_files', null);
    if (Array.isArray(files)) {
      const live = files.filter((f) => f && !f.trashed).sort((a, b) => (b.updated || 0) - (a.updated || 0));
      if (live[0]) push({ key: 'note', icon: 'note', label: 'Note', sub: live[0].title || 'Untitled note', run: () => nav.onOpenNote(live[0].id) });
      const withDoc = live.find((f) => (f.attachments || []).length);
      if (withDoc) push({ key: 'doc', icon: 'doc', label: 'Document', sub: (withDoc.attachments[0] && withDoc.attachments[0].name) || withDoc.title, run: () => nav.onOpenNote(withDoc.id) });
    }
  } catch (e) {}

  // Evergreen entry points so the main destinations stay one tap away.
  push({ key: 'save', icon: 'save', label: 'Savings plan', sub: 'On track', run: nav.onSave });
  push({ key: 'commute', icon: 'commute', label: 'Commute', sub: 'Where to?', run: nav.onCommute });
  push({ key: 'pay', icon: 'pay', label: 'Payment', sub: 'Pay or schedule', run: nav.onPay });
  push({ key: 'shop', icon: 'shop', label: 'Shop', sub: 'Nearby', run: nav.onShop });

  return out.slice(0, 6);
}

function EverydayHub({ web, profile, onShop, onSave, onPay, onPlan, onListen, onCommute, onCapture, onOpenBounty, onOpenNote }) {
  const [text, setText] = React.useState('');
  const [modeOpen, setModeOpen] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const [target, setTarget] = React.useState('bounty');
  const inputRef = React.useRef(null);
  const ready = text.trim().length > 0;

  const targets = [
    { key: 'bounty',  label: 'Bounty',  sub: 'Anywhere in the app',   icon: 'bounty',  run: null },
    { key: 'shop',    label: 'Shop',    sub: 'Find trusted shops',    icon: 'shop',    run: onShop },
    { key: 'save',    label: 'Save',    sub: 'Track savings',         icon: 'save',    run: onSave },
    { key: 'pay',     label: 'Pay',     sub: 'Pay or schedule',       icon: 'pay',     run: onPay },
    { key: 'plan',    label: 'Plan',    sub: 'Notes and files',       icon: 'note',    run: onPlan },
    { key: 'listen',  label: 'Listen',  sub: 'Channels and shows',    icon: 'listen',  run: onListen },
    { key: 'commute', label: 'Commute', sub: 'Book a ride',           icon: 'commute', run: onCommute },
  ];
  const current = targets.find((t) => t.key === target) || targets[0];
  const isBounty = current.key === 'bounty';
  const placeholder = isBounty ? 'Ask anything' : `Ask about ${current.label}`;

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    pkHaptic('medium');
    // Bounty handles text through the agent panel; specific targets go to Plan capture.
    if (isBounty && onOpenBounty) {
      try { window.__EVERYDAY_BOUNTY_PRELOAD__ = { text: t }; } catch (e) {}
      onOpenBounty();
    } else {
      onCapture({ mode: 'write', text: t, target: current.key });
    }
    setText('');
  };
  const pickTarget = (k) => {
    pkHaptic('select');
    setTarget(k);
    setModeOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };
  const openTarget = () => {
    if (current.run) { pkHaptic('select'); current.run(); }
  };
  const triggerMode = (m) => {
    pkHaptic('select');
    // Voice/image/upload for Bounty open the Bounty panel where the mic and
    // attachment flow live; specific targets route into the Plan capture pad.
    if (isBounty && onOpenBounty) {
      try { window.__EVERYDAY_BOUNTY_PRELOAD__ = { mode: m }; } catch (e) {}
      onOpenBounty();
    } else {
      onCapture({ mode: m, target: current.key });
    }
  };

  const inlineModes = [
    { key: 'voice',  label: 'Voice',  icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>) },
    { key: 'image',  label: 'Image',  icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-7 7"/></svg>) },
    { key: 'upload', label: 'Upload', icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>) },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas, position: 'relative', overflow: 'hidden' }}>
      {/* Top wordmark — actions live in the global header cluster (top-right) */}
      <div style={{ padding: web ? '24px 40px 0' : '14px 24px 0', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: ink70 }}>Everyday</span>
      </div>

      {/* Centre: greeting + the Ask-anything bar */}
      <div className="pk-stagger" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: web ? '0 28px' : '0 18px', textAlign: 'center' }}>
        <div style={{ fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: ink55, marginBottom: 14 }}>Hello, {everydayFirstName(profile)}</div>
        <div style={{ fontSize: web ? 30 : 26, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.15, color: ink, maxWidth: 320, marginBottom: 30 }}>
          What would you like to do today?
        </div>

        {/* Ask-anything bar */}
        <div style={{ width: '100%', maxWidth: 680, position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: paper, border: `1px solid ${focus ? ink : ink12}`,
            borderRadius: 16, padding: '7px 8px 7px 8px',
            boxShadow: focus ? '0 12px 34px rgba(10,10,10,0.07)' : '0 1px 0 rgba(10,10,10,0.02)',
            transition: 'border-color 180ms ease, box-shadow 180ms ease',
          }}>
            {/* Target selector */}
            <button onClick={() => { pkHaptic('select'); setModeOpen((o) => !o); }} aria-label="Choose destination" aria-haspopup="menu" aria-expanded={modeOpen} style={{ flexShrink: 0, height: 36, padding: '0 8px 0 13px', borderRadius: 999, border: 0, background: ink06, color: ink, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700 }}>
              {current.label}
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: modeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }}><path d="M4 6l4 4 4-4"/></svg>
            </button>

            {/* Open shortcut — only when a specific section is chosen */}
            {!isBounty && (
              <button onClick={openTarget} aria-label={`Open ${current.label}`} style={{ flexShrink: 0, height: 36, padding: '0 12px', borderRadius: 999, border: `1px solid ${ink12}`, background: 'transparent', color: ink, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, transition: 'background 160ms ease, border-color 160ms ease' }}>
                Open
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
              </button>
            )}

            <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
              placeholder={placeholder} enterKeyHint="go"
              style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 0, color: ink, fontFamily: 'inherit', fontSize: 16, fontWeight: 500, padding: '0 6px' }} />

            {/* Inline mode icons — voice / image / upload */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              {inlineModes.map((m) => (
                <button key={m.key} onClick={() => triggerMode(m.key)} aria-label={m.label} title={m.label} style={{ width: 34, height: 34, borderRadius: 999, border: 0, background: 'transparent', color: ink55, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 160ms ease, background 160ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = ink; e.currentTarget.style.background = ink06; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ink55; e.currentTarget.style.background = 'transparent'; }}>
                  {m.icon}
                </button>
              ))}
            </span>

            {/* Send — far right */}
            <button onClick={submit} disabled={!ready} aria-label="Send" style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 999, border: 0, background: ready ? ink : 'transparent', color: ready ? paper : ink25, cursor: ready ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 160ms ease, color 160ms ease' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>

          {/* Destinations popover */}
          {modeOpen && (
            <React.Fragment>
              <div onClick={() => setModeOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div className="pk-rise" style={{ position: 'absolute', top: 56, left: 0, zIndex: 41, minWidth: 260, background: paper, border: `1px solid ${ink12}`, borderRadius: 16, boxShadow: '0 18px 44px rgba(10,10,10,0.16)', padding: '6px', textAlign: 'left' }}>
                {targets.map((t) => {
                  const on = t.key === target;
                  return (
                    <button key={t.key} onClick={() => pickTarget(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 0, background: on ? ink06 : 'transparent', cursor: 'pointer', fontFamily: 'inherit', padding: '10px 10px', borderRadius: 10, transition: 'background 140ms ease' }}
                      onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = ink06; }}
                      onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                      <span style={{ color: ink, display: 'flex', flexShrink: 0 }}>
                        {t.key === 'bounty' ? (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8 9 9 0 0 1-4-1L3 20l1.5-4a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 17 0z"/></svg>
                        ) : (
                          <HomeIcon kind={t.icon} size={17} />
                        )}
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: ink }}>{t.label}</span>
                        <span style={{ display: 'block', fontSize: 11.5, color: ink40, fontWeight: 500, marginTop: 1 }}>{t.sub}</span>
                      </span>
                      {t.key === 'bounty' && <span style={{ marginLeft: 'auto', fontFamily: CC_MONO, fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: ink40, flexShrink: 0 }}>Default</span>}
                    </button>
                  );
                })}
              </div>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '0 28px 26px', textAlign: 'center' }}>
        <span style={{ fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink25 }}>Everyday Joe</span>
      </div>
    </div>
  );
}


// ────────────────────────────── SAVE HOME ──────────────────────────────
// Savings is the hero behaviour. The screen answers, top to bottom:
// how much have I saved · how much has it grown · how much can I access.

function EverydayFunctionScreen({ mode, web, onBack, player, bottomInset = 0, intent, onIntentHandled, isOperator = false }) {
  const modes = {
    shop: {
      title: 'Shop',
      intro: 'Find trusted shops.',
      actions: ['Browse products', 'Saved shops', 'Follow merchants'],
      items: ['Kigali essentials', 'Trusted services', 'Popular stores'],
    },
    pay: {
      title: 'Pay',
      intro: 'Schedule your payments.',
      actions: ['Send Money', 'Schedule Payment', 'Set Automatic Payment'],
      items: ['Rent due 30 Jun', 'School fees', 'Utilities'],
    },
    plan: {
      title: 'Plan',
      intro: 'Plan your day.',
      actions: ['Daily plan', 'Weekly plan', 'Notes'],
      items: ['Morning errands', 'Work block', 'Family follow-up'],
    },
    listen: {
      title: 'Listen',
      intro: 'Listen to your favorite podcasts.',
      actions: ['Continue listening', 'Discover', 'Saved episodes'],
      items: ['Business Rwanda', 'Daily briefing', 'Creator picks'],
    },
    commute: {
      title: 'Commute',
      intro: 'Book vetted rides.',
      actions: ['Request ride', 'Book moto', 'Trip history'],
      items: ['Clean vehicle', 'Preferred drivers', 'Safety checked'],
    },
  };
  const m = modes[mode] || modes.shop;

  if (mode === 'shop') {
    return <ShopScreen web={web} onBack={onBack} isOperator={isOperator} />;
  }
  if (mode === 'plan') {
    return <PlanScreen web={web} onBack={onBack} bottomInset={bottomInset} intent={intent} onIntentHandled={onIntentHandled} />;
  }
  if (mode === 'listen') {
    return <ListenScreen web={web} onBack={onBack} player={player} />;
  }
  if (mode === 'commute') {
    return <CommuteScreen web={web} onBack={onBack} />;
  }
  if (mode === 'pay') {
    return <PayScreen web={web} onBack={onBack} />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
      <ScreenHeader
        left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconBtn onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconBtn>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>{m.title}</span>
        </div>}
      />

      <div className="cc-scroll" style={{
        flex: 1,
        overflow: 'auto',
        padding: web ? '34px 48px 42px' : '18px 20px 28px',
      }}>
        <div style={{ maxWidth: web ? 760 : 'none', margin: web ? '0 auto' : 0 }}>
          <div style={{
            fontSize: web ? 42 : 34,
            fontWeight: 760,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: ink,
          }}>{m.intro}</div>
          <div style={{ marginTop: 12, fontSize: 15, lineHeight: 1.45, color: ink55, maxWidth: 520 }}>
            Choose an action and keep moving. Everyday keeps this workspace focused on the task.
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: web ? 'repeat(3, minmax(0, 1fr))' : '1fr',
            gap: 10,
            marginTop: 28,
          }}>
            {m.actions.map((action, index) => (
              <button key={action} className="pk-calm-action" style={{
                minHeight: 74,
                border: `1px solid ${ink12}`,
                borderRadius: 14,
                background: index === 0 ? ink : paper,
                color: index === 0 ? paper : ink,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 700,
                textAlign: 'left',
                padding: '18px 16px',
              }}>
                {action}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 26, display: 'grid', gap: 10 }}>
            {m.items.map((item) => (
              <div key={item} style={{
                minHeight: 58,
                border: `1px solid ${ink12}`,
                borderRadius: 14,
                background: paper,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}>
                <span style={{ fontSize: 14, fontWeight: 650, color: ink }}>{item}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: ink40 }}>Open</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionShell({ title, web, onBack, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
      <ScreenHeader
        left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconBtn onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconBtn>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>{title}</span>
        </div>}
      />
      <div className="cc-scroll" style={{
        flex: 1,
        overflow: 'auto',
        padding: web ? '28px 44px 38px' : '16px 18px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: web ? 760 : 420, margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Minimal monoline glyphs for the search input modes. Drawn at 24×24 and
// scaled into the 38px control, so each mode reads as an icon rather than a
// bare letter.
const SEARCH_MODE_ICONS = {
  Image: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4.5 17.5l4.5-4 3.5 3 3-2.5 4 3.5" />
    </g>
  ),
  Voice: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="10" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v3.5M9.5 20.5h5" />
    </g>
  ),
  Link: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 14.5l5-5" />
      <path d="M11 7.5l1.2-1.2a3.5 3.5 0 0 1 5 5L16 12.5" />
      <path d="M13 16.5l-1.2 1.2a3.5 3.5 0 0 1-5-5L8 11.5" />
    </g>
  ),
};

function SearchSurface({ value, onChange, placeholder, modes = [] }) {
  return (
    <div style={{
      borderRadius: 24,
      background: 'rgba(255,255,255,0.68)',
      boxShadow: '0 18px 44px rgba(10,10,10,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      padding: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          minWidth: 0,
          flex: 1,
          height: 46,
          border: 0,
          background: 'transparent',
          outline: 0,
          color: ink,
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 650,
          padding: '0 8px',
        }}
      />
      {modes.map((mode) => (
        <button key={mode} title={mode} aria-label={mode} style={{
          width: 38,
          height: 38,
          flexShrink: 0,
          border: 0,
          borderRadius: 14,
          background: mode === 'Voice' ? ink : canvas,
          color: mode === 'Voice' ? paper : ink55,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            {SEARCH_MODE_ICONS[mode] || SEARCH_MODE_ICONS.Image}
          </svg>
        </button>
      ))}
    </div>
  );
}

function ShopScreen({ web, onBack, isOperator = false }) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('All');
  const [catOpen, setCatOpen] = React.useState(false);
  const [shopCount, setShopCount] = React.useState(5);
  const [focus, setFocus] = React.useState(false);
  const [opTab, setOpTab] = React.useState('orders');
  const isOp = isOperator;
  // Live catalog from /api/shop (Go microservice). Falls back to the
  // hardcoded list so the screen still renders before the store hydrates.
  const everyday = window.useEveryday ? window.useEveryday() : null;
  const liveShops = (everyday && everyday.shop && everyday.shop.shops) || [];
  const liveProducts = (everyday && everyday.shop && everyday.shop.products) || [];
  const categories = ['All', 'Men', 'Women', 'Unisex', 'Kids', 'Home decor', 'Cosmetics'];
  const fallbackBrands = [
    { name: 'House of Tayo', cat: 'Women' },
    { name: 'Moshions', cat: 'Men' },
    { name: 'Haute Baso', cat: 'Women' },
    { name: 'Uzi Collections', cat: 'Women' },
    { name: 'Rwanda Clothing', cat: 'Unisex' },
    { name: 'Inzuki Designs', cat: 'Cosmetics' },
    { name: 'Kwanda Goods', cat: 'Home decor' },
    { name: 'Nyamirambo Studio', cat: 'Women' },
    { name: 'Azizi Life', cat: 'Home decor' },
    { name: 'Question Coffee', cat: 'Home decor' },
    { name: 'Kivu Noir', cat: 'Cosmetics' },
    { name: 'Kigali Home', cat: 'Home decor' },
    { name: 'Murukali', cat: 'Unisex' },
    { name: 'Ikirezi Bookshop', cat: 'Kids' },
    { name: 'Bourbon Coffee', cat: 'Home decor' },
    { name: 'Kigali Farmers Market', cat: 'Home decor' },
    { name: 'Simba Supermarket', cat: 'Home decor' },
    { name: 'Amahoro Market', cat: 'Unisex' },
  ];
  // Prefer live shops from Supabase. Fall back to the curated list so the
  // grid never goes empty in dev / cold-load / offline.
  const brands = liveShops.length
    ? liveShops.map((s) => ({ id: s.id, name: s.name, cat: s.category }))
    : fallbackBrands;
  const q = query.trim().toLowerCase();
  const visible = brands.filter((b) =>
    (category === 'All' || b.cat === category) &&
    (!q || b.name.toLowerCase().includes(q)));
  const shown = visible.slice(0, shopCount);
  const catShown = catOpen ? categories : categories.slice(0, 4);
  const selectCat = (c) => { pkHaptic('select'); setCategory(c); setShopCount(5); };
  const onSearch = (v) => { setQuery(v); setShopCount(5); };

  // Operator orders feed is not in the schema yet — kept as a placeholder so
  // the operator UI still renders. Wire to /api/shop/orders when that endpoint lands.
  const opOrders = [
    { id: 'ORD-1042', customer: 'Alice M.', items: 2, total: '18,500 RWF', status: 'New', time: '12 min ago' },
    { id: 'ORD-1041', customer: 'Jean-Paul K.', items: 1, total: '7,200 RWF', status: 'Preparing', time: '34 min ago' },
    { id: 'ORD-1040', customer: 'Grace U.', items: 3, total: '31,000 RWF', status: 'Ready', time: '1h ago' },
    { id: 'ORD-1039', customer: 'David N.', items: 1, total: '12,800 RWF', status: 'Delivered', time: '3h ago' },
    { id: 'ORD-1038', customer: 'Claudine I.', items: 4, total: '45,600 RWF', status: 'Delivered', time: '5h ago' },
  ];
  const fallbackOpProducts = [
    { id: null, name: 'Ankara Wrap Dress', stock: 12, price: '14,500 RWF', sold: 38 },
    { id: null, name: 'Kitenge Headwrap', stock: 3, price: '4,200 RWF', sold: 91 },
    { id: null, name: 'Handwoven Basket Bag', stock: 0, price: '18,000 RWF', sold: 24 },
    { id: null, name: 'Beaded Statement Necklace', stock: 7, price: '8,500 RWF', sold: 56 },
    { id: null, name: 'Organic Shea Butter Set', stock: 19, price: '6,800 RWF', sold: 112 },
  ];
  const opProducts = liveProducts.length
    ? liveProducts.map((pr) => ({
        id: pr.id,
        name: pr.name,
        stock: pr.stock,
        price: fmtRWF(pr.price_rwf) || (pr.price_rwf + ' RWF'),
        sold: pr.sold,
      }))
    : fallbackOpProducts;
  const statusColor = (s) => ({ New: '#2D7FF9', Preparing: '#E5A100', Ready: '#18A957', Delivered: ink40 }[s] || ink40);

  if (isOp) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        <ScreenHeader left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconBtn onClick={onBack}><svg width="16" height="16" viewBox="0 0 16 16"><path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></IconBtn>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>Shop</span>
        </div>} />

        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: web ? '20px 44px 96px' : '14px 18px 96px' }}>
          <div style={{ width: '100%', maxWidth: web ? 760 : 420, margin: '0 auto' }}>
            <div style={{ fontSize: web ? 40 : 32, fontWeight: 840, letterSpacing: '-0.05em', lineHeight: 1, color: ink }}>Your shop.</div>
            <div style={{ fontSize: 14, color: ink55, marginTop: 8, fontWeight: 600 }}>House of Tayo · Kigali, Rwanda</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 24 }}>
              {[
                { label: 'Today', value: '3', sub: 'orders' },
                { label: 'Revenue', value: '56.7K', sub: 'RWF today' },
                { label: 'Low stock', value: '2', sub: 'items' },
              ].map((s) => (
                <div key={s.label} style={{ padding: '14px 12px', borderRadius: 14, border: `1px dashed ${DASH}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: ink, letterSpacing: '-0.03em' }}>{s.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: ink40, marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 28, marginBottom: 16 }}>
              {['orders', 'products'].map((t) => {
                const on = opTab === t;
                return (
                  <button key={t} onClick={() => { pkHaptic('select'); setOpTab(t); }} style={{ height: 34, padding: '0 16px', borderRadius: 999, border: on ? 0 : `1px solid ${ink12}`, background: on ? ink : 'transparent', color: on ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, textTransform: 'capitalize' }}>{t}</button>
                );
              })}
            </div>

            {opTab === 'orders' && opOrders.map((o, i) => (
              <button key={o.id} style={{ width: '100%', border: 0, borderTop: i === 0 ? 'none' : `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: ink, letterSpacing: '-0.01em' }}>{o.customer}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: statusColor(o.status), background: statusColor(o.status) + '18', padding: '2px 8px', borderRadius: 999 }}>{o.status}</span>
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: ink40, marginTop: 3 }}>{o.id} · {o.items} item{o.items > 1 ? 's' : ''} · {o.total} · {o.time}</span>
                </span>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={ink25} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
              </button>
            ))}

            {opTab === 'products' && (
              <React.Fragment>
                {opProducts.map((p, i) => (
                  <button key={p.name} style={{ width: '100%', border: 0, borderTop: i === 0 ? 'none' : `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15.5, fontWeight: 700, color: ink, letterSpacing: '-0.01em' }}>{p.name}</span>
                        {p.stock === 0 && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#E5393580', background: '#E5393512', padding: '2px 8px', borderRadius: 999 }}>Out of stock</span>}
                        {p.stock > 0 && p.stock <= 5 && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#E5A100', background: '#E5A10012', padding: '2px 8px', borderRadius: 999 }}>Low</span>}
                      </span>
                      <span style={{ display: 'block', fontSize: 12, color: ink40, marginTop: 3 }}>{p.price} · {p.stock} in stock · {p.sold} sold</span>
                    </span>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={ink25} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
                  </button>
                ))}
                <button style={{ width: '100%', marginTop: 12, height: 44, borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 999, background: ink, color: paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                  Add product
                </button>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
      <ScreenHeader left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBtn onClick={onBack}><svg width="16" height="16" viewBox="0 0 16 16"><path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></IconBtn>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>Shop</span>
      </div>} />

      <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: web ? '20px 44px 96px' : '14px 18px 96px' }}>
        <div style={{ width: '100%', maxWidth: web ? 760 : 420, margin: '0 auto' }}>
          <div style={{ fontSize: web ? 40 : 32, fontWeight: 840, letterSpacing: '-0.05em', lineHeight: 1, color: ink }}>Find trusted shops.</div>

          {/* Categories — expandable with a + */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
            {catShown.map((cat) => {
              const on = cat === category;
              return (
                <button key={cat} onClick={() => selectCat(cat)} style={{ height: 36, padding: '0 14px', borderRadius: 999, border: on ? '0' : `1px solid ${ink12}`, background: on ? ink : 'transparent', color: on ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{cat}</button>
              );
            })}
            {categories.length > 4 && (
              <button onClick={() => setCatOpen((o) => !o)} aria-label={catOpen ? 'Fewer categories' : 'More categories'} style={{ height: 36, width: 36, borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" style={{ transform: catOpen ? 'rotate(45deg)' : 'none', transition: 'transform 200ms ease' }}><path d="M12 5v14M5 12h14"/></svg>
              </button>
            )}
          </div>

          {/* Stores — five at a time */}
          <div style={{ marginTop: 22 }}>
            {visible.length === 0 && (<div style={{ padding: '20px 0', fontSize: 13, color: ink55 }}>No shops match your search.</div>)}
            {shown.map((brand, index) => (
              <button key={brand.name} style={{ width: '100%', border: 0, borderTop: index === 0 ? 'none' : `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, color: ink, letterSpacing: '-0.01em' }}>{brand.name}</span>
                  <span style={{ display: 'block', fontSize: 12, color: ink40, marginTop: 2 }}>{index % 2 ? 'Fashion · trusted' : 'Local · verified'}</span>
                </span>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={ink25} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
              </button>
            ))}
            {shopCount < visible.length && (
              <button onClick={() => { pkHaptic('select'); setShopCount((c) => c + 5); }} style={{ width: '100%', marginTop: 12, height: 44, borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, background: ink, color: paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </span>
                See more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search — pinned to the bottom */}
      <div style={{ flexShrink: 0, padding: web ? '12px 44px 16px' : '10px 18px max(12px, env(safe-area-inset-bottom, 12px))', borderTop: `1px dashed ${DASH}`, background: canvas }}>
        <div className="pk-field" style={{ width: '100%', maxWidth: web ? 760 : 420, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: `2px ${focus ? 'solid' : 'dashed'} ${focus ? ink : ink25}`, transition: 'border-color 200ms ease' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ink40} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            <input value={query} onChange={(e) => onSearch(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder="Search shops or products" style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 0, color: ink, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, padding: 0 }} />
            <span style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {['Image', 'Voice', 'Link'].map((mode) => (
                <span key={mode} title={mode} aria-label={mode} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink40 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">{SEARCH_MODE_ICONS[mode]}</svg>
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Turn a free-text brain-dump into a simple time-blocked plan. No backend —
// a deterministic transform that splits the input into tasks and lays them
// out across the day.
function generateDayPlan(text) {
  const parts = text.split(/[\n.,;]+/).map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return [];
  let h = 8;
  return parts.slice(0, 8).map((p) => {
    const time = String(h).padStart(2, '0') + ':00';
    h = h + 2 > 20 ? 8 : h + 2;
    return { time, task: p.charAt(0).toUpperCase() + p.slice(1) };
  });
}

// ─────────────────────────────── PLAN ───────────────────────────────
// Plan is the brain of Everyday: a calm, private place to keep thoughts,
// plans, goals, notes, voice memos and documents. Kept as the existing
// two-pane workspace (collapsible rail + canvas, de-carded dashed style);
// the rail now organizes Folders and the canvas holds Files. What the user
// captures quietly informs the rest of the app (the Insights view).

const PLAN_FOLDERS_0 = [
  { id: 'personal', name: 'Personal', icon: 'user' },
  { id: 'work', name: 'Work', icon: 'work' },
  { id: 'finance', name: 'Finance', icon: 'wallet' },
  { id: 'ideas', name: 'Ideas', icon: 'bulb' },
];
const PLAN_FILES_0 = [
  { id: 'pf1', folderId: 'finance', title: 'Savings goal — RWF 1.5M by December', body: 'Put aside RWF 120,000 each month. Cut back on eating out. Keep the emergency fund untouched. This covers school fees and a laptop.', updated: 1781000000000, attachments: [], voice: [] },
  { id: 'pf2', folderId: 'work', title: 'Q3 priorities', body: 'Ship the retail report. Weekly founder calls. Prep the markets brief. Meeting Tuesday 9am at Kigali Heights.', updated: 1781050000000, attachments: [], voice: [] },
  { id: 'pf3', folderId: 'personal', title: 'This weekend', body: 'Groceries at Kimironko market. Visit family in Nyamirambo. Try that podcast about building a loyal audience.', updated: 1781090000000, attachments: [], voice: [] },
  { id: 'pf4', folderId: 'ideas', title: 'App ideas', body: 'A calm place to keep everything in one spot. Voice notes that turn into searchable text. Let the app suggest a ride before a meeting.', updated: 1781120000000, attachments: [], voice: [] },
];

const PLAN_NEW_FOLDER_ICONS = ['user', 'work', 'wallet', 'bulb', 'plane', 'family', 'health', 'folder'];
function planId(p) { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

function FolderIcon({ kind, size = 16, color }) {
  const c = color || 'currentColor';
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'user')   return (<svg {...p}><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>);
  if (kind === 'work')   return (<svg {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
  if (kind === 'wallet') return (<svg {...p}><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18"/></svg>);
  if (kind === 'bulb')   return (<svg {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.6.6-1 1.2-1 2H9c0-.8-.4-1.4-1-2A6 6 0 0 1 12 3z"/></svg>);
  if (kind === 'plane')  return (<svg {...p}><path d="M10 14L3 12l2-3 5 1 4-6 2 1-2 7 4 4-1 2-5-2-3 4-2-1z"/></svg>);
  if (kind === 'family') return (<svg {...p}><path d="M12 20s-6-4-6-9a4 4 0 0 1 6-2 4 4 0 0 1 6 2c0 5-6 9-6 9z"/></svg>);
  if (kind === 'health') return (<svg {...p}><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>);
  return (<svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>);
}

function planMatch(f, q) {
  if (!q) return false;
  const hay = [f.title, f.body, ...(f.voice || []).map((v) => v.transcript), ...(f.attachments || []).map((a) => a.name)].join(' ').toLowerCase();
  return hay.includes(q.toLowerCase());
}

// Quietly derive context from everything captured — this is what makes the rest
// of the app smarter. Honest, lightweight keyword signals.
function planInsights(files) {
  const text = files.map((f) => `${f.title} ${f.body} ${(f.voice || []).map((v) => v.transcript).join(' ')}`).join(' \n ').toLowerCase();
  const out = [];
  const has = (re) => re.test(text);
  if (has(/sav(e|ings|ing)|emergency fund|goal|rwf|budget/)) out.push({ section: 'Save', hue: '#2FAE9B', text: 'Tracking a savings goal — Save can suggest opportunities and surface progress.' });
  if (has(/meeting|\d\s?am|\d\s?pm|kigali heights|nyamirambo|route|airport|commute/)) out.push({ section: 'Commute', hue: '#3B82F6', text: 'You have places to be — Commute can suggest a departure time and a ride before each one.' });
  if (has(/groceries|kimironko|market|buy|laptop|shop|brand/)) out.push({ section: 'Shop', hue: '#A37BF2', text: 'Noticed shopping plans — Shop can surface trusted stores within your budget.' });
  if (has(/podcast|listen|audience|episode|channel/)) out.push({ section: 'Listen', hue: '#5B7CFA', text: 'You write about audio topics — Listen can recommend matching episodes.' });
  return out;
}

function PlanAttachmentIcon({ kind, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'image') return (<svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5L5 20"/></svg>);
  if (kind === 'voice') return (<svg {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>);
  return (<svg {...p}><path d="M14 3v5h5M7 3h8l5 5v13H7z"/></svg>);
}

function ccProfileLanguage() {
  const raw = PKStore.get('profile_language', 'en');
  const value = String(raw || 'en').toLowerCase();
  return (value === 'rw' || value === 'kinyarwanda') ? 'rw' : 'en';
}

// Local voice base URL. Frontend prefers env override (set on Vercel via
// NEXT_PUBLIC_VOICE_BASE for a tunneled service). Falls back to the local Go
// service at 127.0.0.1:8787 which only works when the user has it running.
function ccVoiceBase() {
  try {
    if (typeof window !== 'undefined' && window.__EVERYDAY_VOICE_BASE__) {
      return String(window.__EVERYDAY_VOICE_BASE__).replace(/\/$/, '');
    }
  } catch (e) {}
  return 'http://127.0.0.1:8787';
}

// One-shot reachability probe — used to gate UI like the mic button and show
// a clear "Local voice offline" banner instead of a silent 'Failed to fetch'.
let _voiceReachableCache = null;
async function ccVoiceReachable(force) {
  if (!force && _voiceReachableCache !== null) return _voiceReachableCache;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(ccVoiceBase() + '/health', { signal: ctrl.signal });
    clearTimeout(t);
    _voiceReachableCache = res.ok;
  } catch (e) {
    _voiceReachableCache = false;
  }
  return _voiceReachableCache;
}

async function ccTranscribeVoice(blob) {
  if (!blob) throw new Error('No audio was captured.');
  const language = ccProfileLanguage();
  const form = new FormData();
  const ext = blob.type && blob.type.includes('ogg') ? 'ogg' : blob.type && blob.type.includes('wav') ? 'wav' : 'webm';
  form.append('audio', blob, `everyday-voice.${ext}`);
  form.append('language', language);
  let res;
  try {
    res = await fetch(ccVoiceBase() + '/api/voice/transcribe', { method: 'POST', body: form });
  } catch (e) {
    _voiceReachableCache = false;
    throw new Error('Local voice service is offline. Start it on your machine to use the microphone.');
  }
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) {
    const msg = data && data.error ? data.error : 'Voice transcription failed.';
    throw new Error(msg);
  }
  if (!data || !data.text) throw new Error('Voice transcription returned no text.');
  return data;
}

async function ccSendBountyMessage(message, history) {
  let res;
  try {
    res = await fetch(ccVoiceBase() + '/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        language: ccProfileLanguage(),
        history: (history || []).slice(-8).map((m) => ({ role: m.role, text: m.text })),
      }),
    });
  } catch (e) {
    _voiceReachableCache = false;
    throw new Error('Bounty runs on a local service that is not reachable right now. Start it on your machine to chat.');
  }
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) {
    const msg = data && data.error ? data.error : 'Bounty is not available.';
    throw new Error(msg);
  }
  if (!data || !data.text) throw new Error('Bounty returned no response.');
  return data;
}

function PlanScreen({ web, onBack, bottomInset = 0, intent, onIntentHandled }) {
  const [folders, setFolders] = usePersisted('plan_folders', PLAN_FOLDERS_0);
  const [files, setFiles] = usePersisted('plan_files', PLAN_FILES_0);
  const [activeFolder, setActiveFolder] = React.useState(() => (PLAN_FOLDERS_0[0] && PLAN_FOLDERS_0[0].id));
  const [view, setView] = React.useState('files'); // files · editor · insights · trash
  const [openId, setOpenId] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [railOpen, setRailOpen] = React.useState(true);
  const [fabOpen, setFabOpen] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [renamingId, setRenamingId] = React.useState(null);
  const [movePicker, setMovePicker] = React.useState(false);
  const [undo, setUndo] = React.useState(null);    // { file }
  const [err, setErr] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const fileInputRef = React.useRef(null);
  const planRemoteReadyRef = React.useRef(false);
  const planHydratingRef = React.useRef(true);
  const planSaveTimerRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    const fallback = setTimeout(() => {
      if (!cancelled && planHydratingRef.current) {
        planHydratingRef.current = false;
        setLoading(false);
      }
    }, 520);
    const loadPlan = async () => {
      if (!window.EverydayAPI || !window.EverydayAPI.planService) {
        planHydratingRef.current = false;
        setLoading(false);
        return;
      }
      try {
        const data = await window.EverydayAPI.planService.list();
        if (cancelled || !data) return;
        if (Array.isArray(data.folders) && data.folders.length) {
          setFolders(data.folders);
          setActiveFolder((cur) => data.folders.find((f) => f.id === cur) ? cur : data.folders[0].id);
        }
        if (Array.isArray(data.files)) setFiles(data.files);
        planRemoteReadyRef.current = true;
      } catch (e) {
        if (!cancelled) {
          setErr('Plan is saving locally until your account is connected.');
          setTimeout(() => setErr(''), 3600);
        }
      } finally {
        if (!cancelled) {
          clearTimeout(fallback);
          planHydratingRef.current = false;
          setLoading(false);
        }
      }
    };
    loadPlan();
    return () => {
      cancelled = true;
      clearTimeout(fallback);
      if (planSaveTimerRef.current) clearTimeout(planSaveTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (planHydratingRef.current || !planRemoteReadyRef.current) return;
    if (!window.EverydayAPI || !window.EverydayAPI.planService) return;
    if (planSaveTimerRef.current) clearTimeout(planSaveTimerRef.current);
    planSaveTimerRef.current = setTimeout(async () => {
      try {
        await window.EverydayAPI.planService.save(folders, files);
      } catch (e) {
        setErr('Could not sync Plan yet. Your changes are still on this device.');
        setTimeout(() => setErr(''), 3600);
      }
    }, 700);
  }, [folders, files]);

  // When the rail is collapsed, the folder icons float in, then fade after 3s —
  // the open/close toggle always stays.
  const [railIcons, setRailIcons] = React.useState(false);
  React.useEffect(() => {
    if (railOpen) { setRailIcons(false); return; }
    setRailIcons(true);
    const id = setTimeout(() => setRailIcons(false), 3000);
    return () => clearTimeout(id);
  }, [railOpen]);

  // One-shot capture intent handed in from the Home "Ask anything" bar.
  React.useEffect(() => {
    if (!intent) return;
    if (intent.mode === 'open' && intent.openId) {
      setOpenId(intent.openId); setView('editor');
    } else {
      const id = planId('pf');
      const file = { id, folderId: activeFolder, title: '', body: intent.text || '', updated: Date.now(), attachments: [], voice: [] };
      setFiles((listv) => [file, ...listv]);
      setOpenId(id); setView('editor'); setMovePicker(false);
      if (intent.mode === 'voice') setTimeout(() => setRecording(true), 80);
      if (intent.mode === 'image' || intent.mode === 'upload') setTimeout(() => fileInputRef.current && fileInputRef.current.click(), 140);
    }
    onIntentHandled && onIntentHandled();
  }, [intent]);

  const live = files.filter((f) => !f.trashed);
  const trashed = files.filter((f) => f.trashed);
  const folderFiles = live.filter((f) => f.folderId === activeFolder).sort((a, b) => b.updated - a.updated);
  const searchHits = query.trim() ? live.filter((f) => planMatch(f, query.trim())) : [];
  const openFile = files.find((f) => f.id === openId) || null;
  const fileCount = (fid) => live.filter((f) => f.folderId === fid).length;
  const folderName = (fid) => { const f = folders.find((x) => x.id === fid); return f ? f.name : '—'; };
  const insights = planInsights(live);

  const touch = (id, patch) => setFiles((list) => list.map((f) => (f.id === id ? { ...f, ...patch, updated: Date.now() } : f)));

  const selectFolder = (id) => { pkHaptic('select'); setActiveFolder(id); setView('files'); setQuery(''); };
  const openEditor = (f) => { pkHaptic('select'); setOpenId(f.id); setView('editor'); setMovePicker(false); };
  const createNote = (folderId) => {
    const id = planId('pf');
    const file = { id, folderId: folderId || activeFolder, title: '', body: '', updated: Date.now(), attachments: [], voice: [] };
    setFiles((list) => [file, ...list]);
    setOpenId(id); setView('editor'); setFabOpen(false); pkHaptic('select');
  };
  const addFolder = () => {
    const id = planId('fl');
    const icon = PLAN_NEW_FOLDER_ICONS[folders.length % PLAN_NEW_FOLDER_ICONS.length];
    setFolders((list) => [...list, { id, name: 'New folder', icon }]);
    setActiveFolder(id); setView('files'); setRenamingId(id); pkHaptic('select');
  };
  const renameFolder = (id, name) => setFolders((list) => list.map((f) => (f.id === id ? { ...f, name: name || 'Untitled' } : f)));
  const deleteFolder = (id) => {
    if (folders.length <= 1) return;
    setFiles((list) => list.map((f) => (f.folderId === id ? { ...f, trashed: true } : f)));
    setFolders((list) => list.filter((f) => f.id !== id));
    setActiveFolder((cur) => (cur === id ? folders.find((f) => f.id !== id).id : cur));
    setView('files'); pkHaptic('medium');
  };
  const trashFile = (id) => {
    const f = files.find((x) => x.id === id);
    setFiles((list) => list.map((x) => (x.id === id ? { ...x, trashed: true } : x)));
    setView('files'); setOpenId(null); setUndo({ file: f }); pkHaptic('medium');
    setTimeout(() => setUndo((u) => (u && u.file.id === id ? null : u)), 5000);
  };
  const restoreFile = (id) => { setFiles((list) => list.map((x) => (x.id === id ? { ...x, trashed: false } : x))); setUndo(null); pkHaptic('select'); };
  const purgeFile = (id) => setFiles((list) => list.filter((x) => x.id !== id));
  const moveFile = (id, folderId) => { touch(id, { folderId }); setMovePicker(false); pkHaptic('select'); };

  const onPickAttachment = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || !openFile) return;
    if (file.size > 2 * 1024 * 1024) { setErr('That file is over 2 MB — attach a smaller one.'); setTimeout(() => setErr(''), 3500); return; }
    const kind = file.type.startsWith('image/') ? 'image' : 'doc';
    const att = { id: planId('at'), name: file.name, kind, size: file.size, url: kind === 'image' ? URL.createObjectURL(file) : null };
    touch(openFile.id, { attachments: [...(openFile.attachments || []), att] });
    pkHaptic('success');
  };
  const removeAttachment = (aid) => touch(openFile.id, { attachments: (openFile.attachments || []).filter((a) => a.id !== aid) });

  const saveVoice = async (sec, blob) => {
    const result = await ccTranscribeVoice(blob);
    const transcript = result.text;
    let target = openFile;
    if (!target) {
      const id = planId('pf');
      target = { id, folderId: activeFolder, title: 'Voice note', body: '', updated: Date.now(), attachments: [], voice: [] };
      setFiles((list) => [target, ...list]); setOpenId(id); setView('editor');
    }
    const nextBody = (target.body || '').trim() ? target.body : transcript;
    const v = { id: planId('vn'), dur: sec, transcript, language: result.language, model: result.model };
    setFiles((list) => list.map((f) => (f.id === target.id ? { ...f, body: nextBody, voice: [...(f.voice || []), v], title: f.title || 'Voice note', updated: Date.now() } : f)));
    setRecording(false);
    pkHaptic('success');
  };

  const header = (
    <ScreenHeader left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <IconBtn onClick={onBack}><svg width="16" height="16" viewBox="0 0 16 16"><path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></IconBtn>
      <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>Plan</span>
    </div>} />
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas, position: 'relative' }}>
      {header}

      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: railOpen ? (web ? 22 : 14) : 12, padding: web ? '14px 28px 0' : '8px 16px 0' }}>
        {/* Left rail — folders only */}
        <div style={{ width: railOpen ? (web ? 200 : 128) : 30, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: `1px dashed ${DASH}`, paddingRight: railOpen ? (web ? 18 : 12) : 0, transition: 'width 220ms ease' }}>
          {railOpen ? (
            <React.Fragment>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0 10px' }}>
                <span style={{ fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: ink40 }}>Folders</span>
                <button onClick={() => setRailOpen(false)} aria-label="Hide folders" style={{ border: 0, background: 'transparent', color: ink40, cursor: 'pointer', padding: 2, display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
                </button>
              </div>

              {/* Insights — the intelligence layer, pinned above folders */}
              <button onClick={() => { pkHaptic('select'); setView('insights'); }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', border: 0, background: view === 'insights' ? ink : 'transparent', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', padding: '9px 8px', marginBottom: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={view === 'insights' ? paper : ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 1 4 10.5c-.6.6-1 1.2-1 2H9c0-.8-.4-1.4-1-2A6 6 0 0 1 12 3zM9 18h6M10 21h4"/></svg>
                <span style={{ fontSize: 12.5, fontWeight: 760, color: view === 'insights' ? paper : ink }}>Insights</span>
                {insights.length > 0 && <span style={{ marginLeft: 'auto', fontFamily: CC_MONO, fontSize: 10, fontWeight: 700, color: view === 'insights' ? paper : ink40 }}>{insights.length}</span>}
              </button>

              <button onClick={addFolder} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 760, color: ink, padding: '0 0 10px' }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, background: ink, color: paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </span>
                New folder
              </button>

              <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                {folders.map((fl, idx) => {
                  const on = fl.id === activeFolder && view !== 'insights' && view !== 'trash';
                  if (renamingId === fl.id) {
                    return (
                      <div key={fl.id} style={{ padding: '9px 0', borderTop: idx === 0 ? 'none' : `1px dashed ${DASH}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FolderIcon kind={fl.icon} size={15} color={ink55} />
                        <input autoFocus defaultValue={fl.name} onBlur={(e) => { renameFolder(fl.id, e.target.value.trim()); setRenamingId(null); }} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                          style={{ flex: 1, minWidth: 0, border: 0, borderBottom: `1.5px solid ${ink}`, background: 'transparent', outline: 0, color: ink, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '2px 0' }} />
                      </div>
                    );
                  }
                  return (
                    <div key={fl.id} style={{ borderTop: idx === 0 ? 'none' : `1px dashed ${DASH}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => selectFolder(fl.id)} style={{ flex: 1, minWidth: 0, textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', padding: '11px 0', display: 'flex', gap: 9, alignItems: 'center' }}>
                        <FolderIcon kind={fl.icon} size={15} color={on ? ink : ink55} />
                        <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: on ? 760 : 600, color: on ? ink : ink70, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fl.name}</span>
                        <span style={{ fontFamily: CC_MONO, fontSize: 10.5, color: ink40, flexShrink: 0 }}>{fileCount(fl.id)}</span>
                      </button>
                      {on && (
                        <span style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          <button onClick={() => setRenamingId(fl.id)} aria-label="Rename folder" style={{ border: 0, background: 'transparent', color: ink40, cursor: 'pointer', padding: 3, display: 'flex' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L18 10l-4-4L4 16z"/></svg>
                          </button>
                          {folders.length > 1 && (
                            <button onClick={() => deleteFolder(fl.id)} aria-label="Delete folder" style={{ border: 0, background: 'transparent', color: ink40, cursor: 'pointer', padding: 3, display: 'flex' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>
                            </button>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}

                {trashed.length > 0 && (
                  <button onClick={() => { pkHaptic('select'); setView('trash'); }} style={{ width: '100%', textAlign: 'left', border: 0, borderTop: `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', padding: '11px 0', display: 'flex', gap: 9, alignItems: 'center', marginTop: 4 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={view === 'trash' ? ink : ink40} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>
                    <span style={{ fontSize: 12.5, fontWeight: view === 'trash' ? 760 : 600, color: view === 'trash' ? ink : ink55 }}>Recently deleted</span>
                    <span style={{ marginLeft: 'auto', fontFamily: CC_MONO, fontSize: 10.5, color: ink40 }}>{trashed.length}</span>
                  </button>
                )}
              </div>
            </React.Fragment>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Open/close toggle — always stays */}
              <button onClick={() => setRailOpen(true)} aria-label="Show folders" style={{ border: 0, background: 'transparent', color: ink55, cursor: 'pointer', padding: '4px 0', display: 'flex', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
              </button>
              {/* Floating function icons — fade out after 3s; tap to jump */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 12, opacity: railIcons ? 1 : 0, transform: railIcons ? 'none' : 'translateY(-6px)', transition: 'opacity 400ms ease, transform 400ms ease', pointerEvents: railIcons ? 'auto' : 'none' }}>
                <button onClick={() => { pkHaptic('select'); setView('insights'); }} aria-label="Insights" title="Insights" style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 3, display: 'flex', color: view === 'insights' ? ink : ink55 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 1 4 10.5c-.6.6-1 1.2-1 2H9c0-.8-.4-1.4-1-2A6 6 0 0 1 12 3zM9 18h6M10 21h4"/></svg>
                </button>
                {folders.map((fl) => {
                  const on = fl.id === activeFolder && view !== 'insights' && view !== 'trash';
                  return (
                    <button key={fl.id} onClick={() => selectFolder(fl.id)} aria-label={fl.name} title={fl.name} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 3, display: 'flex' }}>
                      <FolderIcon kind={fl.icon} size={17} color={on ? ink : ink55} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main canvas */}
        <div className="cc-scroll" style={{ flex: 1, minWidth: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: (view === 'files' ? 150 : 96) + bottomInset }}>
          {/* ── INSIGHTS ── */}
          {view === 'insights' ? (
            <div className="pk-stagger">
              <div style={{ fontSize: web ? 26 : 22, fontWeight: 800, letterSpacing: '-0.02em', color: ink }}>What Everyday understands</div>
              <div style={{ marginTop: 6, fontSize: 13, color: ink55, lineHeight: 1.5 }}>The more you keep here, the more the rest of the app can quietly help. Nothing leaves your space.</div>
              <div style={{ marginTop: 20 }}>
                {insights.length === 0 ? (
                  <div style={{ padding: '30px 0', fontSize: 13.5, color: ink40 }}>Write a few notes and goals — helpful context will appear here.</div>
                ) : insights.map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '15px 0', borderTop: i === 0 ? 'none' : `1px dashed ${DASH}`, alignItems: 'flex-start' }}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: it.hue + '1F', color: it.hue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: CC_MONO, fontSize: 10, fontWeight: 800 }}>{it.section[0]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: CC_MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: it.hue, fontWeight: 700 }}>Helps {it.section}</div>
                      <div style={{ fontSize: 13.5, color: ink, marginTop: 3, lineHeight: 1.45 }}>{it.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : view === 'trash' ? (
            /* ── RECENTLY DELETED ── */
            <div>
              <div style={{ fontSize: web ? 26 : 22, fontWeight: 800, letterSpacing: '-0.02em', color: ink }}>Recently deleted</div>
              <div style={{ marginTop: 6, fontSize: 13, color: ink55 }}>Restore a note, or remove it for good.</div>
              <div style={{ marginTop: 16 }}>
                {trashed.map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: i === 0 ? 'none' : `1px dashed ${DASH}` }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 650, color: ink70, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title || 'Untitled note'} <span style={{ color: ink40, fontWeight: 500 }}>· {folderName(f.folderId)}</span></span>
                    <button onClick={() => restoreFile(f.id)} style={{ flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>Restore</button>
                    <button onClick={() => purgeFile(f.id)} aria-label="Delete forever" style={{ flexShrink: 0, border: 0, background: 'transparent', color: ink40, cursor: 'pointer', padding: 4, display: 'flex' }}>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                    </button>
                  </div>
                ))}
                {trashed.length === 0 && <div style={{ padding: '24px 0', fontSize: 13, color: ink40 }}>Nothing here.</div>}
              </div>
            </div>
          ) : view === 'editor' && openFile ? (
            /* ── FILE EDITOR ── */
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => { setView('files'); setOpenId(null); }} aria-label="Back to files" style={{ border: 0, background: 'transparent', color: ink, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700 }}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
                </button>
                <button onClick={() => setMovePicker((m) => !m)} style={{ border: `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, color: ink55, padding: '5px 11px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FolderIcon kind={(folders.find((x) => x.id === openFile.folderId) || {}).icon} size={12} color={ink55} />
                  {folderName(openFile.folderId)}
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4.5L6 7.5l3-3"/></svg>
                </button>
                <span style={{ marginLeft: 'auto', fontFamily: CC_MONO, fontSize: 10, color: ink40, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2FAE9B' }} />Saved
                </span>
                <button onClick={() => trashFile(openFile.id)} aria-label="Delete note" style={{ border: 0, background: 'transparent', color: ink40, cursor: 'pointer', padding: 4, display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>
                </button>
              </div>

              {movePicker && (
                <div className="pk-rise" style={{ marginTop: 10, padding: '8px 10px', border: `1px dashed ${DASH}`, borderRadius: 12 }}>
                  <div style={{ fontFamily: CC_MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink40, padding: '2px 2px 6px' }}>Move to</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {folders.map((fl) => {
                      const on = fl.id === openFile.folderId;
                      return <button key={fl.id} onClick={() => moveFile(openFile.id, fl.id)} style={{ height: 32, padding: '0 12px', borderRadius: 999, border: on ? '0' : `1px dashed ${DASH}`, background: on ? ink : 'transparent', color: on ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><FolderIcon kind={fl.icon} size={12} color={on ? paper : ink55} />{fl.name}</button>;
                    })}
                  </div>
                </div>
              )}

              <input value={openFile.title} onChange={(e) => touch(openFile.id, { title: e.target.value })} placeholder="Title"
                style={{ marginTop: 16, border: 0, background: 'transparent', outline: 0, color: ink, fontFamily: 'inherit', fontSize: web ? 26 : 22, fontWeight: 820, letterSpacing: '-0.02em', padding: 0, width: '100%' }} />

              <textarea value={openFile.body} onChange={(e) => touch(openFile.id, { body: e.target.value })} placeholder="Write freely — thoughts, plans, goals, anything worth remembering…"
                style={{ marginTop: 12, flex: 1, minHeight: web ? 180 : 130, resize: 'none', border: 0, background: 'transparent', outline: 0, color: ink, fontFamily: 'inherit', fontSize: 16, fontWeight: 500, lineHeight: 1.6, padding: 0, width: '100%' }} />

              {/* Voice notes */}
              {(openFile.voice || []).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: CC_MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink40, paddingBottom: 6 }}>Voice notes</div>
                  {openFile.voice.map((v) => (
                    <div key={v.id} style={{ display: 'flex', gap: 11, padding: '11px 0', borderTop: `1px dashed ${DASH}`, alignItems: 'flex-start' }}>
                      <span style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: ink06, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlanAttachmentIcon kind="voice" size={15} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: CC_MONO, fontSize: 11, color: ink55 }}>Voice · {ccFmtTime(v.dur)}</div>
                        <div style={{ fontSize: 13, color: ink70, marginTop: 3, lineHeight: 1.45 }}>{v.transcript}</div>
                      </div>
                      <button onClick={() => touch(openFile.id, { voice: openFile.voice.filter((x) => x.id !== v.id) })} aria-label="Remove voice note" style={{ border: 0, background: 'transparent', color: ink40, cursor: 'pointer', padding: 3, display: 'flex', flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Attachments */}
              {(openFile.attachments || []).length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontFamily: CC_MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink40, paddingBottom: 8 }}>Attachments</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {openFile.attachments.map((a) => (
                      <div key={a.id} style={{ width: 88, position: 'relative' }}>
                        <div style={{ width: 88, height: 72, borderRadius: 12, overflow: 'hidden', background: ink06, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink55, border: `1px dashed ${DASH}` }}>
                          {a.kind === 'image' && a.url ? <img src={a.url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <PlanAttachmentIcon kind={a.kind} size={22} />}
                        </div>
                        <div style={{ marginTop: 5, fontSize: 10.5, color: ink55, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                        <button onClick={() => removeAttachment(a.id)} aria-label="Remove attachment" style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', border: `2px solid ${canvas}`, background: ink, color: paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                          <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inline add row */}
              <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 14, borderTop: `1px dashed ${DASH}` }}>
                <button onClick={() => setRecording(true)} style={{ height: 38, padding: '0 14px', borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><PlanAttachmentIcon kind="voice" size={14} />Record</button>
                <button onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ height: 38, padding: '0 14px', borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><PlanAttachmentIcon kind="doc" size={14} />Attach</button>
              </div>
              {err && <div style={{ marginTop: 10, fontSize: 12, color: '#C8102E', fontWeight: 600 }}>{err}</div>}
            </div>
          ) : (
            /* ── FILE LIST (default) — search lives in the pinned bottom bar ── */
            <div>
              {query.trim() ? (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: ink40, paddingBottom: 4 }}>{searchHits.length} result{searchHits.length === 1 ? '' : 's'}</div>
                  {searchHits.length === 0 ? (
                    <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 13.5, color: ink40 }}>Nothing matches “{query.trim()}”.</div>
                  ) : searchHits.map((f, i) => <PlanFileRow key={f.id} file={f} folder={folderName(f.folderId)} onOpen={() => openEditor(f)} first={i === 0} />)}
                </div>
              ) : (
                <React.Fragment>
                  <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontSize: web ? 26 : 22, fontWeight: 800, letterSpacing: '-0.02em', color: ink }}>{folderName(activeFolder)}</div>
                    <span style={{ fontFamily: CC_MONO, fontSize: 11, color: ink40 }}>{folderFiles.length} file{folderFiles.length === 1 ? '' : 's'}</span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {loading ? (
                      [0, 1, 2].map((i) => (
                        <div key={i} style={{ borderTop: i === 0 ? 'none' : `1px dashed ${DASH}`, padding: '14px 0' }}>
                          <span className="pk-shimmer" style={{ display: 'block', width: '60%', height: 14, borderRadius: 6 }} />
                          <span className="pk-shimmer" style={{ display: 'block', width: '85%', height: 11, borderRadius: 6, marginTop: 8 }} />
                        </div>
                      ))
                    ) : folderFiles.length === 0 ? (
                      <div style={{ padding: '36px 0', textAlign: 'center' }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, margin: '0 auto', background: ink06, color: ink40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FolderIcon kind={(folders.find((x) => x.id === activeFolder) || {}).icon} size={20} color={ink40} /></div>
                        <div style={{ marginTop: 14, fontSize: 14.5, fontWeight: 760, color: ink }}>Nothing here yet</div>
                        <div style={{ marginTop: 4, fontSize: 12.5, color: ink40 }}>Capture a thought, a plan, or a voice note.</div>
                        <button onClick={() => createNote(activeFolder)} style={{ marginTop: 16, height: 40, padding: '0 18px', borderRadius: 999, border: 0, background: ink, color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 760 }}>New note</button>
                      </div>
                    ) : (
                      folderFiles.map((f, i) => <PlanFileRow key={f.id} file={f} onOpen={() => openEditor(f)} first={i === 0} />)
                    )}
                  </div>
                </React.Fragment>
              )}

              {/* Undo banner — restore a just-deleted note */}
              {undo && (
                <div className="pk-rise" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: ink, color: paper }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Note moved to trash.</span>
                  <button onClick={() => restoreFile(undo.file.id)} style={{ border: 0, background: 'transparent', color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, textDecoration: 'underline' }}>Undo</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search — pinned to the bottom, above the + buttons */}
      {view === 'files' && (
        <div style={{ position: 'absolute', left: web ? 28 : 16, right: web ? 28 : 16, bottom: `calc(${(web ? 24 : 20) + bottomInset + 64}px + env(safe-area-inset-bottom, 0px))`, zIndex: 30, maxWidth: web ? 760 : 'none', margin: web ? '0 auto' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: paper, border: `1px solid ${ink12}`, borderRadius: 14, padding: '8px 12px', boxShadow: '0 10px 30px rgba(10,10,10,0.10)' }}>
            <span style={{ color: ink40, display: 'flex', flexShrink: 0 }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes, voice, attachments" style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 0, color: ink, fontFamily: 'inherit', fontSize: 15, fontWeight: 500, padding: 0 }} />
            {query.trim() ? (<button onClick={() => setQuery('')} aria-label="Clear" style={{ border: 0, background: 'transparent', color: ink25, cursor: 'pointer', display: 'flex', flexShrink: 0, padding: 4 }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg></button>) : null}
          </div>
        </div>
      )}

      {/* Quick capture FAB (bottom-right) */}
      {fabOpen && <div onClick={() => setFabOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 44 }} />}
      <div style={{ position: 'absolute', right: web ? 28 : 18, bottom: `calc(${(web ? 24 : 20) + bottomInset}px + env(safe-area-inset-bottom, 0px))`, zIndex: 45, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        {fabOpen && (
          <div className="pk-rise" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {[['New note', 'doc', () => createNote(activeFolder)], ['Voice recording', 'voice', () => { setFabOpen(false); setRecording(true); }], ['Upload attachment', 'image', () => { setFabOpen(false); if (!openFile) createNote(activeFolder); setTimeout(() => fileInputRef.current && fileInputRef.current.click(), 60); }]].map(([label, kind, act]) => (
              <button key={label} onClick={act} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 42, padding: '0 14px', borderRadius: 999, border: 0, background: paper, color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 720, boxShadow: '0 10px 26px rgba(10,10,10,0.16)' }}>
                <span style={{ color: ink55, display: 'flex' }}><PlanAttachmentIcon kind={kind} size={15} /></span>{label}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => { pkHaptic('select'); setFabOpen((o) => !o); }} aria-label="Quick capture" style={{ width: 54, height: 54, borderRadius: '50%', border: 0, background: ink, color: paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(10,10,10,0.24)', transition: 'transform 260ms cubic-bezier(.16,.84,.28,1)', transform: fabOpen ? 'rotate(45deg)' : 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,application/pdf,.doc,.docx,.txt" onChange={onPickAttachment} style={{ display: 'none' }} />

      {recording && <PlanRecorder onCancel={() => setRecording(false)} onSave={saveVoice} language={ccProfileLanguage()} />}
    </div>
  );
}

// A note row in the list — title, preview, meta, content markers.
function PlanFileRow({ file, folder, onOpen, first }) {
  const preview = (file.body || '').replace(/\n+/g, ' ').trim();
  const nVoice = (file.voice || []).length;
  const nAtt = (file.attachments || []).length;
  return (
    <button onClick={onOpen} style={{ width: '100%', textAlign: 'left', border: 0, borderTop: first ? 'none' : `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 740, color: ink, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.title || 'Untitled note'}</span>
        {folder && <span style={{ flexShrink: 0, fontFamily: CC_MONO, fontSize: 9.5, letterSpacing: '0.04em', color: ink40, padding: '2px 7px', borderRadius: 999, background: ink06 }}>{folder}</span>}
      </span>
      {preview && <span style={{ fontSize: 12.5, color: ink55, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{preview}</span>}
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: CC_MONO, fontSize: 10.5, color: ink40 }}>
        <span>{planAgo(file.updated)}</span>
        {nVoice > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><PlanAttachmentIcon kind="voice" size={11} />{nVoice}</span>}
        {nAtt > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><PlanAttachmentIcon kind="doc" size={11} />{nAtt}</span>}
      </span>
    </button>
  );
}

function planAgo(ts) {
  if (!ts) return '';
  const d = Date.now() - ts; const min = 60000, hr = 60 * min, day = 24 * hr;
  if (d < min) return 'just now';
  if (d < hr) return Math.floor(d / min) + 'm ago';
  if (d < day) return Math.floor(d / hr) + 'h ago';
  if (d < 7 * day) return Math.floor(d / day) + 'd ago';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Voice recorder overlay. The visual shell stays the same; capture now records
// microphone audio and sends it to the local voice service.
function PlanRecorder({ onCancel, onSave, language }) {
  const [sec, setSec] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [permission, setPermission] = React.useState('starting');
  const recorderRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  React.useEffect(() => { if (paused || saving) return; const id = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(id); }, [paused, saving]);
  React.useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Microphone recording is not available in this browser.');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        const preferred = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        const recorder = new MediaRecorder(stream, { mimeType: preferred });
        chunksRef.current = [];
        recorder.ondataavailable = (event) => { if (event.data && event.data.size > 0) chunksRef.current.push(event.data); };
        recorder.start();
        recorderRef.current = recorder;
        setPermission('ready');
      } catch (e) {
        setPermission('error');
        setError(e && e.message ? e.message : 'Microphone permission was not granted.');
      }
    };
    start();
    return () => {
      cancelled = true;
      try { if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop(); } catch (e) {}
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopAndSave = () => {
    if (saving || permission !== 'ready') return;
    setSaving(true);
    setError('');
    const recorder = recorderRef.current;
    const finish = async () => {
      try {
        const type = recorder && recorder.mimeType ? recorder.mimeType : 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        await onSave(Math.max(1, sec), blob);
      } catch (e) {
        setSaving(false);
        setError(e && e.message ? e.message : 'Voice transcription failed.');
      }
    };
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = finish;
      recorder.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    } else {
      finish();
    }
  };
  const togglePause = () => {
    const recorder = recorderRef.current;
    try {
      if (!paused && recorder && recorder.state === 'recording') recorder.pause();
      if (paused && recorder && recorder.state === 'paused') recorder.resume();
    } catch (e) {}
    setPaused((p) => !p);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(10,10,10,0.34)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={saving ? undefined : onCancel}>
      <div className="pk-rise" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '10px 24px max(26px, env(safe-area-inset-bottom, 20px))', boxShadow: '0 -20px 60px rgba(10,10,10,0.22)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: ink12, margin: '8px auto 18px' }} />
        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: ink }}>{saving ? 'Transcribing' : permission === 'error' ? 'Microphone unavailable' : 'Recording'}</div>
        <div style={{ textAlign: 'center', fontFamily: CC_MONO, fontSize: 13, color: ink55, marginTop: 4 }}>{ccFmtTime(sec)} - {language === 'rw' ? 'Kinyarwanda' : 'English'}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 48, marginTop: 16 }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} style={{ width: 3, borderRadius: 2, background: paused || saving || permission !== 'ready' ? ink25 : ink, height: paused || saving || permission !== 'ready' ? 6 : 6 + Math.abs(Math.sin((i + sec) * 0.7)) * 34, transition: 'height 220ms ease' }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 22 }}>
          <button onClick={onCancel} disabled={saving} style={{ height: 48, padding: '0 20px', borderRadius: 14, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 760, opacity: saving ? 0.55 : 1 }}>Cancel</button>
          <button onClick={togglePause} disabled={saving || permission !== 'ready'} aria-label={paused ? 'Resume' : 'Pause'} style={{ width: 56, height: 56, borderRadius: '50%', border: `1.5px solid ${ink}`, background: 'transparent', color: ink, cursor: saving || permission !== 'ready' ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: saving || permission !== 'ready' ? 0.45 : 1 }}>
            {paused ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>}
          </button>
          <button onClick={stopAndSave} disabled={saving || permission !== 'ready'} style={{ height: 48, padding: '0 22px', borderRadius: 14, border: 0, background: ink, color: paper, cursor: saving || permission !== 'ready' ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 760, boxShadow: '0 12px 28px rgba(10,10,10,0.2)', opacity: saving || permission !== 'ready' ? 0.55 : 1 }}>{saving ? 'Saving' : 'Save note'}</button>
        </div>
        {error ? (
          <div style={{ marginTop: 14, fontSize: 11.5, color: '#C8102E', textAlign: 'center', lineHeight: 1.4, fontWeight: 650 }}>{error}</div>
        ) : (
          <div style={{ marginTop: 14, fontSize: 11, color: ink40, textAlign: 'center', lineHeight: 1.4 }}>Saved with a local transcript so it's searchable.</div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────── LISTEN ──────────────────────────────
// Two-pane listening: a lightweight source rail and a content canvas, with a
// dedicated full player + transcript, a persistent mini player, and resume.
// Playback state is lifted to App so audio keeps going across the app.

const CC_LISTEN = [
  { id: 'briefing', name: 'Everyday Briefing', author: 'EBC Studio', desc: 'Your daily brief on Kigali — in ten minutes.', hue: '#5B7CFA',
    episodes: [
      { id: 'b1', title: 'Morning in Kigali', min: 12, date: 'Jun 11', type: 'long',  tag: 'new' },
      { id: 'b2', title: 'What to know before noon', min: 9, date: 'Jun 10', type: 'short', tag: 'popular' },
      { id: 'b3', title: 'Evening recap', min: 14, date: 'Jun 9', type: 'long', tag: 'highlighted' },
      { id: 'b4', title: 'The weekend ahead', min: 6, date: 'Jun 7', type: 'short' },
    ] },
  { id: 'business', name: 'Kigali Business', author: 'BK Media', desc: 'Markets, founders, and money moves.', hue: '#2FAE9B',
    episodes: [
      { id: 'k1', title: 'Retail moves this week', min: 22, date: 'Jun 11', type: 'long', tag: 'new' },
      { id: 'k2', title: 'Founder notes', min: 8, date: 'Jun 9', type: 'short', tag: 'highlighted' },
      { id: 'k3', title: 'Markets in ten minutes', min: 11, date: 'Jun 8', type: 'long', tag: 'popular' },
      { id: 'k4', title: 'Quick: the franc today', min: 4, date: 'Jun 7', type: 'short' },
    ] },
  { id: 'creator', name: 'Creator Talks', author: 'Studio Hill', desc: 'Conversations with people who build.', hue: '#A37BF2',
    episodes: [
      { id: 'c1', title: 'Building a loyal audience', min: 34, date: 'Jun 10', type: 'long', tag: 'popular' },
      { id: 'c2', title: 'Studio routines', min: 19, date: 'Jun 8', type: 'long', tag: 'new' },
      { id: 'c3', title: 'Pricing your work', min: 7, date: 'Jun 6', type: 'short', tag: 'highlighted' },
    ] },
  { id: 'money', name: 'Money Habits', author: 'Everyday', desc: 'Small habits that compound.', hue: '#E2941F',
    episodes: [
      { id: 'm1', title: 'Small savings that compound', min: 16, date: 'Jun 11', type: 'long', tag: 'highlighted' },
      { id: 'm2', title: 'Borrowing with care', min: 13, date: 'Jun 9', type: 'long', tag: 'new' },
      { id: 'm3', title: 'Planning school fees', min: 5, date: 'Jun 7', type: 'short', tag: 'popular' },
    ] },
  { id: 'focus', name: 'Morning Focus', author: 'Calm Co.', desc: 'A calm start to deep work.', hue: '#2A6FDB',
    episodes: [
      { id: 'f1', title: 'A calm start', min: 10, date: 'Jun 11', type: 'short', tag: 'new' },
      { id: 'f2', title: 'Deep work block', min: 25, date: 'Jun 10', type: 'long', tag: 'popular' },
      { id: 'f3', title: 'Five minute reflection', min: 5, date: 'Jun 8', type: 'short', tag: 'highlighted' },
    ] },
  { id: 'culture', name: 'Rwanda Culture', author: 'Umuco FM', desc: 'Stories, food, music, memory.', hue: '#C8102E',
    episodes: [
      { id: 'r1', title: 'Stories from Nyamirambo', min: 28, date: 'Jun 10', type: 'long', tag: 'popular' },
      { id: 'r2', title: 'Food, music, memory', min: 21, date: 'Jun 8', type: 'long', tag: 'highlighted' },
      { id: 'r3', title: 'Weekend guide', min: 6, date: 'Jun 7', type: 'short', tag: 'new' },
    ] },
];

function ccFmtTime(s) { s = Math.max(0, Math.floor(s)); const m = Math.floor(s / 60); const ss = String(s % 60).padStart(2, '0'); return `${m}:${ss}`; }

function ccChannel(id) { return CC_LISTEN.find((c) => c.id === id) || null; }
function ccBuildItem(chId, epIdx) {
  const c = ccChannel(chId); if (!c) return null;
  const e = c.episodes[epIdx]; if (!e) return null;
  return { ch: chId, channel: c.name, hue: c.hue, ep: epIdx, id: e.id, title: e.title, dur: (e.min || 10) * 60 };
}

function ccTranscript(item) {
  if (!item) return [];
  const lines = [
    'Welcome back — you’re listening to ' + item.channel + '.',
    'Today we’re getting into “' + item.title + '”.',
    'Let’s set the scene before we dig in.',
    'Here’s the one thing worth remembering.',
    'It’s easy to overlook, but it matters.',
    'A quick example from this week in Kigali.',
    'Notice how the small choices add up.',
    'That brings us to the practical part.',
    'Try this the next time it comes up.',
    'We’ll keep it short and useful.',
    'Thanks for listening — see you in the next one.',
  ];
  return lines.map((text, i) => ({ t: i / lines.length, text }));
}

function ChannelAvatar({ ch, size = 40, square = false }) {
  const initials = ch.name.split(' ').slice(0, 2).map((w) => w[0]).join('');
  return (
    <span style={{ width: size, height: size, borderRadius: square ? Math.round(size * 0.26) : '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ch.hue, color: '#fff', fontFamily: CC_MONO, fontWeight: 800, fontSize: Math.round(size * 0.34), letterSpacing: '0.02em' }}>{initials}</span>
  );
}

function EpisodeThumb({ hue, playing, size = 44 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: Math.round(size * 0.26), flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: hue + '22', color: hue }}>
      {playing
        ? (<svg width="15" height="15" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2.5" width="2.6" height="9" rx="1"/><rect x="8.4" y="2.5" width="2.6" height="9" rx="1"/></svg>)
        : (<svg width="15" height="15" viewBox="0 0 14 14" fill="currentColor"><path d="M4 2.5v9l7-4.5-7-4.5z"/></svg>)}
    </span>
  );
}

function ListenScreen({ web, onBack, player }) {
  // Live channels from /api/listen. We join episodes under their source by
  // source_id and rename columns to the shape the rest of the screen expects
  // (minutes→min, published_label→date, episode_type→type, description→desc).
  // Falls back to CC_LISTEN until the store hydrates.
  const everyday = window.useEveryday ? window.useEveryday() : null;
  const liveSources = (everyday && everyday.listen && everyday.listen.sources) || [];
  const liveEpisodes = (everyday && everyday.listen && everyday.listen.episodes) || [];
  const channels = liveSources.length
    ? liveSources.map((src) => ({
        id: src.id,
        name: src.name,
        author: src.author,
        desc: src.description || '',
        hue: src.hue || '#5B7CFA',
        episodes: liveEpisodes
          .filter((ep) => ep.source_id === src.id)
          .map((ep) => ({
            id: ep.id,
            title: ep.title,
            min: ep.minutes,
            date: ep.published_label,
            type: ep.episode_type || 'long',
            tag: ep.tag || undefined,
          })),
      }))
    : CC_LISTEN;
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [railOpen, setRailOpen] = React.useState(true);
  const [subscribed, setSubscribed] = React.useState({});
  const [contentTab, setContentTab] = React.useState('long'); // long · short
  const [disc, setDisc] = React.useState('');                  // '' · popular · new · highlighted
  const [loading, setLoading] = React.useState(false);
  const channel = channels[activeIdx];
  const pl = player && player.state;

  // Lightweight loading state when switching sources.
  React.useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(id);
  }, [activeIdx]);

  // When the rail is collapsed, the channel icons float in, then fade after 3s —
  // the open/close toggle always stays.
  const [railIcons, setRailIcons] = React.useState(false);
  React.useEffect(() => {
    if (railOpen) { setRailIcons(false); return; }
    setRailIcons(true);
    const id = setTimeout(() => setRailIcons(false), 3000);
    return () => clearTimeout(id);
  }, [railOpen]);

  const selectChannel = (idx) => { pkHaptic('select'); setActiveIdx(idx); setDisc(''); };
  const isFollowing = !!subscribed[channel.id];
  const discs = [['popular', 'Popular'], ['new', 'New'], ['highlighted', 'Highlighted']];

  const episodes = channel.episodes
    .filter((e) => e.type === contentTab)
    .filter((e) => !disc || e.tag === disc); // already authored newest-first

  // Resume row — show the user's last episode if it’s in progress.
  const resume = pl && pl.progress > 0.02 && pl.progress < 0.99 ? pl : null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
      <ScreenHeader left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBtn onClick={onBack}><svg width="16" height="16" viewBox="0 0 16 16"><path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></IconBtn>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>Listen</span>
      </div>} />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: railOpen ? (web ? 22 : 14) : 12, padding: web ? '14px 28px 26px' : '8px 16px 18px' }}>
        {/* Left rail — sources only: avatar + name */}
        <div style={{ width: railOpen ? (web ? 208 : 132) : 30, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: `1px dashed ${DASH}`, paddingRight: railOpen ? (web ? 18 : 12) : 0, transition: 'width 220ms ease' }}>
          {railOpen ? (
            <React.Fragment>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0 10px' }}>
                <span style={{ fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: ink40 }}>Channels</span>
                <button onClick={() => setRailOpen(false)} aria-label="Hide channels" style={{ border: 0, background: 'transparent', color: ink40, cursor: 'pointer', padding: 2, display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
                </button>
              </div>
              <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                {channels.map((c, idx) => {
                  const on = idx === activeIdx;
                  return (
                    <button key={c.id} onClick={() => selectChannel(idx)} style={{ width: '100%', textAlign: 'left', border: 0, borderTop: idx === 0 ? 'none' : `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', padding: '11px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ position: 'relative', flexShrink: 0 }}>
                        <ChannelAvatar ch={c} size={web ? 34 : 30} />
                        {on && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1.5px solid ${ink}` }} />}
                      </span>
                      <span style={{ minWidth: 0, fontSize: 13, fontWeight: on ? 760 : 600, color: on ? ink : ink70, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </React.Fragment>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Open/close toggle — always stays */}
              <button onClick={() => setRailOpen(true)} aria-label="Show channels" style={{ border: 0, background: 'transparent', color: ink55, cursor: 'pointer', padding: '4px 0', display: 'flex', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
              </button>
              {/* Floating channel icons — fade out after 3s; tap to jump */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 12, opacity: railIcons ? 1 : 0, transform: railIcons ? 'none' : 'translateY(-6px)', transition: 'opacity 400ms ease, transform 400ms ease', pointerEvents: railIcons ? 'auto' : 'none' }}>
                {channels.map((c, idx) => {
                  const on = idx === activeIdx;
                  return (
                    <button key={c.id} onClick={() => selectChannel(idx)} aria-label={c.name} title={c.name} style={{ position: 'relative', border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
                      <ChannelAvatar ch={c} size={24} />
                      {on && <span style={{ position: 'absolute', inset: -2.5, borderRadius: '50%', border: `1.5px solid ${ink}` }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main canvas */}
        <div className="cc-scroll" style={{ flex: 1, minWidth: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: pl ? 92 : 24 }}>
          {/* Compact profile header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <ChannelAvatar ch={channel} size={web ? 56 : 48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: web ? 24 : 19, fontWeight: 800, letterSpacing: '-0.02em', color: ink, lineHeight: 1.12 }}>{channel.name}</div>
              <div style={{ fontSize: 12.5, color: ink40, marginTop: 2 }}>{channel.author}</div>
            </div>
            <button onClick={() => { pkHaptic('select'); setSubscribed((s) => ({ ...s, [channel.id]: !s[channel.id] })); }} style={{ flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 999, border: isFollowing ? '0' : `1px dashed ${DASH}`, background: isFollowing ? ink : 'transparent', color: isFollowing ? paper : ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700 }}>{isFollowing ? 'Following' : 'Follow'}</button>
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: ink55, lineHeight: 1.45 }}>{channel.desc}</div>

          {/* Continue listening — resume the last episode */}
          {resume && (
            <button onClick={() => player.open()} className="pk-rise" style={{ marginTop: 16, width: '100%', border: `1px dashed ${DASH}`, borderRadius: 14, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <EpisodeThumb hue={resume.hue} playing={resume.playing} size={40} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: CC_MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink40 }}>Continue listening</span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 720, color: ink, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resume.title}</span>
                <span style={{ display: 'block', height: 3, borderRadius: 999, background: ink12, marginTop: 7, position: 'relative' }}><span style={{ position: 'absolute', insetBlock: 0, left: 0, width: `${Math.round(resume.progress * 100)}%`, background: resume.hue, borderRadius: 999 }} /></span>
              </span>
              <span style={{ fontFamily: CC_MONO, fontSize: 11, color: ink40, flexShrink: 0 }}>-{ccFmtTime(resume.dur - resume.progress * resume.dur)}</span>
            </button>
          )}

          {/* Long Form / Shorts — content nav inside the canvas */}
          <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
            {[['long', 'Long Form'], ['short', 'Shorts']].map(([k, l]) => {
              const on = contentTab === k;
              return <button key={k} onClick={() => { pkHaptic('select'); setContentTab(k); }} style={{ height: 36, padding: '0 16px', borderRadius: 999, border: on ? '0' : `1px dashed ${DASH}`, background: on ? ink : 'transparent', color: on ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 760 }}>{l}</button>;
            })}
          </div>

          {/* Discovery — lightweight filters */}
          <div style={{ marginTop: 10, display: 'flex', gap: 7 }}>
            {discs.map(([k, l]) => {
              const on = disc === k;
              return <button key={k} onClick={() => { pkHaptic('select'); setDisc(on ? '' : k); }} style={{ height: 30, padding: '0 12px', borderRadius: 999, border: on ? '0' : `1px dashed ${DASH}`, background: on ? channel.hue : 'transparent', color: on ? '#fff' : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700 }}>{l}</button>;
            })}
          </div>

          {/* Episodes — newest first */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: ink40, paddingBottom: 4 }}>Episodes{disc ? ` · ${disc}` : ''}</div>
            {loading ? (
              [0, 1, 2].map((i) => (
                <div key={i} style={{ borderTop: i === 0 ? 'none' : `1px dashed ${DASH}`, padding: '14px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="pk-shimmer" style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>
                    <span className="pk-shimmer" style={{ display: 'block', width: '58%', height: 13, borderRadius: 6 }} />
                    <span className="pk-shimmer" style={{ display: 'block', width: '34%', height: 11, borderRadius: 6, marginTop: 8 }} />
                  </span>
                </div>
              ))
            ) : episodes.length === 0 ? (
              <div style={{ padding: '34px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 760, color: ink }}>No {contentTab === 'short' ? 'shorts' : 'long-form episodes'}{disc ? ` in ${disc}` : ''} yet</div>
                <div style={{ marginTop: 4, fontSize: 12.5, color: ink40 }}>Try another tab or clear the filter.</div>
                {disc && <button onClick={() => setDisc('')} style={{ marginTop: 14, height: 36, padding: '0 16px', borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700 }}>Clear filter</button>}
              </div>
            ) : (
              episodes.map((ep, idx) => {
                const epIdx = channel.episodes.indexOf(ep);
                const isCur = pl && pl.ch === channel.id && pl.ep === epIdx;
                return (
                  <button key={ep.id} onClick={() => player.load(channel.id, epIdx)} style={{ width: '100%', border: 0, borderTop: idx === 0 ? 'none' : `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '13px 0', display: 'flex', alignItems: 'center', gap: 13 }}>
                    <EpisodeThumb hue={channel.hue} playing={isCur && pl.playing} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14.5, fontWeight: isCur ? 780 : 650, color: ink, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ep.title}</span>
                      <span style={{ display: 'block', fontSize: 11.5, color: ink40, marginTop: 2, fontFamily: CC_MONO, letterSpacing: '0.02em' }}>{isCur ? (pl.playing ? 'Now playing' : 'Paused') : `${ep.min} min · ${ep.date}`}</span>
                    </span>
                    {ep.tag && !isCur && <span style={{ flexShrink: 0, fontFamily: CC_MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: channel.hue, padding: '3px 7px', borderRadius: 999, background: channel.hue + '18' }}>{ep.tag}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Transport glyphs reused by the player.
function ListenTransport({ player, big }) {
  const pl = player.state; if (!pl) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: big ? 22 : 18 }}>
      <button onClick={() => player.prev()} aria-label="Previous" style={{ border: 0, background: 'transparent', color: ink, cursor: 'pointer', display: 'flex', padding: 4 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="2.4" height="14" rx="1"/><path d="M20 5v14l-11-7z"/></svg>
      </button>
      <button onClick={() => player.skip(-15)} aria-label="Back 15 seconds" style={{ border: 0, background: 'transparent', color: ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: 2 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8a8 8 0 1 1-1 4"/><path d="M4 4v4h4"/></svg>
        <span style={{ fontFamily: CC_MONO, fontSize: 9, fontWeight: 700, color: ink55 }}>15</span>
      </button>
      <button onClick={() => player.toggle()} aria-label={pl.playing ? 'Pause' : 'Play'} style={{ width: big ? 70 : 58, height: big ? 70 : 58, borderRadius: '50%', border: 0, background: ink, color: paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(10,10,10,0.22)' }}>
        {pl.playing
          ? (<svg width={big ? 26 : 22} height={big ? 26 : 22} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>)
          : (<svg width={big ? 26 : 22} height={big ? 26 : 22} viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>)}
      </button>
      <button onClick={() => player.skip(30)} aria-label="Forward 30 seconds" style={{ border: 0, background: 'transparent', color: ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: 2 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 8a8 8 0 1 0 1 4"/><path d="M20 4v4h-4"/></svg>
        <span style={{ fontFamily: CC_MONO, fontSize: 9, fontWeight: 700, color: ink55 }}>30</span>
      </button>
      <button onClick={() => player.next()} aria-label="Next" style={{ border: 0, background: 'transparent', color: ink, cursor: 'pointer', display: 'flex', padding: 4 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5v14l11-7z"/><rect x="16.6" y="5" width="2.4" height="14" rx="1"/></svg>
      </button>
    </div>
  );
}

// Dedicated full-screen playback experience, with a Transcript tab.
function ListenPlayer({ player }) {
  const [tab, setTab] = React.useState('player');
  const transRef = React.useRef(null);
  const pl = player.state;
  React.useEffect(() => { setTab('player'); }, [pl && pl.id]);
  if (!pl) return null;
  const ch = ccChannel(pl.ch) || { hue: ink, name: pl.channel };
  const cur = pl.progress * pl.dur;
  const transcript = ccTranscript(pl);
  const activeLine = transcript.reduce((a, l, i) => (l.t <= pl.progress ? i : a), 0);

  const seek = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    player.seek((e.clientX - r.left) / r.width);
  };
  const cycleSpeed = () => { const order = [1, 1.25, 1.5, 2]; const i = order.indexOf(pl.speed || 1); player.setSpeed(order[(i + 1) % order.length]); };

  return (
    <div className="pk-rise" style={{ position: 'absolute', inset: 0, zIndex: 80, background: canvas, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: PK_NATIVE ? 'max(16px, env(safe-area-inset-top, 16px))' : 54, flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 0' }}>
        <IconBtn onClick={() => player.minimize()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5"/></svg>
        </IconBtn>
        <span style={{ fontFamily: CC_MONO, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: ink40 }}>{ch.name}</span>
        <IconBtn onClick={() => player.close()}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
        </IconBtn>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 22px 0', justifyContent: 'center' }}>
        {[['player', 'Now Playing'], ['transcript', 'Transcript']].map(([k, l]) => {
          const on = tab === k;
          return <button key={k} onClick={() => setTab(k)} style={{ height: 32, padding: '0 14px', borderRadius: 999, border: on ? '0' : `1px dashed ${DASH}`, background: on ? ink : 'transparent', color: on ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>{l}</button>;
        })}
      </div>

      {tab === 'player' ? (
        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 26px max(26px, env(safe-area-inset-bottom, 20px))', textAlign: 'center' }}>
          {/* Artwork */}
          <div style={{ width: '100%', maxWidth: 300, aspectRatio: '1 / 1', borderRadius: 26, background: `linear-gradient(150deg, ${ch.hue} 0%, ${ch.hue}AA 60%, ${ch.hue}66 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 24px 60px rgba(10,10,10,0.22)', color: '#fff' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.92 }}><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="7" rx="2"/><rect x="17" y="13" width="4" height="7" rx="2"/></svg>
          </div>
          <div style={{ marginTop: 24, fontSize: 21, fontWeight: 820, letterSpacing: '-0.02em', color: ink, maxWidth: 340 }}>{pl.title}</div>
          <div style={{ marginTop: 5, fontSize: 13.5, color: ink55 }}>{ch.name}</div>

          {/* Scrubber */}
          <div onClick={seek} style={{ width: '100%', maxWidth: 360, marginTop: 24, height: 16, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: '100%', height: 3, background: ink12, borderRadius: 999 }}>
              <div style={{ position: 'absolute', insetBlock: 0, left: 0, width: `${pl.progress * 100}%`, background: ink, borderRadius: 999 }} />
              <div style={{ position: 'absolute', top: '50%', left: `${pl.progress * 100}%`, width: 12, height: 12, borderRadius: '50%', background: ink, transform: 'translate(-50%, -50%)' }} />
            </div>
          </div>
          <div style={{ width: '100%', maxWidth: 360, display: 'flex', justifyContent: 'space-between', marginTop: 7, fontFamily: CC_MONO, fontSize: 11, color: ink40 }}>
            <span>{ccFmtTime(cur)}</span>
            <span>-{ccFmtTime(pl.dur - cur)}</span>
          </div>

          <div style={{ marginTop: 22 }}><ListenTransport player={player} big /></div>

          <button onClick={cycleSpeed} style={{ marginTop: 22, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: CC_MONO, fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 999 }}>{pl.speed || 1}x speed</button>
        </div>
      ) : (
        <div ref={transRef} className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: '18px 26px max(26px, env(safe-area-inset-bottom, 20px))', maxWidth: 640, margin: '0 auto', width: '100%' }}>
          {transcript.map((l, i) => {
            const on = i === activeLine;
            return (
              <button key={i} onClick={() => player.seek(l.t + 0.001)} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', padding: '10px 0' }}>
                <span style={{ fontSize: 16, lineHeight: 1.5, fontWeight: on ? 760 : 500, color: on ? ink : ink40, transition: 'color 200ms ease' }}>{l.text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Persistent mini player — title + play/pause; tap to reopen the full player.
function MiniPlayer({ player }) {
  const pl = player.state; if (!pl) return null;
  const ch = ccChannel(pl.ch) || { hue: ink };
  return (
    <div className="pk-rise" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40, background: 'rgba(250,246,241,0.92)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderTop: `1px dashed ${DASH}`, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div style={{ height: 3, background: ink06 }}><div style={{ height: '100%', width: `${pl.progress * 100}%`, background: ch.hue }} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px' }}>
        <button onClick={() => player.open()} aria-label="Open player" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>
          <EpisodeThumb hue={ch.hue} playing={pl.playing} size={38} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 760, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.title}</span>
            <span style={{ display: 'block', fontSize: 11, color: ink40, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.channel}</span>
          </span>
        </button>
        <button onClick={() => player.toggle()} aria-label={pl.playing ? 'Pause' : 'Play'} style={{ width: 40, height: 40, borderRadius: '50%', border: 0, background: ink, color: paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {pl.playing
            ? (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>)
            : (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>)}
        </button>
      </div>
    </div>
  );
}

function PayScreen({ web, onBack }) {
  const contacts = [
    { id: 'aline', name: 'Aline Niyonsaba', phone: '+250 788 120 441' },
    { id: 'eric', name: 'Eric Kwizera', phone: '+250 782 441 009' },
    { id: 'school', name: 'Green Hills School', phone: 'School fees' },
  ];
  const currencies = ['RWF', 'USD', 'GBP', 'KES', 'UGX', 'TZS'];
  const [amount, setAmount] = React.useState('');
  const [recipientText, setRecipientText] = React.useState('');
  const [recipient, setRecipient] = React.useState(null);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [curIdx, setCurIdx] = React.useState(0);
  const [paidReceipt, setPaidReceipt] = React.useState(null);
  const currency = currencies[curIdx];
  const cycleCurrency = () => { pkHaptic('select'); setCurIdx((i) => (i + 1) % currencies.length); };
  const matches = contacts.filter((c) => {
    const q = recipientText.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
  });
  const canPay = amount.trim() && (recipient || recipientText.trim());
  const pickRecipient = (c) => { pkHaptic('select'); setRecipient(c); setRecipientText(c.name); setContactOpen(false); };
  const [payBusy, setPayBusy] = React.useState(false);
  const [payError, setPayError] = React.useState('');
  const submitPayment = async () => {
    if (!canPay || payBusy) return;
    const recipientName = recipient ? recipient.name : recipientText.trim();
    const amountNumber = parseInt(String(amount).replace(/[^0-9]/g, ''), 10);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setPayError('Enter an amount above zero.');
      return;
    }
    setPayError('');
    // The Pay service settles in RWF. Other display currencies are presentational
    // until FX is wired in; we pass through the entered amount as RWF for now.
    if (window.EverydayStore) {
      setPayBusy(true);
      try {
        await window.EverydayStore.actions.pay(amountNumber, recipientName, '');
        pkHaptic('success');
        setPaidReceipt({
          amount, currency,
          recipient: recipientName,
          id: 'EV-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        });
      } catch (e) {
        setPayError(e && e.message ? e.message : 'Payment failed. Try again.');
      } finally {
        setPayBusy(false);
      }
      return;
    }
    // Offline / store unavailable — keep the local receipt path so the UI is testable.
    pkHaptic('success');
    setPaidReceipt({
      amount, currency,
      recipient: recipientName,
      id: 'EV-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    });
  };
  const resetPayment = () => { setAmount(''); setRecipientText(''); setRecipient(null); setContactOpen(false); setPaidReceipt(null); setPayError(''); };

  const header = (
    <ScreenHeader left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <IconBtn onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </IconBtn>
      <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>Pay</span>
    </div>} />
  );

  // ── Receipt (success) — clean divided list, no tinted card ──
  if (paidReceipt) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        {header}
        <div className="pk-stagger" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: web ? 460 : 430, margin: '0 auto', padding: web ? '0 60px 40px' : '0 28px 34px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#2FAE9B', color: paper, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(47,174,155,0.30)' }}>
            <svg width="30" height="30" viewBox="0 0 34 34" fill="none"><path className="pk-check-path" d="M8 17.5l6 6L26 10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ marginTop: 24, fontSize: web ? 40 : 34, fontWeight: 850, letterSpacing: '-0.05em', color: ink }}>Payment sent.</div>
          <div style={{ marginTop: 8, fontSize: 15, color: ink55 }}>Your receipt is ready.</div>
          <div style={{ marginTop: 28 }}>
            <ReceiptRow label="Amount" value={currency + ' ' + Number(paidReceipt.amount || 0).toLocaleString('en-US')} />
            <ReceiptRow label="To" value={paidReceipt.recipient} />
            <ReceiptRow label="Status" value="Confirmed" green />
            <ReceiptRow label="Receipt" value={paidReceipt.id} last />
          </div>
          <button onClick={resetPayment} style={{ marginTop: 34, height: 56, border: 0, borderRadius: 18, background: ink, color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 760, letterSpacing: '-0.01em', boxShadow: '0 16px 38px rgba(10,10,10,0.20)' }}>New payment</button>
        </div>
      </div>
    );
  }

  // ── Compose payment — dashed tap-to-type lines, standout button ──
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
      {header}
      <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: web ? '12px 60px 40px' : '6px 28px 34px' }}>
        <div className="pk-stagger" style={{ width: '100%', maxWidth: web ? 520 : 430, margin: '0 auto', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 12 }}>
          <div>
            <div style={{ fontSize: web ? 44 : 36, fontWeight: 820, letterSpacing: '-0.05em', lineHeight: 1, color: ink }}>Send money.</div>
          </div>

          {/* Amount — big tap-to-type with a tappable currency */}
          <div style={{ marginTop: web ? 46 : 38 }}>
            <DashField
              label="Amount"
              value={amount}
              onChange={(v) => setAmount(v.replace(/[^\d]/g, ''))}
              placeholder="0"
              inputMode="numeric"
              big
              prefix={(
                <button onClick={cycleCurrency} aria-label="Change currency" style={{
                  alignSelf: 'center', border: 0, background: 'transparent', color: ink40,
                  cursor: 'pointer', fontFamily: CC_MONO, fontSize: 14, fontWeight: 700,
                  letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                }}>
                  {currency}
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4.5L6 7.5l3-3"/></svg>
                </button>
              )}
            />
          </div>

          {/* Recipient — dashed line + a standout "Add" button with breathing room */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <DashField
                  label="To"
                  value={recipientText}
                  onChange={(v) => { setRecipientText(v); setRecipient(null); setContactOpen(true); }}
                  onFocus={() => setContactOpen(true)}
                  placeholder="Name or phone number"
                />
              </div>
              <button onClick={() => setContactOpen((o) => !o)} aria-label="Choose from contacts" style={{
                flexShrink: 0, height: 48, padding: '0 18px', border: 0, borderRadius: 999,
                background: ink, color: paper, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 760, display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 10px 26px rgba(10,10,10,0.16)',
              }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M6.5 8.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM2.5 14.5c.5-2.4 2-3.6 4-3.6s3.5 1.2 4 3.6M12.5 5h3M14 3.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Add
              </button>
            </div>

            {contactOpen && (
              <div className="pk-rise" style={{ marginTop: 16 }}>
                {matches.slice(0, 3).map((c, idx) => {
                  const on = recipient && recipient.id === c.id;
                  return (
                    <button key={c.id} onClick={() => pickRecipient(c)} style={{
                      width: '100%', border: 0, borderTop: idx === 0 ? 'none' : `1px dashed ${DASH}`,
                      background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                      padding: '13px 2px', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 12, textAlign: 'left',
                    }}>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: ink }}>{c.name}</span>
                        <span style={{ display: 'block', marginTop: 2, fontSize: 12.5, color: ink40 }}>{c.phone}</span>
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: on ? '#2FAE9B' : ink25 }}>{on ? 'Selected' : 'Select'}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          </div>
          {/* Primary action — pinned low, clear of the bottom-centre + */}
          <div style={{ flexShrink: 0, paddingTop: 28, paddingBottom: 96 }}>
            <button disabled={!canPay} onClick={submitPayment} style={{
              width: '100%', height: 58, borderRadius: 18,
              background: canPay ? ink : 'transparent',
              color: canPay ? paper : ink25,
              border: canPay ? '0' : `2px dashed ${ink12}`,
              cursor: canPay ? 'pointer' : 'default',
              fontFamily: 'inherit', fontSize: 16, fontWeight: 760, letterSpacing: '-0.01em',
              boxShadow: canPay ? '0 18px 40px rgba(10,10,10,0.22)' : 'none',
              transition: 'background 200ms ease, color 200ms ease, box-shadow 200ms ease',
            }}>
              {canPay ? `Pay ${currency} ${Number(amount || 0).toLocaleString('en-US')}` : 'Enter amount to pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, green = false, last = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      padding: '14px 0', borderBottom: last ? 'none' : `1px dashed ${DASH}`,
    }}>
      <span style={{ fontSize: 13, color: ink40 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: green ? '#2FAE9B' : ink, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
// ────────────────────────────── COMMUTE ──────────────────────────────
// A guided, progressively-disclosed journey that keeps the de-carded
// Everyday language (dashed rules, ink/paper, mono labels):
//   plan → results → detail → confirm → success, plus a focused
//   "ride with someone" sub-flow. The map is a design-native demo
//   surface (route, pickup, destination, live nearby riders).

// Realistic Kigali demo fleet. Prices in RWF.
const CC_RIDES = [
  { id: 'aline',  name: 'Aline N.',     type: 'moto',   vehicle: 'Bajaj · Helmet',        rating: 4.9, eta: 3,  duration: 8,  distance: 2.4, price: 1200, verified: true,  available: true,  x: '28%', y: '58%' },
  { id: 'eric',   name: 'Eric K.',      type: 'moto',   vehicle: 'TVS · Helmet ready',    rating: 4.8, eta: 5,  duration: 9,  distance: 2.6, price: 1100, verified: true,  available: true,  x: '46%', y: '70%' },
  { id: 'jp',     name: 'Jean-Paul U.', type: 'car',    vehicle: 'Toyota Vitz · AC',      rating: 4.9, eta: 7,  duration: 12, distance: 3.1, price: 3800, verified: true,  available: true,  x: '62%', y: '46%' },
  { id: 'claud',  name: 'Claudine I.',  type: 'car',    vehicle: 'Toyota Yaris · 4 seats',rating: 4.7, eta: 9,  duration: 13, distance: 3.0, price: 3500, verified: false, available: true,  x: '38%', y: '40%' },
  { id: 'pat',    name: 'Patrick + 2',  type: 'shared', vehicle: 'Toyota Noah · 2 seats', rating: 4.8, eta: 6,  duration: 15, distance: 3.2, price: 1800, seatsLeft: 2, verified: true, available: true,  x: '70%', y: '64%' },
  { id: 'grace',  name: 'Grace & riders',type: 'shared',vehicle: 'Hiace · 3 seats left',  rating: 4.6, eta: 11, duration: 16, distance: 3.4, price: 1500, seatsLeft: 3, verified: true, available: false, x: '54%', y: '30%' },
];

const CC_PLACES = [
  { id: 'home', label: 'Home', addr: 'Kicukiro', kind: 'home' },
  { id: 'work', label: 'Work', addr: 'Kigali Heights', kind: 'work' },
];

const CC_RECENT_DESTS = ['Kigali Heights', 'Kigali Convention Centre', 'Nyamirambo Stadium', 'Kimironko Market'];

// People going your way — the ride-with-someone sub-flow.
const CC_RIDE_MATES = [
  { id: 'diane',    name: 'Diane M.',    rating: 4.9, verified: true, type: 'car',  vehicle: 'Toyota Vitz', route: 'Same route',        heading: 'Kigali Heights', seatsLeft: 2, when: 'Leaving in 8 min' },
  { id: 'sandrine', name: 'Sandrine K.', rating: 4.8, verified: true, type: 'moto', vehicle: 'Bajaj',       route: 'Similar direction', heading: 'Nyamirambo',     seatsLeft: 1, when: 'Leaving now' },
  { id: 'eric2',    name: 'Eric K.',     rating: 4.8, verified: true, type: 'car',  vehicle: 'Saved contact', route: 'Frequent rider',  heading: 'City centre',    seatsLeft: 3, when: 'Flexible' },
];

const CC_SORTS = [
  { id: 'fast',  label: 'Fastest',    key: (a, b) => a.eta - b.eta },
  { id: 'cheap', label: 'Cheapest',   key: (a, b) => a.price - b.price },
  { id: 'close', label: 'Closest',    key: (a, b) => a.distance - b.distance },
  { id: 'rated', label: 'Top rated',  key: (a, b) => b.rating - a.rating },
];

function ccPrice(n) { return 'RWF ' + Number(n).toLocaleString('en-US'); }

// Small inline marks ----------------------------------------------------------
function Verified({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Verified" style={{ flexShrink: 0 }}>
      <path d="M12 2.6l2.3 1.7 2.8-.2 1 2.7 2.3 1.7-.9 2.7.9 2.7-2.3 1.7-1 2.7-2.8-.2L12 21.4 9.7 19.7l-2.8.2-1-2.7-2.3-1.7.9-2.7-.9-2.7 2.3-1.7 1-2.7 2.8.2z" fill="#2FAE9B"/>
      <path d="M8.6 12.2l2.2 2.2 4.6-4.8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function Stars({ value }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: ink55, fontSize: 11.5, fontWeight: 700 }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#E2941F"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
      {value.toFixed(1)}
    </span>
  );
}

// Design-native demo map -----------------------------------------------------
// Keeps the cream grid + soft road art of the original, adds a highlighted
// route, pickup/destination pins, and live nearby-rider markers.
function CommuteMap({ origin, destination, riders = [], phase = 'plan', height, radius = 24 }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      height: height || '100%', minHeight: height ? undefined : 200,
      borderRadius: radius,
      background:
        'linear-gradient(90deg, rgba(10,10,10,0.045) 1px, transparent 1px), linear-gradient(0deg, rgba(10,10,10,0.045) 1px, transparent 1px), #ECE8E0',
      backgroundSize: '54px 54px',
      boxShadow: 'inset 0 0 0 1px rgba(10,10,10,0.08)',
    }}>
      <style>{`
        @keyframes cc-ping { 0% { transform: scale(.6); opacity:.55 } 70%,100% { transform: scale(2.4); opacity:0 } }
        @keyframes cc-dash { to { stroke-dashoffset: -120 } }
      `}</style>
      <svg viewBox="0 0 900 760" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* soft roads */}
        <path d="M-30 560 C160 492 235 430 354 394 C478 356 542 304 622 210 C693 126 770 88 930 72" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="60" strokeLinecap="round"/>
        <path d="M92 -30 C158 144 242 244 352 324 C485 420 606 489 804 790" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="40" strokeLinecap="round"/>
        <path d="M-30 300 C220 320 470 300 930 360" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="34" strokeLinecap="round"/>
        {/* active route */}
        <path d="M150 632 C250 560 322 520 430 470 C548 416 612 360 716 250" fill="none" stroke="rgba(10,10,10,0.16)" strokeWidth="9" strokeLinecap="round"/>
        <path d="M150 632 C250 560 322 520 430 470 C548 416 612 360 716 250" fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" strokeDasharray="2 14" style={{ animation: 'cc-dash 2.4s linear infinite' }}/>
      </svg>

      {/* nearby riders */}
      {phase === 'plan' && riders.map((r) => (
        <div key={r.id} style={{ position: 'absolute', left: r.x, top: r.y, transform: 'translate(-50%,-50%)' }}>
          <span style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: r.type === 'shared' ? 'rgba(91,124,250,0.4)' : 'rgba(47,174,155,0.4)', animation: 'cc-ping 2.6s ease-out infinite' }} />
          <span style={{ position: 'relative', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: paper, border: `1.5px solid ${ink12}`, color: ink, boxShadow: '0 6px 16px rgba(10,10,10,0.16)' }}>
            <RideTypeIcon type={r.type} size={14} />
          </span>
        </div>
      ))}

      {/* origin pin */}
      <div style={{ position: 'absolute', left: '17%', bottom: '15%', transform: 'translate(-50%,50%)', width: 18, height: 18, borderRadius: '50%', background: ink, border: '4px solid #FAF6F1', boxShadow: '0 8px 22px rgba(10,10,10,0.24)' }} />
      {/* destination pin */}
      <div style={{ position: 'absolute', right: '18%', top: '30%', width: 28, height: 28, borderRadius: '50% 50% 50% 4px', transform: 'rotate(-45deg)', background: '#2FAE9B', border: '4px solid #FAF6F1', boxShadow: '0 10px 24px rgba(47,174,155,0.34)' }} />

      {/* glass route card */}
      <div style={{ position: 'absolute', left: 14, top: 14, right: 14, maxWidth: 320, borderRadius: 16, background: 'rgba(250,246,241,0.85)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 16px 40px rgba(10,10,10,0.12)', padding: '11px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: ink, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 760, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{origin || 'Current location'}</span>
        </div>
        <div style={{ width: 1, height: 12, borderLeft: `1.5px dashed ${ink25}`, marginLeft: 3.5 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 8, height: 8, borderRadius: '2px 2px 2px 0', transform: 'rotate(45deg)', background: '#2FAE9B', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 760, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{destination || 'Choose destination'}</span>
        </div>
      </div>
    </div>
  );
}

// Segmented transport switcher (essential choices, always visible in results)
function CommuteSegmented({ value, onChange }) {
  const opts = [
    { id: 'all',    label: 'All' },
    { id: 'moto',   label: 'Moto' },
    { id: 'car',    label: 'Car' },
    { id: 'shared', label: 'Shared' },
  ];
  return (
    <div style={{ display: 'flex', gap: 7 }}>
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => { pkHaptic('select'); onChange(o.id); }} style={{ flex: 1, height: 52, borderRadius: 13, border: on ? '0' : `1px dashed ${DASH}`, background: on ? ink : 'transparent', color: on ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, transition: 'background 160ms ease' }}>
            <RideTypeIcon type={o.id} size={16} />
            <span style={{ fontSize: 10.5, fontWeight: 700 }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// A single ride result — de-carded dashed row.
function RideRow({ ride, first, onOpen, onCall, onOffer }) {
  const dimmed = !ride.available;
  return (
    <div style={{
      borderTop: first ? 'none' : `1px dashed ${DASH}`,
      padding: '14px 0', display: 'flex', alignItems: 'center', gap: 13, opacity: dimmed ? 0.5 : 1,
    }}>
      {/* Tap the rider to see full details */}
      <button onClick={() => ride.available && onOpen(ride)} disabled={dimmed} style={{
        flex: 1, minWidth: 0, border: 0, background: 'transparent', cursor: dimmed ? 'default' : 'pointer',
        fontFamily: 'inherit', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: 13,
      }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ink06, color: ink }}>
          <RideTypeIcon type={ride.type} size={18} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14.5, fontWeight: 760, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ride.name}</span>
            {ride.verified && <Verified />}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <Stars value={ride.rating} />
            <span style={{ fontSize: 11.5, color: ink40, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ride.vehicle}</span>
          </span>
          <span style={{ display: 'block', fontSize: 11, color: ink40, marginTop: 3, fontFamily: CC_MONO, letterSpacing: '0.02em' }}>
            {dimmed ? 'Fully booked' : `${ride.eta} min away · ${ride.duration} min trip · ${ride.distance} km`}
          </span>
        </span>
      </button>

      {/* Price + quick actions: call to negotiate, or offer your price */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <span style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: 14.5, fontWeight: 820, color: ink, letterSpacing: '-0.01em' }}>{ccPrice(ride.price)}</span>
          <span style={{ display: 'block', fontSize: 10.5, color: ride.type === 'shared' ? '#5B7CFA' : ink40, marginTop: 1, fontWeight: 700 }}>{ride.type === 'shared' ? `${ride.seatsLeft} seats left` : 'per trip'}</span>
        </span>
        {!dimmed && (
          <div style={{ display: 'flex', gap: 7 }}>
            <button onClick={() => onCall(ride)} aria-label={`Call ${ride.name} to negotiate`} title="Call to negotiate" style={{ width: 34, height: 34, borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 0-2z"/></svg>
            </button>
            <button onClick={() => onOffer(ride)} aria-label={`Offer your price to ${ride.name}`} title="Offer your price" style={{ width: 34, height: 34, borderRadius: 999, border: 0, background: ink, color: paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5 9.2 9.5 12 9.5s5 1.1 5 3-2.2 3-5 3-5-1.1-5-3"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RideSkeleton({ first }) {
  return (
    <div style={{ borderTop: first ? 'none' : `1px dashed ${DASH}`, padding: '14px 0', display: 'flex', alignItems: 'center', gap: 13 }}>
      <span className="pk-shimmer" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
      <span style={{ flex: 1 }}>
        <span className="pk-shimmer" style={{ display: 'block', width: '52%', height: 13, borderRadius: 6 }} />
        <span className="pk-shimmer" style={{ display: 'block', width: '74%', height: 11, borderRadius: 6, marginTop: 8 }} />
      </span>
      <span className="pk-shimmer" style={{ width: 56, height: 16, borderRadius: 6 }} />
    </div>
  );
}

// Section heading used across steps
function CommuteStepLabel({ children }) {
  return <div style={{ fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: ink40, paddingBottom: 6 }}>{children}</div>;
}
function DetailRow({ label, value, accent = false, last = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '12px 0', borderBottom: last ? 'none' : `1px dashed ${DASH}` }}>
      <span style={{ fontSize: 12.5, color: ink40 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 760, color: accent ? '#2FAE9B' : ink, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function CommuteScreen({ web, onBack }) {
  // step: plan · results · detail · negotiate · success · share · share-confirm · share-success
  const [step, setStep] = React.useState('plan');
  const [origin, setOrigin] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [tracking, setTracking] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [error, setError] = React.useState('');

  const [typeFilter, setTypeFilter] = React.useState('all');
  const [sort, setSort] = React.useState('fast');
  const [refineOpen, setRefineOpen] = React.useState(false);
  const [topRated, setTopRated] = React.useState(false);
  const [verifiedOnly, setVerifiedOnly] = React.useState(false);

  const [selected, setSelected] = React.useState(null);
  const [destsOpen, setDestsOpen] = React.useState(false);

  // fare negotiation: offer your price, driver accepts or counters; the ride is
  // only booked once you agree and pay. (Quick path skips this and settles on
  // arrival.) negoStatus: idle · thinking · countered · agreed
  const [offer, setOffer] = React.useState('');
  const [negoStatus, setNegoStatus] = React.useState('idle');
  const [counter, setCounter] = React.useState(0);
  const [agreedPrice, setAgreedPrice] = React.useState(0);
  const [payMode, setPayMode] = React.useState('prepaid'); // prepaid · on-arrival

  // ride-with-someone sub-flow
  const [mateQuery, setMateQuery] = React.useState('');
  const [mate, setMate] = React.useState(null);

  const goPlan = () => { pkHaptic('select'); setStep('plan'); setError(''); };
  const back = () => {
    pkHaptic('select');
    if (step === 'results') setStep('plan');
    else if (step === 'detail') setStep('results');
    else if (step === 'negotiate') setStep('detail');
    else if (step === 'success') setStep('plan');
    else if (step === 'share') setStep('plan');
    else if (step === 'share-confirm') setStep('share');
    else if (step === 'share-success') setStep('plan');
    else onBack();
  };

  const setDest = (v) => { setDestination(v); setQuery(v); setError(''); };
  const trackLocation = () => {
    setTracking(true);
    const done = (label) => { setOrigin(label); setTracking(false); };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => done('Your live location'),
        () => done('Kigali — current location'),
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else { done('Kigali — current location'); }
  };

  const runSearch = () => {
    const dest = (query || destination).trim();
    if (!dest) { setError('Add where you’re going to see rides.'); return; }
    setDestination(dest);
    pkHaptic('medium');
    setStep('results');
    setSearching(true);
    setTimeout(() => setSearching(false), 700);
  };

  // Live ride catalog from /api/commute, mapped to the CC_RIDES shape the
  // results pipeline expects. Falls back to CC_RIDES until the store hydrates.
  const everyday = window.useEveryday ? window.useEveryday() : null;
  const liveCommute = (everyday && everyday.commute && everyday.commute.options) || [];
  const liveRides = React.useMemo(() => {
    if (!liveCommute.length) return CC_RIDES;
    return liveCommute.map((opt, i) => ({
      id: opt.id,
      name: opt.driver_name || opt.title || 'Driver',
      type: (opt.vehicle_type || opt.mode || 'moto').toLowerCase(),
      vehicle: opt.vehicle || opt.title || '',
      rating: Number(opt.rating) || 4.6,
      eta: opt.eta_min,
      duration: opt.duration_min || opt.eta_min,
      distance: Number(opt.distance_km) || 0,
      price: opt.price_rwf,
      verified: !!opt.verified,
      available: opt.available !== false,
      seatsLeft: opt.seats_left || undefined,
      // Map pin positions are presentational only — distribute evenly so the
      // demo map stays populated until real geo is plumbed.
      x: `${20 + (i * 13) % 70}%`,
      y: `${30 + (i * 17) % 50}%`,
    }));
  }, [liveCommute]);

  // results pipeline: filter → refine → sort
  const results = React.useMemo(() => {
    let rs = liveRides.slice();
    if (typeFilter !== 'all') rs = rs.filter((r) => r.type === typeFilter);
    if (topRated) rs = rs.filter((r) => r.rating >= 4.8);
    if (verifiedOnly) rs = rs.filter((r) => r.verified);
    const s = CC_SORTS.find((x) => x.id === sort) || CC_SORTS[0];
    rs.sort((a, b) => (a.available === b.available ? 0 : a.available ? -1 : 1) || s.key(a, b));
    return rs;
  }, [liveRides, typeFilter, sort, topRated, verifiedOnly]);

  const openRide = (r) => {
    pkHaptic('select');
    setSelected(r);
    setOffer(String(r.price));
    setNegoStatus('idle'); setCounter(0); setAgreedPrice(0);
    setStep('detail');
  };
  const firstNameOf = (full) => (full || '').split(/[\s+]/)[0] || 'the driver';

  // Quick path: pin the rider and call now — fare is negotiated and settled on
  // arrival. Works from the detail screen or straight from a results row.
  const callOnArrival = (ride) => {
    const r = ride || selected;
    pkHaptic('success');
    setSelected(r);
    setPayMode('on-arrival');
    setAgreedPrice(r.price);
    setStep('success');
  };
  // Offer path: open the negotiation screen for a given ride (from a results row).
  const offerFor = (r) => {
    pkHaptic('select');
    setSelected(r);
    setOffer(String(r.price));
    setNegoStatus('idle'); setCounter(0); setAgreedPrice(0);
    setStep('negotiate');
  };
  // Offer path from the detail screen (selected is already set).
  const startNegotiate = () => { pkHaptic('select'); setNegoStatus('idle'); setStep('negotiate'); };
  const sendOffer = () => {
    const v = parseInt(String(offer).replace(/[^\d]/g, ''), 10);
    if (!v || v <= 0 || negoStatus === 'thinking') return;
    pkHaptic('medium');
    setNegoStatus('thinking');
    setTimeout(() => {
      const floor = Math.round(selected.price * 0.85); // driver won't go below 85%
      if (v >= floor) { setAgreedPrice(Math.min(v, selected.price)); setNegoStatus('agreed'); pkHaptic('success'); }
      else { setCounter(Math.max(floor, Math.round((v + selected.price) / 2))); setNegoStatus('countered'); pkHaptic('light'); }
    }, 900);
  };
  const acceptCounter = () => { pkHaptic('success'); setAgreedPrice(counter); setNegoStatus('agreed'); };
  // Pay the agreed fare; the driver only heads over now.
  const payPrepaid = () => { pkHaptic('success'); setPayMode('prepaid'); setStep('success'); };

  const mates = React.useMemo(() => {
    const q = mateQuery.trim().toLowerCase();
    if (!q) return CC_RIDE_MATES;
    return CC_RIDE_MATES.filter((m) => m.name.toLowerCase().includes(q) || m.heading.toLowerCase().includes(q));
  }, [mateQuery]);
  const openMate = (m) => { pkHaptic('select'); setMate(m); setStep('share-confirm'); };
  const connectMate = () => { pkHaptic('success'); setStep('share-success'); };

  const title = step === 'share' || step === 'share-confirm' || step === 'share-success' ? 'Ride together' : 'Commute';

  const header = (
    <ScreenHeader left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <IconBtn onClick={back}>
        {step === 'plan' ? (
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3l-5 5 5 5"/></svg>
        )}
      </IconBtn>
      <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>{title}</span>
    </div>} />
  );

  const sheetPad = web ? '18px 60px 40px' : '10px 20px 30px';
  const ctaPad = web ? 0 : 96; // clear of the bottom-centre + launcher on mobile

  // ───────────────────────────── PLAN ─────────────────────────────
  if (step === 'plan') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        {header}
        <div className="cc-scroll" style={{ flex: 1, minHeight: 0, overflowY: web ? 'hidden' : 'auto', padding: web ? '16px 32px 32px' : '8px 14px 18px', display: 'grid', gridTemplateColumns: web ? 'minmax(0,1.25fr) minmax(330px,0.75fr)' : '1fr', gridTemplateRows: web ? '1fr' : 'auto auto', gap: web ? 18 : 12 }}>
          <CommuteMap origin={origin} destination={query || destination} riders={CC_RIDES} phase="plan" height={web ? undefined : 240} radius={web ? 28 : 22} />

          <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: web ? 'center' : 'flex-start' }}>
            <div className="pk-stagger">
              <CommuteStepLabel>Where from?</CommuteStepLabel>
              <DashField value={origin} onChange={setOrigin} placeholder="Current location or address"
                prefix={(
                  <button onClick={trackLocation} aria-label="Use current location" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: tracking ? '#2FAE9B' : ink55, padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>
                  </button>
                )} />
              {tracking && <div style={{ marginTop: 8, fontSize: 12, color: ink40 }}>Finding your location…</div>}

              <div style={{ marginTop: 22 }}>
                <CommuteStepLabel>Where to?</CommuteStepLabel>
                <DashField value={query} onChange={(v) => { setQuery(v); setError(''); }} placeholder="Search or name a destination"
                  prefix={(<span style={{ color: ink40, display: 'flex', flexShrink: 0 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></span>)}
                  suffix={query.trim() ? (<button onClick={() => { setQuery(''); }} aria-label="Clear" style={{ border: 0, background: 'transparent', color: ink25, cursor: 'pointer', display: 'flex', flexShrink: 0, padding: 4 }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg></button>) : null} />
              </div>

              {/* Saved places + recent destinations — contextual to destination selection */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {CC_PLACES.map((p) => (
                  <button key={p.id} onClick={() => setDest(p.addr)} style={{ height: 36, padding: '0 13px', borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color: ink70, display: 'flex', alignItems: 'center', gap: 7 }}>
                    {p.kind === 'home'
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ink55} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ink55} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>}
                    {p.label}
                  </button>
                ))}
                {query.trim() === '' && CC_RECENT_DESTS.slice(0, 2).map((d) => (
                  <button key={d} onClick={() => setDest(d)} style={{ height: 36, padding: '0 13px', borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, color: ink55 }}>{d}</button>
                ))}
              </div>

              {/* live suggestions while typing */}
              {query.trim() && (
                <div style={{ marginTop: 12 }}>
                  {CC_RECENT_DESTS.filter((s) => s.toLowerCase().includes(query.trim().toLowerCase())).map((item, i) => (
                    <button key={item} onClick={() => setDest(item)} style={{ width: '100%', border: 0, borderTop: i === 0 ? 'none' : `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '11px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ink40} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>
                      <span style={{ fontSize: 14, fontWeight: 600, color: ink70 }}>{item}</span>
                    </button>
                  ))}
                </div>
              )}

              {error && <div style={{ marginTop: 14, fontSize: 12.5, color: '#C8102E', fontWeight: 600 }}>{error}</div>}

              <button onClick={runSearch} style={{ marginTop: 18, width: '100%', height: 54, borderRadius: 16, border: 0, background: ink, color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 760, letterSpacing: '-0.01em', boxShadow: '0 14px 34px rgba(10,10,10,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                Find rides
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>

              <button onClick={() => { pkHaptic('select'); setStep('share'); }} style={{ marginTop: 12, width: '100%', height: 48, borderRadius: 14, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.5a3 3 0 0 1 0 5.8M18.5 19a5.5 5.5 0 0 0-3-4.9"/></svg>
                Ride with someone
              </button>

              <div style={{ marginTop: 14 }}>
                <RecentSection title="Recent destinations" count={CC_RECENT_DESTS.length} open={destsOpen} onToggle={() => setDestsOpen((o) => !o)}>
                  {CC_RECENT_DESTS.map((item, i) => (
                    <button key={item} onClick={() => setDest(item)} style={{ width: '100%', border: 0, borderTop: i === 0 ? 'none' : `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: ink70 }}>{item}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: ink25 }}>Set</span>
                    </button>
                  ))}
                </RecentSection>
              </div>
            </div>
            {!web && <div aria-hidden="true" style={{ flexShrink: 0, height: 96 }} />}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────── RESULTS ────────────────────────────
  if (step === 'results') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        {header}
        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: sheetPad }}>
          <div className="pk-stagger" style={{ width: '100%', maxWidth: web ? 620 : 'none', margin: '0 auto', paddingBottom: ctaPad }}>
            <button onClick={goPlan} style={{ width: '100%', border: `1px dashed ${DASH}`, borderRadius: 14, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: ink, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{origin || 'Current location'} → {destination}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: ink40, flexShrink: 0 }}>Edit</span>
            </button>

            <div style={{ marginTop: 16 }}>
              <CommuteSegmented value={typeFilter} onChange={setTypeFilter} />
            </div>

            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: ink40, fontWeight: 600 }}>{searching ? 'Finding rides…' : `${results.length} ride${results.length === 1 ? '' : 's'} nearby`}</span>
              <button onClick={() => setRefineOpen((o) => !o)} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 760, color: ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
                Refine
              </button>
            </div>

            {refineOpen && (
              <div className="pk-rise" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${DASH}` }}>
                <CommuteStepLabel>Sort by</CommuteStepLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {CC_SORTS.map((s) => {
                    const on = sort === s.id;
                    return <button key={s.id} onClick={() => { pkHaptic('select'); setSort(s.id); }} style={{ height: 34, padding: '0 14px', borderRadius: 999, border: on ? '0' : `1px dashed ${DASH}`, background: on ? ink : 'transparent', color: on ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700 }}>{s.label}</button>;
                  })}
                </div>
                <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
                  <button onClick={() => setTopRated((v) => !v)} style={{ height: 34, padding: '0 14px', borderRadius: 999, border: topRated ? '0' : `1px dashed ${DASH}`, background: topRated ? ink : 'transparent', color: topRated ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700 }}>4.8★ and up</button>
                  <button onClick={() => setVerifiedOnly((v) => !v)} style={{ height: 34, padding: '0 14px', borderRadius: 999, border: verifiedOnly ? '0' : `1px dashed ${DASH}`, background: verifiedOnly ? ink : 'transparent', color: verifiedOnly ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700 }}>Verified only</button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              {searching ? (
                [0, 1, 2, 3].map((i) => <RideSkeleton key={i} first={i === 0} />)
              ) : results.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ink06, color: ink40 }}>
                    <RideTypeIcon type={typeFilter === 'all' ? 'profile' : typeFilter} size={20} />
                  </div>
                  <div style={{ marginTop: 14, fontSize: 14.5, fontWeight: 760, color: ink }}>No rides match</div>
                  <div style={{ marginTop: 4, fontSize: 12.5, color: ink40 }}>Try another type or clear your filters.</div>
                  <button onClick={() => { setTypeFilter('all'); setTopRated(false); setVerifiedOnly(false); }} style={{ marginTop: 16, height: 40, padding: '0 18px', borderRadius: 999, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 760 }}>Reset filters</button>
                </div>
              ) : (
                results.map((r, i) => <RideRow key={r.id} ride={r} first={i === 0} onOpen={openRide} onCall={callOnArrival} onOffer={offerFor} />)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────── DETAIL ────────────────────────────
  if (step === 'detail' && selected) {
    const r = selected;
    const fee = Math.round(r.price * 0.1);
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        {header}
        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: sheetPad }}>
          <div className="pk-stagger" style={{ width: '100%', maxWidth: web ? 560 : 'none', margin: '0 auto', paddingBottom: ctaPad }}>
            <CommuteMap origin={origin} destination={destination} phase="route" height={170} radius={20} />

            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{ width: 50, height: 50, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ink06, color: ink }}><RideTypeIcon type={r.type} size={22} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 18, fontWeight: 820, letterSpacing: '-0.02em', color: ink }}>{r.name}</span>
                  {r.verified && <Verified size={15} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <Stars value={r.rating} />
                  <span style={{ fontSize: 12.5, color: ink40 }}>{r.vehicle}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <DetailRow label="Pickup ETA" value={`${r.eta} min`} />
              <DetailRow label="Trip time" value={`${r.duration} min`} />
              <DetailRow label="Distance" value={`${r.distance} km`} />
              {r.type === 'shared' && <DetailRow label="Seats left" value={`${r.seatsLeft}`} />}
              <DetailRow label="Pickup" value={origin || 'Current location'} />
              <DetailRow label="Drop-off" value={destination} last />
            </div>

            <div style={{ marginTop: 20 }}>
              <CommuteStepLabel>Fare breakdown</CommuteStepLabel>
              <DetailRow label="Base fare" value={ccPrice(r.price - fee)} />
              <DetailRow label="Service" value={ccPrice(fee)} />
              <DetailRow label="Total" value={ccPrice(r.price)} accent last />
            </div>

            <div style={{ marginTop: 18, display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 14, background: ink06 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2FAE9B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9.3 12l1.9 1.9 3.6-3.8"/></svg>
              <span style={{ fontSize: 12.5, color: ink55, lineHeight: 1.45 }}>Driver is ID-verified. Share your live trip and reach support any time from the ride.</span>
            </div>

            <div style={{ marginTop: 22, display: 'grid', gap: 10 }}>
              <button onClick={startNegotiate} style={{ width: '100%', minHeight: 56, borderRadius: 18, border: 0, background: ink, color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 760, boxShadow: '0 16px 38px rgba(10,10,10,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 16px' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5 9.2 9.5 12 9.5s5 1.1 5 3-2.2 3-5 3-5-1.1-5-3"/></svg>
                Offer your price
              </button>
              <button onClick={() => callOnArrival()} style={{ width: '100%', minHeight: 52, borderRadius: 16, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 0-2z"/></svg>
                Call &amp; pay on arrival
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: ink40, lineHeight: 1.45, textAlign: 'center' }}>Offer a fare and {firstNameOf(r.name)} comes once you agree and pay — or call now and settle the price when they reach you.</div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────── NEGOTIATE ───────────────────────────
  // Offer your price → driver accepts or counters → pay → they head over.
  if (step === 'negotiate' && selected) {
    const r = selected;
    const fn = firstNameOf(r.name);
    const offerNum = parseInt(String(offer).replace(/[^\d]/g, ''), 10) || 0;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        {header}
        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: sheetPad }}>
          <div className="pk-stagger" style={{ width: '100%', maxWidth: web ? 520 : 'none', margin: '0 auto', minHeight: '100%', display: 'flex', flexDirection: 'column', paddingBottom: ctaPad }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: web ? 36 : 30, fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.05, color: ink }}>Name your fare.</div>
              <div style={{ marginTop: 8, fontSize: 14, color: ink55 }}>Offer a price for {fn}. They’ll accept or counter — and only head over once you both agree and you’ve paid.</div>

              <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 13 }}>
                <span style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ink06, color: ink }}><RideTypeIcon type={r.type} size={18} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 15, fontWeight: 800, color: ink }}>{r.name}</span>{r.verified && <Verified />}</div>
                  <div style={{ fontSize: 12, color: ink40, marginTop: 1 }}>{destination} · {r.duration} min</div>
                </div>
                <span style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ display: 'block', fontFamily: CC_MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink40 }}>Listed</span>
                  <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, color: ink }}>{ccPrice(r.price)}</span>
                </span>
              </div>

              <div style={{ marginTop: 22 }}>
                <DashField label="Your offer" big inputMode="numeric" value={offer}
                  onChange={(v) => { setOffer(v.replace(/[^\d]/g, '')); if (negoStatus !== 'idle') setNegoStatus('idle'); }}
                  prefix={(<span style={{ alignSelf: 'center', fontFamily: CC_MONO, fontSize: 14, fontWeight: 700, color: ink40, letterSpacing: '0.04em' }}>RWF</span>)} />
                {/* quick offers — contextual nudges around the listed fare */}
                {(negoStatus === 'idle' || negoStatus === 'countered') && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
                    {[0.8, 0.9, 1].map((m) => {
                      const val = Math.round(r.price * m / 50) * 50;
                      const on = offerNum === val;
                      return <button key={m} onClick={() => { pkHaptic('select'); setOffer(String(val)); setNegoStatus('idle'); }} style={{ flex: 1, height: 38, borderRadius: 10, border: on ? '0' : `1px dashed ${DASH}`, background: on ? ink : 'transparent', color: on ? paper : ink55, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700 }}>{ccPrice(val)}</button>;
                    })}
                  </div>
                )}
              </div>

              {negoStatus === 'thinking' && (
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, color: ink55 }}>
                  <svg className="pk-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ink40} strokeWidth="2" strokeLinecap="round"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
                  <span style={{ fontSize: 13 }}>Sending your offer to {fn}…</span>
                </div>
              )}

              {negoStatus === 'countered' && (
                <div className="pk-rise" style={{ marginTop: 20, padding: '16px 16px', borderRadius: 16, background: ink06 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 760, color: ink }}>{fn} counters</span>
                    <span style={{ fontSize: 18, fontWeight: 850, letterSpacing: '-0.02em', color: ink }}>{ccPrice(counter)}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12.5, color: ink55, lineHeight: 1.45 }}>That’s a fair meeting point. Accept it, or send a higher offer.</div>
                  <button onClick={acceptCounter} style={{ marginTop: 14, width: '100%', height: 46, borderRadius: 12, border: 0, background: '#2FAE9B', color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 760 }}>Accept {ccPrice(counter)}</button>
                </div>
              )}

              {negoStatus === 'agreed' && (
                <div className="pk-rise" style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 16, background: 'rgba(47,174,155,0.10)' }}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2FAE9B', color: paper }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: ink }}>Agreed at {ccPrice(agreedPrice)}</div>
                      <div style={{ fontSize: 12, color: ink55, marginTop: 1 }}>Pay now and {fn} heads to {origin || 'your pickup'}.</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <DetailRow label="Pickup" value={origin || 'Current location'} />
                    <DetailRow label="Drop-off" value={destination} />
                    <DetailRow label="Pay with" value="Everyday Wallet" />
                    <DetailRow label="Agreed fare" value={ccPrice(agreedPrice)} accent last />
                  </div>
                </div>
              )}
            </div>

            {negoStatus === 'agreed' ? (
              <button onClick={payPrepaid} style={{ marginTop: 22, width: '100%', height: 58, borderRadius: 18, border: 0, background: ink, color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 760, boxShadow: '0 18px 40px rgba(10,10,10,0.22)' }}>Pay {ccPrice(agreedPrice)} &amp; confirm</button>
            ) : (
              <button onClick={sendOffer} disabled={negoStatus === 'thinking' || !offerNum} style={{ marginTop: 22, width: '100%', height: 58, borderRadius: 18, border: negoStatus === 'thinking' || !offerNum ? `2px dashed ${ink12}` : 0, background: negoStatus === 'thinking' || !offerNum ? 'transparent' : ink, color: negoStatus === 'thinking' || !offerNum ? ink25 : paper, cursor: negoStatus === 'thinking' || !offerNum ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 760, boxShadow: negoStatus === 'thinking' || !offerNum ? 'none' : '0 18px 40px rgba(10,10,10,0.22)', transition: 'background 180ms ease, color 180ms ease' }}>
                {negoStatus === 'thinking' ? `Waiting for ${fn}…` : negoStatus === 'countered' ? 'Send new offer' : 'Send offer'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────── SUCCESS ────────────────────────────
  if (step === 'success' && selected) {
    const r = selected;
    const price = agreedPrice || r.price;
    const prepaid = payMode === 'prepaid';
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        {header}
        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: sheetPad }}>
          <div className="pk-stagger" style={{ width: '100%', maxWidth: web ? 480 : 'none', margin: '0 auto', paddingBottom: ctaPad }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#2FAE9B', color: paper, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(47,174,155,0.30)' }}>
              <svg width="30" height="30" viewBox="0 0 34 34" fill="none"><path className="pk-check-path" d="M8 17.5l6 6L26 10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ marginTop: 22, fontSize: web ? 36 : 30, fontWeight: 850, letterSpacing: '-0.04em', color: ink }}>{prepaid ? `${r.name} is on the way.` : `${r.name} is coming to you.`}</div>
            <div style={{ marginTop: 8, fontSize: 14.5, color: ink55 }}>{prepaid ? `Paid · arriving in about ${r.eta} minutes.` : `Arriving in about ${r.eta} minutes — settle the fare when they reach you.`}</div>

            <div style={{ marginTop: 22 }}>
              <CommuteMap origin={origin} destination={destination} phase="route" height={160} radius={20} />
            </div>

            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ink06, color: ink }}><RideTypeIcon type={r.type} size={20} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 15.5, fontWeight: 800, color: ink }}>{r.name}</span>{r.verified && <Verified />}</div>
                <div style={{ fontSize: 12.5, color: ink40, marginTop: 1 }}>{r.vehicle} · {ccPrice(price)}</div>
              </div>
              <span style={{ fontFamily: CC_MONO, fontSize: 11, fontWeight: 700, color: '#2FAE9B', padding: '5px 9px', borderRadius: 999, background: 'rgba(47,174,155,0.12)' }}>{prepaid ? 'EN ROUTE' : 'HEADING OVER'}</span>
            </div>

            <div style={{ marginTop: 16 }}>
              <DetailRow label={prepaid ? 'Paid' : 'Pay on arrival'} value={prepaid ? `${ccPrice(price)} · Wallet` : ccPrice(price)} accent={!prepaid} last />
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, height: 52, borderRadius: 16, border: 0, background: ink, color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 0-2z"/></svg>
                Call
              </button>
              <button style={{ flex: 1, height: 52, borderRadius: 16, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8 9 9 0 0 1-4-1L3 20l1.5-4a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 17 0z"/></svg>
                Message
              </button>
            </div>

            <button onClick={goPlan} style={{ marginTop: 12, width: '100%', height: 50, borderRadius: 16, border: 0, background: 'transparent', color: ink40, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700 }}>Back to commute</button>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────── RIDE WITH SOMEONE (sub-flow) ─────────────────────
  if (step === 'share') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        {header}
        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: sheetPad }}>
          <div className="pk-stagger" style={{ width: '100%', maxWidth: web ? 560 : 'none', margin: '0 auto', paddingBottom: ctaPad }}>
            <div style={{ fontSize: web ? 32 : 27, fontWeight: 840, letterSpacing: '-0.04em', lineHeight: 1.08, color: ink }}>Find someone going your way.</div>
            <div style={{ marginTop: 8, fontSize: 14, color: ink55 }}>Connect with a verified rider, negotiate, and share the trip.</div>

            <div style={{ marginTop: 20 }}>
              <DashField value={mateQuery} onChange={setMateQuery} placeholder="Search a name, number, or destination"
                prefix={(<span style={{ color: ink40, display: 'flex', flexShrink: 0 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></span>)} />
            </div>

            <div style={{ marginTop: 20 }}>
              <CommuteStepLabel>Riders nearby · {mates.length}</CommuteStepLabel>
              {mates.length === 0 ? (
                <div style={{ padding: '34px 0', textAlign: 'center', fontSize: 13, color: ink40 }}>No matching riders yet. Try another name or destination.</div>
              ) : mates.map((m, i) => (
                <button key={m.id} onClick={() => openMate(m)} style={{ width: '100%', border: 0, borderTop: i === 0 ? 'none' : `1px dashed ${DASH}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '14px 0', display: 'flex', alignItems: 'center', gap: 13 }}>
                  <span style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ink06, color: ink }}><RideTypeIcon type={m.type} size={18} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 14.5, fontWeight: 760, color: ink }}>{m.name}</span>{m.verified && <Verified />}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}><Stars value={m.rating} /><span style={{ fontSize: 11.5, color: ink40 }}>{m.vehicle}</span></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, minWidth: 0 }}>
                      <span style={{ flexShrink: 0, whiteSpace: 'nowrap', fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.04em', color: '#5B7CFA', fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'rgba(91,124,250,0.12)' }}>{m.route}</span>
                      <span style={{ fontSize: 11, color: ink40, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>→ {m.heading} · {m.when}</span>
                    </span>
                  </span>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={ink25} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M6 3l5 5-5 5"/></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'share-confirm' && mate) {
    const m = mate;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        {header}
        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: sheetPad }}>
          <div className="pk-stagger" style={{ width: '100%', maxWidth: web ? 520 : 'none', margin: '0 auto', paddingBottom: ctaPad }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ink06, color: ink }}><RideTypeIcon type={m.type} size={24} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 20, fontWeight: 840, letterSpacing: '-0.02em', color: ink }}>{m.name}</span>{m.verified && <Verified size={16} />}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}><Stars value={m.rating} /><span style={{ fontSize: 12.5, color: ink40 }}>{m.vehicle}</span></div>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <CommuteMap origin={origin} destination={m.heading} phase="route" height={160} radius={20} />
            </div>

            <div style={{ marginTop: 18 }}>
              <DetailRow label="Heading to" value={m.heading} />
              <DetailRow label="Departure" value={m.when} />
              <DetailRow label="Seats available" value={`${m.seatsLeft}`} />
              <DetailRow label="Route match" value={m.route} accent last />
            </div>

            <div style={{ marginTop: 16, fontSize: 12.5, color: ink40, lineHeight: 1.5 }}>Call to agree on pickup and a fair split before they pull up.</div>

            <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
              <button onClick={connectMate} style={{ flex: 1, height: 56, borderRadius: 18, border: 0, background: ink, color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 16px 38px rgba(10,10,10,0.22)' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 0-2z"/></svg>
                Call to negotiate
              </button>
            </div>
            <button onClick={connectMate} style={{ marginTop: 10, width: '100%', height: 48, borderRadius: 14, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 760 }}>Request to join the ride</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'share-success' && mate) {
    const m = mate;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
        {header}
        <div className="cc-scroll" style={{ flex: 1, overflow: 'auto', padding: sheetPad }}>
          <div className="pk-stagger" style={{ width: '100%', maxWidth: web ? 480 : 'none', margin: '0 auto', paddingBottom: ctaPad }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#5B7CFA', color: paper, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(91,124,250,0.30)' }}>
              <svg width="30" height="30" viewBox="0 0 34 34" fill="none"><path className="pk-check-path" d="M8 17.5l6 6L26 10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ marginTop: 22, fontSize: web ? 34 : 28, fontWeight: 850, letterSpacing: '-0.04em', color: ink }}>You’re connected with {m.name.replace(/\.$/, '')}.</div>
            <div style={{ marginTop: 8, fontSize: 14.5, color: ink55 }}>Agree on a pickup point and they’ll head your way.</div>

            <div style={{ marginTop: 22 }}>
              <DetailRow label="Rider" value={m.name} />
              <DetailRow label="Heading to" value={m.heading} />
              <DetailRow label="Departure" value={m.when} last />
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, height: 52, borderRadius: 16, border: 0, background: ink, color: paper, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={paper} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 0-2z"/></svg>
                Call
              </button>
              <button style={{ flex: 1, height: 52, borderRadius: 16, border: `1px dashed ${DASH}`, background: 'transparent', color: ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8 9 9 0 0 1-4-1L3 20l1.5-4a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 17 0z"/></svg>
                Message
              </button>
            </div>
            <button onClick={goPlan} style={{ marginTop: 12, width: '100%', height: 50, borderRadius: 16, border: 0, background: 'transparent', color: ink40, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700 }}>Back to commute</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Collapsible recents section — header toggles a dashed-divided list open.
// Ride-type glyphs for the commute filter: all · moto · car · profile.
function RideTypeIcon({ type, size = 17 }) {
  if (type === 'moto') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="16.5" r="3"/><circle cx="18.5" cy="16.5" r="3"/><path d="M8.5 16.5h4l3-6h3.5M14 8h3l1.5 5M7 10.5h5.5"/></svg>);
  if (type === 'car') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13l1.8-4.6A2 2 0 0 1 6.7 7h10.6a2 2 0 0 1 1.9 1.4L21 13v4h-2.2M3 17v-4m2.2 4H3m18 0h-2.2M5.2 17h13.6"/><circle cx="7.2" cy="17" r="1.6"/><circle cx="16.8" cy="17" r="1.6"/></svg>);
  if (type === 'profile') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>);
  if (type === 'shared') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8.5" cy="8" r="2.8"/><circle cx="16" cy="9.5" r="2.3"/><path d="M3.5 19a5 5 0 0 1 10 0M14 19a4.4 4.4 0 0 1 6.5-3.4"/></svg>);
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>);
}

function RecentSection({ title, count, open, onToggle, children }) {
  return (
    <div style={{ borderTop: `1px dashed ${DASH}` }}>
      <button onClick={onToggle} aria-expanded={open} style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: ink40 }}>{title}{count != null ? ` · ${count}` : ''}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={ink40} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease' }}><path d="M6 3l5 5-5 5"/></svg>
      </button>
      {open && <div className="pk-rise" style={{ paddingBottom: 8 }}>{children}</div>}
    </div>
  );
}

function ConnectionRow({ label, value, last = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: last ? 'none' : `1px dashed ${DASH}` }}>
      <span style={{ fontSize: 12, color: ink40 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: ink, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function CommuteOption({ title, meta, price, active = false, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', minHeight: 60, border: 0, borderRadius: 16,
      background: active ? ink : 'transparent',
      color: active ? paper : ink,
      boxShadow: active ? '0 14px 32px rgba(10,10,10,0.16)' : 'none',
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(255,255,255,0.16)' : ink06, color: active ? paper : ink }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 11a3 3 0 0 1 6 0c0 2-3 3.2-3 5M12 18h.01"/></svg>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14.5, fontWeight: 760 }}>{title}</span>
        <span style={{ display: 'block', marginTop: 2, fontSize: 11.5, color: active ? 'rgba(255,255,255,0.62)' : ink40 }}>{meta} · {price}</span>
      </span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: active ? 'rgba(255,255,255,0.7)' : ink25, flexShrink: 0 }}>{active ? 'Chosen' : 'Choose'}</span>
    </button>
  );
}

function SaveMetric({ label, value, accent = false, compact = false }) {
  return (
    <div style={{
      minHeight: compact ? 34 : 40,
      borderBottom: `1px dashed ${DASH}`,
      padding: compact ? '5px 0' : '8px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
    }}>
      <span style={{ fontSize: compact ? 11 : 12, fontWeight: 750, color: ink40 }}>{label}</span>
      <span style={{ fontSize: compact ? 13.5 : 16, fontWeight: 820, letterSpacing: '-0.02em', color: accent ? '#2FAE9B' : ink, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function SaveAction({ label, sub, onClick, selected = false, compact = false }) {
  const [hovered, setHovered] = React.useState(false);
  const active = selected || hovered;
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="pk-calm-action" style={{
      minHeight: compact ? 46 : 54,
      border: active ? '0' : `1px dashed ${DASH}`,
      borderRadius: 13,
      background: active ? ink : 'transparent',
      color: active ? paper : ink,
      boxShadow: active ? '0 12px 28px rgba(10,10,10,0.16)' : 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      textAlign: 'left',
      padding: compact ? '8px 11px' : '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 2,
    }}>
      <span style={{ fontSize: compact ? 12.5 : 13.5, fontWeight: 800, letterSpacing: '-0.01em' }}>{label}</span>
      <span style={{ fontSize: compact ? 10 : 10.5, fontWeight: 600, color: active ? 'rgba(255,255,255,0.6)' : ink40 }}>{sub}</span>
    </button>
  );
}

function CapitalScreen({ accent, web, onMoney, onWallet, onProfile, onCredit, onGrowth, onBack }) {
  // Live Save data from /api/save (Go microservice). The store hydrates on
  // session-ready; until then we fall back to CC_SAVINGS so the ring still
  // renders meaningfully in dev / preview / signed-out.
  const everyday = window.useEveryday ? window.useEveryday() : null;
  const liveWallet = everyday && everyday.save && everyday.save.wallet;
  const liveTransactions = (everyday && everyday.save && everyday.save.transactions) || null;
  const p = CC_PORTFOLIO;
  const s = liveWallet
    ? Object.assign({}, CC_SAVINGS, { balance: liveWallet.savings_rwf || 0 })
    : CC_SAVINGS;
  const c = CC_CREDIT;
  const millions = (s.balance / 1000000).toFixed(2);
  const [hidden, setHidden] = React.useState(false);
  const [selectedSaveAction, setSelectedSaveAction] = React.useState('add');
  const [nextTarget, setNextTarget] = React.useState(600000);
  const saveMonths = [
    { label: 'June', saved: s.savedThisMonth, historyStart: s.historyStartLabel, history: s.history },
    { label: 'May', saved: 300000, historyStart: 'May 2024', history: s.history.map((v, i) => Math.round(v - 180000 + i * 6000)) },
    { label: 'April', saved: 250000, historyStart: 'Apr 2024', history: s.history.map((v, i) => Math.round(v - 420000 + i * 9000)) },
  ];
  const [saveMonthKey, setSaveMonthKey] = React.useState(saveMonths[0].label);
  const saveMonth = saveMonths.find((m) => m.label === saveMonthKey) || saveMonths[0];
  const showMoney = (value) => hidden ? 'Hidden' : fmtRWF(value);
  const limit = c.capacity;
  const left = Math.max(0, c.available);
  const standingGood = /good/i.test(c.status || '');
  const compactSave = !web && typeof window !== 'undefined' && window.innerHeight < 740;
  const ringSize = web ? 340 : (compactSave ? 230 : 264);
  const ringStroke = web ? 22 : (compactSave ? 15 : 17);
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringRadius;
  const leftPct = Math.max(0, Math.min(100, Math.round((left / limit) * 100)));
  const leftDash = ringCirc * (leftPct / 100);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: canvas }}>
      <ScreenHeader
        left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onBack && <IconBtn onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconBtn>}
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>Save</span>
        </div>}
      />

      <div className="cc-scroll" style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: web ? '18px 48px 36px' : compactSave ? '4px 16px 18px' : '8px 18px 22px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: web ? 780 : 420,
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: web ? 'center' : 'flex-start',
          gap: web ? 20 : (compactSave ? 10 : 14),
        }}>
          <div style={{
            background: 'transparent',
            border: '0',
            borderRadius: 0,
            padding: web ? '14px 10px' : compactSave ? '2px 0' : '6px 2px',
            display: 'flex',
            flexDirection: web ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: web ? 34 : (compactSave ? 8 : 14),
          }}>
            <div style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
              <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius} fill="none" stroke="rgba(10,10,10,0.08)" strokeWidth={ringStroke} />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke={standingGood ? '#2FAE9B' : '#C8102E'}
                  strokeWidth={ringStroke}
                  strokeLinecap="round"
                  strokeDasharray={`${leftDash} ${ringCirc - leftDash}`}
                />
              </svg>
              <div style={{
                position: 'absolute',
                inset: ringStroke + (compactSave ? 12 : 16),
                borderRadius: '50%',
                background: 'rgba(250,246,241,0.72)',
                boxShadow: 'inset 0 1px 8px rgba(10,10,10,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: compactSave ? 12 : 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ink40 }}>Saved</div>
                <div style={{
                  marginTop: 6,
                  fontSize: web ? 30 : (compactSave ? 20 : 23),
                  fontWeight: 850,
                  letterSpacing: '-0.04em',
                  color: ink,
                  lineHeight: 1,
                }}>{showMoney(s.balance)}</div>
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: ink55 }}>
                  {leftPct}% available
                </div>
              </div>
            </div>

            <div style={{ width: '100%', display: 'grid', gap: 10 }}>
              <div style={{ fontSize: web ? 30 : (compactSave ? 20 : 23), fontWeight: 820, letterSpacing: '-0.04em', color: ink }}>
                Build wealth one save at a time.
              </div>
              <div style={{ display: 'grid', gap: compactSave ? 4 : 7, marginTop: compactSave ? 0 : 4 }}>
                <SaveMetric label="Left" value={showMoney(left)} compact={compactSave} />
                <SaveMetric label="Limit" value={showMoney(limit)} compact={compactSave} />
                <SaveMetric label="Interest earned" value={showMoney(s.returnsEarned)} accent compact={compactSave} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'transparent',
            border: 0,
            borderTop: `1px dashed ${DASH}`,
            borderBottom: `1px dashed ${DASH}`,
            borderRadius: 0,
            padding: compactSave ? '10px 0' : '14px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 750, color: ink40 }}>Standing</div>
              <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, color: ink }}>{c.status}</div>
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: standingGood ? '#2FAE9B' : '#C8102E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: paper,
              flexShrink: 0,
            }}>
              {standingGood ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10.5l4 4L16 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v7M10 15h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: web ? 'repeat(4, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
            gap: web ? 12 : 10,
          }}>
            <SaveAction label="Save" sub="Top up wallet" selected={selectedSaveAction === 'add'} onClick={() => { setSelectedSaveAction('add'); onMoney('add'); }} compact={compactSave} />
            <SaveAction label="Borrow" sub="Against income" selected={selectedSaveAction === 'borrow'} onClick={() => { setSelectedSaveAction('borrow'); onMoney('borrow'); }} compact={compactSave} />
            <SaveAction label="Repay" sub="What you owe" selected={selectedSaveAction === 'repay'} onClick={() => { setSelectedSaveAction('repay'); onMoney('repay'); }} compact={compactSave} />
            <SaveAction label="Withdraw" sub="Take money out" selected={selectedSaveAction === 'withdraw'} onClick={() => { setSelectedSaveAction('withdraw'); onMoney('withdraw'); }} compact={compactSave} />
          </div>
        </div>
      </div>
    </div>
  );
  const mask = (v) => (hidden ? '••••••' : v);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
    }}>
      <ScreenHeader
        left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onBack && <IconBtn onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconBtn>}
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: ink }}>Save</span>
        </div>}
        right={<>
          <IconBtn onClick={onWallet}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <rect x="2" y="4" width="12" height="9" rx="1.5"
                    stroke={ink} strokeWidth="1.3" fill="none"/>
              <path d="M2 7h12" stroke={ink} strokeWidth="1.3"/>
              <circle cx="11" cy="10" r="1" fill={ink}/>
            </svg>
          </IconBtn>
          <button onClick={onProfile} aria-label="Profile" style={{
            background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
          }}>
            <Avatar initials={p.user.initials} size={36} />
          </button>
        </>}
      />

      <div style={{ flex: 1, overflow: 'hidden', scrollbarWidth: 'none', ...(web ? { maxWidth: 700, margin: '0 auto', width: '100%' } : {}) }} className="cc-scroll">
        {/* Greeting */}
        <div style={{ padding: '10px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, color: ink70, whiteSpace: 'nowrap' }}>Good morning, {p.user.name}.</div>
          <EyeToggle hidden={hidden} onToggle={() => setHidden((h) => !h)} />
        </div>

        {/* Stats — savings + earnings, like the reference's top-left figures */}
        <SaveDashboard
          balance={mask(fmtRWF(s.balance))}
          earned={mask(fmtRWF(s.returnsEarned))}
          savedMonth={mask(fmtRWF(saveMonth.saved))}
          month={saveMonth.label}
          months={saveMonths}
          selectedMonth={saveMonthKey}
          onMonth={setSaveMonthKey}
          history={saveMonth.history}
          historyStart={saveMonth.historyStart}
          onMoney={onMoney}
          onGrowth={onGrowth}
        />

        <SavePlanCard
          target={nextTarget}
          onTarget={setNextTarget}
        />

        <SaveCreditCard
          available={mask(fmtRWF(c.available))}
          onCredit={onCredit}
        />

        <SaveHistoryStrip
          saved={mask(fmtRWF(s.savedThisMonth))}
          borrowed={mask(fmtRWF(c.outstanding))}
          paid={mask(c.nextPayment.amount)}
          earned={mask(fmtRWF(s.returnsEarned))}
        />

        <div style={{ display: 'none', padding: '12px 20px 4px' }}>
          <Eyebrow style={{ marginBottom: 4 }}>Total savings</Eyebrow>
          <div style={{
            fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1,
            fontFeatureSettings: '"tnum"', color: ink, userSelect: 'none',
          }}>{hidden ? 'RWF ••••••' : fmtRWF(s.balance)}</div>

          <button onClick={onGrowth} style={{
            marginTop: 14, padding: 0, background: 'transparent', border: 0,
            cursor: 'pointer', display: 'block', textAlign: 'left',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontSize: 12.5, fontWeight: 600, color: ink55, marginBottom: 4,
            }}>
              Earnings
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                color: teal, fontWeight: 700,
              }}>
                <svg width="11" height="11" viewBox="0 0 12 12">
                  <path d="M6 9.5V3M3 5.5L6 2.5l3 3" stroke={teal} strokeWidth="1.6" fill="none"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {s.returnsPct}%
              </span>
            </div>
            <div style={{
              fontSize: 20, fontWeight: 800, letterSpacing: '-0.015em', lineHeight: 1,
              fontFeatureSettings: '"tnum"', color: ink, whiteSpace: 'nowrap',
            }}>{hidden ? 'RWF ••••••' : fmtRWF(s.returnsEarned)}</div>
          </button>
        </div>

        {/* Amber growth chart */}
        <div style={{ display: 'none', padding: '6px 14px 0' }}>
          <Sparkline data={s.history} accent={amber} height={104} />
        </div>
        <div style={{
          display: 'none', justifyContent: 'space-between',
          padding: '4px 20px 0', fontSize: 12, fontWeight: 600, color: ink70,
        }}>
          <span>{s.historyStartLabel}</span>
          <span>Today</span>
        </div>

        {/* Insight card */}
        <div style={{ display: 'none', padding: '10px 16px 0' }}>
          <div style={{
            background: paper, borderRadius: 16, boxShadow: cardShadow,
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
          }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.25, color: ink }}>
              You saved <span style={{ color: teal }}>{hidden ? 'RWF •••' : fmtRWF(s.savedThisMonth)}</span><br/>in {s.thisMonthLabel}.
            </div>
            <svg width="34" height="29" viewBox="0 0 40 34" style={{ flexShrink: 0 }}>
              <rect x="2"  y="20" width="7" height="12" rx="2" fill={teal} opacity="0.30"/>
              <rect x="12" y="14" width="7" height="18" rx="2" fill={teal} opacity="0.50"/>
              <rect x="22" y="8"  width="7" height="24" rx="2" fill={teal} opacity="0.75"/>
              <rect x="32" y="2"  width="7" height="30" rx="2" fill={teal}/>
            </svg>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'none', padding: '10px 16px 4px', flexDirection: 'column', gap: 8 }}>
          <CCButton variant="solid" size="md" accent={accent} fullWidth onClick={() => onMoney('add')}>
            Add money
          </CCButton>
          <div style={{ display: 'flex', gap: 8 }}>
            <CCButton variant="ghost" size="sm" fullWidth onClick={() => onMoney('withdraw')}>Withdraw</CCButton>
            <CCButton variant="ghost" size="sm" fullWidth onClick={() => onMoney('borrow')}>Borrow</CCButton>
            <CCButton variant="ghost" size="sm" fullWidth onClick={() => onMoney('repay')}>Repay</CCButton>
          </div>
        </div>

        {/* Credit available — tappable into the Credit tab */}
        <div style={{ display: 'none', padding: '8px 16px 0' }}>
          <button onClick={onCredit} style={{
            width: '100%', textAlign: 'left', cursor: 'pointer',
            background: paper, borderRadius: 16, boxShadow: cardShadow, border: 0,
            padding: '12px 16px', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <Eyebrow style={{ marginBottom: 4 }}>Credit available</Eyebrow>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', fontFeatureSettings: '"tnum"', whiteSpace: 'nowrap' }}>
                {mask(fmtRWF(c.available))}
              </div>
            </div>
            <span style={{
              fontSize: 12.5, fontWeight: 600, color: ink55,
              display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
            }}>
              70% of savings
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 6h7M6 3l3 3-3 3" stroke={ink40} strokeWidth="1.5" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

// Small circular eye toggle — privacy for sensitive amounts.
function SaveDashboard({
  balance, earned, savedMonth, month, months = [], selectedMonth, onMonth,
  history, historyStart, onMoney, onGrowth,
}) {
  const [monthOpen, setMonthOpen] = React.useState(false);
  const chooseMonth = (label) => {
    if (onMonth) onMonth(label);
    setMonthOpen(false);
  };

  return (
    <div className="pk-page-pad pk-soft-card" style={{ padding: '10px 20px 0' }}>
      <div style={{ background: paper, borderRadius: 20, boxShadow: cardShadow, padding: '14px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <Eyebrow style={{ marginBottom: 5 }}>Saved</Eyebrow>
            <div style={{ fontSize: 'min(26px, 6.5vw)', fontWeight: 850, letterSpacing: '-0.02em', color: ink }}>
              {balance}
            </div>
            <button onClick={onGrowth} style={{
              marginTop: 5, padding: 0, border: 0, background: 'transparent',
              fontSize: 12, fontWeight: 750, color: teal, cursor: 'pointer',
            }}>
              Earned {earned}
            </button>
          </div>
        </div>
        <div key={selectedMonth} className="pk-rise" style={{ marginTop: 6 }}>
          <Sparkline data={history} accent={amber} height={58} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 650, color: ink55, marginTop: 8 }}>
          <span>{historyStart}</span>
          <div style={{ position: 'relative', zIndex: monthOpen ? 30 : 1 }}>
            <button
              onClick={() => setMonthOpen((v) => !v)}
              style={{
                border: 0, background: 'transparent', color: ink55,
                fontFamily: 'inherit', fontSize: 11.5, fontWeight: 750,
                padding: 0, cursor: 'pointer',
              }}
            >
              {month} saved {savedMonth}
            </button>
            {monthOpen && (
              <div
                onPointerDownCapture={(e) => {
                  const label = e.target && e.target.getAttribute && e.target.getAttribute('data-save-month');
                  if (label) chooseMonth(label);
                }}
                onClickCapture={(e) => {
                  const label = e.target && e.target.getAttribute && e.target.getAttribute('data-save-month');
                  if (label) chooseMonth(label);
                }}
                style={{
                position: 'absolute', right: 0, bottom: 22, zIndex: 30,
                width: 188,
                background: paper,
                border: `1px solid ${ink12}`,
                borderRadius: 16,
                boxShadow: '0 18px 40px rgba(35,36,31,0.16)',
                padding: 10,
                transform: 'translateY(-4px)',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: ink }}>2024</div>
                  <button onClick={() => setMonthOpen(false)} aria-label="Close month picker" style={{
                    border: 0, background: paperSoft, borderRadius: '50%',
                    width: 24, height: 24, color: ink55, cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 800,
                  }}>×</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {months.map((m) => (
                    <button
                      type="button"
                      key={m.label}
                      data-save-month={m.label}
                      onPointerDown={() => chooseMonth(m.label)}
                      onTouchStart={() => chooseMonth(m.label)}
                      onMouseDown={(e) => { e.preventDefault(); chooseMonth(m.label); }}
                      onClick={() => chooseMonth(m.label)}
                      style={{
                        height: 34,
                        border: `1px solid ${m.label === selectedMonth ? teal : ink12}`,
                        borderRadius: 12,
                        background: m.label === selectedMonth ? teal : paperSoft,
                        color: m.label === selectedMonth ? '#fff' : ink,
                        fontFamily: 'inherit',
                        fontSize: 11.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {m.label.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pk-actions-row pk-soft-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 8 }}>
        <MiniAction label="Save" onClick={() => onMoney('add')} accent />
        <MiniAction label="Move" onClick={() => onMoney('withdraw')} />
        <MiniAction label="Borrow" onClick={() => onMoney('borrow')} />
        <MiniAction label="Repay" onClick={() => onMoney('repay')} />
      </div>
    </div>
  );
}

function MiniAction({ label, onClick, accent: hot = false }) {
  return (
    <button className="pk-calm-action" onClick={onClick} style={{
      height: 32,
      borderRadius: 999,
      border: `1px solid ${hot ? teal : ink12}`,
      background: hot ? teal : paperSoft,
      color: hot ? '#fff' : ink,
      fontSize: 11.5,
      fontWeight: 750,
      fontFamily: 'inherit',
      cursor: 'pointer',
    }}>{label}</button>
  );
}

const planButtonStyle = {
  width: 32, height: 32, borderRadius: '50%',
  border: `1px solid ${ink12}`, background: paperSoft,
  fontSize: 18, fontWeight: 700, color: ink, cursor: 'pointer',
};

function SavePlanCard({ target, onTarget }) {
  const week = Math.ceil(target / 4);
  const day = Math.ceil(target / 30);
  const set = (next) => onTarget(Math.max(100000, next));
  return (
    <div className="pk-page-pad pk-soft-card" style={{ padding: '8px 20px 0' }}>
      <div style={{
        background: paper, borderRadius: 18, boxShadow: cardShadow,
        padding: '10px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'block', flex: 1 }}>
            <Eyebrow style={{ marginBottom: 5 }}>Next month</Eyebrow>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: ink55 }}>RWF</span>
              <input
                inputMode="numeric"
                value={String(target)}
                onChange={(e) => set(Number(String(e.target.value).replace(/\D/g, '')) || 100000)}
                style={{
                  width: '100%', minWidth: 0, border: 0, outline: 'none',
                  background: 'transparent', color: ink,
                  fontFamily: 'inherit', fontSize: 17, fontWeight: 850,
                  fontFeatureSettings: '"tnum"',
                }}
              />
            </div>
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="pk-calm-action" onClick={() => set(target - 100000)} style={planButtonStyle}>-</button>
            <button className="pk-calm-action" onClick={() => set(target + 100000)} style={planButtonStyle}>+</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <PlanMetric label="Week" value={fmtRWF(week)} />
          <PlanMetric label="Day" value={fmtRWF(day)} />
        </div>
      </div>
    </div>
  );
}

function PlanMetric({ label, value }) {
  return (
    <div style={{ background: paperSoft, borderRadius: 13, padding: '8px 10px' }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: ink55, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 850, color: ink, whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

function SaveCreditCard({ available, onCredit }) {
  return (
    <div className="pk-page-pad pk-soft-card" style={{ padding: '8px 20px 0' }}>
      <button className="pk-calm-action" onClick={onCredit} style={{
        width: '100%', border: 0, background: paper, borderRadius: 18,
        boxShadow: cardShadow, padding: '10px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'inherit', cursor: 'pointer',
      }}>
        <div style={{ textAlign: 'left' }}>
          <Eyebrow style={{ marginBottom: 5 }}>Credit</Eyebrow>
          <div style={{ fontSize: 18, fontWeight: 850, color: ink }}>{available}</div>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 750, color: ink55 }}>70%</div>
      </button>
    </div>
  );
}

function SaveHistoryStrip({ saved, borrowed, paid, earned }) {
  const rows = [
    { label: 'Saved', value: saved, meta: '1 Jun' },
    { label: 'Earned', value: earned, meta: '1 Jun' },
    { label: 'Borrowed', value: borrowed, meta: '15 Jun' },
    { label: 'Paid', value: paid, meta: '30 Jun' },
  ];
  return (
    <div className="pk-page-pad pk-soft-card" style={{ padding: '8px 20px 0' }}>
      <div style={{ background: paper, borderRadius: 18, boxShadow: cardShadow, padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <Eyebrow>History</Eyebrow>
          <button className="pk-calm-action" style={{
            border: 0, background: 'transparent', padding: 0,
            fontFamily: 'inherit', fontSize: 11.5, fontWeight: 750,
            color: teal, cursor: 'pointer',
          }}>
            See more
          </button>
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          {rows.map((r) => (
            <div className="pk-history-row" key={r.label} style={{
              minWidth: 0, display: 'grid', gridTemplateColumns: '54px 1fr auto',
              alignItems: 'center', gap: 8, padding: '3px 0',
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: ink55 }}>{r.meta}</div>
              <div style={{ fontSize: 12, fontWeight: 750, color: ink }}>{r.label}</div>
              <div style={{
                fontSize: 12, fontWeight: 850, color: ink,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EyeToggle({ hidden, onToggle }) {
  return (
    <button onClick={onToggle} aria-label={hidden ? 'Show' : 'Hide'} style={{
      width: 32, height: 32, borderRadius: '50%',
      border: `1px solid ${ink12}`, background: paper,
      padding: 0, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {hidden ? (
        <svg width="16" height="16" viewBox="0 0 18 18">
          <path d="M2 9s2.5-5 7-5c1.5 0 2.8.5 4 1.3M16 9s-2.5 5-7 5c-1.5 0-2.8-.5-4-1.3"
                stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          <circle cx="9" cy="9" r="2.2" stroke={ink} strokeWidth="1.3" fill="none"/>
          <path d="M3 3l12 12" stroke={ink} strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 18 18">
          <path d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"
                stroke={ink} strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
          <circle cx="9" cy="9" r="2.2" stroke={ink} strokeWidth="1.3" fill="none"/>
        </svg>
      )}
    </button>
  );
}

// ────────────────────────────── CREDIT LINE ──────────────────────────────
// Makes the savings → credit relationship the centrepiece: the more you save,
// the more you can borrow. Capacity = 70% of savings.

function CreditScreen({ accent, onMoney, onGrowth, onBack }) {
  const s = CC_SAVINGS;
  const c = CC_CREDIT;
  const [hidden, setHidden] = React.useState(false);
  const capacityPct = Math.round(c.ratio * 100);
  const repaymentStatus = c.utilization < 15
    ? 'Excellent'
    : c.utilization < 50
      ? 'Good'
      : 'Close to limit';
  const mask = (v) => (hidden ? '••••••' : v);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader
        left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onBack && <IconBtn onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M5.2 5.6H10.8V8.75Q10.8 11.25 8 11.25Q5.2 11.25 5.2 8.75Z" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.2 6.9H10.8" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconBtn>}
          <Eyebrow>Credit</Eyebrow>
        </div>}
        right={<EyeToggle hidden={hidden} onToggle={() => setHidden((h) => !h)} />}
      />

      <div style={{ flex: 1, overflow: 'hidden', scrollbarWidth: 'none' }} className="cc-scroll">
        <div className="pk-page-pad pk-soft-card" style={{ padding: '14px 20px 0' }}>
          <div style={{
            background: paper, borderRadius: 20, padding: '16px 18px 18px',
            boxShadow: cardShadow,
          }}>
            <div style={{ textAlign: 'center' }}>
              <Eyebrow style={{ marginBottom: 5 }}>Available</Eyebrow>
              <div style={{
                fontSize: 'min(30px, 7vw)', fontWeight: 850, letterSpacing: '-0.02em',
                fontFeatureSettings: '"tnum"', color: ink,
              }}>
                {mask(fmtRWF(c.available))}
              </div>
              <div style={{ marginTop: 5, fontSize: 'min(12px, 3.2vw)', fontWeight: 650, color: ink55 }}>
                Saved {mask(fmtRWF(s.balance))} · Limit {mask(fmtRWF(c.capacity))}
              </div>
              <div style={{ display: 'none', marginTop: 5, fontSize: 12, fontWeight: 650, color: ink55 }}>
                Saved {mask(fmtRWF(s.balance))} · limit {capacityPct}% ({mask(fmtRWF(c.capacity))})
              </div>
            </div>

            <CreditLimitCircle
              capacityPct={capacityPct}
              usedPct={c.utilization}
              outstanding={mask(fmtRWF(c.outstanding))}
              available={mask(fmtRWF(c.available))}
            />

            <div style={{ fontSize: 12.3, color: ink55, lineHeight: 1.42, marginTop: 10, textAlign: 'center' }}>
              {capacityPct}% of savings
            </div>
          </div>
        </div>

        <MonthlyCreditBanner
          saved={mask(fmtRWF(s.savedThisMonth))}
          available={mask(fmtRWF(c.available))}
          month={s.thisMonthLabel}
        />

        <CreditHistoryStrip
          saved={mask(fmtRWF(s.savedThisMonth))}
          borrowed={mask(fmtRWF(c.outstanding))}
          paid={mask(c.nextPayment.amount)}
          earned={mask(fmtRWF(s.returnsEarned))}
        />

        <div className="pk-page-pad pk-soft-card" style={{ padding: '12px 20px 0' }}>
          <div style={{ background: paper, borderRadius: 18, padding: '14px 16px', boxShadow: cardShadow }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <Eyebrow>Repayment</Eyebrow>
              <StatusPill
                variant={repaymentStatus === 'Close to limit' ? 'solid' : 'outline'}
                accent={repaymentStatus === 'Close to limit' ? '#D94C4C' : teal}
              >
                {repaymentStatus}
              </StatusPill>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <Eyebrow style={{ marginBottom: 6 }}>Outstanding</Eyebrow>
                <div style={{ fontSize: 18, fontWeight: 800, fontFeatureSettings: '"tnum"' }}>
                  {mask(fmtRWF(c.outstanding))}
                </div>
              </div>
              <div>
                <Eyebrow style={{ marginBottom: 6 }}>Next payment</Eyebrow>
                <div style={{ fontSize: 18, fontWeight: 800, fontFeatureSettings: '"tnum"' }}>
                  {mask(c.nextPayment.amount)}
                </div>
                <div style={{
                  fontSize: 12, color: ink55, marginTop: 5, fontWeight: 500,
                }}>Due {c.nextPayment.date}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Available credit hero */}
        <div style={{ display: 'none', padding: '28px 24px 24px' }}>
          <Eyebrow style={{ marginBottom: 14 }}>Available to borrow · RWF</Eyebrow>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10,
            fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 0.95,
            fontFeatureSettings: '"tnum"', userSelect: 'none',
          }}>
            <div style={{ fontSize: 50 }}>{hidden ? '••••••' : Number(c.available).toLocaleString('en-US')}</div>
          </div>
          <div style={{
            marginTop: 16, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <ProgressBar percent={c.utilization} accent={accent} />
          </div>
          <div style={{
            marginTop: 11, display: 'flex', justifyContent: 'space-between',
            fontSize: 12, fontWeight: 600, color: ink55,
          }}>
            <span>{c.utilization}% used</span>
            <span>Capacity {mask(fmtRWF(c.capacity))}</span>
          </div>
        </div>

        <Rule />

        <div style={{ display: 'none', padding: '24px 24px' }}>
          <div style={{
            background: paper, borderRadius: 20, padding: '18px 18px 17px',
            boxShadow: cardShadow,
          }}>
            <Eyebrow style={{ marginBottom: 14 }}>How your limit is set</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <CreditMetric label="You've saved" value={mask(fmtRWF(s.balance))} />
              <CreditMetric label="You can borrow" value={mask(fmtRWF(c.capacity))} highlight />
            </div>

            <div style={{ marginTop: 18 }}>
              <AnimatedCreditBar
                label="Savings backing your limit"
                percent={capacityPct}
                accent={teal}
                marker={capacityPct}
                leftLabel="0%"
                rightLabel={`${capacityPct}% of savings`}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <AnimatedCreditBar
                label="Borrowing used"
                percent={c.utilization}
                accent={accent}
                leftLabel={`${c.utilization}% used`}
                rightLabel={`${100 - c.utilization}% available`}
              />
            </div>

            <div style={{ fontSize: 12.5, color: ink55, lineHeight: 1.5, marginTop: 16 }}>
              Your borrowing capacity is {capacityPct}% of your savings. Save more and it rises automatically - no application.
            </div>
          </div>
          <button onClick={onGrowth} style={{
            marginTop: 14, padding: 0, background: 'transparent', border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 12.5, fontWeight: 600, color: teal,
          }}>
            Grow your savings
            <svg width="11" height="11" viewBox="0 0 12 12">
              <path d="M2 6h7M6 3l3 3-3 3" stroke={teal} strokeWidth="1.6" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <Rule />

        {/* Savings → Credit relationship */}
        <div style={{ display: 'none', padding: '24px 24px' }}>
          <Eyebrow style={{ marginBottom: 16 }}>How your limit is set</Eyebrow>
          <div style={{
            display: 'flex', alignItems: 'stretch', gap: 12,
          }}>
            <div style={{
              flex: 1, background: paper, borderRadius: 16, padding: '15px 16px',
              boxShadow: cardShadow,
            }}>
              <Eyebrow style={{ marginBottom: 8 }}>You've saved</Eyebrow>
              <div style={{ fontSize: 19, fontWeight: 800, fontFeatureSettings: '"tnum"' }}>
                {mask(fmtRWF(s.balance))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: ink40 }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M4 12h13M12 6l6 6-6 6" stroke={teal} strokeWidth="1.8" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              flex: 1, borderRadius: 16, padding: '15px 16px',
              background: teal, color: '#fff', boxShadow: '0 10px 24px rgba(47,174,155,0.30)',
            }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: 8,
              }}>You can borrow</div>
              <div style={{ fontSize: 19, fontWeight: 800, fontFeatureSettings: '"tnum"' }}>
                {mask(fmtRWF(c.capacity))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: ink55, lineHeight: 1.5, marginTop: 14 }}>
            Your borrowing capacity is 70% of your savings. Save more and it rises automatically — no application.
          </div>
          <button onClick={onGrowth} style={{
            marginTop: 14, padding: 0, background: 'transparent', border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 12.5, fontWeight: 600, color: teal,
          }}>
            Grow your savings
            <svg width="11" height="11" viewBox="0 0 12 12">
              <path d="M2 6h7M6 3l3 3-3 3" stroke={teal} strokeWidth="1.6" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <Rule />

        {/* Repayment status */}
        <div style={{ display: 'none', padding: '24px 24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <Eyebrow>Repayment</Eyebrow>
            <StatusPill variant="outline">{c.status}</StatusPill>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <Eyebrow style={{ marginBottom: 7 }}>Outstanding</Eyebrow>
              <div style={{ fontSize: 20, fontWeight: 800, fontFeatureSettings: '"tnum"' }}>
                {mask(fmtRWF(c.outstanding))}
              </div>
            </div>
            <div>
              <Eyebrow style={{ marginBottom: 7 }}>Next payment</Eyebrow>
              <div style={{ fontSize: 20, fontWeight: 800, fontFeatureSettings: '"tnum"' }}>
                {mask(c.nextPayment.amount)}
              </div>
              <div style={{
                fontSize: 12, color: ink55, marginTop: 6, fontWeight: 500,
              }}>Due {c.nextPayment.date}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pk-soft-card" style={{
        padding: '12px 20px',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
        borderTop: `1px solid ${ink12}`, background: paper,
        display: 'flex', gap: 10,
      }}>
        <CCButton variant="ghost" size="md" fullWidth onClick={() => onMoney('repay')}>Repay</CCButton>
        <CCButton variant="solid" accent={accent} size="md" fullWidth onClick={() => onMoney('borrow')}>Borrow</CCButton>
      </div>
    </div>
  );
}

// ────────────────────────────── GROWTH ──────────────────────────────
function CreditLimitCircle({ capacityPct, usedPct, outstanding, available }) {
  const [on, setOn] = React.useState(false);
  const size = 176;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cap = Math.max(0, Math.min(100, capacityPct || 0));
  const used = Math.max(0, Math.min(cap, usedPct || 0));
  const reserve = Math.max(0, 100 - cap);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, [cap, used]);

  const arc = (pct) => on ? c * (pct / 100) : 0;
  const gap = (pct) => c - arc(pct);

  return (
    <div style={{ marginTop: 14, display: 'grid', justifyItems: 'center' }}>
      <div style={{ fontSize: 11.5, fontWeight: 750, color: ink55, marginBottom: 4 }}>
        Starts at RWF 1,000,000
      </div>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r}
                  fill="none" stroke="rgba(65,85,235,0.13)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r}
                  fill="none" stroke="#E95B5B" strokeWidth={stroke}
                  strokeDasharray={`${arc(reserve)} ${c}`}
                  strokeDashoffset={-c * (cap / 100)}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{ transition: 'stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1)' }} />
          <circle cx={size / 2} cy={size / 2} r={r}
                  fill="none" stroke="#4B5CF0" strokeWidth={stroke}
                  strokeDasharray={`${arc(cap)} ${gap(cap)}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{ transition: 'stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1)' }} />
          <circle cx={size / 2} cy={size / 2} r={r}
                  fill="none" stroke="#E95B5B" strokeWidth={stroke}
                  strokeDasharray={`${arc(used)} ${gap(used)}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{ transition: 'stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1)' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11.5, fontWeight: 750, color: ink55 }}>Used</div>
          <div style={{ fontSize: 30, fontWeight: 850, letterSpacing: '-0.02em', color: '#4B5CF0' }}>
            {usedPct}%
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: ink55 }}>{outstanding}</div>
        </div>
      </div>
      <div style={{
        marginTop: 8, width: '100%', display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
      }}>
        <CircleLegend color="#4B5CF0" label={`${capacityPct}% limit`} />
        <CircleLegend color="#E95B5B" label={`${usedPct}% used`} />
        <CircleLegend color="rgba(233,91,91,0.45)" label={`${100 - capacityPct}% left`} />
      </div>
      <div style={{ marginTop: 7, fontSize: 12, color: ink55, fontWeight: 650 }}>
        Left {available}
      </div>
    </div>
  );
}

function MonthlyCreditBanner({ saved, available, month }) {
  return (
    <div className="pk-page-pad pk-soft-card" style={{ padding: '10px 20px 0' }}>
      <div style={{
        borderRadius: 18,
        background: '#F0F8F6',
        border: `1px solid rgba(47,174,155,0.18)`,
        padding: '12px 14px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        <div>
          <Eyebrow style={{ marginBottom: 5 }}>{month} saved</Eyebrow>
          <div style={{ fontSize: 17, fontWeight: 850, color: ink, fontFeatureSettings: '"tnum"' }}>
            {saved}
          </div>
        </div>
        <div>
          <Eyebrow style={{ marginBottom: 5 }}>Borrowable</Eyebrow>
          <div style={{ fontSize: 17, fontWeight: 850, color: teal, fontFeatureSettings: '"tnum"' }}>
            {available}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreditHistoryStrip({ saved, borrowed, paid, earned }) {
  const rows = [
    { label: 'Saved', value: saved },
    { label: 'Borrowed', value: borrowed },
    { label: 'Paid', value: paid },
    { label: 'Earned', value: earned },
  ];
  return (
    <div className="pk-page-pad pk-soft-card" style={{ padding: '10px 20px 0' }}>
      <div style={{
        background: paper,
        borderRadius: 18,
        boxShadow: cardShadow,
        padding: '12px 12px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {rows.map((r) => <CreditHistoryItem key={r.label} {...r} />)}
        </div>
      </div>
    </div>
  );
}

function CreditHistoryItem({ label, value }) {
  return (
    <div style={{
      borderRadius: 14,
      background: paperSoft,
      padding: '9px 10px',
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: ink55, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontSize: 14.5,
        fontWeight: 850,
        color: ink,
        fontFeatureSettings: '"tnum"',
        whiteSpace: 'nowrap',
      }}>
        {value}
      </div>
    </div>
  );
}

function CircleLegend({ color, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 5, fontSize: 10.5, fontWeight: 700, color: ink55, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </div>
  );
}

function CreditMetric({ label, value, highlight = false }) {
  return (
    <div style={{
      borderRadius: 16,
      padding: '14px 14px',
      background: highlight ? teal : paperSoft,
      color: highlight ? '#fff' : ink,
    }}>
      <div style={{
        fontSize: 12, fontWeight: 650,
        color: highlight ? 'rgba(255,255,255,0.82)' : ink55,
        marginBottom: 7,
      }}>{label}</div>
      <div style={{
        fontSize: 18, fontWeight: 850, letterSpacing: '-0.01em',
        fontFeatureSettings: '"tnum"', whiteSpace: 'nowrap',
      }}>{value}</div>
    </div>
  );
}

function AnimatedCreditBar({
  label, percent, accent, marker, leftLabel, rightLabel,
}) {
  const [on, setOn] = React.useState(false);
  const p = Math.max(0, Math.min(100, percent || 0));
  const markerPct = marker == null ? null : Math.max(0, Math.min(100, marker));

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, [p]);

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 9,
      }}>
        <div style={{ fontSize: 13, fontWeight: 750, color: ink }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: accent }}>{p}%</div>
      </div>
      <div style={{
        position: 'relative', height: 12, borderRadius: 999,
        background: ink06, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: on ? `${p}%` : 0,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${accent}, ${teal})`,
          transition: 'width 900ms cubic-bezier(.2,.8,.2,1)',
        }} />
        {markerPct != null && (
          <div style={{
            position: 'absolute', left: `${markerPct}%`, top: -2, bottom: -2,
            width: 2, background: ink, opacity: 0.4,
          }} />
        )}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 7, fontSize: 11.5, fontWeight: 650, color: ink55,
      }}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

// Financial-progress tracking: savings balance over time, returns earned,
// and contribution history. Calm, not a trading view.

function GrowthScreen({ accent, onBack }) {
  const s = CC_SAVINGS;
  const first = s.history[0], last = s.history[s.history.length - 1];
  const grownPct = (((last - first) / first) * 100).toFixed(0);

  return (
    <div style={{ paddingBottom: 28 }}>
      <ScreenHeader
        left={<BackBtn onClick={onBack} />}
        right={<Eyebrow>Growth</Eyebrow>}
      />

      {/* Savings balance + sparkline */}
      <div style={{ padding: '28px 24px 8px' }}>
        <Eyebrow style={{ marginBottom: 12 }}>Savings balance · RWF</Eyebrow>
        <div style={{ fontSize: 'min(40px, 9vw)', fontWeight: 800, letterSpacing: '-0.025em', fontFeatureSettings: '"tnum"' }}>
          {Number(s.balance).toLocaleString('en-US')}
        </div>
        <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: ink70 }}>
          <span style={{ color: teal }}>↑ {grownPct}%</span> over 12 months
        </div>
      </div>
      <div style={{ padding: '12px 16px 20px' }}>
        <Sparkline data={s.history} accent={amber} height={120} />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '0 24px 4px', fontSize: 12, fontWeight: 600, color: ink70,
      }}>
        <span>{s.historyStartLabel}</span>
        <span>Today</span>
      </div>

      <Rule />

      {/* Returns + contribution stats */}
      <div style={{ padding: '24px 24px', display: 'flex', gap: 32 }}>
        <StatBlock label="Returns earned" value={fmtRWF(s.returnsEarned)} sub={`${s.returnsPct}% / yr`} />
        <StatBlock label="Saved / month" value={fmtRWF(s.monthlyContribution)} sub={`${s.streakMonths}-mo streak`} />
      </div>

      <Rule />

      {/* Contribution history */}
      <div style={{ padding: '22px 24px 0' }}>
        <Eyebrow style={{ marginBottom: 6 }}>Contributions</Eyebrow>
      </div>
      <div style={{ padding: '0 24px' }}>
        {s.contributions.map((c, i) => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '16px 0',
            borderBottom: i === s.contributions.length - 1 ? 'none' : `1px dashed ${DASH}`,
          }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: ink55, marginTop: 4 }}>{c.sub} · {c.date}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{c.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────── VENTURE FEED ──────────────────────────────

function VentureFeedScreen({ accent, onOpenVenture, onInvest }) {
  const [filter, setFilter] = React.useState('funds');
  const [sort, setSort] = React.useState('recent');
  const [sortOpen, setSortOpen] = React.useState(false);
  // Which fund is expanded into its invest-paths panel. Only one open at a time.
  const [expandedId, setExpandedId] = React.useState(null);

  // Funds = the three CC_FUNDS_V2 entries (currently CC_VENTURES)
  // For You = the standalone CC_FORYOU businesses (not in any fund)
  const rawList = filter === 'funds' ? CC_VENTURES : CC_FORYOU;

  // Apply sort. "yield" uses yieldHero/yieldRange first number; "name" alpha.
  const yieldNum = (v) => {
    const s = (v.yieldHero || v.yieldRange || '').match(/[\d.]+/);
    return s ? parseFloat(s[0]) : 0;
  };
  const list = [...rawList].sort((a, b) =>
    sort === 'yield' ? yieldNum(b) - yieldNum(a) :
    sort === 'name'  ? a.name.localeCompare(b.name) :
                       0
  );

  const titleByFilter = {
    funds:  'Invest',
    foryou: 'For you',
  };
  const subByFilter = {
    funds:  'Optional — once you’re saving, put some to work in vetted funds.',
    foryou: 'Businesses Everyday is helping grow directly.',
  };

  const sortOptions = [
    { id: 'recent', label: 'Most recent' },
    { id: 'yield',  label: 'Highest projected yield' },
    { id: 'name',   label: 'Name · A–Z' },
  ];

  return (
    <div style={{ paddingBottom: 24 }}>
      <ScreenHeader
        left={<Eyebrow>Invest</Eyebrow>}
        right={<div style={{ position: 'relative' }}>
          <IconBtn onClick={() => setSortOpen((o) => !o)}>
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M2 4h10M3 7h8M4.5 10h5" stroke={ink} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </IconBtn>
          {sortOpen && (
            <>
              {/* tap-anywhere backdrop */}
              <div onClick={() => setSortOpen(false)} style={{
                position: 'fixed', inset: 0, zIndex: 20,
              }} />
              <div style={{
                position: 'absolute', top: 48, right: 0, zIndex: 30,
                background: paper, borderRadius: 18,
                border: `1px solid ${ink12}`,
                boxShadow: '0 14px 36px rgba(0,0,0,0.14)',
                minWidth: 220, overflow: 'hidden',
              }}>
                <div style={{
                  fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: ink55,
                  padding: '12px 16px 8px',
                }}>Sort by</div>
                {sortOptions.map((o) => {
                  const on = sort === o.id;
                  return (
                    <button key={o.id}
                      onClick={() => { setSort(o.id); setSortOpen(false); }}
                      style={{
                        display: 'flex', width: '100%',
                        alignItems: 'center', justifyContent: 'space-between',
                        textAlign: 'left',
                        padding: '12px 16px',
                        background: 'transparent', border: 0, cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: 14, color: ink,
                      }}>
                      <span>{o.label}</span>
                      {on && (
                        <svg width="14" height="14" viewBox="0 0 14 14">
                          <path d="M2 7l4 4 6-8" stroke={ink} strokeWidth="1.6" fill="none"
                                strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>}
      />

      {/* Page title */}
      <div style={{ padding: '20px 24px 6px' }}>
        <div style={{
          fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05,
        }}>{titleByFilter[filter]}</div>
        <div style={{ fontSize: 13, color: ink70, marginTop: 8 }}>
          {subByFilter[filter]}
        </div>
      </div>

      {/* Filter pills hidden when there's only one segment — declutter */}
      {CC_FILTERS.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, padding: '8px 20px 16px',
        }}>
          {CC_FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <button key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  flex: '0 0 auto',
                  height: 34, padding: '0 18px', borderRadius: 999,
                  fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: on ? ink : 'transparent',
                  color: on ? '#fff' : ink70,
                  border: `1px solid ${on ? ink : ink12}`,
                  cursor: 'pointer',
                }}>{f.label}</button>
            );
          })}
        </div>
      )}

      {/* List rows — each fund expands into its invest-paths panel inline */}
      <div style={{ padding: '12px 20px 0' }}>
        {list.map((v, i) => (
          <FundAccordion
            key={v.id}
            v={v}
            mode={filter}
            accent={accent}
            expanded={expandedId === v.id}
            onToggle={() => setExpandedId((id) => (id === v.id ? null : v.id))}
            onInvest={onInvest}
            onViewReport={() => onOpenVenture(v.id)}
            isLast={i === list.length - 1}
          />
        ))}
        {list.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: ink55, fontSize: 13 }}>
            No items in this segment yet.
          </div>
        )}
      </div>

      {/* Appendix removed — all funds are now publicly investable. */}
    </div>
  );
}

// ── Fund accordion ──────────────────────────────────────────────
// Tapping a fund row no longer navigates — it expands an inline panel that
// (1) educates the investor on how fund vs. direct allocation differ, then
// (2) offers three clear paths: back the whole fund, let an in-house expert
// allocate, or direct capital straight into a single company. The body height
// animates with the CSS-grid 0fr→1fr trick (no JS measurement).
function FundAccordion({ v, mode, accent, expanded, onToggle, onInvest, onViewReport, isLast }) {
  const companies = ccCompaniesIn(v.id);
  const sub = mode === 'funds' ? v.sector : `${v.sector} · ${v.location.split(',')[0]}`;
  // Drop a redundant trailing "Fund" in the row title (the sub-label already
  // marks it as a fund) so longer names fit on one line. Keep it when the
  // remainder would be a single word (e.g. "REIT Fund").
  const rowName = (() => {
    const m = /^(.*)\sFund$/.exec(v.name);
    return m && m[1].trim().split(/\s+/).length >= 2 ? m[1].trim() : v.name;
  })();

  return (
    <div style={{ borderBottom: isLast && !expanded ? 'none' : `1px dashed ${DASH}` }}>
      {/* Header row */}
      <div onClick={onToggle} style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '18px 0', cursor: 'pointer',
      }}>
        <div style={{ flexShrink: 0 }}>
          <FundIcon id={v.id} size={48} radius={12} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{rowName}</div>
          <div style={{
            fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: ink55, marginTop: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{sub}</div>
        </div>
        {/* Yield chip + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em',
              fontFeatureSettings: '"tnum"',
            }}>{v.yieldHero || '—'}</div>
            <div style={{
              fontFamily: CC_MONO, fontSize: 8, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: ink55, marginTop: 2,
            }}>Proj. yield</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" style={{
            color: ink40,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 240ms ease',
          }}>
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Expanding body */}
      <div style={{
        display: 'grid',
        gridTemplateRows: expanded ? '1fr' : '0fr',
        transition: 'grid-template-rows 280ms ease',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ paddingBottom: 20 }}>
            {/* Primary paths */}
            <InvestPathRow
              accent={accent}
              title="Invest in the fund"
              sub="Diversified across the whole pool."
              tag="Recommended"
              onClick={() => onInvest(v.id, 'fund')} />
            <InvestPathRow
              accent={accent}
              title="Invest with an expert"
              sub="Our in-house expert allocates for you."
              onClick={() => onInvest(v.id, 'expert')} />

            {/* Direct allocation */}
            {companies.length > 0 && (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  margin: '18px 0 12px',
                }}>
                  <div style={{
                    fontFamily: CC_MONO, fontSize: 9, letterSpacing: '0.14em',
                    textTransform: 'uppercase', color: ink40,
                  }}>Or a single company</div>
                  <div style={{ flex: 1, height: 1, background: ink06 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {companies.map((c) => (
                    <CompanyMiniRow key={c.id} c={c} onClick={() => onInvest(c.id, 'company')} />
                  ))}
                </div>
              </>
            )}

            {/* Deeper dive */}
            <button onClick={onViewReport} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginTop: 18, padding: '8px 0',
              background: 'transparent', border: 0, cursor: 'pointer',
              fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: ink55,
            }}>
              <span>View full report</span>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 6h7M6 3l3 3-3 3" stroke={ink55} strokeWidth="1.4" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// One tappable invest path inside the fund accordion.
function InvestPathRow({ title, sub, tag, accent, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
      textAlign: 'left', fontFamily: 'inherit',
      padding: '14px 16px', marginBottom: 8,
      borderRadius: 16, border: `1px solid ${ink12}`,
      background: paper, cursor: 'pointer',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 500 }}>{title}</span>
          {tag && (
            <span style={{
              fontFamily: CC_MONO, fontSize: 8, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#fff',
              padding: '2px 7px', borderRadius: 999, background: accent || ink,
            }}>{tag}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: ink70, marginTop: 4, lineHeight: 1.45 }}>{sub}</div>
      </div>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: accent || ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="11" height="11" viewBox="0 0 12 12">
          <path d="M2 6h7M6 3l3 3-3 3" stroke="#fff" strokeWidth="1.6" fill="none"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}

// Compact company row for the "allocate directly" list.
function CompanyMiniRow({ c, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      textAlign: 'left', fontFamily: 'inherit',
      padding: '10px 12px', borderRadius: 14,
      border: `1px solid ${ink12}`, background: paper, cursor: 'pointer',
    }}>
      <FundIcon id={c.id} size={34} radius={9} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{c.name}</div>
        <div style={{
          fontFamily: CC_MONO, fontSize: 9, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: ink55, marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{c.sector.split(' · ')[0]} · {c.yieldHero || '—'}</div>
      </div>
      <svg width="7" height="12" viewBox="0 0 8 14" style={{ color: ink40, flexShrink: 0 }}>
        <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" fill="none"
              strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// ────────────────────────────── VENTURE DETAIL ──────────────────────────────

function DetailScreen({ ventureId, accent, onBack, onInvest, onOpsDetail, onOpenCompany }) {
  const v = ccLookup(ventureId) || CC_VENTURES[0];
  const isFund = v.type === 'fund';
  const isLab  = v.type === 'lab';
  const statusLabel = {
    vetted: 'Vetted', pipeline: 'Pipeline', foryou: 'For You',
    lab: 'Lab · View only',
  }[v.status] || (isFund ? 'Fund' : isLab ? 'Lab' : 'Portfolio company');

  const companies = isFund ? ccCompaniesIn(v.id) : [];
  const thesisBullets = isFund ? (v.thesisBullets || []) : (v.thesis || []);

  return (
    <div style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <ScreenHeader
        left={<Eyebrow>{isFund ? 'Fund' : isLab ? 'Lab' : 'Company'} · {v.sector.split(' · ')[0]}</Eyebrow>}
        right={null}
      />

      {/* Title block (no hero image — detail fits on one screen) */}
      <div style={{ padding: '4px 24px 20px' }}>
        <div style={{ marginBottom: 14 }}>
          <StatusPill variant="outline">{statusLabel}</StatusPill>
        </div>
        <div style={{
          fontSize: 'min(30px, 7.5vw)', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.08,
        }}>{v.name}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 'min(13px, 3.5vw)', color: ink70, flexWrap: 'wrap' }}>
          <span>{v.sector}</span>
          <span style={{ color: ink25 }}>·</span>
          <span>{v.location}</span>
        </div>
        {v.website && (
          <a href={`https://${v.website}`} target="_blank" rel="noopener noreferrer"
             style={{
               display: 'inline-flex', alignItems: 'center', gap: 8,
               marginTop: 14, padding: '0 14px', height: 32,
               borderRadius: 999, border: `1px solid ${ink12}`,
               background: paper, color: ink,
               fontSize: 12, textDecoration: 'none',
             }}>
            <span>{v.website}</span>
            <svg width="10" height="10" viewBox="0 0 11 11">
              <path d="M3 8l5-5M4 3h4v4" stroke={ink} strokeWidth="1.4" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        )}
      </div>

      {/* Key metrics — single rounded card with internal hairlines */}
      {v.metrics && (
        <div style={{ padding: '0 20px 24px' }}>
          <RoundedCard padding={0} radius={20}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {v.metrics.map((m, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                return (
                  <div key={i} style={{
                    padding: '18px 18px',
                    borderRight: col === 0 ? `1px solid ${ink12}` : 'none',
                    borderTop: row > 0 ? `1px solid ${ink12}` : 'none',
                  }}>
                    <Eyebrow style={{ marginBottom: 8 }}>{m.label}</Eyebrow>
                    <div style={{
                      fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em',
                      fontFeatureSettings: '"tnum"',
                    }}>{m.value}</div>
                  </div>
                );
              })}
            </div>
          </RoundedCard>
        </div>
      )}

      <Rule />

      {/* Parent fund → "Companies in this fund" (open by default).
          Company / lab → "Operational workflow". */}
      {isFund && companies.length > 0 ? (
        <>
          <CollapsibleSection
            title="Companies in this fund"
            meta={`${companies.length} companies`}
            defaultOpen>
            <div style={{ fontSize: 13, color: ink70, marginBottom: 16, lineHeight: 1.5 }}>
              Back the whole fund above, or open a company to direct your capital into it.
            </div>
            <CompanyList companies={companies} onOpen={onOpenCompany} />
          </CollapsibleSection>
          <Rule />
        </>
      ) : v.operations ? (
        <>
          <CollapsibleSection
            title="Operational workflow"
            meta={`${(v.operations || []).length} steps`}>
            <OpsFlow steps={v.operations} accent={accent}
                     onSelect={(idx) => onOpsDetail(idx)} />
          </CollapsibleSection>
          <Rule />
        </>
      ) : null}

      {/* Collapsible: Reviewed for you — AI screen + analyst sign-off */}
      {(v.status === 'vetted' || v.status === 'foryou') && (
        <>
          <CollapsibleSection title="Reviewed for you" meta="AI + analyst">
            <DetailReviewBlock venture={v} />
          </CollapsibleSection>
          <Rule />
        </>
      )}

      {/* Collapsible: Investment thesis */}
      <CollapsibleSection title="Investment thesis">
        {v.about && (
          <div style={{ fontSize: 16, lineHeight: 1.55, color: ink, marginBottom: thesisBullets.length ? 20 : 0 }}>
            {v.about}
          </div>
        )}
        {thesisBullets.length > 0 && <NumberedList items={thesisBullets} />}
      </CollapsibleSection>

      <Rule />

      {/* Collapsible: Risks · Financial reports */}
      <CollapsibleSection title="Risks · Financial reports">
        {isFund && companies.length > 0
          ? <FundFinancialsList companies={companies} />
          : <CompanyRisksBlock company={v} />}
      </CollapsibleSection>

      {/* Sticky bottom action bar — [Back] [Are you confident? · Invest] */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 20,
        background: paper, borderTop: `1px solid ${ink12}`,
        padding: '14px 16px',
        marginTop: 'auto',
      }}>
        {isLab && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr',
            gap: 12, alignItems: 'center',
          }}>
            <button onClick={onBack} aria-label="Back"
              style={{
                height: 52, padding: '0 18px', minWidth: 96,
                borderRadius: 999,
                background: paper, border: `1px solid ${ink12}`,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: ink, fontSize: 14, fontWeight: 500,
              }}>
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M9 1L3 7l6 6" stroke={ink} strokeWidth="1.6" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Back</span>
            </button>
            <div style={{
              fontSize: 12, color: ink55, lineHeight: 1.45, textAlign: 'right',
            }}>
              Not open for public investment.
            </div>
          </div>
        )}
        {!isLab && (v.status === 'vetted' || v.status === 'foryou') && (
          <DetailFooter onBack={onBack} accent={accent} onInvest={onInvest}
            label="Invest" confidence />
        )}
        {!isLab && v.status === 'pipeline' && (
          <DetailFooter onBack={onBack} accent={ink} onInvest={() => {}}
            label="Join waitlist" />
        )}
        {!isLab && v.status !== 'vetted' && v.status !== 'foryou' && v.status !== 'pipeline' && (
          <DetailFooter onBack={onBack} accent={accent} onInvest={onInvest}
            label="Invest" />
        )}
      </div>
    </div>
  );
}

// Sticky bottom action bar used on the venture detail screen.
// Left: small Back pill (replaces the top-left chevron so thumb reach is easy).
// Right: confidence-prompt + big Invest CTA. When `confidence` is true the
// bar shows "Are you confident?" inline above the CTA on small viewports and
// to the left of it on wider ones — never floats over content.
function DetailFooter({ onBack, accent, onInvest, label, confidence }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: 12, alignItems: 'center',
    }}>
      <button onClick={onBack} aria-label="Back"
        style={{
          height: 52, padding: '0 18px', minWidth: 96,
          borderRadius: 999,
          background: paper, border: `1px solid ${ink12}`,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: ink, fontSize: 14, fontWeight: 500,
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M9 1L3 7l6 6" stroke={ink} strokeWidth="1.6" fill="none"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Back</span>
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        {confidence && (
          <div style={{
            fontFamily: CC_MONO, fontSize: 9, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: ink55,
          }}>Are you confident?</div>
        )}
        <CCButton variant="solid" accent={accent} fullWidth onClick={onInvest}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span>{label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M3.5 11.5L20 4l-7 16-2.5-7.5L3.5 11.5z"
                    fill="none" stroke="#fff" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </CCButton>
      </div>
    </div>
  );
}

// Condensed "Reviewed for you" block used inside the DetailScreen's collapsible
// section. Mirrors the data behind CheckoutRecommendation but uses a tighter
// layout so it sits comfortably alongside other report sections.
function DetailReviewBlock({ venture }) {
  const score = venture.yieldHero || venture.yieldRange || '—';
  const aiBullets = (venture.thesisBullets || venture.thesis || []).slice(0, 3);
  const analyst = {
    name: 'Olivia M.',
    role: 'Senior Investment Analyst · Everyday',
    note:
      `${venture.name} clears our internal screen on cash-flow visibility, ` +
      `governance, and exit pathway. The ${venture.lockMonths || 12}-month ` +
      `lock-in is appropriate for the underlying business cycle. ` +
      `We recommend it for diversified portfolios; size to taste.`,
  };
  return (
    <div>
      {/* AI screen card */}
      <RoundedCard padding={0} radius={20} style={{ marginBottom: 12 }}>
        <div style={{ padding: '16px 18px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                border: `1px solid ${ink25}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="11" height="11" viewBox="0 0 12 12">
                  <path d="M6 1l1.4 3.2L11 5l-3.1 1L6 11 4.1 6 1 5l3.6-.8L6 1z"
                        fill="none" stroke={ink} strokeWidth="1" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>AI screen</div>
            </div>
            <div style={{
              fontFamily: CC_MONO, fontSize: 9, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: ink70,
              padding: '3px 9px', borderRadius: 999,
              border: `1px solid ${ink12}`,
            }}>Yield · {score}</div>
          </div>
          {aiBullets.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aiBullets.map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  fontSize: 13, color: ink, lineHeight: 1.5,
                }}>
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: ink, marginTop: 8, flexShrink: 0,
                  }} />
                  <div>{b}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </RoundedCard>
      {/* Analyst sign-off */}
      <RoundedCard padding={0} radius={20}>
        <div style={{ padding: '16px 18px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
          }}>
            <Avatar initials="OM" size={30} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{analyst.name}</div>
              <div style={{
                fontFamily: CC_MONO, fontSize: 9, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: ink55, marginTop: 2,
              }}>{analyst.role}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: ink }}>
            “{analyst.note}”
          </div>
        </div>
      </RoundedCard>
      <div style={{
        marginTop: 14, fontSize: 11, color: ink55, lineHeight: 1.5,
      }}>
        Guidance only — your final decision is yours. Projected yields are not guaranteed.
      </div>
    </div>
  );
}

// "Are you confident?" confirmation pill in the bottom-right of the detail
// screen. Tap-and-hold reveals a confirmation row + send button; tapping send
// jumps straight to the checkout. Replaces the old expand-then-tap InvestFAB.
function ConfidenceSend({ accent, onInvest }) {
  return (
    <div style={{
      position: 'absolute', right: 16, bottom: 16, zIndex: 30,
      pointerEvents: 'auto',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: ink70,
        padding: '8px 14px', borderRadius: 999,
        background: paper, border: `1px solid ${ink12}`,
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
      }}>Are you confident?</div>
      <button onClick={onInvest} aria-label="Send to checkout"
        className="pk-pulse"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: accent, border: 0, cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {/* Paper-plane / send icon. */}
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M3.5 11.5L20 4l-7 16-2.5-7.5L3.5 11.5z"
                fill="none" stroke="#fff" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// Floating action button that expands into a pill on tap.
// Tap closed → opens. Tap open → triggers onInvest. The small × collapses it.
function InvestFAB({ label, accent, onInvest }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{
      position: 'absolute', right: 16, bottom: 16, zIndex: 30,
      pointerEvents: 'auto',
    }}>
      <div onClick={() => open ? onInvest() : setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center',
          background: accent, color: '#fff',
          borderRadius: 999,
          boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
          transition: 'width 320ms cubic-bezier(.2,.7,.2,1), padding 320ms cubic-bezier(.2,.7,.2,1)',
          cursor: 'pointer',
          width: open ? 240 : 56,
          height: 56,
          paddingLeft: 0,
          paddingRight: open ? 20 : 0,
          overflow: 'hidden',
        }}>
        <div style={{
          width: 56, height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22">
            <path d="M11 3v16M7.5 6.5c0-1.4 1.6-2.5 3.5-2.5s3.5 1.1 3.5 2.5-1.6 2.5-3.5 2.5-3.5 1.1-3.5 2.5 1.6 2.5 3.5 2.5 3.5-1.1 3.5-2.5"
              stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{
          fontSize: 14, fontWeight: 500, letterSpacing: '0.005em',
          whiteSpace: 'nowrap',
          opacity: open ? 1 : 0,
          transition: 'opacity 220ms 80ms ease',
        }}>{label}</div>
      </div>
      {open && (
        <button onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          aria-label="Close"
          style={{
            position: 'absolute', top: -6, right: -6,
            width: 24, height: 24, borderRadius: '50%',
            border: `1px solid ${ink12}`, background: paper,
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1 1l8 8M9 1l-8 8" stroke={ink} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function OpsFlow({ steps, accent, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {steps.map((s, i) => {
        const name = typeof s === 'string' ? s : s.name;
        return (
          <React.Fragment key={i}>
            <button onClick={() => onSelect && onSelect(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                border: `1px solid ${ink12}`, borderRadius: 16,
                padding: '16px 18px',
                background: paper, cursor: onSelect ? 'pointer' : 'default',
                fontFamily: 'inherit', textAlign: 'left', width: '100%',
              }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: `1px solid ${ink25}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.06em',
                color: ink70, flexShrink: 0,
              }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontSize: 15, flex: 1 }}>{name}</div>
              {onSelect && (
                <svg width="8" height="14" viewBox="0 0 8 14" style={{ color: ink40, flexShrink: 0 }}>
                  <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" fill="none"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            {i < steps.length - 1 && (
              <div style={{
                width: 1, height: 14, background: ink25,
                marginLeft: 32,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function NumberedList({ items, muted = false }) {
  return (
    <div>
      {items.map((s, i) => (
        <div key={i} style={{
          display: 'flex', gap: 18,
          padding: '16px 0',
          borderTop: i === 0 ? `1px solid ${ink12}` : 'none',
          borderBottom: `1px solid ${ink12}`,
        }}>
          <div style={{
            fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
            color: ink55, paddingTop: 3, width: 18, flexShrink: 0,
          }}>{String(i + 1).padStart(2, '0')}</div>
          <div style={{
            fontSize: 15, lineHeight: 1.5,
            color: muted ? ink70 : ink,
          }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

// Portfolio-company list inside a fund's "Operational workflow" section.
function CompanyList({ companies, onOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {companies.map((c, i) => (
        <React.Fragment key={c.id}>
          <button onClick={() => onOpen && onOpen(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              border: `1px solid ${ink12}`, borderRadius: 16,
              padding: '14px 18px 14px 14px',
              background: paper, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left', width: '100%',
            }}>
            <FundIcon id={c.id} size={42} radius={10} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em' }}>
                {c.name}
              </div>
              <div style={{
                fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: ink55, marginTop: 4,
              }}>{c.sector} · {c.location.split(',')[0]}</div>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" style={{ color: ink40, flexShrink: 0 }}>
              <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {i < companies.length - 1 && (
            <div style={{
              width: 1, height: 12, background: ink25,
              marginLeft: 35,
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Fund-level financial reports — one card per portfolio company.
function FundFinancialsList({ companies }) {
  return (
    <RoundedCard padding={0} radius={20}>
      {companies.map((c, i) => {
        const f = c.financials || {};
        return (
          <div key={c.id} style={{
            padding: '18px 20px',
            borderBottom: i < companies.length - 1 ? `1px solid ${ink12}` : 'none',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', marginBottom: 12,
            }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
              <div style={{
                fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: ink55,
              }}>{f.period || 'FY 2025'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <FinKpi label="Revenue · TTM" value={f.revenue || '—'} />
              <FinKpi label="Growth"        value={f.growth  || '—'} />
              <FinKpi label="EBITDA margin" value={f.ebitda  || '—'} />
            </div>
          </div>
        );
      })}
    </RoundedCard>
  );
}

function FinKpi({ label, value }) {
  return (
    <div>
      <div style={{
        fontFamily: CC_MONO, fontSize: 9, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: ink55, marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em',
        fontFeatureSettings: '"tnum"',
      }}>{value}</div>
    </div>
  );
}

// Company-level "Risks · Financial reports" — the company's own snapshot + risk bullets.
function CompanyRisksBlock({ company }) {
  const f = company.financials || {};
  return (
    <div>
      {/* Financial snapshot */}
      <RoundedCard padding={0} radius={20} style={{ marginBottom: 18 }}>
        <div style={{ padding: '18px 20px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 14,
          }}>
            <Eyebrow>Financial snapshot</Eyebrow>
            <div style={{
              fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: ink55,
            }}>{f.period || 'FY 2025'}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <FinKpi label="Revenue · TTM" value={f.revenue || '—'} />
            <FinKpi label="Growth"        value={f.growth  || '—'} />
            <FinKpi label="EBITDA margin" value={f.ebitda  || '—'} />
          </div>
        </div>
      </RoundedCard>
      {/* Risk bullets */}
      {company.risks && company.risks.length > 0 && (
        <NumberedList items={company.risks} muted />
      )}
    </div>
  );
}

// ────────────────────────────── INVESTMENT CHECKOUT ──────────────────────────────

function CheckoutScreen({ ventureId, accent, allocationMode = 'fund', onClose, onDone }) {
  const v = ccLookup(ventureId) || CC_VENTURES[0];
  const isFund = v.type === 'fund';
  const mode = allocationMode;

  // Unified, wallet-first checkout. Same flow for funds and direct deals:
  //   Amount → Source → Review → Done
  // The Recommendation step moved onto the detail page so the user sees the
  // AI + analyst review there before tapping into checkout. The Mandate step
  // was removed — the venture you tapped IS the mandate.
  const steps = ['Amount', 'Source', 'Review', 'Done'];

  const [step, setStep] = React.useState(0);
  const [amount, setAmount] = React.useState(0);
  // Default source is the in-app wallet. If the user taps "Connect another
  // account" the picker reveals the linked external accounts.
  const [source, setSource] = React.useState('cash');
  // Submitting state — between Confirm tap and the Done screen. Drives the
  // spinner on the CTA so the confirmation feels like real work happened.
  const [submitting, setSubmitting] = React.useState(false);
  // Mandate was removed — keep the variable as the venture's id for the
  // Review/Done copy that still wants to print "via {fund}".
  const [mandate] = React.useState(isFund ? v.id : null);

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => step === 0 ? onClose() : setStep((s) => s - 1);

  // Confirm tap on the Review step — brief pending state, then advance to Done.
  const confirm = () => {
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      next();
    }, 1100);
  };

  const stepName = steps[step];

  const ctaLabel =
    stepName === 'Amount'         ? 'Continue' :
    stepName === 'Source'         ? 'Review investment' :
    stepName === 'Review'         ? 'Confirm investment' :
                                    'Back to Capital';

  const blocked =
    (stepName === 'Amount' && amount <= 0) ||
    (stepName === 'Source' && !source);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ScreenHeader
        left={<Eyebrow>{
          mode === 'expert'  ? 'Investing · Expert' :
          mode === 'company' ? 'Investing · Direct' :
                               'Investing · Fund'
        }</Eyebrow>}
        right={<div style={{
          fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: ink70,
        }}>
          {step + 1} / {steps.length}
        </div>}
      />

      <div style={{
        margin: '14px 24px 0',
        height: 3, background: ink12, borderRadius: 999, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, background: accent || ink,
          width: `${((step + 1) / steps.length) * 100}%`,
          borderRadius: 999, transition: 'width 240ms ease',
        }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 20px' }}
           key={stepName} className="pk-rise">
        {stepName === 'Recommendation' && (
          <CheckoutRecommendation venture={v} />
        )}
        {stepName === 'Amount' && (
          <>
            <AllocationNote mode={mode} venture={v} />
            <CheckoutAmount amount={amount} setAmount={setAmount} venture={v}
                            mandate={mandate} />
          </>
        )}
        {stepName === 'Source' && (
          <CheckoutSource source={source} setSource={setSource} amount={amount} venture={v} />
        )}
        {stepName === 'Review' && (
          <CheckoutReview venture={v} amount={amount} source={source} mandate={mandate} mode={mode} />
        )}
        {stepName === 'Done' && (
          <CheckoutDone venture={v} amount={amount} source={source} mandate={mandate} mode={mode} />
        )}
      </div>

      <div style={{
        background: paper, borderTop: `1px solid ${ink12}`,
        padding: '14px 16px',
      }}>
        {stepName !== 'Done' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 12, alignItems: 'center',
          }}>
            <button onClick={back}
              aria-label={step === 0 ? 'Close' : 'Back'}
              style={{
                height: 52, padding: '0 18px', minWidth: 96,
                borderRadius: 999,
                background: paper, border: `1px solid ${ink12}`,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: ink, fontSize: 14, fontWeight: 500,
              }}>
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M9 1L3 7l6 6" stroke={ink} strokeWidth="1.6" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Back</span>
            </button>
            <CCButton variant="solid" accent={accent} fullWidth
              onClick={blocked || submitting ? () => {} : (stepName === 'Review' ? confirm : next)}
              style={(blocked || submitting) ? { opacity: blocked ? 0.4 : 1, cursor: 'not-allowed' } : {}}>
              {submitting ? <SubmitSpinner label="Processing…" /> : ctaLabel}
            </CCButton>
          </div>
        )}
        {stepName === 'Done' && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CCButton variant="solid" accent={accent} onClick={onDone}
              style={{ minWidth: 240, padding: '0 32px' }}>
              Back to Capital
            </CCButton>
          </div>
        )}
      </div>
    </div>
  );
}

// Mandate step — choose Everyday (in-house picks) OR a specific fund.
function CheckoutMandate({ mandate, setMandate, venture }) {
  const options = [
    { id: 'cc', label: 'Invest with Everyday',
      sub: 'Our in-house team allocates your capital across the funds.',
      tag: 'Recommended' },
    ...CC_FUNDS_V2.map((f) => ({
      id: f.id, label: f.name + ' Fund', sub: f.blurb,
      tag: f.id === venture.id ? 'Current' : null,
    })),
  ];

  return (
    <div>
      <Eyebrow style={{ marginBottom: 8 }}>Step 1 · Mandate</Eyebrow>
      <div style={{
        fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.12,
        marginBottom: 22, maxWidth: 300,
      }}>How should your capital be invested?</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((o) => {
          const on = mandate === o.id;
          return (
            <button key={o.id} onClick={() => setMandate(o.id)}
              style={{
                display: 'flex', width: '100%',
                textAlign: 'left',
                padding: '16px 18px', borderRadius: 18,
                background: paper,
                border: `1px solid ${on ? ink : ink12}`,
                boxShadow: on ? `inset 0 0 0 1px ${ink}` : 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                gap: 14,
                alignItems: 'flex-start',
              }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: `1px solid ${on ? ink : ink25}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 1, flexShrink: 0,
              }}>
                {on && <div style={{ width: 8, height: 8, borderRadius: '50%', background: ink }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: 8,
                }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{o.label}</div>
                  {o.tag && (
                    <span style={{
                      fontFamily: CC_MONO, fontSize: 9, letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 999,
                      background: o.tag === 'Current' ? ink : 'transparent',
                      color: o.tag === 'Current' ? '#fff' : ink70,
                      border: o.tag === 'Current' ? 'none' : `1px solid ${ink12}`,
                    }}>{o.tag}</span>
                  )}
                </div>
                <div style={{
                  fontSize: 12, color: ink70, marginTop: 6, lineHeight: 1.45,
                }}>{o.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Slim, premium reminder atop the Amount step — a single quiet line stating
// what the capital is doing. No paragraph copy; the label carries the meaning.
function AllocationNote({ mode, venture }) {
  const label = {
    fund:    'Investing in the fund · diversified',
    expert:  'Investing with an in-house expert',
    company: 'Direct to ' + venture.name,
  }[mode] || null;
  if (!label) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 22,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: ink, flexShrink: 0 }} />
      <span style={{
        fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: ink70,
      }}>{label}</span>
    </div>
  );
}

function CheckoutAmount({ amount, setAmount, venture, mandate }) {
  const presets = [100000, 250000, 500000, 1000000];

  const display = amount > 0
    ? Number(amount).toLocaleString('en-US') + '.00'
    : '000.00';
  const isPlaceholder = amount === 0;

  const press = (k) => {
    if (k === 'back') {
      setAmount(Math.floor(amount / 10));
    } else if (k === '00') {
      const next = amount * 100;
      if (next <= 999999999) setAmount(next);
    } else {
      const next = amount * 10 + Number(k);
      if (next <= 999999999) setAmount(next);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 12px',
      }}>
        <Eyebrow style={{ marginBottom: 12 }}>Investing in</Eyebrow>
        <div style={{
          fontSize: 16, fontWeight: 500, letterSpacing: '-0.005em',
          marginBottom: 28,
        }}>{venture.name}</div>

        <Eyebrow style={{ marginBottom: 14 }}>Amount</Eyebrow>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'center',
          fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 0.95,
          fontFeatureSettings: '"tnum"',
          color: isPlaceholder ? ink25 : ink,
          fontSize: 'min(52px, 11vw)',
          width: '100%', overflow: 'hidden',
        }}>
          <span>{display}</span>
          <span style={{ fontSize: 16, color: ink55, letterSpacing: '0.04em' }}>RWF</span>
        </div>
        <div style={{
          fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.1em',
          color: ink55, marginTop: 12, textTransform: 'uppercase',
        }}>Minimum · {venture.minInvest || 'RWF 100,000'}</div>
      </div>

      <div style={{
        display: 'flex', gap: 8, marginBottom: 16,
        overflowX: 'auto', scrollbarWidth: 'none',
        justifyContent: 'center',
      }}>
        {presets.map((p) => {
          const on = p === amount;
          return (
            <button key={p} onClick={() => setAmount(p)} style={{
              flex: '0 0 auto',
              height: 32, padding: '0 14px', borderRadius: 999,
              background: on ? ink : paper,
              color: on ? '#fff' : ink70,
              border: `1px solid ${on ? ink : ink12}`,
              fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>{p.toLocaleString('en-US')}</button>
          );
        })}
      </div>

      <SlideUp delay={100}>
        <NumericKeypad onPress={press} />
      </SlideUp>
    </div>
  );
}

// Small inline spinner + label used on the primary CTA while a confirm tap
// is "processing". Purely cosmetic on the wireframe — the timeout is fixed.
function SubmitSpinner({ label = 'Processing…' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" className="pk-spin"
           style={{ display: 'block' }}>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.8"
                fill="none" opacity="0.25" />
        <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="1.8"
              fill="none" strokeLinecap="round" />
      </svg>
      <span>{label}</span>
    </span>
  );
}

// ─────── Receipt utilities ───────
// Every Done screen offers a downloadable plain-text receipt AND auto-saves
// the same record to the user's account-side receipts list (mocked here with
// localStorage so a refresh keeps history). Same shape on both flows so a
// future Account → Receipts list can read straight from this store.

const PK_RECEIPTS_KEY = 'poketee.receipts';

// Build a human-readable receipt body for the .txt download.
function buildReceiptText(title, rows, reference) {
  const date = new Date().toLocaleString('en-GB', {
    dateStyle: 'medium', timeStyle: 'short',
  });
  const lines = [];
  lines.push('EVERYDAY JOE — ' + title.toUpperCase());
  lines.push('────────────────────────────────────────');
  lines.push('Date:       ' + date);
  lines.push('Reference:  ' + reference);
  lines.push('');
  rows.forEach(([k, v]) => { lines.push((k + ':').padEnd(14, ' ') + v); });
  lines.push('');
  lines.push('Saved to your Everyday account · everyday.app');
  return lines.join('\n');
}

// Trigger a browser download for the receipt file.
function downloadReceiptFile(filename, body) {
  try {
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  } catch (_e) { /* ignore — wireframe */ }
}

// Persist a record into the user's account-side receipts list. Keeps the
// most-recent 50 entries; older are trimmed so the bucket can't grow forever.
function saveReceiptToAccount(receipt) {
  try {
    const existing = JSON.parse(localStorage.getItem(PK_RECEIPTS_KEY) || '[]');
    existing.unshift(receipt);
    localStorage.setItem(PK_RECEIPTS_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (_e) { /* ignore */ }
}

// Inline action block used on Done screens: a Download CTA + a small "saved"
// confirmation. Auto-saves the receipt to the account store on first mount.
function ReceiptActions({ filename, title, rows, reference }) {
  React.useEffect(() => {
    saveReceiptToAccount({
      reference, title, rows,
      savedAt: new Date().toISOString(),
    });
  }, []); // mount once

  const onDownload = () => {
    downloadReceiptFile(filename, buildReceiptText(title, rows, reference));
  };

  return (
    <div style={{ marginTop: 32 }}>
      <button onClick={onDownload}
        style={{
          width: '100%', height: 48,
          background: paper, border: `1px solid ${ink}`,
          borderRadius: 999, cursor: 'pointer', padding: '0 18px',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M7 1v9M3 7l4 4 4-4M2 13h10" stroke={ink} strokeWidth="1.4"
                fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 500, color: ink }}>
          Download receipt
        </span>
      </button>
      <div style={{
        marginTop: 12, textAlign: 'center',
        fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.1em',
        color: ink55, textTransform: 'uppercase',
      }}>Saved to your account · Receipts</div>
    </div>
  );
}

// ─────── Recommendation step ───────
// Shown at the very top of the checkout, before the user enters an amount.
// Pairs an AI-generated read on the project with a human analyst sign-off so
// the investor sees both layers of review before committing capital.
function CheckoutRecommendation({ venture }) {
  // For the wireframe we generate deterministic copy from the venture
  // metadata. In production each venture would carry its own AI-generated
  // sentiment and a signed analyst note.
  const score = venture.yieldHero || venture.yieldRange || '—';
  const aiBullets = (venture.thesisBullets || venture.thesis || []).slice(0, 3);
  const analyst = {
    name: 'Olivia M.',
    role: 'Senior Investment Analyst · Everyday',
    note:
      `${venture.name} clears our internal screen on cash-flow visibility, ` +
      `governance, and exit pathway. The ${venture.lockMonths || 12}-month ` +
      `lock-in is appropriate for the underlying business cycle. ` +
      `We recommend it for diversified portfolios; size to taste.`,
  };

  return (
    <div>
      <Eyebrow style={{ marginBottom: 8 }}>Recommendation</Eyebrow>
      <div style={{
        fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1,
        marginBottom: 8,
      }}>Reviewed for you.</div>
      <div style={{ fontSize: 13, color: ink70, marginBottom: 24, lineHeight: 1.55 }}>
        Our AI scored this deal and a human analyst signed off on the
        recommendation before it reached you.
      </div>

      {/* AI card */}
      <RoundedCard padding={0} radius={20} style={{ marginBottom: 12 }}>
        <div style={{ padding: '18px 20px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                border: `1px solid ${ink25}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M6 1l1.4 3.2L11 5l-3.1 1L6 11 4.1 6 1 5l3.6-.8L6 1z"
                        fill="none" stroke={ink} strokeWidth="1" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>AI screen</div>
            </div>
            <div style={{
              fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: ink70,
              padding: '4px 10px', borderRadius: 999,
              border: `1px solid ${ink12}`,
            }}>Yield · {score}</div>
          </div>
          {aiBullets.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiBullets.map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  fontSize: 13, color: ink, lineHeight: 1.5,
                }}>
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: ink, marginTop: 8, flexShrink: 0,
                  }} />
                  <div>{b}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </RoundedCard>

      {/* Analyst card */}
      <RoundedCard padding={0} radius={20}>
        <div style={{ padding: '18px 20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
          }}>
            <Avatar initials="OM" size={32} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{analyst.name}</div>
              <div style={{
                fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: ink55, marginTop: 2,
              }}>{analyst.role}</div>
            </div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: ink }}>
            “{analyst.note}”
          </div>
        </div>
      </RoundedCard>

      <div style={{
        marginTop: 18, padding: '14px 18px', borderRadius: 14,
        background: paperSoft,
        fontSize: 12, color: ink70, lineHeight: 1.5,
      }}>
        Recommendations are guidance, not advice. Your final decision is yours,
        and projected yields are not guaranteed.
      </div>
    </div>
  );
}

function CheckoutSource({ source, setSource, amount, venture }) {
  // Wallet-first: investments always pull from the Your wallet. Other
  // accounts (MoMo / bank / card) can be linked, but they top up the wallet
  // first — the wallet is the single source of truth so the user only ever
  // sees one balance to reason about.
  const wallet = CC_SOURCES.find((s) => s.id === 'cash') || { available: 0 };
  const others = CC_SOURCES.filter((s) => s.id !== 'cash');
  const walletShort = wallet.available != null && wallet.available < amount;
  const [showLink, setShowLink] = React.useState(false);

  return (
    <div>
      <Eyebrow style={{ marginBottom: 8 }}>Paying for</Eyebrow>
      <div style={{
        fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1,
        fontFeatureSettings: '"tnum"', marginBottom: 4,
      }}>RWF {Number(amount).toLocaleString('en-US')}</div>
      <div style={{ fontSize: 13, color: ink70, marginBottom: 28 }}>
        Invested in {venture.name}{venture.type === 'fund' ? ' Fund' : ''}.
      </div>

      {/* Wallet card — always primary */}
      <button onClick={() => setSource('cash')}
        disabled={walletShort}
        style={{
          display: 'flex', width: '100%', alignItems: 'center',
          justifyContent: 'space-between', textAlign: 'left',
          padding: '20px 22px', borderRadius: 20,
          background: paper,
          border: `1px solid ${source === 'cash' ? ink : ink12}`,
          boxShadow: source === 'cash' ? `inset 0 0 0 1px ${ink}` : 'none',
          cursor: walletShort ? 'not-allowed' : 'pointer',
          opacity: walletShort ? 0.55 : 1,
          fontFamily: 'inherit',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Wallet glyph */}
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            border: `1px solid ${ink25}`, background: paper,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 16 16">
              <rect x="2" y="4" width="12" height="9" rx="1.5"
                    stroke={ink} strokeWidth="1.3" fill="none"/>
              <path d="M2 7h12" stroke={ink} strokeWidth="1.3"/>
              <circle cx="11" cy="10" r="1" fill={ink}/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Your wallet</div>
            <div style={{
              fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
              color: walletShort ? ink : ink55, marginTop: 6, textTransform: 'uppercase',
            }}>
              {walletShort
                ? `Short by RWF ${(amount - (wallet.available || 0)).toLocaleString('en-US')} · top up first`
                : `Available · RWF ${(wallet.available || 0).toLocaleString('en-US')}`}
            </div>
          </div>
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          border: `1px solid ${source === 'cash' ? ink : ink25}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {source === 'cash' && !walletShort && (
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ink }} />
          )}
        </div>
      </button>

      {/* Connect another account — collapsed by default */}
      {!showLink && (
        <button onClick={() => setShowLink(true)}
          style={{
            marginTop: 14, padding: '12px 16px', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'transparent', border: `1px dashed ${ink25}`,
            borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: `1px solid ${ink25}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 1v8M1 5h8" stroke={ink} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 14, color: ink }}>
              {walletShort ? 'Top up your wallet to continue' : 'Connect another account'}
            </div>
          </div>
          <div style={{
            fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
            color: ink55, textTransform: 'uppercase',
          }}>Add</div>
        </button>
      )}

      {/* External-account picker — funds the wallet, then pays from it */}
      {showLink && (
        <div style={{ marginTop: 18 }}>
          <Eyebrow style={{ marginBottom: 12 }}>Top up wallet from</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {others.map((s) => {
              const on = s.id === source;
              return (
                <button key={s.id} onClick={() => setSource(s.id)}
                  style={{
                    display: 'flex', width: '100%', alignItems: 'center',
                    justifyContent: 'space-between', textAlign: 'left',
                    padding: '16px 18px', borderRadius: 18,
                    background: paper,
                    border: `1px solid ${on ? ink : ink12}`,
                    boxShadow: on ? `inset 0 0 0 1px ${ink}` : 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</div>
                    <div style={{
                      fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
                      color: ink55, marginTop: 4, textTransform: 'uppercase',
                    }}>
                      {s.available != null
                        ? `Available · RWF ${s.available.toLocaleString('en-US')}`
                        : 'Linked account'}
                    </div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `1px solid ${on ? ink : ink25}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {on && <div style={{ width: 9, height: 9, borderRadius: '50%', background: ink }} />}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{
            marginTop: 12, fontSize: 12, color: ink70, lineHeight: 1.5,
          }}>
            Funds land in your wallet first, then settle into
            {' '}{venture.name}.
          </div>
        </div>
      )}
    </div>
  );
}

// Legacy CheckoutSource left for reference — unused.
function CheckoutSourceLegacy({ source, setSource, amount, venture }) {
  return (
    <div>
      <Eyebrow style={{ marginBottom: 8 }}>Investing</Eyebrow>
      <div style={{
        fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1,
        fontFeatureSettings: '"tnum"', marginBottom: 36,
      }}>RWF {Number(amount).toLocaleString('en-US')}</div>

      <Eyebrow style={{ marginBottom: 14 }}>Funding source</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CC_SOURCES.map((s) => {
          const on = s.id === source;
          const insufficient = s.available != null && s.available < amount;
          return (
            <button key={s.id} onClick={() => !insufficient && setSource(s.id)}
              disabled={insufficient}
              style={{
                display: 'flex', width: '100%', alignItems: 'center',
                justifyContent: 'space-between', textAlign: 'left',
                padding: '18px 20px', borderRadius: 18,
                background: paper,
                border: `1px solid ${on ? ink : ink12}`,
                boxShadow: on ? `inset 0 0 0 1px ${ink}` : 'none',
                cursor: insufficient ? 'not-allowed' : 'pointer',
                opacity: insufficient ? 0.4 : 1,
                fontFamily: 'inherit',
              }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{s.label}</div>
                <div style={{
                  fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
                  color: ink55, marginTop: 6, textTransform: 'uppercase',
                }}>
                  {s.available != null
                    ? `Available · RWF ${s.available.toLocaleString('en-US')}`
                    : 'Linked account'}
                  {insufficient ? ' · Insufficient' : ''}
                </div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `1px solid ${on ? ink : ink25}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {on && <div style={{ width: 10, height: 10, borderRadius: '50%', background: ink }} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Resolve the mandate id to a readable label.
function mandateLabel(mandateId) {
  if (!mandateId) return null;
  if (mandateId === 'cc') return 'Everyday (house pick)';
  const fund = CC_FUNDS_V2.find((f) => f.id === mandateId);
  return fund ? fund.name + ' Fund' : mandateId;
}

function CheckoutReview({ venture, amount, source, mandate, mode = 'fund' }) {
  const sourceLabel = CC_SOURCES.find((s) => s.id === source)?.label || '—';
  const allocationLabel = {
    fund:    'Whole fund · diversified',
    expert:  'In-house expert allocates',
    company: 'Direct to company',
  }[mode];
  const rows = [
    ['Allocation',      allocationLabel],
    [mode === 'company' ? 'Company' : 'Fund', venture.name],
    ['Amount',          'RWF ' + Number(amount).toLocaleString('en-US')],
    ['Source',          sourceLabel],
    ['Projected yield', venture.yieldRange],
    ['Lock-in',         (venture.lockMonths || 12) + ' months'],
    ['Fee',             'Waived'],
  ];
  return (
    <div>
      <Eyebrow style={{ marginBottom: 8 }}>Review</Eyebrow>
      <div style={{
        fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1,
        marginBottom: 32, maxWidth: 280,
      }}>Confirm your investment.</div>

      <RoundedCard padding={0} radius={20}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '16px 20px',
            borderBottom: i < rows.length - 1 ? `1px solid ${ink12}` : 'none',
          }}>
            <div style={{ fontSize: 13, color: ink55 }}>{k}</div>
            <div style={{
              fontSize: 14, textAlign: 'right',
              fontFamily: /RWF|Waived/.test(String(v)) ? CC_MONO : 'inherit',
              letterSpacing: /RWF|Waived/.test(String(v)) ? '0.02em' : 'normal',
            }}>{v}</div>
          </div>
        ))}
      </RoundedCard>

      <div style={{
        marginTop: 18, padding: '16px 20px',
        borderRadius: 18, background: paperSoft,
        fontSize: 12, color: ink70, lineHeight: 1.55,
      }}>
        By confirming you authorise Everyday to allocate funds from
        your selected source. Capital is locked for the stated period. Projected
        yields are not guaranteed.
      </div>
    </div>
  );
}

function CheckoutDone({ venture, amount, source, mandate, mode = 'fund' }) {
  // Stable reference — generated once on mount so re-renders (e.g. anim ticks)
  // don't shuffle the number under the user's eyes.
  const [reference] = React.useState(
    () => 'PK-INV-2026-' + Math.floor(Math.random() * 9000 + 1000)
  );
  React.useEffect(() => { pkHaptic('success'); }, []);
  const sourceLabel = CC_SOURCES.find((s) => s.id === source)?.label || 'Your wallet';
  const allocationLabel = {
    fund:    'Whole fund · diversified',
    expert:  'In-house expert allocates',
    company: 'Direct to company',
  }[mode];
  const viaText = {
    fund:    'across the fund',
    expert:  'to our in-house expert to allocate',
    company: `directly to ${venture.name}`,
  }[mode];
  const receiptRows = [
    ['Allocation',       allocationLabel],
    [mode === 'company' ? 'Company' : 'Fund', venture.name],
    ['Amount',           'RWF ' + Number(amount).toLocaleString('en-US')],
    ['Source',           sourceLabel],
    ['Projected yield',  venture.yieldRange],
    ['Lock-in',          (venture.lockMonths || 12) + ' months'],
    ['Fee',              'Waived'],
  ];
  return (
    <div style={{
      paddingTop: 8,
      // Soft green wash so the success state is felt at a glance, without
      // overwhelming the receipt content. The inner card sits on white.
      background: 'linear-gradient(180deg, #E6F4EC 0%, #F5FBF7 60%, transparent 100%)',
      borderRadius: 24,
      margin: '-8px -4px 0',
      padding: '24px 4px 8px',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '0 8px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#1F8A5B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '4px 0 24px',
          boxShadow: '0 8px 24px rgba(31,138,91,0.28)',
        }} className="pk-ring">
          <svg width="30" height="30" viewBox="0 0 22 22">
            <path d="M4 11l5 5 9-10" stroke="#fff" strokeWidth="2" fill="none"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="pk-check-path"/>
          </svg>
        </div>
        <div style={{
          fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1,
          maxWidth: 280,
        }}>Investment confirmed.</div>
        <div style={{
          fontSize: 14, color: ink70, marginTop: 14, lineHeight: 1.55,
          maxWidth: 320,
        }}>
          RWF {Number(amount).toLocaleString('en-US')} has been allocated
          {' ' + viaText}. A confirmation has been sent to your inbox.
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Eyebrow style={{ marginBottom: 10 }}>Reference</Eyebrow>
        <div style={{
          fontFamily: CC_MONO, fontSize: 13, letterSpacing: '0.06em',
          color: ink,
        }}>{reference}</div>
      </div>

      <ReceiptActions
        filename={`everyday-receipt-${reference}.txt`}
        title="Investment receipt"
        rows={receiptRows}
        reference={reference} />
    </div>
  );
}

// ────────────────────────────── OPS STEP DETAIL ──────────────────────────────

function OpsDetailScreen({ ventureId, stepIndex, accent, onBack }) {
  const v = ccLookup(ventureId) || CC_VENTURES[0];
  const op = (v.operations || [])[stepIndex];
  if (!op) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: ink55 }}>
        Step details not available.
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      <ScreenHeader
        left={<BackBtn onClick={onBack} />}
        right={<Eyebrow>{v.name}</Eyebrow>}
      />

      {/* Title block — no hero image */}
      <div style={{ padding: '12px 24px 24px' }}>
        <Eyebrow style={{ marginBottom: 10 }}>
          Step {String(stepIndex + 1).padStart(2, '0')} · Operations
        </Eyebrow>
        <div style={{
          fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.08,
        }}>{op.name}</div>
        <div style={{ fontSize: 15, color: ink70, marginTop: 14, lineHeight: 1.55 }}>
          {op.detail}
        </div>
      </div>

      <Rule />

      {/* KPIs */}
      {op.kpis && op.kpis.length > 0 && (
        <>
          <div style={{ padding: '24px 20px' }}>
            <Eyebrow style={{ marginBottom: 14, padding: '0 4px' }}>Key indicators</Eyebrow>
            <RoundedCard padding={0} radius={20}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {op.kpis.map((k, i) => (
                  <div key={i} style={{
                    padding: '18px 20px',
                    borderRight: i % 2 === 0 ? `1px solid ${ink12}` : 'none',
                    borderTop: i >= 2 ? `1px solid ${ink12}` : 'none',
                  }}>
                    <Eyebrow style={{ marginBottom: 8 }}>{k.label}</Eyebrow>
                    <div style={{
                      fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em',
                      fontFeatureSettings: '"tnum"',
                    }}>{k.value}</div>
                  </div>
                ))}
              </div>
            </RoundedCard>
            {op.timeline && (
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Eyebrow>Timeline</Eyebrow>
                <div style={{
                  fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.06em',
                }}>{op.timeline}</div>
              </div>
            )}
          </div>
          <Rule />
        </>
      )}

      {/* Activities */}
      {op.activities && op.activities.length > 0 && (
        <>
          <div style={{ padding: '24px 24px' }}>
            <Eyebrow style={{ marginBottom: 14 }}>Activities</Eyebrow>
            <NumberedList items={op.activities} />
          </div>
          <Rule />
        </>
      )}

      {/* Partners */}
      {op.partners && op.partners.length > 0 && (
        <div style={{ padding: '24px 24px 8px' }}>
          <Eyebrow style={{ marginBottom: 14 }}>Partners</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {op.partners.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0',
                borderTop: i === 0 ? `1px solid ${ink12}` : 'none',
                borderBottom: `1px solid ${ink12}`,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: ink25, flexShrink: 0,
                }} />
                <div style={{ fontSize: 15 }}>{p}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Website link */}
      {v.website && (
        <div style={{ padding: '24px 20px 12px' }}>
          <a href={`https://${v.website}`} target="_blank" rel="noopener noreferrer"
             style={{
               display: 'flex', alignItems: 'center', gap: 8,
               justifyContent: 'center',
               padding: '0 16px', height: 48,
               borderRadius: 999, border: `1px solid ${ink12}`,
               background: paper, color: ink,
               fontSize: 14, fontWeight: 500, textDecoration: 'none',
             }}>
            <span>Visit {v.website}</span>
            <svg width="12" height="12" viewBox="0 0 11 11">
              <path d="M3 8l5-5M4 3h4v4" stroke={ink} strokeWidth="1.4" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────── MONEY FLOWS ──────────────────────────────
// One component, three modes: add / move / withdraw.

const CC_FLOW_CONFIGS = {
  add: {
    title: 'Top Up',
    steps: ['Amount', 'From', 'Where', 'Review', 'Done'],
    pickers: {
      1: { kind: 'topup-source',   label: 'Funding source' },
      2: { kind: 'topup-allocate', label: 'Allocate to' },
    },
    finalCta: 'Confirm deposit',
    doneTitle: 'Money added.',
    doneSub: (amt) =>
      `RWF ${amt.toLocaleString('en-US')} added to your wallet. Funds available immediately.`,
  },
  move: {
    title: 'Move funds',
    steps: ['Amount', 'From', 'To', 'Review', 'Done'],
    pickers: {
      1: { kind: 'fund', label: 'Move from' },
      2: { kind: 'fund', label: 'Move to' },
    },
    finalCta: 'Confirm move',
    doneTitle: 'Funds moved.',
    doneSub: (amt) =>
      `RWF ${amt.toLocaleString('en-US')} reallocated between your funds.`,
  },
  withdraw: {
    title: 'Withdraw',
    steps: ['Amount', 'To', 'Review', 'Done'],
    pickers: { 1: { kind: 'withdraw-destination', label: 'Destination' } },
    finalCta: 'Confirm withdrawal',
    doneTitle: 'Withdrawal initiated.',
    doneSub: (amt) =>
      `RWF ${amt.toLocaleString('en-US')} is on its way. It will arrive in your selected account within 1–2 business days.`,
  },
  borrow: {
    title: 'Borrow',
    steps: ['Amount', 'Review', 'Done'],
    pickers: {},
    finalCta: 'Confirm & receive',
    doneTitle: 'Funds received.',
    doneSub: (amt) =>
      `RWF ${amt.toLocaleString('en-US')} has been added to your wallet. Repay any time — your available credit restores as you repay.`,
  },
  repay: {
    title: 'Repay',
    steps: ['Amount', 'Review', 'Done'],
    pickers: {},
    finalCta: 'Confirm repayment',
    doneTitle: 'Repayment complete.',
    doneSub: (amt) =>
      `RWF ${amt.toLocaleString('en-US')} repaid from your wallet. That much borrowing capacity is now restored.`,
  },
};

// The add / withdraw flows reference these specialised pickers, which were
// never implemented (top-up and withdraw crashed). Provide them as thin
// FlowPicker wrappers over the relevant option lists.
function FlowTopUpSource({ amount, value, onPick }) {
  return <FlowPicker label="Funding source" amount={amount} options={CC_DEPOSIT_SOURCES} value={value} onPick={onPick} />;
}
function FlowTopUpAllocate({ amount, value, onPick }) {
  return <FlowPicker label="Allocate to" amount={amount} options={CC_FUNDS_PICKER} value={value} onPick={onPick} />;
}
function FlowWithdrawDestination({ amount, value, onPick }) {
  return <FlowPicker label="Destination" amount={amount} options={CC_DESTINATIONS} value={value} onPick={onPick} />;
}

function MoneyFlowScreen({ mode, accent, onClose, onDone }) {
  const cfg = CC_FLOW_CONFIGS[mode];
  const [step, setStep] = React.useState(0);
  // Money flows start at 0 — user types via the in-app keypad.
  const [amount, setAmount] = React.useState(0);
  // selections keyed by step index
  const [picks, setPicks] = React.useState({});
  // Brief processing state on the final confirm tap.
  const [submitting, setSubmitting] = React.useState(false);

  const next = () => setStep((s) => Math.min(cfg.steps.length - 1, s + 1));
  const back = () => step === 0 ? onClose() : setStep((s) => s - 1);

  const confirm = () => {
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      next();
    }, 1100);
  };

  const optionsFor = (kind) =>
    kind === 'source'      ? CC_DEPOSIT_SOURCES :
    kind === 'fund'        ? CC_FUNDS :
    kind === 'destination' ? CC_DESTINATIONS :
    kind === 'mandate'     ? CC_MANDATE_TARGETS : [];

  const pickerLabelFor = (idx) => {
    const pick = picks[idx];
    if (pick == null) return '—';
    if (typeof pick === 'object') return pick.label || '—';
    const cfgP = cfg.pickers[idx];
    if (!cfgP) return '—';
    const opts = optionsFor(cfgP.kind);
    return opts.find((o) => o.id === pick)?.label || '—';
  };

  const cta = () => {
    if (step === cfg.steps.length - 1) return 'Done';
    const isLastInput = step === cfg.steps.length - 2;
    if (isLastInput) return cfg.finalCta;
    if (step === 0) return 'Continue';
    return 'Continue';
  };

  const onPrimary = () => {
    if (step === cfg.steps.length - 1) return onDone();
    next();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ScreenHeader
        left={<Eyebrow>{cfg.title}</Eyebrow>}
        right={<div style={{
          fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: ink70,
        }}>
          {step + 1} / {cfg.steps.length}
        </div>}
      />

      <div style={{
        margin: '14px 24px 0',
        height: 3, background: ink12, borderRadius: 999, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, background: accent || ink,
          width: `${((step + 1) / cfg.steps.length) * 100}%`,
          borderRadius: 999, transition: 'width 240ms ease',
        }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 24px 20px' }}
           key={cfg.steps[step]} className="pk-rise">
        {cfg.steps[step] === 'Amount' && (
          <FlowAmount amount={amount} setAmount={setAmount} title={cfg.title}
            hint={
              mode === 'borrow' ? `Available · ${fmtRWF(CC_CREDIT.available)}` :
              mode === 'repay'  ? `Outstanding · ${fmtRWF(CC_CREDIT.outstanding)}` :
              null
            } />
        )}
        {cfg.pickers[step] && (() => {
          const pcfg = cfg.pickers[step];
          const onPick = (val) => setPicks((p) => ({ ...p, [step]: val }));
          const value  = picks[step];
          if (pcfg.kind === 'topup-source') {
            return <FlowTopUpSource amount={amount} value={value} onPick={onPick} />;
          }
          if (pcfg.kind === 'topup-allocate') {
            return <FlowTopUpAllocate amount={amount} value={value} onPick={onPick} />;
          }
          if (pcfg.kind === 'withdraw-destination') {
            return <FlowWithdrawDestination amount={amount} value={value} onPick={onPick} />;
          }
          return (
            <FlowPicker
              label={pcfg.label}
              amount={amount}
              options={optionsFor(pcfg.kind)}
              value={value}
              onPick={onPick}
              disabledId={
                mode === 'move' && step === 2 ? picks[1] :
                mode === 'move' && step === 1 ? picks[2] : null
              }
            />
          );
        })()}
        {cfg.steps[step] === 'Review' && (
          <FlowReview mode={mode} cfg={cfg} amount={amount} picks={picks}
                      pickerLabelFor={pickerLabelFor} />
        )}
        {cfg.steps[step] === 'Done' && (
          <FlowDone title={cfg.doneTitle} sub={cfg.doneSub(amount)}
                    mode={mode} amount={amount} picks={picks} cfg={cfg}
                    pickerLabelFor={pickerLabelFor} />
        )}
      </div>

      {/* Footer — de-carded: canvas, dashed top, rounded-rect buttons */}
      <div style={{
        background: canvas, borderTop: `1px dashed ${DASH}`,
        padding: '14px 16px max(14px, env(safe-area-inset-bottom, 14px))',
      }}>
        {(() => {
          const stepName = cfg.steps[step];
          const isReview = stepName === 'Review';
          const isDone   = stepName === 'Done';
          const blocked =
            (stepName === 'Amount' && amount <= 0) ||
            (cfg.pickers[step] && !picks[step]);
          const onTap = isReview ? confirm : onPrimary;
          if (isDone) {
            return (
              <CCButton variant="solid" accent={accent} fullWidth
                onClick={onTap}
                style={{ height: 54, borderRadius: 16, fontWeight: 760 }}>
                {cta()}
              </CCButton>
            );
          }
          return (
            <div style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr',
              gap: 12, alignItems: 'center',
            }}>
              <button onClick={back}
                aria-label={step === 0 ? 'Close' : 'Back'}
                style={{
                  height: 54, padding: '0 22px',
                  borderRadius: 16,
                  background: 'transparent', border: `1.5px solid ${ink12}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  color: ink, fontSize: 14.5, fontWeight: 700,
                }}>
                <svg width="13" height="13" viewBox="0 0 14 14">
                  <path d="M9 1L3 7l6 6" stroke={ink} strokeWidth="1.7" fill="none"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {step === 0 ? 'Close' : 'Back'}
              </button>
              <CCButton variant="solid" accent={accent} fullWidth
                onClick={blocked || submitting ? () => {} : onTap}
                style={{ height: 54, borderRadius: 16, fontWeight: 760, ...((blocked || submitting) ? { opacity: blocked ? 0.4 : 1, cursor: 'not-allowed' } : {}) }}>
                {submitting ? <SubmitSpinner label="Processing…" /> : cta()}
              </CCButton>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function FlowAmount({ amount, setAmount, title, hint }) {
  const presets = [100000, 250000, 500000, 1000000];

  const display = amount > 0
    ? Number(amount).toLocaleString('en-US') + '.00'
    : '000.00';
  const isPlaceholder = amount === 0;

  const press = (k) => {
    if (k === 'back') {
      setAmount(Math.floor(amount / 10));
    } else if (k === '00') {
      const next = amount * 100;
      if (next <= 999999999) setAmount(next);
    } else {
      const next = amount * 10 + Number(k);
      if (next <= 999999999) setAmount(next);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Centered amount display */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 12px',
      }}>
        <Eyebrow style={{ marginBottom: 16 }}>{title} · in RWF</Eyebrow>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'center',
          fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 0.95,
          fontFeatureSettings: '"tnum"',
          color: isPlaceholder ? ink25 : ink,
          fontSize: 'min(56px, 12vw)',
          width: '100%', overflow: 'hidden',
        }}>
          <span>{display}</span>
          <span style={{ fontSize: 16, color: ink55, letterSpacing: '0.04em' }}>RWF</span>
        </div>
        <div style={{
          fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.1em',
          color: ink55, marginTop: 14, textTransform: 'uppercase',
        }}>{hint || 'Minimum · RWF 10,000'}</div>
      </div>

      {/* Quick-amount chips */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 18,
        overflowX: 'auto', scrollbarWidth: 'none',
        justifyContent: 'center',
      }}>
        {presets.map((p) => {
          const on = p === amount;
          return (
            <button key={p} onClick={() => setAmount(p)} style={{
              flex: '0 0 auto',
              height: 32, padding: '0 14px', borderRadius: 999,
              background: on ? ink : paper,
              color: on ? '#fff' : ink70,
              border: `1px solid ${on ? ink : ink12}`,
              fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>{p.toLocaleString('en-US')}</button>
          );
        })}
      </div>

      {/* Keypad — slides in */}
      <SlideUp delay={100}>
        <NumericKeypad onPress={press} />
      </SlideUp>
    </div>
  );
}

// 3x4 numeric keypad — matches the rounded, monochrome language.
function NumericKeypad({ onPress }) {
  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '00', '0', 'back',
  ];
  return (
    <div style={{
      width: '100%',
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'min(8px, 1.5vw)',
    }}>
      {keys.map((k) => (
        <button key={k} onClick={() => onPress(k)} style={{
          height: 'min(56px, 12vh)', borderRadius: 16,
          background: paper,
          border: `1px solid ${ink12}`,
          fontFamily: CC_MONO, fontSize: 'min(18px, 4.5vw)', color: ink,
          letterSpacing: '0.02em',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {k === 'back' ? (
            <svg width="20" height="14" viewBox="0 0 20 14">
              <path d="M6 1h12a1 1 0 011 1v10a1 1 0 01-1 1H6L1 7l5-6z" fill="none"
                    stroke={ink} strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M10 5l4 4M14 5l-4 4" stroke={ink} strokeWidth="1.4"
                    strokeLinecap="round"/>
            </svg>
          ) : k}
        </button>
      ))}
    </div>
  );
}

function FlowPicker({ label, amount, options, value, onPick, disabledId }) {
  return (
    <div>
      <Eyebrow style={{ marginBottom: 8 }}>Amount</Eyebrow>
      <div style={{
        fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1,
        fontFeatureSettings: '"tnum"', marginBottom: 36,
      }}>RWF {Number(amount).toLocaleString('en-US')}</div>

      <Eyebrow style={{ marginBottom: 14 }}>{label}</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((o) => {
          const on = o.id === value;
          const disabled = o.id === disabledId;
          return (
            <button key={o.id} onClick={() => !disabled && onPick(o.id)}
              disabled={disabled}
              style={{
                display: 'flex', width: '100%', alignItems: 'center',
                justifyContent: 'space-between', textAlign: 'left',
                padding: '18px 20px', borderRadius: 18,
                background: paper,
                border: `1px solid ${on ? ink : ink12}`,
                boxShadow: on ? `inset 0 0 0 1px ${ink}` : 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.35 : 1,
                fontFamily: 'inherit',
              }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{o.label}</div>
                <div style={{
                  fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
                  color: ink55, marginTop: 6, textTransform: 'uppercase',
                }}>{o.sub}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `1px solid ${on ? ink : ink25}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {on && <div style={{ width: 10, height: 10, borderRadius: '50%', background: ink }} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlowReview({ mode, cfg, amount, picks, pickerLabelFor }) {
  const title = {
    add:      'Confirm deposit.',
    move:     'Confirm move.',
    withdraw: 'Confirm withdrawal.',
    borrow:   'Confirm borrowing.',
    repay:    'Confirm repayment.',
  }[mode];

  const fee = Math.round(amount * (CC_CREDIT.serviceFeePct || 0));
  const rows = [];
  rows.push(['Amount', 'RWF ' + Number(amount).toLocaleString('en-US')]);
  Object.keys(cfg.pickers).forEach((idx) => {
    rows.push([cfg.pickers[idx].label, pickerLabelFor(Number(idx))]);
  });
  if (mode === 'add')      rows.push(['Arrival', 'Instant']);
  if (mode === 'withdraw') rows.push(['Arrival', '1–2 business days']);
  if (mode === 'move')     rows.push(['Arrival', 'Instant']);
  if (mode === 'borrow') {
    rows.push(['Service fee · 2%', 'RWF ' + fee.toLocaleString('en-US')]);
    rows.push(['Total to repay', 'RWF ' + (amount + fee).toLocaleString('en-US')]);
    rows.push(['Deposited to', 'Your wallet']);
  } else if (mode === 'repay') {
    rows.push(['From', 'Your wallet']);
    rows.push(['Outstanding after', 'RWF ' + Math.max(0, CC_CREDIT.outstanding - amount).toLocaleString('en-US')]);
  } else {
    rows.push(['Fee', 'Waived']);
  }

  return (
    <div>
      <Eyebrow style={{ marginBottom: 8 }}>Review</Eyebrow>
      <div style={{
        fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1,
        marginBottom: 32, maxWidth: 280,
      }}>{title}</div>

      <RoundedCard padding={0} radius={20}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '16px 20px',
            borderBottom: i < rows.length - 1 ? `1px solid ${ink12}` : 'none',
          }}>
            <div style={{ fontSize: 13, color: ink55 }}>{k}</div>
            <div style={{
              fontSize: 14, textAlign: 'right', maxWidth: '60%',
              fontFamily: /RWF|Waived|Instant|days/.test(String(v)) ? CC_MONO : 'inherit',
              letterSpacing: /RWF|Waived|Instant|days/.test(String(v)) ? '0.02em' : 'normal',
            }}>{v}</div>
          </div>
        ))}
      </RoundedCard>

      <div style={{
        marginTop: 18, padding: '16px 20px',
        borderRadius: 18, background: paperSoft,
        fontSize: 12, color: ink70, lineHeight: 1.55,
      }}>
        By confirming you authorise Everyday to process this
        transaction on your behalf. A receipt will be sent to your inbox.
      </div>
    </div>
  );
}

function FlowDone({ title, sub, mode, amount, picks, cfg, pickerLabelFor }) {
  // Stable reference number per mount.
  const [reference] = React.useState(
    () => 'EJ-TXN-2026-' + Math.floor(Math.random() * 9000 + 1000)
  );
  React.useEffect(() => { pkHaptic('success'); }, []);
  const modeLabel =
    mode === 'add'      ? 'Top up'   :
    mode === 'move'     ? 'Move'     :
    mode === 'withdraw' ? 'Withdraw' :
    mode === 'borrow'   ? 'Borrow'   :
    mode === 'repay'    ? 'Repay'    : 'Transaction';
  // Build receipt rows from the picker selections used in this flow.
  const receiptRows = [
    ['Type',   modeLabel],
    ['Amount', 'RWF ' + Number(amount).toLocaleString('en-US')],
  ];
  Object.keys(cfg.pickers || {}).forEach((idx) => {
    const p = cfg.pickers[idx];
    if (!p) return;
    receiptRows.push([p.label, pickerLabelFor(Number(idx))]);
  });
  if (mode === 'borrow') {
    const fee = Math.round(amount * (CC_CREDIT.serviceFeePct || 0));
    receiptRows.push(['Service fee', 'RWF ' + fee.toLocaleString('en-US')]);
  } else if (mode !== 'repay') {
    receiptRows.push(['Fee', 'Waived']);
  }

  return (
    <div style={{
      paddingTop: 8,
      background: 'linear-gradient(180deg, #E6F4EC 0%, #F5FBF7 60%, transparent 100%)',
      borderRadius: 24,
      margin: '-8px -4px 0',
      padding: '24px 4px 8px',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '0 8px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#1F8A5B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '4px 0 24px',
          boxShadow: '0 8px 24px rgba(31,138,91,0.28)',
        }} className="pk-ring">
          <svg width="30" height="30" viewBox="0 0 22 22">
            <path d="M4 11l5 5 9-10" stroke="#fff" strokeWidth="2" fill="none"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="pk-check-path"/>
          </svg>
        </div>
        <div style={{
          fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1,
          maxWidth: 280,
        }}>{title}</div>
        <div style={{
          fontSize: 14, color: ink70, marginTop: 14, lineHeight: 1.55,
          maxWidth: 320,
        }}>{sub}</div>
      </div>

      <div style={{ marginTop: 36 }}>
        <Eyebrow style={{ marginBottom: 10 }}>Reference</Eyebrow>
        <div style={{
          fontFamily: CC_MONO, fontSize: 13, letterSpacing: '0.06em',
          color: ink,
        }}>{reference}</div>
      </div>

      <ReceiptActions
        filename={`everyday-receipt-${reference}.txt`}
        title={`${modeLabel} receipt`}
        rows={receiptRows}
        reference={reference} />
    </div>
  );
}

Object.assign(window, {
  CapitalScreen, VentureFeedScreen, DetailScreen, CheckoutScreen,
  OpsDetailScreen, MoneyFlowScreen, WalletScreen, SettingsScreen,
  EverydayAuthGate, EverydayProfileSetup,
  BountyButton, BountyPanel,
  everydayProfileName, everydayFirstName, everydayProfileInitials,
});

// ────────────────────────────── WALLET ──────────────────────────────
// Where money lives — invested capital, available, and pending in/out.

function WalletScreen({ accent, onBack, onMoney, onActivity }) {
  const w = CC_WALLET;
  const total = w.invested + w.available;
  const [hidden, setHidden] = React.useState(false);

  const shown = (n) =>
    hidden
      ? '••••••'
      : 'RWF ' + Number(n).toLocaleString('en-US');

  return (
    <div style={{ paddingBottom: 24 }}>
      <ScreenHeader
        left={<BackBtn onClick={onBack} />}
        right={<Eyebrow>Wallet</Eyebrow>}
      />

      {/* Hero — total balance with eye toggle */}
      <div style={{ padding: '32px 24px 28px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <Eyebrow>Total balance</Eyebrow>
          <EyeToggle hidden={hidden} onToggle={() => setHidden((h) => !h)} />
        </div>
        <div style={{
          fontSize: 44, fontWeight: 500, letterSpacing: '-0.025em',
          fontFeatureSettings: '"tnum"', lineHeight: 1,
          userSelect: 'none',
        }}>
          {hidden ? 'RWF ••••••••' : `RWF ${Number(total).toLocaleString('en-US')}`}
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 22 }}>
          <div>
            <Eyebrow style={{ marginBottom: 6 }}>Invested</Eyebrow>
            <div style={{
              fontSize: 18, fontWeight: 500, fontFeatureSettings: '"tnum"',
            }}>{shown(w.invested)}</div>
          </div>
          <div>
            <Eyebrow style={{ marginBottom: 6 }}>Available</Eyebrow>
            <div style={{
              fontSize: 18, fontWeight: 500, fontFeatureSettings: '"tnum"',
            }}>{shown(w.available)}</div>
          </div>
        </div>
      </div>

      <Rule />

      {/* Collapsible: Holdings */}
      <CollapsibleSection title="Holdings" meta={`${w.holdings.length}`}>
        {w.holdings.map((h, i) => (
          <div key={h.id} style={{
            padding: '14px 0',
            borderTop: i === 0 ? `1px solid ${ink12}` : 'none',
            borderBottom: `1px solid ${ink12}`,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', marginBottom: 8,
            }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{h.label}</div>
              <div style={{
                fontFamily: CC_MONO, fontSize: 12, letterSpacing: '0.04em',
              }}>{hidden ? '••••••' : h.amount}</div>
            </div>
            <div style={{
              height: 2, background: ink12, borderRadius: 999,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0, width: `${h.pct}%`,
                background: accent || ink, borderRadius: 999,
              }} />
            </div>
          </div>
        ))}
      </CollapsibleSection>

      <Rule />

      {/* Collapsible: Pending */}
      {w.pending && w.pending.length > 0 && (
        <>
          <CollapsibleSection title="Pending" meta={`${w.pending.length}`}>
            {w.pending.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderTop: i === 0 ? `1px solid ${ink12}` : 'none',
                borderBottom: `1px solid ${ink12}`,
              }}>
                <div>
                  <div style={{ fontSize: 14 }}>{p.title}</div>
                  <div style={{
                    fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
                    color: ink55, marginTop: 4, textTransform: 'uppercase',
                  }}>{p.sub}</div>
                </div>
                <div style={{
                  fontFamily: CC_MONO, fontSize: 13, letterSpacing: '0.02em',
                }}>{hidden ? '••••••' : p.amount}</div>
              </div>
            ))}
          </CollapsibleSection>
          <Rule />
        </>
      )}

      {/* Quick actions */}
      <div style={{ padding: '24px 20px 0', display: 'flex', gap: 10 }}>
        <CCButton variant="ghost" size="md" fullWidth onClick={() => onMoney('add')}>Top Up</CCButton>
        <CCButton variant="ghost" size="md" fullWidth onClick={() => onMoney('withdraw')}>Withdraw</CCButton>
      </div>

      {/* All activity */}
      {onActivity && (
        <div style={{ padding: '12px 20px 0' }}>
          <button onClick={onActivity} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '16px 18px', borderRadius: 16,
            background: paper, border: `1px solid ${ink12}`,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <span style={{ fontSize: 14.5, fontWeight: 500 }}>View all activity</span>
            <svg width="8" height="14" viewBox="0 0 8 14" style={{ color: ink40 }}>
              <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────── SETTINGS / PROFILE ──────────────────────────────

function SettingsScreen({ accent, profile, authConfigured = false, onBack, onSignOut, onProfileUpdated }) {
  const [confirmSignOut, setConfirmSignOut] = React.useState(false);
  const [language, setLanguage] = usePersisted('profile_language', (profile && profile.language) || 'en');
  React.useEffect(() => {
    if (profile && profile.language && profile.language !== language) setLanguage(profile.language);
  }, [profile && profile.language]);
  const languageLabel = language === 'rw' ? 'Kinyarwanda' : 'English';
  const displayName = everydayProfileName(profile);
  const email = (profile && profile.email) || 'joseph.k@example.com';
  const toggleLanguage = async () => {
    pkHaptic('select');
    const next = language === 'rw' ? 'en' : 'rw';
    setLanguage(next);
    if (authConfigured && window.EverydayAPI && window.EverydayAPI.profile) {
      try {
        const updated = await window.EverydayAPI.profile.update({ language: next });
        onProfileUpdated && onProfileUpdated(updated);
      } catch (e) {}
    }
  };
  return (
    <div style={{ paddingBottom: 24 }}>
      <ScreenHeader
        left={<BackBtn onClick={onBack} />}
        right={<Eyebrow>Profile</Eyebrow>}
      />

      {/* Identity */}
      <div style={{ padding: '24px 24px 28px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Avatar initials={everydayProfileInitials(profile)} size={56} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>
            {displayName}
          </div>
          <div style={{
            fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
            color: ink55, marginTop: 4, textTransform: 'uppercase',
          }}>{email}</div>
        </div>
      </div>

      {/* Setting groups */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {CC_SETTINGS.map((g) => (
          <div key={g.group}>
            <Eyebrow style={{ marginBottom: 10, padding: '0 4px' }}>{g.group}</Eyebrow>
            <RoundedCard padding={0} radius={20}>
              {g.items.map((it, i) => {
                const isLanguage = it.id === 'la';
                const meta = isLanguage ? languageLabel : it.meta;
                return (
                <div key={it.id}
                  onClick={it.id === 'so' ? () => setConfirmSignOut(true) : isLanguage ? toggleLanguage : undefined}
                  style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: i < g.items.length - 1 ? `1px solid ${ink12}` : 'none',
                  cursor: it.id === 'so' || isLanguage ? 'pointer' : 'default',
                }}>
                  <div style={{
                    fontSize: 15,
                    color: it.destructive ? accent : ink,
                  }}>{it.label}</div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    {meta && (
                      <span style={{
                        fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: ink55,
                      }}>{meta}</span>
                    )}
                    {!it.destructive && (
                      <svg width="8" height="14" viewBox="0 0 8 14" style={{ color: ink40 }}>
                        <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4"
                              fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              )})}
            </RoundedCard>
          </div>
        ))}
      </div>

      {confirmSignOut && (
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{
            background: paper, border: `1px solid ${ink12}`, borderRadius: 20,
            padding: 18, boxShadow: cardShadow,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>Sign out of Everyday?</div>
            <div style={{ fontSize: 13, color: ink55, marginTop: 6, lineHeight: 1.5 }}>
              You’ll need your passcode to sign back in.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <CCButton variant="ghost" size="sm" fullWidth onClick={() => setConfirmSignOut(false)}>Cancel</CCButton>
              <CCButton variant="solid" size="sm" accent={accent} fullWidth
                onClick={() => { setConfirmSignOut(false); onSignOut && onSignOut(); }}>Sign out</CCButton>
            </div>
          </div>
        </div>
      )}

      <div style={{
        padding: '28px 24px 0',
        fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
        color: ink40, textAlign: 'center', textTransform: 'uppercase',
      }}>
        Everyday · v0.4.0
      </div>
    </div>
  );
}

// ────────────────────────────── ACTIVITY / HISTORY ──────────────────────────────

function ActivityGlyph({ kind }) {
  const paths = {
    topup:    <path d="M12 5v9M8 11l4 4 4-4M5 19h14" />,
    save:     <path d="M5 8.5h14v10H5zM5 8.5l3-3.5h8l3 3.5M9.5 12.5h5" />,
    invest:   <path d="M7 17L17 7M9 7h8v8" />,
    withdraw: <path d="M12 19v-9M8 13l4-4 4 4M5 5h14" />,
    borrow:   <path d="M12 19v-9M8 13l4-4 4 4M5 5h14" transform="rotate(180 12 12)" />,
    repay:    <path d="M5 12a7 7 0 1 1 2 5M5 17v-4h4" />,
    yield:    <path d="M12 4l1.6 3.6L17 9l-3.4 1.4L12 14l-1.6-3.6L7 9l3.4-1.4L12 4z" />,
  };
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      background: '#F2F2F2', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: ink,
    }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {paths[kind] || paths.invest}
      </svg>
    </div>
  );
}

function ActivityScreen({ accent, onBack }) {
  const items = CC_ACTIVITY;
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'in', label: 'Money in' },
    { id: 'out', label: 'Money out' },
  ];
  const filtered = filter === 'all' ? items : items.filter((it) => it.dir === filter);
  return (
    <div style={{ paddingBottom: 28 }}>
      <ScreenHeader
        left={<BackBtn onClick={onBack} />}
        right={<Eyebrow>Activity</Eyebrow>}
      />

      <div style={{ padding: '20px 24px 18px' }}>
        <div style={{
          fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05,
        }}>Activity</div>
        <div style={{ fontSize: 13, color: ink70, marginTop: 8 }}>
          Every top-up, investment, withdrawal, and payout.
        </div>
      </div>

      <div style={{ padding: '0 24px 14px', display: 'flex', gap: 8 }}>
        {filters.map((f) => {
          const on = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              height: 34, padding: '0 14px', border: 0, borderRadius: 999,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 760,
              background: on ? ink : 'rgba(255,255,255,0.6)', color: on ? paper : ink,
            }}>{f.label}</button>
          );
        })}
      </div>

      <div style={{ padding: '0 20px' }}>
        <RoundedCard padding={0} radius={20}>
          {filtered.length === 0 && (
            <div style={{ padding: '26px 18px', textAlign: 'center', fontSize: 13, color: ink55 }}>
              Nothing here yet.
            </div>
          )}
          {filtered.map((it, i) => (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              borderBottom: i < filtered.length - 1 ? `1px solid ${ink12}` : 'none',
            }}>
              <ActivityGlyph kind={it.kind} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14.5, fontWeight: 500, letterSpacing: '-0.005em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{it.title}</div>
                <div style={{
                  fontFamily: CC_MONO, fontSize: 9.5, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: ink55, marginTop: 4,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{it.meta} · {it.date}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: CC_MONO, fontSize: 12.5, letterSpacing: '0.02em',
                  color: it.dir === 'in' ? '#1F8A5B' : ink,
                }}>{it.amount}</div>
                {it.status === 'Pending' && (
                  <div style={{
                    fontFamily: CC_MONO, fontSize: 8.5, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: ink55, marginTop: 3,
                  }}>Pending</div>
                )}
              </div>
            </div>
          ))}
        </RoundedCard>
      </div>
    </div>
  );
}

Object.assign(window, { ActivityScreen, CreditScreen, GrowthScreen });
