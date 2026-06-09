// screens.jsx — Capital home, Venture feed, Detail, Checkout
// Everyday — low-fi swiss wireframes, pill-rounded geometry.

// ────────────────────────────── EVERYDAY HUB ──────────────────────────────
// Vertical scroll-wheel picker. Single arrow top/bottom. Supports touch
// swipe, mouse wheel, and click. "Everyday" label at top.

function EverydayHub({ web, onSave, onPlan, onShop, onCommute, onSettings }) {
  const hubBg = '#0A0A0A';
  const hubText = '#FAF6F1';
  const hubTextDim = 'rgba(250,246,241,0.25)';
  const hubTextMid = 'rgba(250,246,241,0.55)';

  const sections = [
    { id: 'save',    label: 'Save',    action: onSave },
    { id: 'plan',    label: 'Plan',    action: onPlan },
    { id: 'shop',    label: 'Shop',    action: onShop },
    { id: 'commute', label: 'Commute', action: onCommute },
  ];

  const [selected, setSelected] = React.useState(0);
  const total = sections.length;
  const wheelRef = React.useRef(null);
  const touchRef = React.useRef({ y: 0 });

  const goUp = () => { pkHaptic('select'); setSelected((i) => (i - 1 + total) % total); };
  const goDown = () => { pkHaptic('select'); setSelected((i) => (i + 1) % total); };
  const goOpen = () => { pkHaptic('medium'); sections[selected].action && sections[selected].action(); };

  // Mouse wheel scrolling
  React.useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    let cooldown = false;
    const onWheel = (e) => {
      e.preventDefault();
      if (cooldown) return;
      cooldown = true;
      setTimeout(() => { cooldown = false; }, 200);
      if (e.deltaY > 0) goDown();
      else if (e.deltaY < 0) goUp();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  // Touch swipe
  React.useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const onStart = (e) => { touchRef.current.y = e.touches[0].clientY; };
    const onEnd = (e) => {
      const dy = touchRef.current.y - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 30) return;
      if (dy > 0) goDown();
      else goUp();
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchend', onEnd); };
  });

  const prev2 = sections[(selected - 2 + total) % total];
  const prev  = sections[(selected - 1 + total) % total];
  const current = sections[selected];
  const next  = sections[(selected + 1) % total];
  const next2 = sections[(selected + 2) % total];

  // ── Desktop / web layout ──
  if (web) {
    const webCards = [
      { ...sections[0], color: '#2FAE9B', icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )},
      { ...sections[1], color: '#E2941F', icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
      )},
      { ...sections[2], color: '#A37BF2', icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
        </svg>
      )},
      { ...sections[3], color: '#3B82F6', icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17h14V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v11z" />
          <path d="M5 17l-1.5 3M19 17l1.5 3M8 20h8" />
          <path d="M6 9h12" />
        </svg>
      )},
    ];
    const subs = { save: 'Grow your money', plan: 'Organise your day', shop: 'Browse & buy', commute: 'Get around' };

    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: hubBg,
      }}>
        {/* Top nav */}
        <div style={{
          padding: '24px 48px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: hubText,
          }}>Everyday</div>
          <button onClick={onSettings} aria-label="Settings" style={{
            background: 'rgba(250,246,241,0.08)', border: '1px solid rgba(250,246,241,0.10)',
            borderRadius: 10, cursor: 'pointer', padding: '8px 16px',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: hubTextMid,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hubTextMid} strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            Settings
          </button>
        </div>

        {/* Greeting */}
        <div style={{ padding: '40px 48px 0' }}>
          <div style={{
            fontSize: 36, fontWeight: 300, letterSpacing: '-0.03em',
            color: hubText, lineHeight: 1.15,
          }}>
            Hello, Joseph.
          </div>
          <div style={{
            fontSize: 16, color: hubTextMid, marginTop: 8, fontWeight: 400,
          }}>
            What would you like to do today?
          </div>
        </div>

        {/* Cards row */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          padding: '0 48px', gap: 16,
        }}>
          {webCards.map((c) => (
            <button
              key={c.id}
              onClick={c.action}
              className="pk-calm-action"
              style={{
                flex: 1, height: 200,
                background: 'rgba(250,246,241,0.06)',
                border: '1px solid rgba(250,246,241,0.10)',
                borderRadius: 20,
                padding: '28px 24px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left',
                transition: 'border-color 200ms ease, background 200ms ease, transform 180ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = c.color;
                e.currentTarget.style.background = c.color + '12';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(250,246,241,0.10)';
                e.currentTarget.style.background = 'rgba(250,246,241,0.06)';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: c.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {React.cloneElement(c.icon, { stroke: c.color })}
              </div>
              <div>
                <div style={{
                  fontSize: 18, fontWeight: 650, color: hubText,
                  letterSpacing: '-0.01em',
                }}>{c.label}</div>
                <div style={{
                  fontSize: 13, color: hubTextMid, marginTop: 4,
                }}>{subs[c.id]}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 48px 24px', textAlign: 'center' }}>
          <span style={{
            fontSize: 12, color: 'rgba(250,246,241,0.20)', fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Everyday Joe</span>
        </div>
      </div>
    );
  }

  // ── Mobile layout (scroll-wheel picker) ──
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: hubBg, userSelect: 'none', overflow: 'hidden',
    }}>
      {/* "Everyday" top label */}
      <div style={{ padding: '8px 0 0', textAlign: 'center' }}>
        <span style={{
          fontSize: 14, fontWeight: 400, color: hubTextMid,
          letterSpacing: '0.01em',
        }}>
          Everyday
        </span>
      </div>

      {/* Scroll-wheel area */}
      <div ref={wheelRef} style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'ns-resize', touchAction: 'none',
      }}>
        {/* Single up arrow */}
        <button onClick={goUp} aria-label="Previous" style={{
          background: 'transparent', border: 0, cursor: 'pointer',
          padding: '10px 24px',
        }}>
          <svg width="24" height="14" viewBox="0 0 24 14" fill="none"
            stroke={hubTextDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11L12 3L20 11" />
          </svg>
        </button>

        {/* Two-above (very faint) */}
        <div style={{
          fontSize: 16, fontWeight: 300, color: 'rgba(250,246,241,0.10)',
          height: 24, lineHeight: '24px', cursor: 'pointer',
        }} onClick={goUp}>
          {prev2.label}
        </div>

        {/* Previous (dimmed) */}
        <div style={{
          fontSize: 24, fontWeight: 300, color: hubTextDim,
          height: 36, lineHeight: '36px', cursor: 'pointer',
          transition: 'all 180ms ease',
        }} onClick={goUp}>
          {prev.label}
        </div>

        {/* ── Selected ── */}
        <button onClick={goOpen} style={{
          background: 'transparent', border: 0, cursor: 'pointer',
          fontFamily: 'inherit', padding: '14px 0', margin: '4px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{
            fontSize: 58, fontWeight: 700, letterSpacing: '-0.04em',
            color: hubText, lineHeight: 1,
          }}>
            {current.label}
          </div>
        </button>

        {/* Next (dimmed) */}
        <div style={{
          fontSize: 24, fontWeight: 300, color: hubTextDim,
          height: 36, lineHeight: '36px', cursor: 'pointer',
          transition: 'all 180ms ease',
        }} onClick={goDown}>
          {next.label}
        </div>

        {/* Two-below (very faint) */}
        <div style={{
          fontSize: 16, fontWeight: 300, color: 'rgba(250,246,241,0.10)',
          height: 24, lineHeight: '24px', cursor: 'pointer',
        }} onClick={goDown}>
          {next2.label}
        </div>

        {/* Single down arrow */}
        <button onClick={goDown} aria-label="Next" style={{
          background: 'transparent', border: 0, cursor: 'pointer',
          padding: '10px 24px',
        }}>
          <svg width="24" height="14" viewBox="0 0 24 14" fill="none"
            stroke={hubTextDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3L12 11L20 3" />
          </svg>
        </button>
      </div>

      {/* Action button */}
      <div style={{ padding: '0 40px 32px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={goOpen}
          className="pk-calm-action"
          style={{
            width: '100%', maxWidth: 340, height: 50, borderRadius: 14,
            background: 'rgba(250,246,241,0.10)',
            border: '1px solid rgba(250,246,241,0.15)',
            cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
            letterSpacing: '-0.01em',
            color: hubText,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          Open {current.label}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={hubText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────── SAVE HOME ──────────────────────────────
// Savings is the hero behaviour. The screen answers, top to bottom:
// how much have I saved · how much has it grown · how much can I access.

function CapitalScreen({ accent, web, onMoney, onWallet, onProfile, onCredit, onGrowth, onBack }) {
  const p = CC_PORTFOLIO;
  const s = CC_SAVINGS;
  const c = CC_CREDIT;
  const millions = (s.balance / 1000000).toFixed(2);
  const [hidden, setHidden] = React.useState(false);
  const [nextTarget, setNextTarget] = React.useState(600000);
  const saveMonths = [
    { label: 'June', saved: s.savedThisMonth, historyStart: s.historyStartLabel, history: s.history },
    { label: 'May', saved: 300000, historyStart: 'May 2024', history: s.history.map((v, i) => Math.round(v - 180000 + i * 6000)) },
    { label: 'April', saved: 250000, historyStart: 'Apr 2024', history: s.history.map((v, i) => Math.round(v - 420000 + i * 9000)) },
  ];
  const [saveMonthKey, setSaveMonthKey] = React.useState(saveMonths[0].label);
  const saveMonth = saveMonths.find((m) => m.label === saveMonthKey) || saveMonths[0];
  const mask = (v) => (hidden ? '••••••' : v);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
    }}>
      <ScreenHeader
        left={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onBack && <IconBtn onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M10 3L5 8l5 5" stroke={ink} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
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
              <path d="M10 3L5 8l5 5" stroke={ink} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
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
            borderBottom: i === s.contributions.length - 1 ? 'none' : `1px solid ${ink06}`,
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
    <div style={{ borderBottom: isLast && !expanded ? 'none' : `1px solid ${ink06}` }}>
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

      {/* Footer */}
      <div style={{
        background: paper, borderTop: `1px solid ${ink12}`,
        padding: '14px 16px',
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
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CCButton variant="solid" accent={accent}
                  onClick={onTap}
                  style={{ minWidth: 240, padding: '0 32px' }}>
                  {cta()}
                </CCButton>
              </div>
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
                onClick={blocked || submitting ? () => {} : onTap}
                style={(blocked || submitting) ? { opacity: blocked ? 0.4 : 1, cursor: 'not-allowed' } : {}}>
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

function SettingsScreen({ accent, onBack, onSignOut }) {
  const user = CC_PORTFOLIO.user;
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
        <Avatar initials={user.initials} size={56} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>
            {user.name} Karangwa
          </div>
          <div style={{
            fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
            color: ink55, marginTop: 4, textTransform: 'uppercase',
          }}>joseph.k@example.com</div>
        </div>
      </div>

      {/* Setting groups */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {CC_SETTINGS.map((g) => (
          <div key={g.group}>
            <Eyebrow style={{ marginBottom: 10, padding: '0 4px' }}>{g.group}</Eyebrow>
            <RoundedCard padding={0} radius={20}>
              {g.items.map((it, i) => (
                <div key={it.id}
                  onClick={it.id === 'so' && onSignOut ? onSignOut : undefined}
                  style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: i < g.items.length - 1 ? `1px solid ${ink12}` : 'none',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    fontSize: 15,
                    color: it.destructive ? accent : ink,
                  }}>{it.label}</div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    {it.meta && (
                      <span style={{
                        fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: ink55,
                      }}>{it.meta}</span>
                    )}
                    {!it.destructive && (
                      <svg width="8" height="14" viewBox="0 0 8 14" style={{ color: ink40 }}>
                        <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4"
                              fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </RoundedCard>
          </div>
        ))}
      </div>

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

      <div style={{ padding: '0 20px' }}>
        <RoundedCard padding={0} radius={20}>
          {items.map((it, i) => (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              borderBottom: i < items.length - 1 ? `1px solid ${ink12}` : 'none',
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
