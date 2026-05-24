import React from 'react';
import { useGame } from '../context/GameContext';
import { getCommodityPricesForDistrict, COMMODITY_DETAILS } from '../utils/gameMath';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Tag 
} from 'lucide-react';

export default function MarketTerminal() {
  const {
    activeDistrict,
    cargo,
    cargoLimit,
    buyCargo,
    sellCargo,
    turnCount,
    addLog,
    isTutorialActive,
    tutorialStep
  } = useGame();

  const isPrecursorBuyFocus = isTutorialActive && tutorialStep === 'smuggling_arbitrage';

  // Fetch local dynamic prices for the selected district
  const localPrices = getCommodityPricesForDistrict(activeDistrict, turnCount);

  // Calculate current cargo fill-rate
  const currentCargoCount = Object.values(cargo).reduce((a, b) => a + b, 0);

  const getPriceTrendIcon = (commodityKey) => {
    // Standard base price comparing
    const base = COMMODITY_DETAILS[commodityKey].basePrice;
    const localBuy = localPrices[commodityKey]?.buy || base;
    
    if (localBuy > base * 1.1) {
      return <TrendingUp size={14} className="text-glow-red" style={{ color: 'var(--accent-red)' }} />;
    }
    if (localBuy < base * 0.9) {
      return <TrendingDown size={14} className="text-glow-green" style={{ color: 'var(--accent-green)' }} />;
    }
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>●</span>;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={18} className="text-glow-blue" />
          <span>BLACK MARKET TERMINAL</span>
        </h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Local smuggling board for {activeDistrict.toUpperCase()}
        </div>
      </div>

      {/* Cargo Bay Cap Gauge */}
      <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.01)', borderRadius: '10px' }}>
        <div className="flex-row-center" style={{ marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={14} className="text-glow-pink" style={{ color: 'var(--accent-pink)' }} />
            <span>CARGO BAY UTILIZATION</span>
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: currentCargoCount >= cargoLimit ? 'var(--accent-red)' : 'var(--text-primary)' }}>
            {currentCargoCount} / {cargoLimit} units
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${(currentCargoCount / cargoLimit) * 100}%`, 
              height: '100%', 
              background: currentCargoCount >= cargoLimit ? 'var(--accent-red)' : 'linear-gradient(90deg, var(--accent-pink) 0%, var(--accent-blue) 100%)',
              transition: 'var(--transition-smooth)'
            }} 
          />
        </div>
      </div>

      {/* Dynamic Smuggling Board */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {Object.keys(COMMODITY_DETAILS).map(key => {
          const detail = COMMODITY_DETAILS[key];
          const localItemPrice = localPrices[key] || { buy: detail.basePrice, sell: detail.basePrice };
          const ownedQuantity = cargo[key] || 0;

          return (
            <div 
              key={key} 
              className="glass-panel" 
              style={{ 
                padding: '12px 14px', 
                borderRadius: '10px', 
                background: 'rgba(255,255,255,0.02)',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              
              {/* Commodity info */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
                  {detail.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Hold: {ownedQuantity}
                  </span>
                  {getPriceTrendIcon(key)}
                </div>
              </div>

              {/* BUY CHANNEL */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <Tag size={8} /> BUY PRICE
                </div>
                <div className="text-glow-red" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-red)', margin: '2px 0 6px 0' }}>
                  ${localItemPrice.buy}
                </div>
                <button
                  id={key === 'precursors' ? 'cargo-buy-precursor' : undefined}
                  disabled={(isTutorialActive && key !== 'precursors') || currentCargoCount >= cargoLimit}
                  onClick={() => buyCargo(key, 1, localItemPrice.buy)}
                  className={`btn-secondary ${isPrecursorBuyFocus && key === 'precursors' ? 'tutorial-highlight-focus' : ''}`}
                  style={{ 
                    padding: '4px 10px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    borderRadius: '6px',
                    width: '100%',
                    opacity: ((isTutorialActive && key !== 'precursors') || currentCargoCount >= cargoLimit) ? 0.35 : 1,
                    cursor: ((isTutorialActive && key !== 'precursors') || currentCargoCount >= cargoLimit) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Buy +1
                </button>
              </div>

              {/* SELL CHANNEL */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <DollarSign size={8} /> SELL PRICE
                </div>
                <div className="text-glow-green" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-green)', margin: '2px 0 6px 0' }}>
                  ${localItemPrice.sell}
                </div>
                <button
                  disabled={isTutorialActive || ownedQuantity <= 0}
                  onClick={() => sellCargo(key, 1, localItemPrice.sell)}
                  className="btn-primary"
                  style={{ 
                    padding: '4px 10px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    borderRadius: '6px',
                    width: '100%',
                    opacity: (isTutorialActive || ownedQuantity <= 0) ? 0.35 : 1,
                    cursor: (isTutorialActive || ownedQuantity <= 0) ? 'not-allowed' : 'pointer',
                    boxShadow: (!isTutorialActive && ownedQuantity > 0) ? 'var(--shadow-neon-green)' : 'none',
                    background: (!isTutorialActive && ownedQuantity > 0) ? 'linear-gradient(135deg, var(--accent-green) 0%, #00bb11 100%)' : 'rgba(255,255,255,0.05)'
                  }}
                >
                  Sell -1
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
