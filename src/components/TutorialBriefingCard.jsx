import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useTutorialOverlay } from '../hooks/useTutorialOverlay';
import { Terminal, Shield, SkipForward, Check } from 'lucide-react';

export default function TutorialBriefingCard({ activeTab }) {
  const {
    isTutorialActive,
    tutorialStep,
    setTutorialStep,
    skipTutorial,
    completeTutorial,
    addLog
  } = useGame();

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 1. Narrative Catalog Mapping
  const getStepConfig = () => {
    switch (tutorialStep) {
      case 'welcome_boot':
        return {
          title: 'A.I.D.A. SYSTEM BOOT',
          narrative: "Salutations, Boss. I am A.I.D.A., your Automated In-game Defense Advisor. Let us review your syndicate's standing. At the top of your interface, you can track your absolute resources: Liquid Money, District Heat, available Actions (Turns), and active Safehouse Shields. When you perform criminal acts, your shields will fracture, exposing your fronts to rival raids.",
          selector: '#hud-navigation',
          placement: 'bottom',
          hasNext: true
        };
      case 'map_navigation':
        return {
          title: 'COORDINATE JUMP SECURED',
          narrative: "To build our empire, we must expand. Let us travel to the Docks. Other districts are temporarily restricted to focus our jump coordinates. Move our syndicate presence to the Docks by clicking the Docks centroid on the city map. It costs 1 Turn.",
          selector: '#map-node-docks',
          placement: 'right',
          hasNext: false
        };
      case 'smuggling_arbitrage':
        if (activeTab !== 'smuggling') {
          return {
            title: 'SMUGGLING LANE DETECTION',
            narrative: "Our scouts report a supply surplus at the Docks. Access the SMUGGLING MARKET tab above so we can acquire cargo below market value.",
            selector: '#tab-smuggling',
            placement: 'bottom',
            hasNext: false
          };
        } else {
          return {
            title: 'PRECURSOR ARBITRAGE',
            narrative: "Excellent. Buy exactly 2 units of Chemical Precursors. In Metro City, local buying and selling in the same district always results in a loss due to local market fees. Real smugglers buy cheap in producer districts and move to consumer districts to flip them for massive margins!",
            selector: '#cargo-buy-precursor',
            placement: 'bottom',
            hasNext: false
          };
        }
      case 'contract_deck':
        if (activeTab !== 'dashboard') {
          return {
            title: 'TACTICAL RECONNAISSANCE',
            narrative: "Let us return to the Operations Board to secure a high-paying heist contract.",
            selector: '#tab-dashboard',
            placement: 'bottom',
            hasNext: false
          };
        } else {
          return {
            title: 'DOCKS HEIST INFILTRATION',
            narrative: "Our intelligence has secured a high-payoff Docks heist. Run this job! Because you are under my guidance, our defense protocols have locked down the operational parameters to guarantee a deterministic 100% success rate.",
            selector: '#hud-first-job-card',
            placement: 'left',
            hasNext: false
          };
        }
      case 'established_fronts':
        if (activeTab !== 'properties') {
          return {
            title: 'FRONTS DATABASE SYNC',
            narrative: "We have active businesses generating passive, clean cash. Open the ESTABLISHED FRONTS view to monitor our assets.",
            selector: '#tab-properties',
            placement: 'bottom',
            hasNext: false
          };
        } else {
          return {
            title: 'SAFEHOUSE REVENUE WITHDRAWAL',
            narrative: "Splendid. Look at our Starter Safehouse HQ. Under my automation protocols, I have pre-claimed and laundered $1,500 into its vault. Claim this cash now to add it to your liquid balance!",
            selector: '#prop-hq-claim-btn',
            placement: 'top',
            hasNext: false
          };
        }
      case 'heat_mitigation':
        return {
          title: 'LAW ENFORCEMENT GREASE',
          narrative: "Running contracts and operating illegal drug labs generates Heat. When Heat is high, cops launch SWAT raids, and jobs become extremely risky. Let us grease the wheels of the law. Click 'BRIBE PRECINCT COP CONTACTS' and pay at least $400 to drop our Heat index.",
          selector: '#action-bribe-cop',
          placement: 'left',
          hasNext: false
        };
      case 'master_freedom':
        return {
          title: 'MAINFRAME CALIBRATION COMPLETE',
          narrative: "Superb work, Boss! Our operations are secure, our cash flow is optimized, and local authorities are placated. You are now ready to operate independently in Metro City's sandbox underworld. Build properties, hire specialists, and defend your empire from simulated offline rival cartels.",
          selector: null,
          placement: null,
          hasNext: false,
          isFinal: true
        };
      default:
        return null;
    }
  };

  const config = getStepConfig();

  // 2. Compute dynamic coords using custom hook
  const targetSelector = config?.selector || null;
  const preferredPlacement = config?.placement || 'bottom';
  const coords = useTutorialOverlay(targetSelector, preferredPlacement, isTutorialActive && !!targetSelector);

  // 3. Typewriter Effect
  useEffect(() => {
    if (!config?.narrative) return;
    
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const speed = 10; // Typing speed in ms
    const text = config.narrative;
    
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [tutorialStep, activeTab, isTutorialActive]);

  if (!isTutorialActive || !config) return null;

  // Render centered card if no selector target is active (e.g. step 7)
  const isCentered = !config.selector;

  const cardStyle = isCentered
    ? {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed'
      }
    : {
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        position: 'fixed'
      };

  const stepIndexMap = {
    welcome_boot: 0,
    map_navigation: 1,
    smuggling_arbitrage: 2,
    contract_deck: 3,
    established_fronts: 4,
    heat_mitigation: 5,
    master_freedom: 6
  };
  const activeDotIndex = stepIndexMap[tutorialStep] ?? 0;

  const handleNextStep = () => {
    if (tutorialStep === 'welcome_boot') {
      setTutorialStep('map_navigation');
    }
  };

  return (
    <>
      {/* Background click interception scrim */}
      <div className="tutorial-overlay-scrim" />

      {/* Screen scan lines sweep overlay during final calibration step */}
      {tutorialStep === 'master_freedom' && (
        <div className="fullscreen-scanning-sweep" />
      )}

      {/* Narrative Dialog Card */}
      <div
        className={`tutorial-briefing-card ${isCentered ? '' : coords.arrowClass}`}
        style={cardStyle}
      >
        {/* Terminal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} style={{ color: 'var(--accent-blue)' }} className="text-glow-blue" />
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-blue)', letterSpacing: '0.1em' }}>
              {config.title}
            </span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            A.I.D.A. v2.10
          </div>
        </div>

        {/* Narrative Text */}
        <div className="typewriter-text" style={{ minHeight: '80px' }}>
          {displayedText}
          {isTyping && <span style={{ color: 'var(--accent-blue)', fontWeight: 800, animation: 'fadeIn 0.5s infinite' }}>█</span>}
        </div>

        {/* Footer controls & progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          
          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: idx === activeDotIndex ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                  boxShadow: idx === activeDotIndex ? 'var(--shadow-neon-blue)' : 'none',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Buttons Deck */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {config.hasNext && (
              <button
                onClick={handleNextStep}
                disabled={isTyping}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>NEXT SYSTEM</span>
                <SkipForward size={10} />
              </button>
            )}

            {config.isFinal && (
              <button
                onClick={completeTutorial}
                className="btn-primary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.7rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'linear-gradient(135deg, var(--accent-green) 0%, #00aa22 100%)',
                  boxShadow: 'var(--shadow-neon-green)'
                }}
              >
                <Check size={10} />
                <span>INITIALIZE OPERATIONS</span>
              </button>
            )}

            <button
              onClick={skipTutorial}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                borderRadius: '6px'
              }}
              className="btn-secondary"
            >
              SKIP
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
