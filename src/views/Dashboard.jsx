import React from 'react';
import { useGame } from '../context/GameContext';
import Map from '../components/Map';
import JobCard, { REGIONAL_JOB_DECK } from '../components/JobCard';
import { 
  Flame, 
  Tv, 
  Users, 
  ShieldAlert, 
  Swords, 
  Award,
  TrendingUp,
  Skull
} from 'lucide-react';

export default function Dashboard() {
  const {
    activeDistrict,
    factions,
    rivals,
    logs,
    raidRivalProperty,
    turns,
    addLog,
    heat,
    isTutorialActive,
    tutorialStep
  } = useGame();

  const districtJobs = REGIONAL_JOB_DECK[activeDistrict] || [];

  const handleRaidRival = (rivalId, rivalName) => {
    if (turns < 5) {
      addLog(`Raid Denied: Select smaller crimes or wait to accumulate more turns.`);
      return;
    }
    raidRivalProperty(rivalId);
  };

  return (
    <div className="hud-layout">
      
      {/* LEFT SIDEBAR: Faction Standings & Rivals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', minHeight: 0 }}>
        
        {/* Faction Standings Panel */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} className="text-glow-gold" style={{ color: 'var(--accent-gold)' }} />
            <span>UNDERWORLD STANDING</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(factions).map(key => {
              const fac = factions[key];
              return (
                <div key={key}>
                  <div className="flex-row-center" style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    <span style={{ color: fac.color }}>{fac.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{fac.rank}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${fac.standing}%`, height: '100%', background: fac.color, transition: 'var(--transition-smooth)' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: fac.color }}>
                      {fac.standing}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rivals / active PvP targets */}
        <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} className="text-glow-pink" style={{ color: 'var(--accent-pink)' }} />
            <span>RIVAL SYNDICATES</span>
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
            {rivals.map(rival => (
              <div 
                key={rival.id} 
                className="glass-panel" 
                style={{ 
                  padding: '12px', 
                  background: 'rgba(255,255,255,0.01)', 
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div className="flex-row-center">
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Skull size={12} style={{ color: 'var(--accent-pink)' }} />
                      <span>{rival.name}</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Intel: Active in {rival.activeDistrict.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RIVAL POWER</div>
                    <div className="text-glow-pink" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-pink)' }}>
                      Rating {rival.power}
                    </div>
                  </div>
                </div>

                {/* Raid PVP Trigger */}
                <button
                  disabled={isTutorialActive || turns < 5}
                  onClick={() => handleRaidRival(rival.id, rival.name)}
                  className="btn-primary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    borderRadius: '6px',
                    width: '100%',
                    background: 'linear-gradient(135deg, var(--accent-pink) 0%, #aa0044 100%)',
                    boxShadow: 'var(--shadow-neon-pink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    opacity: (isTutorialActive || turns < 5) ? 0.35 : 1,
                    cursor: (isTutorialActive || turns < 5) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Swords size={12} />
                  <span>HEIST ENEMY BASE (-5 Turns)</span>
                </button>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CENTER REGION: Interactive Board Game Map & News ticker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', minHeight: 0 }}>
        
        {/* Core SVG Board Map */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <Map />
        </div>

        {/* Global persistent news logs ticker */}
        <div className="glass-panel" style={{ height: '110px', padding: '12px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="flex-row-center" style={{ marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }} className="text-glow-blue">
              <Tv size={12} />
              <span>LIVE FED SCANNER FEED</span>
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-red)', animation: 'pulse-blue 1s infinite' }} />
          </div>
          
          {/* Scrollable logs */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
            {logs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  fontSize: '0.7rem', 
                  color: index === 0 ? '#fff' : 'var(--text-secondary)', 
                  fontWeight: index === 0 ? 600 : 400,
                  lineHeight: 1.3,
                  borderLeft: `2px solid ${index === 0 ? 'var(--accent-blue)' : 'transparent'}`,
                  paddingLeft: '6px'
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR: Selected District Job Deck Card drawn */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', minHeight: 0 }}>
        
        <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} className="text-glow-gold" style={{ color: 'var(--accent-gold)' }} />
              <span>DISTRICT CONTRACT DECK</span>
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Jobs in {activeDistrict.toUpperCase()} district
            </div>
          </div>

          {/* High Heat Warning HUD Alert */}
          {heat > 60 && (
            <div style={{ background: 'var(--accent-red-glow)', border: '1px solid var(--accent-red)', padding: '10px 14px', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'center' }} className="pulse-pink">
              <ShieldAlert size={20} className="text-glow-red" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.65rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                CRITICAL HEAT POLICE PATROL INDEX! Job success degraded. SWAT raids possible.
              </div>
            </div>
          )}

          {/* Deck cards map renderer */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
            {districtJobs.length > 0 ? (
              districtJobs.map((job, idx) => {
                const isFirstJobFocus = isTutorialActive && tutorialStep === 'contract_deck' && idx === 0;
                return (
                  <div 
                    key={job.id}
                    id={idx === 0 ? "hud-first-job-card" : undefined}
                    className={isFirstJobFocus ? "tutorial-highlight-focus" : undefined}
                  >
                    <JobCard job={{ ...job, color: factions[job.faction]?.color }} />
                  </div>
                );
              })
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px' }}>
                No active job contracts in this district deck. Move to another location.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
