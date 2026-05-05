import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateInsights, canRegenerateInsights } from '@/lib/insights';

const INSIGHT_STALE_HOURS = 24;

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Query for the most recent insight
    const { data: existingInsight, error: queryError } = await supabase
      .from('nutrition_insights')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('Error querying insights:', queryError);
    }

    // Check if we need to generate new insights
    let insight = existingInsight;
    const needsGeneration =
      !existingInsight ||
      (new Date().getTime() - new Date(existingInsight.generated_at).getTime()) /
        (1000 * 60 * 60) >
        INSIGHT_STALE_HOURS;

    if (needsGeneration) {
      const generated = await generateInsights(userId, supabase);

      const { data: inserted, error: insertError } = await supabase
        .from('nutrition_insights')
        .insert({
          user_id: userId,
          summary: generated.summary,
          patterns: generated.patterns,
          suggestions: generated.suggestions,
          period_days: generated.periodDays,
          generated_at: generated.generatedAt,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting insight:', insertError);
        // Return generated insight without DB persistence
        return NextResponse.json({
          insight: {
            ...generated,
            id: 'temp',
          },
          canRegenerate: canRegenerateInsights(generated.generatedAt),
        });
      }

      insight = inserted;
    }

    const formattedInsight = {
      id: insight.id,
      summary: insight.summary,
      patterns: insight.patterns,
      suggestions: insight.suggestions,
      generatedAt: insight.generated_at,
      periodDays: insight.period_days,
    };

    return NextResponse.json({
      insight: formattedInsight,
      canRegenerate: canRegenerateInsights(insight.generated_at),
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/insights:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
