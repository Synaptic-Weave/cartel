/**
 * Cartel Game Mathematics Engine
 * Handles success rolls, asynchronous raid resolutions, and dynamic market prices.
 */

/**
 * Calculates the success probability of a district job.
 * 
 * @param {number} baseChance - Base job success rate (e.g., 70 for 70%)
 * @param {number} heat - Player's current Heat level (0 to 100)
 * @param {Array} assignedCrew - Array of hired affiliates assigned to this job
 * @param {string} requiredSpecialty - Optional specialty required for this job
 * @returns {object} { chance: number, modifierDetails: Array }
 */
export const calculateJobSuccessChance = (baseChance, heat, assignedCrew = [], requiredSpecialty = null) => {
  let chance = baseChance;
  const modifierDetails = [];

  // Heat Penalty: -0.3% success chance per point of Heat
  if (heat > 0) {
    const heatPenalty = Math.round(heat * 0.3);
    chance -= heatPenalty;
    modifierDetails.push({ name: 'Local Heat Penalty', value: -heatPenalty });
  }

  // Specialty Boosts
  assignedCrew.forEach(crew => {
    if (requiredSpecialty && crew.specialty === requiredSpecialty && crew.state === 'active') {
      chance += 20;
      modifierDetails.push({ name: `Specialist Match (${crew.name})`, value: 20 });
    } else if (crew.state === 'active') {
      // General assistance from active crew
      chance += 5;
      modifierDetails.push({ name: `Crew Assistance (${crew.name})`, value: 5 });
    }
  });

  // Cap final chance between 5% and 95% (always a small risk of getting caught!)
  chance = Math.max(5, Math.min(95, chance));

  return { chance, modifierDetails };
};

/**
 * Resolves an asynchronous raid on a player property.
 * 
 * @param {object} attacker - { name: string, combatRating: number }
 * @param {object} property - { name: string, baseDefense: number, assignedGuardCount: number, muscleCount: number }
 * @returns {object} { success: boolean, attackerLosses: Array, defenderLosses: Array, message: string }
 */
export const resolvePropertyRaid = (attackerRating, defenderRating) => {
  // Net rating difference
  const netScore = attackerRating - defenderRating;
  
  // Base success chance is 50% shifted by netScore difference (each point represents 5% shift)
  let successChance = 50 + (netScore * 5);
  successChance = Math.max(10, Math.min(90, successChance)); // Cap between 10% and 90%

  const roll = Math.floor(Math.random() * 100) + 1;
  const success = roll <= successChance;

  return {
    success,
    roll,
    successChance,
    netScore
  };
};

/**
 * Commodities available for smuggling.
 */
export const COMMODITIES = {
  PRECURSORS: 'precursors',
  STIMS: 'stims',
  WEAPONS: 'weapons',
  COUNTERFEIT: 'counterfeit'
};

export const COMMODITY_DETAILS = {
  [COMMODITIES.PRECURSORS]: { name: 'Chemical Precursors', basePrice: 250 },
  [COMMODITIES.STIMS]: { name: 'Contraband Stims', basePrice: 120 },
  [COMMODITIES.WEAPONS]: { name: 'Military Weapons Crate', basePrice: 1500 },
  [COMMODITIES.COUNTERFEIT]: { name: 'Counterfeit Banknotes', basePrice: 400 }
};

/**
 * Generates district-specific prices for smuggling.
 * High-Sec districts (Downtown) pay a massive premium for drugs/weapons but produce nothing.
 * Null-Sec districts (Slums) produce precursors and stims cheaply but pay low prices for them.
 * 
 * @param {string} districtId - The ID of the target district
 * @param {number} seed - Dynamic turn/hour seed to introduce slight randomized fluctuations
 * @returns {object} Map of commodity ID to { buyPrice: number, sellPrice: number }
 */
export const getCommodityPricesForDistrict = (districtId, turnCount = 0) => {
  const prices = {};
  
  // Custom multipliers based on district security and type
  let buyMultiplier = 1.0;
  let sellMultiplier = 1.0;
  
  // Fluctuations based on turn count (sine wave model to look organic)
  const marketTide = Math.sin(turnCount * 0.15) * 0.12; // +/- 12% fluctuation over turns

  switch (districtId) {
    case 'slums': // Null-Sec: Producers of raw precursors & stims
      prices[COMMODITIES.PRECURSORS] = { buy: 180, sell: 120 };
      prices[COMMODITIES.STIMS] = { buy: 95, sell: 60 };
      prices[COMMODITIES.WEAPONS] = { buy: 1400, sell: 1200 };
      prices[COMMODITIES.COUNTERFEIT] = { buy: 290, sell: 220 };
      break;
      
    case 'docks': // Low-Sec: Major smuggling inlet
      prices[COMMODITIES.PRECURSORS] = { buy: 260, sell: 200 };
      prices[COMMODITIES.STIMS] = { buy: 140, sell: 100 };
      prices[COMMODITIES.WEAPONS] = { buy: 1300, sell: 1100 }; // Cheapest place to import weapons
      prices[COMMODITIES.COUNTERFEIT] = { buy: 360, sell: 300 };
      break;
 
    case 'redlight': // Low-Sec: High consumption of stims and counterfeit bills
      prices[COMMODITIES.PRECURSORS] = { buy: 310, sell: 260 };
      prices[COMMODITIES.STIMS] = { buy: 210, sell: 140 }; // High selling price for stims
      prices[COMMODITIES.WEAPONS] = { buy: 1850, sell: 1600 };
      prices[COMMODITIES.COUNTERFEIT] = { buy: 420, sell: 350 }; // Good place to clean counterfeit cash
      break;
      
    case 'industrial': // Low-Sec: Produces chemicals
      prices[COMMODITIES.PRECURSORS] = { buy: 200, sell: 150 }; // Low precursor price
      prices[COMMODITIES.STIMS] = { buy: 150, sell: 110 };
      prices[COMMODITIES.WEAPONS] = { buy: 1650, sell: 1400 };
      prices[COMMODITIES.COUNTERFEIT] = { buy: 380, sell: 310 };
      break;
      
    case 'downtown': // High-Sec: Maximum consumer market, high security checks
      prices[COMMODITIES.PRECURSORS] = { buy: 420, sell: 350 };
      prices[COMMODITIES.STIMS] = { buy: 320, sell: 240 }; // Massive demand, sell stims here!
      prices[COMMODITIES.WEAPONS] = { buy: 2400, sell: 2000 }; // Heavy premiums on weapons
      prices[COMMODITIES.COUNTERFEIT] = { buy: 590, sell: 480 }; // Perfect spot for counterfeit bills
      break;
      
    case 'marina': // High-Sec: Elite, gold-standard consumer port
      prices[COMMODITIES.PRECURSORS] = { buy: 450, sell: 380 };
      prices[COMMODITIES.STIMS] = { buy: 370, sell: 280 }; // Luxury stim sales
      prices[COMMODITIES.WEAPONS] = { buy: 2700, sell: 2200 };
      prices[COMMODITIES.COUNTERFEIT] = { buy: 650, sell: 520 }; // High-stakes laundry
      break;
      
    default:
      // Fallback
      Object.keys(COMMODITY_DETAILS).forEach(key => {
        prices[key] = { buy: Math.round(COMMODITY_DETAILS[key].basePrice * 1.3), sell: COMMODITY_DETAILS[key].basePrice };
      });
  }

  // Apply market wave tide fluctuation to make the board feel dynamically alive
  Object.keys(prices).forEach(key => {
    const item = prices[key];
    const fluctuation = 1 + marketTide;
    item.buy = Math.round(item.buy * fluctuation);
    item.sell = Math.round(item.sell * fluctuation);
  });

  return prices;
};
