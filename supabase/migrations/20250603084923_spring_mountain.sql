/*
  # Create shopping items table

  1. New Tables
    - `shopping_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `is_checked` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `shopping_items` table
    - Add policies for authenticated users to manage their own items
*/

CREATE TABLE IF NOT EXISTS shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  is_checked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own shopping items"
  ON shopping_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shopping items"
  ON shopping_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items"
  ON shopping_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items"
  ON shopping_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);