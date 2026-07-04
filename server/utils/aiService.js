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


const ASSISTANT_SYSTEM_PROMPT = `You are CollabFlow's AI assistant — a helpful, direct project management copilot embedded in a Kanban-based team tool.

You help users with:
- Planning projects and breaking ideas into tasks
- Analyzing their current tasks (overdue, priorities, workload)
- Answering questions about their workspace, projects, and tasks
- Creating tasks directly when asked

You have access to the user's current workspace context, which will be provided as JSON before their message.

When the user asks you to CREATE TASKS (e.g. "add a task for X", "create 3 tasks for the login feature", "break this into tasks"), respond with a JSON action block on its own line, wrapped exactly like this:

<action>
{"type": "create_tasks", "projectId": "PROJECT_ID_HERE", "tasks": [{"title": "...", "description": "...", "priority": "low|medium|high"}]}
</action>

Then continue your normal conversational reply below it, explaining what you did.

If the user hasn't specified which project, ask them to clarify instead of guessing, unless there's only one project in context — then use that one.

For all other requests (questions, advice, analysis), just respond normally in plain text — no action block needed.

Be concise, direct, and practical. Avoid generic fluff.`;



export const chatWithAssistant = async ({ messages, context }) => {
  const contextMessage = {
    role: 'system',
    content: `Current workspace context:\n${JSON.stringify(context, null, 2)}`,
  };

  const allMessages = [
    { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
    contextMessage,
    ...messages,
  ];

  const totalChars = allMessages.reduce((sum, m) => sum + m.content.length, 0);
  

  const completion = await getClient().chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: allMessages,
    max_tokens: 1000,
  });

  return completion.choices[0].message.content.trim();
};