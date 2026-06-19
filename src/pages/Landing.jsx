import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import NexoraLogo from '../components/ui/NexoraLogo';
import '../styles/landing.css';

/* ── Particle Canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let mouse = { x: -999, y: -999 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
    }));

    function handleMouse(e) { mouse = { x: e.clientX, y: e.clientY }; }
    window.addEventListener('mousemove', handleMouse);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x += dx / dist * 1.5;
          p.y += dy / dist * 1.5;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(79,142,247,0.35)';
        ctx.fill();
      });

      // Lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(79,142,247,${0.08 * (1 - d / 140)})`;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return <canvas ref={canvasRef} id="particles-canvas" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />;
}

/* ── Animated Counter ── */
function AnimCounter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const dur = 2000;
          const inc = target / (dur / 16);
          const timer = setInterval(() => {
            start += inc;
            if (start >= target) {
              start = target;
              clearInterval(timer);
            }
            setVal(Math.floor(start));
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Scroll Reveal ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    if (ref.current) {
      ref.current.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Landing() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const revealRef = useReveal();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { icon: 'fa-chart-line', color: '#4f8ef7', title: 'Performance Analytics', desc: 'Deep-dive into individual and cohort academic metrics. Track GPA trends, subject scores, and attendance patterns with beautiful real-time visualizations.' },
    { icon: 'fa-brain', color: '#a78bfa', title: 'AI Prediction Insights', desc: 'GPT-powered models predict student outcomes up to 8 weeks ahead. Early intervention alerts help prevent academic failures before they happen.' },
    { icon: 'fa-calendar-alt', color: '#22d3ee', title: 'Smart Timetable Scheduling', desc: 'Conflict-free automated scheduling powered by constraint algorithms. Optimize classroom utilization and faculty allocation effortlessly.' },
    { icon: 'fa-users', color: '#fbbf24', title: 'Peer Comparison Engine', desc: 'Intelligent benchmarking against anonymized peer groups, department averages, and national percentiles.' },
    { icon: 'fa-file-export', color: '#34d399', title: 'Advanced Report Export', desc: 'One-click PDF and CSV generation for academic transcripts, attendance reports, and institutional summaries.' },
    { icon: 'fa-shield-alt', color: '#f87171', title: 'Privacy-First Architecture', desc: 'SOC 2 Type II compliant with role-based access, audit logs, and end-to-end encryption for all student data.' },
  ];

  const testimonials = [
    { text: '"Nexora transformed how we approach student success. The AI predictions alone saved us from 200+ potential dropouts last year."', name: 'Dr. Raghav Menon', role: 'Vice Chancellor, IIT Madras', color: '#4f8ef7' },
    { text: '"The analytics dashboard gives me a 360° view of each student. It\'s like having an AI co-pilot for academic management."', name: 'Prof. Ananya Deshpande', role: 'Dean of Academics, NIT Trichy', color: '#a78bfa' },
    { text: '"Our attendance monitoring went from chaos to crystal clarity. The timetable builder saved our admin team 15 hours per week."', name: 'Dr. Karthik Subramaniam', role: 'Registrar, BITS Pilani', color: '#22d3ee' },
  ];

  return (
    <div ref={revealRef}>
      {/* ─── Navbar ─── */}
      <nav className={navScrolled ? 'scrolled' : ''} id="navbar">
        <div className="nav-logo">
          <div className="nav-logo-icon"><NexoraLogo /></div>
          <span>Nexora</span>
        </div>
        <ul className="nav-links">
          <li><a href="#hero">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#stats">Analytics</a></li>
          <li><a href="#preview">Dashboard</a></li>
          <li><a href="#testimonials">Reviews</a></li>
        </ul>
        <div className="nav-actions">
          <Link to="/auth" className="btn btn-ghost">Sign In</Link>
          <Link to="/auth" className="btn btn-primary"><i className="fas fa-rocket" style={{ fontSize: 12 }} /> Get Started</Link>
        </div>
        <div className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          <span /><span /><span />
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && <div className="mobile-nav-overlay open" onClick={() => setMobileOpen(false)} />}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <a href="#hero" onClick={() => setMobileOpen(false)}>Home</a>
        <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
        <a href="#preview" onClick={() => setMobileOpen(false)}>Dashboard</a>
        <a href="#testimonials" onClick={() => setMobileOpen(false)}>Reviews</a>
        <Link to="/auth" onClick={() => setMobileOpen(false)}>Login</Link>
      </div>

      {/* ─── Hero ─── */}
      <section id="hero">
        <div className="hero-bg" />
        <ParticleCanvas />
        <div className="grid-overlay" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge" style={{ animation: 'fadeSlideUp 0.7s ease both' }}>
              <span className="dot" />Now with GPT-Powered Predictions
            </div>
            <h1 className="hero-h1" style={{ animation: 'fadeSlideUp 0.7s 0.1s ease both' }}>
              AI-Powered<br />
              <span className="grad">Academic Intelligence</span><br />
              Platform
            </h1>
            <p className="hero-sub" style={{ animation: 'fadeSlideUp 0.7s 0.2s ease both' }}>
              Nexora unifies student performance analytics, AI-driven grade predictions,
              smart timetable scheduling, and real-time academic insights — all in one
              elegant, university-grade platform.
            </p>
            <div className="hero-cta" style={{ animation: 'fadeSlideUp 0.7s 0.3s ease both' }}>
              <Link to="/auth" className="btn btn-primary btn-lg">
                <i className="fas fa-rocket" style={{ fontSize: 13 }} /> Get Started Free
              </Link>
              <a href="#preview" className="btn btn-cyan btn-lg">
                <i className="fas fa-play" style={{ fontSize: 11 }} /> Explore Dashboard
              </a>
            </div>
            <div className="hero-stats" style={{ animation: 'fadeSlideUp 0.7s 0.4s ease both' }}>
              <div className="hero-stat">
                <div className="num"><AnimCounter target={50000} /></div>
                <div className="label">Students Tracked</div>
              </div>
              <div className="hero-stat">
                <div className="num"><AnimCounter target={98} suffix="%" /></div>
                <div className="label">Prediction Accuracy</div>
              </div>
              <div className="hero-stat">
                <div className="num"><AnimCounter target={340} suffix="+" /></div>
                <div className="label">Universities</div>
              </div>
            </div>
          </div>
          <div className="hero-right" style={{ animation: 'fadeSlideUp 0.7s 0.2s ease both' }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features">
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="section-head-center reveal">
            <div className="section-label">Platform Features</div>
            <h2 className="section-title">Everything your institution needs</h2>
            <p className="section-sub">A complete academic intelligence suite — from AI predictions to smart scheduling, all designed for modern universities.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className={`feat-card reveal reveal-delay-${(i % 3) + 1}`} key={i}>
                <div className="feat-icon" style={{ background: `linear-gradient(135deg,${f.color}33,${f.color}0d)`, border: `1px solid ${f.color}40` }}>
                  <i className={`fas ${f.icon}`} style={{ color: f.color }} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="feat-tag">Explore <span className="feat-arrow">→</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section id="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="num"><AnimCounter target={340} suffix="+" /></div>
            <div className="label">Universities</div>
          </div>
          <div className="stat-item">
            <div className="num"><AnimCounter target={2400000} /></div>
            <div className="label">Students Tracked</div>
          </div>
          <div className="stat-item">
            <div className="num">99.9<span className="unit">%</span></div>
            <div className="label">Uptime SLA</div>
          </div>
          <div className="stat-item">
            <div className="num">15<span className="unit">+</span></div>
            <div className="label">AI Models</div>
          </div>
        </div>
      </section>

      {/* ─── Dashboard Preview ─── */}
      <section id="preview">
        <div className="preview-inner">
          <div className="preview-left reveal">
            <div className="section-label">Live Dashboard</div>
            <h2 className="section-title">See your data come alive</h2>
            <p className="section-sub">Built for speed and clarity — a dashboard that feels like magic, not a spreadsheet.</p>
            <ul className="preview-features">
              <li className="preview-feature"><i className="fas fa-chart-bar" /> Real-time performance tracking</li>
              <li className="preview-feature"><i className="fas fa-bell" /> Smart notification system</li>
              <li className="preview-feature"><i className="fas fa-shield-alt" /> Role-based access control</li>
              <li className="preview-feature"><i className="fas fa-download" /> One-click report export</li>
            </ul>
          </div>
          <div className="preview-right reveal">
            <div className="big-mockup">
              <div className="mock-sidebar-layout">
                <div className="mock-sidebar">
                  {['Dashboard', 'Students', 'Analytics', 'Attendance', 'Timetable', 'Notifications', 'Reports', 'Settings'].map((item, i) => (
                    <div className={`mock-sidebar-item ${i === 0 ? 'active' : ''}`} key={i}>
                      <i className={`fas fa-${['th-large','users','chart-line','calendar-check','calendar-alt','bell','file-alt','cog'][i]}`} /> {item}
                    </div>
                  ))}
                </div>
                <div className="mock-main-area">
                  <div className="mock-kpi-row">
                    {[{ l: 'Students', v: '1,247', c: '+24', up: true }, { l: 'Avg GPA', v: '3.42', c: '+0.08', up: true }, { l: 'Attendance', v: '89.4%', c: '+1.2%', up: true }, { l: 'At-Risk', v: '23', c: '-5', up: false }].map((k, i) => (
                      <div className="mock-kpi" key={i}>
                        <div className="k-label">{k.l}</div>
                        <div className="k-val">{k.v}</div>
                        <div className={`k-change`} style={{ color: k.up ? '#34d399' : '#f87171', fontSize: '0.58rem' }}>
                          <i className={`fas fa-arrow-${k.up ? 'up' : 'down'}`} /> {k.c}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mock-two-col">
                    <div className="mock-area">
                      <div className="mock-area-label">Subject Performance</div>
                      <div className="subject-bars">
                        {[{ n: 'Math', p: 85, c: '#4f8ef7' }, { n: 'Physics', p: 72, c: '#22d3ee' }, { n: 'Chem', p: 78, c: '#a78bfa' }, { n: 'CS', p: 92, c: '#fbbf24' }, { n: 'English', p: 88, c: '#34d399' }].map((s, i) => (
                          <div className="subject-bar-row" key={i}>
                            <span className="subject-name">{s.n}</span>
                            <div className="subject-track">
                              <div className="subject-fill" style={{ width: `${s.p}%`, background: s.c }} />
                            </div>
                            <span className="subject-pct">{s.p}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mock-area">
                      <div className="mock-area-label">Recent Activity</div>
                      <div className="activity-list">
                        {[{ t: 'Math marks updated', c: '#34d399', time: '2m ago' }, { t: 'Attendance synced', c: '#4f8ef7', time: '15m ago' }, { t: 'New notification', c: '#fbbf24', time: '1h ago' }, { t: 'Report generated', c: '#a78bfa', time: '3h ago' }].map((a, i) => (
                          <div className="activity-item" key={i}>
                            <div className="activity-dot" style={{ background: a.c }} />
                            <span className="activity-text">{a.t}</span>
                            <span className="activity-time">{a.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials">
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="section-head-center reveal">
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">Loved by academic leaders</h2>
            <p className="section-sub">See what university administrators say about transforming their institutions with Nexora.</p>
          </div>
          <div className="testi-grid">
            {testimonials.map((t, i) => (
              <div className="testi-card reveal" key={i}>
                <div className="testi-stars">★★★★★</div>
                <div className="testi-text">{t.text}</div>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: `linear-gradient(135deg,${t.color},${t.color}80)` }}>
                    {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
                <div className="testi-quote">"</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer>
        <div className="footer-glow">
          <div className="footer-glow-text">Nexora</div>
        </div>
        <div className="footer-inner">
          <div>
            <div className="nav-logo" style={{ marginBottom: 14 }}>
              <div className="nav-logo-icon"><NexoraLogo /></div>
              <span>Nexora</span>
            </div>
            <p className="footer-desc">AI-powered academic intelligence for modern institutions. Built with love for education.</p>
            <div className="footer-socials">
              {['fa-twitter', 'fa-github', 'fa-linkedin-in', 'fa-discord'].map((ic, i) => (
                <a href="#" className="social-btn" key={i}><i className={`fab ${ic}`} /></a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#stats">Analytics</a></li>
              <li><a href="#preview">Dashboard</a></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Security</a></li>
              <li><a href="#">GDPR</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Nexora. All rights reserved.</p>
          <p>Built with ❤️ for education</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Dashboard Mockup (Hero) ── */
function DashboardMockup() {
  return (
    <div className="dashboard-mockup">
      <div className="mock-topbar">
        <div className="mock-dots"><span /><span /><span /></div>
        <div className="mock-title">Nexora — Performance Dashboard</div>
        <div className="mock-actions">
          <span><i className="fas fa-minus" style={{ fontSize: 8 }} /></span>
          <span><i className="fas fa-expand" style={{ fontSize: 8 }} /></span>
        </div>
      </div>
      <div className="mock-grid">
        <div className="mock-stat-card">
          <div className="mock-stat-label">GPA Average</div>
          <div className="mock-stat-val">3.87</div>
          <div className="mock-stat-change up"><i className="fas fa-arrow-up" /> +0.12</div>
        </div>
        <div className="mock-stat-card">
          <div className="mock-stat-label">Attendance</div>
          <div className="mock-stat-val">94.2%</div>
          <div className="mock-stat-change up"><i className="fas fa-arrow-up" /> +2.1%</div>
        </div>
        <div className="mock-stat-card">
          <div className="mock-stat-label">At-Risk</div>
          <div className="mock-stat-val">12</div>
          <div className="mock-stat-change down"><i className="fas fa-arrow-down" /> -3</div>
        </div>
      </div>
      <div className="mock-chart-row">
        <div className="mock-chart-main">
          <div className="mock-chart-label">Performance Trend — 2024</div>
          <div className="chart-bars">
            {[40,55,45,70,60,80,75,90,85,95,88,100].map((h, i) => (
              <div className="chart-bar" key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="glow-line" />
        </div>
        <div className="mock-donut-card">
          <div className="donut">
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#grad1)" strokeWidth="3"
                strokeDasharray="87 13" strokeDashoffset="25" strokeLinecap="round" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f8ef7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <text x="18" y="21" textAnchor="middle" fontSize="7" fill="#f1f5f9" fontFamily="Inter" fontWeight="700">87%</text>
            </svg>
          </div>
          <div className="donut-label">Pass Rate</div>
        </div>
      </div>
      <div className="mock-table">
        <div className="mock-table-head">
          <span>Student</span><span>Subject</span><span>Score</span><span>Status</span>
        </div>
        {[{ n: 'Arjun P.', s: 'Mathematics', sc: 92, b: 'badge-green', l: 'Excellent' }, { n: 'Sara M.', s: 'Physics', sc: 78, b: 'badge-blue', l: 'Good' }, { n: 'Rahul K.', s: 'Chemistry', sc: 61, b: 'badge-yellow', l: 'Average' }].map((r, i) => (
          <div className="mock-table-row" key={i}>
            <span>{r.n}</span><span>{r.s}</span><span>{r.sc}</span>
            <span><div className={`mock-badge ${r.b}`}>{r.l}</div></span>
          </div>
        ))}
      </div>
    </div>
  );
}
