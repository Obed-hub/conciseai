import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';

export type Tier = 'Free' | 'Scholar' | 'Pro';

interface SubscriptionState {
    tier: Tier;
    fuelCredits: number;
    powerCredits: number;
    searchQueries: number; // For Scholar tier free searches
    lastResetDate: string; // ISO date string
}

interface SubscriptionContextType extends SubscriptionState {
    useCredits: (cost: number, type: 'fuel' | 'power' | 'search') => Promise<boolean>;
    addCredits: (amount: number, type: 'fuel' | 'power') => Promise<void>;
    upgradeTier: (tier: Tier) => Promise<void>;
    checkAllowance: (cost: number, feature: 'search' | 'vision' | 'doc') => boolean;
    openPricingModal: () => void;
    closePricingModal: () => void;
    isPricingModalOpen: boolean;
}

const DEFAULT_STATE: SubscriptionState = {
    tier: 'Free',
    fuelCredits: 10,
    powerCredits: 0,
    searchQueries: 0,
    lastResetDate: new Date().toISOString()
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [state, setState] = useState<SubscriptionState>(() => {
        // Initial load from local storage for instant render (guest mode)
        // Correct logic will take over in useEffect once auth resolves
        const saved = localStorage.getItem('subscription_state');
        return saved ? JSON.parse(saved) : DEFAULT_STATE;
    });

    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    // Sync with Firestore or LocalStorage
    useEffect(() => {
        if (authLoading) return;

        if (user) {
            // Firestore Sync
            const userRef = doc(db, 'users', user.uid);

            const unsubscribe = onSnapshot(userRef, async (snapshot) => {
                if (snapshot.exists()) {
                    setState(snapshot.data() as SubscriptionState);
                } else {
                    // Initialize user doc if it doesn't exist
                    await setDoc(userRef, DEFAULT_STATE);
                    setState(DEFAULT_STATE);
                }
            });

            return () => unsubscribe();
        } else {
            // LocalStorage Sync (Load saved state for guest)
            const saved = localStorage.getItem('subscription_state');
            if (saved) {
                setState(JSON.parse(saved));
            } else {
                setState(DEFAULT_STATE);
            }
        }
    }, [user, authLoading]);

    // Save to LocalStorage whenever state changes (only for guests)
    useEffect(() => {
        if (!user && !authLoading) {
            localStorage.setItem('subscription_state', JSON.stringify(state));
        }
    }, [state, user, authLoading]);

    // Monthly reset logic
    useEffect(() => {
        const checkReset = async () => {
            const now = new Date();
            const lastReset = new Date(state.lastResetDate);

            // Check if it's a new month compared to last reset
            if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
                let newFuel = 10;
                let newSearch = 0;

                if (state.tier === 'Scholar') {
                    newFuel = 300;
                    newSearch = 10;
                } else if (state.tier === 'Pro') {
                    newFuel = 1000;
                }

                const newState = {
                    ...state,
                    fuelCredits: newFuel,
                    searchQueries: newSearch,
                    lastResetDate: now.toISOString()
                };

                if (user) {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, newState);
                } else {
                    setState(newState);
                }
                toast.info("Your monthly credits have been reset!");
            }
        };

        checkReset();
    }, [state.lastResetDate, state.tier, user]);

    const updateState = async (updates: Partial<SubscriptionState>) => {
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, updates);
        } else {
            setState(prev => ({ ...prev, ...updates }));
        }
    };

    const addCredits = async (amount: number, type: 'fuel' | 'power') => {
        const key = type === 'fuel' ? 'fuelCredits' : 'powerCredits';
        const newValue = state[key] + amount;

        await updateState({ [key]: newValue });
        toast.success(`Received +${amount} ${type === 'fuel' ? 'Fuel' : 'Power'} Credits!`);
    };

    const upgradeTier = async (newTier: Tier) => {
        let newFuel = state.fuelCredits;
        let newSearch = state.searchQueries;

        if (newTier === 'Scholar') {
            newFuel = Math.max(newFuel, 300);
            newSearch = 10;
        } else if (newTier === 'Pro') {
            newFuel = Math.max(newFuel, 1000);
        }

        await updateState({
            tier: newTier,
            fuelCredits: newFuel,
            searchQueries: newSearch
        });

        toast.success(`Upgraded to ${newTier} Tier!`);
        setIsPricingModalOpen(false);
    };

    const useCredits = async (cost: number, feature: 'fuel' | 'power' | 'search'): Promise<boolean> => {
        let { fuelCredits, powerCredits, searchQueries } = state;
        let success = false;
        let updates: Partial<SubscriptionState> = {};

        if (feature === 'search' && searchQueries > 0) {
            searchQueries -= 1;
            updates.searchQueries = searchQueries;
            success = true;
        } else if (powerCredits >= cost) {
            powerCredits -= cost;
            updates.powerCredits = powerCredits;
            success = true;
        } else if (fuelCredits >= cost) {
            fuelCredits -= cost;
            updates.fuelCredits = fuelCredits;
            success = true;
        }

        if (success) {
            await updateState(updates);
        }

        return success;
    };

    const checkAllowance = (cost: number, feature: 'search' | 'vision' | 'doc'): boolean => {
        const canAfford = state.powerCredits >= cost || state.fuelCredits >= cost || (feature === 'search' && state.searchQueries > 0);

        if (!canAfford) {
            setIsPricingModalOpen(true);
            return false;
        }
        return true;
    };

    return (
        <SubscriptionContext.Provider value={{
            ...state,
            useCredits,
            addCredits,
            upgradeTier,
            checkAllowance,
            openPricingModal: () => setIsPricingModalOpen(true),
            closePricingModal: () => setIsPricingModalOpen(false),
            isPricingModalOpen
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
