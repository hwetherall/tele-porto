import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { reviewCard, binaryToRating } from '@/lib/sm2'
import type { SRCard } from '@/lib/types'

// PATCH /api/sr-cards — update a card after review
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId, correct } = body as { cardId: string; correct: boolean }

    if (!cardId || typeof correct !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'cardId and correct are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Fetch current card state
    const { data: card, error: fetchError } = await supabase
      .from('sr_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (fetchError || !card) {
      return NextResponse.json(
        { success: false, error: 'Card not found' },
        { status: 404 }
      )
    }

    const rating = binaryToRating(correct)
    const result = reviewCard(card as SRCard, rating)

    const { error: updateError } = await supabase
      .from('sr_cards')
      .update({
        box: result.box,
        ease_factor: result.ease_factor,
        interval_days: result.interval_days,
        next_review: result.next_review,
        times_seen: (card.times_seen ?? 0) + 1,
        times_correct: (card.times_correct ?? 0) + (correct ? 1 : 0),
      })
      .eq('id', cardId)

    if (updateError) {
      console.error('SR card update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update card' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('SR cards route error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
