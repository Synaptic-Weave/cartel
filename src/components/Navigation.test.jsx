// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Define Firebase mocks BEFORE importing GameContext
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => {
  const store = {};
  const listeners = {};

  const getDocVal = (path) => {
    if (!store[path]) {
      const parts = path.split('/');
      if (parts[0] === 'players') {
        const uname = parts[1];
        const localKey = `focused_hertz_${uname}_game_state`;
        if (typeof window !== 'undefined' && window.localStorage) {
          const saved = window.localStorage.getItem(localKey);
          if (saved) {
            try {
              store[path] = JSON.parse(saved);
            } catch (e) {}
          }
        }
      }
    }
    return store[path] || null;
  };

  const setDocVal = (path, data) => {
    store[path] = data;
    if (listeners[path]) {
      listeners[path].forEach(cb => cb({
        exists: () => true,
        data: () => data
      }));
    }
  };

  return {
    getFirestore: vi.fn(() => ({})),
    doc: vi.fn((db, coll, path) => ({ path: `${coll}/${path}` })),
    serverTimestamp: vi.fn(() => new Date().toISOString()),
    Timestamp: {
      now: vi.fn(() => ({ toMillis: () => Date.now() })),
      fromDate: vi.fn((d) => ({ toMillis: () => d.getTime() }))
    },
    setDoc: vi.fn(async (docRef, data) => {
      setDocVal(docRef.path, data);
    }),
    getDoc: vi.fn(async (docRef) => {
      const data = getDocVal(docRef.path);
      return {
        exists: () => !!data,
        data: () => data
      };
    }),
    onSnapshot: vi.fn((docRef, callback) => {
      const path = docRef.path;
      if (!listeners[path]) listeners[path] = [];
      listeners[path].push(callback);

      const data = getDocVal(path);
      callback({
        exists: () => !!data,
        data: () => data
      });

      return () => {
        listeners[path] = listeners[path].filter(cb => cb !== callback);
      };
    }),
    runTransaction: vi.fn(async (db, callback) => {
      const transaction = {
        get: async (docRef) => {
          const data = getDocVal(docRef.path);
          return {
            exists: () => !!data,
            data: () => data
          };
        },
        set: (docRef, data) => {
          setDocVal(docRef.path, data);
        },
        update: (docRef, data) => {
          const existing = getDocVal(docRef.path) || {};
          const updated = { ...existing, ...data };
          setDocVal(docRef.path, updated);
        }
      };
      return await callback(transaction);
    })
  };
});

vi.mock('../config/firebase', () => ({
  db: {},
  auth: {}
}));

import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { GameProvider, useGame } from '../context/GameContext';
import Navigation from './Navigation';


// Robust in-memory localStorage mock for testing environment isolation
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    clear: vi.fn(() => { store = {}; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    get length() { return Object.keys(store).length; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Navigation HUD Component Integration', () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the A.I.D.A. Onboarding button and show resources', () => {
    render(
      <GameProvider>
        <Navigation />
      </GameProvider>
    );

    // Verify Title Logo
    expect(screen.getByText('CARTEL')).toBeTruthy();
    expect(screen.getByText('ALPHA PERSISTENT')).toBeTruthy();

    // Verify "A.I.D.A. ONBOARDING" button exists
    const aidaButton = screen.getByTitle('A.I.D.A. Onboarding Kiosk');
    expect(aidaButton).toBeTruthy();
    expect(aidaButton.className).toContain('btn-aida-trigger');
    expect(screen.getByText('A.I.D.A. ONBOARDING')).toBeTruthy();

    // Verify starter money is rendered
    expect(screen.getByText('BANK BALANCE')).toBeTruthy();
    expect(screen.getByText('$12,000')).toBeTruthy();
  });

  it('should toggle premium status when clicking the profile pill', () => {
    // Setup completed tutorial state so premium toggle is not disabled
    const key = 'focused_hertz_StreetThug_77_game_state';
    const savedState = {
      username: 'StreetThug_77',
      isPremium: false,
      characterAvatar: '👤',
      money: 12000,
      heat: 0,
      turns: 50,
      turnCount: 0,
      secondsUntilNextTurn: 360,
      activeDistrict: 'slums',
      shieldTurnsLeft: 0,
      hasCompletedTutorial: true,
      isTutorialActive: false,
      tutorialStep: 'welcome_boot',
      districtJuice: { slums: 20, docks: 0, redlight: 0, industrial: 0, downtown: 0, marina: 0 },
      cargo: { precursors: 0, stims: 0, weapons: 0, counterfeit: 0 },
      affiliates: [],
      properties: [],
      factions: {},
      rivals: [],
      logs: []
    };
    window.localStorage.setItem(key, JSON.stringify(savedState));

    render(
      <GameProvider>
        <Navigation />
      </GameProvider>
    );

    const toggleButton = screen.getByRole('switch');
    expect(screen.getByText('STREET THUG (FREE TIER)')).toBeTruthy();

    // Click to toggle
    fireEvent.click(toggleButton);
    expect(screen.getByText('SYNDICATE BOSS (PREMIUM)')).toBeTruthy();

    // Click again to untoggle
    fireEvent.click(toggleButton);
    expect(screen.getByText('STREET THUG (FREE TIER)')).toBeTruthy();
  });

  it('should open the system calibration modal on click and allow cancellation', () => {
    render(
      <GameProvider>
        <Navigation />
      </GameProvider>
    );

    // Click onboarding button
    const aidaButton = screen.getByTitle('A.I.D.A. Onboarding Kiosk');
    fireEvent.click(aidaButton);

    // Modal should be visible
    expect(screen.getByText('A.I.D.A. SYSTEM CALIBRATION REQUIRED')).toBeTruthy();
    expect(screen.getByText(/WARNING: Mainframe reset sequence initiated/)).toBeTruthy();

    // Click CANCEL button
    const cancelBtn = screen.getByText('CANCEL');
    fireEvent.click(cancelBtn);

    // Modal should disappear
    expect(screen.queryByText('A.I.D.A. SYSTEM CALIBRATION REQUIRED')).toBeNull();
  });

  it('should reset resources and redirect to dashboard/slums when reset sequence is confirmed', () => {
    // Helper to extract active state
    let contextValues = null;
    function StateSpy() {
      contextValues = useGame();
      return null;
    }

    render(
      <GameProvider>
        <Navigation />
        <StateSpy />
      </GameProvider>
    );

    // Mutate state to dirty values first
    act(() => {
      contextValues.setMoney(45000);
      contextValues.setTurns(12);
      contextValues.setHeat(70);
      contextValues.setActiveDistrict('industrial');
      contextValues.setActiveTab('crew');
    });

    expect(contextValues.money).toBe(45000);
    expect(contextValues.turns).toBe(12);
    expect(contextValues.heat).toBe(70);
    expect(contextValues.activeDistrict).toBe('industrial');
    expect(contextValues.activeTab).toBe('crew');

    // Click onboarding button
    const aidaButton = screen.getByTitle('A.I.D.A. Onboarding Kiosk');
    fireEvent.click(aidaButton);

    // Confirm calibration
    const confirmBtn = screen.getByText('CONFIRM CALIBRATION');
    
    // Capture console log
    const consoleSpy = vi.spyOn(console, 'log');

    act(() => {
      fireEvent.click(confirmBtn);
    });

    // Verification: console warning logged
    expect(consoleSpy).toHaveBeenCalledWith("WARNING: Mainframe reset sequence initiated. Restoring default starting metrics.");

    // Verification: state values reset to default safety net values
    expect(contextValues.money).toBe(12000);
    expect(contextValues.turns).toBe(50);
    expect(contextValues.heat).toBe(0);
    expect(contextValues.activeDistrict).toBe('slums');
    expect(contextValues.activeTab).toBe('dashboard');
    expect(contextValues.isTutorialActive).toBe(true);
    expect(contextValues.tutorialStep).toBe('welcome_boot');

    // Modal should be closed
    expect(screen.queryByText('A.I.D.A. SYSTEM CALIBRATION REQUIRED')).toBeNull();
  });

  it('should trigger switch profile and allow closing modal by clicking overlay', () => {
    let contextValues = null;
    function StateSpy() {
      contextValues = useGame();
      return null;
    }

    render(
      <GameProvider>
        <Navigation />
        <StateSpy />
      </GameProvider>
    );

    // Set isLoggedIn to true
    act(() => {
      contextValues.setIsLoggedIn(true);
    });

    // Verify initial isLoggedIn
    expect(contextValues.isLoggedIn).toBe(true);

    // Click "SWITCH PROFILE" button
    const switchProfileBtn = screen.getByText('SWITCH PROFILE');
    fireEvent.click(switchProfileBtn);

    // Verify setIsLoggedIn was called (sets isLoggedIn to false)
    expect(contextValues.isLoggedIn).toBe(false);

    // Re-verify modal overlay closing
    // Open the modal first
    const aidaButton = screen.getByTitle('A.I.D.A. Onboarding Kiosk');
    fireEvent.click(aidaButton);
    expect(screen.getByText('A.I.D.A. SYSTEM CALIBRATION REQUIRED')).toBeTruthy();

    // Click the modal-overlay scrim to close it
    const modalOverlay = screen.getByText('A.I.D.A. SYSTEM CALIBRATION REQUIRED').closest('.modal-overlay');
    expect(modalOverlay).toBeTruthy();
    fireEvent.click(modalOverlay);

    // Modal should be closed
    expect(screen.queryByText('A.I.D.A. SYSTEM CALIBRATION REQUIRED')).toBeNull();
  });

  it('should cover all heat, premium, and shield branches in Navigation', () => {
    let contextValues = null;
    function StateSpy() {
      contextValues = useGame();
      return null;
    }

    render(
      <GameProvider>
        <Navigation />
        <StateSpy />
      </GameProvider>
    );

    // 1. High Heat Branch (heat > 75)
    act(() => {
      contextValues.setHeat(85);
      contextValues.setTurns(10);
      contextValues.setIsPremium(false);
      contextValues.setShieldTurnsLeft(0);
    });
    expect(screen.getByText('85%')).toBeTruthy();

    // 2. Medium Heat Branch (heat > 40)
    act(() => {
      contextValues.setHeat(55);
    });
    expect(screen.getByText('55%')).toBeTruthy();

    // 3. Premium & Uncapped Turns Branch
    act(() => {
      contextValues.setIsPremium(true);
      contextValues.setTurns(10050);
    });
    expect(screen.getByText('UNCAPPED')).toBeTruthy();

    // 4. Shield Active Branch
    act(() => {
      contextValues.setShieldTurnsLeft(3);
    });
    expect(screen.getByText('Immune (3T)')).toBeTruthy();
  });
});

