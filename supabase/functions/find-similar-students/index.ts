import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, collegeId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current user's profile
    const { data: myProfile } = await supabase
      .from('studentdetails')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!myProfile) {
      throw new Error('Profile not found');
    }

    // Get all students from same college
    const { data: students } = await supabase
      .from('studentdetails')
      .select('*')
      .eq('college_id', collegeId)
      .neq('user_id', userId);

    if (!students || students.length === 0) {
      return new Response(
        JSON.stringify({ rankedStudents: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing friendships to filter out
    const { data: friendships } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    const friendIds = new Set(
      friendships?.flatMap(f => [f.user_id, f.friend_id]) || []
    );

    const availableStudents = students.filter(s => !friendIds.has(s.user_id));

    // Use AI to rank students by similarity
    const prompt = `You are a matching system. Given a student profile and a list of other students, rank the students by similarity based on their branch, skills, and interests.

My Profile:
- Branch: ${myProfile.branch || 'Not specified'}
- Year: ${myProfile.year || 'Not specified'}

Other Students:
${availableStudents.map((s, i) => `${i}. Branch: ${s.branch || 'Not specified'}, Year: ${s.year || 'Not specified'}`).join('\n')}

Rank these students by similarity considering:
1. Semantic similarity of branches (e.g., "Computer Science" and "Software Engineering" are very similar)
2. Same year gets priority
3. Related fields (e.g., "Engineering" and "Computer Engineering" are related)

Return ONLY a JSON array of student indices (0-based) in order from most to least similar. Format: [index1, index2, ...]`;

    console.log('Calling AI for similarity ranking...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a student matching assistant. Return only valid JSON arrays of indices.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '[]';
    
    console.log('AI Response:', aiContent);
    
    // Parse AI response - extract JSON array from response
    let rankedIndices: number[] = [];
    try {
      const jsonMatch = aiContent.match(/\[[\d,\s]+\]/);
      if (jsonMatch) {
        rankedIndices = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback to original order
      rankedIndices = availableStudents.map((_, i) => i);
    }

    // Sort students by AI ranking, then by year as fallback
    const rankedStudents = rankedIndices
      .map(i => availableStudents[i])
      .filter(Boolean) // Remove any undefined entries
      .concat(
        // Add any students not in AI ranking at the end
        availableStudents.filter((_, i) => !rankedIndices.includes(i))
      );

    return new Response(
      JSON.stringify({ rankedStudents }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in find-similar-students:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
