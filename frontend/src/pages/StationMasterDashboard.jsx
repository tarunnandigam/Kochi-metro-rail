git commit -m "Station master dashboard UI updates"
import React, { useState, useEffect } from 'react';
import '../styles/StationMasterDashboard.css';

const STATION = 'Aluva';

const mockTrains = [
    { id: 'KM-101', route: 'Aluva → MG Road', status: 'On Time', nextArrival: '10:42 AM', platform: '1', passengers: 312 },
    { id: 'KM-102', route: 'MG Road → Aluva', status: 'Delayed 3m', nextArrival: '10:55 AM', platform: '2', passengers: 198 },
    { id: 'KM-103', route: 'Aluva → Vyttila', status: 'On Time', nextArrival: '11:10 AM', platform: '1', passengers: 267 },
    { id: 'KM-104', route: 'Vyttila → Aluva', status: 'On Time', nextArrival: '11:22 AM', platform: '2', passengers: 143 },
];

<<<<<<< Updated upstream
const mockIncidents = [
=======
// Ordered list of all stations (North→South)
const STATION_NAMES = KMRL_STATIONS.map(s => s.name);
const getStationFactor = (name) => KMRL_STATIONS.find(s => s.name === name)?.factor ?? 1;

/* ── Seeded per-date data (station-aware) ─────────────────────────────── */
const seedDate = (d, stationFactor = 1) => {
    const v = (d.getDate() * 37 + d.getMonth() * 17 + d.getFullYear()) % 100;
    const base = 2800 + Math.round(v * 42.5);
    return {
        passengers: Math.round(base * stationFactor),
        trains: 22 + (v % 8),
        incidents: v % 5 === 0 ? 2 : v % 7 === 0 ? 1 : 0,
        revenue: Math.round((14000 + Math.round(v * 980)) * stationFactor),
    };
};

const HOURLY_BASE = [320, 810, 1240, 680, 490, 570, 430, 380, 510, 740, 1190, 960];
const HOUR_LABELS = ['7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'];

const seedHourly = (d, factor = 1) =>
    HOURLY_BASE.map(b => Math.max(100, Math.round(b * factor + (d.getDate() % 5) * 30)));

/* ── Train schedule with per-train station stops list ─────────────────── */
// Each train entry lists every station it halts at (in order).
// Northbound (Petta→Aluva) and Southbound (Aluva→Petta) services.
const BASE_TRAINS = [
    {
        id: 'KM-101', route: 'Aluva → Petta', platform: '1',
        stations: ['Aluva', 'Pulinchodu', 'Companypady', 'Ambattukavu', 'Muttom', 'Kalamassery', 'Cusat', 'Pathadipalam', 'Edapally', 'Changampuzha Park', 'Palarivattom', 'JLN Stadium', 'Kaloor', 'Lissie', 'MG Road', 'Maharajas College', 'Ernakulam South', 'Kadavanthra', 'Elamkulam', 'Vyttila', 'Thaikoodam', 'Petta'],
        times: ['07:12 AM', '09:42 AM', '12:05 PM', '03:30 PM', '06:10 PM'],
    },
    {
        id: 'KM-102', route: 'Petta → Aluva', platform: '2',
        stations: ['Petta', 'Thaikoodam', 'Vyttila', 'Elamkulam', 'Kadavanthra', 'Ernakulam South', 'Maharajas College', 'MG Road', 'Lissie', 'Kaloor', 'JLN Stadium', 'Palarivattom', 'Changampuzha Park', 'Edapally', 'Pathadipalam', 'Cusat', 'Kalamassery', 'Muttom', 'Ambattukavu', 'Companypady', 'Pulinchodu', 'Aluva'],
        times: ['07:50 AM', '10:25 AM', '01:00 PM', '04:15 PM', '07:00 PM'],
    },
    {
        id: 'KM-103', route: 'Aluva → Vyttila', platform: '1',
        stations: ['Aluva', 'Pulinchodu', 'Companypady', 'Ambattukavu', 'Muttom', 'Kalamassery', 'Cusat', 'Pathadipalam', 'Edapally', 'Changampuzha Park', 'Palarivattom', 'JLN Stadium', 'Kaloor', 'Lissie', 'MG Road', 'Maharajas College', 'Ernakulam South', 'Kadavanthra', 'Elamkulam', 'Vyttila'],
        times: ['08:10 AM', '11:00 AM', '02:20 PM', '05:45 PM'],
    },
    {
        id: 'KM-104', route: 'Vyttila → Aluva', platform: '2',
        stations: ['Vyttila', 'Elamkulam', 'Kadavanthra', 'Ernakulam South', 'Maharajas College', 'MG Road', 'Lissie', 'Kaloor', 'JLN Stadium', 'Palarivattom', 'Changampuzha Park', 'Edapally', 'Pathadipalam', 'Cusat', 'Kalamassery', 'Muttom', 'Ambattukavu', 'Companypady', 'Pulinchodu', 'Aluva'],
        times: ['08:55 AM', '11:40 AM', '03:05 PM', '06:30 PM'],
    },
    {
        id: 'KM-105', route: 'Aluva → Kalamassery', platform: '1',
        stations: ['Aluva', 'Pulinchodu', 'Companypady', 'Ambattukavu', 'Muttom', 'Kalamassery'],
        times: ['09:20 AM', '12:50 PM', '04:40 PM'],
    },
    {
        id: 'KM-106', route: 'MG Road → Aluva', platform: '2',
        stations: ['MG Road', 'Lissie', 'Kaloor', 'JLN Stadium', 'Palarivattom', 'Changampuzha Park', 'Edapally', 'Pathadipalam', 'Cusat', 'Kalamassery', 'Muttom', 'Ambattukavu', 'Companypady', 'Pulinchodu', 'Aluva'],
        times: ['08:00 AM', '10:45 AM', '01:30 PM', '05:00 PM'],
    },
    {
        id: 'KM-107', route: 'Ernakulam South → Aluva', platform: '2',
        stations: ['Ernakulam South', 'Maharajas College', 'MG Road', 'Lissie', 'Kaloor', 'JLN Stadium', 'Palarivattom', 'Changampuzha Park', 'Edapally', 'Pathadipalam', 'Cusat', 'Kalamassery', 'Muttom', 'Ambattukavu', 'Companypady', 'Pulinchodu', 'Aluva'],
        times: ['07:30 AM', '11:15 AM', '03:45 PM', '07:20 PM'],
    },
];

/* Returns upcoming trains that STOP AT the given station */
const getUpcomingTrains = (selectedDate, now, stationName) => {
    const isToday = selectedDate.toDateString() === now.toDateString();
    const curMins = isToday ? now.getHours() * 60 + now.getMinutes() : 0;
    const dayOfWeek = selectedDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const seed = selectedDate.getDate() % 3;

    // Filter trains that actually pass through selected station
    const relevantTrains = BASE_TRAINS.filter(t => t.stations.includes(stationName));
    // On weekends, use subset (fewer services)
    const trainsPool = isWeekend ? relevantTrains.slice(0, Math.ceil(relevantTrains.length * 0.7)) : relevantTrains;

    const upcoming = [];
    trainsPool.forEach(train => {
        // Calculate approximate arrival offset based on station index
        const stationIdx = train.stations.indexOf(stationName);
        const offsetMins = stationIdx * 2; // ~2 min per stop

        train.times.forEach(t => {
            const [hm, ampm] = [t.slice(0, -3), t.slice(-2)];
            const [hh, mm] = hm.split(':').map(Number);
            let mins = hh * 60 + mm + offsetMins;
            if (ampm === 'PM' && hh !== 12) mins += 720;
            if (mins < curMins) return; // past

            const delayMin = (train.id === 'KM-102' && seed === 1) ? 4 :
                (train.id === 'KM-105' && seed === 2) ? 2 : 0;

            // Format adjusted arrival time
            const totalMins = mins + delayMin;
            const arrH = Math.floor(totalMins / 60) % 24;
            const arrM = totalMins % 60;
            const arrAMPM = arrH >= 12 ? 'PM' : 'AM';
            const arrH12 = arrH % 12 || 12;
            const arrivalTime = `${String(arrH12).padStart(2, '0')}:${String(arrM).padStart(2, '0')} ${arrAMPM}`;

            upcoming.push({
                id: train.id,
                route: train.route,
                platform: train.platform,
                time: arrivalTime,
                status: delayMin > 0 ? `Delayed ${delayMin}m` : 'On Time',
                passengers: Math.round(150 + (Math.sin(mins) + 1) * 150),
                stopsAt: stationName,
            });
        });
    });

    upcoming.sort((a, b) => {
        const toMins = s => {
            const [hm, ap] = [s.slice(0, -3), s.slice(-2)];
            const [h, m] = hm.split(':').map(Number);
            let x = h * 60 + m; if (ap === 'PM' && h !== 12) x += 720; return x;
        };
        return toMins(a.time) - toMins(b.time);
    });
    return upcoming.slice(0, 6);
};

const FACILITIES = [
    { name: 'ATM', Icon: Atm01Icon, status: 'Operational' },
    { name: 'WiFi', Icon: Wifi01Icon, status: 'Operational' },
    { name: 'Restrooms', Icon: UserGroupIcon, status: 'Maintenance' },
    { name: 'Lifts (P1)', Icon: ArrowUp01Icon, status: 'Fault' },
    { name: 'CCTV', Icon: CctvCameraIcon, status: 'Operational' },
    { name: 'Ticket Counter', Icon: Ticket01Icon, status: 'Operational' },
    { name: 'Drinking Water', Icon: DropletIcon, status: 'Operational' },
    { name: 'First Aid', Icon: HeartCheckIcon, status: 'Operational' },
    { name: 'Fire Safety', Icon: FireIcon, status: 'Maintenance' },
];

const NAV = [
    { key: 'overview', icon: DashboardCircleIcon, label: 'Overview' },
    { key: 'trains', icon: Train01Icon, label: 'Train Monitor' },
    { key: 'incidents', icon: Alert01Icon, label: 'Incidents' },
    { key: 'facilities', icon: Settings01Icon, label: 'Facilities' },
    { key: 'announcements', icon: Megaphone01Icon, label: 'Announcements' },
    { key: 'grievances', icon: LegalDocument01Icon, label: 'Grievances' }
];

const INITIAL_INCIDENTS = [
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const filteredTrains = mockTrains.filter(t =>
=======
    const [grievances, setGrievances] = useState([]);

    /* Live clock & Load grievances */
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);

        // Load grievances
        const all = JSON.parse(localStorage.getItem('kmrl_complaints') || '[]');
        setGrievances(all.filter(c => c.type === 'Grievance'));

        return () => clearInterval(t);
    }, []);

    const updateGrievanceStatus = (id, newStatus) => {
        const all = JSON.parse(localStorage.getItem('kmrl_complaints') || '[]');
        const updated = all.map(c => c.id === id ? { ...c, status: newStatus } : c);
        localStorage.setItem('kmrl_complaints', JSON.stringify(updated));
        setGrievances(updated.filter(c => c.type === 'Grievance'));
    };

    /* Compute data for selected date — scaled by station busyness */
    const stationFactor = getStationFactor(selectedStation);
    const selData = seedDate(selectedDate, stationFactor);
    const isToday = selectedDate.toDateString() === now.toDateString();
    const hourFactor = (chartTab === 'Weekday' ? 1.1 : chartTab === 'Weekend' ? 0.72 : 1) * stationFactor;
    const hourlyData = seedHourly(selectedDate, hourFactor);
    const upcomingTrains = getUpcomingTrains(selectedDate, now, selectedStation);

    /* Current hour index for chart highlight */
    const curHourIdx = isToday ? Math.max(0, now.getHours() - 7) : null; // 7AM = index 0

    const activeIncidents = incidents.filter(i => i.status === 'Active').length;
    const opFacilities = FACILITIES.filter(f => f.status === 'Operational').length;

    const statCards = [
        { label: 'Trains Today', value: selData.trains, Icon: SpeedTrain01Icon, color: '#0066b3', bg: '#eff6ff', trend: '+2 vs yesterday', trendClass: '' },
        { label: 'Passengers Today', value: selData.passengers.toLocaleString(), Icon: UserGroupIcon, color: '#0d9488', bg: '#f0fdfa', trend: '↑ 8.3%', trendClass: '' },
        { label: 'Active Incidents', value: activeIncidents, Icon: Alert01Icon, color: activeIncidents > 0 ? '#f59e0b' : '#10b981', bg: activeIncidents > 0 ? '#fefce8' : '#f0fdf4', trend: activeIncidents > 0 ? 'Needs Attention' : 'All Clear', trendClass: activeIncidents > 0 ? 'warn' : '' },
        { label: 'Facilities OK', value: `${opFacilities}/${FACILITIES.length}`, Icon: CheckmarkCircle01Icon, color: '#8b5cf6', bg: '#f5f3ff', trend: `${FACILITIES.length - opFacilities} issues`, trendClass: FACILITIES.length - opFacilities > 0 ? 'warn' : '' },
    ];

    const handleReportIncident = (e) => {
        e.preventDefault();
        if (!incidentForm.type || !incidentForm.platform) return;
        setIncidents(p => [{
            id: Date.now(), type: incidentForm.type,
            platform: incidentForm.platform,
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Active'
        }, ...p]);
        setIncidentForm({ type: '', platform: '', description: '' });
    };

    const resolveIncident = (id) =>
        setIncidents(p => p.map(i => i.id === id ? { ...i, status: 'Resolved' } : i));

    const postAnnouncement = (e) => {
        e.preventDefault();
        if (!announcement.trim()) return;
        setAnnouncements(p => [{
            id: Date.now(), text: announcement,
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }, ...p]);
        setAnnouncement('');
    };

    const filteredTrains = upcomingTrains.filter(t =>
>>>>>>> Stashed changes
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
                            {activeTab === 'grievances' && 'Passenger Grievances'}
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

                {/* ══════════════════ GRIEVANCES ══════════════════ */}
                {activeTab === 'grievances' && (
                    <div className="sm-content">
                        <div className="sm-card">
                            <div className="sm-card-head">
                                <span className="sm-card-title">Passenger Grievances</span>
                                <span className="sm-card-badge">{grievances.length} Total</span>
                            </div>
                            {grievances.length === 0 ? (
                                <p className="sm-empty">No grievances reported yet.</p>
                            ) : (
                                <table className="sm-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Passenger</th>
                                            <th>Subject</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grievances.map(g => (
                                            <tr key={g.id}>
                                                <td><strong>{g.id}</strong></td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{g.userName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{g.userEmail}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{g.subject}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={g.description}>{g.description}</div>
                                                </td>
                                                <td>{g.date}</td>
                                                <td>
                                                    <span className={`sm-status-badge ${g.status === 'Resolved' ? 'green' : g.status === 'In Progress' ? 'amber' : 'amber'}`}>
                                                        {g.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <select
                                                        value={g.status}
                                                        onChange={(e) => updateGrievanceStatus(g.id, e.target.value)}
                                                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default StationMasterDashboard;
