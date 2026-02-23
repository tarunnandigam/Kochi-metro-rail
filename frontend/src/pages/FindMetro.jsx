import React, { useState, useEffect, useRef } from 'react';
import '../styles/FindMetro.css';
import MapMetro from '../components/Metro/MapMetro';
import metroLinesData from '../data/metroLines';

function FindMetro({ onNavigate, user, onLogout }) {
    const [metroLines, setMetroLines] = useState([]);
    const [selectedLine, setSelectedLine] = useState(null);
    const [fromStation, setFromStation] = useState('');
    const [toStation, setToStation] = useState('');
    const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
    const [passengers, setPassengers] = useState('1');
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
    const resultsRef = useRef(null);
    const [showJourneySummary, setShowJourneySummary] = useState(false);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);

    // Load metro lines and stations on component mount
    useEffect(() => {
        fetchMetroLines();
        fetchTrains();
        const tv = setInterval(() => fetchLiveTrains(), 15000);
        return () => clearInterval(tv);
    }, []);

    const fetchTrains = async () => {
        try {
            const resp = await fetch('/api/metro/trains/live');
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
            const resp = await fetch('/api/metro/trains/live');
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
            const response = await fetch('/api/lines/lines');
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
                const linesResp = await fetch('/api/lines/lines');
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
                    if (results.length > 0) {
                        setSearchResults(results);
                        setShowJourneySummary(true);
                    } else {
                        const localRoute = computeLocalRoute(fromStation, toStation, selectedLine);
                        if (localRoute) {
                            setSearchResults([localRoute]);
                            setShowJourneySummary(true);
                        } else setErrors(prev => ({ ...prev, submit: 'No route found for selected stations' }));
                    }
                }
            } catch (err) {
                console.error('Local route search failed:', err);
                const localRoute = computeLocalRoute(fromStation, toStation, selectedLine);
                if (localRoute) {
                    setSearchResults([localRoute]);
                    setShowJourneySummary(true);
                } else setErrors(prev => ({ ...prev, submit: 'No route found for selected stations' }));
            }
        } catch (error) {
            console.error('Error searching route:', error);
            const localRoute = computeLocalRoute(fromStation, toStation, selectedLine);
            if (localRoute) {
                setSearchResults([localRoute]);
                setShowJourneySummary(true);
            } else {
                setErrors(prev => ({ ...prev, submit: 'Error searching routes. Please try again.' }));
            }
        } finally {
            setLoading(false);
            setTimeout(() => {
                if (resultsRef.current) {
                    resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 150);
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
                const maybe = allStations.find(s => (s.code || s.id) === stationNameOrCode || s.name === stationNameOrCode);
                if (maybe) return (maybe.code || maybe.id) || stationNameOrCode;
                // try case-insensitive name match
                const found = allStations.find(s => s.name.toLowerCase() === String(stationNameOrCode).toLowerCase());
                return found ? (found.code || found.id) : stationNameOrCode;
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
                        type: payload.type,
                        date: new Date().toLocaleString(),
                        status: 'Success',
                        method: 'Card/UPI'
                    };
                    localStorage.setItem('kmrl_latest_booking', JSON.stringify(bookingObj));

                    const txns = JSON.parse(localStorage.getItem('kmrl_all_transactions') || '[]');
                    txns.push(bookingObj);
                    localStorage.setItem('kmrl_all_transactions', JSON.stringify(txns));

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
                type: payload.type,
                date: new Date().toLocaleString(),
                status: 'Success',
                method: 'Card/UPI'
            };
            localStorage.setItem('kmrl_latest_booking', JSON.stringify(bookingObj));

            const txns = JSON.parse(localStorage.getItem('kmrl_all_transactions') || '[]');
            txns.push(bookingObj);
            localStorage.setItem('kmrl_all_transactions', JSON.stringify(txns));

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
            case 'single': return base;
            case 'day-pass': return base + 50;
            case 'weekly-pass': return 300;
            case 'monthly-pass': return 600;
            case 'smart-card': return 100; // card issuing price
            default: return base;
        }
    };

    if ((showJourneySummary || showPaymentOptions) && searchResults.length > 0) {
        const route = searchResults[0];
        const routeFare = route.fare || 10;
        const totalFare = (routeFare * Number(passengers)).toFixed(0);
        const distance = ((route.numberOfStops || 1) * 1.24).toFixed(2);

        return (
            <div className="fm-journey-summary-page">
                <div className="fm-summary-container">
                    <button className="fm-back-btn" onClick={() => {
                        if (showPaymentOptions) {
                            setShowPaymentOptions(false);
                            setShowJourneySummary(true);
                        } else {
                            setShowJourneySummary(false);
                        }
                    }}>
                        ← {showPaymentOptions ? 'Back to Summary' : 'Back to Search'}
                    </button>

                    {showJourneySummary && (
                        <div className="fm-summary-card">
                            <div className="fm-summary-header">
                                <h3>JOURNEY SUMMARY</h3>
                            </div>

                            <div className="fm-stations-row">
                                <div className="fm-station-col">
                                    <span className="fm-st-label">FROM STATION</span>
                                    <span className="fm-st-code" style={{ color: '#4c1d95' }}>{route.fromStation.substring(0, 4).toUpperCase()}</span>
                                    <span className="fm-st-name">{route.fromStation}</span>
                                </div>
                                <div className="fm-st-arrow">➔</div>
                                <div className="fm-station-col" style={{ alignItems: 'flex-end', textAlign: 'right' }}>
                                    <span className="fm-st-label">TO STATION</span>
                                    <span className="fm-st-code" style={{ color: '#4c1d95' }}>{route.toStation.substring(0, 4).toUpperCase()}</span>
                                    <span className="fm-st-name">{route.toStation}</span>
                                </div>
                            </div>

                            <div className="fm-date-row">
                                <span className="fm-st-label">DATE OF DEPARTURE</span>
                                <span className="fm-date-val">
                                    {new Date(tripDate || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })},{' '}
                                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="fm-dashed-divider"></div>

                            <div className="fm-warning-box">
                                This ticket is valid for the day of purchase.<br />
                                QR tickets are non-refundable.<br />
                                Metro Journey should be completed within 2 Hrs after entry.
                            </div>

                            <div className="fm-stats-box">
                                <div className="fm-stat">
                                    <div className="fm-stat-icon text-green">📍</div>
                                    <div className="fm-stat-info">
                                        <span className="fm-stat-lbl">Distance</span>
                                        <span className="fm-stat-val">{distance} km</span>
                                    </div>
                                </div>
                                <div className="fm-stat">
                                    <div className="fm-stat-icon text-teal">🚆</div>
                                    <div className="fm-stat-info">
                                        <span className="fm-stat-lbl">Stations</span>
                                        <span className="fm-stat-val">{route.numberOfStops || 1}</span>
                                    </div>
                                </div>
                                <div className="fm-stat">
                                    <div className="fm-stat-icon text-blue">↑</div>
                                    <div className="fm-stat-info">
                                        <span className="fm-stat-lbl">Journey</span>
                                        <span className="fm-stat-val">One way</span>
                                    </div>
                                </div>
                            </div>

                            <div className="fm-pax-row">
                                <div className="fm-pax-left">
                                    <span className="fm-pax-lbl">Passengers</span>
                                    <span className="fm-pax-sub">You can add up to 6 peoples</span>
                                </div>
                                <div className="fm-pax-controls">
                                    <button type="button" onClick={() => setPassengers(p => Math.max(1, Number(p) - 1))}>−</button>
                                    <span>{passengers}</span>
                                    <button type="button" onClick={() => setPassengers(p => Math.min(6, Number(p) + 1))}>+</button>
                                </div>
                            </div>

                            <div className="fm-dashed-divider"></div>

                            <div className="fm-price-row">
                                <div className="fm-price-left">
                                    <span className="fm-price-val">₹ {totalFare}</span>
                                    <span className="fm-price-sub">Inclusive of all taxes</span>
                                </div>
                                <button className="fm-proceed-btn" onClick={() => {
                                    if (!user) {
                                        alert("Please sign in to proceed with booking.");
                                        onNavigate("signin");
                                        return;
                                    }
                                    setShowJourneySummary(false);
                                    setShowPaymentOptions(true);
                                }}>
                                    PROCEED TO PAY
                                </button>
                            </div>
                        </div>
                    )}

                    {showJourneySummary && !showPaymentOptions && (
                        <div className="fm-payment-method-card" onClick={() => {
                            setShowJourneySummary(false);
                            setShowPaymentOptions(true);
                        }}>
                            <span className="fm-pm-lbl">SELECT PAYMENT METHOD</span>
                            <span className="fm-pm-icon">˅</span>
                        </div>
                    )}

                    {showPaymentOptions && (
                        <>
                            <div className="fm-summary-card" style={{ padding: '1.5rem 2rem' }}>
                                <div className="fm-summary-header" style={{ paddingBottom: '0.8rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 800 }}>JOURNEY SUMMARY</h3>
                                </div>

                                <div className="fm-stations-row" style={{ marginBottom: '1rem' }}>
                                    <div className="fm-station-col">
                                        <span className="fm-st-label" style={{ fontSize: '0.75rem' }}>FROM STATION</span>
                                        <span className="fm-st-code" style={{ fontSize: '1.8rem', color: '#4c1d95' }}>{route.fromStation.substring(0, 4).toUpperCase()}</span>
                                        <span className="fm-st-name" style={{ fontSize: '0.85rem' }}>{route.fromStation}</span>
                                    </div>
                                    <div className="fm-st-arrow" style={{ fontSize: '1.2rem', marginTop: '1rem' }}>➔</div>
                                    <div className="fm-station-col" style={{ alignItems: 'flex-end', textAlign: 'right' }}>
                                        <span className="fm-st-label" style={{ fontSize: '0.75rem' }}>TO STATION</span>
                                        <span className="fm-st-code" style={{ fontSize: '1.8rem', color: '#4c1d95' }}>{route.toStation.substring(0, 4).toUpperCase()}</span>
                                        <span className="fm-st-name" style={{ fontSize: '0.85rem' }}>{route.toStation}</span>
                                    </div>
                                </div>

                                <div className="fm-dashed-divider" style={{ margin: '1.2rem 0' }}></div>

                                <div className="fm-price-row" style={{ alignItems: 'flex-start' }}>
                                    <div className="fm-price-left">
                                        <span className="fm-st-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>DATE OF DEPARTURE</span>
                                        <span className="fm-date-val" style={{ fontSize: '1rem', color: '#312e81' }}>
                                            {new Date(tripDate || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })},{' '}
                                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="fm-price-val" style={{ fontSize: '1.6rem' }}>₹ {totalFare}</span>
                                        <div className="fm-price-sub" style={{ fontSize: '0.75rem' }}>Inclusive of all taxes</div>
                                    </div>
                                </div>
                            </div>

                            <div className="fm-summary-card payment-options-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <span className="fm-pm-lbl" style={{ fontWeight: 800, color: '#334155', fontSize: '1rem', textTransform: 'uppercase' }}>SELECT PAYMENT METHOD</span>
                                    <span className="fm-pm-icon" style={{ transform: 'rotate(180deg)', fontWeight: 800, color: '#334155' }}>˅</span>
                                </div>

                                <div className="fm-payment-option" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <span style={{ fontWeight: 800, color: '#334155', fontSize: '0.95rem' }}>BillDesk</span>
                                            <span style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: 600 }}>Pay with UPI, Card, Net banking Etc.</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0d9488', boxShadow: 'inset 0 0 0 4px #fff', border: '2px solid #0d9488' }}></div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    <button className="fm-proceed-btn" style={{ borderRadius: '10px', padding: '0.8rem 2rem', fontSize: '1.1rem', background: '#0ea5e9', fontWeight: 800, fontFamily: 'inherit' }} onClick={() => {
                                        setSelectedTrain({ ...route, fare: routeFare * Number(passengers) });
                                        submitBooking();
                                    }}>
                                        Make payment
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="findmetro-container">
            {/* New Unified Hero Banner */}
            <div className="fm-hero-banner">
                <h1>Network Map & Plan Your Trip</h1>
                <p>Welcome to the comprehensive hub for exploring Kochi Metro routes, tracking live trains, and finding fast and smart connections across the city.</p>
            </div>

            {/* Live Trains Marquee */}
            <div className="fm-live-updates-bar">
                <span className="live-label">LIVE TRAINS</span>
                <div className="live-ticker-wrap">
                    <div className="live-ticker-scroll">
                        {liveTrains && liveTrains.length > 0 ? (
                            liveTrains.map((t, i) => (
                                <div key={i} className="live-item-badge">
                                    <span style={{ fontWeight: 700 }}>{t.name}</span>
                                    <span>{t.currentStation || '-'} → {t.nextStop || '-'}</span>
                                    <span style={{ color: t.delayedByMinutes ? '#ef4444' : '#10b981' }}>
                                        {t.delayedByMinutes ? `Delay ${t.delayedByMinutes}m` : t.status || 'Running'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="live-item-badge">No active live train updates right now.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="fm-main-layout">
                {/* Left Column: Plan Your Trip Form & Services */}
                <div className="fm-left-column">
                    <div className="search-section">
                        <h2>Plan Your Journey</h2>
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
                                                if (fromStation.trim() === '') setFromSuggestions(allStations);
                                            }}
                                            placeholder="Search origin..."
                                            autoComplete="off"
                                        />
                                        {showFromDropdown && fromSuggestions.length > 0 && (
                                            <div className="dropdown-list">
                                                {fromSuggestions.map((station, idx) => (
                                                    <div key={idx} className="dropdown-item" onClick={() => selectFromStation(station)}>
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
                                    <button type="button" onClick={() => { const temp = fromStation; setFromStation(toStation); setToStation(temp); }} title="Swap stations">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="16 3 21 8 16 13"></polyline>
                                            <line x1="21" y1="8" x2="9" y2="8"></line>
                                            <polyline points="8 21 3 16 8 11"></polyline>
                                            <line x1="3" y1="16" x2="15" y2="16"></line>
                                        </svg>
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
                                                if (toStation.trim() === '') setToSuggestions(allStations);
                                            }}
                                            placeholder="Search destination..."
                                            autoComplete="off"
                                        />
                                        {showToDropdown && toSuggestions.length > 0 && (
                                            <div className="dropdown-list">
                                                {toSuggestions.map((station, idx) => (
                                                    <div key={idx} className="dropdown-item" onClick={() => selectToStation(station)}>
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

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="tripDate">Journey Date *</label>
                                    <input type="date" id="tripDate" value={tripDate} onChange={(e) => setTripDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="passengers">Passengers *</label>
                                    <select id="passengers" value={passengers} onChange={(e) => setPassengers(e.target.value)}>
                                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-search fm-glow-btn" disabled={loading}>
                                <div className="btn-content">
                                    <span className="btn-text">{loading ? 'Searching Networks...' : 'Explore Routes'}</span>
                                </div>
                            </button>
                        </form>

                        {/* Selected Stations Highlight Mini Cards */}
                        {(fromStation || toStation) && (
                            <div className="selected-stations-info" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #ddd' }}>
                                <div className="station-card">
                                    <div className="card-header">Selected Stations</div>
                                    <div className="card-body">
                                        <h4>From: {fromStation || '—'}</h4>
                                        <h4>To: {toStation || '—'}</h4>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Integrated Station Services */}
                    <div className="station-services-panel">
                        <div className="card-header">🛎️ Check Station Facilities</div>
                        <div className="card-body">
                            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: '#666' }}>Select any station to explore its available services</label>
                            <select value={selectedStation?.name || ''} onChange={(e) => {
                                const name = e.target.value;
                                const st = allStations.find(s => s.name === name);
                                setSelectedStation(st || null);
                            }} className="services-select">
                                <option value="">-- Choose a station --</option>
                                {allStations.map((s, idx) => (
                                    <option key={idx} value={s.name}>{s.name} ({s.code})</option>
                                ))}
                            </select>

                            {selectedStation ? (
                                <div className="services-preview">
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0d9488' }}>{selectedStation.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>Line: <strong style={{ color: '#333' }}>{selectedStation.lineName || '—'}</strong></p>
                                    <div className="facilities-grid-mini">
                                        <span className="fm-tag">🏧 ATM</span>
                                        <span className="fm-tag">🍔 Food Court</span>
                                        <span className="fm-tag">📶 WiFi</span>
                                        <span className="fm-tag">💬 Help Desk</span>
                                        <span className="fm-tag">🅿️ Parking</span>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic', marginTop: '1rem' }}>No station selected. Choose one to see amenities like ATM, WiFi, etc.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Network Map and Line Controls */}
                <div className="fm-right-column">
                    <div className="fm-map-header">
                        <h2>Interactive Network Map</h2>
                        <div className="lines-pills">
                            <button
                                className={`line-pill ${selectedLine === null ? 'active' : ''}`}
                                onClick={() => setSelectedLine(null)}
                                style={{ '--pill-color': '#64748b' }}
                            >
                                All Lines
                            </button>
                            {metroLines.map(line => (
                                <button
                                    key={line.id}
                                    className={`line-pill ${selectedLine === line.id ? 'active' : ''}`}
                                    onClick={() => { setSelectedLine(line.id); setHighlightedRoute(null); }}
                                    style={{ '--pill-color': line.color || '#0d9488' }}
                                >
                                    {line.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="fm-map-wrapper">
                        <MapMetro
                            height="100%"
                            selectedLineId={selectedLine}
                            highlightedRoute={highlightedRoute}
                            onStationClick={handleMapStationClick}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Full-Width Results Section */}
            {searchResults.length > 0 && (
                <div className="fm-results-layout" ref={resultsRef}>
                    <h2>Available Journey Routes</h2>
                    <div className="results-grid">
                        {searchResults.map((route, index) => (
                            <div key={index} className="route-card">
                                <div className="route-header">
                                    <div className="line-indicator" style={{ backgroundColor: route.lineColor || '#0d9488' }}></div>
                                    <h3>{route.lineName}</h3>
                                </div>

                                <div className="route-journey">
                                    <div className="station-info">
                                        <span className="station-name">{route.fromStation}</span>
                                        <span className="station-code">START</span>
                                    </div>
                                    <div className="journey-line"></div>
                                    <div className="station-info">
                                        <span className="station-name">{route.toStation}</span>
                                        <span className="station-code">END</span>
                                    </div>
                                </div>

                                <div className="route-details">
                                    <div className="detail-item">
                                        <span className="label">⏱️ Journey</span>
                                        <span className="value">{route.estimatedTime} min</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">🛑 Stops</span>
                                        <span className="value">{route.numberOfStops}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">👥 Passengers</span>
                                        <span className="value">{passengers}</span>
                                    </div>
                                </div>

                                {/* Dynamic Fare info considering passengers */}
                                <div className="fm-fare-panel">
                                    <div className="fare-row">
                                        <span>Per Passenger: </span>
                                        <span>₹{route.fare}</span>
                                    </div>
                                    <div className="fare-row total">
                                        <span>Total Est. Fare: </span>
                                        <span>₹{route.fare * Number(passengers)}</span>
                                    </div>
                                </div>

                                {route.intermediateStations && route.intermediateStations.length > 0 && (
                                    <div className="intermediate-stations">
                                        <p className="label">Route Path:</p>
                                        <div className="stations-list">
                                            {route.intermediateStations.map((station, idx) => (
                                                <span key={idx} className="station-badge">
                                                    {station.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="route-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                    <button type="button" className="btn-book flex-1" onClick={() => {
                                        if (!user) {
                                            alert("Please sign in to book tickets.");
                                            onNavigate("signin");
                                            return;
                                        }
                                        handleBookTicket({ ...route, fare: route.fare * Number(passengers) });
                                    }}>
                                        📱 Book Ticket
                                    </button>
                                    <button type="button" className="btn-show-map flex-1" onClick={() => showRouteOnMap(route)}>
                                        🗺️ Check on Map
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {searchResults.length === 0 && !loading && (
                <div className="fm-no-results" ref={resultsRef}>
                    <div className="fm-empty-state">
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛤️</span>
                        <h3>Ready to Explore?</h3>
                        <p>Enter your origin and destination in the 'Plan Your Journey' panel above to discover routes, check fares, and instantly book your metro tickets.</p>
                    </div>
                </div>
            )}


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
