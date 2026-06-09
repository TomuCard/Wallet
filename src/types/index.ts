export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: number;
  name: string;
  price: number;
  billing_cycle: BillingCycle;
  renewal_date: string;
  brand_id: string | null;
  brand_color: string;
  created_at: string;
}

export type SubscriptionFormData = {
  name: string;
  price: string;
  billing_cycle: BillingCycle;
  renewal_date: Date;
  brand_id: string | null;
  brand_color: string;
};

export type RootStackParamList = {
  Home: undefined;
  AddSubscription: { subscription?: Subscription } | undefined;
};
