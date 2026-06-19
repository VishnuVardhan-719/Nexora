import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../components/ui/Toast';
import NexoraLogo from '../../components/ui/NexoraLogo';
import NexData from '../../data/NexData';
import '../../styles/app.css';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend);

const VIEWS = [
  { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { id: 'students', icon: 'fa-users', label: 'Students' },
  { id: 'marks', icon: 'fa-edit', label: 'Marks' },
  { id: 'timetable', icon: 'fa-calendar-alt', label: 'Timetable' },
  { id: 'notifications', icon: 'fa-bell', label: 'Notifications' },
  { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics' },
  { id: 'reports', icon: 'fa-file-alt', label: 'Reports' },
  { id: 'settings', icon: 'fa-cog', label: 'Settings' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); showToast('Logged out', 'info'); navigate('/'); };
  const switchView = (v) => { setView(v); setSidebarOpen(false); };

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
          <div className="sidebar-section">Admin</div>
          {VIEWS.map(v => (
            <div key={v.id} className={`sidebar-item ${view === v.id ? 'active' : ''}`} onClick={() => switchView(v.id)}>
              <i className={`fas ${v.icon}`} /> {v.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg,#f87171,#fbbf24)' }}>AD</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
            <button className="sidebar-logout" onClick={handleLogout} title="Logout"><i className="fas fa-sign-out-alt" /></button>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'flex' }}><i className="fas fa-bars" /></button>
            <div>
              <div className="topbar-page-title">{VIEWS.find(v => v.id === view)?.label}</div>
              <div className="topbar-page-sub">Admin Portal</div>
            </div>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn" onClick={() => switchView('notifications')}><i className="fas fa-bell" /></button>
            <button className="topbar-btn" onClick={() => switchView('settings')}><i className="fas fa-cog" /></button>
          </div>
        </header>

        <div className="app-content">
          {view === 'dashboard' && <AdminDashView />}
          {view === 'students' && <StudentsManager />}
          {view === 'marks' && <MarksManager />}
          {view === 'timetable' && <TimetableManager />}
          {view === 'notifications' && <NotifManager />}
          {view === 'analytics' && <AdminAnalytics />}
          {view === 'reports' && <AdminReports />}
          {view === 'settings' && <AdminSettings user={user} />}
        </div>
      </div>
    </div>
  );
}

/* ════════════ Admin Dashboard ════════════ */
function AdminDashView() {
  const students = NexData.getStudents();
  const avgGPA = students.length ? (students.reduce((s, st) => s + NexData.calcGPA(st.id), 0) / students.length).toFixed(2) : 0;
  const avgAtt = students.length ? (students.reduce((s, st) => s + NexData.calcAttendance(st.id), 0) / students.length).toFixed(1) : 0;
  const atRisk = students.filter(s => NexData.calcGPA(s.id) < 2.0 || NexData.calcAttendance(s.id) < 65).length;

  const deptCounts = {};
  students.forEach(s => { deptCounts[s.department || 'Unknown'] = (deptCounts[s.department || 'Unknown'] || 0) + 1; });

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Admin Dashboard</h1>
        <p className="view-subtitle">Institution overview</p>
      </div>
      <div className="stats-row">
        <StatCard icon="fa-users" color="#4f8ef7" label="Total Students" value={students.length} />
        <StatCard icon="fa-graduation-cap" color="#34d399" label="Average GPA" value={avgGPA} />
        <StatCard icon="fa-calendar-check" color="#22d3ee" label="Avg Attendance" value={`${avgAtt}%`} />
        <StatCard icon="fa-exclamation-triangle" color="#f87171" label="At-Risk" value={atRisk} />
      </div>

      <div className="dash-grid-2">
        <div className="card">
          <div className="mini-title"><i className="fas fa-building" /> Department Breakdown</div>
          {Object.entries(deptCounts).map(([dept, count]) => (
            <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.88rem' }}>
              <span>{dept}</span>
              <span className="badge badge-blue">{count}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="mini-title"><i className="fas fa-bolt" /> Quick Actions</div>
          <div className="quick-actions-grid">
            <button className="quick-action-btn"><i className="fas fa-user-plus" style={{ background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} /> Add Student</button>
            <button className="quick-action-btn"><i className="fas fa-edit" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} /> Manage Marks</button>
            <button className="quick-action-btn"><i className="fas fa-bullhorn" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} /> Send Notice</button>
            <button className="quick-action-btn"><i className="fas fa-download" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} /> Export Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: `${color}1a`, border: `1px solid ${color}33` }}>
        <i className={`fas ${icon}`} style={{ color }} />
      </div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}

/* ════════════ Students Manager ════════════ */
function StudentsManager() {
  const [students, setStudents] = useState(NexData.getStudents());
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', rollNo: '', department: '', semester: '' });

  const filtered = students.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()) || s.email.toLowerCase().includes(filter.toLowerCase()));

  const openAdd = () => { setEditStudent(null); setForm({ name: '', email: '', rollNo: '', department: '', semester: '' }); setShowModal(true); };
  const openEdit = (s) => { setEditStudent(s); setForm({ name: s.name, email: s.email, rollNo: s.rollNo, department: s.department, semester: s.semester }); setShowModal(true); };

  const saveStudent = () => {
    const users = NexData.getUsers();
    if (editStudent) {
      const idx = users.findIndex(u => u.id === editStudent.id);
      if (idx >= 0) { users[idx] = { ...users[idx], ...form }; }
    } else {
      users.push({ id: NexData.genId(), ...form, password: 'student123', role: 'student', joinedAt: new Date().toISOString().split('T')[0] });
    }
    NexData.saveUsers(users);
    setStudents(NexData.getStudents());
    setShowModal(false);
    showToast(editStudent ? 'Student updated' : 'Student added', 'success');
  };

  const deleteStudent = (id) => {
    if (!confirm('Delete this student?')) return;
    const users = NexData.getUsers().filter(u => u.id !== id);
    NexData.saveUsers(users);
    setStudents(NexData.getStudents());
    showToast('Student deleted', 'success');
  };

  return (
    <div>
      <div className="view-header"><h1 className="view-title">Student Management</h1></div>
      <div className="action-bar">
        <div className="topbar-search" style={{ position: 'relative' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 12 }} />
          <input placeholder="Search students..." value={filter} onChange={e => setFilter(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '7px 14px 7px 33px', color: 'var(--white)', fontSize: '0.82rem', outline: 'none', width: 240 }} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus" /> Add Student</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Student</th><th>Roll No</th><th>Department</th><th>GPA</th><th>Attendance</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="table-name-cell">
                    <div className="table-avatar">{s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                    <div><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{s.email}</div></div>
                  </div>
                </td>
                <td>{s.rollNo}</td>
                <td>{s.department}</td>
                <td><span className="badge badge-blue">{NexData.calcGPA(s.id).toFixed(2)}</span></td>
                <td>{NexData.calcAttendance(s.id)}%</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)} style={{ marginRight: 6 }}><i className="fas fa-edit" /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteStudent(s.id)}><i className="fas fa-trash" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
            <h3>{editStudent ? 'Edit Student' : 'Add Student'}</h3>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">Roll No</label><input className="form-input" value={form.rollNo} onChange={e => setForm({...form, rollNo: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Semester</label><input className="form-input" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">Department</label><select className="form-select" value={form.department} onChange={e => setForm({...form, department: e.target.value})}><option value="">Select</option><option>Computer Science</option><option>Electronics</option><option>Mechanical</option><option>Civil</option><option>Electrical</option></select></div>
            <button className="btn btn-primary" onClick={saveStudent} style={{ width: '100%', marginTop: 10 }}>{editStudent ? 'Update' : 'Add'} Student</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════ Marks Manager ════════════ */
function MarksManager() {
  const [marks, setMarks] = useState(NexData.getMarks());
  const students = NexData.getStudents();
  const subjects = NexData.getSubjects();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentId: '', subjectId: '', marks: '', maxMarks: '100' });

  const addMark = () => {
    const all = NexData.getMarks();
    all.push({ id: NexData.genId(), ...form, marks: parseInt(form.marks), maxMarks: parseInt(form.maxMarks), semester: '6' });
    NexData.saveMarks(all);
    setMarks(NexData.getMarks());
    setShowModal(false);
    showToast('Mark added', 'success');
  };

  const deleteMark = (id) => {
    const all = NexData.getMarks().filter(m => m.id !== id);
    NexData.saveMarks(all);
    setMarks(NexData.getMarks());
    showToast('Mark deleted', 'success');
  };

  return (
    <div>
      <div className="view-header"><h1 className="view-title">Marks Management</h1></div>
      <div className="action-bar"><button className="btn btn-primary btn-sm" onClick={() => { setForm({ studentId: '', subjectId: '', marks: '', maxMarks: '100' }); setShowModal(true); }}><i className="fas fa-plus" /> Add Marks</button></div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Student</th><th>Subject</th><th>Marks</th><th>%</th><th>Grade</th><th>Actions</th></tr></thead>
          <tbody>
            {marks.map(m => {
              const st = students.find(s => s.id === m.studentId);
              const sub = subjects.find(s => s.id === m.subjectId);
              const pct = Math.round((m.marks / m.maxMarks) * 100);
              return (
                <tr key={m.id}>
                  <td>{st?.name || 'Unknown'}</td>
                  <td>{sub?.name || 'Unknown'}</td>
                  <td>{m.marks}/{m.maxMarks}</td>
                  <td>{pct}%</td>
                  <td><span className={`badge ${pct >= 90 ? 'badge-green' : pct >= 75 ? 'badge-blue' : pct >= 60 ? 'badge-yellow' : 'badge-red'}`}>{NexData.marksToGrade(pct)}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteMark(m.id)}><i className="fas fa-trash" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
            <h3>Add Marks</h3>
            <div className="form-group"><label className="form-label">Student</label><select className="form-select" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})}><option value="">Select</option>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Subject</label><select className="form-select" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">Marks</label><input className="form-input" type="number" value={form.marks} onChange={e => setForm({...form, marks: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Max Marks</label><input className="form-input" type="number" value={form.maxMarks} onChange={e => setForm({...form, maxMarks: e.target.value})} /></div>
            </div>
            <button className="btn btn-primary" onClick={addMark} style={{ width: '100%', marginTop: 10 }}>Add Marks</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════ Timetable Manager ════════════ */
function TimetableManager() {
  const timetable = NexData.getTimetable();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const subjects = NexData.getSubjects();

  return (
    <div>
      <div className="view-header"><h1 className="view-title">Timetable Management</h1></div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Room</th><th>Faculty</th></tr></thead>
          <tbody>
            {timetable.sort((a,b) => days.indexOf(a.day) - days.indexOf(b.day) || a.startTime.localeCompare(b.startTime)).map((t, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{t.day}</td>
                <td>{t.startTime} – {t.endTime}</td>
                <td>{t.subjectName}</td>
                <td>{t.room}</td>
                <td>{t.faculty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ════════════ Notification Manager ════════════ */
function NotifManager() {
  const [notifs, setNotifs] = useState(NexData.getNotifications());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'info' });

  const addNotif = () => {
    const all = NexData.getNotifications();
    all.push({ id: NexData.genId(), ...form, createdAt: new Date().toISOString(), readBy: [] });
    NexData.saveNotifications(all);
    setNotifs(NexData.getNotifications());
    setShowModal(false);
    showToast('Notification created', 'success');
  };

  const deleteNotif = (id) => {
    const all = NexData.getNotifications().filter(n => n.id !== id);
    NexData.saveNotifications(all);
    setNotifs(NexData.getNotifications());
    showToast('Notification deleted', 'success');
  };

  const typeColor = { info: '#4f8ef7', warning: '#fbbf24', alert: '#f87171', success: '#34d399' };

  return (
    <div>
      <div className="view-header"><h1 className="view-title">Manage Notifications</h1></div>
      <div className="action-bar"><button className="btn btn-primary btn-sm" onClick={() => { setForm({ title: '', body: '', type: 'info' }); setShowModal(true); }}><i className="fas fa-plus" /> Create Notification</button></div>

      {notifs.map(n => (
        <div className="notif-item" key={n.id}>
          <div className="notif-icon" style={{ background: `${typeColor[n.type]}1a`, color: typeColor[n.type] }}>
            <i className={`fas fa-${n.type === 'info' ? 'info-circle' : n.type === 'warning' ? 'exclamation-triangle' : n.type === 'alert' ? 'exclamation-circle' : 'check-circle'}`} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="notif-title">{n.title}</div>
            <div className="notif-body">{n.body}</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => deleteNotif(n.id)}><i className="fas fa-trash" /></button>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times" /></button>
            <h3>Create Notification</h3>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Message</label><textarea className="form-input" rows={3} value={form.body} onChange={e => setForm({...form, body: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="info">Info</option><option value="warning">Warning</option><option value="alert">Alert</option><option value="success">Success</option></select></div>
            <button className="btn btn-primary" onClick={addNotif} style={{ width: '100%', marginTop: 10 }}>Create</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════ Admin Analytics ════════════ */
function AdminAnalytics() {
  const students = NexData.getStudents();
  const subjects = NexData.getSubjects();

  const deptGPA = {};
  students.forEach(s => {
    const dept = s.department || 'Unknown';
    if (!deptGPA[dept]) deptGPA[dept] = [];
    deptGPA[dept].push(NexData.calcGPA(s.id));
  });

  const barData = {
    labels: Object.keys(deptGPA),
    datasets: [{
      label: 'Avg GPA',
      data: Object.values(deptGPA).map(arr => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)),
      backgroundColor: ['#4f8ef780', '#22d3ee80', '#a78bfa80', '#fbbf2480', '#f8717180'],
      borderColor: ['#4f8ef7', '#22d3ee', '#a78bfa', '#fbbf24', '#f87171'],
      borderWidth: 1, borderRadius: 6,
    }],
  };

  const gradeAll = {};
  NexData.getMarks().forEach(m => {
    const g = NexData.marksToGrade(Math.round((m.marks / m.maxMarks) * 100));
    gradeAll[g] = (gradeAll[g] || 0) + 1;
  });

  const doughnutData = {
    labels: Object.keys(gradeAll),
    datasets: [{ data: Object.values(gradeAll), backgroundColor: ['#34d399', '#4f8ef7', '#22d3ee', '#fbbf24', '#f97316', '#f87171', '#ef4444'], borderWidth: 0 }],
  };

  return (
    <div>
      <div className="view-header"><h1 className="view-title">Institution Analytics</h1></div>
      <div className="g-2">
        <div className="chart-card">
          <div className="chart-title"><i className="fas fa-chart-bar" style={{ color: '#4f8ef7' }} /> Department-wise GPA</div>
          <div className="chart-canvas-wrap">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } } } }} />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title"><i className="fas fa-chart-pie" style={{ color: '#34d399' }} /> Overall Grade Distribution</div>
          <div className="chart-canvas-wrap">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16 } } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════ Admin Reports ════════════ */
function AdminReports() {
  const students = NexData.getStudents();
  return (
    <div>
      <div className="view-header"><h1 className="view-title">Institution Reports</h1></div>
      <div className="report-export-bar">
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Export:</span>
        <button className="btn btn-primary btn-sm" onClick={() => showToast('PDF exported (demo)', 'success')}><i className="fas fa-file-pdf" /> PDF</button>
        <button className="btn btn-ghost btn-sm" onClick={() => showToast('CSV exported (demo)', 'success')}><i className="fas fa-file-csv" /> CSV</button>
      </div>
      <div className="report-section">
        <div className="report-title"><i className="fas fa-users" /> All Students Report</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Roll No</th><th>Department</th><th>GPA</th><th>Attendance</th><th>Status</th></tr></thead>
            <tbody>
              {students.map(s => {
                const gpa = NexData.calcGPA(s.id);
                const att = NexData.calcAttendance(s.id);
                const risk = gpa < 2.0 || att < 65;
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.rollNo}</td>
                    <td>{s.department}</td>
                    <td>{gpa.toFixed(2)}</td>
                    <td>{att}%</td>
                    <td><span className={`badge ${risk ? 'badge-red' : 'badge-green'}`}>{risk ? 'At Risk' : 'Good'}</span></td>
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

/* ════════════ Admin Settings ════════════ */
function AdminSettings({ user }) {
  return (
    <div>
      <div className="view-header"><h1 className="view-title">Admin Settings</h1></div>
      <div className="settings-section">
        <div className="settings-title"><i className="fas fa-user-shield" /> Admin Profile</div>
        <div className="settings-row"><div className="settings-row-left"><div className="settings-row-label">Name</div><div className="settings-row-desc">{user?.name}</div></div></div>
        <div className="settings-row"><div className="settings-row-left"><div className="settings-row-label">Email</div><div className="settings-row-desc">{user?.email}</div></div></div>
        <div className="settings-row"><div className="settings-row-left"><div className="settings-row-label">Role</div><div className="settings-row-desc">Administrator</div></div></div>
      </div>
      <div className="settings-section">
        <div className="settings-title"><i className="fas fa-database" /> Data Management</div>
        <div className="settings-row">
          <div className="settings-row-left"><div className="settings-row-label">Reset All Data</div><div className="settings-row-desc">Clear all localStorage data and re-seed</div></div>
          <button className="btn btn-danger btn-sm" onClick={() => { localStorage.clear(); window.location.reload(); }}>Reset</button>
        </div>
      </div>
    </div>
  );
}
