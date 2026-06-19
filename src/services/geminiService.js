/* ═══════════════════════════════════════════════════════
   geminiService.js — AI Service (OpenRouter backend)
   Uses OpenRouter's OpenAI-compatible API
   Model: google/gemini-2.0-flash-exp:free (falls back to
          meta-llama/llama-3.3-70b-instruct:free)
═══════════════════════════════════════════════════════ */

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Primary model — free Gemini 2.0 Flash via OpenRouter
const MODEL = 'google/gemini-2.0-flash-exp:free';

/**
 * Builds a rich system prompt from the student's live academic data.
 */
export function buildSystemPrompt(user, academicData) {
  const {
    gpa, attendance, overallAttendance,
    marks, subjects, todayClasses,
    tasks, notifications,
  } = academicData;

  const subjectLines = marks.map(m => {
    const sub = subjects.find(s => s.id === m.subjectId);
    const pct = Math.round((m.marks / m.maxMarks) * 100);
    const grade = m.grade;
    const att = attendance.find(a => a.subjectId === m.subjectId);
    const attPct = att ? Math.round((att.present / att.total) * 100) : 'N/A';
    return `  - ${sub?.name || 'Unknown'} (${sub?.code || ''}): ${m.marks}/${m.maxMarks} = ${pct}% (Grade: ${grade}) | Attendance: ${attPct}%`;
  }).join('\n');

  const todayLines = todayClasses.length > 0
    ? todayClasses.map(c => `  - ${c.startTime}–${c.endTime}: ${c.subjectName || c.title} @ ${c.room || 'TBA'}`).join('\n')
    : '  - No classes today';

  const pendingTasks = tasks.filter(t => !t.done);
  const taskLines = pendingTasks.length > 0
    ? pendingTasks.slice(0, 5).map(t =>
        `  - ${t.title}${t.dueDate ? ` (due: ${t.dueDate})` : ''} [${t.priority || 'normal'} priority]`
      ).join('\n')
    : '  - No pending tasks';

  const recentNotifs = notifications.slice(0, 3)
    .map(n => `  - [${n.type}] ${n.title}: ${n.body}`).join('\n');

  const worstSubject = marks.length > 0
    ? marks.reduce((w, m) => (m.marks / m.maxMarks < w.marks / w.maxMarks ? m : w))
    : null;
  const worstSubjectName = worstSubject
    ? subjects.find(s => s.id === worstSubject.subjectId)?.name || 'Unknown'
    : 'N/A';

  const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];

  return `You are Nexora AI, a friendly and knowledgeable academic assistant built into the Nexora Academic Intelligence Platform. You help students understand their performance, plan their studies, and stay on top of their schedule.

## Student Profile
- Name: ${user.name}
- Roll Number: ${user.rollNo || 'N/A'}
- Department: ${user.department || 'N/A'}
- Semester: ${user.semester || 'N/A'}

## Academic Performance
- Overall GPA: ${gpa.toFixed(2)} / 4.0
- Overall Attendance: ${overallAttendance}%
- Weakest Subject: ${worstSubjectName}

## Subject-wise Marks & Attendance
${subjectLines || '  - No marks data available'}

## Today's Schedule (${today})
${todayLines}

## Pending Tasks (${pendingTasks.length} total)
${taskLines}

## Recent Notifications
${recentNotifs || '  - No recent notifications'}

## Instructions
- Address the student by their first name (${user.name.split(' ')[0]})
- Be encouraging, supportive, and concise
- Use the actual data above to give personalized advice
- Reference specific numbers when discussing marks or attendance
- If attendance is below 80% in any subject, flag it proactively
- Format responses with bullet points or short paragraphs
- Keep responses under 200 words unless asked for a detailed plan
- If asked something outside academics, politely redirect`;
}

/**
 * Sends a chat message via OpenRouter and returns the AI response text.
 * @param {string} systemPrompt - Student's full context
 * @param {Array}  history      - [{role:'user'|'assistant', text:string}]
 * @param {string} userMessage  - New user message
 */
export async function sendMessage(systemPrompt, history, userMessage) {
  if (!API_KEY || API_KEY === 'YOUR_OPENROUTER_KEY_HERE') {
    throw new Error('NO_API_KEY');
  }

  // Build the messages array (OpenAI format)
  const messages = [
    { role: 'system', content: systemPrompt },
    // Conversation history
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role, // normalise 'model' → 'assistant'
      content: msg.text,
    })),
    // New user message
    { role: 'user', content: userMessage },
  ];

  const body = {
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 512,
    top_p: 0.9,
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': window.location.origin,   // required by OpenRouter
      'X-Title': 'Nexora Academic Assistant',   // shown in OpenRouter dashboard
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) throw new Error('Empty response from OpenRouter');
  return text;
}
