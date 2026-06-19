import { useState, useRef, useEffect, useCallback } from 'react';
import NexData from '../../data/NexData';
import { buildSystemPrompt, sendMessage } from '../../services/geminiService';
import '../../styles/ai-assistant.css';

/* ── Quick-question chips shown at the bottom ── */
const QUICK_CHIPS = [
  'How is my GPA?',
  'My weakest subject?',
  'Am I at risk of low attendance?',
  "Today's classes?",
  'Give me a study plan',
  'Pending tasks?',
];

/* ── Welcome message the AI sends on first open ── */
const WELCOME_MSG = (name) =>
  `Hi ${name}! 👋 I'm Nexora AI — your personal academic assistant. I can see your marks, attendance, schedule, and tasks. How can I help you today?`;

/* ─────────────────────────────────────────────────────────
   Helper: render markdown-style text (bold, bullets, etc.)
───────────────────────────────────────────────────────── */
function RenderMessage({ text }) {
  // Simple markdown-ish renderer: **bold**, bullet lines
  const lines = text.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        // Bullet point
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          const content = line.trim().slice(2);
          return (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
              <span style={{ color: '#4f8ef7', flexShrink: 0, marginTop: 1 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }
        // Empty line → spacer
        if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
        // Regular line
        return (
          <p key={i} style={{ margin: '0 0 4px' }}
            dangerouslySetInnerHTML={{ __html: formatInline(line) }}
          />
        );
      })}
    </div>
  );
}

function formatInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f1f5f9">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

/* ─────────────────────────────────────────────────────────
   Main AiAssistant Component
───────────────────────────────────────────────────────── */
export default function AiAssistant({ user }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState(null); // null = not initialized
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]); // conversation history for Gemini

  /* Build academic context from NexData */
  const buildContext = useCallback(() => {
    const subjects = NexData.getSubjects();
    const marks = NexData.getMarksForStudent(user.id).map(m => ({
      ...m,
      grade: NexData.marksToGrade(Math.round((m.marks / m.maxMarks) * 100)),
    }));
    const attendance = NexData.getAttendanceForStudent(user.id);
    const overallAttendance = NexData.calcAttendance(user.id);
    const gpa = NexData.calcGPA(user.id);

    const allTimetable = NexData.getTimetable();
    const myTimetable = NexData.getMyTimetable(user.id);
    const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    const todayClasses = [
      ...allTimetable.filter(t => t.day === today),
      ...myTimetable.filter(t => t.day === today),
    ].sort((a, b) => a.startTime.localeCompare(b.startTime));

    const tasks = NexData.getTasks(user.id);
    const notifications = NexData.getNotifications().slice(0, 5);

    return { gpa, attendance, overallAttendance, marks, subjects, timetable: allTimetable, todayClasses, tasks, notifications };
  }, [user.id]);

  /* Check API key on mount */
  useEffect(() => {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!key || key === 'YOUR_OPENROUTER_KEY_HERE') {
      setHasApiKey(false);
    }
  }, []);

  /* Initialize messages when panel opens for first time */
  useEffect(() => {
    if (open && messages === null) {
      const firstName = user.name.split(' ')[0];
      setMessages([
        { id: 1, role: 'ai', text: WELCOME_MSG(firstName) },
      ]);
    }
  }, [open, messages, user.name]);

  /* Scroll to bottom on new messages */
  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, loading, open]);

  /* Focus input when opened */
  useEffect(() => {
    if (open && !closing) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, closing]);

  const handleOpen = () => {
    setOpen(true);
    setClosing(false);
    setShowBadge(false);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  };

  const handleToggle = () => {
    if (open) handleClose();
    else handleOpen();
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setError(null);

    // Add user message to UI
    const userMsg = { id: Date.now(), role: 'user', text: msg };
    setMessages(prev => [...(prev || []), userMsg]);

    setLoading(true);

    try {
      // Build the system prompt with latest data
      const context = buildContext();
      const systemPrompt = buildSystemPrompt(user, context);

      // Send to Gemini
      const aiText = await sendMessage(systemPrompt, historyRef.current, msg);

      // Save to conversation history
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', text: msg },
        { role: 'model', text: aiText },
      ];
      // Limit history to last 10 exchanges to avoid token overflow
      if (historyRef.current.length > 20) {
        historyRef.current = historyRef.current.slice(-20);
      }

      // Add AI response to UI
      const aiMsg = { id: Date.now() + 1, role: 'ai', text: aiText };
      setMessages(prev => [...(prev || []), aiMsg]);
    } catch (err) {
      let errorText = 'Something went wrong. Please try again.';
      if (err.message === 'NO_API_KEY') {
        errorText = 'API key not set. Add your Gemini key to the .env file.';
        setHasApiKey(false);
      } else if (err.message?.includes('API_KEY_INVALID')) {
        errorText = 'Invalid API key. Please check your VITE_GEMINI_API_KEY in .env';
      } else if (err.message?.includes('quota')) {
        errorText = 'API quota exceeded. Please try again later.';
      }
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (chip) => {
    handleSend(chip);
  };

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <>
      {/* ── Floating Chat Panel ── */}
      {(open || closing) && (
        <div
          className={`ai-panel ${closing ? 'ai-panel-exit' : 'ai-panel-enter'}`}
          role="dialog"
          aria-label="Nexora AI Assistant"
          aria-modal="false"
        >
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-icon">
              <i className="fas fa-robot" />
            </div>
            <div className="ai-header-info">
              <div className="ai-header-name">Nexora AI</div>
              <div className="ai-header-status">
                <span className={`ai-status-dot ${loading ? 'thinking' : ''}`} />
                {loading ? 'Thinking…' : 'Online — Reading your data'}
              </div>
            </div>
            <button className="ai-header-close" onClick={handleClose} title="Close">
              <i className="fas fa-times" />
            </button>
          </div>

          {/* No API key setup screen */}
          {!hasApiKey ? (
            <div className="ai-setup-box">
              <i className="fas fa-key" />
              <h4>API Key Required</h4>
              <p>
                To activate Nexora AI, add your OpenRouter API key to the <code>.env</code> file in the project root:
              </p>
              <code style={{ display: 'block', padding: '10px 12px', marginBottom: 12, textAlign: 'left', lineHeight: 1.7 }}>
                VITE_OPENROUTER_API_KEY=sk-or-v1-...
              </code>
              <p style={{ fontSize: '0.78rem' }}>
                Get a free key at{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer"
                  style={{ color: '#7db3f9', textDecoration: 'underline' }}>
                  openrouter.ai/keys
                </a>
                , then restart the dev server.
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="ai-messages">
                {(messages || []).map(msg => (
                  <div key={msg.id} className={`ai-msg ${msg.role}`}>
                    <div className="ai-msg-avatar">
                      {msg.role === 'ai' ? <i className="fas fa-robot" /> : initials}
                    </div>
                    <div className="ai-msg-bubble">
                      {msg.role === 'ai' ? <RenderMessage text={msg.text} /> : msg.text}
                    </div>
                  </div>
                ))}

                {/* Skeleton loader while AI is thinking (CO4 — Skeleton UIs) */}
                {loading && (
                  <div
                    className="ai-typing"
                    role="status"
                    aria-live="polite"
                    aria-label="Nexora AI is thinking"
                  >
                    <div style={{
                      background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)',
                      color: '#fff', width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, flexShrink: 0,
                    }}>
                      <i className="fas fa-robot" />
                    </div>
                    <div className="ai-typing-bubble" style={{ flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <div className="ai-skeleton-line" style={{ width: '80%', height: 11 }} />
                      <div className="ai-skeleton-line" style={{ width: '60%', height: 11 }} />
                      <div className="ai-skeleton-line" style={{ width: '40%', height: 11 }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Error */}
              {error && (
                <div className="ai-error-msg">
                  <i className="fas fa-exclamation-circle" />
                  {error}
                </div>
              )}

              {/* Quick-question chips (show only when just welcome msg) */}
              {messages && messages.length <= 1 && (
                <div className="ai-chips">
                  {QUICK_CHIPS.map(chip => (
                    <button
                      key={chip}
                      className="ai-chip"
                      onClick={() => handleChipClick(chip)}
                      disabled={loading}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input bar */}
              <div className="ai-input-bar">
                <input
                  ref={inputRef}
                  className="ai-input"
                  placeholder={`Ask about ${firstName}'s academics…`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  maxLength={500}
                />
                <button
                  className="ai-send-btn"
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  title="Send"
                >
                  <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Floating Action Button ── */}
      <button
        className={`ai-fab ${open ? 'open' : ''}`}
        onClick={handleToggle}
        title={open ? 'Close AI Assistant' : 'Open Nexora AI Assistant'}
        aria-label="AI Assistant"
      >
        {open
          ? <i className="fas fa-times" />
          : <i className="fas fa-robot" />
        }
        {!open && showBadge && <span className="ai-fab-badge" />}
      </button>
    </>
  );
}
