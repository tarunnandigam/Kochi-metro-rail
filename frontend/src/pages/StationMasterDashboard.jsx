import React, { useState, useEffect } from 'react';
import '../styles/StationMasterDashboard.css';

const STATION = 'Aluva';

const mockTrains = [
    { id: 'KM-101', route: 'Aluva → MG Road', status: 'On Time', nextArrival: '10:42 AM', platform: '1', passengers: 312 },
    { id: 'KM-102', route: 'MG Road → Aluva', status: 'Delayed 3m', nextArrival: '10:55 AM', platform: '2', passengers: 198 },
    { id: 'KM-103', route: 'Aluva → Vyttila', status: 'On Time', nextArrival: '11:10 AM', platform: '1', passengers: 267 },
    { id: 'KM-104', route: 'Vyttila → Aluva', status: 'On Time', nextArrival: '11:22 AM', platform: '2', passengers: 143 },
];

const mockIncidents = [
    { id: 1, type: 'Overcrowding', platform: '1', time: '10:20 AM', status: 'Resolved' },
    { id: 2, type: 'Lift Malfunction', platform: 'Entry Gate', time: '09:55 AM', status: 'Active' },
];

const mockFacilities = [
    { name: 'ATM', icon: '🏧', status: 'Operational' },
    { name: 'WiFi', icon: '📶', status: 'Operational' },
    { name: 'Restrooms', icon: '🚻', status: 'Maintenance' },
    { name: 'Lifts (P1)', icon: '🛗', status: 'Fault' },
    { name: 'CCTV', icon: '📷', status: 'Operational' },
    { name: 'Ticket Counter', icon: '🎫', status: 'Operational' },
    { name: 'Drinking Water', icon: '💧', status: 'Operational' },
    { name: 'First Aid', icon: '🚑', status: 'Operational' },
    { name: 'Fire Safety', icon: '🧯', status: 'Maintenance' },
];

const navItems = [
    { key: 'overview', icon: '⊞', label: 'Overview' },
    { key: 'trains', icon: '⟹', label: 'Train Monitor' },
    { key: 'incidents', icon: '⚠', label: 'Incidents' },
    { key: 'facilities', icon: '⚙', label: 'Facilities' },
    { key: 'announcements', icon: '📢', label: 'Announcements' },
];

// Mini bar-chart component
function MiniBarChart({ data }) {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', padding: '0 18px 14px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div
                        style={{
                            width: '100%',
                            height: `${(d.value / max) * 64}px`,
                            background: d.highlight
                                ? 'linear-gradient(180deg, #38bdf8, #0066b3)'
                                : 'rgba(255,255,255,0.08)',
                            borderRadius: '4px 4px 0 0',
                            position: 'relative',
                            transition: 'height 0.4s ease',
                            cursor: 'pointer',
                        }}
                        title={`${d.label}: ${d.value}`}
                    />
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{d.label}</span>
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

    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1; // Mon-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const cells = [];
    for (let i = 0; i < adjustedFirst; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);

    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    const isToday = (d) => d && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isWeekend = (idx) => idx % 7 === 5 || idx % 7 === 6;

    return (
        <div className="sm-calendar">
            <div className="sm-cal-header">
                <button className="sm-cal-nav" onClick={prevMonth}>‹</button>
                <span className="sm-cal-title">{monthNames[month]}, {year}</span>
                <button className="sm-cal-nav" onClick={nextMonth}>›</button>
            </div>
            <div className="sm-cal-grid">
                {dayNames.map((d, i) => (
                    <div key={i} className="sm-cal-day-name">{d}</div>
                ))}
                {cells.map((d, i) => (
                    <div
                        key={i}
                        className={`sm-cal-day ${isToday(d) ? 'today' : ''} ${d === null ? 'striped' : ''} ${isWeekend(i) && d ? 'striped' : ''}`}
                    >
                        {d || ''}
                    </div>
                ))}
            </div>
            <div className="sm-cal-metric">
                <div>
                    <div className="sm-cal-metric-val">4,821</div>
                    <div className="sm-cal-metric-label">Passengers Today</div>
                </div>
                <div className="sm-cal-metric-trend">↑ 8.3%</div>
            </div>
        </div>
    );
}

function StationMasterDashboard({ user, onLogout, onNavigate }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [incidentForm, setIncidentForm] = useState({ type: '', platform: '', description: '' });
    const [incidents, setIncidents] = useState(mockIncidents);
    const [announcement, setAnnouncement] = useState('');
    const [announcements, setAnnouncements] = useState([
        { id: 1, text: 'Platform 1 unusually crowded. Please maintain distance.', time: '10:05 AM' }
    ]);
    const [trainSearch, setTrainSearch] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [aiQuery, setAiQuery] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const filteredTrains = mockTrains.filter(t =>
        t.id.toLowerCase().includes(trainSearch.toLowerCase()) ||
        t.route.toLowerCase().includes(trainSearch.toLowerCase())
    );

    const handleReportIncident = (e) => {
        e.preventDefault();
        if (!incidentForm.type || !incidentForm.platform) return;
        const newIncident = {
            id: Date.now(),
            type: incidentForm.type,
            platform: incidentForm.platform,
            time: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Active'
        };
        setIncidents(prev => [newIncident, ...prev]);
        setIncidentForm({ type: '', platform: '', description: '' });
    };

    const resolveIncident = (id) => {
        setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'Resolved' } : i));
    };

    const postAnnouncement = (e) => {
        e.preventDefault();
        if (!announcement.trim()) return;
        setAnnouncements(prev => [{
            id: Date.now(),
            text: announcement,
            time: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }, ...prev]);
        setAnnouncement('');
    };

    const activeIncidents = incidents.filter(i => i.status === 'Active').length;
    const operationalFacilities = mockFacilities.filter(f => f.status === 'Operational').length;

    const statCards = [
        {
            label: 'Trains Today',
            value: '28',
            icon: '🚆',
            color: '#0066b3',
            trend: '+2',
            trendType: 'up'
        },
        {
            label: 'Passengers Today',
            value: '4,821',
            icon: '👥',
            color: '#0d9488',
            trend: '↑ 8.3%',
            trendType: 'up'
        },
        {
            label: 'Active Incidents',
            value: activeIncidents,
            icon: '⚠️',
            color: activeIncidents > 0 ? '#f59e0b' : '#10b981',
            trend: activeIncidents > 0 ? 'Needs Attention' : 'All Clear',
            trendType: activeIncidents > 0 ? 'warn' : 'up'
        },
        {
            label: 'Facilities OK',
            value: `${operationalFacilities}/${mockFacilities.length}`,
            icon: '✅',
            color: '#10b981',
            trend: `${mockFacilities.length - operationalFacilities} issues`,
            trendType: mockFacilities.length - operationalFacilities > 0 ? 'warn' : 'up'
        },
    ];

    // Passenger load data for bar chart (hourly)
    const hourlyData = [
        { label: '7AM', value: 320 },
        { label: '8AM', value: 810 },
        { label: '9AM', value: 1240, highlight: true },
        { label: '10AM', value: 680 },
        { label: '11AM', value: 490 },
        { label: '12PM', value: 570 },
        { label: '1PM', value: 430 },
        { label: '2PM', value: 380 },
        { label: '3PM', value: 510 },
        { label: '4PM', value: 740 },
        { label: '5PM', value: 1190 },
        { label: '6PM', value: 960 },
    ];

    return (
        <div className="sm-root">
            {/* ── Sidebar ── */}
            <aside className="sm-sidebar">
                <div className="sm-sidebar-brand">
                    <div className="sm-brand-icon-wrap">🚇</div>
                    <div className="sm-brand-text">
                        <div className="sm-brand-title">KMRL</div>
                        <div className="sm-brand-sub">Station Control</div>
                    </div>
                </div>

                <div className="sm-station-badge">
                    <span className="sm-station-label">Assigned Station</span>
                    <span className="sm-station-name">{user?.stationAssigned || STATION}</span>
                </div>

                <nav className="sm-nav">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            className={`sm-nav-btn ${activeTab === item.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.key)}
                            title={item.label}
                        >
                            <span className="sm-nav-btn-icon">{item.icon}</span>
                            <span className="sm-nav-btn-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sm-sidebar-footer">
                    <div className="sm-user-info">
                        <div className="sm-user-avatar">{(user?.fullName || 'SM').charAt(0)}</div>
                        <div className="sm-user-text">
                            <div className="sm-user-name">{user?.fullName || 'Station Master'}</div>
                            <div className="sm-user-role">Station Master</div>
                        </div>
                    </div>
                    <button className="sm-logout-btn" onClick={() => { onLogout(); onNavigate('home'); }}>
                        ⏻ Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="sm-main">
                {/* Top Bar */}
                <div className="sm-topbar">
                    <div className="sm-topbar-left">
                        <h1 className="sm-page-title">
                            {activeTab === 'overview' && 'Station Overview'}
                            {activeTab === 'trains' && 'Train Monitor'}
                            {activeTab === 'incidents' && 'Incident Management'}
                            {activeTab === 'facilities' && 'Facility Status'}
                            {activeTab === 'announcements' && 'Announcements'}
                        </h1>
                        <p className="sm-page-sub">
                            {user?.stationAssigned || STATION} Station · {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>
                    <div className="sm-topbar-right">
                        <input
                            className="sm-search-topbar"
                            type="text"
                            placeholder="🔍  Search..."
                        />
                        <div className="sm-notif-btn" title="Notifications">
                            🔔
                            {activeIncidents > 0 && <span className="sm-notif-dot" />}
                        </div>
                        <button className="sm-home-btn" onClick={() => onNavigate('home')}>← Main Site</button>
                    </div>
                </div>

                {/* ── Overview Tab ── */}
                {activeTab === 'overview' && (
                    <div className="sm-content">
                        {/* Stat Cards */}
                        <div className="sm-stats-grid">
                            {statCards.map(stat => (
                                <div
                                    className="sm-stat-card"
                                    key={stat.label}
                                    style={{ '--stat-color': stat.color }}
                                >
                                    <div className="sm-stat-top">
                                        <div className="sm-stat-icon">{stat.icon}</div>
                                        <span className={`sm-stat-trend ${stat.trendType === 'warn' ? 'warn' : ''} ${stat.trendType === 'danger' ? 'danger' : ''}`}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <div className="sm-stat-value">{stat.value}</div>
                                    <div className="sm-stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Main 2-col section */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px' }}>
                            {/* Passenger Load Chart */}
                            <div className="sm-card">
                                <div className="sm-card-head">
                                    <span className="sm-card-title">Hourly Passenger Load</span>
                                    <span className="sm-card-badge">Today</span>
                                </div>
                                <MiniBarChart data={hourlyData} />
                            </div>

                            {/* Calendar */}
                            <CalendarWidget currentTime={currentTime} />
                        </div>

                        {/* Bottom row */}
                        <div className="sm-two-col">
                            {/* Upcoming Trains */}
                            <div className="sm-card">
                                <div className="sm-card-head">
                                    <span className="sm-card-title">Upcoming Trains</span>
                                    <span className="sm-card-badge">{mockTrains.length} scheduled</span>
                                </div>
                                {mockTrains.map(t => (
                                    <div className="sm-train-row" key={t.id}>
                                        <div className="sm-row-left">
                                            <div className={`sm-row-dot ${t.status !== 'On Time' ? 'delay' : ''}`} />
                                            <div>
                                                <div className="sm-row-id">{t.id}</div>
                                                <div className="sm-row-sub">{t.route} · Platform {t.platform}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="sm-train-time">{t.nextArrival}</div>
                                            <span className={`sm-status-badge ${t.status === 'On Time' ? 'green' : 'amber'}`}>
                                                {t.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Incidents + AI Box */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="sm-card">
                                    <div className="sm-card-head">
                                        <span className="sm-card-title">Recent Incidents</span>
                                        {activeIncidents > 0 && (
                                            <span className="sm-card-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                                                {activeIncidents} Active
                                            </span>
                                        )}
                                    </div>
                                    {incidents.slice(0, 2).map(inc => (
                                        <div className="sm-incident-row" key={inc.id}>
                                            <div className="sm-row-left">
                                                <div className={`sm-row-dot ${inc.status === 'Active' ? 'danger' : ''}`} />
                                                <div>
                                                    <div className="sm-row-id">{inc.type}</div>
                                                    <div className="sm-row-sub">Platform: {inc.platform} · {inc.time}</div>
                                                </div>
                                            </div>
                                            <span className={`sm-status-badge ${inc.status === 'Resolved' ? 'green' : 'red'}`}>
                                                {inc.status}
                                            </span>
                                        </div>
                                    ))}
                                    {incidents.filter(i => i.status === 'Active').length === 0 && (
                                        <p className="sm-empty">No active incidents ✅</p>
                                    )}
                                </div>

                                {/* AI Assistant */}
                                <div className="sm-ai-box">
                                    <div className="sm-ai-header">
                                        <span className="sm-ai-title">✦ Station Assistant</span>
                                    </div>
                                    <p className="sm-ai-body">
                                        Station activity is stable. Next peak expected at 5:30 PM. Lift malfunction at Entry Gate remains unresolved — consider dispatch.
                                    </p>
                                    <div className="sm-ai-input-row">
                                        <input
                                            className="sm-ai-input"
                                            placeholder="Ask anything about this station..."
                                            value={aiQuery}
                                            onChange={e => setAiQuery(e.target.value)}
                                        />
                                        <button className="sm-ai-send">➤</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Train Monitor Tab ── */}
                {activeTab === 'trains' && (
                    <div className="sm-content">
                        <div className="sm-search-bar">
                            <input
                                type="text"
                                placeholder="Search by Train ID or Route..."
                                value={trainSearch}
                                onChange={e => setTrainSearch(e.target.value)}
                                className="sm-search-input"
                            />
                        </div>

                        {/* Stat row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                            {[
                                { label: 'Running On Time', value: mockTrains.filter(t => t.status === 'On Time').length, color: '#10b981' },
                                { label: 'Delayed', value: mockTrains.filter(t => t.status !== 'On Time').length, color: '#f59e0b' },
                                { label: 'Total Passengers', value: mockTrains.reduce((s, t) => s + t.passengers, 0).toLocaleString(), color: '#0066b3' },
                            ].map(s => (
                                <div key={s.label} className="sm-stat-card" style={{ '--stat-color': s.color }}>
                                    <div className="sm-stat-value">{s.value}</div>
                                    <div className="sm-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="sm-card">
                            <div className="sm-card-head">
                                <span className="sm-card-title">Train Schedule</span>
                                <span className="sm-card-badge">{filteredTrains.length} trains</span>
                            </div>
                            <table className="sm-table">
                                <thead>
                                    <tr>
                                        <th>Train ID</th>
                                        <th>Route</th>
                                        <th>Platform</th>
                                        <th>Next Arrival</th>
                                        <th>Passengers</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTrains.map(t => (
                                        <tr key={t.id}>
                                            <td><strong>{t.id}</strong></td>
                                            <td>{t.route}</td>
                                            <td>Platform {t.platform}</td>
                                            <td style={{ color: '#38bdf8', fontWeight: 600 }}>{t.nextArrival}</td>
                                            <td>{t.passengers}</td>
                                            <td>
                                                <span className={`sm-status-badge ${t.status === 'On Time' ? 'green' : 'amber'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Passenger distribution card */}
                        <div className="sm-card">
                            <div className="sm-card-head">
                                <span className="sm-card-title">Passenger Distribution by Train</span>
                            </div>
                            <div className="sm-bar-chart">
                                {filteredTrains.map(t => (
                                    <div className="sm-bar-row" key={t.id}>
                                        <span className="sm-bar-label">{t.id}</span>
                                        <div className="sm-bar-track">
                                            <div
                                                className="sm-bar-fill"
                                                style={{ width: `${(t.passengers / 400) * 100}%` }}
                                            />
                                        </div>
                                        <span className="sm-bar-val">{t.passengers}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Incidents Tab ── */}
                {activeTab === 'incidents' && (
                    <div className="sm-content">
                        <div className="sm-two-col">
                            <div className="sm-card">
                                <div className="sm-card-head">
                                    <span className="sm-card-title">Report New Incident</span>
                                </div>
                                <form onSubmit={handleReportIncident} className="sm-form">
                                    <label>Incident Type</label>
                                    <select
                                        value={incidentForm.type}
                                        onChange={e => setIncidentForm(p => ({ ...p, type: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select type...</option>
                                        <option>Overcrowding</option>
                                        <option>Lift Malfunction</option>
                                        <option>Medical Emergency</option>
                                        <option>Security Concern</option>
                                        <option>Track Signal Issue</option>
                                        <option>Power Failure</option>
                                        <option>Other</option>
                                    </select>
                                    <label>Location / Platform</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Platform 1, Entry Gate..."
                                        value={incidentForm.platform}
                                        onChange={e => setIncidentForm(p => ({ ...p, platform: e.target.value }))}
                                        required
                                    />
                                    <label>Description (optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Brief description..."
                                        value={incidentForm.description}
                                        onChange={e => setIncidentForm(p => ({ ...p, description: e.target.value }))}
                                    />
                                    <button type="submit" className="sm-primary-btn">⚠ Report Incident</button>
                                </form>
                            </div>

                            <div className="sm-card">
                                <div className="sm-card-head">
                                    <span className="sm-card-title">Active & Recent Incidents</span>
                                    {activeIncidents > 0 && (
                                        <span className="sm-card-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                                            {activeIncidents} Active
                                        </span>
                                    )}
                                </div>
                                {incidents.map(inc => (
                                    <div className="sm-incident-row" key={inc.id}>
                                        <div className="sm-row-left">
                                            <div className={`sm-row-dot ${inc.status === 'Active' ? 'danger' : ''}`} />
                                            <div>
                                                <div className="sm-row-id">{inc.type}</div>
                                                <div className="sm-row-sub">Platform: {inc.platform} · {inc.time}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                            <span className={`sm-status-badge ${inc.status === 'Resolved' ? 'green' : 'red'}`}>
                                                {inc.status}
                                            </span>
                                            {inc.status === 'Active' && (
                                                <button className="sm-resolve-btn" onClick={() => resolveIncident(inc.id)}>
                                                    ✓ Mark Resolved
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Facilities Tab ── */}
                {activeTab === 'facilities' && (
                    <div className="sm-content">
                        {/* Summary badges */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                            {[
                                { label: 'Operational', value: mockFacilities.filter(f => f.status === 'Operational').length, color: '#10b981' },
                                { label: 'Under Maintenance', value: mockFacilities.filter(f => f.status === 'Maintenance').length, color: '#f59e0b' },
                                { label: 'Fault / Offline', value: mockFacilities.filter(f => f.status === 'Fault').length, color: '#ef4444' },
                            ].map(s => (
                                <div key={s.label} className="sm-stat-card" style={{ '--stat-color': s.color }}>
                                    <div className="sm-stat-value">{s.value}</div>
                                    <div className="sm-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="sm-card">
                            <div className="sm-card-head">
                                <span className="sm-card-title">Facility Status Board</span>
                                <span className="sm-card-badge">{mockFacilities.length} facilities</span>
                            </div>
                            <div className="sm-facilities-grid">
                                {mockFacilities.map(f => (
                                    <div className="sm-facility-card" key={f.name}>
                                        <div className="sm-facility-icon">{f.icon}</div>
                                        <div className="sm-facility-name">{f.name}</div>
                                        <span className={`sm-status-badge ${f.status === 'Operational' ? 'green' : f.status === 'Maintenance' ? 'amber' : 'red'}`}>
                                            {f.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Announcements Tab ── */}
                {activeTab === 'announcements' && (
                    <div className="sm-content">
                        <div className="sm-two-col">
                            <div className="sm-card">
                                <div className="sm-card-head">
                                    <span className="sm-card-title">Post Station Announcement</span>
                                </div>
                                <form onSubmit={postAnnouncement} className="sm-form">
                                    <label>Announcement Message</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Type your station-wide announcement..."
                                        value={announcement}
                                        onChange={e => setAnnouncement(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="sm-primary-btn">📢 Broadcast Announcement</button>
                                </form>
                            </div>
                            <div className="sm-card">
                                <div className="sm-card-head">
                                    <span className="sm-card-title">Recent Announcements</span>
                                    <span className="sm-card-badge">{announcements.length} total</span>
                                </div>
                                {announcements.map(a => (
                                    <div className="sm-announcement-row" key={a.id}>
                                        <p>{a.text}</p>
                                        <span className="sm-ann-time">🕐 {a.time}</span>
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

export default StationMasterDashboard;
