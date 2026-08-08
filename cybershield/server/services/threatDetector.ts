import { Type } from '@google/genai';
import { ai } from './geminiClient.js';
import { ThreatAnalysisResult, RiskScore } from '../../src/types.js';

export async function analyzeThreat(
  text: string,
  imageBuffer?: Buffer,
  mimeType?: string
): Promise<ThreatAnalysisResult> {
  if (ai) {
    try {
      const parts: any[] = [];

      if (imageBuffer && mimeType) {
        parts.push({
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType
          }
        });
        parts.push({
          text: `Perform OCR on this screenshot, extract any text messages, DMs, comments, or post contents, and classify online abuse, harassment, coercion, explicit content, or threats.`
        });
      } else {
        parts.push({
          text: `Analyze the following text message/post for online harassment, stalking, sexual violence, extortion, or safety threats: "${text}"`
        });
      }

      const promptSystem = `You are CyberShield AI Safety Auditor. Analyze the message/image for cyber harassment, threats, explicit content, blackmail/extortion, stalking, or neutral behavior.
Categorize into one of: 'harassment', 'threat', 'sexual', 'stalking', 'neutral'.
Assess risk as 'Low', 'Medium', 'High', or 'Critical'. Critical is reserved for direct physical violence, blackmail/extortion, explicit non-consensual sharing threats, or active stalking.
Extract specific toxic phrases. Provide a supportive, advisory explanation and practical safety steps.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: { parts },
        config: {
          systemInstruction: promptSystem,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "One of 'harassment', 'threat', 'sexual', 'stalking', 'neutral'"
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence decimal score from 0.0 to 1.0'
              },
              risk_score: {
                type: Type.STRING,
                description: "Risk tier: 'Low', 'Medium', 'High', or 'Critical'"
              },
              toxic_phrases: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              explanation: {
                type: Type.STRING
              },
              recommended_actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['category', 'confidence', 'risk_score', 'toxic_phrases', 'explanation', 'recommended_actions']
          }
        }
      });

      const jsonText = response.text?.trim();
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        return {
          category: (['harassment', 'threat', 'sexual', 'stalking', 'neutral'].includes(parsed.category)
            ? parsed.category
            : 'harassment') as any,
          confidence: Math.min(1.0, Math.max(0.5, parsed.confidence || 0.88)),
          risk_score: (['Low', 'Medium', 'High', 'Critical'].includes(parsed.risk_score)
            ? parsed.risk_score
            : 'Medium') as RiskScore,
          toxic_phrases: parsed.toxic_phrases || [],
          explanation: parsed.explanation || 'AI analysis completed.',
          recommended_actions: parsed.recommended_actions || ['Document evidence with timestamps']
        };
      }
    } catch (err) {
      console.warn('Gemini Threat Detection failed or API key error, utilizing heuristic fallback:', err);
    }
  }

  // Heuristic Fallback Scorer
  return heuristicThreatScorer(text || 'Screenshot upload with text content');
}

function heuristicThreatScorer(input: string): ThreatAnalysisResult {
  const text = input.toLowerCase();
  const criticalKeywords = ['pay', 'extort', 'blackmail', 'publish your photos', 'kill', 'leak your', 'find where you live', 'track you down'];
  const highKeywords = ['slut', 'whore', 'destroy you', 'bitch', 'ruin your life', 'fake profile', 'exposed'];
  const mediumKeywords = ['annoying', 'ugly', 'stop ignoring', 'reply me', 'loser', 'cheap'];

  let foundCritical = criticalKeywords.filter(k => text.includes(k));
  let foundHigh = highKeywords.filter(k => text.includes(k));
  let foundMedium = mediumKeywords.filter(k => text.includes(k));

  if (foundCritical.length > 0) {
    return {
      category: 'threat',
      confidence: 0.94,
      risk_score: 'Critical',
      toxic_phrases: foundCritical,
      explanation: 'Extortion and physical/digital safety threat keywords detected indicating active coercion or harm.',
      recommended_actions: [
        'Preserve all message metadata and screenshots',
        'Trigger Emergency Alert to trusted contacts',
        'File an immediate report on the cybercrime reporting portal (1930 / cybercrime.gov.in)'
      ]
    };
  } else if (foundHigh.length > 0) {
    return {
      category: 'harassment',
      confidence: 0.88,
      risk_score: 'High',
      toxic_phrases: foundHigh,
      explanation: 'Severe abusive language and target defamation detected.',
      recommended_actions: [
        'Block and report suspect account on source platform',
        'Generate official CyberShield evidence record'
      ]
    };
  } else if (foundMedium.length > 0) {
    return {
      category: 'harassment',
      confidence: 0.76,
      risk_score: 'Medium',
      toxic_phrases: foundMedium,
      explanation: 'Persistent unwanted or derogatory contact detected.',
      recommended_actions: [
        'Set profile privacy controls',
        'Keep record of continued communication'
      ]
    };
  }

  return {
    category: 'neutral',
    confidence: 0.90,
    risk_score: 'Low',
    toxic_phrases: [],
    explanation: 'No explicit threat, hate speech, or extortion patterns identified in text sample.',
    recommended_actions: ['Monitor situation if messages escalate']
  };
}
