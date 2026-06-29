import Groq from 'groq-sdk';

let _client = null;
const getClient = () => {
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _client;
};

const ask = async (systemPrompt, userPrompt) => {
  const completion = await getClient().chat.completions.create({
    model:    'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
    max_tokens: 500,
  });
  return completion.choices[0].message.content.trim();
};

export const summariseTask = async ({ title, description, comments, activity }) => {
  const commentText  = comments.map(c => `- ${c.author?.name}: "${c.text}"`).join('\n') || 'No comments yet.';
  const activityText = activity.map(a => `- ${a.type}: ${JSON.stringify(a.meta)}`).join('\n') || 'No activity yet.';

  return ask(
    'You are a concise project management assistant. Summarise the task status in 2-3 sentences. Be direct and factual.',
    `Task: ${title}\nDescription: ${description || 'None'}\n\nComments:\n${commentText}\n\nActivity:\n${activityText}`
  );
};

export const suggestSubtasks = async ({ title, description }) => {
  const raw = await ask(
    'You are a project management assistant. Return ONLY a JSON array of 3-5 subtask title strings. No explanation, no markdown, just the raw array.',
    `Task: ${title}\nDescription: ${description || 'None'}`
  );
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

export const suggestPriority = async ({ title, description }) => {
  const raw = await ask(
    'You are a project management assistant. Return ONLY a JSON object with two keys: "priority" (one of: low, medium, high) and "reason" (one sentence). No markdown, just the raw object.',
    `Task: ${title}\nDescription: ${description || 'None'}`
  );
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};