import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { RecognizedFood } from '@/types/nutrition'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, userId } = body

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a nutrition expert AI. Analyze food images and identify all visible foods with their estimated portions and nutritional content. Respond ONLY with a valid JSON array. Do not include any markdown formatting, code fences, or explanatory text. Each item in the array must have these exact fields:
- name (string): food name
- portion (number): numeric quantity
- unit (string): one of "grams", "oz", "cups", "serving", "ml", "tbsp", "tsp", "piece", "slice"
- calories (number): estimated calories for the given portion
- protein_g (number): grams of protein
- carbs_g (number): grams of carbohydrates  
- fat_g (number): grams of fat
- confidence (number): confidence level between 0 and 1

Example response format:
[{"name":"Grilled Chicken Breast","portion":150,"unit":"grams","calories":248,"protein_g":46,"carbs_g":0,"fat_g":5,"confidence":0.9}]`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please identify all the foods in this image and estimate their portions and nutritional content. Return ONLY a JSON array.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    })

    const rawResponse = response.choices[0]?.message?.content || ''

    // Parse JSON from response, handling potential markdown code fences
    let jsonString = rawResponse.trim()
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    let parsedFoods: any[]
    try {
      parsedFoods = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', jsonString)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse AI response. The image may not contain recognizable food items.',
        },
        { status: 422 }
      )
    }

    if (!Array.isArray(parsedFoods)) {
      return NextResponse.json(
        { success: false, error: 'AI returned unexpected data format' },
        { status: 422 }
      )
    }

    const foods: RecognizedFood[] = parsedFoods.map((item: any) => ({
      id: uuidv4(),
      name: String(item.name || 'Unknown food'),
      portion: Number(item.portion || 100),
      unit: String(item.unit || 'grams'),
      calories: Math.round(Number(item.calories || 0)),
      protein: Math.round(Number(item.protein_g || 0) * 10) / 10,
      carbs: Math.round(Number(item.carbs_g || 0) * 10) / 10,
      fat: Math.round(Number(item.fat_g || 0) * 10) / 10,
      confidence: Math.min(1, Math.max(0, Number(item.confidence || 0.5))),
    }))

    return NextResponse.json({
      success: true,
      foods,
      rawResponse,
    })
  } catch (error: any) {
    console.error('Error analyzing photo:', error)

    if (error?.status === 429) {
      return NextResponse.json(
        { success: false, error: 'AI service is busy. Please try again in a moment.' },
        { status: 429 }
      )
    }

    if (error?.status === 401) {
      return NextResponse.json(
        { success: false, error: 'AI service configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to analyze the image. Please try again.',
      },
      { status: 500 }
    )
  }
}
