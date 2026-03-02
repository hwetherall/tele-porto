import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioBlob = formData.get('audio')

    if (!audioBlob || !(audioBlob instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    // Forward to Groq Whisper API
    const groqFormData = new FormData()
    groqFormData.append('file', audioBlob, 'recording.webm')
    groqFormData.append('model', 'whisper-large-v3')
    groqFormData.append('language', 'pt')
    groqFormData.append('response_format', 'json')

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: groqFormData,
      }
    )

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq API error:', errorText)
      return NextResponse.json(
        { success: false, error: 'Transcription service error' },
        { status: 502 }
      )
    }

    const result = await groqResponse.json()

    return NextResponse.json({
      success: true,
      transcript: result.text ?? '',
      confidence: null,
    })
  } catch (error) {
    console.error('Transcribe route error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
