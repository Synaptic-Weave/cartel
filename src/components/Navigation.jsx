import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  DollarSign, 
  Flame, 
  Shield, 
  Clock, 
  User, 
  Sparkles, 
  Check, 
  Lock,
  HelpCircle
} from 'lucide-react';

export default function Navigation() {
  const {
    isPremium, setIsPremium,
    username,
    characterAvatar,
    money,
    heat,
    turns,
    secondsUntilNextTurn,
    shieldTurnsLeft,
    activeDistrict,
    districtJuice,
    isTutorialActive,
    tutorialStep,
    resetToDefaultState,
    setActiveTab,
    setActiveDistrict,
    setIsLoggedIn
  } = useGame();

  const [showResetModal, setShowResetModal] = useState(false);

  const currentJuice = districtJuice[activeDistrict] || 0;

  // Render heat color depending on severity
  const getHeatColorClass = () => {
    if (heat > 75) return 'text-glow-red';
    if (heat > 40) return 'text-glow-gold';
    return 'text-glow-green';
  };

  return (
    <header id="hud-navigation" className={`glass-panel ${isTutorialActive && tutorialStep === 'welcome_boot' ? 'tutorial-highlight-focus' : ''}`} style={{ borderRadius: '0 0 16px 16px', borderTop: 'none', padding: '16px 24px', marginBottom: '24px' }}>
      <div className="flex-row-center" style={{ gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Title Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--accent-pink) 0%, var(--accent-gold) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 10px rgba(255, 0, 127, 0.25)' }}>
            CARTEL
          </span>
          <span style={{ fontSize: '0.75rem', padding: '2px 8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--text-secondary)' }}>
            ALPHA PERSISTENT
          </span>
        </div>

        {/* Player Profile & Premium Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            <span style={{ fontSize: '1.1rem' }}>{characterAvatar}</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{username}</span>
          </div>

          {/* Switch Profile Button */}
          <button
            onClick={() => setIsLoggedIn(false)}
            className="btn-secondary"
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.02)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            SWITCH PROFILE
          </button>

          {/* F2P vs Premium Toggle Pill */}
          <button 
            role="switch"
            aria-checked={isPremium}
            disabled={isTutorialActive}
            onClick={() => setIsPremium(!isPremium)}
            className={`premium-toggle-pill pulse-${isPremium ? 'gold' : 'blue'}`}
          >
            {isPremium ? (
              <>
                <Sparkles size={13} className="text-glow-gold" />
                <span>SYNDICATE BOSS (PREMIUM)</span>
                <Check size={12} style={{ marginLeft: '4px' }} />
              </>
            ) : (
              <>
                <User size={13} />
                <span>STREET THUG (FREE TIER)</span>
                <Lock size={12} style={{ marginLeft: '4px', opacity: 0.7 }} />
              </>
            )}
          </button>

          {/* A.I.D.A. Onboarding Kiosk Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="btn-aida-trigger"
            title="A.I.D.A. Onboarding Kiosk"
          >
            <HelpCircle size={13} />
            <span>A.I.D.A. ONBOARDING</span>
          </button>
        </div>

        {/* Resources Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Money Bankroll */}
          <div className="flex-row-center" style={{ gap: '8px' }}>
            <div style={{ background: 'rgba(57, 255, 20, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} className="text-glow-green" />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>BANK BALANCE</div>
              <div className="text-glow-green" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                ${money.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Active Heat Level */}
          <div className="flex-row-center" style={{ gap: '8px' }}>
            <div style={{ background: heat > 40 ? 'var(--accent-red-glow)' : 'rgba(255, 215, 0, 0.05)', border: `1px solid ${heat > 40 ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.1)'}`, borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} className={getHeatColorClass()} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HEAT LEVEL</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={getHeatColorClass()} style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {heat}%
                </span>
                <div style={{ width: '45px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${heat}%`, height: '100%', background: heat > 75 ? 'var(--accent-red)' : heat > 40 ? 'var(--accent-gold)' : 'var(--accent-green)', transition: 'var(--transition-smooth)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Active District Juice */}
          <div className="flex-row-center" style={{ gap: '8px' }}>
            <div style={{ background: 'var(--accent-pink-glow)', border: '1px solid var(--accent-pink)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} className="text-glow-pink" />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {activeDistrict.toUpperCase()} JUICE
              </div>
              <div className="text-glow-pink" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {currentJuice} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>/ 100</span>
              </div>
            </div>
          </div>

          {/* Energy Turn Pool */}
          <div className="flex-row-center" style={{ gap: '8px' }}>
            <div style={{ background: 'var(--accent-blue-glow)', border: '1px solid var(--accent-blue)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} className="text-glow-blue" />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>ENERGY TURNS</span>
                <span style={{ color: (!isPremium && turns >= 100) ? 'var(--accent-green)' : 'var(--accent-blue)', opacity: 0.8, fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>
                  {(!isPremium && turns >= 100) ? '(FULL)' : `(+1 in ${Math.floor(secondsUntilNextTurn / 60)}:${(secondsUntilNextTurn % 60).toString().padStart(2, '0')})`}
                </span>
              </div>
              <div className="text-glow-blue" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {turns === Infinity || (isPremium && turns > 9999) ? 'UNCAPPED' : `${turns}`}
                {!isPremium && <span style={{ fontSize: '0.8rem', opacity: 0.6 }}> / 100</span>}
              </div>
            </div>
          </div>

          {/* Safehouse Cooldown Shield */}
          <div className="flex-row-center" style={{ gap: '8px' }}>
            <div style={{ 
              background: shieldTurnsLeft > 0 ? 'var(--accent-blue-glow)' : 'rgba(255,255,255,0.02)', 
              border: `1px solid ${shieldTurnsLeft > 0 ? 'var(--accent-blue)' : 'var(--border-glass)'}`, 
              borderRadius: '10px', 
              width: '36px', 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Shield size={18} className={shieldTurnsLeft > 0 ? 'text-glow-blue' : 'text-muted'} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HQ SHIELD</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: shieldTurnsLeft > 0 ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                {shieldTurnsLeft > 0 ? (
                  <span className="text-glow-blue">Immune ({shieldTurnsLeft}T)</span>
                ) : (
                  <span style={{ opacity: 0.6 }}>Vulnerable</span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Reset Warnings Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '12px' }}>
              <HelpCircle size={18} style={{ color: 'var(--accent-blue)' }} className="text-glow-blue" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent-blue)', letterSpacing: '0.1em', margin: 0 }}>
                A.I.D.A. SYSTEM CALIBRATION REQUIRED
              </h3>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              WARNING: Mainframe reset sequence initiated. Restoring default starting metrics. Proceeding will reset your liquid assets to $12,000, energy turns to 50, heat to 0%, clear your cargo inventory, and set slums respect to 20.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setShowResetModal(false)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: '8px' }}
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  console.log("WARNING: Mainframe reset sequence initiated. Restoring default starting metrics.");
                  resetToDefaultState();
                  setActiveTab('dashboard');
                  setActiveDistrict('slums');
                  setShowResetModal(false);
                }}
                className="btn-reset-confirm"
                style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: '8px' }}
              >
                CONFIRM CALIBRATION
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
