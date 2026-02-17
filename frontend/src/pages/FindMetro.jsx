import React, { useState, useEffect, useRef } from 'react';
import '../styles/FindMetro.css';
import MapMetro from '../components/Metro/MapMetro';
import metroLinesData from '../data/metroLines';

function FindMetro({ onNavigate, user, onLogout }) {
    const [metroLines, setMetroLines] = useState([]);
    const [selectedLine, setSelectedLine] = useState(null);
    const [fromStation, setFromStation] = useState('');
    const [toStation, setToStation] = useState('');
    const [allStations, setAllStations] = useState([]);
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [availableTrains, setAvailableTrains] = useState([]);
    const [liveTrains, setLiveTrains] = useState([]);
    const [errors, setErrors] = useState({});
    const [ticketType, setTicketType] = useState('single');
    const [selectedService, setSelectedService] = useState('all');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [highlightedRoute, setHighlightedRoute] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const fromDropdownRef = useRef(null);
    const toDropdownRef = useRef(null);

    // Load metro lines and stations on component mount
    useEffect(() => {
        fetchMetroLines();
        fetchTrains();
        const tv = setInterval(() => fetchLiveTrains(), 15000);
        return () => clearInterval(tv);
    }, []);

    const fetchTrains = async () => {
        try {
            const resp = await fetch('/mock-api/metro_trains.json');
            if (resp.ok) {
                const data = await resp.json();
                setAvailableTrains(data || []);
            }
        } catch (err) {
            console.warn('Unable to fetch trains', err);
        }
    };

    const fetchLiveTrains = async () => {
        try {
            const resp = await fetch('/mock-api/metro_trains.json');
            if (resp.ok) {
                const data = await resp.json();
                setLiveTrains(data || []);
            }
        } catch (err) {
            console.warn('Unable to fetch live trains', err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target)) {
                setShowFromDropdown(false);
            }
            if (toDropdownRef.current && !toDropdownRef.current.contains(event.target)) {
                setShowToDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchMetroLines = async () => {
        // Initialize with local data first (always available)
        setMetroLines(metroLinesData);
        const stations = [];
        metroLinesData.forEach(line => {
            (line.stations || []).forEach(station => {
                if (!stations.find(s => s.name === station.name)) {
                    stations.push({ 
                        name: station.name,
                        code: station.code || station.name.slice(0, 3).toUpperCase(),
                        lat: station.lat,
                        lng: station.lng,
                        lineName: line.name, 
                        lineColor: line.color 
                    });
                }
            });
        });
        setAllStations(stations);

        // Try to fetch from backend (optional enhancement)
        try {
            const response = await fetch('/mock-api/lines.json');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setMetroLines(data);
                    const backendStations = [];
                    data.forEach(line => {
                        (line.stations || []).forEach(station => {
                            if (!backendStations.find(s => s.name === station.name)) {
                                backendStations.push({ 
                                    name: station.name,
                                    code: station.code || station.name.slice(0, 3).toUpperCase(),
                                    lat: station.lat,
                                    lng: station.lng,
                                    lineName: line.name, 
                                    lineColor: line.color 
                                });
                            }
                        });
                    });
                    setAllStations(backendStations);
                }
            }
        } catch (error) {
            console.log('Backend not available, using local data:', error.message);
        }
    };

    // Helper: normalize any route-like object to expected UI shape
    const normalizeRoute = (r) => {
        if (!r) return null;
        return {
            lineName: r.lineName || r.line || r.line_name || (r.lineObj && r.lineObj.name) || 'Line',
            lineColor: r.lineColor || r.color || (r.lineObj && r.lineObj.color) || '#999',
            fromStation: r.fromStation || r.from || r.origin || r.start || '',
            toStation: r.toStation || r.to || r.destination || r.end || '',
            estimatedTime: Number(r.estimatedTime ?? r.duration ?? r.time ?? r.durationMinutes ?? 0),
            numberOfStops: Number(r.numberOfStops ?? r.stops ?? r.stopCount ?? 0),
            fare: Number(r.fare ?? r.price ?? r.cost ?? 0),
            intermediateStations: r.intermediateStations || r.stationsBetween || []
        };
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
        onNavigate('signin');
    };

    const handleSelectChange = (type, value) => {
        if (type === 'from') {
            setFromStation(value);

            if (value.trim() === '') {
                setFromSuggestions(allStations); // Show all stations when empty
            } else {
                const filtered = allStations.filter(station =>
                    station.name.toLowerCase().includes(value.toLowerCase()) ||
                    station.code.toLowerCase().includes(value.toLowerCase())
                );
                setFromSuggestions(filtered);
            }
            setShowFromDropdown(true);
        } else if (type === 'to') {
            setToStation(value);

            if (value.trim() === '') {
                setToSuggestions(allStations); // Show all stations when empty
            } else {
                const filtered = allStations.filter(station =>
                    station.name.toLowerCase().includes(value.toLowerCase()) ||
                    station.code.toLowerCase().includes(value.toLowerCase())
                );
                setToSuggestions(filtered);
            }
            setShowToDropdown(true);
        }
    };

    const selectFromStation = (station) => {
        setFromStation(station.name);
        setFromSuggestions([]);
        setShowFromDropdown(false);
    };

    const selectToStation = (station) => {
        setToStation(station.name);
        setToSuggestions([]);
        setShowToDropdown(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setErrors({});
        setSearchResults([]);

        if (!fromStation) {
            setErrors(prev => ({ ...prev, fromStation: 'Please select a starting station' }));
            return;
        }
        if (!toStation) {
            setErrors(prev => ({ ...prev, toStation: 'Please select a destination' }));
            return;
        }
        if (fromStation === toStation) {
            setErrors(prev => ({ ...prev, submit: 'From and To stations cannot be the same' }));
            return;
        }

        setLoading(true);
        try {
            // Use local lines data to compute route (mock)
            try {
                const linesResp = await fetch('/mock-api/lines.json');
                if (linesResp.ok) {
                    const lines = await linesResp.json();
                    const results = [];
                    (lines || []).forEach(line => {
                        const stations = (line.stations || []).map(s => s.name);
                        const fromIdx = stations.indexOf(fromStation);
                        const toIdx = stations.indexOf(toStation);
                        if (fromIdx >= 0 && toIdx >= 0 && fromIdx < toIdx) {
                            results.push({
                                lineName: line.name,
                                lineColor: line.color,
                                fromStation,
                                toStation,
                                estimatedTime: Math.abs(toIdx - fromIdx) * 3,
                                numberOfStops: Math.abs(toIdx - fromIdx),
                                fare: Math.max(20, Math.abs(toIdx - fromIdx) * 5),
                                intermediateStations: stations.slice(fromIdx + 1, toIdx)
                            });
                        }
                    });
                    if (results.length > 0) setSearchResults(results);
                    else {
                        const localRoute = computeLocalRoute(fromStation, toStation, selectedLine);
                        if (localRoute) setSearchResults([localRoute]);
                        else setErrors(prev => ({ ...prev, submit: 'No route found for selected stations' }));
                    }
                }
            } catch (err) {
                console.error('Local route search failed:', err);
                const localRoute = computeLocalRoute(fromStation, toStation, selectedLine);
                if (localRoute) setSearchResults([localRoute]);
                else setErrors(prev => ({ ...prev, submit: 'No route found for selected stations' }));
            }
        } catch (error) {
            console.error('Error searching route:', error);
            const localRoute = computeLocalRoute(fromStation, toStation, selectedLine);
            if (localRoute) {
                setSearchResults([localRoute]);
            } else {
                setErrors(prev => ({ ...prev, submit: 'Error searching routes. Please try again.' }));
            }
        } finally {
            setLoading(false);
        }
    };

    const computeLocalRoute = (from, to, selectedLineId) => {
        const fromStn = allStations.find(s => s.name === from);
        const toStn = allStations.find(s => s.name === to);

        if (!fromStn || !toStn) return null;

        // Find a line that contains both stations
        const line = metroLines.find(l => {
            const fromExists = (l.stations || []).some(s => s.name === from);
            const toExists = (l.stations || []).some(s => s.name === to);
            return fromExists && toExists;
        });

        if (!line) return null;

        const stations = line.stations || [];
        const fromIdx = stations.findIndex(s => s.name === from);
        const toIdx = stations.findIndex(s => s.name === to);

        if (fromIdx === -1 || toIdx === -1) return null;

        const intermediateStations = stations.slice(
            Math.min(fromIdx, toIdx) + 1,
            Math.max(fromIdx, toIdx)
        );

        return {
            lineName: line.name,
            lineColor: line.color,
            fromStation: from,
            toStation: to,
            estimatedTime: Math.abs(toIdx - fromIdx) * 3,
            numberOfStops: Math.abs(toIdx - fromIdx),
            fare: Math.abs(toIdx - fromIdx) * 5,
            intermediateStations: intermediateStations.map(s => ({ name: s.name }))
        };
    };

    const handleMapStationClick = (station, line) => {
        setSelectedStation({ ...station, lineName: line.name });
    };

    const showRouteOnMap = (route) => {
        setSelectedLine(null);
        const fromStn = allStations.find(s => s.name === route.fromStation);
        const toStn = allStations.find(s => s.name === route.toStation);

        if (fromStn && toStn) {
            setHighlightedRoute({
                from: { lat: fromStn.lat, lng: fromStn.lng, name: route.fromStation },
                to: { lat: toStn.lat, lng: toStn.lng, name: route.toStation }
            });
        }
    };

    const handleBookTicket = (route) => {
        const normalized = normalizeRoute(route);
        setSelectedTrain(normalized || route);
        setShowBookingModal(true);
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
        setSelectedTrain(null);
        setTicketType('single');
        setSelectedService('all');
    };

    const submitBooking = async () => {
        if (!selectedTrain) return;
        try {
            // Ensure we send station CODES for single journey bookings.
            const getCodeFor = (stationNameOrCode) => {
                if (!stationNameOrCode) return null;
                // if it's already a code (3-5 chars uppercase) prefer it
                const maybe = allStations.find(s => s.code === stationNameOrCode || s.name === stationNameOrCode);
                if (maybe) return maybe.code || stationNameOrCode;
                // try case-insensitive name match
                const found = allStations.find(s => s.name.toLowerCase() === String(stationNameOrCode).toLowerCase());
                return found ? found.code : stationNameOrCode;
            };

            const payload = {
                fromStation: ticketType === 'single' ? getCodeFor(selectedTrain.fromStation) : undefined,
                toStation: ticketType === 'single' ? getCodeFor(selectedTrain.toStation) : undefined,
                passengerName: (user && user.fullName) || '',
                passengerPhone: '',
                type: ticketType,
                email: (user && user.email) || undefined
            };

            const headers = { 'Content-Type': 'application/json' };
            const token = localStorage.getItem('kmrl_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Prefer server-side booking when backend available
            try {
                const resp = await fetch('/api/metro/book', { method: 'POST', headers, body: JSON.stringify(payload) });
                if (resp.ok) {
                    const data = await resp.json();
                    const bookingObj = {
                        bookingId: data.bookingId,
                        fare: data.fare,
                        ticketUrl: data.ticketUrl,
                        fromStation: ticketType === 'single' ? (selectedTrain.fromStation || payload.fromStation) : '',
                        toStation: ticketType === 'single' ? (selectedTrain.toStation || payload.toStation) : '',
                        passengerName: payload.passengerName,
                        email: payload.email,
                        type: payload.type
                    };
                    localStorage.setItem('kmrl_latest_booking', JSON.stringify(bookingObj));
                    closeBookingModal();
                    onNavigate('ticket');
                    return;
                }
            } catch (err) {
                console.warn('Server booking failed, falling back to local mock', err);
            }

            // Fallback to mock booking if server not available
            const mockData = {
                bookingId: 'MOCK-' + Date.now(),
                fare: payload.type === 'single' ? 25 : 50,
                ticketUrl: '/mock-api/tickets/' + Date.now() + '.pdf'
            };
            const bookingObj = {
                bookingId: mockData.bookingId,
                fare: mockData.fare,
                ticketUrl: mockData.ticketUrl,
                fromStation: ticketType === 'single' ? (selectedTrain.fromStation || payload.fromStation) : '',
                toStation: ticketType === 'single' ? (selectedTrain.toStation || payload.toStation) : '',
                passengerName: payload.passengerName,
                email: payload.email,
                type: payload.type
            };
            localStorage.setItem('kmrl_latest_booking', JSON.stringify(bookingObj));
            closeBookingModal();
            onNavigate('ticket');
        } catch (err) {
            console.error('Booking error:', err);
            alert('Booking failed. Please try again.');
        }
    };

    // Compute displayed total for modal based on ticketType
    const computeDisplayedTotal = () => {
        const base = Number(selectedTrain?.fare || 0);
        if (!selectedTrain) return 0;
        switch (ticketType) {
            case 'single':
                return base;
            case 'day-pass':
                return base + 50;
            case 'weekly-pass':
                return 300;
            case 'monthly-pass':
                return 600;
            case 'smart-card':
                return 100; // card issuing price
            default:
                return base;
        }
    };
    return (
        <div className="findmetro-container">
            {/* Header */}
            <div className="findmetro-header">
                <div className="header-content">
                    <div className="logo-section">
                        <button className="btn-back" onClick={() => onNavigate('dashboard')}>← Back</button>
                        <h1>🚇 Find Metro</h1>
                        <p>Search Your Route</p>
                    </div>
                    <div className="user-section">
                        <span>{user?.fullName || 'User'}</span>
                        <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </div>

            <div className="findmetro-content" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>
                {/* Left column: lines, search, results */}
                <div>
                    <div className="lines-section">
                        <h2>Select Metro Line (Optional)</h2>
                        <div className="lines-grid">
                            <div
                                className={`line-card ${selectedLine === null ? 'active' : ''}`}
                                onClick={() => setSelectedLine(null)}
                            >
                                <div className="line-color" style={{ backgroundColor: '#999' }}></div>
                                <h3>All Lines</h3>
                                <p>Search across all lines</p>
                            </div>
                            {metroLines.map(line => (
                                <div
                                    key={line.id}
                                    className={`line-card ${selectedLine === line.id ? 'active' : ''}`}
                                    onClick={() => { setSelectedLine(line.id); setHighlightedRoute(null); }}
                                >
                                    <div className="line-color" style={{ backgroundColor: line.color }}></div>
                                    <h3>{line.name}</h3>
                                    <p>{(line.stations || []).length} stations</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <h3 style={{ marginBottom: 8 }}>Live Trains</h3>
                        {liveTrains && liveTrains.length > 0 ? (
                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                                {liveTrains.slice(0,6).map((t, i) => (
                                    <div key={i} style={{ minWidth: 150, background: '#fff', padding: 8, borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                                        <div style={{ fontWeight: 700 }}>{t.name}</div>
                                        <div style={{ fontSize: 12 }}>{t.currentStation || '-' } → {t.nextStop || '-'}</div>
                                        <div style={{ fontSize: 12, color: t.delayedByMinutes ? '#c0392b' : '#2ecc71' }}>{t.delayedByMinutes ? `Delay ${t.delayedByMinutes}m` : t.status || 'Running'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: '#666' }}>No live train data</div>
                        )}
                    </div>

                    <div className="search-section">
                        <h2>Search Route</h2>
                        <form onSubmit={handleSearch} className="search-form">
                            {errors.submit && <div className="error-message">{errors.submit}</div>}

                            <div className="form-row">
                                <div className="form-group" ref={fromDropdownRef}>
                                    <label htmlFor="fromStation">From Station *</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            id="fromStation"
                                            value={fromStation}
                                            onChange={(e) => handleSelectChange('from', e.target.value)}
                                            onFocus={() => {
                                                setShowFromDropdown(true);
                                                if (fromStation.trim() === '') {
                                                    setFromSuggestions(allStations);
                                                }
                                            }}
                                            placeholder="Search or select station..."
                                            autoComplete="off"
                                        />
                                        {showFromDropdown && fromSuggestions.length > 0 && (
                                            <div className="dropdown-list">
                                                {fromSuggestions.map((station, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="dropdown-item"
                                                        onClick={() => selectFromStation(station)}
                                                    >
                                                        <div className="station-info">
                                                            <strong>{station.name}</strong>
                                                            <span className="station-code">{station.code}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {errors.fromStation && <span className="error-text">{errors.fromStation}</span>}
                                </div>

                                <div className="swap-btn">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const temp = fromStation;
                                            setFromStation(toStation);
                                            setToStation(temp);
                                        }}
                                        title="Swap stations"
                                    >
                                        ⇅
                                    </button>
                                </div>

                                <div className="form-group" ref={toDropdownRef}>
                                    <label htmlFor="toStation">To Station *</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            id="toStation"
                                            value={toStation}
                                            onChange={(e) => handleSelectChange('to', e.target.value)}
                                            onFocus={() => {
                                                setShowToDropdown(true);
                                                if (toStation.trim() === '') {
                                                    setToSuggestions(allStations);
                                                }
                                            }}
                                            placeholder="Search or select station..."
                                            autoComplete="off"
                                        />
                                        {showToDropdown && toSuggestions.length > 0 && (
                                            <div className="dropdown-list">
                                                {toSuggestions.map((station, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="dropdown-item"
                                                        onClick={() => selectToStation(station)}
                                                    >
                                                        <div className="station-info">
                                                            <strong>{station.name}</strong>
                                                            <span className="station-code">{station.code}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {errors.toStation && <span className="error-text">{errors.toStation}</span>}
                                </div>
                            </div>

                            <button type="submit" className="btn-search" disabled={loading}>
                                {loading ? 'Searching...' : '🔍 Search Routes'}
                            </button>
                        </form>

                        {/* Selected Stations Info */}
                        <div className="selected-stations-info" style={{ marginTop: 18 }}>
                            <div className="station-card">
                                <div className="card-header">📍 Selected Stations</div>
                                <div className="card-body">
                                    <h4>From: {fromStation || '—'}</h4>
                                    <h4>To: {toStation || '—'}</h4>
                                    {fromStation && allStations.filter(s => s.name === fromStation).map(s => (
                                        <div key={s.code} style={{ marginTop: 8 }}>
                                            <p className="station-detail"><strong>Code:</strong> {s.code}</p>
                                            {s.location && <p className="station-detail"><strong>Location:</strong> {s.location}</p>}
                                            {s.area && <p className="station-detail"><strong>Area:</strong> {s.area}</p>}
                                        </div>
                                    ))}
                                    {toStation && allStations.filter(s => s.name === toStation).map(s => (
                                        <div key={s.code} style={{ marginTop: 8 }}>
                                            <p className="station-detail"><strong>Code:</strong> {s.code}</p>
                                            {s.location && <p className="station-detail"><strong>Location:</strong> {s.location}</p>}
                                            {s.area && <p className="station-detail"><strong>Area:</strong> {s.area}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="results-section" style={{ marginTop: 20 }}>
                                <h2>Available Routes</h2>
                                <div className="results-grid">
                                    {searchResults.map((route, index) => (
                                        <div key={index} className="route-card">
                                            <div className="route-header">
                                                <div
                                                    className="line-indicator"
                                                    style={{ backgroundColor: route.lineColor }}
                                                ></div>
                                                <h3>{route.lineName}</h3>
                                            </div>

                                            <div className="route-journey">
                                                <div className="station-info">
                                                    <span className="station-name">{route.fromStation}</span>
                                                    <span className="station-code">FROM</span>
                                                </div>
                                                <div className="journey-line"></div>
                                                <div className="station-info">
                                                    <span className="station-name">{route.toStation}</span>
                                                    <span className="station-code">TO</span>
                                                </div>
                                            </div>

                                            <div className="route-details">
                                                <div className="detail-item">
                                                    <span className="label">⏱️ Time</span>
                                                    <span className="value">{route.estimatedTime} mins</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">🛑 Stops</span>
                                                    <span className="value">{route.numberOfStops}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">💰 Fare</span>
                                                    <span className="value">₹{route.fare}</span>
                                                </div>
                                            </div>

                                            {route.intermediateStations && route.intermediateStations.length > 0 && (
                                                <div className="intermediate-stations">
                                                    <p className="label">Intermediate Stations:</p>
                                                    <div className="stations-list">
                                                        {route.intermediateStations.map((station, idx) => (
                                                            <span key={idx} className="station-badge">
                                                                {station.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ marginTop: 12 }}>
                                                <button 
                                                    type="button"
                                                    className="btn-book"
                                                    onClick={() => handleBookTicket(route)}
                                                >
                                                    📱 Book Ticket
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-show-map"
                                                    onClick={() => showRouteOnMap(route)}
                                                    style={{ marginLeft: 8 }}
                                                >
                                                    🗺️ Show on Map
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchResults.length === 0 && !loading && (
                            <div className="no-results" style={{ marginTop: 12 }}>
                                <p>Enter station names and click search to find routes</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column: Map + Station Services */}
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <h2 style={{ margin: '0 0 8px 0' }}>Route</h2>
                        <div style={{ height: 420, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                            <MapMetro
                                height={420}
                                selectedLineId={selectedLine}
                                highlightedRoute={highlightedRoute}
                                onStationClick={handleMapStationClick}
                            />
                        </div>
                    </div>

                    <div className="station-card" style={{ padding: 16 }}>
                        <div className="card-header">🛎️ Station Services</div>
                        <div className="card-body" style={{ paddingTop: 12 }}>
                            <label style={{ display: 'block', marginBottom: 8 }}>Select Station to view services</label>
                            <select value={selectedStation?.name || ''} onChange={(e) => {
                                const name = e.target.value;
                                const st = allStations.find(s => s.name === name);
                                setSelectedStation(st || null);
                            }} style={{ width: '100%', padding: '8px 10px', marginBottom: 12 }}>
                                <option value="">-- Select station --</option>
                                {allStations.map((s, idx) => (
                                    <option key={idx} value={s.name}>{s.name}</option>
                                ))}
                            </select>

                            {selectedStation ? (
                                <div>
                                    <h4 style={{ marginTop: 0 }}>{selectedStation.name}</h4>
                                    <ul style={{ marginLeft: 18 }}>
                                        <li>ATM / Payment</li>
                                        <li>Food Court</li>
                                        <li>WiFi</li>
                                        <li>Customer Care / Help Desk</li>
                                        <li>Parking</li>
                                    </ul>
                                    <p style={{ fontSize: 13, color: '#666' }}>Line: {selectedStation.lineName || '—'}</p>
                                </div>
                            ) : (
                                <div>
                                    <p>Select a station from the list or click a station marker on the map to view services.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedTrain && (
                <div className="modal-overlay" onClick={closeBookingModal}>
                    <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📱 Book Your Ticket</h2>
                            <button className="btn-close" onClick={closeBookingModal}>✕</button>
                        </div>

                        <div className="modal-content">
                            <div className="booking-summary">
                                <h3>Journey Details</h3>
                                <p><strong>Line:</strong> {selectedTrain.lineName}</p>
                                <p><strong>From:</strong> {selectedTrain.fromStation}</p>
                                <p><strong>To:</strong> {selectedTrain.toStation}</p>
                                <p><strong>⏱️ Duration:</strong> {selectedTrain.estimatedTime} minutes</p>
                                <p><strong>🛑 Stops:</strong> {selectedTrain.numberOfStops}</p>
                                <p><strong>💰 Fare:</strong> ₹{selectedTrain.fare}</p>
                            </div>

                            <div className="booking-form">
                                <div className="form-group">
                                    <label>Ticket Type *</label>
                                    <select value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
                                        <option value="single">🎫 Single Journey Ticket</option>
                                        <option value="day-pass">📅 Day Pass (Unlimited)</option>
                                        <option value="weekly-pass">📆 Weekly Pass</option>
                                        <option value="monthly-pass">📊 Monthly Pass</option>
                                        <option value="smart-card">💳 Smart Card</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Station Services *</label>
                                    <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                                        <option value="all">✓ All Services</option>
                                        <option value="atm">🏧 ATM Available</option>
                                        <option value="food">🍔 Food Stalls</option>
                                        <option value="wifi">📶 WiFi Available</option>
                                        <option value="lostandfound">📦 Lost & Found</option>
                                        <option value="helpdesk">🆘 Help Desk</option>
                                    </select>
                                </div>

                                <div className="price-breakdown">
                                    <h4>Price Breakdown</h4>
                                    <div className="price-row">
                                        <span>Base Fare:</span>
                                        <span>₹{selectedTrain.fare}</span>
                                    </div>
                                    {ticketType === 'day-pass' && (
                                        <div className="price-row">
                                            <span>Day Pass Surcharge:</span>
                                            <span>₹50</span>
                                        </div>
                                    )}
                                    {ticketType === 'weekly-pass' && (
                                        <div className="price-row">
                                            <span>Weekly Pass Price:</span>
                                            <span>₹300</span>
                                        </div>
                                    )}
                                    {ticketType === 'monthly-pass' && (
                                        <div className="price-row">
                                            <span>Monthly Pass Price:</span>
                                            <span>₹600</span>
                                        </div>
                                    )}
                                    {ticketType === 'smart-card' && (
                                        <div className="price-row">
                                            <span>Smart Card (one-time):</span>
                                            <span>₹100</span>
                                        </div>
                                    )}

                                    <div className="price-row total">
                                        <span>Total:</span>
                                        <span className="total-price">₹{computeDisplayedTotal()}</span>
                                    </div>
                                </div>

                                <div className="modal-buttons">
                                    <button className="btn-cancel" onClick={closeBookingModal}>Cancel</button>
                                    <button className="btn-submit" onClick={submitBooking}>✓ Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FindMetro;
