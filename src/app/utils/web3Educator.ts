// DeepSeek API interfaces
interface DeepSeekRequest {
    model: string;
    messages: {
        role: 'system' | 'user';
        content: string;
    }[];
}

interface DeepSeekResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

// Web3 Education Response Types
interface Web3Response {
    content: string;
    codeExample?: {
        language: string;
        code: string;
    };
    followUpQuestions?: string[];
    documentationLinks?: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

// Web3 Education Prompt
const WEB3_EDUCATION_PROMPT = `You are an expert Web3 educator specializing in the Solana ecosystem. Your role is to help users understand Web3 concepts, development, and best practices. Follow these guidelines:

1. EXPERIENCE LEVEL DETECTION:
   - Beginner: No technical terms, simple analogies
   - Intermediate: Some technical terms with explanations
   - Advanced: Full technical depth with best practices

2. RESPONSE STRUCTURE:
   - Clear, concise explanation
   - Code examples when relevant (in appropriate language)
   - Follow-up questions to deepen understanding
   - Relevant documentation links

3. CODE EXAMPLES:
   - Use proper syntax highlighting
   - Include comments explaining key parts
   - Show best practices and security considerations
   - Focus on Solana ecosystem when relevant

4. FORMATTING:
   - Use markdown for code blocks
   - Include emojis for visual appeal
   - Break down complex concepts into steps
   - Use analogies for abstract concepts

5. FOLLOW-UP QUESTIONS:
   - Suggest 2-3 questions to explore related concepts
   - Questions should build on current topic
   - Include both theoretical and practical questions

Format your response as:
EXPERIENCE_LEVEL: [beginner|intermediate|advanced]
RESPONSE: [Your detailed explanation]
CODE: [Optional code example with language]
FOLLOW_UP: [2-3 follow-up questions]
DOCS: [Relevant documentation links]

Remember to:
- Be patient and encouraging
- Use analogies for complex concepts
- Include security best practices
- Focus on practical applications
- Keep responses concise but thorough`;

// Function to parse Web3 education response
function parseWeb3Response(content: string): Web3Response {
    const experienceLevelMatch = content.match(/EXPERIENCE_LEVEL:\s*(\w+)/i);
    const responseMatch = content.match(/RESPONSE:\s*([\s\S]*?)(?=CODE:|FOLLOW_UP:|DOCS:|$)/i);
    const codeMatch = content.match(/CODE:\s*```(\w+)\n([\s\S]*?)```/i);
    const followUpMatch = content.match(/FOLLOW_UP:\s*([\s\S]*?)(?=DOCS:|$)/i);
    const docsMatch = content.match(/DOCS:\s*([\s\S]*?)$/i);

    return {
        content: responseMatch ? responseMatch[1].trim() : '',
        codeExample: codeMatch ? {
            language: codeMatch[1].trim(),
            code: codeMatch[2].trim()
        } : undefined,
        followUpQuestions: followUpMatch ? 
            followUpMatch[1].split('\n')
                .map(q => q.trim())
                .filter(q => q.startsWith('-') || q.startsWith('*'))
                .map(q => q.replace(/^[-*]\s*/, ''))
                .filter(q => q.length > 0) : undefined,
        documentationLinks: docsMatch ? 
            docsMatch[1].split('\n')
                .map(link => link.trim())
                .filter(link => link.startsWith('-') || link.startsWith('*'))
                .map(link => link.replace(/^[-*]\s*/, ''))
                .filter(link => link.length > 0) : undefined,
        experienceLevel: (experienceLevelMatch?.[1]?.toLowerCase() as 'beginner' | 'intermediate' | 'advanced') || 'intermediate'
    };
}

// Main function to process Web3 education queries
export async function processWeb3Query(query: string): Promise<{
    success: boolean;
    response: Web3Response;
}> {
    try {
        const request: DeepSeekRequest = {
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: WEB3_EDUCATION_PROMPT },
                { role: 'user', content: query }
            ]
        };

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.statusText}`);
        }

        const data: DeepSeekResponse = await response.json();
        if (!data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from DeepSeek API');
        }

        const parsedResponse = parseWeb3Response(data.choices[0].message.content);

        return {
            success: true,
            response: parsedResponse
        };
    } catch (error) {
        console.error('Error in Web3 education:', error);
        return {
            success: false,
            response: {
                content: 'I encountered an error while processing your request. Please try again.',
                experienceLevel: 'beginner'
            }
        };
    }
} 