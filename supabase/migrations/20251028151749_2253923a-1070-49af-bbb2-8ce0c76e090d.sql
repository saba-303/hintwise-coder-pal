-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create enum for problem categories
CREATE TYPE problem_category AS ENUM (
  'array',
  'string',
  'linked_list',
  'tree',
  'graph',
  'dynamic_programming',
  'sorting',
  'searching',
  'hash_table',
  'stack',
  'queue',
  'heap',
  'math',
  'bit_manipulation',
  'backtracking',
  'greedy',
  'two_pointers',
  'sliding_window'
);

-- Create enum for difficulty levels
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create enum for submission status
CREATE TYPE submission_status AS ENUM ('attempted', 'solved', 'in_progress');

-- Create problems table
CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty difficulty_level NOT NULL,
  category problem_category NOT NULL,
  constraints TEXT[],
  test_cases JSONB NOT NULL,
  solution_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on problems
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Problems are viewable by everyone
CREATE POLICY "Anyone can view problems"
  ON public.problems FOR SELECT
  USING (true);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  code TEXT,
  status submission_status DEFAULT 'in_progress',
  hints_used INTEGER DEFAULT 0,
  hints_details JSONB DEFAULT '[]',
  time_spent INTEGER DEFAULT 0,
  last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  test_results JSONB,
  UNIQUE(user_id, problem_id)
);

-- Enable RLS on user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample problems
INSERT INTO public.problems (title, description, difficulty, category, constraints, test_cases, solution_template) VALUES
(
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
  'easy',
  'array',
  ARRAY['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists'],
  '[{"input": "[2,7,11,15], target = 9", "output": "[0,1]"}, {"input": "[3,2,4], target = 6", "output": "[1,2]"}, {"input": "[3,3], target = 6", "output": "[0,1]"}]'::jsonb,
  'function twoSum(nums, target) {\n  // Write your solution here\n  \n}'
),
(
  'Reverse Linked List',
  'Given the head of a singly linked list, reverse the list, and return the reversed list.',
  'easy',
  'linked_list',
  ARRAY['The number of nodes in the list is the range [0, 5000]', '-5000 <= Node.val <= 5000'],
  '[{"input": "[1,2,3,4,5]", "output": "[5,4,3,2,1]"}, {"input": "[1,2]", "output": "[2,1]"}, {"input": "[]", "output": "[]"}]'::jsonb,
  'function reverseList(head) {\n  // Write your solution here\n  \n}'
),
(
  'Valid Parentheses',
  'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',
  'easy',
  'stack',
  ARRAY['1 <= s.length <= 10^4', 's consists of parentheses only ''()[]{}'''],
  '[{"input": "()", "output": "true"}, {"input": "()[]{}", "output": "true"}, {"input": "(]", "output": "false"}]'::jsonb,
  'function isValid(s) {\n  // Write your solution here\n  \n}'
),
(
  'Maximum Subarray',
  'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
  'medium',
  'dynamic_programming',
  ARRAY['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
  '[{"input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6"}, {"input": "[1]", "output": "1"}, {"input": "[5,4,-1,7,8]", "output": "23"}]'::jsonb,
  'function maxSubArray(nums) {\n  // Write your solution here\n  \n}'
),
(
  'Merge Two Sorted Lists',
  'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.',
  'easy',
  'linked_list',
  ARRAY['The number of nodes in both lists is in the range [0, 50]', '-100 <= Node.val <= 100'],
  '[{"input": "[1,2,4], [1,3,4]", "output": "[1,1,2,3,4,4]"}, {"input": "[], []", "output": "[]"}, {"input": "[], [0]", "output": "[0]"}]'::jsonb,
  'function mergeTwoLists(list1, list2) {\n  // Write your solution here\n  \n}'
)