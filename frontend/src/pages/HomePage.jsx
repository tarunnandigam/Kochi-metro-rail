import { useState, useEffect, useRef } from 'react';
import '../styles/HomePage.css';
import VideoBackground from '../components/VideoBackground';
import fareStationsData from '../data/fareStations.json';
import liveTrainsData from '../data/liveTrains.json';
import MapMetro from '../components/Metro/MapMetro';

function HomePage({ onNavigate }) {
    const [metroLines, setMetroLines] = useState([]);
    const [fromStation, setFromStation] = useState('');
    const [toStation, setToStation] = useState('');
    const [allStations, setAllStations] = useState([]);
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [fareDistance, setFareDistance] = useState('');
    const [calculatedFare, setCalculatedFare] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ticketType, setTicketType] = useState('single');
    const [selectedService, setSelectedService] = useState('all');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [liveTrains, setLiveTrains] = useState([]);
    const fromDropdownRef = useRef(null);
    const toDropdownRef = useRef(null);
    const [imageAvailable, setImageAvailable] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showFareModal, setShowFareModal] = useState(false);
    const [fareModalFrom, setFareModalFrom] = useState('');
    const [fareModalTo, setFareModalTo] = useState('');
    const [fareModalFromSuggestions, setFareModalFromSuggestions] = useState([]);
    const [fareModalToSuggestions, setFareModalToSuggestions] = useState([]);
    const [showFareFromDropdown, setShowFareFromDropdown] = useState(false);
    const [showFareToDropdown, setShowFareToDropdown] = useState(false);
    const [fareResult, setFareResult] = useState({ fare: 0, distance: 0, calculated: false });
    const fareFromRef = useRef(null);
    const fareToRef = useRef(null);

    const sliderImages = [
        '/images/homepagesliderimages/image1.png',
        '/images/homepagesliderimages/image2.png',
        '/images/homepagesliderimages/image3.png',
        '/images/homepagesliderimages/image4.png',
        '/images/homepagesliderimages/image5.png',
        '/images/homepagesliderimages/image6.png'
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderImages.length);
        }, 3500);
        return () => clearInterval(timer);
    }, []);

    const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
    const notices = [
        "Attention Kochi commuters: Due to a high-profile visit, traffic restrictions will be in place across parts of the city. Use the Metro to avoid delays. Parents and Ward SSC students - please take the metro to reach exam centers on time.",
        "New feeder bus service launched from Aluva Station! Connect seamlessly to Kochi Airport. Service starts 6:00 AM daily. Check the 'Feeder' section for routes.",
        "Maintenance Alert: Elevator access at Edappally Station will be restricted for scheduled maintenance this Sunday, 10 AM to 2 PM. Please use alternate exits.",
        "Go Green with Kochi Metro! Save over 50% on monthly passes. Visit your nearest ticket counter or recharge online today for exclusive discounts."
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentNoticeIndex(prev => (prev + 1) % notices.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchStations();
        fetchLiveTrains();
        const iv = setInterval(() => fetchLiveTrains(), 15000);
        return () => clearInterval(iv);
    }, []);

    const fetchLiveTrains = async () => {
        try {
            const resp = await fetch('/mock-api/metro_trains.json');
            if (!resp.ok) return;
            const data = await resp.json();
            setLiveTrains(data);
        } catch (err) {
            console.error('Error fetching live trains', err);
            // fallback to local static data
            setLiveTrains(liveTrainsData || []);
        }
    }

    const calculateFare = () => {
        const dist = parseFloat(fareDistance);
        if (isNaN(dist) || dist <= 0) return;
        let fare;
        if (dist <= 2) fare = 20;
        else if (dist <= 6) fare = 25;
        else if (dist <= 10) fare = 30;
        else if (dist <= 14) fare = 35;
        else if (dist <= 18) fare = 40;
        else fare = 50;
        setCalculatedFare(fare);
    };

    const calculateFareByStations = () => {
        if (!fareModalFrom || !fareModalTo) return;
        const fromIdx = allStations.findIndex(s => s.name === fareModalFrom);
        const toIdx = allStations.findIndex(s => s.name === fareModalTo);
        if (fromIdx === -1 || toIdx === -1) return;

        const hops = Math.abs(toIdx - fromIdx);
        // Kochi Metro avg ~1.3 km per station
        const distance = parseFloat((hops * 1.3).toFixed(1));
        let fare;
        if (distance <= 2) fare = 20;
        else if (distance <= 6) fare = 25;
        else if (distance <= 10) fare = 30;
        else if (distance <= 14) fare = 35;
        else if (distance <= 18) fare = 40;
        else fare = 50;
        setFareResult({ fare, distance, calculated: true });
    };

    const resetFareModal = () => {
        setFareModalFrom('');
        setFareModalTo('');
        setFareResult({ fare: 0, distance: 0, calculated: false });
        setShowFareFromDropdown(false);
        setShowFareToDropdown(false);
    };

    const swapFareStations = () => {
        const tmp = fareModalFrom;
        setFareModalFrom(fareModalTo);
        setFareModalTo(tmp);
        setFareResult({ fare: 0, distance: 0, calculated: false });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target)) {
                setShowFromDropdown(false);
            }
            if (toDropdownRef.current && !toDropdownRef.current.contains(event.target)) {
                setShowToDropdown(false);
            }
            if (fareFromRef.current && !fareFromRef.current.contains(event.target)) {
                setShowFareFromDropdown(false);
            }
            if (fareToRef.current && !fareToRef.current.contains(event.target)) {
                setShowFareToDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchStations = async () => {
        try {
            const response = await fetch('/mock-api/fare_stations.json');
            if (response.ok) {
                const data = await response.json();
                setAllStations(data);
            }
        } catch (error) {
            console.error('Error fetching stations:', error);
            // fallback to local static stations
            setAllStations(fareStationsData || []);
        }
    };

    const handleFromStationChange = (e) => {
        const value = e.target.value;
        setFromStation(value);
        if (value.trim() === '') {
            setFromSuggestions(allStations); // show all stations when empty for easier pick
        } else {
            const filtered = allStations.filter(station =>
                station.name.toLowerCase().includes(value.toLowerCase()) ||
                (station.code || '').toLowerCase().includes(value.toLowerCase())
            );
            setFromSuggestions(filtered);
        }
        setShowFromDropdown(true);
    };

    const handleToStationChange = (e) => {
        const value = e.target.value;
        setToStation(value);
        if (value.trim() === '') {
            setToSuggestions(allStations); // show all stations when empty
        } else {
            const filtered = allStations.filter(station =>
                station.name.toLowerCase().includes(value.toLowerCase()) ||
                (station.code || '').toLowerCase().includes(value.toLowerCase())
            );
            setToSuggestions(filtered);
        }
        setShowToDropdown(true);
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

    const handleSearchRoute = async (e) => {
        e.preventDefault();
        if (!fromStation || !toStation) return;

        setLoading(true);
        try {
            // Local route search using mock lines.json
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
                            // create two mock train options for this route
                            const base = Math.abs(toIdx - fromIdx);
                            const routeObj = {
                                lineName: line.name,
                                lineColor: line.color,
                                fromStation,
                                toStation,
                                estimatedTime: base * 3,
                                numberOfStops: base,
                                fare: Math.max(20, base * 5),
                                intermediateStations: stations.slice(fromIdx + 1, toIdx)
                            };
                            // two mock trains
                            const now = Date.now();
                            routeObj.trains = [
                                {
                                    trainId: `MOCK-${now}-A`,
                                    name: `${line.name} Local A`,
                                    departureTime: new Date(now + 5 * 60 * 1000).toISOString(),
                                    currentStation: fromStation,
                                    nextStop: stations[fromIdx + 1] || toStation,
                                    delayedByMinutes: 0,
                                    status: 'Running'
                                },
                                {
                                    trainId: `MOCK-${now}-B`,
                                    name: `${line.name} Local B`,
                                    departureTime: new Date(now + 12 * 60 * 1000).toISOString(),
                                    currentStation: fromStation,
                                    nextStop: stations[fromIdx + 1] || toStation,
                                    delayedByMinutes: Math.random() < 0.3 ? 2 : 0,
                                    status: 'Running'
                                }
                            ];
                            results.push(routeObj);
                        }
                    });
                    setSearchResults(results);
                }
            } catch (err) {
                console.error('Local route search failed', err);
            }
        } catch (error) {
            console.error('Error searching route:', error);
        }
        setLoading(false);
    };


    const handleBookTicket = (train) => {
        setSelectedTrain(train);
        setShowBookingModal(true);
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
        setSelectedTrain(null);
    };

    const submitBooking = () => {
        alert(`Ticket booked successfully! Type: ${ticketType}, Service: ${selectedService}`);
        closeBookingModal();
    };

    return (
        <div className="home-page page-content-above-video">
            {/* Main Welcome Section with Image */}
            <div className="welcome-section">
                <div className="parent">
                    <div className="div1">
                        <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px', position: 'relative' }}>
                            <img
                                src="https://media1.tenor.com/m/rASIofnw47IAAAAd/mumbai-metro-mumbai.gif?w=1080&h=1920"
                                alt="Metro Animation"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right', display: 'block' }}
                                onError={(e) => { e.currentTarget.src = '/vite.svg'; }}
                            />
                        </div>
                    </div>
                    <div className="div2">
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {sliderImages.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Metro Slide ${index + 1}`}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        opacity: index === currentSlide ? 1 : 0,
                                        transition: 'opacity 0.8s ease-in-out'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="div3">
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0066b3' }}>Live Trains</h4>
                                <LocalClock />
                            </div>
                            {liveTrains && liveTrains.length > 0 ? (
                                <LiveTicker trains={liveTrains} />
                            ) : (
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>No active trains</div>
                            )}
                        </div>
                    </div>
                    <div className="div4" style={{ position: 'relative' }}>
                        {/* Top center label */}
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 2,
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                        }}>
                            <span style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: '#0f172a',
                                fontFamily: 'Urbanist, sans-serif',
                                letterSpacing: '0.01em'
                            }}>
                                Tickets &amp; Recharge
                            </span>
                        </div>
                        <img
                            src="/images/div4.png"
                            alt="Metro Feature"
                            style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>
                    <div className="div5">
                        <div className="notices-card">
                            <div className="notices-header">
                                <span className="notices-title">NOTICES & ALERTS</span>
                                <svg className="external-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="7" y1="17" x2="17" y2="7" />
                                    <polyline points="7 7 17 7 17 17" />
                                </svg>
                            </div>
                            <div className="notices-content-area">
                                <p className="notices-text" key={currentNoticeIndex} style={{ animation: 'fadeIn 0.5s ease' }}>
                                    {notices[currentNoticeIndex]}
                                </p>
                            </div>
                            <div className="notices-controls">
                                <div className="pagination-dots">
                                    {notices.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`dot ${idx === currentNoticeIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentNoticeIndex(idx)}
                                            style={{ cursor: 'pointer' }}
                                        ></div>
                                    ))}
                                </div>
                                <div className="nav-arrows">
                                    <button
                                        className="nav-btn"
                                        onClick={() => setCurrentNoticeIndex(prev => (prev - 1 + notices.length) % notices.length)}
                                        aria-label="Previous Notice"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 12H5M12 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        className="nav-btn"
                                        onClick={() => setCurrentNoticeIndex(prev => (prev + 1) % notices.length)}
                                        aria-label="Next Notice"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Find Metro Section */}
            {/* Find Metro Section (Hidden) */}
            {false && (
                <section className="find-metro-section">
                    <div className="section-container">
                        <h2>🚇 Find Your Metro Route</h2>
                        <p className="section-subtitle">Search and explore metro routes in Kochi</p>

                        {/* Scrollable Station List */}
                        {allStations.length > 0 && (
                            <div className="stations-list-section">
                                <h3>Available Stations</h3>
                                <div className="scrollable-stations">
                                    {allStations.map((station, idx) => (
                                        <div key={idx} className="station-card" onClick={() => setFromStation(station.name)}>
                                            <div className="station-card-header">
                                                <strong>{station.name}</strong>
                                                <span className="station-code">{station.code}</span>
                                            </div>
                                            <small className="station-location">{station.location || 'Kochi'}</small>
                                            <small className="station-area">{station.area || 'Kerala'}</small>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSearchRoute} className="home-search-form">
                            <div className="search-inputs">
                                <div className="input-group" ref={fromDropdownRef}>
                                    <label>From Station</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            value={fromStation}
                                            onChange={handleFromStationChange}
                                            onFocus={() => {
                                                setShowFromDropdown(true);
                                                if (!fromStation.trim()) setFromSuggestions(allStations);
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
                                                        onClick={(e) => { e.stopPropagation(); selectFromStation(station); }}
                                                    >
                                                        <div className="station-info">
                                                            <strong>{station.name}</strong>
                                                            <span className="station-code">{station.code}</span>
                                                        </div>
                                                        <small>{station.location || 'Kochi'} - {station.area || 'Kerala'}</small>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="input-group" ref={toDropdownRef}>
                                    <label>To Station</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            value={toStation}
                                            onChange={handleToStationChange}
                                            onFocus={() => {
                                                setShowToDropdown(true);
                                                if (!toStation.trim()) setToSuggestions(allStations);
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
                                                        onClick={(e) => { e.stopPropagation(); selectToStation(station); }}
                                                    >
                                                        <div className="station-info">
                                                            <strong>{station.name}</strong>
                                                            <span className="station-code">{station.code}</span>
                                                        </div>
                                                        <small>{station.location || 'Kochi'} - {station.area || 'Kerala'}</small>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-search-home" disabled={loading}>
                                {loading ? 'Searching...' : '🔍 Search Routes'}
                            </button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="search-results-home">
                                <h3 style={{ gridColumn: '1 / -1' }}>Available Routes</h3>
                                {searchResults.map((route, idx) => (
                                    <div key={idx} className="route-card-home">
                                        <div className="route-header-home">
                                            <h4>{route.lineName}</h4>
                                            <span className="stops-badge">{route.numberOfStops || 5} stops</span>
                                        </div>
                                        <p><strong>⏱️ Duration:</strong> {route.estimatedTime || 30} min</p>
                                        <p><strong>💰 Fare:</strong> ₹{route.fare || 20}</p>
                                        <button
                                            type="button"
                                            className="btn-book-route"
                                            onClick={() => handleBookTicket(route)}
                                        >
                                            📱 Book Ticket
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Kochi Metro's Line Comprehensive Services */}
            <section className="comprehensive-services-section">
                <div className="section-container">
                    <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '1.375rem', fontWeight: '600', color: '#0f172a', lineHeight: '1.375', fontFamily: 'Urbanist, sans-serif' }}>Kochi Metro Rail</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#39ae62', lineHeight: '1.2', marginTop: '0.5rem', fontFamily: 'Urbanist, sans-serif' }}>Comprehensive Services</div>
                    </h2>
                    <div className="services-grid-parent">
                        <div
                            className="services-div1"
                            style={{ position: 'relative', background: '#f6f7fa', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                            onClick={() => { setShowFareModal(true); setCalculatedFare(null); setFareDistance(''); }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,102,179,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                        >
                            {/* Radial Gradient Background */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '20px',
                                    opacity: 0.8,
                                    background: 'radial-gradient(200px at 86.2px 3.9375px, rgba(23, 99, 212, 0.15), transparent 100%)',
                                    pointerEvents: 'none'
                                }}
                            ></div>

                            {/* Card Content */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                zIndex: 1,
                                width: '100%',
                                padding: '0 24px'
                            }}>
                                {/* Calculator Icon Circle with Image */}
                                <div className="service-icon-container" style={{
                                    width: '48px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <img
                                        src="/images/farecal.svg"
                                        alt="Fare Calculator"
                                        style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentNode.innerHTML = '🧮'; }}
                                    />
                                </div>

                                {/* Text */}
                                <span style={{
                                    fontSize: '1.375rem',
                                    fontWeight: '600',
                                    color: '#0f172a', /* primaryText */
                                    lineHeight: '1.375', /* leading-snug */
                                    textAlign: 'left'
                                }}>
                                    Fare Calculator
                                </span>
                            </div>
                        </div>
                        <div className="services-div2" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', background: '#f6f7fa', padding: '1.5rem', color: '#166534' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                <div className="service-icon-container" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                        src="/images/accessible-facility-svgrepo-com.svg"
                                        alt="Facilities"
                                        style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                                    />
                                </div>
                                <span style={{ fontSize: '1.375rem', fontWeight: '600', color: '#0f172a', lineHeight: '1.375', textAlign: 'left' }}>Facilities</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '1.5rem', marginBottom: '0.5rem', color: '#15803d' }}>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/1/1848.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/18561/18561555.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/3522/3522581.png" alt="Wheelchair" style={{ width: '22px', height: '22px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/13707/13707123.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/562/562678.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/9001/9001771.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                            </div>
                            <h3 style={{
                                color: 'black',
                                fontWeight: '500',
                                marginTop: '8px',
                                textAlign: 'left',
                                fontSize: '0.875rem',
                                lineHeight: '1.375'
                            }}>
                                Facility for Women, Differently Abled & Parking
                            </h3>
                        </div>
                        <div className="services-div5" style={{ padding: 0, overflow: 'hidden', display: 'block', position: 'relative' }}>
                            <div style={{ width: '100%', height: '100%' }}>
                                <MapMetro height="100%" />
                            </div>
                            <button
                                onClick={() => onNavigate('findmetro')}
                                style={{
                                    position: 'absolute',
                                    bottom: '15px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 20px',
                                    color: 'black',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    zIndex: 1000,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                                    fontSize: '0.9rem',
                                    transition: 'transform 0.2s ease'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1)'; }}
                            >
                                Interact with Map
                            </button>
                        </div>
                        <div className="services-div6" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', background: '#f6f7fa', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <div className="service-icon-container" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="/images/train-station-svgrepo-com.svg" alt="Station" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                </div>
                                <span style={{ fontSize: '1.375rem', fontWeight: '600', color: '#0f172a', lineHeight: '1.375', textAlign: 'left' }}>Know Your Station</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#64748b' }}>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/28/28591.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/9001/9001771.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/2838/2838912.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/13707/13707123.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/1034/1034897.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/562/562678.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                            </div>
                            <h3 style={{
                                color: 'black',
                                fontWeight: '500',
                                marginTop: '5px',
                                textAlign: 'left',
                                fontSize: '0.875rem',
                                lineHeight: '1.375'
                            }}>
                                everything you want to know about any station
                            </h3>
                        </div>
                        <div className="services-div7" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', background: '#f6f7fa', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="service-icon-container" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="/images/location-pin-svgrepo-com.svg" alt="Location" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '1.375rem', fontWeight: '600', color: '#0f172a', lineHeight: '1.375', textAlign: 'left' }}>Nearby Places</span>
                                    <span style={{ fontSize: '1.375rem', fontWeight: '600', color: '#0f172a', lineHeight: '1.375', textAlign: 'left' }}>Across Stations</span>
                                </div>
                            </div>
                        </div>
                        <div className="services-div8" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', background: '#f6f7fa', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                                <div className="service-icon-container" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="/images/time-svgrepo-com.svg" alt="Time" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                </div>
                                <span style={{ fontSize: '1.375rem', fontWeight: '600', color: '#0f172a', lineHeight: '1.375', textAlign: 'left' }}>First & Last<br />Metro Time</span>
                            </div>
                            <div style={{
                                width: '100%',
                                color: 'black',
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                lineHeight: '1.375',
                                marginTop: '8px'
                            }}>
                                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>First metro runs from Aluva at 06:00 AM</span>
                                    <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/2584/2584049.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Last metro runs from SN Junction <br></br>at 10:30 PM</span>
                                    <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/3982/3982182.png" alt="Wheelchair" style={{ width: '21px', height: '21px', objectFit: 'contain' }} /></a></span>
                                </div>
                            </div>
                        </div>
                        <div className="services-div9" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', background: '#f6f7fa', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <div className="service-icon-container" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="/images/trip-svgrepo-com.svg" alt="Connectivity" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                </div>
                                <span style={{ fontSize: '1.375rem', fontWeight: '600', color: '#0f172a', lineHeight: '1.375', textAlign: 'left' }}>First & Last mile<br />connectivity</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#64748b' }}>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/3124/3124381.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/1023/1023401.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/1034/1034897.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                                <span><a href='URL'><img src="https://cdn-icons-png.flaticon.com/128/565/565350.png" alt="Wheelchair" style={{ width: '28px', height: '28px', objectFit: 'contain' }} /></a></span>
                            </div>
                            <h3 style={{
                                color: 'black',
                                fontWeight: '500',
                                marginTop: '8px',
                                textAlign: 'left',
                                fontSize: '0.875rem',
                                lineHeight: '1.375'
                            }}>
                                Taxi, Bus & other public transport services.
                            </h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fare Calculator Section (Commented Out) */}
            {/* 
            <section className="fare-calculator-section">
                <div className="section-container">
                    <h2>💰 Fare Calculator</h2>
                    <p className="section-subtitle">Calculate metro fares instantly</p>

                    <div className="fare-card">
                        <div className="fare-input-group">
                            <label>Distance (km)</label>
                            <input
                                type="number"
                                value={fareDistance}
                                onChange={(e) => setFareDistance(e.target.value)}
                                placeholder="Enter distance in kilometers"
                                step="0.1"
                                min="0"
                            />
                            <button type="button" onClick={calculateFare} className="btn-calculate">
                                Calculate Fare
                            </button>
                        </div>

                        {calculatedFare && (
                            <div className="fare-result">
                                <div className="fare-display">
                                    <span className="fare-label">Estimated Fare</span>
                                    <span className="fare-amount">₹{calculatedFare}</span>
                                </div>
                                <p className="fare-note">* Base fare: ₹10 + ₹2 per km</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            */}

            {/* Experience Section */}
            <section className="experience-section" style={{ padding: '3rem 1rem', background: '#fff' }}>
                <div className="section-container">
                    <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a', fontSize: '1.2rem', fontWeight: '500' }}>
                        Experience the perfect blend of
                    </h2>
                    <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.8rem', fontWeight: '800', fontFamily: 'Urbanist, sans-serif' }}>
                        <span style={{ color: '#ae8639' }}>Speed</span><span style={{ color: '#a5ae39' }}>{', '}</span>
                        <span style={{ color: '#a5ae39' }}>Convenience</span><span style={{ color: '#a5ae39' }}>{', & '}</span>
                        <span style={{ color: '#39ae62' }}>Sustainability.</span>
                    </h3>

                    <div className="experience-parent">
                        <div className="experience-div1">
                            {/* Text overlay - top left */}
                            <div style={{
                                position: 'absolute',
                                top: '1.5rem',
                                left: '1.5rem',
                                zIndex: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <h1 style={{
                                    margin: 0,
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    fontSize: '32px',
                                    lineHeight: '1.25',
                                    fontStyle: 'bold',
                                    textAlign: 'left',
                                    fontFamily: 'Urbanist, sans-serif'
                                }}>
                                    Smooth Rides, Stress-Free Commutes
                                </h1>
                                <h2 style={{
                                    margin: 0,
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    lineHeight: '1.25',
                                    textAlign: 'left',
                                    maxWidth: '294px',
                                    fontFamily: 'Urbanist, sans-serif'
                                }}>
                                    Experience Seamless Journeys, Every Day.
                                </h2>
                            </div>
                            {/* Background image */}
                            <img
                                src="/images/pic1.png"
                                alt="Speed"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    objectPosition: 'bottom right',
                                    display: 'block'
                                }}
                            />
                        </div>
                        <div className="experience-div2">
                            {/* Text overlay - top left */}
                            <div style={{
                                position: 'absolute',
                                top: '1.5rem',
                                left: '1.5rem',
                                zIndex: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    fontSize: '22px',
                                    lineHeight: '1.25',
                                    textAlign: 'left',
                                    fontFamily: 'Urbanist, sans-serif'
                                }}>
                                    Seamless ticket
                                </h3>
                                <h1 style={{
                                    margin: 0,
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    fontSize: '32px',
                                    lineHeight: '1.25',
                                    textAlign: 'left',
                                    fontFamily: 'Urbanist, sans-serif'
                                }}>
                                    booking experience
                                </h1>
                                <h2 style={{
                                    margin: 0,
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    lineHeight: '1.25',
                                    textAlign: 'left',
                                    maxWidth: '325px',
                                    fontFamily: 'Urbanist, sans-serif'
                                }}>
                                    Utilize our interactive maps to effortlessly plan your route
                                </h2>
                            </div>
                            {/* Background image */}
                            <img
                                src="/images/pic2.png"
                                alt="Convenience"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    objectPosition: 'bottom right',
                                    display: 'block'
                                }}
                            />
                        </div>
                        <div className="experience-div3">
                            {/* Text overlay - top left */}
                            <div style={{
                                position: 'absolute',
                                top: '1.5rem',
                                left: '1.5rem',
                                zIndex: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <h1 style={{
                                    margin: 0,
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    fontSize: '32px',
                                    lineHeight: '1.25',
                                    textAlign: 'left',
                                    fontFamily: 'Urbanist, sans-serif'
                                }}>
                                    Accessibility for all
                                </h1>
                                <h2 style={{
                                    margin: 0,
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    lineHeight: '1.25',
                                    textAlign: 'left',
                                    maxWidth: '360px',
                                    fontFamily: 'Urbanist, sans-serif'
                                }}>
                                    Our stations and trains are designed to be accessible for everyone, including passengers with disabilities.
                                </h2>
                            </div>
                            {/* Background image */}
                            <img
                                src="/images/pic3.png"
                                alt="Sustainability"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    objectPosition: 'bottom right',
                                    display: 'block'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Real-time Info Section - commented out for now */}
            {/* <section className="realtime-info-section">
                <div className="section-container">
                    <h2>⏱️ Real-time Metro Information</h2>
                    <p className="section-subtitle">Stay updated with metro operations</p>

                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">🚇</div>
                            <h3>Operating Hours</h3>
                            <p><strong>Monday to Sunday:</strong></p>
                            <p>6:00 AM - 10:00 PM</p>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">🎫</div>
                            <h3>Ticket Types</h3>
                            <p><strong>Available:</strong></p>
                            <p>Single Journey, Pass Cards, Smart Cards</p>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">🛂</div>
                            <h3>Station Services</h3>
                            <p><strong>Available:</strong></p>
                            <p>ATM, Food Stalls, Lost & Found, WiFi</p>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">📱</div>
                            <h3>Live Updates</h3>
                            <p><strong>Stay Connected:</strong></p>
                            <p>Sign in for real-time alerts</p>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* New Banner Grid Section */}
            <section style={{ padding: '4rem 5rem', background: '#fff' }}>
                <div className="new-banner-parent">
                    <div className="new-banner-div2" style={{ position: 'relative', overflow: 'hidden' }}>
                        {/* footer1.png - left side */}
                        <img
                            src="/images/footer1.png"
                            alt="Footer Banner Left"
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                height: '50%',
                                width: 'auto',
                                objectFit: 'contain',
                                objectPosition: 'left bottom',
                                display: 'block'
                            }}
                        />
                        {/* footer.png - right side */}
                        <img
                            src="/images/footer.png"
                            alt="Footer Banner Right"
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                height: '100%',
                                width: 'auto',
                                objectFit: 'contain',
                                objectPosition: 'right center',
                                display: 'block'
                            }}
                        />
                        {/* Left-center text */}
                        <div style={{
                            position: 'relative',
                            zIndex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            textAlign: 'left',
                            gap: '8px',
                            padding: '0 2rem'
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: '500',
                                color: '#334e68',
                                lineHeight: '1.5',
                                fontFamily: 'Urbanist, sans-serif'
                            }}>
                                Your Journey, Your Way
                            </p>
                            <h1 style={{
                                margin: 0,
                                fontSize: '2.5rem',
                                fontWeight: '800',
                                color: '#0f172a',
                                lineHeight: '1.2',
                                fontFamily: 'Urbanist, sans-serif'
                            }}>
                                Download the Kochi Metro <br />Mobile App Today!
                            </h1>

                            {/* App Store Buttons */}
                            <div style={{
                                marginTop: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flexWrap: 'wrap'
                            }}>
                                {/* Play Store */}
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.metroconnect3.app"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        backgroundColor: '#000',
                                        borderRadius: '10px',
                                        height: '54px',
                                        padding: '0 20px',
                                        textDecoration: 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        transition: 'box-shadow 0.2s'
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="29" height="31" viewBox="0 0 29 31" fill="none">
                                        <path d="M15.3445 13.8594L19.5445 9.35938L3.24453 0.559375C3.14453 0.459375 2.94453 0.459375 2.64453 0.359375L15.3445 13.8594Z" fill="#00F076" />
                                        <path d="M21.3445 20.3594L27.2445 17.1594C27.9445 16.7594 28.3445 16.1594 28.3445 15.3594C28.3445 14.5594 27.9445 13.8594 27.2445 13.5594L21.3445 10.3594L16.6445 15.3594L21.3445 20.3594Z" fill="#FFC900" />
                                        <path d="M0.74375 1.25928C0.44375 1.55928 0.34375 1.95928 0.34375 2.35928V28.3593C0.34375 28.7593 0.44375 29.1593 0.74375 29.5593L13.9438 15.3593L0.74375 1.25928Z" fill="#00D6FF" />
                                        <path d="M15.3445 16.8594L2.64453 30.3594C2.84453 30.3594 3.04453 30.2594 3.24453 30.1594L19.5445 21.3594L15.3445 16.8594Z" fill="#FF3A44" />
                                    </svg>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#fff', fontWeight: '400', fontSize: '0.8rem', lineHeight: '1.3', fontFamily: 'Urbanist, sans-serif' }}>Get it on</span>
                                        <span style={{ color: '#fff', fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', lineHeight: '1.3', fontFamily: 'Urbanist, sans-serif' }}>Play Store</span>
                                    </div>
                                </a>

                                {/* App Store */}
                                <a
                                    href="https://apps.apple.com/us/app/metroconnect3/id6723876321"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        backgroundColor: '#000',
                                        borderRadius: '10px',
                                        height: '54px',
                                        padding: '0 20px',
                                        textDecoration: 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        transition: 'box-shadow 0.2s'
                                    }}
                                >
                                    <svg style={{ fill: '#fff' }} xmlns="http://www.w3.org/2000/svg" width="27" height="33" viewBox="0 0 27 33" fill="none">
                                        <path d="M22.0586 17.3604C22.1033 22.2031 26.2822 23.8146 26.3286 23.8351C25.8177 25.4514 25.0761 26.9845 24.1269 28.3863C22.8008 30.3357 21.4246 32.2779 19.2567 32.3182C17.1265 32.3576 16.4415 31.0476 14.006 31.0476C11.5705 31.0476 10.8102 32.278 8.79365 32.3577C6.70094 32.4375 5.10744 30.2499 3.7707 28.3076C1.03862 24.3347 -1.04928 17.0811 1.75419 12.1843C3.14655 9.75338 5.63548 8.21355 8.3369 8.17408C10.3918 8.1346 12.3313 9.56464 13.5877 9.56464C14.844 9.56464 17.2001 7.84494 19.678 8.09755C20.7153 8.14093 23.6272 8.51898 25.4969 11.2718C25.3462 11.3657 22.0226 13.3119 22.0586 17.3606V17.3604ZM18.0552 5.4696C19.1662 4.1169 19.9141 2.23389 19.7101 0.359863C18.1082 0.424656 16.1721 1.43325 15.0235 2.78515C13.9937 3.98202 13.0925 5.89852 13.3357 7.73503C15.1206 7.87394 16.9442 6.82264 18.0552 5.46914" />
                                    </svg>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#fff', fontWeight: '400', fontSize: '0.8rem', lineHeight: '1.3', fontFamily: 'Urbanist, sans-serif' }}>Download From</span>
                                        <span style={{ color: '#fff', fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', lineHeight: '1.3', fontFamily: 'Urbanist, sans-serif' }}>App Store</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fare Calculator Modal */}
            {showFareModal && (
                <div
                    className="fare-modal-overlay"
                    onClick={() => { setShowFareModal(false); resetFareModal(); }}
                >
                    <div
                        className="fare-modal-popup"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── Top Header Bar ── */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                            {/* Teal pill */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#0d9488', color: '#fff', fontWeight: 700, fontSize: '0.88rem', padding: '0.4rem 1rem', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                                Fare Calculator
                            </div>
                            {/* Subtitle */}
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', flex: 1, lineHeight: 1.4 }}>Select your station to calculate fare and view journey details.</p>
                            {/* Close button */}
                            <button
                                onClick={() => { setShowFareModal(false); resetFareModal(); }}
                                aria-label="Close"
                                style={{ flexShrink: 0, background: '#e2e8f0', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '1rem', fontWeight: 700, padding: 0, lineHeight: 1 }}
                            >
                                ×
                            </button>
                        </div>

                        {/* ── Station Inputs ── */}
                        <div className="fare-modal-body">
                            <div className="fare-station-block">
                                {/* From Input */}
                                <div className="fare-station-input-wrap" ref={fareFromRef}>
                                    <label className="fare-station-label">From</label>
                                    <input
                                        id="fare-from-input"
                                        className="fare-station-input"
                                        type="text"
                                        placeholder="Search From Station"
                                        value={fareModalFrom}
                                        autoComplete="off"
                                        onChange={e => {
                                            const v = e.target.value;
                                            setFareModalFrom(v);
                                            setFareResult({ fare: 0, distance: 0, calculated: false });
                                            const filtered = v.trim() === '' ? allStations : allStations.filter(s => s.name.toLowerCase().includes(v.toLowerCase()));
                                            setFareModalFromSuggestions(filtered);
                                            setShowFareFromDropdown(true);
                                        }}
                                        onFocus={() => {
                                            setFareModalFromSuggestions(allStations);
                                            setShowFareFromDropdown(true);
                                        }}
                                    />
                                    {showFareFromDropdown && fareModalFromSuggestions.length > 0 && (
                                        <div className="fare-dropdown">
                                            {fareModalFromSuggestions.map((s, i) => (
                                                <div key={i} className="fare-dropdown-item"
                                                    onMouseDown={e => { e.preventDefault(); setFareModalFrom(s.name); setShowFareFromDropdown(false); setFareResult({ fare: 0, distance: 0, calculated: false }); }}
                                                >
                                                    <span className="fare-dropdown-name">{s.name}</span>
                                                    <span className="fare-dropdown-code">{s.code}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Swap Button */}
                                <div className="fare-swap-btn-wrap">
                                    <button
                                        className="fare-swap-btn"
                                        onClick={swapFareStations}
                                        title="Swap stations"
                                        type="button"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M8 3 4 7l4 4" />
                                            <path d="M4 7h16" />
                                            <path d="M16 21l4-4-4-4" />
                                            <path d="M20 17H4" />
                                        </svg>
                                    </button>
                                </div>

                                {/* To Input */}
                                <div className="fare-station-input-wrap" ref={fareToRef}>
                                    <label className="fare-station-label">To</label>
                                    <input
                                        id="fare-to-input"
                                        className="fare-station-input"
                                        type="text"
                                        placeholder="Search To Station"
                                        value={fareModalTo}
                                        autoComplete="off"
                                        onChange={e => {
                                            const v = e.target.value;
                                            setFareModalTo(v);
                                            setFareResult({ fare: 0, distance: 0, calculated: false });
                                            const filtered = v.trim() === '' ? allStations : allStations.filter(s => s.name.toLowerCase().includes(v.toLowerCase()));
                                            setFareModalToSuggestions(filtered);
                                            setShowFareToDropdown(true);
                                        }}
                                        onFocus={() => {
                                            setFareModalToSuggestions(allStations);
                                            setShowFareToDropdown(true);
                                        }}
                                    />
                                    {showFareToDropdown && fareModalToSuggestions.length > 0 && (
                                        <div className="fare-dropdown">
                                            {fareModalToSuggestions.map((s, i) => (
                                                <div key={i} className="fare-dropdown-item"
                                                    onMouseDown={e => { e.preventDefault(); setFareModalTo(s.name); setShowFareToDropdown(false); setFareResult({ fare: 0, distance: 0, calculated: false }); }}
                                                >
                                                    <span className="fare-dropdown-name">{s.name}</span>
                                                    <span className="fare-dropdown-code">{s.code}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Action Buttons ── */}
                            <div className="fare-action-row">
                                <button className="fare-reset-btn" onClick={resetFareModal}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                    </svg>
                                    RESET
                                </button>
                                <button
                                    className="fare-getfare-btn"
                                    onClick={calculateFareByStations}
                                    disabled={!fareModalFrom || !fareModalTo || fareModalFrom === fareModalTo}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="M7 15h0" />
                                        <path d="M2 9.5h20" />
                                    </svg>
                                    GET FARE
                                </button>
                            </div>

                            {/* ── Fare & Journey Details ── */}
                            <div className="fare-details-section">
                                <h3 className="fare-details-heading">FARE &amp; JOURNEY DETAILS</h3>
                                <div className="fare-details-cards">
                                    {/* Journey Fare Card */}
                                    <div className="fare-detail-card">
                                        <div className="fare-detail-icon fare-detail-icon--purple">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                                                <path d="M13 5v2M13 17v2M13 11v2" />
                                            </svg>
                                        </div>
                                        <div className="fare-detail-info">
                                            <span className="fare-detail-label">Journey Fare</span>
                                            <span className="fare-detail-value">₹{fareResult.calculated ? fareResult.fare : 0}</span>
                                        </div>
                                    </div>
                                    {/* Distance Card */}
                                    <div className="fare-detail-card">
                                        <div className="fare-detail-icon fare-detail-icon--green">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                                <circle cx="12" cy="9" r="2.5" />
                                            </svg>
                                        </div>
                                        <div className="fare-detail-info">
                                            <span className="fare-detail-label">Distance</span>
                                            <span className="fare-detail-value">{fareResult.calculated ? fareResult.distance : 0} km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── City Skyline Illustration ── */}
                            <div className="fare-skyline">
                                <img src="/images/footer1.png" alt="City Skyline" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && selectedTrain && (
                <div className="modal-overlay" onClick={closeBookingModal}>
                    <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Book Your Ticket</h2>
                            <button className="btn-close" onClick={closeBookingModal}>✕</button>
                        </div>

                        <div className="modal-content">
                            <div className="booking-summary">
                                <h3>Journey Details</h3>
                                <p><strong>Route:</strong> {selectedTrain.lineName}</p>
                                <p><strong>Estimated Duration:</strong> {selectedTrain.estimatedTime || 30} minutes</p>
                                <p><strong>Fare:</strong> ₹{selectedTrain.fare || 20}</p>
                            </div>

                            <div className="booking-form">
                                <div className="form-group">
                                    <label>Ticket Type *</label>
                                    <select value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
                                        <option value="single">🎫 Single Journey Ticket</option>
                                        <option value="day-pass">📅 Day Pass (Unlimited Journeys)</option>
                                        <option value="weekly-pass">📆 Weekly Pass</option>
                                        <option value="monthly-pass">📊 Monthly Pass</option>
                                        <option value="smart-card">💳 Smart Card (Rechargeable)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Station Services *</label>
                                    <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                                        <option value="all">✓ All Services Available</option>
                                        <option value="atm">🏧 ATM Available</option>
                                        <option value="food">🍔 Food Stalls Available</option>
                                        <option value="wifi">📶 WiFi Available</option>
                                        <option value="lostandfound">📦 Lost & Found</option>
                                        <option value="helpdesk">🆘 Help Desk</option>
                                    </select>
                                </div>

                                <div className="price-breakdown">
                                    <h4>Price Breakdown</h4>
                                    <div className="price-row">
                                        <span>Base Fare:</span>
                                        <span>₹{selectedTrain.fare || 20}</span>
                                    </div>
                                    {ticketType === 'day-pass' && (
                                        <div className="price-row">
                                            <span>Day Pass Surcharge:</span>
                                            <span>₹50</span>
                                        </div>
                                    )}
                                    {ticketType === 'smart-card' && (
                                        <div className="price-row">
                                            <span>Smart Card (Initial):</span>
                                            <span>₹100</span>
                                        </div>
                                    )}
                                    <div className="price-row total">
                                        <span>Total Amount:</span>
                                        <span className="total-price">
                                            ₹{ticketType === 'day-pass' ? (selectedTrain.fare || 20) + 50 : ticketType === 'smart-card' ? 100 : selectedTrain.fare || 20}
                                        </span>
                                    </div>
                                </div>

                                <div className="terms-checkbox">
                                    <input type="checkbox" id="terms" defaultChecked />
                                    <label htmlFor="terms">I agree to the terms and conditions</label>
                                </div>

                                <div className="modal-buttons">
                                    <button className="btn-cancel" onClick={closeBookingModal}>Cancel</button>
                                    <button className="btn-submit" onClick={submitBooking}>✓ Confirm Booking</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer style={{ background: '#f0f4f8', borderTop: '1px solid #e2e8f0', fontFamily: 'Urbanist, sans-serif' }}>
                {/* Main footer body */}
                <div style={{
                    maxWidth: '1300px',
                    margin: '0 auto',
                    padding: '3rem 2rem 2rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: '3rem',
                    alignItems: 'flex-start'
                }}>
                    {/* Left: Logo + Gov Logos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* KMRL Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/images/kmrl-logo.png" alt="KMRL Logo" style={{ height: '72px', width: 'auto' }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.02em', lineHeight: '1.3' }}>Kochi Metro Rail Limited</span>
                        </div>

                        {/* Government Logos */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <img src="/images/gov-india.png" alt="Government of India" style={{ height: '40px', width: 'auto' }} />
                            <img src="/images/mygov.png" alt="MyGov" style={{ height: '36px', width: 'auto' }} />
                            <img src="/images/award.png" alt="Award" style={{ height: '40px', width: 'auto' }} />
                        </div>
                    </div>

                    {/* Right: Link Columns */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2rem'
                    }}>
                        {/* Useful Links */}
                        <div>
                            <h4 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Useful links</h4>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {['About us', 'Help & Contact', 'Careers', 'News & Updates'].map(link => (
                                    <li key={link}>
                                        <a href="#" style={{ color: '#334155', fontSize: '0.95rem', textDecoration: 'none', fontWeight: '400', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = '#0066b3'}
                                            onMouseLeave={e => e.target.style.color = '#334155'}
                                        >{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Important Links */}
                        <div>
                            <h4 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Important links</h4>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {['Guidelines', 'FAQs', 'Security', 'Vigilance'].map(link => (
                                    <li key={link}>
                                        <a href="#" style={{ color: '#334155', fontSize: '0.95rem', textDecoration: 'none', fontWeight: '400', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = '#0066b3'}
                                            onMouseLeave={e => e.target.style.color = '#334155'}
                                        >{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Legal</h4>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {['Privacy policy', 'Disclaimer', 'Web Information Manager'].map(link => (
                                    <li key={link}>
                                        <a href="#" style={{ color: '#334155', fontSize: '0.95rem', textDecoration: 'none', fontWeight: '400', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = '#0066b3'}
                                            onMouseLeave={e => e.target.style.color = '#334155'}
                                        >{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Social Icons Row */}
                <div style={{
                    maxWidth: '1300px',
                    margin: '0 auto',
                    padding: '0 2rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '14px',
                    alignItems: 'center'
                }}>
                    {/* X / Twitter */}
                    <a href="#" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                    {/* Facebook */}
                    <a href="#" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </a>
                    {/* Instagram */}
                    <a href="#" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                    </a>
                    {/* LinkedIn */}
                    <a href="#" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0077b5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    </a>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid #cbd5e1',
                    background: '#e8edf3',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                }}>
                    {/* Left: Copyright + meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                            © 2025 <strong>KMRL</strong> All Rights Reserved
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            <strong>LAST UPDATED :</strong> FEB 20, 2026
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            <strong>VISITOR NO.</strong> 851809
                        </span>
                    </div>

                    {/* Right: Designed by */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
                        <span>Designed &amp; Developed by</span>
                        <img src="/images/arohatech.png" alt="ArohaTech" style={{ height: '24px', width: 'auto' }} />
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Small local time component used in the header. Added to avoid runtime ReferenceError
function LocalClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        // Align first tick to the next full second to keep displayed seconds in sync with system clock
        const tick = () => setNow(new Date());
        const msToNextSecond = 1000 - (Date.now() % 1000);
        const to = setTimeout(() => {
            tick();
            const iv = setInterval(tick, 1000);
            // store on window so cleanup can clear if needed (keeps code simple)
            (window.__localClockInterval = iv);
        }, msToNextSecond);

        return () => {
            clearTimeout(to);
            if (window.__localClockInterval) {
                clearInterval(window.__localClockInterval);
                delete window.__localClockInterval;
            }
        };
    }, []);

    // Use Intl for consistent locale + timezone short name
    const locale = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';
    const fmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' });
    return <span style={{ fontSize: 12 }}>{fmt.format(now)}</span>;
}

function LiveTicker({ trains }) {
    const [index, setIndex] = useState(0);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const iv = setInterval(() => {
            setIndex(i => (i + 1) % (trains.length || 1));
        }, 8000);
        return () => clearInterval(iv);
    }, [trains.length]);

    useEffect(() => {
        const iv2 = setInterval(() => setNow(Date.now()), 1000); // refresh every 1s for accurate local time
        return () => clearInterval(iv2);
    }, []);

    if (!trains || trains.length === 0) return null;

    const t = trains[index];
    const ts = t && t.timestamp ? new Date(t.timestamp) : null;
    let updatedText = 'Updated: N/A';
    const locale = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';
    const fmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' });
    if (ts) {
        const diff = Math.floor((now - ts.getTime()) / 1000);
        if (diff < 60) updatedText = 'Updated: just now';
        else if (diff < 3600) updatedText = `Updated: ${Math.floor(diff / 60)}m ago`;
        else updatedText = `Updated: ${fmt.format(ts)}`;
    } else {
        updatedText = `Updated: ${fmt.format(new Date(now))}`;
    }

    return (
        <div style={{ padding: '0.6rem 0.2rem' }}>
            <div style={{ fontWeight: 700 }}>{t.name || t.trainId}</div>
            <div style={{ color: '#444' }}>{t.currentStation || 'N/A'} {t.delayedByMinutes ? `(Delay ${t.delayedByMinutes}m)` : ''}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>{updatedText}</div>
        </div>
    );
}

export default HomePage;
