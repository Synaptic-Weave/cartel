import React from 'react';
import { useGame } from '../context/GameContext';
import { 
  Users, 
  ShieldAlert, 
  Heart, 
  Activity, 
  UserCheck, 
  Trash2, 
  Briefcase, 
  Scale, 
  DollarSign 
} from 'lucide-react';

export default function CrewView() {
  const {
    affiliates,
    recruitableTemplates,
    recruitAffiliate,
    releaseAffiliate,
    cureAffiliate,
    money,
    addLog
  } = useGame();

  const handleHireCrew = (template) => {
    recruitAffiliate(template);
  };

  const handleFireCrew = (id) => {
    releaseAffiliate(id);
  };

  const handleBailOut = (id) => {
    // $3,000 to bribe warden / pay bail
    cureAffiliate(id, 3000);
  };

  const handlePayMedical = (id) => {
    // $2,000 for private black-market surgery clinic
    cureAffiliate(id, 2000);
  };

  const getSpecialtyColor = (spec) => {
    if (spec === 'Muscle') return 'var(--accent-pink)';
    if (spec === 'Hacker') return 'var(--accent-gold)';
    if (spec === 'Inside Man') return 'var(--accent-blue)';
    return 'var(--accent-green)';
  };

  return (
    <div style={{ padding: '0 20px 20px 20px', maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      
      {/* LEFT COLUMN: Your Active Crew List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} className="text-glow-blue" style={{ color: 'var(--accent-blue)' }} />
            <span>SYNDICATE CREW LIST</span>
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Hired specialists on your active payroll. Assigned muscle protects property, while field operatives boost crime success.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {affiliates.map(crew => {
              const specColor = getSpecialtyColor(crew.specialty);
              
              return (
                <div 
                  key={crew.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.01)',
                    borderLeft: `3px solid ${specColor}`
                  }}
                >
                  <div className="flex-row-center" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    
                    {/* Specialty & Name */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{crew.name}</span>
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', background: specColor + '15', border: `1px solid ${specColor}`, color: specColor, borderRadius: '4px', fontWeight: 700 }}>
                          {crew.specialty.toUpperCase()}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                        <span>Upkeep: <strong style={{ color: 'var(--accent-gold)' }}>${crew.upkeep}/Turn</strong></span>
                        <span>•</span>
                        <span>Assignment: <strong>{crew.assignedPropertyId ? 'Property Defense Guard' : 'Field Operations (Active)'}</strong></span>
                      </div>
                    </div>

                    {/* Status badges & actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      
                      {/* Status */}
                      {crew.state === 'active' && (
                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'var(--accent-green-glow)', color: 'var(--accent-green)', border: '1px solid var(--accent-green)', borderRadius: '6px', fontWeight: 800 }} className="text-glow-green">
                          ACTIVE
                        </span>
                      )}

                      {crew.state === 'jailed' && (
                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'var(--accent-red-glow)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)', borderRadius: '6px', fontWeight: 800 }} className="text-glow-red pulse-pink">
                          JAILED (COUNTY)
                        </span>
                      )}

                      {crew.state === 'hospitalized' && (
                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'var(--accent-red-glow)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)', borderRadius: '6px', fontWeight: 800 }} className="text-glow-red pulse-pink">
                          HOSPITALIZED
                        </span>
                      )}

                      {/* Actions */}
                      {crew.state === 'active' && (
                        <button
                          onClick={() => handleFireCrew(crew.id)}
                          className="btn-secondary"
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Terminate employment"
                        >
                          <Trash2 size={12} style={{ color: 'var(--accent-red)' }} />
                        </button>
                      )}

                      {crew.state === 'jailed' && (
                        <button
                          onClick={() => handleBailOut(crew.id)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '6px', background: 'linear-gradient(135deg, var(--accent-gold) 0%, #aa7700 100%)', boxShadow: 'var(--shadow-neon-gold)' }}
                        >
                          <Scale size={11} style={{ marginRight: '4px' }} />
                          Bail Out ($3,000)
                        </button>
                      )}

                      {crew.state === 'hospitalized' && (
                        <button
                          onClick={() => handlePayMedical(crew.id)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '6px', background: 'linear-gradient(135deg, var(--accent-blue) 0%, #0077ff 100%)', boxShadow: 'var(--shadow-neon-blue)' }}
                        >
                          <Heart size={11} style={{ marginRight: '4px' }} />
                          Medical Bills ($2,000)
                        </button>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}

            {affiliates.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Your crew roster is completely empty. Recruit talent from the underground board.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Recruiting Board */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={20} className="text-glow-gold" style={{ color: 'var(--accent-gold)' }} />
            <span>UNDERGROUND RECRUITING AGENCY</span>
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Sign contracts with elite criminal specialists:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recruitableTemplates.map(tpl => {
              const specColor = getSpecialtyColor(tpl.specialty);
              const isAffordable = money >= tpl.cost;

              return (
                <div 
                  key={tpl.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.01)',
                    borderLeft: `3px solid ${specColor}`
                  }}
                >
                  <div className="flex-row-center">
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                      {tpl.name}
                    </span>
                    <span className="text-glow-gold" style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                      ${tpl.cost.toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.6rem', padding: '1px 6px', background: specColor + '15', border: `1px solid ${specColor}`, color: specColor, borderRadius: '4px', fontWeight: 700 }}>
                      {tpl.specialty.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      Upkeep: <strong style={{ color: '#fff' }}>${tpl.upkeep}/Turn</strong>
                    </span>
                  </div>

                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3, margin: '10px 0 14px 0' }}>
                    {tpl.description}
                  </p>

                  <button
                    disabled={!isAffordable}
                    onClick={() => handleHireCrew(tpl)}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      borderRadius: '8px',
                      background: isAffordable ? 'linear-gradient(135deg, var(--accent-blue) 0%, #0077ff 100%)' : 'rgba(255,255,255,0.03)',
                      boxShadow: isAffordable ? 'var(--shadow-neon-blue)' : 'none',
                      opacity: isAffordable ? 1 : 0.4,
                      cursor: isAffordable ? 'pointer' : 'not-allowed'
                    }}
                  >
                    SIGN CONTRACT
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
