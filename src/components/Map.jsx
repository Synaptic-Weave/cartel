import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  MapPin, 
  Warehouse, 
  Lock, 
  Users, 
  Zap,
  Compass,
  Waves
} from 'lucide-react';

// Districts configurations with accurate geometric Centroids and Polygon coordinates
export const DISTRICT_CONFIGS = [
  { 
    id: 'industrial', 
    name: 'Industrial Park', 
    security: 'Low-Sec', 
    requiredJuice: 40, 
    color: 'var(--accent-gold)', 
    glowColor: 'var(--accent-gold-glow)',
    theme: 'gold',
    x: '22.0%', y: '27.4%', // Centroid (220, 192)
    points: '0,0 320,0 480,240 300,340 0,380',
    description: 'Heavy chemical plants & refineries. Low precursor prices, high security risks.'
  },
  { 
    id: 'slums', 
    name: 'The Slums', 
    security: 'Null-Sec', 
    requiredJuice: 0, 
    color: 'var(--accent-pink)', 
    glowColor: 'var(--accent-pink-glow)',
    theme: 'pink',
    x: '19.2%', y: '75.4%', // Centroid (192, 528)
    points: '0,380 300,340 420,520 240,700 0,700',
    description: 'Lawless territory. Zero cop patrols. Perfect for illicit drug chemistry and turf wars.'
  },
  { 
    id: 'redlight', 
    name: 'Red Light District', 
    security: 'Low-Sec', 
    requiredJuice: 30, 
    color: 'var(--accent-gold)', 
    glowColor: 'var(--accent-gold-glow)',
    theme: 'gold',
    x: '45.5%', y: '54.2%', // Centroid (455, 380)
    points: '300,340 480,240 620,420 420,520',
    description: 'Neon-lit entertainment avenue. Major market for stim sales and cleaning counterfeit cash.'
  },
  { 
    id: 'docks', 
    name: 'The Docks', 
    security: 'Low-Sec', 
    requiredJuice: 15, 
    color: 'var(--accent-gold)', 
    glowColor: 'var(--accent-gold-glow)',
    theme: 'gold',
    x: '45.0%', y: '83.5%', // Centroid (450, 585)
    points: '240,700 420,520 620,420 520,700',
    description: 'Bustling industrial harbor. Ideal for shipping containers and importing contraband weapons.'
  },
  { 
    id: 'downtown', 
    name: 'Downtown District', 
    security: 'High-Sec', 
    requiredJuice: 60, 
    color: 'var(--accent-blue)', 
    glowColor: 'var(--accent-blue-glow)',
    theme: 'blue',
    x: '68.4%', y: '27.4%', // Centroid (684, 192)
    points: '320,0 1000,0 1000,300 620,420 480,240',
    description: 'Corporate glass towers and high police presence. High stim pricing, SWAT arrests.'
  },
  { 
    id: 'marina', 
    name: 'The Marina Port', 
    security: 'High-Sec', 
    requiredJuice: 80, 
    color: 'var(--accent-blue)', 
    glowColor: 'var(--accent-blue-glow)',
    theme: 'blue',
    x: '80.4%', y: '74.8%', // Centroid (804, 524)
    points: '620,420 1000,300 1000,500 880,700 520,700',
    description: 'Ultra-exclusive luxury yachts. Maximum price for laundering counterfeit banknotes.'
  }
];

export const MAP_CONNECTIONS = [
  { from: 'slums', to: 'docks', x1: 192, y1: 528, x2: 450, y2: 585, color: 'var(--accent-pink)', dashed: true },
  { from: 'slums', to: 'redlight', x1: 192, y1: 528, x2: 455, y2: 380, color: 'var(--accent-pink)', dashed: true },
  { from: 'slums', to: 'industrial', x1: 192, y1: 528, x2: 220, y2: 192, color: 'var(--accent-gold)', dashed: false },
  { from: 'redlight', to: 'docks', x1: 455, y1: 380, x2: 450, y2: 585, color: 'var(--accent-gold)', dashed: false },
  { from: 'redlight', to: 'industrial', x1: 455, y1: 380, x2: 220, y2: 192, color: 'var(--accent-gold)', dashed: false },
  { from: 'redlight', to: 'downtown', x1: 455, y1: 380, x2: 684, y2: 192, color: 'var(--accent-blue)', dashed: false },
  { from: 'docks', to: 'marina', x1: 450, y1: 585, x2: 804, y2: 524, color: 'var(--accent-blue)', dashed: false },
  { from: 'downtown', to: 'marina', x1: 684, y1: 192, x2: 804, y2: 524, color: 'var(--accent-blue)', dashed: false }
];

export default function Map() {
  const {
    activeDistrict,
    movePlayer,
    districtJuice,
    properties,
    rivals,
    addLog,
    isTutorialActive,
    tutorialStep
  } = useGame();

  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  const handleKeyDown = (e, dist) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDistrictClick(dist);
    }
  };

  const handleDistrictClick = (dist) => {
    if (isTutorialActive && dist.id !== 'docks') {
      addLog('A.I.D.A.: Coordinates locked on the DOCKS district vector.');
      return;
    }

    if (activeDistrict === dist.id) {
      addLog(`System: You are already standing in ${dist.name}.`);
      return;
    }
    
    // Calculate locked status from context respect level
    const totalJuice = Object.values(districtJuice).reduce((sum, val) => sum + val, 0);
    const isLocked = totalJuice < dist.requiredJuice;
    
    if (isLocked) {
      addLog(`System: ${dist.name} remains locked. Reach ${dist.requiredJuice} respect to infiltrate.`);
      return;
    }
    
    // Attempt move
    movePlayer(dist.id, dist.requiredJuice);
  };

  return (
    <div className="glass-panel" style={{ position: 'relative', height: '100%', minHeight: 0, padding: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Map Header */}
      <div className="flex-row-center" style={{ marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} className="text-glow-gold" />
          <span>METRO CITY BOARD</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={12} className="text-glow-blue" />
            <span>Click regions or nodes to travel (1 Turn)</span>
          </span>
        </div>
      </div>

      {/* Actual Map Graphic Canvas Centering Wrapper */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        
        {/* Aspect-Ratio Maintained Map Container */}
        <div style={{ position: 'relative', width: '100%', height: 'auto', maxWidth: '100%', maxHeight: '100%', aspectRatio: '1000 / 700', background: 'radial-gradient(circle, rgba(16,20,30,0.5) 0%, rgba(6,7,10,0.95) 100%)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', overflow: 'hidden' }}>
        
        {/* Absolute Coordinate Indicators (Mainframe Aesthetics) */}
        <div style={{ position: 'absolute', top: '8px', left: '12px', fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--text-muted)', zIndex: 3, pointerEvents: 'none', letterSpacing: '0.05em' }}>
          [SEC-01 // NW-GRID]
        </div>
        <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--text-muted)', zIndex: 3, pointerEvents: 'none', letterSpacing: '0.05em' }}>
          [LAT-34.9N // LON--118.2W]
        </div>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--text-muted)', zIndex: 3, pointerEvents: 'none', letterSpacing: '0.05em' }}>
          [BOARD-REV // HOLOGRAPHIC]
        </div>
        <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--text-muted)', zIndex: 3, pointerEvents: 'none', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Waves size={10} style={{ color: 'var(--accent-blue)' }} />
          <span>COASTAL BAY</span>
        </div>

        {/* Ambient Satellite Scanner Sweep Line */}
        <div className="scanner-line" style={{ position: 'absolute', left: 0, right: 0, height: '100%', zIndex: 2 }} />

        {/* SVG Path Connections & Polygon Territories */}
        <svg 
          viewBox="0 0 1000 700" 
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
        >
          <defs>
            {/* Holographic 40px Grid pattern */}
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 243, 255, 0.03)" strokeWidth="1"/>
            </pattern>
            
            {/* Hatch Pattern for Locked Regions */}
            <pattern id="diagonal-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
            </pattern>

            {/* Ocean Bay Depth Gradient */}
            <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(192, 100%, 12%)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(220, 30%, 4%)" stopOpacity="0.95" />
            </linearGradient>

            {/* Neon Connection Glow filter */}
            <filter id="neon-line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip Paths for District Territory Overlays */}
            {DISTRICT_CONFIGS.map(dist => (
              <clipPath id={`clip-${dist.id}`} key={`clip-${dist.id}`}>
                <polygon points={dist.points} />
              </clipPath>
            ))}
          </defs>
          
          {/* 0a. Base City Map Illustration (Desaturated/Grayscale by default) */}
          <image 
            href="/assets/cartel_city_map.png" 
            x="0" 
            y="0" 
            width="1000" 
            height="700" 
            preserveAspectRatio="xMidYMid slice" 
            style={{ 
              filter: 'grayscale(100%) brightness(0.32) contrast(1.25)', 
              opacity: 0.88,
              transition: 'var(--transition-smooth)'
            }} 
          />

          {/* 0b. Colorized District Overlays (Clipped to each district's polygon) */}
          {DISTRICT_CONFIGS.map(dist => {
            const isActive = activeDistrict === dist.id;
            const isHovered = hoveredDistrict === dist.id;
            return (
              <image 
                key={`color-overlay-${dist.id}`}
                href="/assets/cartel_city_map.png" 
                x="0" 
                y="0" 
                width="1000" 
                height="700" 
                preserveAspectRatio="xMidYMid slice" 
                clipPath={`url(#clip-${dist.id})`}
                style={{ 
                  opacity: isActive ? 0.95 : (isHovered ? 0.8 : 0), 
                  transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  pointerEvents: 'none'
                }} 
              />
            );
          })}

          {/* 1. Base Grid Layer */}
          <rect width="1000" height="700" className="cyber-grid" />

          {/* 2. Coastal Bay Ocean Area (Bottom-Right water region) */}
          <polygon 
            points="520,700 880,700 1000,500 1000,700" 
            fill="url(#ocean-gradient)" 
          />
          {/* Topographic coastline outline */}
          <path 
            d="M 520 700 C 650 690, 800 710, 880 700 C 930 650, 970 560, 1000 500" 
            fill="none" 
            stroke="hsla(192, 100%, 50%, 0.15)" 
            strokeWidth="2" 
            strokeDasharray="4,4" 
          />

          {/* 3. Interactive District Polygons */}
          {DISTRICT_CONFIGS.map(dist => {
            const isActive = activeDistrict === dist.id;
            const isHovered = hoveredDistrict === dist.id;
            const totalJuice = Object.values(districtJuice).reduce((sum, val) => sum + val, 0);
            const isLocked = totalJuice < dist.requiredJuice;
            const stateClass = isActive ? 'is-active' : (isHovered ? 'is-hovered' : 'is-mono');
            
            return (
              <g key={`poly-${dist.id}`}>
                {/* Main Territory Polygon Shape */}
                <polygon 
                  points={dist.points}
                  className={`territory-polygon district-${dist.theme} ${stateClass}`}
                  onClick={() => handleDistrictClick(dist)}
                  onMouseEnter={() => {
                    if (isTutorialActive) {
                      if (dist.id === activeDistrict || (tutorialStep === 'map_navigation' && dist.id === 'docks')) {
                        setHoveredDistrict(dist.id);
                      }
                    } else {
                      setHoveredDistrict(dist.id);
                    }
                  }}
                  onMouseLeave={() => setHoveredDistrict(null)}
                />

                {/* Overlaid hatching if locked */}
                {isLocked && (
                  <polygon 
                    points={dist.points}
                    className="locked-hatch"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </g>
            );
          })}

          {/* 4. Connected Lane Routes (Centroid to Centroid) */}
          <g filter="url(#neon-line-glow)" style={{ opacity: 0.55, pointerEvents: 'none' }}>
            {MAP_CONNECTIONS.map((conn, idx) => {
              const isHighlighted = 
                activeDistrict === conn.from || activeDistrict === conn.to ||
                hoveredDistrict === conn.from || hoveredDistrict === conn.to;
              return (
                <line
                  key={`conn-${idx}`}
                  x1={conn.x1}
                  y1={conn.y1}
                  x2={conn.x2}
                  y2={conn.y2}
                  stroke={isHighlighted ? conn.color : 'rgba(255, 255, 255, 0.08)'}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeDasharray={conn.dashed ? '3,6' : 'none'}
                  style={{
                    transition: 'stroke 0.35s ease, stroke-width 0.35s ease',
                    filter: isHighlighted ? 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.35))' : 'none'
                  }}
                />
              );
            })}
          </g>
        </svg>

        {/* 5. Absolutely Positioned Centroid Overlay Nodes */}
        {DISTRICT_CONFIGS.map(dist => {
          const isActive = activeDistrict === dist.id;
          const isHovered = hoveredDistrict === dist.id;
          const totalJuice = Object.values(districtJuice).reduce((sum, val) => sum + val, 0);
          const currentJuice = districtJuice[dist.id] || 0;
          const isLocked = totalJuice < dist.requiredJuice;
          
          // Properties and rivals count
          const ownedProps = properties.filter(p => p.districtId === dist.id);
          const activeRivals = rivals.filter(r => r.activeDistrict === dist.id);

          const isDocksNodeFocus = isTutorialActive && tutorialStep === 'map_navigation';
          const isTargetNode = isDocksNodeFocus && dist.id === 'docks';
          const isBlocked = isTutorialActive && dist.id !== 'docks';

          return (
            <div 
              key={`node-${dist.id}`}
              id={`map-node-${dist.id}`}
              role="button"
              tabIndex={isBlocked ? -1 : 0}
              onClick={() => handleDistrictClick(dist)}
              onKeyDown={(e) => handleKeyDown(e, dist)}
              onMouseEnter={() => {
                if (isTutorialActive) {
                  if (dist.id === activeDistrict || (tutorialStep === 'map_navigation' && dist.id === 'docks')) {
                    setHoveredDistrict(dist.id);
                  }
                } else {
                  setHoveredDistrict(dist.id);
                }
              }}
              onMouseLeave={() => setHoveredDistrict(null)}
              className={`map-centroid-node ${isTargetNode ? 'is-target-node tutorial-highlight-focus' : ''} ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''} ${isBlocked ? 'is-blocked' : ''}`}
              style={{
                left: dist.x,
                top: dist.y
              }}
            >
              {/* Core Centroid Target Pin */}
              <div 
                className={`map-node-pin theme-${dist.theme} ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''} ${isLocked ? 'is-locked' : ''} ${isActive ? `pulse-${dist.theme}` : ''}`}
              >
                {isActive && <MapPin size={15} style={{ color: '#000' }} />}
                {!isActive && isLocked && <Lock size={10} style={{ color: 'var(--text-muted)' }} />}
              </div>

              {/* Floating Glassmorphic Territory Stats Card */}
              <div 
                className={`map-node-stats-card theme-${dist.theme} ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''} ${isLocked ? 'is-locked' : ''}`}
              >
                {/* District Title */}
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span>{dist.name}</span>
                  {isActive && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-primary)' }} />}
                </div>

                {/* Security Badge */}
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: isLocked ? 'var(--text-muted)' : (isActive || isHovered ? dist.color : 'rgba(255, 255, 255, 0.4)'), marginTop: '1px', letterSpacing: '0.02em' }}>
                  {dist.security}
                </div>

                {/* Respect Level */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                  <span>Respect:</span>
                  <span style={{ fontWeight: 800, color: currentJuice > 0 ? ((isActive || isHovered) ? 'var(--accent-pink)' : 'rgba(255,255,255,0.55)') : 'var(--text-secondary)' }}>
                    {currentJuice}/100
                  </span>
                </div>

                {/* Status Badges Row (Fronts & Rivals) */}
                {(ownedProps.length > 0 || activeRivals.length > 0 || isLocked) && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px', paddingTop: '3px' }}>
                    {isLocked && (
                      <span style={{ fontSize: '0.55rem', color: 'var(--accent-red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Lock size={8} /> Req {dist.requiredJuice}J
                      </span>
                    )}
                    
                    {!isLocked && ownedProps.length > 0 && (
                      <span title={`${ownedProps.length} fronts established here`} style={{ display: 'flex', alignItems: 'center', gap: '1px', fontSize: '0.55rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                        <Warehouse size={9} /> {ownedProps.length}F
                      </span>
                    )}

                    {!isLocked && activeRivals.length > 0 && (
                      <span title={`${activeRivals.map(r => r.name).join(', ')} active here`} style={{ display: 'flex', alignItems: 'center', gap: '1px', fontSize: '0.55rem', color: 'var(--accent-red)', fontWeight: 700 }}>
                        <Users size={9} /> {activeRivals.length}R
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}

        </div>
      </div>
    </div>
  );
}
