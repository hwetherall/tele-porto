import type { SM2Rating, SM2Result, SRCard } from './types'

// ============================================================
// SM-2 Spaced Repetition Algorithm
// ============================================================
// Based on the SuperMemo 2 algorithm by Piotr Wozniak.
// Ratings: 0=blackout, 1=wrong again, 2=wrong but remembered,
//          3=correct but hard, 4=correct, 5=perfect

const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5

function addDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function intervalToBox(intervalDays: number): 1 | 2 | 3 | 4 | 5 | 6 {
  if (intervalDays <= 0) return 1
  if (intervalDays <= 1) return 2
  if (intervalDays <= 3) return 3
  if (intervalDays <= 7) return 4
  if (intervalDays <= 14) return 5
  return 6
}

export function reviewCard(card: SRCard, rating: SM2Rating): SM2Result {
  let { ease_factor, interval_days } = card

  if (rating < 3) {
    // Failed: reset to beginning
    interval_days = 1
    // Don't lower ease factor on first failure, but do on repeated failures
  } else {
    // Passed
    if (card.times_seen === 0 || card.box === 1) {
      interval_days = 1
    } else if (interval_days <= 1) {
      interval_days = 3
    } else {
      interval_days = Math.round(interval_days * ease_factor)
    }

    // Adjust ease factor based on rating
    // EF' = EF + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    ease_factor = ease_factor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    ease_factor = Math.max(MIN_EASE_FACTOR, ease_factor)
  }

  const box = rating < 3 ? 1 : intervalToBox(interval_days)
  const next_review = rating < 3 ? addDays(0) : addDays(interval_days)

  return {
    box,
    ease_factor: parseFloat(ease_factor.toFixed(2)),
    interval_days,
    next_review,
  }
}

export function getInitialCardState(): Omit<SM2Result, 'next_review'> & { next_review: string } {
  return {
    box: 1,
    ease_factor: DEFAULT_EASE_FACTOR,
    interval_days: 0,
    next_review: addDays(0), // Due today
  }
}

export function isCardDue(card: SRCard): boolean {
  const today = new Date().toISOString().split('T')[0]
  return card.next_review <= today
}

// Convert a rating from binary correct/incorrect to SM-2 scale
export function binaryToRating(correct: boolean): SM2Rating {
  return correct ? 4 : 1
}
