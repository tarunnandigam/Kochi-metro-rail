import React, { useState, useEffect } from 'react';
import '../styles/OfficerDashboard.css';

const MOCK_STATIONS = [
    { name: 'Aluva', status: 'Operational', passengers: 4821, master: 'Rajesh Kumar', revenue: 24200 },
    { name: 'Kalamassery', status: 'Operational', passengers: 3102, master: 'Rajan KV', revenue: 15800 },
    { name: 'Palarivattom', status: 'Maintenance', passengers: 2897, master: 'Sreeja AN', revenue: 14100 },
    { name: 'MG Road', status: 'Operational', passengers: 6432, master: 'Anil Nair', revenue: 38900 },
    { name: 'Vyttila Junction', status: 'Operational', passengers: 3789, master: 'Deepa MS', revenue: 19700 },
    { name: 'Ernakulathappan', status: 'Closed', passengers: 0, master: 'Suresh PK', revenue: 0 },
];

const MOCK_USERS = [
    { username: 'testuser', fullName: 'Test User', role: 'Customer', email: 'test@example.com', status: 'Active' },
    { username: 'ZAB', fullName: 'Z A B', role: 'Customer', email: 'zab@example.com', status: 'Active' },
    { username: 'stationmaster', fullName: 'Station Master', role: 'Station Master', email: 'stationmaster@kmrl.com', status: 'Active' },
    { username: 'kmrlofficer', fullName: 'KMRL Officer', role: 'Officer', email: 'officer@kmrl.com', status: 'Active' },
    { username: 'aneesh_rv', fullName: 'Aneesh RV', role: 'Customer', email: 'aneesh@metro.in', status: 'Inactive' },
];

const MOCK_TRAINS = [
    { id: 'KM-101', from: 'Aluva', to: 'MG Road', status: 'Running', delay: 0, passengers: 312 },
    { id: 'KM-102', from: 'MG Road', to: 'Aluva', status: 'Delayed', delay: 3, passengers: 198 },
    { id: 'KM-103', from: 'Aluva', to: 'Vyttila', status: 'Running', delay: 0, passengers: 267 },
    { id: 'KM-104', from: 'Vyttila', to: 'MG Road', status: 'Running', delay: 0, passengers: 421 },
    { id: 'KM-105', from: 'MG Road', to: 'Aluva', status: 'Maintenance', delay: 0, passengers: 0 },
];

const navItems = [
    { key: 'overview', icon: '⊞', label: 'System Overview' },
    { key: 'stations', icon: '🚉', label: 'All Stations' },
    { key: 'trains', icon: '⟹', label: 'Fleet Monitor' },
    { key: 'users', icon: '👥', label: 'User Management' },
    { key: 'news', icon: '📰', label: 'News & Updates' },
    { key: 'reports', icon: '📈', label: 'Reports' },
];

// Mini vertical bar chart
function MiniBarChart({ data, color }) {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '72px', padding: '0 18px 14px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div
                        style={{
                            width: '100%',
                            height: `${(d.value / maxVal) * 58}px`,
                            background: d.highlight
                                ? `linear-gradient(180deg, ${color || '#a855f7'}, #7c3aed)`
                                : 'rgba(255,255,255,0.07)',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.4s ease',
                        }}
                        title={`${d.label}: ${d.value}`}
                    />
                    <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)' }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
}

// Calendar mini-widget
function CalendarWidget({ currentTime }) {
    const [month, setMonth] = useState(currentTime.getMonth());
    const [year, setYear] = useState(currentTime.getFullYear());
    const today = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < adjustedFirst; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    while (cells.length % 7 !== 0) cells.push(null);
    const isToday = (d) => d && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isWeekend = (idx) => idx % 7 === 5 || idx % 7 === 6;
    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
    return (
        <div style={{
            background: '#161622', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', padding: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem', padding: '0 4px', transform: 'none' }} onClick={prevMonth}>‹</button>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>{monthNames[month]}, {year}</span>
                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem', padding: '0 4px', transform: 'none' }} onClick={nextMonth}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', textAlign: 'center' }}>
                {dayNames.map((d, i) => <div key={i} style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, padding: '4px 0', textTransform: 'uppercase' }}>{d}</div>)}
                {cells.map((d, i) => (
                    <div key={i} style={{
                        fontSize: '0.73rem',
                        padding: '5px 2px',
                        borderRadius: '7px',
                        color: isToday(d) ? '#fff' : (isWeekend(i) && d) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                        background: isToday(d) ? '#7c3aed' : (isWeekend(i) && d) ? 'rgba(255,255,255,0.02)' : 'transparent',
                        fontWeight: isToday(d) ? 800 : 400,
                    }}>
                        {d || ''}
                    </div>
                ))}
            </div>
            <div style={{
                marginTop: '12px', padding: '12px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9' }}>₹1.12L</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>Revenue Today</div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '20px' }}>
                    ↑ 12.4%
                </div>
            </div>
        </div>
    );
}

function OfficerDashboard({ user, onLogout, onNavigate }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [newsForm, setNewsForm] = useState({ title: '', content: '' });
    const [newsList, setNewsList] = useState([
        { id: 1, title: 'Schedule Update – Vyttila Extension', content: 'Services on Vyttila extension will run at reduced frequency this weekend.', date: '25 Feb 2026' },
        { id: 2, title: 'Maintenance Notice – Palarivattom', content: 'Palarivattom station under partial maintenance. Lift services suspended.', date: '24 Feb 2026' },
    ]);
    const [stationFilter, setStationFilter] = useState('All');
    const [aiQuery, setAiQuery] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const publishNews = (e) => {
        e.preventDefault();
        if (!newsForm.title.trim() || !newsForm.content.trim()) return;
        setNewsList(prev => [{
            id: Date.now(),
            title: newsForm.title,
            content: newsForm.content,
            date: currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }, ...prev]);
        setNewsForm({ title: '', content: '' });
    };

    const filteredStations = stationFilter === 'All'
        ? MOCK_STATIONS
        : MOCK_STATIONS.filter(s => s.status === stationFilter);

    const totalPassengers = MOCK_STATIONS.reduce((s, st) => s + st.passengers, 0);
    const totalRevenue = MOCK_STATIONS.reduce((s, st) => s + st.revenue, 0);
    const operationalCount = MOCK_STATIONS.filter(s => s.status === 'Operational').length;
    const delayedTrains = MOCK_TRAINS.filter(t => t.status === 'Delayed').length;
    const runningTrains = MOCK_TRAINS.filter(t => t.status === 'Running').length;

    const hourlyData = [
        { label: '7A', value: 1200 },
        { label: '8A', value: 3100, highlight: true },
        { label: '9A', value: 4600, highlight: true },
        { label: '10A', value: 2800 },
        { label: '11A', value: 2100 },
        { label: '12P', value: 2400 },
        { label: '1P', value: 1900 },
        { label: '2P', value: 1700 },
        { label: '3P', value: 2300 },
        { label: '4P', value: 3200 },
        { label: '5P', value: 5100, highlight: true },
        { label: '6P', value: 4200 },
    ];

    return (
        <div className="od-root">
            {/* ── Sidebar ── */}
            <aside className="od-sidebar">
                <div className="od-brand">
                    <div className="od-brand-icon-wrap">🏢</div>
                    <div className="od-brand-text">
                        <div className="od-brand-title">KMRL</div>
                        <div className="od-brand-sub">Ops Control</div>
                    </div>
                </div>

                <nav className="od-nav">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            className={`od-nav-btn ${activeTab === item.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.key)}
                            title={item.label}
                        >
                            <span className="od-nav-btn-icon">{item.icon}</span>
                            <span className="od-nav-btn-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="od-sidebar-footer">
                    <div className="od-user-info">
                        <div className="od-user-avatar">{(user?.fullName || 'O').charAt(0)}</div>
                        <div className="od-user-text">
                            <div className="od-user-name">{user?.fullName || 'KMRL Officer'}</div>
                            <div className="od-user-role">Operations Officer</div>
                        </div>
                    </div>
                    <button className="od-logout-btn" onClick={() => { onLogout(); onNavigate('home'); }}>
                        ⏻ Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="od-main">
                <div className="od-topbar">
                    <div className="od-topbar-left">
                        <h1 className="od-page-title">
                            {activeTab === 'overview' && 'System Overview'}
                            {activeTab === 'stations' && 'All Stations'}
                            {activeTab === 'trains' && 'Fleet Monitor'}
                            {activeTab === 'users' && 'User Management'}
                            {activeTab === 'news' && 'News & Updates'}
                            {activeTab === 'reports' && 'Reports & Analytics'}
                        </h1>
                        <p className="od-page-sub">
                            Kochi Metro Rail Limited · {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>
                    <div className="od-topbar-right">
                        <input className="od-search-topbar" type="text" placeholder="🔍  Search..." />
                        <div className="od-notif-btn" title="Notifications">🔔</div>
                        <button className="od-home-btn" onClick={() => onNavigate('home')}>← Main Site</button>
                    </div>
                </div>

                {/* ── Overview ── */}
                {activeTab === 'overview' && (
                    <div className="od-content">
                        {/* 4 Top stat cards */}
                        <div className="od-stats-grid">
                            {[
                                { label: 'Total Stations', value: MOCK_STATIONS.length, icon: '🚉', color: '#7c3aed', trend: `${operationalCount} active` },
                                { label: 'Fleet Running', value: runningTrains, icon: '🚆', color: '#10b981', trend: '↑ On schedule', type: 'up' },
                                { label: 'Delayed Trains', value: delayedTrains, icon: '⏳', color: delayedTrains > 0 ? '#f59e0b' : '#10b981', trend: delayedTrains > 0 ? 'Needs Action' : 'All clear', type: delayedTrains > 0 ? 'warn' : 'up' },
                                { label: 'Today Passengers', value: totalPassengers.toLocaleString(), icon: '👥', color: '#0066b3', trend: '↑ 8.3%', type: 'up' },
                            ].map(s => (
                                <div key={s.label} className="od-stat-card" style={{ '--stat-color': s.color }}>
                                    <div className="od-stat-top">
                                        <div className="od-stat-icon">{s.icon}</div>
                                        <span className={`od-stat-trend ${s.type === 'warn' ? 'warn' : ''}`}>{s.trend}</span>
                                    </div>
                                    <div className="od-stat-value">{s.value}</div>
                                    <div className="od-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Chart + Calendar */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '14px' }}>
                            <div className="od-card">
                                <div className="od-card-head">
                                    <span className="od-card-title">System-wide Passenger Load</span>
                                    <span className="od-card-badge">Today</span>
                                </div>
                                <MiniBarChart data={hourlyData} />
                            </div>
                            <CalendarWidget currentTime={currentTime} />
                        </div>

                        {/* Station + Fleet summary + AI */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: '14px' }}>
                            {/* Station Status */}
                            <div className="od-card">
                                <div className="od-card-head">
                                    <span className="od-card-title">Station Status</span>
                                    <span className="od-card-badge">{operationalCount}/{MOCK_STATIONS.length} OK</span>
                                </div>
                                {MOCK_STATIONS.map(s => (
                                    <div className="od-row" key={s.name}>
                                        <div className="od-row-left">
                                            <div className={`od-row-dot ${s.status === 'Maintenance' ? 'warn' : s.status === 'Closed' ? 'danger' : ''}`} />
                                            <div>
                                                <div className="od-row-id">{s.name}</div>
                                                <div className="od-sub">{s.passengers.toLocaleString()} passengers</div>
                                            </div>
                                        </div>
                                        <span className={`od-badge ${s.status === 'Operational' ? 'green' : s.status === 'Maintenance' ? 'amber' : 'red'}`}>
                                            {s.status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Fleet Status */}
                            <div className="od-card">
                                <div className="od-card-head">
                                    <span className="od-card-title">Fleet Status</span>
                                    <span className="od-card-badge">{MOCK_TRAINS.length} trains</span>
                                </div>
                                {MOCK_TRAINS.map(t => (
                                    <div className="od-row" key={t.id}>
                                        <div className="od-row-left">
                                            <div className={`od-row-dot ${t.status === 'Delayed' ? 'warn' : t.status === 'Maintenance' ? 'danger' : ''}`} />
                                            <div>
                                                <div className="od-row-id">{t.id}</div>
                                                <div className="od-sub">{t.from} → {t.to}</div>
                                            </div>
                                        </div>
                                        <span className={`od-badge ${t.status === 'Running' ? 'green' : t.status === 'Delayed' ? 'amber' : 'red'}`}>
                                            {t.status}{t.delay > 0 ? ` +${t.delay}m` : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* AI + Revenue */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Revenue donut */}
                                <div className="od-card">
                                    <div className="od-card-head">
                                        <span className="od-card-title">Revenue Split</span>
                                        <span className="od-card-badge">Today</span>
                                    </div>
                                    <div className="od-donut-section">
                                        <div className="od-donut">
                                            <svg width="140" height="140" viewBox="0 0 140 140">
                                                <circle cx="70" cy="70" r="55" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                                                <circle cx="70" cy="70" r="55" fill="none" stroke="#7c3aed" strokeWidth="20"
                                                    strokeDasharray={`${346.36 * 0.52} ${346.36}`}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 70 70)" />
                                                <circle cx="70" cy="70" r="55" fill="none" stroke="#10b981" strokeWidth="20"
                                                    strokeDasharray={`${346.36 * 0.28} ${346.36}`}
                                                    strokeDashoffset={`${-346.36 * 0.52}`}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 70 70)" />
                                                <circle cx="70" cy="70" r="55" fill="none" stroke="#f59e0b" strokeWidth="20"
                                                    strokeDasharray={`${346.36 * 0.2} ${346.36}`}
                                                    strokeDashoffset={`${-346.36 * 0.80}`}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 70 70)" />
                                            </svg>
                                            <div className="od-donut-inner">
                                                <div className="od-donut-num">₹{(totalRevenue / 1000).toFixed(0)}K</div>
                                                <div className="od-donut-label">Total</div>
                                            </div>
                                        </div>
                                        <div className="od-legend">
                                            {[
                                                { name: 'Ticket Sales', val: '52%', color: '#7c3aed' },
                                                { name: 'Smart Card', val: '28%', color: '#10b981' },
                                                { name: 'Other', val: '20%', color: '#f59e0b' },
                                            ].map(l => (
                                                <div className="od-legend-row" key={l.name}>
                                                    <div className="od-legend-left">
                                                        <div className="od-legend-dot" style={{ background: l.color }} />
                                                        <span className="od-legend-name">{l.name}</span>
                                                    </div>
                                                    <span className="od-legend-val">{l.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Box */}
                                <div className="od-ai-box">
                                    <span className="od-ai-title">✦ Ops Assistant</span>
                                    <p className="od-ai-body">
                                        System performing at 83% capacity. Palarivattom maintenance may cause overcrowding at adjacent stations during evening peak.
                                    </p>
                                    <div className="od-ai-input-row">
                                        <input className="od-ai-input" placeholder="Ask anything..." value={aiQuery} onChange={e => setAiQuery(e.target.value)} />
                                        <button className="od-ai-send">➤</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Stations ── */}
                {activeTab === 'stations' && (
                    <div className="od-content">
                        {/* Summary stats */}
                        <div className="od-stats-grid">
                            {[
                                { label: 'Operational', value: MOCK_STATIONS.filter(s => s.status === 'Operational').length, color: '#10b981', trend: 'Running Smooth' },
                                { label: 'Maintenance', value: MOCK_STATIONS.filter(s => s.status === 'Maintenance').length, color: '#f59e0b', trend: 'Partial Service' },
                                { label: 'Closed', value: MOCK_STATIONS.filter(s => s.status === 'Closed').length, color: '#ef4444', trend: 'No Service' },
                                { label: 'Total Passengers', value: totalPassengers.toLocaleString(), color: '#7c3aed', trend: '↑ 8.3%' },
                            ].map(s => (
                                <div key={s.label} className="od-stat-card" style={{ '--stat-color': s.color }}>
                                    <div className="od-stat-top">
                                        <div />
                                        <span className="od-stat-trend">{s.trend}</span>
                                    </div>
                                    <div className="od-stat-value">{s.value}</div>
                                    <div className="od-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="od-filter-row">
                            {['All', 'Operational', 'Maintenance', 'Closed'].map(f => (
                                <button
                                    key={f}
                                    className={`od-filter-btn ${stationFilter === f ? 'active' : ''}`}
                                    onClick={() => setStationFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="od-card">
                            <div className="od-card-head">
                                <span className="od-card-title">Station Directory</span>
                                <span className="od-card-badge">{filteredStations.length} stations</span>
                            </div>
                            <table className="od-table">
                                <thead>
                                    <tr>
                                        <th>Station</th>
                                        <th>Status</th>
                                        <th>Passengers Today</th>
                                        <th>Revenue Today</th>
                                        <th>Station Master</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStations.map(s => (
                                        <tr key={s.name}>
                                            <td><strong>{s.name}</strong></td>
                                            <td>
                                                <span className={`od-badge ${s.status === 'Operational' ? 'green' : s.status === 'Maintenance' ? 'amber' : 'red'}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td>{s.passengers.toLocaleString()}</td>
                                            <td style={{ color: '#a78bfa', fontWeight: 600 }}>₹{s.revenue.toLocaleString()}</td>
                                            <td>{s.master}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Passenger load bar chart */}
                        <div className="od-card">
                            <div className="od-card-head">
                                <span className="od-card-title">Passenger Load by Station</span>
                            </div>
                            <div className="od-bar-chart">
                                {MOCK_STATIONS.map(s => (
                                    <div className="od-bar-row" key={s.name}>
                                        <span className="od-bar-label">{s.name}</span>
                                        <div className="od-bar-track">
                                            <div className="od-bar-fill" style={{ width: `${Math.min(100, (s.passengers / 7000) * 100).toFixed(0)}%` }} />
                                        </div>
                                        <span className="od-bar-val">{s.passengers.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Fleet Monitor ── */}
                {activeTab === 'trains' && (
                    <div className="od-content">
                        <div className="od-stats-grid">
                            {[
                                { label: 'Running', value: runningTrains, color: '#10b981', trend: 'On Schedule' },
                                { label: 'Delayed', value: delayedTrains, color: '#f59e0b', trend: `+${delayedTrains * 3}m avg` },
                                { label: 'Maintenance', value: MOCK_TRAINS.filter(t => t.status === 'Maintenance').length, color: '#ef4444', trend: 'Offline' },
                                { label: 'Total Onboard', value: MOCK_TRAINS.reduce((s, t) => s + t.passengers, 0), color: '#7c3aed', trend: 'Across fleet' },
                            ].map(s => (
                                <div key={s.label} className="od-stat-card" style={{ '--stat-color': s.color }}>
                                    <div className="od-stat-top">
                                        <div />
                                        <span className={`od-stat-trend ${s.label === 'Delayed' || s.label === 'Maintenance' ? 'warn' : ''}`}>{s.trend}</span>
                                    </div>
                                    <div className="od-stat-value">{s.value}</div>
                                    <div className="od-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="od-card">
                            <div className="od-card-head">
                                <span className="od-card-title">Fleet Monitor</span>
                                <span className="od-card-badge">{MOCK_TRAINS.length} trains</span>
                            </div>
                            <table className="od-table">
                                <thead>
                                    <tr>
                                        <th>Train ID</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Passengers</th>
                                        <th>Delay</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_TRAINS.map(t => (
                                        <tr key={t.id}>
                                            <td><strong>{t.id}</strong></td>
                                            <td>{t.from}</td>
                                            <td>{t.to}</td>
                                            <td>{t.passengers}</td>
                                            <td style={{ color: t.delay > 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>
                                                {t.delay > 0 ? `+${t.delay} min` : '—'}
                                            </td>
                                            <td>
                                                <span className={`od-badge ${t.status === 'Running' ? 'green' : t.status === 'Delayed' ? 'amber' : 'red'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Users ── */}
                {activeTab === 'users' && (
                    <div className="od-content">
                        <div className="od-stats-grid">
                            {[
                                { label: 'Total Users', value: MOCK_USERS.length, color: '#7c3aed', trend: 'Registered' },
                                { label: 'Customers', value: MOCK_USERS.filter(u => u.role === 'Customer').length, color: '#10b981', trend: 'Active passengers' },
                                { label: 'Officers', value: MOCK_USERS.filter(u => u.role === 'Officer').length, color: '#0066b3', trend: 'Operations team' },
                                { label: 'Stn Masters', value: MOCK_USERS.filter(u => u.role === 'Station Master').length, color: '#f59e0b', trend: 'Station assigned' },
                            ].map(s => (
                                <div key={s.label} className="od-stat-card" style={{ '--stat-color': s.color }}>
                                    <div className="od-stat-top">
                                        <div />
                                        <span className="od-stat-trend">{s.trend}</span>
                                    </div>
                                    <div className="od-stat-value">{s.value}</div>
                                    <div className="od-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="od-card">
                            <div className="od-card-head">
                                <span className="od-card-title">User Directory</span>
                                <span className="od-card-badge">{MOCK_USERS.length} users</span>
                            </div>
                            <table className="od-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_USERS.map(u => (
                                        <tr key={u.username}>
                                            <td><strong>{u.username}</strong></td>
                                            <td>{u.fullName}</td>
                                            <td>
                                                <span className={`od-badge ${u.role === 'Officer' ? 'blue' : u.role === 'Station Master' ? 'purple' : 'green'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>{u.email}</td>
                                            <td>
                                                <span className={`od-badge ${u.status === 'Active' ? 'green' : 'amber'}`}>{u.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── News ── */}
                {activeTab === 'news' && (
                    <div className="od-content">
                        <div className="od-two-col">
                            <div className="od-card">
                                <div className="od-card-head">
                                    <span className="od-card-title">Publish New Update</span>
                                </div>
                                <form onSubmit={publishNews} className="od-form">
                                    <label>Headline / Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter news headline..."
                                        value={newsForm.title}
                                        onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))}
                                        required
                                    />
                                    <label>Content</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Enter full announcement or news content..."
                                        value={newsForm.content}
                                        onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))}
                                        required
                                    />
                                    <button type="submit" className="od-primary-btn">📰 Publish Update</button>
                                </form>
                            </div>
                            <div className="od-card">
                                <div className="od-card-head">
                                    <span className="od-card-title">Published Updates</span>
                                    <span className="od-card-badge">{newsList.length} items</span>
                                </div>
                                {newsList.map(n => (
                                    <div className="od-news-row" key={n.id}>
                                        <strong>{n.title}</strong>
                                        <p>{n.content}</p>
                                        <span className="od-news-date">📅 {n.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Reports ── */}
                {activeTab === 'reports' && (
                    <div className="od-content">
                        {/* Revenue chart */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '14px' }}>
                            <div className="od-card">
                                <div className="od-card-head">
                                    <span className="od-card-title">Revenue Trend (Hourly)</span>
                                    <span className="od-card-badge">Today</span>
                                </div>
                                <MiniBarChart
                                    data={[
                                        { label: '7A', value: 4200 },
                                        { label: '8A', value: 11800, highlight: true },
                                        { label: '9A', value: 18400, highlight: true },
                                        { label: '10A', value: 8900 },
                                        { label: '11A', value: 6100 },
                                        { label: '12P', value: 7200 },
                                        { label: '1P', value: 5400 },
                                        { label: '2P', value: 4800 },
                                        { label: '3P', value: 7100 },
                                        { label: '4P', value: 10200 },
                                        { label: '5P', value: 19100, highlight: true },
                                        { label: '6P', value: 13800 },
                                    ]}
                                    color="#a855f7"
                                />
                            </div>

                            {/* Invoices-style panel */}
                            <div className="od-card">
                                <div className="od-card-head">
                                    <span className="od-card-title">Revenue Summary</span>
                                    <span className="od-card-badge">+ View All</span>
                                </div>
                                <div className="od-payment-score">
                                    <span className="od-score-label">System Score</span>
                                    <div className="od-score-bar"><div className="od-score-fill" /></div>
                                    <span className="od-score-num">76</span>
                                </div>
                                {[
                                    { station: 'MG Road Junction', date: 'in 2 days', status: 'Pending', amount: '₹38,900', statusColor: 'amber' },
                                    { station: 'Aluva Station', date: 'Today', status: 'Received', amount: '₹24,200', statusColor: 'green' },
                                    { station: 'Vyttila Junction', date: 'in 1 week', status: 'Pending', amount: '₹19,700', statusColor: 'amber' },
                                ].map((inv, i) => (
                                    <div className="od-invoice-row" key={i}>
                                        <div className="od-invoice-meta">
                                            <div className="od-invoice-name">{inv.station}</div>
                                            <div className="od-invoice-date">{inv.date}</div>
                                        </div>
                                        <span className={`od-badge ${inv.statusColor}`}>{inv.status}</span>
                                        <span className="od-invoice-amount">{inv.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4 report cards */}
                        <div className="od-stats-grid">
                            {[
                                { label: 'Total Revenue (Today)', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, icon: '💰', color: '#10b981', trend: '↑ 12.4%' },
                                { label: 'Tickets Issued', value: totalPassengers.toLocaleString(), icon: '🎫', color: '#7c3aed', trend: '↑ 8.3%' },
                                { label: 'Peak Hour (AM)', value: '8:00–9:30', icon: '⏰', color: '#f59e0b', trend: 'Morning' },
                                { label: 'Peak Hour (PM)', value: '5:30–7:00', icon: '🌆', color: '#0066b3', trend: 'Evening' },
                            ].map(s => (
                                <div key={s.label} className="od-stat-card" style={{ '--stat-color': s.color }}>
                                    <div className="od-stat-top">
                                        <div className="od-stat-icon">{s.icon}</div>
                                        <span className="od-stat-trend">{s.trend}</span>
                                    </div>
                                    <div className="od-stat-value">{s.value}</div>
                                    <div className="od-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Passenger load per station */}
                        <div className="od-card">
                            <div className="od-card-head">
                                <span className="od-card-title">Passenger Load by Station</span>
                            </div>
                            <div className="od-bar-chart">
                                {MOCK_STATIONS.map(s => (
                                    <div className="od-bar-row" key={s.name}>
                                        <span className="od-bar-label">{s.name}</span>
                                        <div className="od-bar-track">
                                            <div className="od-bar-fill" style={{ width: `${Math.min(100, (s.passengers / 7000) * 100).toFixed(0)}%` }} />
                                        </div>
                                        <span className="od-bar-val">{s.passengers.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default OfficerDashboard;
