export interface TripActivity {
  time: string;
  activity: string;
  description: string;
  location: string;
}

export interface TripDay {
  day_number: number;
  theme: string;
  activities: TripActivity[];
}

export interface BudgetCategory {
  category: string;
  amount: number;
}

export interface TripItinerary {
  destination_name: string;
  trip_title: string;
  summary: string;
  packing_list: string[];
  budget_breakdown: BudgetCategory[];
  days: TripDay[];
}

export interface UserPreferences {
  destination: string;
  duration: number;
  budgetLevel: 'Budget' | 'Moderate' | 'Luxury';
  interests: string[];
  travelers: string;
}

export enum AppState {
  IDLE,
  GENERATING,
  DISPLAY,
  ERROR
}