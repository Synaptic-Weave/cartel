import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { calculateJobSuccessChance } from '../utils/gameMath';
import { 
  Clock, 
  DollarSign, 
  Flame, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  UserCheck, 
  Dice5,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

// Seed Deck of Jobs based on District ID
export const REGIONAL_JOB_DECK = {
  slums: [
    { id: 'sl_1', title: 'Pickpocket Transit Terminal', description: 'Snatch passenger wallets at the subway hub. Low risk, quick cash flow.', turnsCost: 1, baseSuccess: 90, requiredSpecialty: null, rewards: { money: 800, heat: 3, juice: 5, standing: 5 }, faction: 'people' },
    { id: 'sl_2', title: 'Raid Corner Drug Den', description: 'Kick in doors on a rival block. Seize chemical product and local street credibility.', turnsCost: 2, baseSuccess: 70, requiredSpecialty: 'Muscle', rewards: { money: 2800, heat: 12, juice: 12, standing: 10 }, faction: 'riderz' },
    { id: 'sl_3', title: 'Pay Off Slum Patrol', description: 'Supply local street beats with kickbacks in exchange for police scanner warnings.', turnsCost: 1, baseSuccess: 85, requiredSpecialty: 'Inside Man', rewards: { money: -800, heat: -15, juice: 8, standing: 12 }, faction: 'police' }
  ],
  docks: [
    { id: 'dk_1', title: 'Intercept Smuggled Armaments', description: 'Infiltrate Shipping Container 14B. High value weapons crate heist.', turnsCost: 3, baseSuccess: 60, requiredSpecialty: 'Muscle', rewards: { money: 7500, heat: 18, juice: 16, standing: 15 }, faction: 'riderz' },
    { id: 'dk_2', title: 'Forge Custom Manifests', description: 'Log into Port Authority terminal. Alter cargo logs to slip ships through undetected.', turnsCost: 2, baseSuccess: 75, requiredSpecialty: 'Hacker', rewards: { money: 4500, heat: 8, juice: 12, standing: 12 }, faction: 'firm' }
  ],
  redlight: [
    { id: 'rl_1', title: 'Extort Nightclub Protection', description: 'Shake down the Velvet Room manager. Secure recurring weekly turf cuts.', turnsCost: 3, baseSuccess: 65, requiredSpecialty: 'Muscle', rewards: { money: 6000, heat: 14, juice: 15, standing: 12 }, faction: 'people' },
    { id: 'rl_2', title: 'Launder Casino Ledgers', description: 'Hack underground slot machine servers. Inject legitimate accounting logs.', turnsCost: 2, baseSuccess: 80, requiredSpecialty: 'Hacker', rewards: { money: 5200, heat: 6, juice: 10, standing: 10 }, faction: 'firm' }
  ],
  industrial: [
    { id: 'ind_1', title: 'Hijack Chemical Precursor Tanker', description: 'Inbound truck hijack in the heavy logistics park. Valuable chemicals.', turnsCost: 4, baseSuccess: 55, requiredSpecialty: 'Muscle', rewards: { money: 9500, heat: 22, juice: 18, standing: 16 }, faction: 'riderz' },
    { id: 'ind_2', title: 'Infiltrate Toxic Disposal Lab', description: 'Expose corrupt environmental dumps. Leverage files to blackmail inspectors.', turnsCost: 3, baseSuccess: 80, requiredSpecialty: 'Inside Man', rewards: { money: 5800, heat: 4, juice: 14, standing: 15 }, faction: 'police' }
  ],
  downtown: [
    { id: 'dt_1', title: 'Hack Financial Syndicate Vault', description: 'Exfiltrate high-net bullion logs from Apex Central. Elite cyber security block.', turnsCost: 5, baseSuccess: 45, requiredSpecialty: 'Hacker', rewards: { money: 18000, heat: 28, juice: 22, standing: 25 }, faction: 'firm' },
    { id: 'dt_2', title: 'SWAT Raid Decoy Alarm', description: 'Wire a massive fake explosion warning. Divert local precincts to raid rival bases.', turnsCost: 3, baseSuccess: 65, requiredSpecialty: 'Inside Man', rewards: { money: 10000, heat: 10, juice: 20, standing: 30 }, faction: 'police' }
  ],
  marina: [
    { id: 'mr_1', title: 'Superyacht Vault Offshore Heist', description: 'Crack luxury oceanic safe. Escape via high speed watercraft.', turnsCost: 5, baseSuccess: 40, requiredSpecialty: 'Wheelman', rewards: { money: 26000, heat: 35, juice: 25, standing: 30 }, faction: 'firm' },
    { id: 'mr_2', title: 'Blackmail Yacht Commodore', description: 'Snap illicit photos of elite politicians. Force offshore cash handovers.', turnsCost: 4, baseSuccess: 55, requiredSpecialty: 'Hacker', rewards: { money: 15500, heat: 15, juice: 20, standing: 40 }, faction: 'police' }
  ]
};

export default function JobCard({ job }) {
  const { 
    heat, 
    affiliates, 
    runJob,
    turns,
    addLog,
    money
  } = useGame();

  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState(null); // 'success' | 'failure' | null
  const [showResultOverlay, setShowResultOverlay] = useState(false);

  // Filter available crew members who are active and not guarding a base
  const availableCrew = affiliates.filter(a => a.state === 'active' && a.assignedPropertyId === null);
  
  // Calculate success rates
  const successCalculation = calculateJobSuccessChance(
    job.baseSuccess, 
    heat, 
    availableCrew, 
    job.requiredSpecialty
  );

  const hasMatchingSpecialist = job.requiredSpecialty && availableCrew.some(c => c.specialty === job.requiredSpecialty);

  const handleExecuteJob = () => {
    if (turns < job.turnsCost) {
      addLog(`Turns Exhausted: Select standard actions or wait for energy recharge.`);
      return;
    }

    if (job.rewards.money < 0 && money < Math.abs(job.rewards.money)) {
      addLog(`Bribe Aborted: You need $${Math.abs(job.rewards.money)} cash to payoff this contract.`);
      return;
    }

    setIsRolling(true);
    setRollResult(null);

    // Simulate dice-rolling tension for 1.2 seconds!
    setTimeout(() => {
      const outcome = runJob(job);
      setIsRolling(false);
      setRollResult(outcome ? 'success' : 'failure');
      setShowResultOverlay(true);

      // Auto clear overlay in 2.5 seconds
      setTimeout(() => {
        setShowResultOverlay(false);
      }, 2500);
    }, 1200);
  };

  const getDangerLevel = () => {
    if (job.baseSuccess < 50) return { label: 'CRITICAL DANGER', color: 'var(--accent-red)' };
    if (job.baseSuccess < 70) return { label: 'HIGH RISK', color: 'var(--accent-gold)' };
    return { label: 'LOW RISK', color: 'var(--accent-green)' };
  };

  const danger = getDangerLevel();

  return (
    <div className="glass-panel" style={{ position: 'relative', display: 'flex', flexDirection: 'column', padding: '20px', borderRadius: '14px', borderLeft: `4px solid ${job.color || 'var(--border-glass)'}`, overflow: 'hidden', height: '100%', minHeight: '340px' }}>
      
      {/* Visual Rolling Animation Overlay */}
      {isRolling && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(6,7,10,0.92)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <Dice5 size={48} className="text-glow-gold" style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>
            ROLLING SECURITY CHECKS...
          </div>
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {/* SUCCESS / FAILURE SLIDE OVERLAY */}
      {showResultOverlay && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: rollResult === 'success' ? 'rgba(57, 255, 20, 0.12)' : 'rgba(255, 0, 0, 0.12)', border: `2px solid ${rollResult === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`, borderRadius: '14px', zIndex: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', backdropFilter: 'blur(10px)', transition: 'var(--transition-fast)' }}>
          {rollResult === 'success' ? (
            <>
              <div style={{ background: 'var(--accent-green-glow)', padding: '16px', borderRadius: '50%', border: '1px solid var(--accent-green)' }}>
                <ThumbsUp size={36} className="text-glow-green" />
              </div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent-green)', textShadow: '0 0 10px rgba(57,255,20,0.4)', letterSpacing: '0.05em' }}>
                JOB SUCCESSFUL
              </div>
              <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                {job.rewards.money >= 0 
                  ? `+$${job.rewards.money.toLocaleString()} Cash Transferred` 
                  : `-$${Math.abs(job.rewards.money).toLocaleString()} Bribe Paid`}
              </div>
            </>
          ) : (
            <>
              <div style={{ background: 'var(--accent-red-glow)', padding: '16px', borderRadius: '50%', border: '1px solid var(--accent-red)' }}>
                <ThumbsDown size={36} className="text-glow-red" />
              </div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent-red)', textShadow: '0 0 10px rgba(255,0,0,0.4)', letterSpacing: '0.05em' }}>
                BUSTED / FAILED
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Escape lines triggered. Police Heat spiked.
              </div>
            </>
          )}
        </div>
      )}

      {/* Card Header */}
      <div className="flex-row-center" style={{ gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          {job.faction ? job.faction.toUpperCase() : 'INDEPENDENT'}
        </span>
        <span style={{ fontSize: '0.65rem', color: danger.color, fontWeight: 900, letterSpacing: '0.05em' }}>
          {danger.label}
        </span>
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.2 }}>
        {job.title}
      </h3>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '16px', flex: 1 }}>
        {job.description}
      </p>

      {/* Specialty matching warning */}
      {job.requiredSpecialty && (
        <div style={{ padding: '8px 12px', borderRadius: '8px', background: hasMatchingSpecialist ? 'var(--accent-green-glow)' : 'rgba(255,255,255,0.01)', border: `1px solid ${hasMatchingSpecialist ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Required: <span style={{ color: '#fff', fontWeight: 700 }}>{job.requiredSpecialty}</span>
          </span>
          {hasMatchingSpecialist ? (
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={12} /> +20% MATCH ACTIVE
            </span>
          ) : (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              No Active Specialist
            </span>
          )}
        </div>
      )}

      {/* Success calculations HUD */}
      <div className="glass-panel" style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', marginBottom: '16px' }}>
        <div className="flex-row-center">
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Success Odds:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: successCalculation.chance > 70 ? 'var(--accent-green)' : successCalculation.chance > 45 ? 'var(--accent-gold)' : 'var(--accent-red)' }} className={successCalculation.chance > 70 ? 'text-glow-green' : successCalculation.chance > 45 ? 'text-glow-gold' : 'text-glow-red'}>
            {successCalculation.chance}%
          </span>
        </div>
        
        {/* Modifiers dropdown simulated details */}
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <span>Base: {job.baseSuccess}%</span>
          {successCalculation.modifierDetails.map((mod, idx) => (
            <span key={idx} style={{ color: mod.value > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {mod.name}: {mod.value > 0 ? '+' : ''}{mod.value}%
            </span>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {/* Money payout */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
            <DollarSign size={8} /> {job.rewards.money >= 0 ? 'CASH REWARD' : 'CASH BRIBE COST'}
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: job.rewards.money >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }} className={job.rewards.money >= 0 ? 'text-glow-green' : 'text-glow-red'}>
            {job.rewards.money >= 0 ? '+' : ''}${job.rewards.money.toLocaleString()}
          </div>
        </div>

        {/* Heat payout */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Flame size={8} /> {job.rewards.heat >= 0 ? 'HEAT ACCUMULATION' : 'HEAT DISSIPATION'}
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: job.rewards.heat >= 0 ? 'var(--accent-red)' : 'var(--accent-green)' }} className={job.rewards.heat >= 0 ? 'text-glow-red' : 'text-glow-green'}>
            {job.rewards.heat >= 0 ? '+' : ''}{job.rewards.heat}
          </div>
        </div>

        {/* Juice payout */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Sparkles size={8} /> RESPECT JUICE
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-pink)' }} className="text-glow-pink">
            +{job.rewards.juice} J
          </div>
        </div>

        {/* Turns cost */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Clock size={8} /> ENERGY TURNS COST
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-blue)' }} className="text-glow-blue">
            -{job.turnsCost} Turns
          </div>
        </div>
      </div>

      {/* Execute Button */}
      <button 
        onClick={handleExecuteJob}
        className="btn-primary"
        style={{ width: '100%', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
      >
        <Dice5 size={14} />
        <span>EXECUTE CRIME</span>
      </button>

    </div>
  );
}
