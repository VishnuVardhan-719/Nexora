import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../components/ui/Toast';
import NexoraLogo from '../../components/ui/NexoraLogo';
import NexData from '../../data/NexData';
import AiAssistant from '../../components/ui/AiAssistant';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import '../../styles/app.css';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' } } } },
  scales: {
    x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};

const VIEWS = [
  { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { id: 'subjects', icon: 'fa-book', label: 'Subjects' },
  { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics' },
  { id: 'attendance', icon: 'fa-calendar-check', label: 'Attendance' },
  { id: 'timetable', icon: 'fa-calendar-alt', label: 'Timetable' },
  { id: 'tasks', icon: 'fa-tasks', label: 'Tasks' },
  { id: 'notifications', icon: 'fa-bell', label: 'Notifications' },
  { id: 'reports', icon: 'fa-file-alt', label: 'Reports' },
  { id: 'settings', icon: 'fa-cog', label: 'Settings' },
];

const SUBJECT_COLORS = [
  '#4f8ef7','#22d3ee','#a78bfa','#34d399','#fbbf24',
  '#f87171','#fb923c','#e879f9','#84cc16','#38bdf8',
];

const SUBJECT_ICONS = [
  { icon: 'fas fa-book', label: 'Book' },
  { icon: 'fas fa-flask', label: 'Science' },
  { icon: 'fas fa-calculator', label: 'Math' },
  { icon: 'fas fa-laptop-code', label: 'Code' },
  { icon: 'fas fa-atom', label: 'Physics' },
  { icon: 'fas fa-globe', label: 'Geography' },
  { icon: 'fas fa-music', label: 'Music' },
  { icon: 'fas fa-paint-brush', label: 'Art' },
  { icon: 'fas fa-heartbeat', label: 'Biology' },
  { icon: 'fas fa-history', label: 'History' },
];

/* ════════════ Modal Backdrop ════════════ */
function Modal({ open, onClose, children, width = 480 }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ════════════ Main Layout ════════════ */
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleLogout = () => { logout(); showToast('Logged out', 'info'); navigate('/'); };
  const switchView = (v) => { setView(v); setSidebarOpen(false); };

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U';
  const unreadNotifs = NexData.getNotifications().filter(n => !n.readBy?.includes(user?.id)).length;
  const pendingTasks = NexData.getTasks(user?.id).filter(t => !t.done).length;

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-mob-overlay open" onClick={() => setSidebarOpen(false)} />}

      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="nexora-logo">
            <div className="nexora-logo-icon"><NexoraLogo /></div>
            <span>Nexora</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Main</div>
          {VIEWS.map(v => (
            <div
              key={v.id}
              className={`sidebar-item ${view === v.id ? 'active' : ''}`}
              onClick={() => switchView(v.id)}
            >
              <i className={`fas ${v.icon}`} />
              {v.label}
              {v.id === 'notifications' && unreadNotifs > 0 && (
                <span className="sidebar-badge">{unreadNotifs}</span>
              )}
              {v.id === 'tasks' && pendingTasks > 0 && (
                <span className="sidebar-badge" style={{ background: '#a78bfa' }}>{pendingTasks}</span>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">Student</div>
            </div>
            <button className="sidebar-logout" onClick={handleLogout} title="Logout">
              <i className="fas fa-sign-out-alt" />
            </button>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'flex' }}>
              <i className="fas fa-bars" />
            </button>
            <div>
              <div className="topbar-page-title">{VIEWS.find(v => v.id === view)?.label}</div>
              <div className="topbar-page-sub">Student Portal</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <i className="fas fa-search" />
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="topbar-btn" onClick={() => switchView('notifications')}>
              <i className="fas fa-bell" />
              {unreadNotifs > 0 && <span className="topbar-btn-dot" />}
            </button>
            <button className="topbar-btn" onClick={() => switchView('settings')}>
              <i className="fas fa-cog" />
            </button>
          </div>
        </header>

        <div className="app-content">
          {view === 'dashboard'      && <DashView user={user} switchView={switchView} />}
          {view === 'subjects'       && <SubjectsView user={user} />}
          {view === 'analytics'      && <AnalyticsView user={user} />}
          {view === 'attendance'     && <AttendanceView user={user} />}
          {view === 'timetable'      && <TimetableView user={user} />}
          {view === 'tasks'          && <TasksView user={user} />}
          {view === 'notifications'  && <NotificationsView user={user} />}
          {view === 'reports'        && <ReportsView user={user} />}
          {view === 'settings'       && <SettingsView user={user} />}
        </div>
      </div>

      {/* ── AI Assistant floating widget (wrapped in ErrorBoundary — CO4) ── */}
      <ErrorBoundary fallbackLabel="AI Assistant">
        <AiAssistant user={user} />
      </ErrorBoundary>
    </div>
  );
}

/* ════════════ Dashboard View ════════════ */
function DashView({ user, switchView }) {
  // ── useMemo: prevent re-running expensive computations on every render (CO5) ──
  const gpa     = useMemo(() => NexData.calcGPA(user.id),         [user.id]);
  const att     = useMemo(() => NexData.calcAttendance(user.id),  [user.id]);
  const subjects = useMemo(() => NexData.getSubjects(),           []);
  const marks   = useMemo(() => NexData.getMarksForStudent(user.id), [user.id]);

  // Rank: sorts entire student roster — memoized so it only re-runs when user changes
  const rank = useMemo(() =>
    NexData.getStudents()
      .sort((a, b) => NexData.calcGPA(b.id) - NexData.calcGPA(a.id))
      .findIndex(s => s.id === user.id) + 1
  , [user.id]);

  const today = useMemo(() =>
    ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
  , []);

  const allToday = useMemo(() => {
    const timetable   = NexData.getTimetable();
    const myTimetable = NexData.getMyTimetable(user.id);
    return [
      ...timetable.filter(t => t.day === today),
      ...myTimetable.filter(t => t.day === today),
    ].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [user.id, today]);

  const pendingTasks = useMemo(() => NexData.getTasks(user.id).filter(t => !t.done), [user.id]);
  const mySubjects   = useMemo(() => NexData.getMySubjects(user.id), [user.id]);

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="view-subtitle">Here's your academic overview</p>
      </div>

      <div className="stats-row">
        <StatCard icon="fa-graduation-cap" color="#4f8ef7" label="GPA" value={gpa.toFixed(2)} change="+0.12" up />
        <StatCard icon="fa-calendar-check" color="#22d3ee" label="Attendance" value={`${att}%`} change="+2.1%" up />
        <StatCard icon="fa-trophy" color="#fbbf24" label="Class Rank" value={`#${rank}`} change="Top 10%" up />
        <StatCard icon="fa-tasks" color="#a78bfa" label="Pending Tasks" value={pendingTasks.length} change={`${NexData.getTasks(user.id).length} total`} />
      </div>

      <div className="dash-grid-2">
        <div className="card">
          <div className="mini-title"><i className="fas fa-calendar" /> Today's Schedule — {today}</div>
          {allToday.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No classes today! 🎉</p>
          ) : (
            allToday.map((c, i) => (
              <div className="today-class-item" key={i}>
                <div className="class-time-block">
                  <div className="class-time-start">{c.startTime}</div>
                  <div className="class-time-end">{c.endTime}</div>
                </div>
                <div>
                  <div className="class-name">{c.subjectName || c.title}</div>
                  <div className="class-meta">{c.room} {c.faculty ? `· ${c.faculty}` : ''}{c.isPersonal ? ' · Personal' : ''}</div>
                </div>
                {c.isPersonal && <span className="badge badge-blue" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>My Entry</span>}
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="mini-title"><i className="fas fa-list-check" /> Pending Tasks</div>
          {pendingTasks.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>All done! Great work 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingTasks.slice(0, 4).map(task => (
                <div key={task.id} className="dash-task-item">
                  <div className="dash-task-dot" style={{ background: task.priority === 'high' ? '#f87171' : task.priority === 'medium' ? '#fbbf24' : '#34d399' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{task.title}</div>
                    {task.dueDate && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{task.dueDate}</div>}
                  </div>
                </div>
              ))}
              {pendingTasks.length > 4 && (
                <button className="btn btn-ghost btn-sm" onClick={() => switchView('tasks')} style={{ marginTop: 4 }}>
                  +{pendingTasks.length - 4} more tasks
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="dash-grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="mini-title"><i className="fas fa-bolt" /> Quick Actions</div>
          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={() => switchView('subjects')}>
              <i className="fas fa-book" style={{ background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              My Subjects
            </button>
            <button className="quick-action-btn" onClick={() => switchView('timetable')}>
              <i className="fas fa-calendar-alt" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              Timetable
            </button>
            <button className="quick-action-btn" onClick={() => switchView('tasks')}>
              <i className="fas fa-tasks" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              Add Task
            </button>
            <button className="quick-action-btn" onClick={() => switchView('analytics')}>
              <i className="fas fa-chart-bar" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              Analytics
            </button>
          </div>
        </div>
        <div className="card">
          <div className="mini-title"><i className="fas fa-book-open" /> My Added Subjects</div>
          {mySubjects.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No personal subjects added yet.<br />
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => switchView('subjects')}>+ Add Subject</button>
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {mySubjects.map(s => (
                <span key={s.id} className="my-subject-chip" style={{ borderColor: s.color + '55', color: s.color, background: s.color + '15' }}>
                  <i className={s.icon} style={{ fontSize: 11 }} /> {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, label, value, change, up }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: `${color}1a`, border: `1px solid ${color}33` }}>
        <i className={`fas ${icon}`} style={{ color }} />
      </div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {change && (
        <div className={`stat-card-change ${up ? 'up' : ''}`}>
          {up && <i className="fas fa-arrow-up" style={{ fontSize: 10 }} />} {change}
        </div>
      )}
    </div>
  );
}

/* ════════════ Subjects View ════════════ */
function SubjectsView({ user }) {
  const subjects = NexData.getSubjects();
  const marks = NexData.getMarksForStudent(user.id);
  const attendance = NexData.getAttendanceForStudent(user.id);
  const [mySubjects, setMySubjects] = useState(NexData.getMySubjects(user.id));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', credits: '3', icon: 'fas fa-book', color: '#4f8ef7', faculty: '', room: '', notes: '' });
  const [tab, setTab] = useState('official'); // 'official' | 'my'

  const handleAdd = () => {
    if (!form.name.trim()) { showToast('Subject name required', 'error'); return; }
    NexData.addMySubject(user.id, form);
    setMySubjects(NexData.getMySubjects(user.id));
    setShowModal(false);
    setForm({ name: '', code: '', credits: '3', icon: 'fas fa-book', color: '#4f8ef7', faculty: '', room: '', notes: '' });
    showToast('Subject added!', 'success');
  };

  const handleDelete = (id) => {
    NexData.deleteMySubject(user.id, id);
    setMySubjects(NexData.getMySubjects(user.id));
    showToast('Subject removed', 'info');
  };

  return (
    <div>
      <div className="view-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="view-title">Subjects</h1>
          <p className="view-subtitle">Official & personal subjects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus" /> Add Subject
        </button>
      </div>

      {/* Tabs */}
      <div className="seg-tabs" style={{ marginBottom: 20 }}>
        <button className={`seg-tab ${tab === 'official' ? 'active' : ''}`} onClick={() => setTab('official')}>
          <i className="fas fa-university" /> Official ({subjects.length})
        </button>
        <button className={`seg-tab ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>
          <i className="fas fa-user-edit" /> My Subjects ({mySubjects.length})
        </button>
      </div>

      {/* Official Subjects */}
      {tab === 'official' && (
        <div className="g-auto">
          {subjects.map(sub => {
            const m = marks.find(mk => mk.subjectId === sub.id);
            const a = attendance.find(at => at.subjectId === sub.id);
            const pct = m ? Math.round((m.marks / m.maxMarks) * 100) : 0;
            const grade = NexData.marksToGrade(pct);
            const attPct = a ? Math.round((a.present / a.total) * 100) : 0;
            const badgeClass = pct >= 90 ? 'badge-green' : pct >= 75 ? 'badge-blue' : pct >= 60 ? 'badge-yellow' : 'badge-red';

            return (
              <div className="subject-card" key={sub.id}>
                <div className="subject-card-top">
                  <div>
                    <div className="subject-name">{sub.name}</div>
                    <div className="subject-code">{sub.code} · {sub.credits} credits</div>
                  </div>
                  <span className={`badge ${badgeClass}`}>{grade}</span>
                </div>
                {m ? (
                  <>
                    <div className="subject-marks-row">
                      <div><span className="subject-marks-big">{m.marks}</span><span className="subject-marks-max">/{m.maxMarks}</span></div>
                      <div className="subject-pct" style={{ color: sub.color }}>{pct}%</div>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: sub.color }} />
                    </div>
                  </>
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 8 }}>No marks yet</p>
                )}
                <div className="subject-footer">
                  <div className="att-chip">
                    <i className="fas fa-user-check" style={{ fontSize: 11 }} />
                    {attPct}% attendance
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My Subjects */}
      {tab === 'my' && (
        <div>
          {mySubjects.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-book-open" />
              <h4>No personal subjects yet</h4>
              <p>Add subjects like extra classes, coaching, or electives.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                <i className="fas fa-plus" /> Add Your First Subject
              </button>
            </div>
          ) : (
            <div className="g-auto">
              {mySubjects.map(sub => (
                <div className="subject-card" key={sub.id} style={{ borderLeft: `3px solid ${sub.color}` }}>
                  <div className="subject-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: sub.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub.color, fontSize: 16, flexShrink: 0 }}>
                        <i className={sub.icon} />
                      </div>
                      <div>
                        <div className="subject-name">{sub.name}</div>
                        <div className="subject-code">{sub.code || 'Personal'} {sub.credits ? `· ${sub.credits} cr` : ''}</div>
                      </div>
                    </div>
                    <button className="icon-btn danger-hover" onClick={() => handleDelete(sub.id)} title="Remove">
                      <i className="fas fa-trash-alt" />
                    </button>
                  </div>
                  {sub.faculty && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 6 }}><i className="fas fa-chalkboard-teacher" style={{ marginRight: 5 }} />{sub.faculty}</div>}
                  {sub.room && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 3 }}><i className="fas fa-map-marker-alt" style={{ marginRight: 5 }} />{sub.room}</div>}
                  {sub.notes && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 8, fontStyle: 'italic' }}>{sub.notes}</div>}
                  <div className="subject-footer" style={{ marginTop: 10 }}>
                    <span className="my-subject-chip" style={{ borderColor: sub.color + '55', color: sub.color, background: sub.color + '15' }}>
                      Personal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} width={520}>
        <div className="modal-header">
          <div className="modal-title"><i className="fas fa-book" /> Add Personal Subject</div>
          <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input className="form-input" placeholder="e.g. Advanced Mathematics" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <input className="form-input" placeholder="e.g. MAT701" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Faculty / Teacher</label>
              <input className="form-input" placeholder="e.g. Prof. Sharma" value={form.faculty} onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Room / Location</label>
              <input className="form-input" placeholder="e.g. Room 204" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Credits</label>
              <input className="form-input" type="number" min="1" max="6" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker-row">
              {SUBJECT_COLORS.map(c => (
                <button key={c} className={`color-dot ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="icon-picker-row">
              {SUBJECT_ICONS.map(ic => (
                <button key={ic.icon} className={`icon-pick-btn ${form.icon === ic.icon ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, icon: ic.icon }))} title={ic.label}>
                  <i className={ic.icon} />
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} placeholder="Any notes about this subject..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd}><i className="fas fa-plus" /> Add Subject</button>
        </div>
      </Modal>
    </div>
  );
}

/* ════════════ Analytics View ════════════ */
function AnalyticsView({ user }) {
  const subjects = NexData.getSubjects();
  const marks = NexData.getMarksForStudent(user.id);

  const labels = marks.map(m => subjects.find(s => s.id === m.subjectId)?.name || 'Unknown');
  const scores = marks.map(m => Math.round((m.marks / m.maxMarks) * 100));
  const colors = marks.map(m => subjects.find(s => s.id === m.subjectId)?.color || '#4f8ef7');

  const barData = {
    labels,
    datasets: [{ label: 'Score %', data: scores, backgroundColor: colors.map(c => c + '80'), borderColor: colors, borderWidth: 1, borderRadius: 6 }],
  };

  const lineData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
    datasets: [{
      label: 'GPA Trend',
      data: [3.2, 3.4, 3.3, 3.6, 3.7, NexData.calcGPA(user.id)],
      borderColor: '#4f8ef7', backgroundColor: 'rgba(79,142,247,0.1)',
      fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#4f8ef7',
    }],
  };

  const radarData = {
    labels: labels.slice(0, 6),
    datasets: [{
      label: 'Skills',
      data: scores.slice(0, 6),
      backgroundColor: 'rgba(79,142,247,0.15)',
      borderColor: '#4f8ef7', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#4f8ef7',
    }],
  };

  const gradeDistribution = { A: 0, 'B+': 0, B: 0, 'C+': 0, C: 0, D: 0, F: 0 };
  scores.forEach(s => { gradeDistribution[NexData.marksToGrade(s)]++; });
  const doughnutData = {
    labels: Object.keys(gradeDistribution).filter(k => gradeDistribution[k] > 0),
    datasets: [{
      data: Object.values(gradeDistribution).filter(v => v > 0),
      backgroundColor: ['#34d399', '#4f8ef7', '#22d3ee', '#fbbf24', '#f97316', '#f87171', '#ef4444'],
      borderWidth: 0,
    }],
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Performance Analytics</h1>
        <p className="view-subtitle">Detailed performance insights powered by AI</p>
      </div>

      <div className="insight-box info" style={{ marginBottom: 20 }}>
        <i className="fas fa-brain" />
        <p><strong>AI Insight:</strong> Your performance shows an upward trend. Focus on {labels[scores.indexOf(Math.min(...scores))]} to boost your overall GPA.</p>
      </div>

      <div className="g-2" style={{ marginBottom: 20 }}>
        <div className="chart-card">
          <div className="chart-title"><i className="fas fa-chart-line" style={{ color: '#4f8ef7' }} /> GPA Trend</div>
          <div className="chart-canvas-wrap"><Line data={lineData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-title"><i className="fas fa-chart-bar" style={{ color: '#a78bfa' }} /> Subject Scores</div>
          <div className="chart-canvas-wrap"><Bar data={barData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} /></div>
        </div>
      </div>
      <div className="g-2">
        <div className="chart-card">
          <div className="chart-title"><i className="fas fa-crosshairs" style={{ color: '#22d3ee' }} /> Skill Distribution</div>
          <div className="chart-canvas-wrap"><Radar data={radarData} options={{ ...chartDefaults, scales: { r: { grid: { color: 'rgba(255,255,255,0.06)' }, angleLines: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#64748b', backdropColor: 'transparent' }, pointLabels: { color: '#94a3b8', font: { size: 10 } } } } }} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-title"><i className="fas fa-chart-pie" style={{ color: '#34d399' }} /> Grade Distribution</div>
          <div className="chart-canvas-wrap"><Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 16 } } } }} /></div>
        </div>
      </div>
    </div>
  );
}

/* ════════════ Attendance View ════════════ */
function AttendanceView({ user }) {
  const overall = NexData.calcAttendance(user.id);
  const records = NexData.getAttendanceForStudent(user.id);
  const subjects = NexData.getSubjects();

  const statusColor = overall >= 80 ? '#34d399' : overall >= 65 ? '#fbbf24' : '#f87171';
  const statusText = overall >= 80 ? 'Safe' : overall >= 65 ? 'Warning' : 'Critical';

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Attendance Tracker</h1>
        <p className="view-subtitle">Monitor your attendance across all subjects</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-label">Overall Attendance</div>
          <div className="stat-card-value" style={{ color: statusColor }}>{overall}%</div>
          <div className="stat-card-change" style={{ color: statusColor }}><i className="fas fa-circle" style={{ fontSize: 8 }} /> {statusText}</div>
        </div>
      </div>

      {overall < 80 && (
        <div className={`insight-box ${overall < 65 ? 'danger' : 'warn'}`} style={{ marginBottom: 20 }}>
          <i className="fas fa-exclamation-triangle" />
          <p>{overall < 65 ? 'Critical: Your attendance is below 65%. You may not be eligible for exams.' : 'Warning: Your attendance is below 80%. Try to attend more classes.'}</p>
        </div>
      )}

      <div className="card">
        <div className="mini-title"><i className="fas fa-list" /> Subject-wise Breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {records.map((r, i) => {
            const sub = subjects.find(s => s.id === r.subjectId);
            const pct = Math.round((r.present / r.total) * 100);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 120, fontWeight: 600, fontSize: '0.88rem' }}>{sub?.name || 'Unknown'}</div>
                <div style={{ flex: 1 }}>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: sub?.color || '#4f8ef7' }} /></div>
                </div>
                <div style={{ width: 50, textAlign: 'right', fontSize: '0.85rem', fontWeight: 700 }}>{pct}%</div>
                <div style={{ width: 70, fontSize: '0.75rem', color: 'var(--muted)' }}>{r.present}/{r.total}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ════════════ Timetable View ════════════ */
function TimetableView({ user }) {
  const officialTimetable = NexData.getTimetable();
  const [myEntries, setMyEntries] = useState(NexData.getMyTimetable(user.id));
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const mySubjects = NexData.getMySubjects(user.id);
  const officialSubjects = NexData.getSubjects();
  const allSubjectOptions = [
    ...officialSubjects.map(s => ({ id: s.id, name: s.name, color: s.color })),
    ...mySubjects.map(s => ({ id: s.id, name: s.name + ' (Personal)', color: s.color })),
  ];

  const [form, setForm] = useState({
    day: 'Monday', startTime: '09:00', endTime: '10:00',
    title: '', subjectId: '', room: '', faculty: '', color: '#4f8ef7', notes: '',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const times = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
  const subjects = NexData.getSubjects();

  const getAllEntries = () => [
    ...officialTimetable,
    ...myEntries.map(e => ({ ...e, isPersonal: true })),
  ];

  const getCell = (day, time) => {
    const all = getAllEntries();
    return all.filter(t => t.day === day && t.startTime === time);
  };

  const handleAdd = () => {
    if (!form.title.trim()) { showToast('Title required', 'error'); return; }
    if (form.startTime >= form.endTime) { showToast('End time must be after start time', 'error'); return; }

    const selectedSub = allSubjectOptions.find(s => s.id === form.subjectId);
    const entry = {
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      subjectName: form.title,
      title: form.title,
      room: form.room,
      faculty: form.faculty,
      color: selectedSub?.color || form.color,
      notes: form.notes,
      isPersonal: true,
    };
    NexData.addMyTimetableEntry(user.id, entry);
    setMyEntries(NexData.getMyTimetable(user.id));
    setShowModal(false);
    setForm({ day: 'Monday', startTime: '09:00', endTime: '10:00', title: '', subjectId: '', room: '', faculty: '', color: '#4f8ef7', notes: '' });
    showToast('Class added to timetable!', 'success');
  };

  const handleDelete = (id) => {
    NexData.deleteMyTimetableEntry(user.id, id);
    setMyEntries(NexData.getMyTimetable(user.id));
    showToast('Entry removed', 'info');
  };

  return (
    <div>
      <div className="view-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="view-title">Timetable</h1>
          <p className="view-subtitle">Weekly schedule — official + personal entries</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="seg-tabs">
            <button className={`seg-tab ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><i className="fas fa-th" /> Grid</button>
            <button className={`seg-tab ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><i className="fas fa-list" /> List</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus" /> Add Class
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#4f8ef7' }} /> Official Classes
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#a78bfa', border: '2px dashed #a78bfa' }} /> My Personal Entries
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <div className="tt-grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
            <div className="tt-header">Time</div>
            {days.map(d => <div className="tt-header" key={d}>{d}</div>)}
            {times.map(time => (
              <>
                <div className="tt-time-cell" key={`t-${time}`}>{time}</div>
                {days.map(day => {
                  const cells = getCell(day, time);
                  if (cells.length === 0) return <div className="tt-cell" key={`${day}-${time}`} />;
                  return (
                    <div className="tt-cell" key={`${day}-${time}`}>
                      {cells.map((cls, ci) => {
                        const sub = subjects.find(s => s.id === cls.subjectId);
                        const color = sub?.color || cls.color || '#4f8ef7';
                        return (
                          <div key={ci} className={`tt-class ${cls.isPersonal ? 'tt-class-personal' : ''}`} style={{ background: `${color}1a`, borderLeft: `3px solid ${color}`, marginBottom: ci < cells.length - 1 ? 3 : 0 }}>
                            <div className="tt-class-name" style={{ color }}>{cls.subjectName || cls.title}</div>
                            <div className="tt-class-meta">{cls.room}</div>
                            {cls.isPersonal && (
                              <button className="tt-del-btn" onClick={() => handleDelete(cls.id)} title="Remove"><i className="fas fa-times" /></button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div>
          {days.map(day => {
            const dayEntries = getAllEntries().filter(t => t.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
            if (dayEntries.length === 0) return null;
            return (
              <div key={day} className="card" style={{ marginBottom: 16 }}>
                <div className="mini-title"><i className="fas fa-calendar-day" /> {day}</div>
                {dayEntries.map((cls, i) => {
                  const sub = subjects.find(s => s.id === cls.subjectId);
                  const color = sub?.color || cls.color || '#4f8ef7';
                  return (
                    <div key={i} className="tt-list-item">
                      <div className="tt-list-time">{cls.startTime} – {cls.endTime}</div>
                      <div className="tt-list-dot" style={{ background: color }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cls.subjectName || cls.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
                          {cls.room && <span><i className="fas fa-map-marker-alt" style={{ marginRight: 4 }} />{cls.room}</span>}
                          {cls.faculty && <span style={{ marginLeft: 10 }}><i className="fas fa-chalkboard-teacher" style={{ marginRight: 4 }} />{cls.faculty}</span>}
                        </div>
                      </div>
                      {cls.isPersonal ? (
                        <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Personal</span>
                      ) : (
                        <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}>Official</span>
                      )}
                      {cls.isPersonal && (
                        <button className="icon-btn danger-hover" onClick={() => handleDelete(cls.id)} style={{ marginLeft: 8 }}>
                          <i className="fas fa-trash-alt" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {getAllEntries().length === 0 && (
            <div className="empty-state">
              <i className="fas fa-calendar-alt" />
              <h4>No timetable entries</h4>
              <p>Add your classes to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* My Personal Entries List */}
      {myEntries.length > 0 && viewMode === 'grid' && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="mini-title"><i className="fas fa-user-edit" /> My Personal Entries</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myEntries.map(e => (
              <div key={e.id} className="tt-list-item">
                <div className="tt-list-time">{e.day}: {e.startTime}–{e.endTime}</div>
                <div className="tt-list-dot" style={{ background: e.color || '#a78bfa' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{e.subjectName || e.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{e.room} {e.faculty ? `· ${e.faculty}` : ''}</div>
                </div>
                <button className="icon-btn danger-hover" onClick={() => handleDelete(e.id)}>
                  <i className="fas fa-trash-alt" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} width={540}>
        <div className="modal-header">
          <div className="modal-title"><i className="fas fa-calendar-plus" /> Add Class / Event</div>
          <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title / Subject Name *</label>
            <input className="form-input" placeholder="e.g. Mathematics Extra Class" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          {allSubjectOptions.length > 0 && (
            <div className="form-group">
              <label className="form-label">Link to Subject (optional)</label>
              <select className="form-input" value={form.subjectId} onChange={e => {
                const sub = allSubjectOptions.find(s => s.id === e.target.value);
                setForm(f => ({ ...f, subjectId: e.target.value, color: sub?.color || f.color, title: f.title || sub?.name || '' }));
              }}>
                <option value="">— Select subject —</option>
                {allSubjectOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Day *</label>
              <select className="form-input" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input className="form-input" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input className="form-input" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Room / Location</label>
              <input className="form-input" placeholder="e.g. Room 301" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Faculty / Teacher</label>
              <input className="form-input" placeholder="e.g. Dr. Sharma" value={form.faculty} onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker-row">
              {SUBJECT_COLORS.map(c => (
                <button key={c} className={`color-dot ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} placeholder="Any notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd}><i className="fas fa-plus" /> Add to Timetable</button>
        </div>
      </Modal>
    </div>
  );
}

/* ════════════ Tasks View ════════════ */
function TasksView({ user }) {
  const [tasks, setTasks] = useState(NexData.getTasks(user.id));
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'done'
  const [editTask, setEditTask] = useState(null);
  const mySubjects = NexData.getMySubjects(user.id);
  const officialSubjects = NexData.getSubjects();
  const allSubjects = [...officialSubjects, ...mySubjects];

  const blankForm = { title: '', description: '', dueDate: '', priority: 'medium', subjectId: '', type: 'assignment' };
  const [form, setForm] = useState(blankForm);

  const TASK_TYPES = ['assignment', 'exam', 'project', 'reading', 'revision', 'lab', 'other'];
  const PRIORITY_COLORS = { high: '#f87171', medium: '#fbbf24', low: '#34d399' };

  const refreshTasks = () => setTasks(NexData.getTasks(user.id));

  const handleAdd = () => {
    if (!form.title.trim()) { showToast('Title required', 'error'); return; }
    if (editTask) {
      NexData.updateTask(user.id, editTask.id, form);
      showToast('Task updated!', 'success');
    } else {
      NexData.addTask(user.id, form);
      showToast('Task added!', 'success');
    }
    refreshTasks();
    setShowModal(false);
    setForm(blankForm);
    setEditTask(null);
  };

  const toggleDone = (task) => {
    NexData.updateTask(user.id, task.id, { done: !task.done });
    refreshTasks();
    showToast(task.done ? 'Task marked pending' : 'Task completed! 🎉', task.done ? 'info' : 'success');
  };

  const handleDelete = (id) => {
    NexData.deleteTask(user.id, id);
    refreshTasks();
    showToast('Task deleted', 'info');
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({ title: task.title, description: task.description || '', dueDate: task.dueDate || '', priority: task.priority || 'medium', subjectId: task.subjectId || '', type: task.type || 'assignment' });
    setShowModal(true);
  };

  const filtered = tasks.filter(t => filter === 'all' ? true : filter === 'pending' ? !t.done : t.done);
  const pendingCount = tasks.filter(t => !t.done).length;
  const doneCount = tasks.filter(t => t.done).length;

  const isOverdue = (task) => task.dueDate && !task.done && new Date(task.dueDate) < new Date();

  return (
    <div>
      <div className="view-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="view-title">Tasks</h1>
          <p className="view-subtitle">Assignments, exams, and personal tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTask(null); setForm(blankForm); setShowModal(true); }}>
          <i className="fas fa-plus" /> Add Task
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-row" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ cursor: 'pointer', border: filter === 'all' ? '1px solid rgba(79,142,247,0.4)' : '' }} onClick={() => setFilter('all')}>
          <div className="stat-card-icon" style={{ background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)' }}>
            <i className="fas fa-tasks" style={{ color: '#4f8ef7' }} />
          </div>
          <div className="stat-card-label">All Tasks</div>
          <div className="stat-card-value">{tasks.length}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filter === 'pending' ? '1px solid rgba(251,191,36,0.4)' : '' }} onClick={() => setFilter('pending')}>
          <div className="stat-card-icon" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <i className="fas fa-clock" style={{ color: '#fbbf24' }} />
          </div>
          <div className="stat-card-label">Pending</div>
          <div className="stat-card-value">{pendingCount}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filter === 'done' ? '1px solid rgba(52,211,153,0.4)' : '' }} onClick={() => setFilter('done')}>
          <div className="stat-card-icon" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <i className="fas fa-check-circle" style={{ color: '#34d399' }} />
          </div>
          <div className="stat-card-label">Completed</div>
          <div className="stat-card-value">{doneCount}</div>
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-clipboard-check" />
          <h4>{filter === 'done' ? 'No completed tasks yet' : 'No tasks here!'}</h4>
          <p>{filter === 'done' ? 'Complete some tasks to see them here.' : 'Add assignments, exams, or personal tasks.'}</p>
          {filter !== 'done' && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditTask(null); setForm(blankForm); setShowModal(true); }}>
              <i className="fas fa-plus" /> Add Task
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(task => {
            const sub = allSubjects.find(s => s.id === task.subjectId);
            const overdue = isOverdue(task);
            return (
              <div key={task.id} className={`task-card ${task.done ? 'task-done' : ''} ${overdue ? 'task-overdue' : ''}`}>
                <button className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => toggleDone(task)}>
                  {task.done && <i className="fas fa-check" />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="task-title">{task.title}</div>
                  {task.description && <div className="task-desc">{task.description}</div>}
                  <div className="task-meta-row">
                    {task.type && (
                      <span className="task-type-chip"><i className="fas fa-tag" /> {task.type}</span>
                    )}
                    {sub && (
                      <span className="task-sub-chip" style={{ color: sub.color, background: sub.color + '15', borderColor: sub.color + '40' }}>
                        {sub.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={`task-due-chip ${overdue ? 'overdue' : ''}`}>
                        <i className="fas fa-calendar" /> {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div className="task-priority-dot" style={{ background: PRIORITY_COLORS[task.priority || 'medium'] }} title={task.priority} />
                  <button className="icon-btn" onClick={() => openEdit(task)} title="Edit"><i className="fas fa-pen" /></button>
                  <button className="icon-btn danger-hover" onClick={() => handleDelete(task.id)} title="Delete"><i className="fas fa-trash-alt" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Task Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditTask(null); setForm(blankForm); }} width={500}>
        <div className="modal-header">
          <div className="modal-title"><i className="fas fa-tasks" /> {editTask ? 'Edit Task' : 'Add Task'}</div>
          <button className="modal-close" onClick={() => { setShowModal(false); setEditTask(null); setForm(blankForm); }}><i className="fas fa-times" /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input className="form-input" placeholder="e.g. Data Structures Assignment 3" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} placeholder="Details about this task..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TASK_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Subject (optional)</label>
              <select className="form-input" value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}>
                <option value="">— None —</option>
                {allSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => { setShowModal(false); setEditTask(null); setForm(blankForm); }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd}>
            <i className={`fas ${editTask ? 'fa-save' : 'fa-plus'}`} /> {editTask ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ════════════ Notifications View ════════════ */
function NotificationsView({ user }) {
  const [notifs, setNotifs] = useState(NexData.getNotifications());

  const markRead = (id) => {
    const updated = notifs.map(n => {
      if (n.id === id && !n.readBy?.includes(user.id)) {
        return { ...n, readBy: [...(n.readBy || []), user.id] };
      }
      return n;
    });
    NexData.saveNotifications(updated);
    setNotifs(updated);
  };

  const typeIcon = { info: 'fa-info-circle', warning: 'fa-exclamation-triangle', alert: 'fa-exclamation-circle', success: 'fa-check-circle' };
  const typeColor = { info: '#4f8ef7', warning: '#fbbf24', alert: '#f87171', success: '#34d399' };

  const timeAgo = (iso) => {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Notifications</h1>
        <p className="view-subtitle">Announcements and alerts</p>
      </div>
      {notifs.map(n => {
        const isUnread = !n.readBy?.includes(user.id);
        return (
          <div className={`notif-item ${isUnread ? 'unread' : ''}`} key={n.id} onClick={() => markRead(n.id)} style={{ cursor: 'pointer' }}>
            <div className="notif-icon" style={{ background: `${typeColor[n.type]}1a`, color: typeColor[n.type] }}>
              <i className={`fas ${typeIcon[n.type]}`} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="notif-title">
                {n.title}
                {isUnread && <span className="notif-unread-dot" />}
              </div>
              <div className="notif-body">{n.body}</div>
              <div className="notif-meta">
                <span className="notif-time"><i className="fas fa-clock" /> {timeAgo(n.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════ Reports View ════════════ */
function ReportsView({ user }) {
  const gpa = NexData.calcGPA(user.id);
  const att = NexData.calcAttendance(user.id);
  const marks = NexData.getMarksForStudent(user.id);
  const subjects = NexData.getSubjects();

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Academic Reports</h1>
        <p className="view-subtitle">Generate and export your academic reports</p>
      </div>

      <div className="report-export-bar">
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Export Options:</span>
        <button className="btn btn-primary btn-sm" onClick={() => showToast('PDF report downloaded (demo)', 'success')}>
          <i className="fas fa-file-pdf" /> Download PDF
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => showToast('CSV exported (demo)', 'success')}>
          <i className="fas fa-file-csv" /> Export CSV
        </button>
      </div>

      <div className="report-section">
        <div className="report-title"><i className="fas fa-user" /> Student Summary</div>
        <div className="g-2">
          <div>
            <p style={{ fontSize: '0.85rem', marginBottom: 8 }}><strong>Name:</strong> {user.name}</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 8 }}><strong>Roll No:</strong> {user.rollNo}</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 8 }}><strong>Department:</strong> {user.department}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', marginBottom: 8 }}><strong>Semester:</strong> {user.semester}</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 8 }}><strong>GPA:</strong> {gpa.toFixed(2)}</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 8 }}><strong>Attendance:</strong> {att}%</p>
          </div>
        </div>
      </div>

      <div className="report-section">
        <div className="report-title"><i className="fas fa-chart-bar" /> Subject-wise Marks</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th><th>Code</th><th>Marks</th><th>Percentage</th><th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.map(m => {
                const sub = subjects.find(s => s.id === m.subjectId);
                const pct = Math.round((m.marks / m.maxMarks) * 100);
                return (
                  <tr key={m.id}>
                    <td>{sub?.name}</td>
                    <td>{sub?.code}</td>
                    <td>{m.marks}/{m.maxMarks}</td>
                    <td>{pct}%</td>
                    <td><span className={`badge ${pct >= 90 ? 'badge-green' : pct >= 75 ? 'badge-blue' : pct >= 60 ? 'badge-yellow' : 'badge-red'}`}>{NexData.marksToGrade(pct)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ════════════ Settings View ════════════ */
function SettingsView({ user }) {
  const [settings, setSettings] = useState(NexData.getSettings());

  const toggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    NexData.saveSettings(updated);
    showToast('Setting updated', 'success');
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Settings</h1>
        <p className="view-subtitle">Manage your preferences</p>
      </div>

      <div className="settings-section">
        <div className="settings-title"><i className="fas fa-user" /> Profile Information</div>
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-row-label">Full Name</div>
            <div className="settings-row-desc">{user.name}</div>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-row-label">Email</div>
            <div className="settings-row-desc">{user.email}</div>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-row-label">Department</div>
            <div className="settings-row-desc">{user.department || 'Not set'}</div>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-row-label">Roll Number</div>
            <div className="settings-row-desc">{user.rollNo || 'Not set'}</div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title"><i className="fas fa-bell" /> Notification Preferences</div>
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-row-label">Email Notifications</div>
            <div className="settings-row-desc">Receive email alerts for marks and announcements</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.emailNotifs} onChange={() => toggle('emailNotifs')} />
            <span className="toggle-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-row-label">Push Notifications</div>
            <div className="settings-row-desc">Browser push notifications for updates</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.pushNotifs} onChange={() => toggle('pushNotifs')} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>
    </div>
  );
}
