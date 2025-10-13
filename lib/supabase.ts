/**
 * Supabase Client Configuration
 * Client-side Supabase instance for browser operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for browser interactions
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Type definition for quiz results table
 */
export interface QuizResult {
  // Demographics
  age?: number;
  height?: number;
  weight?: number;

  // Lifestyle
  sleep?: number;
  alcohol?: string;
  nicotine?: string;
  diet?: string;
  stress?: number;

  // Training
  training_frequency?: string;
  training_type?: string;
  recovery?: string;
  supplements?: string;

  // Symptoms
  libido?: number;
  morning_erection?: string;
  morning_energy?: number;
  concentration?: number;
  mood?: string;
  muscle_mass?: string;

  // Contact
  first_name?: string;
  email?: string;

  // Results
  score?: number;
  testosterone_level?: number;
  testosterone_category?: string;
  risk_level?: string;
  recommended_tier?: string;

  // Metadata
  source?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

/**
 * Save quiz result to Supabase
 * @param data - Quiz result data
 * @returns Insert result with ID
 */
export async function saveQuizResult(data: QuizResult) {
  try {
    const { data: result, error } = await supabase
      .from('quiz_results')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error saving quiz result to Supabase:', error);
      throw error;
    }

    console.log('✅ Quiz result saved to Supabase:', result.id);
    return result;
  } catch (error) {
    console.error('Failed to save quiz result:', error);
    throw error;
  }
}

/**
 * Get quiz result by email
 * @param email - User email
 * @returns Quiz results for this email
 */
export async function getQuizResultsByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch quiz results:', error);
    throw error;
  }
}
