/*
  # Create expenses table

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key)
      - `foundation_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `amount` (numeric)
      - `currency` (text)
      - `category` (text)
      - `description` (text)
      - `receipt_url` (text)
      - `expense_date` (date)
      - `status` (text)
      - `approved_by` (uuid, foreign key)
      - `approved_at` (timestamp)
      - `rejection_reason` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `expenses` table
    - Add policies for expense access control
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'SEK' NOT NULL,
  category text NOT NULL CHECK (category IN ('office_supplies', 'travel', 'meals', 'utilities', 'professional_services', 'marketing', 'other')),
  description text NOT NULL,
  receipt_url text,
  expense_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Users can read their own expenses, foundation owners can read all expenses for their foundation
CREATE POLICY "Users can read relevant expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    is_foundation_owner(foundation_id) OR 
    is_admin()
  );

-- Foundation members can create expenses
CREATE POLICY "Foundation members can create expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (is_foundation_member(foundation_id));

-- Users can update their own pending expenses, foundation owners can update any expense
CREATE POLICY "Users can update relevant expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = user_id AND status = 'pending') OR 
    is_foundation_owner(foundation_id) OR 
    is_admin()
  )
  WITH CHECK (
    (auth.uid() = user_id AND status = 'pending') OR 
    is_foundation_owner(foundation_id) OR 
    is_admin()
  );

-- Users can delete their own pending expenses, foundation owners can delete any expense
CREATE POLICY "Users can delete relevant expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = user_id AND status = 'pending') OR 
    is_foundation_owner(foundation_id) OR 
    is_admin()
  );

-- Trigger to update updated_at on expense changes
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();