import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../components/ui/Toast';
import NexoraLogo from '../components/ui/NexoraLogo';
import '../styles/auth.css';

export default function Auth() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', rollNo: '', semester: '', department: '', remember: false });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Already logged in? Redirect
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  const validate = () => {
    const e = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (mode === 'login' && (!form.password || form.password.length < 4)) e.password = 'Min 4 characters';
    if (mode === 'signup') {
      if (!form.firstName) e.firstName = 'Required';
      if (!form.lastName) e.lastName = 'Required';
      if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        const res = login(form.email, form.password, role);
        if (res.success) {
          showToast(`Welcome back, ${res.user.name}!`, 'success');
          navigate(res.user.role === 'admin' ? '/admin' : '/student');
        } else {
          showToast('Invalid credentials. Try demo: arjun@nexora.edu / student123', 'error');
        }
      } else if (mode === 'signup') {
        const res = signup({ ...form, role: 'student' });
        if (res.success) {
          showToast('Account created! Welcome to Nexora.', 'success');
          navigate('/student');
        } else {
          showToast(res.error, 'error');
        }
      } else {
        showToast('Password reset link sent! (demo)', 'info');
        setMode('login');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="login-inner">
        {/* ── Left Panel ── */}
        <div className="login-left">
          <div className="login-left-bg" />
          <div className="login-left-grad" />
          <div className="login-brand">
            <div className="login-brand-logo">
              <NexoraLogo size={32} />
            </div>
            <h2>Nexora</h2>
            <p>Academic Intelligence Platform<br />Powered by AI</p>
          </div>
          <div className="login-illustration">
            <div className="floating-cards">
              <div className="f-card f-card-1">
                <div className="f-card-label">Current GPA</div>
                <div className="f-card-val" style={{ color: '#34d399' }}>3.87</div>
                <div className="f-card-bar"><div className="f-card-fill" style={{ width: '87%' }} /></div>
              </div>
              <div className="f-card f-card-2">
                <div className="f-card-label">AI Prediction</div>
                <div className="f-card-val" style={{ color: '#a78bfa' }}>A+</div>
              </div>
              <div className="f-card f-card-3">
                <div className="f-card-label">Attendance</div>
                <div className="f-card-val" style={{ color: '#4f8ef7' }}>94.2%</div>
                <div className="f-card-bar"><div className="f-card-fill" style={{ width: '94%' }} /></div>
              </div>
            </div>
          </div>
          <div className="login-features">
            <div className="login-feat"><i className="fas fa-lock" /> Enterprise-grade security</div>
            <div className="login-feat"><i className="fas fa-sync" /> Real-time data sync</div>
            <div className="login-feat"><i className="fas fa-brain" /> AI-powered insights</div>
            <div className="login-feat"><i className="fas fa-mobile-alt" /> Cross-platform access</div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <h3>{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}</h3>
              <p>{mode === 'login' ? 'Sign in to your Nexora account' : mode === 'signup' ? 'Get started with Nexora' : 'Enter your email to reset'}</p>
            </div>

            {mode === 'login' && (
              <div className="role-tabs">
                <div className={`role-tab ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>
                  <i className="fas fa-user-graduate" style={{ marginRight: 6 }} /> Student
                </div>
                <div className={`role-tab ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>
                  <i className="fas fa-user-shield" style={{ marginRight: 6 }} /> Admin
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className={`form-input ${errors.firstName ? 'input-error' : ''}`} placeholder="First name" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                    {errors.firstName && <div className="field-error">{errors.firstName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className={`form-input ${errors.lastName ? 'input-error' : ''}`} placeholder="Last name" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                    {errors.lastName && <div className="field-error">{errors.lastName}</div>}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-icon-wrap">
                  <i className="fas fa-envelope fi" />
                  <input className={`form-input ${errors.email ? 'input-error' : ''}`} type="email" placeholder="you@nexora.edu" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              {mode !== 'forgot' && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="form-icon-wrap">
                    <i className="fas fa-lock fi" />
                    <input className={`form-input ${errors.password ? 'input-error' : ''}`} type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                      <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  {errors.password && <div className="field-error">{errors.password}</div>}
                </div>
              )}

              {mode === 'signup' && (
                <>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Roll Number</label>
                      <input className="form-input" placeholder="CS2021001" value={form.rollNo} onChange={e => set('rollNo', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Semester</label>
                      <select className="form-select" value={form.semester} onChange={e => set('semester', e.target.value)}>
                        <option value="">Select</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)}>
                      <option value="">Select department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="Electrical">Electrical</option>
                    </select>
                  </div>
                </>
              )}

              {mode === 'login' && (
                <div className="form-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <label className="checkbox-wrap">
                    <input type="checkbox" checked={form.remember} onChange={e => set('remember', e.target.checked)} />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setMode('forgot'); }}>Forgot password?</a>
                </div>
              )}

              <button type="submit" className="btn-login" disabled={loading}>
                <span className="btn-text">
                  {loading ? <span className="spinner" style={{ display: 'inline-block' }} /> : (
                    <>{mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'} <i className="fas fa-arrow-right" /></>
                  )}
                </span>
              </button>
            </form>

            <div className="login-divider">or continue with</div>
            <div className="social-login">
              <button className="social-login-btn"><i className="fab fa-google" /> Google</button>
              <button className="social-login-btn"><i className="fab fa-microsoft" /> Microsoft</button>
            </div>

            <div className="login-footer-text">
              {mode === 'login' ? (
                <>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }}>Sign up</a></>
              ) : mode === 'signup' ? (
                <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Sign in</a></>
              ) : (
                <>Remember your password? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Sign in</a></>
              )}
            </div>

            {/* Demo Credentials */}
            {mode === 'login' && (
              <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: 10, fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--blue-bright)' }}>
                  <i className="fas fa-info-circle" /> Demo Credentials
                </div>
                <div style={{ color: 'var(--muted)' }}>
                  <strong>Student:</strong> arjun@nexora.edu / student123<br />
                  <strong>Admin:</strong> admin@nexora.edu / admin123
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
