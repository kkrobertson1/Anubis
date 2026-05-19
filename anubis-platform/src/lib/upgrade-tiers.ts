export const UPGRADE_TIERS = [
  { slots: 10,  price: 8,   label: "Starter",      description: "+10 memorial slots" },
  { slots: 100, price: 60,  label: "Standard",     description: "+100 memorial slots" },
  { slots: 250, price: 140, label: "Professional", description: "+250 memorial slots" },
  { slots: 500, price: 280, label: "Premium",      description: "+500 memorial slots" },
] as const;

export type UpgradeTier = (typeof UPGRADE_TIERS)[number];

// Server-side price map — prevents client from sending a manipulated amount
export const SLOT_PRICES: Record<number, number> = {
  10:  8,
  100: 60,
  250: 140,
  500: 280,
};

export const MAX_SLOTS = 1000;
