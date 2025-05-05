'use client';

import { useState, useEffect } from 'react';
import { SubscriptionData, isSubscriptionActive, hasPremiumAccess } from '@/lib/types/subscription';

export interface SubscriptionInfo {
  isLoading: boolean;
  subscription: SubscriptionData | null;
  isActive: boolean;
  isPremium: boolean;
  error: string | null;
}

export function useSubscription(): SubscriptionInfo {
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/subscription');
        
        if (!response.ok) {
          throw new Error(`Erro ao verificar assinatura: ${response.status}`);
        }
        
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        setError('Não foi possível verificar o status da sua assinatura.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);
  
  // Determinar se a assinatura está ativa e se é premium
  const isActive = subscription ? isSubscriptionActive(subscription) : false;
  const isPremium = subscription ? hasPremiumAccess(subscription) : false;

  return {
    isLoading,
    subscription,
    isActive,
    isPremium,
    error
  };
}
