import { NextRequest, NextResponse } from 'next/server';

// Use server-side env variable (no NEXT_PUBLIC_ prefix needed for API routes)
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(request: NextRequest) {
    try {
        const { message, context, history } = await request.json();

        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'demo-key') {
            // Fallback to intelligent mock responses when no API key
            const mockResponse = generateMockResponse(message, context);
            return NextResponse.json({ response: mockResponse });
        }

        // Build conversation history for Gemini
        const contents = [];

        // Add system context as first user message
        if (context) {
            contents.push({
                role: 'user',
                parts: [{ text: `[System Context]\n${context}\n\n[End of Context]\n\nPlease acknowledge you understand this context briefly.` }]
            });
            contents.push({
                role: 'model',
                parts: [{ text: 'I understand. I am TraceLens AI, ready to assist with this forensic investigation. I have analyzed the case data provided.' }]
            });
        }

        // Add conversation history
        if (history && history.length > 0) {
            history.forEach((msg: { role: string; content: string }) => {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            });
        }

        // Add the current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API Error:', errorData);
            // Fallback to mock on API error
            const mockResponse = generateMockResponse(message, context);
            return NextResponse.json({ response: mockResponse });
        }

        const data = await response.json();

        // Extract the response text
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'I apologize, but I could not generate a response. Please try again.';

        return NextResponse.json({ response: responseText });

    } catch (error) {
        console.error('Chat API Error:', error);
        // Fallback to mock response
        const mockResponse = generateMockResponse('', '');
        return NextResponse.json({ response: mockResponse });
    }
}

function generateMockResponse(message: string, context: string): string {
    const lowerMessage = message.toLowerCase();

    // Extract some context info
    const threatMatch = context?.match(/Threat Score: (\d+)/);
    const threatScore = threatMatch ? parseInt(threatMatch[1]) : 50;
    const targetMatch = context?.match(/Target: ([^\n]+)/);
    const target = targetMatch ? targetMatch[1] : 'the subject';

    if (lowerMessage.includes('breach') || lowerMessage.includes('leak')) {
        return `**Breach Analysis for ${target}**\n\nBased on my analysis of the detected breaches:\n\n• **Primary Concern:** Multiple data exposures detected across breach databases\n• **Exposed Data Types:** Email addresses, password hashes, personal information\n• **Risk Level:** ${threatScore > 60 ? 'HIGH' : threatScore > 30 ? 'MEDIUM' : 'LOW'}\n\n**Immediate Actions:**\n1. Change passwords on all affected accounts\n2. Enable 2FA where available\n3. Monitor for suspicious activity\n\nWould you like me to analyze specific breaches in detail?`;
    }

    if (lowerMessage.includes('profile') || lowerMessage.includes('social')) {
        return `**Social Profile Analysis for ${target}**\n\nI've identified several connected social profiles:\n\n• **Cross-Platform Presence:** Multiple accounts detected\n• **Username Patterns:** Consistent naming conventions observed\n• **Activity Level:** Active presence on major platforms\n\n**Key Insights:**\n- Profile information is publicly accessible\n- Consider privacy setting reviews\n- Username reuse indicates potential vulnerability\n\nNeed me to examine specific platforms?`;
    }

    if (lowerMessage.includes('recommend') || lowerMessage.includes('action') || lowerMessage.includes('what should')) {
        return `**Security Recommendations**\n\nBased on the threat score of **${threatScore}/100**, here are prioritized actions:\n\n🔴 **Critical:**\n- Immediately change compromised passwords\n- Enable 2FA on all accounts\n\n🟡 **Important:**\n- Review privacy settings on social media\n- Set up breach monitoring alerts\n- Consider using a password manager\n\n🟢 **Preventive:**\n- Use unique passwords per account\n- Regular security audits\n- Monitor dark web mentions\n\nWant me to elaborate on any recommendation?`;
    }

    if (lowerMessage.includes('risk') || lowerMessage.includes('threat') || lowerMessage.includes('danger')) {
        return `**Threat Assessment Summary**\n\n📊 **Overall Threat Score:** ${threatScore}/100\n\n**Risk Breakdown:**\n- Data Exposure: ${Math.min(100, threatScore + 10)}%\n- Digital Footprint: ${Math.max(0, threatScore - 5)}%\n- Breach Impact: ${threatScore}%\n\n**Classification:** ${threatScore > 70 ? '🔴 CRITICAL RISK' : threatScore > 40 ? '🟡 MODERATE RISK' : '🟢 LOW RISK'}\n\n**Assessment:**\n${threatScore > 70 ? 'Immediate action required. Multiple high-severity indicators detected.' : threatScore > 40 ? 'Elevated risk. Recommend security improvements.' : 'Relatively low risk profile. Continue monitoring.'}\n\nNeed a detailed breakdown of any risk factor?`;
    }

    // Default response
    return `**TraceLens AI Analysis**\n\nI'm analyzing the investigation data for **${target}** with a current threat score of **${threatScore}/100**.\n\n**Available Analysis Options:**\n• Ask about **breaches** - Data leak analysis\n• Ask about **profiles** - Social media presence\n• Ask about **risk** - Threat assessment\n• Ask for **recommendations** - Security actions\n\nHow can I assist with this investigation?`;
}
