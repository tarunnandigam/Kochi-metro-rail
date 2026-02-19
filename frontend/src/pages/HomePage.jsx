import { useState, useEffect, useRef } from 'react';
import '../styles/HomePage.css';
import VideoBackground from '../components/VideoBackground';
import fareStationsData from '../data/fareStations.json';
import liveTrainsData from '../data/liveTrains.json';

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

    const calculateFare = () => {
        if (!fareDistance) return;
        const distance = parseFloat(fareDistance);
        const baseFare = 10;
        const perKmFare = 2;
        const fare = baseFare + (distance * perKmFare);
        setCalculatedFare(fare.toFixed(2));
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
                <div className="welcome-content">
                    <div className="metro-image">
                        {/* Use VideoBackground component with oip(1) as background (poster/src). Adjust overlayOpacity to ensure text contrast */}
                        {/* If you have an mp4, set src to '/images/oip1.mp4' and poster to '/images/oip1.jpg' */}
                        {/* Using poster-only ensures a static background if video not available */}
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {/* VideoBackground is fixed to viewport; ensure page content has class 'page-content-above-video' to sit above it */}
                            {/* Provide a darker overlay for better readability */}
                            {/* Use poster image oip(1) */}
                            {/* render VideoBackground at top-level via portal-like fixed positioning; include once per page */}
                        </div>
                        <img
                            src="/videos/5be6990fa9fe0c3863fb16b883d50506.gif"
                            alt="Metro hero"
                            className="home-hero-image"
                            style={{ borderRadius: 8, maxWidth: '100%', maxHeight: 360 }}
                            onError={(e) => { e.currentTarget.src = '/vite.svg'; }}
                        />
                    </div>
                    <div style={{ marginLeft: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                            <h4 style={{ margin: 0 }}>Live Trains</h4>
                            <div style={{ fontSize: 12, color: '#666' }}>• Local time: <LocalClock /></div>
                        </div>
                        {liveTrains && liveTrains.length > 0 ? (
                            <div>
                                {/* rotate highlighted train every few seconds for dynamic feeling */}
                                <LiveTicker trains={liveTrains} />
                            </div>
                        ) : (
                            <div>No live data</div>
                        )}
                    </div>

                    <div className="welcome-text">
                        <h2>Welcome to KMRL</h2>
                        <p className="subtitle">Kochi Metro Rail Limited</p>
                        <p className="description">
                            Your smart metro travel companion for finding the best routes and calculating accurate fares.
                            Sign in or create an account to get started.
                        </p>
                        <div className="features">
                            <div className="feature-item">
                                <span className="feature-icon">🚇</span>
                                <p>Find Metro Routes</p>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💰</span>
                                <p>Calculate Fares</p>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⏱️</span>
                                <p>Real-time Info</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Find Metro Section */}
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

            {/* Fare Calculator Section */}
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

            {/* Real-time Info Section */}
            <section className="realtime-info-section">
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
            </section>

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
            <footer className="home-footer">
                <p>&copy; 2024 Kochi Metro Rail Limited. All rights reserved.</p>
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
