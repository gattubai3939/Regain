"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlarmClock, ArrowDownRight, ArrowRight, BarChart3, CalendarDays,
  Check, ChevronDown, CircleHelp, Clock3, Command, Flame, Leaf, LockKeyhole,
  Menu, Pause, Play, Plus, Settings2, ShieldCheck, Smartphone, Sparkles,
  Target, TimerReset, TrendingUp, X, Zap
} from "lucide-react";

type Tab = "Focus" | "Insights" | "Schedule" | "Blocks";
type Task = { id: number; title: string; done: boolean };

const initialTasks: Task[] = [
  { id: 1, title: "Review today's notes", done: false },
  { id: 2, title: "Finish the first study chapter", done: false },
  { id: 3, title: "Take a short break", done: true }
];

const apps = [
  { name: "Instagram", detail: "Social · 42 min today", icon: "◎", color: "pink" },
  { name: "YouTube", detail: "Video · 1 hr 18 min today", icon: "▶", color: "red" },
  { name: "Reddit", detail: "Communities · 26 min today", icon: "◉", color: "orange" },
  { name: "X", detail: "Social · 19 min today", icon: "𝕏", color: "blue" }
];

function formatTime(seconds: number) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("Focus");
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [taskInput, setTaskInput] = useState("");
  const [selectedApps, setSelectedApps] = useState<string[]>(["Instagram", "Reddit"]);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("regain-state-v1");
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
        if (Array.isArray(data.selectedApps)) setSelectedApps(data.selectedApps);
        if (typeof data.sessions === "number") setSessions(data.sessions);
        if (typeof data.focusMinutes === "number") setFocusMinutes(data.focusMinutes);
        if (typeof data.duration === "number") {
          setDuration(data.duration);
          setRemaining(typeof data.remaining === "number" ? data.remaining : data.duration * 60);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("regain-state-v1", JSON.stringify({
      tasks, selectedApps, sessions, focusMinutes, duration, remaining
    }));
  }, [hydrated, tasks, selectedApps, sessions, focusMinutes, duration, remaining]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(id);
          setRunning(false);
          setSessions((v) => v + 1);
          setFocusMinutes((v) => v + duration);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, duration]);

  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = duration > 0 ? ((duration * 60 - remaining) / (duration * 60)) * 100 : 0;
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  function chooseDuration(minutes: number) {
    setRunning(false);
    setDuration(minutes);
    setRemaining(minutes * 60);
  }

  function toggleTimer() {
    if (remaining <= 0) setRemaining(duration * 60);
    setRunning((value) => !value);
  }

  function endSession() {
    setRunning(false);
    const elapsed = Math.max(0, duration * 60 - remaining);
    if (elapsed >= 60) {
      setSessions((v) => v + 1);
      setFocusMinutes((v) => v + Math.floor(elapsed / 60));
    }
    setRemaining(duration * 60);
  }

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = taskInput.trim();
    if (!title) return;
    setTasks((items) => [...items, { id: Date.now(), title, done: false }]);
    setTaskInput("");
  }

  function toggleTask(id: number) {
    setTasks((items) => items.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function toggleApp(name: string) {
    setSelectedApps((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  const navItems: { label: Tab; icon: typeof Target }[] = [
    { label: "Focus", icon: Target },
    { label: "Insights", icon: BarChart3 },
    { label: "Schedule", icon: CalendarDays },
    { label: "Blocks", icon: ShieldCheck }
  ];

  return (
    <main className="app-shell">
      <aside className={`sidebar ${showMobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Leaf size={20} strokeWidth={2.5} /></div>
          <span>regain<span className="brand-period">.</span></span>
          <button className="mobile-close icon-button" onClick={() => setShowMobileNav(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">S</div>
          <div className="workspace-copy"><strong>My space</strong><span>Personal workspace</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <span className="nav-section-label">YOUR SPACE</span>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${tab === label ? "nav-active" : ""}`} onClick={() => { setTab(label); setShowMobileNav(false); }}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Blocks" && <span className="nav-count">{selectedApps.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Sparkles size={16} /></div>
            <strong>Small steps count.</strong>
            <p>You don’t need a perfect day. Just a little more intention.</p>
            <div className="tip-dots"><i /><i /><i /></div>
          </div>
          <button className="nav-item settings-nav" onClick={() => setShowSettings(true)}><Settings2 size={18} /><span>Settings</span></button>
          <div className="profile-row">
            <div className="profile-avatar">Y</div>
            <div className="profile-copy"><strong>Your focus space</strong><span>Free plan</span></div>
            <button className="icon-button profile-menu" onClick={() => setShowSettings(true)} aria-label="Open settings"><Menu size={18} /></button>
          </div>
        </div>
      </aside>

      {showMobileNav && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setShowMobileNav(false)} />}

      <section className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setShowMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="breadcrumb"><span>My space</span><span className="breadcrumb-slash">/</span><strong>{tab}</strong></div>
          <div className="topbar-actions">
            <div className="today-chip"><span className="live-dot" /> YOUR DAY <span className="today-date">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
            <button className="icon-button help-button" aria-label="Help" onClick={() => setShowSettings(true)}><CircleHelp size={19} /></button>
            <div className="top-avatar">Y</div>
          </div>
        </header>

        <div className="page-content">
          {tab === "Focus" && (
            <>
              <div className="page-heading">
                <div><div className="eyebrow"><span className="eyebrow-line" /> YOUR PERSONAL FOCUS SPACE</div><h1>{greeting}, <span>let’s make it count.</span></h1><p className="heading-subtitle">A little less noise. A little more you.</p></div>
                <button className="date-button"><CalendarDays size={16} /> Today <ChevronDown size={14} /></button>
              </div>

              <div className="focus-layout">
                <div className="focus-main-column">
                  <section className="hero-card">
                    <div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="hero-grid" />
                    <div className="hero-topline"><div className="hero-tag"><span className="hero-tag-dot" /> FOCUS MODE</div><span className="session-number">SESSION {String(sessions + (running ? 1 : 0)).padStart(2, "0")}</span></div>
                    <div className="hero-content">
                      <div className="timer-column">
                        <div className="timer-ring" style={{ "--progress": `${Math.max(0, Math.min(100, progress))}%` } as React.CSSProperties}>
                          <div className="timer-ring-inner">
                            <span className="timer-overline">{running ? "YOU’RE IN THE ZONE" : remaining === 0 ? "SESSION COMPLETE" : "TIME TO FOCUS"}</span>
                            <span className="timer-value">{formatTime(remaining)}</span>
                            <span className="timer-caption">{running ? "One thing at a time." : `${duration} minute session`}</span>
                          </div>
                        </div>
                        <div className="timer-presets">
                          {[15, 25, 45].map((minutes) => <button key={minutes} className={duration === minutes ? "preset-active" : ""} onClick={() => chooseDuration(minutes)} disabled={running}>{minutes}m</button>)}
                        </div>
                      </div>
                      <div className="hero-message">
                        <div className="hero-icon"><Zap size={19} fill="currentColor" /></div>
                        <h2>{running ? "Stay with the moment." : remaining === 0 ? "You showed up. That matters." : "Give one thing your full attention."}</h2>
                        <p>{running ? "You’ve made space for what matters. Keep going at your own pace." : "Quiet the noise, choose your next step, and let the rest wait."}</p>
                        <div className="hero-actions">
                          <button className="button-primary" onClick={toggleTimer}>{running ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}{running ? "Pause focus" : remaining === 0 ? "Start again" : "Start focusing"}<ArrowRight size={16} /></button>
                          {running && <button className="button-ghost" onClick={endSession}>End session</button>}
                        </div>
                        <div className="hero-footnote"><ShieldCheck size={14} /><span>Your time is yours. Progress saves on this device.</span></div>
                      </div>
                    </div>
                  </section>

                  <div className="section-title-row"><div><h2>Your intentions</h2><p>Little wins add up to big changes.</p></div><span className="task-count">{completedTasks}/{tasks.length} DONE</span></div>
                  <section className="tasks-card">
                    <div className="task-progress-track"><div style={{ width: tasks.length ? `${completedTasks / tasks.length * 100}%` : "0%" }} /></div>
                    <div className="task-list">
                      {tasks.map((task) => <div className={`task-row ${task.done ? "task-done" : ""}`} key={task.id}><button className={`task-check ${task.done ? "checked" : ""}`} onClick={() => toggleTask(task.id)} aria-label={task.done ? "Mark incomplete" : "Mark complete"}>{task.done && <Check size={13} strokeWidth={3} />}</button><span>{task.title}</span><button className="task-more" onClick={() => setTasks((items) => items.filter((item) => item.id !== task.id))} aria-label="Remove task"><X size={15} /></button></div>)}
                    </div>
                    <form className="add-task-form" onSubmit={addTask}><Plus size={16} /><input value={taskInput} onChange={(e) => setTaskInput(e.target.value)} placeholder="Add an intention for today…" aria-label="New intention" /><button type="submit" disabled={!taskInput.trim()}>Add</button></form>
                  </section>
                </div>

                <aside className="focus-side-column">
                  <section className="stat-card">
                    <div className="card-heading"><div className="card-icon green-icon"><Clock3 size={17} /></div><span>TIME WELL SPENT</span><button className="tiny-more" onClick={() => setTab("Insights")} aria-label="View insights"><ArrowRight size={16} /></button></div>
                    <div className="stat-value">{Math.floor(focusMinutes / 60)}<span>h</span> {focusMinutes % 60}<span>m</span></div>
                    <div className="stat-description">Focused time tracked here</div>
                    <div className="stat-foot"><span className="trend-pill"><TrendingUp size={13} /> {sessions} sessions</span><span className="muted-small">All time</span></div>
                  </section>

                  <section className="goal-card">
                    <div className="goal-header"><div className="card-icon purple-icon"><Target size={17} /></div><span>DAILY INTENTION</span><button className="tiny-more" onClick={() => setShowSettings(true)} aria-label="Goal settings"><Settings2 size={15} /></button></div>
                    <div className="goal-numbers"><strong>{Math.min(focusMinutes, 120)}<span> / 120 min</span></strong><span className="goal-percent">{Math.min(100, Math.round(focusMinutes / 120 * 100))}%</span></div>
                    <div className="goal-track"><div style={{ width: `${Math.min(100, focusMinutes / 120 * 100)}%` }} /></div>
                    <p>{focusMinutes >= 120 ? "You reached your focus goal. Lovely work." : "Every focused minute moves you forward."}</p>
                    <div className="goal-illustration"><div className="goal-sun" /><div className="goal-hill hill-back" /><div className="goal-hill hill-front" /><div className="goal-spark spark-a">✦</div><div className="goal-spark spark-b">✧</div></div>
                  </section>

                  <section className="gentle-card">
                    <div className="gentle-top"><div className="gentle-icon"><Flame size={16} /></div><span>A GENTLE REMINDER</span></div>
                    <p>Rest is part of the work. You’re allowed to take a breath.</p>
                    <button onClick={() => chooseDuration(5)}>Take a 5-minute pause <ArrowRight size={14} /></button>
                  </section>

                  <div className="privacy-note"><LockKeyhole size={14} /><span>Private by design</span><span className="privacy-separator">·</span><span>Stored on this device</span></div>
                </aside>
              </div>
            </>
          )}

          {tab === "Insights" && (
            <>
              <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> AWARENESS WITHOUT JUDGMENT</div><h1>Your time, <span>in perspective.</span></h1><p className="heading-subtitle">Notice patterns. Celebrate progress. Start fresh anytime.</p></div></div>
              <div className="insight-summary-grid"><div className="insight-summary-card"><span className="summary-label"><Clock3 size={15} /> FOCUS TIME</span><strong>{focusMinutes}<small> min</small></strong><span className="summary-note">Tracked in Regain sessions</span></div><div className="insight-summary-card"><span className="summary-label"><Target size={15} /> COMPLETED SESSIONS</span><strong>{sessions}</strong><span className="summary-note">Every session is a start</span></div><div className="insight-summary-card"><span className="summary-label"><Check size={15} /> INTENTIONS DONE</span><strong>{completedTasks}<small> / {tasks.length}</small></strong><span className="summary-note">Your own daily checklist</span></div></div>
              <section className="content-panel"><div className="panel-heading"><div><h2>Your focus rhythm</h2><p>Minutes recorded from your Regain sessions.</p></div><span className="period-chip">All time</span></div><div className="empty-chart"><div className="chart-bars">{[24,38,30,54,42,68,48].map((height, i) => <div className="chart-bar-wrap" key={i}><div className={i === 6 ? "chart-bar chart-bar-today" : "chart-bar"} style={{ height: `${focusMinutes ? Math.max(10, height * Math.min(1, focusMinutes / 60)) : 8}%` }} /><span>{["M","T","W","T","F","S","S"][i]}</span></div>)}</div><div className="chart-caption"><span><i /> Focus sessions</span><span>Illustrative weekly layout · session data only</span></div></div></section>
              <div className="insight-disclaimer"><Activity size={17} /><p><strong>Honest by design.</strong> This web version tracks focus sessions you start here. It cannot read Android-wide screen time or verify which apps you use. That requires a separate Android integration.</p></div>
            </>
          )}

          {tab === "Schedule" && (
            <>
              <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> MAKE SPACE FOR WHAT MATTERS</div><h1>A little plan, <span>a calmer day.</span></h1><p className="heading-subtitle">Build a rhythm that works for you, not against you.</p></div></div>
              <section className="content-panel schedule-panel"><div className="panel-heading"><div><h2>Your simple daily rhythm</h2><p>A starting point you can adapt to your own life.</p></div><span className="period-chip">Example plan</span></div><div className="schedule-list">{[{time:"09:00",end:"09:25",name:"Morning focus",detail:"Start with one meaningful task",color:"green"},{time:"09:25",end:"09:30",name:"Step away",detail:"Stretch, breathe, get some water",color:"lavender"},{time:"14:00",end:"14:45",name:"Afternoon deep work",detail:"One task, notifications away",color:"blue"},{time:"20:30",end:"20:40",name:"Day reflection",detail:"Notice one thing that went well",color:"orange"}].map((item) => <div className="schedule-row" key={item.time}><div className="schedule-time">{item.time}<span>{item.end}</span></div><div className={`schedule-line ${item.color}`} /><div className="schedule-copy"><strong>{item.name}</strong><span>{item.detail}</span></div><span className="example-label">SUGGESTED</span></div>)}</div><div className="schedule-footnote"><AlarmClock size={16} /> These are suggestions only. Web reminders and recurring schedules are not enabled yet.</div></section>
              <div className="coming-soon-card"><div className="coming-icon"><CalendarDays size={20} /></div><div><strong>Recurring schedules are next</strong><p>We’ll add editable routines and reminders after the core app is stable.</p></div><span className="coming-badge">PLANNED</span></div>
            </>
          )}

          {tab === "Blocks" && (
            <>
              <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> MAKE DISTRACTION A LITTLE HARDER</div><h1>Protect your <span>attention.</span></h1><p className="heading-subtitle">Choose which distractions you’d like to keep out of your focus time.</p></div></div>
              <div className="block-notice"><div className="notice-icon"><Smartphone size={19} /></div><div><strong>Web preview — selection only</strong><p>Your choices are saved in this browser, but a website cannot block Android apps. Actual app blocking needs a native Android companion and explicit permission.</p></div></div>
              <section className="content-panel app-block-panel"><div className="panel-heading"><div><h2>Your distraction list</h2><p>Pick the apps you want to keep in mind during a focus session.</p></div><span className="selected-count">{selectedApps.length} SELECTED</span></div><div className="app-list">{apps.map((app) => <button key={app.name} className={`app-row ${selectedApps.includes(app.name) ? "app-selected" : ""}`} onClick={() => toggleApp(app.name)}><div className={`app-icon app-${app.color}`}>{app.icon}</div><div className="app-copy"><strong>{app.name}</strong><span>{app.detail}</span></div><div className={`app-toggle ${selectedApps.includes(app.name) ? "toggle-on" : ""}`}>{selectedApps.includes(app.name) && <Check size={13} />}</div></button>)}</div><div className="blocking-mode-note"><ShieldCheck size={17} /><div><strong>Normal blocking mode</strong><span>Designed to be easy to turn on or off. Native Android enforcement is a future milestone.</span></div></div></section>
            </>
          )}
          <footer className="page-footer"><span>© 2026 Regain</span><span>Make room for what matters.</span><span className="footer-status"><span /> Built for a calmer kind of productivity</span></footer>
        </div>
      </section>

      {showSettings && <div className="modal-backdrop" onClick={() => setShowSettings(false)}><section className="settings-modal" onClick={(e) => e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">YOUR PREFERENCES</span><h2>Settings & privacy</h2></div><button className="icon-button" onClick={() => setShowSettings(false)} aria-label="Close settings"><X size={19} /></button></div><div className="settings-content"><div className="settings-row"><div className="settings-symbol"><LockKeyhole size={18} /></div><div><strong>Your data stays here</strong><p>Focus progress and intentions are stored in this browser using local storage.</p></div></div><div className="settings-row"><div className="settings-symbol"><TimerReset size={18} /></div><div><strong>Reset focus progress</strong><p>Clear recorded sessions and start fresh.</p></div><button className="button-outline" onClick={() => { setSessions(0); setFocusMinutes(0); setRemaining(duration * 60); setRunning(false); }}>Reset</button></div><div className="settings-row"><div className="settings-symbol"><Command size={18} /></div><div><strong>Product status</strong><p>Vercel-ready web MVP. Native Android blocking and account sync are not connected.</p></div></div></div><button className="button-primary modal-done" onClick={() => setShowSettings(false)}>Done <Check size={16} /></button></section></div>}
    </main>
  );
}
