-- Earthly Indonesia Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  earth_score INTEGER DEFAULT 0 CHECK (earth_score >= 0 AND earth_score <= 100),
  total_co2_saved DECIMAL(10,2) DEFAULT 0,
  total_plastic_reduced DECIMAL(10,2) DEFAULT 0,
  total_water_saved DECIMAL(10,2) DEFAULT 0,
  trees_equivalent DECIMAL(10,2) DEFAULT 0,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions table (Green Action Library)
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('waste', 'energy', 'water', 'transportation', 'consumption')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  impact_score INTEGER NOT NULL CHECK (impact_score >= 1 AND impact_score <= 100),
  co2_reduction DECIMAL(8,2) DEFAULT 0,
  plastic_reduction DECIMAL(8,2) DEFAULT 0,
  water_saving DECIMAL(8,2) DEFAULT 0,
  points INTEGER DEFAULT 10,
  image_url TEXT,
  instructions TEXT[] DEFAULT '{}',
  tips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action logs (user completions)
CREATE TABLE action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER DEFAULT 0,
  co2_saved DECIMAL(8,2) DEFAULT 0,
  plastic_reduced DECIMAL(8,2) DEFAULT 0,
  water_saved DECIMAL(8,2) DEFAULT 0,
  notes TEXT,
  proof_image_url TEXT,
  UNIQUE(user_id, action_id, completed_at)
);

-- Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points_reward INTEGER DEFAULT 50,
  badge_reward TEXT,
  requirements JSONB NOT NULL DEFAULT '[]',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge progress
CREATE TABLE challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  location TEXT,
  goal_description TEXT,
  target_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  category TEXT CHECK (category IN ('waste', 'energy', 'water', 'transportation', 'consumption')),
  total_co2_saved DECIMAL(12,2) DEFAULT 0,
  total_plastic_reduced DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign members
CREATE TABLE campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  contribution INTEGER DEFAULT 0,
  UNIQUE(campaign_id, user_id)
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT CHECK (category IN ('waste', 'energy', 'water', 'transportation', 'consumption')),
  points_reward INTEGER DEFAULT 100,
  criteria JSONB NOT NULL DEFAULT '{}'
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_action_logs_user ON action_logs(user_id);
CREATE INDEX idx_action_logs_completed ON action_logs(completed_at);
CREATE INDEX idx_challenge_progress_user ON challenge_progress(user_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);
CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_actions_category ON actions(category);
CREATE INDEX idx_challenges_type ON challenges(type);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Action logs viewable by owner"
  ON action_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own action logs"
  ON action_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Challenges are viewable by everyone"
  ON challenges FOR SELECT USING (TRUE);

CREATE POLICY "Challenge progress viewable by owner"
  ON challenge_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own challenge progress"
  ON challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON challenge_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Campaigns are viewable by everyone"
  ON campaigns FOR SELECT USING (TRUE);

CREATE POLICY "Campaign members viewable by everyone"
  ON campaign_members FOR SELECT USING (TRUE);

CREATE POLICY "Users can join campaigns"
  ON campaign_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT USING (TRUE);

CREATE POLICY "User achievements viewable by everyone"
  ON user_achievements FOR SELECT USING (TRUE);

-- Function to update user profile stats
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    total_co2_saved = total_co2_saved + NEW.co2_saved,
    total_plastic_reduced = total_plastic_reduced + NEW.plastic_reduced,
    total_water_saved = total_water_saved + NEW.water_saved,
    points = points + NEW.points_earned,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_action_completed
  AFTER INSERT ON action_logs
  FOR EACH ROW EXECUTE FUNCTION update_profile_stats();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
