/* ═══════════════════════════════════════════════════════════════════
   NexData — localStorage Schema, Seed Data, CRUD Helpers
   Nexora Academic Intelligence Platform (React Migration)
═══════════════════════════════════════════════════════════════════ */

/* ── Keys ── */
const K = {
  USERS:         'nex_users',
  CURRENT:       'nex_current',
  MARKS:         'nex_marks',
  SUBJECTS:      'nex_subjects',
  ATTENDANCE:    'nex_attendance',
  TIMETABLE:     'nex_timetable',
  NOTIFICATIONS: 'nex_notifications',
  SETTINGS:      'nex_user_settings',
  MY_SUBJECTS:   'nex_my_subjects',
  MY_TIMETABLE:  'nex_my_timetable',
  TASKS:         'nex_tasks',
};

/* ── Storage helpers ── */
const get    = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const set    = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const getObj = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } };
const setObj = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const genId  = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ── Grade / GPA helpers ── */
export function marksToGrade(pct) {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B+';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C+';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

export function gradeToPoints(g) {
  return { A:4.0, 'B+':3.5, B:3.0, 'C+':2.5, C:2.0, D:1.0, F:0.0 }[g] ?? 0;
}

export function calcGPA(studentId) {
  const marks = get(K.MARKS).filter(m => m.studentId === studentId);
  if (!marks.length) return 0;
  const pts = marks.map(m => gradeToPoints(marksToGrade(Math.round((m.marks / m.maxMarks) * 100))));
  return +((pts.reduce((a, b) => a + b, 0) / pts.length).toFixed(2));
}

export function calcAttendance(studentId) {
  const recs = get(K.ATTENDANCE).filter(a => a.studentId === studentId);
  if (!recs.length) return 0;
  const present = recs.reduce((s, a) => s + a.present, 0);
  const total   = recs.reduce((s, a) => s + a.total,   0);
  return total ? +((present / total) * 100).toFixed(1) : 0;
}

/* ══════════════════════════════════════════
   SEED DATA
══════════════════════════════════════════ */
function seed() {
  if (localStorage.getItem('nex_seeded_v2')) return;

  const subjects = [
    { id: 's1', name: 'Mathematics',     code: 'MAT601', credits: 4, icon: 'fas fa-square-root-alt', color: '#4f8ef7' },
    { id: 's2', name: 'Physics',         code: 'PHY601', credits: 4, icon: 'fas fa-atom',            color: '#22d3ee' },
    { id: 's3', name: 'Chemistry',       code: 'CHE601', credits: 3, icon: 'fas fa-flask',           color: '#a78bfa' },
    { id: 's4', name: 'English',         code: 'ENG601', credits: 3, icon: 'fas fa-book-open',       color: '#34d399' },
    { id: 's5', name: 'Computer Science',code: 'CS601',  credits: 4, icon: 'fas fa-laptop-code',     color: '#fbbf24' },
    { id: 's6', name: 'Data Structures', code: 'CS602',  credits: 4, icon: 'fas fa-sitemap',         color: '#f87171' },
  ];

  const users = [
    { id:'u1', name:'Arjun Patel',  email:'arjun@nexora.edu', password:'student123', role:'student', rollNo:'CS2021001', department:'Computer Science', semester:'6', joinedAt:'2021-07-01' },
    { id:'u2', name:'Sara Mehta',   email:'sara@nexora.edu',  password:'student123', role:'student', rollNo:'CS2021002', department:'Computer Science', semester:'6', joinedAt:'2021-07-01' },
    { id:'u3', name:'Rahul Kumar',  email:'rahul@nexora.edu', password:'student123', role:'student', rollNo:'EE2021001', department:'Electronics',      semester:'6', joinedAt:'2021-07-01' },
    { id:'u4', name:'Priya Singh',  email:'priya@nexora.edu', password:'student123', role:'student', rollNo:'ME2022001', department:'Mechanical',       semester:'4', joinedAt:'2022-07-01' },
    { id:'u5', name:'Aarav Sharma', email:'aarav@nexora.edu', password:'student123', role:'student', rollNo:'CS2022001', department:'Computer Science', semester:'4', joinedAt:'2022-07-01' },
    { id:'a1', name:'Dr. Admin',    email:'admin@nexora.edu', password:'admin123',   role:'admin',   rollNo:'',          department:'',                 semester:'',  joinedAt:'2020-01-01' },
  ];

  const mk = (sid, subId, m, max = 100) => ({ id: genId(), studentId: sid, subjectId: subId, marks: m, maxMarks: parseInt(max), semester: '6' });
  const marks = [
    mk('u1','s1',88), mk('u1','s2',76), mk('u1','s3',82), mk('u1','s4',91), mk('u1','s5',95), mk('u1','s6',87),
    mk('u2','s1',92), mk('u2','s2',85), mk('u2','s3',78), mk('u2','s4',94), mk('u2','s5',89), mk('u2','s6',90),
    mk('u3','s1',61), mk('u3','s2',72), mk('u3','s3',58), mk('u3','s4',65), mk('u3','s5',70), mk('u3','s6',63),
    mk('u4','s1',79), mk('u4','s2',83), mk('u4','s3',88), mk('u4','s4',76),
    mk('u5','s1',85), mk('u5','s2',80), mk('u5','s3',74), mk('u5','s4',88), mk('u5','s5',92),
  ];

  const at = (sid, subId, present, total) => ({ id: genId(), studentId: sid, subjectId: subId, present, total });
  const attendance = [
    at('u1','s1',45,50), at('u1','s2',38,50), at('u1','s3',42,50), at('u1','s4',48,50), at('u1','s5',50,50), at('u1','s6',44,50),
    at('u2','s1',49,50), at('u2','s2',47,50), at('u2','s3',45,50), at('u2','s4',50,50), at('u2','s5',48,50), at('u2','s6',46,50),
    at('u3','s1',32,50), at('u3','s2',28,50), at('u3','s3',30,50), at('u3','s4',35,50), at('u3','s5',33,50), at('u3','s6',29,50),
    at('u4','s1',44,50), at('u4','s2',46,50), at('u4','s3',43,50), at('u4','s4',48,50),
    at('u5','s1',42,50), at('u5','s2',45,50), at('u5','s3',40,50), at('u5','s4',47,50), at('u5','s5',49,50),
  ];

  const tt = (day,start,end,subId,subName,room,faculty) => ({ id:genId(), day, startTime:start, endTime:end, subjectId:subId, subjectName:subName, room, faculty });
  const timetable = [
    tt('Monday',   '09:00','10:00','s5','Computer Science','CS-201','Dr. Sharma'),
    tt('Monday',   '11:00','12:00','s1','Mathematics',     'MA-101','Prof. Kumar'),
    tt('Monday',   '14:00','15:00','s6','Data Structures', 'CS-202','Prof. Rao'),
    tt('Tuesday',  '09:00','10:00','s2','Physics',         'PH-301','Dr. Mehta'),
    tt('Tuesday',  '11:00','12:00','s3','Chemistry',       'CH-101','Dr. Singh'),
    tt('Tuesday',  '14:00','15:00','s4','English',         'EN-101','Prof. Joshi'),
    tt('Wednesday','10:00','11:00','s1','Mathematics',     'MA-101','Prof. Kumar'),
    tt('Wednesday','14:00','15:00','s5','Computer Science','CS-201','Dr. Sharma'),
    tt('Thursday', '09:00','10:00','s6','Data Structures', 'CS-202','Prof. Rao'),
    tt('Thursday', '11:00','12:00','s4','English',         'EN-101','Prof. Joshi'),
    tt('Friday',   '09:00','10:00','s2','Physics',         'PH-301','Dr. Mehta'),
    tt('Friday',   '11:00','12:00','s3','Chemistry',       'CH-101','Dr. Singh'),
  ];

  const ago = h => new Date(Date.now() - h * 3600000).toISOString();
  const notifications = [
    { id:genId(), title:'Semester Exam Schedule Released', body:'Final examinations are scheduled from December 15–30, 2024.', type:'info',    createdAt:ago(2),   readBy:[] },
    { id:genId(), title:'Assignment Deadline Reminder',    body:'Data Structures assignment due tomorrow. Submit before 11:59 PM.',              type:'warning', createdAt:ago(5),   readBy:[] },
    { id:genId(), title:'Lab Closure — Maintenance',       body:'Computer labs CS-201 and CS-202 closed Saturday Dec 2 for maintenance.',        type:'alert',   createdAt:ago(24),  readBy:[] },
    { id:genId(), title:'Mid-Semester Results Published',   body:'Mid-semester results are published. Login to view scores.',                    type:'success', createdAt:ago(48),  readBy:['u2','u4'] },
    { id:genId(), title:'Guest Lecture: AI in Education',   body:'Prof. Anita Joshi — Friday Dec 8, 3 PM, Auditorium.',                         type:'info',    createdAt:ago(72),  readBy:['u1','u2','u3','u4'] },
    { id:genId(), title:'Fee Payment Reminder',             body:'Last date for semester fee payment is November 30.',                          type:'warning', createdAt:ago(96),  readBy:[] },
  ];

  set(K.SUBJECTS,      subjects);
  set(K.USERS,         users);
  set(K.MARKS,         marks);
  set(K.ATTENDANCE,    attendance);
  set(K.TIMETABLE,     timetable);
  set(K.NOTIFICATIONS, notifications);
  localStorage.setItem('nex_seeded_v2', '1');
}

/* ══════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════ */
export function init() { seed(); }

/* Users */
export const getUsers      = () => get(K.USERS);
export const getUser       = id => get(K.USERS).find(u => u.id === id);
export const getStudents   = () => get(K.USERS).filter(u => u.role === 'student');
export const saveUsers     = list => set(K.USERS, list);

/* Current session */
export const getCurrentUser  = () => getObj(K.CURRENT);
export const setCurrentUser  = u  => setObj(K.CURRENT, u);
export const clearCurrentUser= () => localStorage.removeItem(K.CURRENT);

/* Subjects */
export const getSubjects   = () => get(K.SUBJECTS);
export const getSubject    = id => get(K.SUBJECTS).find(s => s.id === id);
export const saveSubjects  = list => set(K.SUBJECTS, list);

/* Marks */
export const getMarks            = () => get(K.MARKS);
export const getMarksForStudent  = sid => get(K.MARKS).filter(m => m.studentId === sid);
export const saveMarks           = list => set(K.MARKS, list);

/* Attendance */
export const getAttendance           = () => get(K.ATTENDANCE);
export const getAttendanceForStudent = sid => get(K.ATTENDANCE).filter(a => a.studentId === sid);
export const saveAttendance          = list => set(K.ATTENDANCE, list);

/* Timetable */
export const getTimetable  = () => get(K.TIMETABLE);
export const saveTimetable = list => set(K.TIMETABLE, list);

/* Notifications */
export const getNotifications  = () => get(K.NOTIFICATIONS).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
export const saveNotifications = list => set(K.NOTIFICATIONS, list);

/* Settings */
export const getSettings  = () => ({ theme:'dark', emailNotifs:true, pushNotifs:true, ...getObj(K.SETTINGS) });
export const saveSettings = s  => setObj(K.SETTINGS, s);

/* My Subjects (student-added) */
export const getMySubjects     = (uid) => get(K.MY_SUBJECTS).filter(s => s.studentId === uid);
export const saveMySubjects    = (uid, list) => {
  const others = get(K.MY_SUBJECTS).filter(s => s.studentId !== uid);
  set(K.MY_SUBJECTS, [...others, ...list]);
};
export const addMySubject      = (uid, subject) => {
  const list = get(K.MY_SUBJECTS);
  const newSubject = { ...subject, id: genId(), studentId: uid, createdAt: new Date().toISOString() };
  set(K.MY_SUBJECTS, [...list, newSubject]);
  return newSubject;
};
export const deleteMySubject   = (uid, subjectId) => {
  set(K.MY_SUBJECTS, get(K.MY_SUBJECTS).filter(s => !(s.id === subjectId && s.studentId === uid)));
};

/* My Timetable Entries (student-added) */
export const getMyTimetable    = (uid) => get(K.MY_TIMETABLE).filter(t => t.studentId === uid);
export const saveMyTimetable   = (uid, list) => {
  const others = get(K.MY_TIMETABLE).filter(t => t.studentId !== uid);
  set(K.MY_TIMETABLE, [...others, ...list]);
};
export const addMyTimetableEntry = (uid, entry) => {
  const list = get(K.MY_TIMETABLE);
  const newEntry = { ...entry, id: genId(), studentId: uid, createdAt: new Date().toISOString() };
  set(K.MY_TIMETABLE, [...list, newEntry]);
  return newEntry;
};
export const deleteMyTimetableEntry = (uid, entryId) => {
  set(K.MY_TIMETABLE, get(K.MY_TIMETABLE).filter(t => !(t.id === entryId && t.studentId === uid)));
};

/* Tasks */
export const getTasks       = (uid) => get(K.TASKS).filter(t => t.studentId === uid).sort((a,b) => new Date(a.dueDate||'9999') - new Date(b.dueDate||'9999'));
export const addTask        = (uid, task) => {
  const list = get(K.TASKS);
  const newTask = { ...task, id: genId(), studentId: uid, done: false, createdAt: new Date().toISOString() };
  set(K.TASKS, [...list, newTask]);
  return newTask;
};
export const updateTask     = (uid, taskId, updates) => {
  set(K.TASKS, get(K.TASKS).map(t => t.id === taskId && t.studentId === uid ? { ...t, ...updates } : t));
};
export const deleteTask     = (uid, taskId) => {
  set(K.TASKS, get(K.TASKS).filter(t => !(t.id === taskId && t.studentId === uid)));
};

export { K, genId };

const NexData = {
  K, genId, init,
  marksToGrade, gradeToPoints, calcGPA, calcAttendance,
  getUsers, getUser, getStudents, saveUsers,
  getCurrentUser, setCurrentUser, clearCurrentUser,
  getSubjects, getSubject, saveSubjects,
  getMarks, getMarksForStudent, saveMarks,
  getAttendance, getAttendanceForStudent, saveAttendance,
  getTimetable, saveTimetable,
  getNotifications, saveNotifications,
  getSettings, saveSettings,
  getMySubjects, saveMySubjects, addMySubject, deleteMySubject,
  getMyTimetable, saveMyTimetable, addMyTimetableEntry, deleteMyTimetableEntry,
  getTasks, addTask, updateTask, deleteTask,
};
export default NexData;
