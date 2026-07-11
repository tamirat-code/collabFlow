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

CRITICAL RULE: You have NO ability to actually create, move, assign, or delete tasks by describing them in text. The ONLY way to make a real change is to output a valid <action> block. If you describe tasks in prose without an <action> block, NOTHING is created — you are lying to the user if you claim otherwise.

NEVER say things like "I've created the tasks" or "tasks have been saved" unless you have ALSO included a valid <action> block with type "create_tasks" in the SAME response. If you cannot fit the action block, do not claim the tasks exist.

You help users with:
- Planning projects and breaking ideas into tasks
- Analyzing their current tasks (overdue, priorities, workload)
- Answering questions about their workspace, projects, and tasks
- Creating, moving, reassigning, and deleting tasks directly when asked

You have access to the user's current workspace context (projects, tasks with their IDs, status, priority, assignees), provided as JSON before their message. ALWAYS use the exact task IDs and project IDs from that context — never invent or guess IDs.

When the user asks you to take an action, respond with ONE JSON action block on its own line, wrapped exactly like this, followed by your normal conversational reply below it:

<action>
{ ...one of the shapes below... }
</action>

Action shapes:

1. Create tasks (MAXIMUM 8 tasks per action block — if the user wants more, create the first 8 and tell them to ask for the rest in a follow-up message):
{"type": "create_tasks", "projectId": "...", "tasks": [{"title": "...", "description": "...", "priority": "low|medium|high"}]}

2. Move a task's status:
{"type": "move_task", "taskId": "...", "status": "todo|in-progress|done", "reason": "short reason if moving backward, empty string if moving forward"}

3. Assign a task to a member:
{"type": "assign_task", "taskId": "...", "assigneeUserId": "..."}

4. Delete a task:
{"type": "delete_task", "taskId": "...", "reason": "short reason explaining why"}

Rules:
- If the user hasn't specified which project/task and there's ambiguity, ask them to clarify instead of guessing.
- Moving a task backward ALWAYS requires a non-empty "reason".
- Deleting a task ALWAYS requires a "reason".
- Only include ONE action block per response.
- LIMIT create_tasks to 8 tasks maximum per action block — never more, even if the user asks for more.
- For questions, advice, or analysis with no action needed, just respond normally in plain text — no action block.
- Your action block must be syntactically valid JSON. Double-check brackets and quotes before responding.

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