import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateInsights, canRegenerateInsights } from '@/lib/insights';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get the most recent insight to check rate limiting
    const { data: lastInsight } = await supabase
      .from('nutrition_insights')
      .select('generated_at')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    const lastGeneratedAt = lastInsight?.generated_at || null;

    if (!canRegenerateInsights(lastGeneratedAt)) {
      const nextAvailable = new Date(lastGeneratedAt!);
      nextAvailable.setHours(nextAvailable.getHours() + 6);

      return NextResponse.json(
        {
          error: 'Rate limit: insights can only be regenerated every 6 hours',
          nextAvailableAt: nextAvailable.toISOString(),
        },
        { status: 429 }
      );
    }

    // Generate new insights
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
      console.error('Error inserting regenerated insight:', insertError);
      return NextResponse.json(
        { error: 'Failed to save insights' },
        { status: 500 }
      );
    }

    const formattedInsight = {
      id: inserted.id,
      summary: inserted.summary,
      patterns: inserted.patterns,
      suggestions: inserted.suggestions,
      generatedAt: inserted.generated_at,
      periodDays: inserted.period_days,
    };

    return NextResponse.json({
      insight: formattedInsight,
      message: 'Insights regenerated successfully',
    });
  } catch (err) {
    console.error('Unexpected error in POST /api/insights/regenerate:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
