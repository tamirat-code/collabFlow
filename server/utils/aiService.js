import OpenAI from 'openai';

let _openai = null;
const openai = () => {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
};

export const summariseTask = async ({ title, description, comments, activity }) => {
  const commentText = comments.map(c => `- ${c.user?.name}: "${c.text}"`).join('\n') || 'No comments yet.';
  const activityText = activity.map(a => `- ${a.type}: ${JSON.stringify(a.meta)}`).join('\n') || 'No activity yet.';

  const { choices } = await openai().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 200,
    messages: [
      {
        role: 'system',
        content: 'You are a concise project management assistant. Summarise the task status in 2-3 sentences. Be direct and factual.',
      },
      {
        role: 'user',
        content: `Task: ${title}\nDescription: ${description || 'None'}\n\nComments:\n${commentText}\n\nActivity:\n${activityText}`,
      },
    ],
  });

  return choices[0].message.content.trim();
};

export const suggestSubtasks = async ({ title, description }) => {
  const { choices } = await openai().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [
      {
        role: 'system',
        content: 'You are a project management assistant. Return ONLY a JSON array of 3-5 subtask title strings. No explanation, no markdown, just the array.',
      },
      {
        role: 'user',
        content: `Task: ${title}\nDescription: ${description || 'None'}\n\nSuggest subtasks.`,
      },
    ],
  });

  const raw = choices[0].message.content.trim();
  return JSON.parse(raw);
};

export const suggestPriority = async ({ title, description }) => {
  const { choices } = await openai().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 80,
    messages: [
      {
        role: 'system',
        content: 'You are a project management assistant. Return ONLY a JSON object with two keys: "priority" (one of: low, medium, high) and "reason" (one sentence). No markdown.',
      },
      {
        role: 'user',
        content: `Task: ${title}\nDescription: ${description || 'None'}`,
      },
    ],
  });

  const raw = choices[0].message.content.trim();
  return JSON.parse(raw);
};