import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Navigation from './components/Navigation';
import LoginView from './views/LoginView';
import TutorialBriefingCard from './components/TutorialBriefingCard';
import Dashboard from './views/Dashboard';
import PropertiesHUD from './views/PropertiesHUD';
import MarketTerminal from './components/MarketTerminal';
import CrewView from './views/CrewView';
import { 
  Map, 
  Warehouse, 
  ShoppingCart, 
  Users, 
  Flame, 
  HandMetal,
  DollarSign
} from 'lucide-react';

function AppContent() {
  // States for Cop Bribe Panel
  const [showBribeModal, setShowBribeModal] = useState(false);
  const [bribeAmount, setBribeAmount] = useState(800); // Defaults to $800 bribe (-10 heat)

  const {
    isLoggedIn,
    setIsLoggedIn,
    heat,
    money,
    bribeCops,
    addLog,
    isTutorialActive,
    tutorialStep,
    username,
    activeTab,
    setActiveTab
  } = useGame();

  // Reset tab to dashboard on profile switch to ensure new accounts start tutorial correctly
  useEffect(() => {
    setActiveTab('dashboard');
  }, [username]);

  const handleBribeSubmit = (e) => {
    e.preventDefault();
    if (money < bribeAmount) {
      addLog(`Bribe Refused: You don't have enough grease ($${bribeAmount}) for the cops.`);
      return;
    }
    
    const success = bribeCops(parseInt(bribeAmount));
    if (success) {
      setShowBribeModal(false);
    }
  };

  // Login Gate Lock
  if (!isLoggedIn) {
    return <LoginView onLoginComplete={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TutorialBriefingCard key={username} activeTab={activeTab} />
      
      {/* Dynamic Navigation resource deck */}
      <Navigation />

      {/* Main Navigation Sub-Menu Tab Bar */}
      <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto 20px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Tabs deck */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            
            {/* Dashboard Tab */}
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`btn-faction ${activeTab === 'dashboard' ? 'active' : ''} ${isTutorialActive && tutorialStep === 'contract_deck' && activeTab !== 'dashboard' ? 'tutorial-highlight-focus' : ''}`}
              disabled={isTutorialActive && !(tutorialStep === 'contract_deck' && activeTab !== 'dashboard')}
              data-faction="police"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              <Map size={14} />
              <span>CITY OPERATIONS BOARD</span>
            </button>

            {/* Established Fronts Tab */}
            <button
              id="tab-properties"
              onClick={() => setActiveTab('properties')}
              className={`btn-faction ${activeTab === 'properties' ? 'active' : ''} ${isTutorialActive && tutorialStep === 'established_fronts' && activeTab !== 'properties' ? 'tutorial-highlight-focus' : ''}`}
              disabled={isTutorialActive && !(tutorialStep === 'established_fronts' && activeTab !== 'properties')}
              data-faction="firm"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              <Warehouse size={14} />
              <span>ESTABLISHED FRONTS</span>
            </button>

            {/* Smuggling Tab */}
            <button
              id="tab-smuggling"
              onClick={() => setActiveTab('smuggling')}
              className={`btn-faction ${activeTab === 'smuggling' ? 'active' : ''} ${isTutorialActive && tutorialStep === 'smuggling_arbitrage' && activeTab !== 'smuggling' ? 'tutorial-highlight-focus' : ''}`}
              disabled={isTutorialActive && !(tutorialStep === 'smuggling_arbitrage' && activeTab !== 'smuggling')}
              data-faction="riderz"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              <ShoppingCart size={14} />
              <span>SMUGGLING MARKET</span>
            </button>

            {/* Crew Tab */}
            <button
              onClick={() => setActiveTab('crew')}
              className={`btn-faction ${activeTab === 'crew' ? 'active' : ''}`}
              disabled={isTutorialActive}
              data-faction="people"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              <Users size={14} />
              <span>SYNDICATE CREW</span>
            </button>

          </div>

          {/* Quick Action Bribe Trigger Panel */}
          <div>
            <button
              id="action-bribe-cop"
              onClick={() => setShowBribeModal(!showBribeModal)}
              className={`btn-secondary ${isTutorialActive && tutorialStep === 'heat_mitigation' ? 'tutorial-highlight-focus' : ''}`}
              disabled={isTutorialActive && tutorialStep !== 'heat_mitigation'}
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                border: '1px solid rgba(0, 243, 255, 0.2)',
                background: showBribeModal ? 'var(--accent-blue-glow)' : 'rgba(0,0,0,0.1)'
              }}
            >
              <HandMetal size={12} className="text-glow-blue" style={{ color: 'var(--accent-blue)' }} />
              <span>BRIBE PRECINCT COP CONTACS</span>
            </button>
          </div>

        </div>

        {/* BRIBE SLIDE-OUT PANEL */}
        {showBribeModal && (
          <div className="glass-panel pulse-blue" style={{ marginTop: '10px', padding: '16px', background: 'rgba(16,22,30,0.95)', border: '1px solid var(--accent-blue)' }}>
            <form onSubmit={handleBribeSubmit} className="flex-row-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={12} className="text-glow-red" style={{ color: 'var(--accent-red)' }} />
                  <span>Dismantle Precinct attention index</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Current Heat: <strong>{heat}%</strong>. Paying off cops reduces local wanted rates.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                
                {/* Selector */}
                <select
                  value={bribeAmount}
                  onChange={(e) => setBribeAmount(e.target.value)}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-glass)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value={400}>Bribe Patrol Officer ($400 Cash = -5 Heat)</option>
                  <option value={800}>Grease Desk Sergeant ($800 Cash = -10 Heat)</option>
                  <option value={2000}>Pay Off Precinct Captain ($2,000 Cash = -25 Heat)</option>
                  <option value={4000}>Secure Commissioner Liaison ($4,000 Cash = -50 Heat)</option>
                </select>

                {/* Submit bribe */}
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-neon-blue)'
                  }}
                >
                  <span>TRANSFER BRIBE</span>
                </button>

              </div>
            </form>
          </div>
        )}

      </div>

      {/* Main View Router panels container */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'properties' && <PropertiesHUD />}
        {activeTab === 'smuggling' && (
          <div style={{ maxWidth: '750px', margin: '0 auto', padding: '0 20px' }}>
            <MarketTerminal />
          </div>
        )}
        {activeTab === 'crew' && <CrewView />}
      </main>

    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
