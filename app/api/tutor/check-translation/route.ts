import { NextRequest, NextResponse } from 'next/server'

interface CheckTranslationBody {
  userAnswer: string
  expectedAnswer: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckTranslationBody = await request.json()
    const { userAnswer, expectedAnswer } = body

    if (!userAnswer || !expectedAnswer) {
      return NextResponse.json(
        { success: false, error: 'userAnswer and expectedAnswer are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      // Fallback: simple normalized comparison
      const normalize = (s: string) =>
        s.toLowerCase().trim()
          .replace(/[.!?,;:]/g, '')
          .replace(/\s+/g, ' ')
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      const correct = normalize(userAnswer) === normalize(expectedAnswer)
      return NextResponse.json({
        correct,
        feedback: correct
          ? 'Correct!'
          : `Expected: ${expectedAnswer}`,
      })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tele-porto.vercel.app',
        'X-Title': 'Tele-Porto',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: `You are evaluating a Portuguese translation exercise.
The expected answer is "${expectedAnswer}". The user wrote "${userAnswer}".
Is this correct or acceptably close? Reply ONLY with JSON: { "correct": boolean, "feedback": string }.
Be lenient on accent marks but strict on verb conjugation.
If correct, feedback should be a brief encouragement.
If incorrect, feedback should show the correct answer and briefly explain why.`,
          },
          {
            role: 'user',
            content: userAnswer,
          },
        ],
        max_tokens: 150,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      // Fallback on AI error
      const normalize = (s: string) =>
        s.toLowerCase().trim()
          .replace(/[.!?,;:]/g, '')
          .replace(/\s+/g, ' ')
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      const correct = normalize(userAnswer) === normalize(expectedAnswer)
      return NextResponse.json({
        correct,
        feedback: correct ? 'Correct!' : `Expected: ${expectedAnswer}`,
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? ''

    // Parse JSON from the AI response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({
          correct: Boolean(parsed.correct),
          feedback: String(parsed.feedback || ''),
        })
      }
    } catch {
      // JSON parse failed
    }

    // Final fallback
    const normalize = (s: string) =>
      s.toLowerCase().trim()
        .replace(/[.!?,;:]/g, '')
        .replace(/\s+/g, ' ')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const correct = normalize(userAnswer) === normalize(expectedAnswer)
    return NextResponse.json({
      correct,
      feedback: correct ? 'Correct!' : `Expected: ${expectedAnswer}`,
    })
  } catch (error) {
    console.error('Check translation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
