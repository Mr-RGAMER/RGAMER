import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserPowerState {
  aiPower: number;
  maxPower: number;
  tier: 'free' | 'pro' | 'gamer';
  lastRefillDate: string; // YYYY-MM-DD
  planExpiryDate?: string; // ISO String when PRO or GAMER plan expires (1 month from upgrade)
  planStartedDate?: string; // ISO string
}

export const TIER_LIMITS = {
  free: {
    startingPower: 1500,
    maxCap: 1500,
    dailyRefill: 1000  // 1000 power / 10 cost per chat = exactly 100 free chats every single day
  },
  pro: {
    startingPower: 3000,
    maxCap: 3000,
    dailyRefill: 2500
  },
  gamer: {
    startingPower: 6000,
    maxCap: 6000,
    dailyRefill: 5000
  }
};

export const POWER_COSTS = {
  CHAT: 10,       // 1 normal chat = 10 power
  IMAGE: 15,      // 1 image generation = 15 power
  VIDEO: 20,      // 5-sec video / cinematic prompt = 20 power
  CODE: 25        // Code generation (Website, App, Blender, AI script) = 25 power
};

/**
 * Get current date string in YYYY-MM-DD
 */
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Determine power cost dynamically based on content and active model
 */
export function calculatePowerCost(content: string, activeModel: string, isBlenderMode: boolean): number {
  const lower = content.toLowerCase();

  // Video generation
  if (
    activeModel.includes('VIDEO') || 
    lower.includes('video') || 
    lower.includes('animate') || 
    lower.includes('5 sec') || 
    lower.includes('5s') ||
    lower.includes('motion')
  ) {
    return POWER_COSTS.VIDEO; // 20
  }

  // Code generation (Website, App, Blender, Script, etc.)
  if (
    isBlenderMode ||
    activeModel.includes('CODER') ||
    lower.includes('code') ||
    lower.includes('website') ||
    lower.includes('web site') ||
    lower.includes('app') ||
    lower.includes('python') ||
    lower.includes('html') ||
    lower.includes('css') ||
    lower.includes('javascript') ||
    lower.includes('react') ||
    lower.includes('script') ||
    lower.includes('api') ||
    lower.includes('program') ||
    lower.includes('function')
  ) {
    return POWER_COSTS.CODE; // 25
  }

  // Image generation
  if (
    activeModel.includes('IMAGE') ||
    lower.includes('image') ||
    lower.includes('picture') ||
    lower.includes('photo') ||
    lower.includes('logo') ||
    lower.includes('draw') ||
    lower.includes('generate visual') ||
    lower.includes('wallpaper')
  ) {
    return POWER_COSTS.IMAGE; // 15
  }

  // Normal Chat
  return POWER_COSTS.CHAT; // 10
}

/**
 * Fetch or initialize user power state and handle daily refill silently
 */
export async function getOrInitializeUserPower(uid: string): Promise<UserPowerState> {
  const today = getTodayDateString();
  const userDocRef = doc(db, `users/${uid}`);

  try {
    const snap = await getDoc(userDocRef);
    
    // Developer Override (Admin)
    const isAdmin = snap.data()?.email === 'rgamer202026@gmail.com';
    
    if (!snap.exists()) {
      // First time user: initialize with Free tier (1500 power)
      const initialState: UserPowerState = {
        aiPower: TIER_LIMITS.free.startingPower,
        maxPower: TIER_LIMITS.free.maxCap,
        tier: 'free',
        lastRefillDate: today
      };
      await setDoc(userDocRef, initialState, { merge: true });
      return initialState;
    }

    const data = snap.data();
    let tier: 'free' | 'pro' | 'gamer' = data.tier || 'free';
    
    // Force Gamer tier for admin
    if (isAdmin) {
      tier = 'gamer';
    }

    const tierConfig = TIER_LIMITS[tier] || TIER_LIMITS.free;
    let currentPower = typeof data.aiPower === 'number' ? data.aiPower : tierConfig.startingPower;
    
    // Force unlimited power for admin
    if (isAdmin) {
      currentPower = 9999999;
    }

    const lastRefill = data.lastRefillDate || '';

    // Check if new day has arrived for refill
    if (lastRefill !== today && !isAdmin) {
      // If current power is below maxCap, refill
      if (currentPower < tierConfig.maxCap) {
        currentPower = Math.min(tierConfig.maxCap, currentPower + tierConfig.dailyRefill);
      }
      // Update Firestore with refilled balance and today's date
      await updateDoc(userDocRef, {
        aiPower: currentPower,
        maxPower: tierConfig.maxCap,
        lastRefillDate: today,
        tier
      });
    }

    return {
      aiPower: currentPower,
      maxPower: tierConfig.maxCap,
      tier,
      lastRefillDate: today,
      planExpiryDate: data.planExpiryDate,
      planStartedDate: data.planStartedDate
    };
  } catch (error) {
    console.warn("Error fetching user power state from Firestore, using local fallback:", error);
    // Fallback in case of temporary network issue
    return {
      aiPower: 1500,
      maxPower: 1500,
      tier: 'free',
      lastRefillDate: today
    };
  }
}

/**
 * Deduct power silently in the background
 */
export async function deductUserPower(uid: string, cost: number): Promise<{ success: boolean; remainingPower: number }> {
  const userDocRef = doc(db, `users/${uid}`);
  
  try {
    const currentState = await getOrInitializeUserPower(uid);
    
    if (currentState.aiPower < cost) {
      return { success: false, remainingPower: currentState.aiPower };
    }

    const newPower = Math.max(0, currentState.aiPower - cost);
    await updateDoc(userDocRef, {
      aiPower: newPower
    });

    return { success: true, remainingPower: newPower };
  } catch (error) {
    console.error("Failed to deduct power:", error);
    return { success: true, remainingPower: 1000 }; // Fail-open gracefully to not break chat on network hiccup
  }
}

/**
 * Check if a session or user's pro plan has expired
 */
export function isPlanExpired(powerState: UserPowerState | null): boolean {
  if (!powerState) return false;
  // If user is free, check if they have an expiry date that passed
  if (powerState.planExpiryDate) {
    const expiry = new Date(powerState.planExpiryDate).getTime();
    if (Date.now() > expiry) {
      return true;
    }
  }
  return false;
}

/**
 * Upgrade user tier (e.g. For Pro or Gamer subscription)
 */
export async function updateUserPlanTier(uid: string, tier: 'free' | 'pro' | 'gamer', durationDays = 30): Promise<void> {
  const userDocRef = doc(db, `users/${uid}`);
  const now = new Date();
  const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const tierConfig = TIER_LIMITS[tier];

  await updateDoc(userDocRef, {
    tier,
    aiPower: tierConfig.startingPower,
    maxPower: tierConfig.maxCap,
    planStartedDate: now.toISOString(),
    planExpiryDate: tier === 'free' ? null : expiry.toISOString()
  });
}

