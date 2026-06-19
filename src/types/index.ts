export type ActionCategory = "waste" | "energy" | "water" | "transportation" | "consumption"

export type Difficulty = "easy" | "medium" | "hard"

export type ChallengeType = "daily" | "weekly"

export interface Profile {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  earth_score: number
  total_co2_saved: number
  total_plastic_reduced: number
  total_water_saved: number
  trees_equivalent: number
  points: number
  level: number
  created_at: string
  updated_at: string
}

export interface Action {
  id: string
  title: string
  description: string
  category: ActionCategory
  difficulty: Difficulty
  impact_score: number
  co2_reduction: number
  plastic_reduction: number
  water_saving: number
  points: number
  image_url: string | null
  instructions: string[]
  tips: string[]
  created_at: string
}

export interface ActionLog {
  id: string
  user_id: string
  action_id: string
  action?: Action
  completed_at: string
  points_earned: number
  co2_saved: number
  plastic_reduced: number
  water_saved: number
  notes: string | null
  proof_image_url: string | null
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: ChallengeType
  difficulty: Difficulty
  points_reward: number
  badge_reward: string | null
  requirements: ChallengeRequirement[]
  start_date: string
  end_date: string
  created_at: string
}

export interface ChallengeRequirement {
  action_id?: string
  category?: ActionCategory
  count: number
  description: string
}

export interface ChallengeProgress {
  id: string
  user_id: string
  challenge_id: string
  challenge?: Challenge
  progress: number
  completed: boolean
  completed_at: string | null
  started_at: string
}

export interface Campaign {
  id: string
  title: string
  description: string
  cover_image_url: string | null
  location: string | null
  goal_description: string
  target_participants: number
  current_participants: number
  start_date: string
  end_date: string
  organizer_id: string
  is_active: boolean
  category: ActionCategory
  total_co2_saved: number
  total_plastic_reduced: number
  created_at: string
}

export interface CampaignMember {
  id: string
  campaign_id: string
  user_id: string
  joined_at: string
  contribution: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: ActionCategory | null
  points_reward: number
  criteria: Record<string, number>
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  achievement?: Achievement
  earned_at: string
}

export interface AssessmentQuestion {
  id: number
  question: string
  category: ActionCategory
  options: { label: string; value: number }[]
}

export interface AssessmentResult {
  score: number
  category_scores: Record<ActionCategory, number>
  recommendations: string[]
}

export interface ImpactStats {
  total_co2_saved: number
  total_plastic_reduced: number
  total_water_saved: number
  trees_equivalent: number
  total_actions: number
  current_streak: number
  points: number
  level: number
}
