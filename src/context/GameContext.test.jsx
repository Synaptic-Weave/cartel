// @vitest-environment jsdom
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
            } catch {
              // Ignore JSON parse errors
            }
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

import { render, act } from '@testing-library/react';
import { GameProvider, useGame } from './GameContext';

// Robust in-memory localStorage mock for testing environment isolation
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    clear: vi.fn(() => { store = {}; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    key: vi.fn((index) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});


// Helper component to extract GameContext values for testing
function GameTester({ consumer }) {
  const game = useGame();
  return <div data-testid="test-consumer">{consumer(game)}</div>;
}

describe('GameContext Onboarding Tutorial & Story 3 Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test to guarantee data isolation
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize with tutorial inactive or active, and reset correctly when starting tutorial', () => {
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    // Initial state should have default street thug name and isTutorialActive
    expect(contextValues.username).toBe('StreetThug_77');
    
    // Explicitly start the tutorial
    act(() => {
      contextValues.startTutorial();
    });

    expect(contextValues.isTutorialActive).toBe(true);
    expect(contextValues.tutorialStep).toBe('welcome_boot');
    expect(contextValues.money).toBe(12000);
    expect(contextValues.turns).toBe(50);
    expect(contextValues.heat).toBe(0);
    expect(contextValues.activeDistrict).toBe('slums');
    expect(contextValues.districtJuice.slums).toBe(20);
    expect(contextValues.districtJuice.docks).toBe(0);
  });

  it('should advance from welcome_boot to map_navigation', () => {
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.startTutorial();
    });

    expect(contextValues.tutorialStep).toBe('welcome_boot');

    // Advance the step to map_navigation
    act(() => {
      contextValues.setTutorialStep('map_navigation');
    });

    expect(contextValues.tutorialStep).toBe('map_navigation');
  });

  it('should block navigation to other districts during map_navigation step', () => {
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.startTutorial();
      contextValues.setTutorialStep('map_navigation');
    });

    expect(contextValues.activeDistrict).toBe('slums');
    expect(contextValues.turns).toBe(50);

    // Try moving to redlight (which is restricted during the tutorial step)
    let moveSuccess = false;
    act(() => {
      moveSuccess = contextValues.movePlayer('redlight', 30);
    });

    expect(moveSuccess).toBe(false);
    expect(contextValues.activeDistrict).toBe('slums'); // remains in slums
    expect(contextValues.turns).toBe(50); // no turns deducted
    expect(contextValues.tutorialStep).toBe('map_navigation'); // remains on step
    expect(contextValues.logs[0]).toContain('Travel restricted. Route coordinates are locked to Docks');
  });

  it('should successfully advance to smuggling_arbitrage and deduct 1 turn when travelling to docks', () => {
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.startTutorial();
      contextValues.setTutorialStep('map_navigation');
    });

    expect(contextValues.activeDistrict).toBe('slums');
    expect(contextValues.turns).toBe(50);

    // Travel to Docks
    let moveSuccess = false;
    act(() => {
      moveSuccess = contextValues.movePlayer('docks', 15);
    });

    expect(moveSuccess).toBe(true);
    expect(contextValues.activeDistrict).toBe('docks'); // traveled!
    expect(contextValues.turns).toBe(49); // exactly 1 turn spent
    expect(contextValues.tutorialStep).toBe('smuggling_arbitrage'); // advanced to Step 3!
    expect(contextValues.logs[1]).toContain('Traveled: Entered the DOCKS District.');
    expect(contextValues.logs[0]).toContain('A.I.D.A.: Safe arrival at Docks. Smuggling channels are ready.');
  });

  it('should isolate state correctly when switching between an existing profile (completed tutorial) and a fresh profile', () => {
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    // Profile A (StreetThug_77 is loaded by default)
    act(() => {
      contextValues.completeTutorial();
    });
    expect(contextValues.hasCompletedTutorial).toBe(true);
    expect(contextValues.isTutorialActive).toBe(false);

    // Switch to Profile B (fresh user)
    act(() => {
      contextValues.setUsername('NewFreshUser_12');
    });

    // Profile B state loader triggers. Since Profile B does not have saved state,
    // they should start with tutorial active at Step 1 (welcome_boot).
    expect(contextValues.username).toBe('NewFreshUser_12');
    expect(contextValues.hasCompletedTutorial).toBe(false);
    expect(contextValues.isTutorialActive).toBe(true);
    expect(contextValues.tutorialStep).toBe('welcome_boot');

    // Switch back to Profile A (has completed tutorial)
    act(() => {
      contextValues.setUsername('StreetThug_77');
    });

    expect(contextValues.username).toBe('StreetThug_77');
    expect(contextValues.hasCompletedTutorial).toBe(true);
    expect(contextValues.isTutorialActive).toBe(false);
  });

  it('should auto-trigger onboarding Step 1 for a fresh account with no saved state in localStorage on mount', () => {
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    expect(contextValues.username).toBe('StreetThug_77');
    expect(contextValues.isTutorialActive).toBe(true);
    expect(contextValues.tutorialStep).toBe('welcome_boot');
    expect(contextValues.hasCompletedTutorial).toBe(false);
  });

  it('should bypass onboarding on mount if the profile has completed tutorial (saved in localStorage)', () => {
    const key = 'focused_hertz_StreetThug_77_game_state';
    const savedState = {
      username: 'StreetThug_77',
      isPremium: false,
      characterAvatar: '👤',
      money: 25000,
      heat: 15,
      turns: 80,
      turnCount: 5,
      secondsUntilNextTurn: 120,
      activeDistrict: 'slums',
      shieldTurnsLeft: 0,
      hasCompletedTutorial: true,
      isTutorialActive: false,
      tutorialStep: 'welcome_boot',
      districtJuice: { slums: 25, docks: 0, redlight: 0, industrial: 0, downtown: 0, marina: 0 },
      cargo: { precursors: 0, stims: 0, weapons: 0, counterfeit: 0 },
      affiliates: [],
      properties: [],
      factions: {},
      rivals: [],
      logs: []
    };
    window.localStorage.setItem(key, JSON.stringify(savedState));

    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    expect(contextValues.hasCompletedTutorial).toBe(true);
    expect(contextValues.isTutorialActive).toBe(false);
    expect(contextValues.money).toBe(25000);
    expect(contextValues.heat).toBe(15);
    expect(contextValues.turns).toBe(80);
  });

  it('should reset resources to exactly default starter assets and start Step 1 when resetToDefaultState is invoked', () => {
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.setMoney(5000);
      contextValues.setTurns(10);
      contextValues.setHeat(45);
      contextValues.setDistrictJuice({ slums: 40, docks: 15, redlight: 0, industrial: 0, downtown: 0, marina: 0 });
      contextValues.setHasCompletedTutorial(true);
      contextValues.setIsTutorialActive(false);
    });

    expect(contextValues.money).toBe(5000);
    expect(contextValues.turns).toBe(10);
    expect(contextValues.heat).toBe(45);
    expect(contextValues.hasCompletedTutorial).toBe(true);
    expect(contextValues.isTutorialActive).toBe(false);

    act(() => {
      contextValues.resetToDefaultState();
    });

    expect(contextValues.money).toBe(12000);
    expect(contextValues.turns).toBe(50);
    expect(contextValues.heat).toBe(0);
    expect(contextValues.hasCompletedTutorial).toBe(false);
    expect(contextValues.isTutorialActive).toBe(true);
    expect(contextValues.tutorialStep).toBe('welcome_boot');
    expect(contextValues.activeDistrict).toBe('slums');
    expect(contextValues.districtJuice.slums).toBe(20);
    expect(contextValues.districtJuice.docks).toBe(0);
  });

  it('should serialize states to distinct localStorage keys and prevent any profile cross-contamination', () => {
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.setUsername('Profile_A');
    });
    act(() => {
      contextValues.setMoney(77000);
      contextValues.setTurns(33);
      contextValues.setHeat(55);
      contextValues.completeTutorial();
    });

    act(() => {
      contextValues.setUsername('Profile_B');
    });

    expect(contextValues.username).toBe('Profile_B');
    expect(contextValues.money).toBe(12000);
    expect(contextValues.turns).toBe(50);
    expect(contextValues.heat).toBe(0);
    expect(contextValues.hasCompletedTutorial).toBe(false);
    expect(contextValues.isTutorialActive).toBe(true);

    act(() => {
      contextValues.setMoney(88000);
      contextValues.setTurns(22);
      contextValues.setHeat(10);
      contextValues.skipTutorial();
    });

    act(() => {
      contextValues.setUsername('Profile_A');
    });

    expect(contextValues.username).toBe('Profile_A');
    expect(contextValues.money).toBe(77000);
    expect(contextValues.turns).toBe(33);
    expect(contextValues.heat).toBe(55);
    expect(contextValues.hasCompletedTutorial).toBe(true);
    expect(contextValues.isTutorialActive).toBe(false);

    act(() => {
      contextValues.setUsername('Profile_B');
    });

    expect(contextValues.username).toBe('Profile_B');
    expect(contextValues.money).toBe(88000);
    expect(contextValues.turns).toBe(22);
    expect(contextValues.heat).toBe(10);
    expect(contextValues.hasCompletedTutorial).toBe(true);
    expect(contextValues.isTutorialActive).toBe(false);

    expect(window.localStorage.getItem('focused_hertz_Profile_A_game_state')).not.toBeNull();
    expect(window.localStorage.getItem('focused_hertz_Profile_B_game_state')).not.toBeNull();
    
    const savedA = JSON.parse(window.localStorage.getItem('focused_hertz_Profile_A_game_state'));
    const savedB = JSON.parse(window.localStorage.getItem('focused_hertz_Profile_B_game_state'));
    
    expect(savedA.money).toBe(77000);
    expect(savedB.money).toBe(88000);
  });

  it('should decrement secondsUntilNextTurn second-by-second using fake timers', () => {
    vi.useFakeTimers();
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.startTutorial();
      contextValues.setTurns(50);
      contextValues.setSecondsUntilNextTurn(10);
    });

    expect(contextValues.secondsUntilNextTurn).toBe(10);

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(contextValues.secondsUntilNextTurn).toBe(9);

    vi.useRealTimers();
  });

  it('should regenerate turn, trigger passive yields, and reset secondsUntilNextTurn when timer reaches 0', () => {
    vi.useFakeTimers();
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.setIsPremium(false);
      contextValues.setTurns(90);
      contextValues.setSecondsUntilNextTurn(1);
      // Let's add a chemistry lab property to verify passive yields
      contextValues.setProperties([
        {
          id: 'prop_druglab_test',
          name: 'Chemistry Lab Test',
          districtId: 'slums',
          type: 'DRUGLAB',
          defenseRating: 5,
          upgrades: { guards: 0, reinforcedDoors: false, cctv: false },
          accumulatedCash: 1000,
          activeGuardAffiliateId: null
        }
      ]);
    });

    expect(contextValues.turns).toBe(90);
    expect(contextValues.properties[0].accumulatedCash).toBe(1000);
    expect(contextValues.heat).toBe(0);

    // Advance 1 second to trigger regeneration
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(contextValues.turns).toBe(91); // turn incremented
    expect(contextValues.secondsUntilNextTurn).toBe(360); // reset to 360
    expect(contextValues.properties[0].accumulatedCash).toBe(1650); // income added (1000 + 650)
    expect(contextValues.heat).toBe(1); // lab passive heat generated

    vi.useRealTimers();
  });

  it('should lock secondsUntilNextTurn at 360 and not increment turns if already at free tier cap of 100 turns', () => {
    vi.useFakeTimers();
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.setIsPremium(false);
      contextValues.setTurns(100);
      contextValues.setSecondsUntilNextTurn(360);
    });

    // Advance 1 second - should lock at 360
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(contextValues.secondsUntilNextTurn).toBe(360);
    expect(contextValues.turns).toBe(100);

    vi.useRealTimers();
  });

  it('should allow Premium Tier players to bypass the 100 turns cap', () => {
    vi.useFakeTimers();
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.setIsPremium(true);
      contextValues.setTurns(100);
      contextValues.setSecondsUntilNextTurn(1);
    });

    expect(contextValues.turns).toBe(100);

    // Advance 1 second to trigger regeneration
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should successfully increment past the 100 cap for premium players
    expect(contextValues.turns).toBe(101);
    expect(contextValues.secondsUntilNextTurn).toBe(360);

    vi.useRealTimers();
  });

  it('should verify that Laundromats accumulate zero-heat passive income capped at $2,500', () => {
    vi.useFakeTimers();
    let contextValues = null;
    render(
      <GameProvider>
        <GameTester consumer={(val) => { contextValues = val; return null; }} />
      </GameProvider>
    );

    act(() => {
      contextValues.setIsPremium(false);
      contextValues.setTurns(50);
      contextValues.setSecondsUntilNextTurn(1);
      contextValues.setHeat(10);
      contextValues.setProperties([
        {
          id: 'prop_laundromat_test',
          name: 'Laundromat Test',
          districtId: 'slums',
          type: 'LAUNDROMAT',
          defenseRating: 10,
          upgrades: { guards: 0, reinforcedDoors: false, cctv: false },
          accumulatedCash: 2400,
          activeGuardAffiliateId: null
        }
      ]);
    });

    expect(contextValues.properties[0].accumulatedCash).toBe(2400);

    // Advance 1 second (1 turn tick) - passiveIncome is $200 per tick
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Laundromat adds $200 but is capped at $2,500
    expect(contextValues.properties[0].accumulatedCash).toBe(2500);
    // Heat should decrease by 1 due to heat decay (since Laundromat generates 0 heat)
    expect(contextValues.heat).toBe(9);

    vi.useRealTimers();
  });

  describe('Command Validation & Transactions (Task 13.1)', () => {
    it('should validate travel (movePlayer) requirement of turns and respect juice', () => {
      let contextValues = null;
      render(
        <GameProvider>
          <GameTester consumer={(val) => { contextValues = val; return null; }} />
        </GameProvider>
      );

      // Complete tutorial to unlock sandbox travel validation
      act(() => {
        contextValues.completeTutorial();
        contextValues.setTurns(5);
        contextValues.setDistrictJuice({ slums: 20, docks: 0, redlight: 0, industrial: 0, downtown: 0, marina: 0 });
      });

      // Total Juice is 20. Target district 'redlight' requires 30 juice.
      let moveResult = null;
      act(() => {
        moveResult = contextValues.movePlayer('redlight', 30);
      });
      expect(moveResult).toBe(false);
      expect(contextValues.activeDistrict).toBe('slums'); // remains in slums
      expect(contextValues.turns).toBe(5); // no turns deducted

      // Set juice to cover requirements (e.g. docks requires 15 juice, slums respect is 20, so total is 20)
      act(() => {
        moveResult = contextValues.movePlayer('docks', 15);
      });
      expect(moveResult).toBe(true);
      expect(contextValues.activeDistrict).toBe('docks');
      expect(contextValues.turns).toBe(4); // 1 turn deducted

      // Now set turns to 0 to test exhaustion
      act(() => {
        contextValues.setTurns(0);
      });
      act(() => {
        moveResult = contextValues.movePlayer('slums', 0);
      });
      expect(moveResult).toBe(false);
      expect(contextValues.activeDistrict).toBe('docks'); // unchanged
    });

    it('should validate recruitAffiliate requirement of sufficient funds', () => {
      let contextValues = null;
      render(
        <GameProvider>
          <GameTester consumer={(val) => { contextValues = val; return null; }} />
        </GameProvider>
      );

      act(() => {
        contextValues.completeTutorial();
        contextValues.setMoney(1000);
        contextValues.setAffiliates([]);
      });

      const expensiveTemplate = {
        id: 'ins_1',
        name: 'Officer Miller',
        specialty: 'Inside Man',
        cost: 8000,
        upkeep: 400
      };

      let recruitResult = null;
      act(() => {
        recruitResult = contextValues.recruitAffiliate(expensiveTemplate);
      });
      expect(recruitResult).toBe(false);
      expect(contextValues.affiliates.length).toBe(0);
      expect(contextValues.money).toBe(1000);

      // Give enough money
      act(() => {
        contextValues.setMoney(10000);
      });
      act(() => {
        recruitResult = contextValues.recruitAffiliate(expensiveTemplate);
      });
      expect(recruitResult).toBe(true);
      expect(contextValues.affiliates.length).toBe(1);
      expect(contextValues.money).toBe(2000); // 10000 - 8000
    });

    it('should validate buyCargo constraints on budget and cargo hold capacity limits', () => {
      let contextValues = null;
      render(
        <GameProvider>
          <GameTester consumer={(val) => { contextValues = val; return null; }} />
        </GameProvider>
      );

      act(() => {
        contextValues.completeTutorial();
        contextValues.setMoney(500);
        contextValues.setCargo({ precursors: 0, stims: 0, weapons: 0, counterfeit: 0 });
      });

      // 1. Budget constraint check
      // Try purchasing 2 units of precursors at $300 each (Total: $600) when money is $500
      let purchaseResult = null;
      act(() => {
        purchaseResult = contextValues.buyCargo('precursors', 2, 300);
      });
      expect(purchaseResult).toBe(false);
      expect(contextValues.cargo.precursors).toBe(0);
      expect(contextValues.money).toBe(500);

      // 2. Capacity constraint check
      act(() => {
        contextValues.setMoney(10000);
        // Fill cargo to 19 units (Limit is 20)
        contextValues.setCargo({ precursors: 19, stims: 0, weapons: 0, counterfeit: 0 });
      });

      // Try purchasing 2 units (would exceed 20 units limit)
      act(() => {
        purchaseResult = contextValues.buyCargo('precursors', 2, 100);
      });
      expect(purchaseResult).toBe(false);
      expect(contextValues.cargo.precursors).toBe(19);

      // Purchase 1 unit (allowed)
      act(() => {
        purchaseResult = contextValues.buyCargo('precursors', 1, 100);
      });
      expect(purchaseResult).toBe(true);
      expect(contextValues.cargo.precursors).toBe(20);
      expect(contextValues.money).toBe(9900); // 10000 - 100
    });
  });
});
