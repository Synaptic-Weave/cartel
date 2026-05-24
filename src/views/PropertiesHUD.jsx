import React, { useState } from 'react';
import { useGame, PROPERTY_TYPES } from '../context/GameContext';
import { 
  Warehouse, 
  Shield, 
  Coins, 
  ShieldCheck, 
  Flame, 
  DollarSign, 
  Cctv, 
  Lock, 
  Plus,
  Users
} from 'lucide-react';

export default function PropertiesHUD() {
  const {
    properties,
    money,
    activeDistrict,
    purchaseProperty,
    claimPropertyCash,
    upgradePropertyDefense,
    assignCrewToGuard,
    affiliates,
    addLog,
    isTutorialActive,
    tutorialStep
  } = useGame();

  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const handleBuyProperty = (typeKey) => {
    purchaseProperty(typeKey, activeDistrict);
  };

  // Filter muscle crew who are active and not already assigned elsewhere
  const availableDefenders = affiliates.filter(a => a.state === 'active');

  return (
    <div style={{ padding: '0 20px 20px 20px', maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
      
      {/* LEFT COLUMN: Active Properties List & Defense Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Warehouse size={20} className="text-glow-green" style={{ color: 'var(--accent-green)' }} />
            <span>SYNDICATE ESTABLISHED FRONTS</span>
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Your legal and chemical holdings in Metro City. Keep them defended to protect your capital.
          </p>

          {/* Properties mapping */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {properties.map(prop => {
              const config = PROPERTY_TYPES[prop.type];
              const isSelected = selectedPropertyId === prop.id;
              
              // Find currently assigned guard affiliate
              const currentGuard = affiliates.find(a => a.id === prop.activeGuardAffiliateId);

              return (
                <div 
                  key={prop.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px', 
                    background: isSelected ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)', 
                    border: `1px solid ${isSelected ? 'var(--accent-green)' : 'var(--border-glass)'}`,
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div className="flex-row-center" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    
                    {/* Property info name */}
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{prop.name}</span>
                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {prop.districtId.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>Defense Power: <strong style={{ color: 'var(--accent-gold)' }}>Rating {prop.defenseRating}</strong></span>
                        <span>•</span>
                        <span>Passive: <strong style={{ color: 'var(--accent-green)' }}>+${config.passiveIncome}/Turn</strong></span>
                      </div>
                    </div>

                    {/* Accumulated money claim box */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACCUMULATED INCOME</div>
                        <div className="text-glow-green" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                          ${prop.accumulatedCash.toLocaleString()}
                        </div>
                      </div>

                      {config.passiveIncome > 0 && (
                        <button
                          id={prop.id === 'prop_hq' ? 'prop-hq-claim-btn' : undefined}
                          disabled={(isTutorialActive && prop.id !== 'prop_hq') || prop.accumulatedCash === 0}
                          onClick={() => claimPropertyCash(prop.id)}
                          className={`btn-primary btn-withdraw ${isTutorialActive && tutorialStep === 'established_fronts' && prop.id === 'prop_hq' ? 'tutorial-highlight-focus' : ''}`}
                        >
                          <Coins size={12} style={{ marginRight: '4px' }} />
                          <span>WITHDRAW</span>
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Toggle defense panel */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <button
                      disabled={isTutorialActive}
                      onClick={() => setSelectedPropertyId(isSelected ? null : prop.id)}
                      className="btn-secondary manage-defenses-btn"
                    >
                      {isSelected ? 'COLLAPSE SECURITY HUD' : 'MANAGE DEFENSES & GUARD'}
                    </button>

                    {currentGuard && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }} className="text-glow-blue">
                        <ShieldCheck size={12} /> Guarded by: {currentGuard.name}
                      </div>
                    )}
                  </div>

                  {/* ADVANCED DEFENSE PANEL EXPANSION */}
                  {isSelected && (
                    <div style={{ borderTop: '1px dotted rgba(255,255,255,0.08)', marginTop: '12px', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      
                      {/* Sub-Panel: Hardware Upgrades */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Cctv size={12} /> HARDWARE UPGRADES
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          
                          {/* Doors */}
                          <button
                            disabled={prop.upgrades.reinforcedDoors}
                            onClick={() => upgradePropertyDefense(prop.id, 'reinforcedDoors')}
                            className="btn-secondary"
                            style={{ padding: '8px', fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', opacity: prop.upgrades.reinforcedDoors ? 0.5 : 1 }}
                          >
                            <span>Armored Steel Vault Doors (+15 Def)</span>
                            <span style={{ color: prop.upgrades.reinforcedDoors ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                              {prop.upgrades.reinforcedDoors ? 'INSTALLED' : '$1,500'}
                            </span>
                          </button>

                          {/* CCTV */}
                          <button
                            disabled={prop.upgrades.cctv}
                            onClick={() => upgradePropertyDefense(prop.id, 'cctv')}
                            className="btn-secondary"
                            style={{ padding: '8px', fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', opacity: prop.upgrades.cctv ? 0.5 : 1 }}
                          >
                            <span>HD IP Night CCTV System (+10 Def)</span>
                            <span style={{ color: prop.upgrades.cctv ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                              {prop.upgrades.cctv ? 'INSTALLED' : '$1,500'}
                            </span>
                          </button>

                          {/* Passive guard hires */}
                          <button
                            onClick={() => upgradePropertyDefense(prop.id, 'guards')}
                            className="btn-secondary"
                            style={{ padding: '8px', fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between' }}
                          >
                            <span>Hire Patrol Guards x{prop.upgrades.guards} (+8 Def)</span>
                            <span style={{ color: 'var(--accent-gold)' }}>$2,500</span>
                          </button>

                        </div>
                      </div>

                      {/* Sub-Panel: Assign muscle affiliate as physical Guard */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} /> ASSIGN GANG BODYGUARD
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <select
                            value={prop.activeGuardAffiliateId || ''}
                            onChange={(e) => assignCrewToGuard(prop.id, e.target.value || null)}
                            style={{
                              width: '100%',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-glass)',
                              padding: '8px',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              outline: 'none'
                            }}
                          >
                            <option value="">-- No Defender Dispatched --</option>
                            {availableDefenders.map(crew => (
                              <option key={crew.id} value={crew.id}>
                                {crew.name} ({crew.specialty}) {crew.assignedPropertyId === prop.id ? '(Active Guard)' : crew.assignedPropertyId ? '(Guard Elsewhere)' : '(Available)'}
                              </option>
                            ))}
                          </select>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: '4px' }}>
                            Dispatching a physical muscle affiliate adds a flat <strong style={{ color: 'var(--accent-blue)' }}>+25 Defense Rating</strong>. If raided, the guard defends your node first.
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}

            {properties.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                You hold no properties. Secure funding and establish operations using the district panel.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Acquire New fronts in current district */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} className="text-glow-gold" style={{ color: 'var(--accent-gold)' }} />
            <span>ESTABLISH DISTRICT FRONT</span>
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Available operations to build in <strong style={{ color: 'var(--accent-pink)' }}>{activeDistrict.toUpperCase()}</strong>:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.keys(PROPERTY_TYPES).map(key => {
              const details = PROPERTY_TYPES[key];
              const isAffordable = money >= details.cost;

              return (
                <div 
                  key={key} 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: `1px solid ${isAffordable ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'}`
                  }}
                >
                  <div className="flex-row-center">
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                      {details.name}
                    </span>
                    <span className="text-glow-gold" style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                      ${details.cost.toLocaleString()}
                    </span>
                  </div>

                  {/* Property benefits */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', marginBottom: '16px' }}>
                    
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Coins size={10} style={{ color: 'var(--accent-green)' }} />
                      <span>Inc: +${details.passiveIncome}/T</span>
                    </div>

                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={10} style={{ color: 'var(--accent-gold)' }} />
                      <span>Base Def: {details.baseDefense}</span>
                    </div>

                    {details.heatGeneration !== 0 && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flame size={10} style={{ color: details.heatGeneration > 0 ? 'var(--accent-red)' : 'var(--accent-blue)' }} />
                        <span>Heat: {details.heatGeneration > 0 ? `+${details.heatGeneration}` : `${details.heatGeneration}`}/T</span>
                      </div>
                    )}

                  </div>

                  {/* Purchase Button */}
                  <button
                    disabled={isTutorialActive || !isAffordable}
                    onClick={() => handleBuyProperty(key)}
                    className="btn-primary btn-establish-front"
                  >
                    ESTABLISH FRONT
                  </button>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
