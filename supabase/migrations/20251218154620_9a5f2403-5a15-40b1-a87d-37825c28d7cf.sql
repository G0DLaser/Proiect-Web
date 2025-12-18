-- Create scenes table
CREATE TABLE public.scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Scene',
  objects JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

-- Users can only view their own scenes
CREATE POLICY "Users can view their own scenes" 
ON public.scenes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own scenes
CREATE POLICY "Users can create their own scenes" 
ON public.scenes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own scenes
CREATE POLICY "Users can update their own scenes" 
ON public.scenes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own scenes
CREATE POLICY "Users can delete their own scenes" 
ON public.scenes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scenes_updated_at
BEFORE UPDATE ON public.scenes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();