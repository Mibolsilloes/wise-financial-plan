-- Add position column for category ordering
ALTER TABLE public.categories 
ADD COLUMN position integer DEFAULT 0;

-- Update existing categories with sequential positions
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 as new_position
  FROM public.categories
)
UPDATE public.categories c
SET position = n.new_position
FROM numbered n
WHERE c.id = n.id;