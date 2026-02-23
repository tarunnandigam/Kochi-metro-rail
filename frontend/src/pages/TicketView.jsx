import React, { useEffect, useState } from 'react';
import '../styles/TicketView.css';

function TicketView({ onNavigate }) {
    const [booking, setBooking] = useState(null);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailResult, setEmailResult] = useState(null);

    useEffect(() => {
        const raw = localStorage.getItem('kmrl_latest_booking');
        if (raw) {
            try {
                setBooking(JSON.parse(raw));
            } catch (e) {
                setBooking(null);
            }
        }
    }, []);

    if (!booking) {
        return (
            <div className="ticket-view">
                <h2>No recent booking found</h2>
                <p>Please complete a booking first.</p>
                <button onClick={() => onNavigate('findmetro')}>Find Metro</button>
            </div>
        );
    }

    const ticketUrl = booking.ticketUrl && (booking.ticketUrl.startsWith('http') || booking.ticketUrl.startsWith('/'))
        ? (booking.ticketUrl.startsWith('http') ? booking.ticketUrl : `${window.location.origin}${booking.ticketUrl}`)
        : `${window.location.origin}/api/metro/bookings/${booking.bookingId}/ticket`;

    const handleDownload = async () => {
        try {
            const headers = {};
            // include Authorization header if present in localStorage
            try { const token = localStorage.getItem('kmrl_token'); if (token) headers['Authorization'] = `Bearer ${token}`; } catch (e) { }
            const resp = await fetch(ticketUrl, { headers });
            if (!resp.ok) {
                // fallback to opening in new tab
                window.open(ticketUrl, '_blank');
                return;
            }
            const blob = await resp.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const filename = `kmrl_ticket_${booking.bookingId}.pdf`;
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            // last-resort: open in new tab
            window.open(ticketUrl, '_blank');
        }
    };

    const handleEmail = async () => {
        const email = booking.email || (booking.user && booking.user.email) || prompt('Enter email to send ticket to:');
        if (!email) return;
        setSendingEmail(true);
        setEmailResult(null);
        try {
            // Call backend to request email send; backend may respond with ticketUrl when SMTP not configured
            const resp = await fetch('/api/metro/email-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.bookingId, email })
            });
            const data = await resp.json();
            if (resp.ok) {
                setEmailResult(data.message || 'Email requested');
                if (data.ticketUrl) {
                    setEmailResult((prev) => (prev ? prev + ' — ' : '') + `Ticket URL: ${data.ticketUrl}`);
                }
            } else {
                setEmailResult(data.message || 'Failed to send email');
            }
        } catch (err) {
            setEmailResult('Failed to send email');
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div className="ticket-view">
            <div className="ticket-wrapper">
                <div className="ticket-premium-card">
                    <div className="ticket-header">
                        <h2 className="ticket-header-title">KOCHI METRO RAIL</h2>
                        <div className="ticket-header-subtitle">DIGITAL TICKET</div>
                    </div>

                    <div className="ticket-body">
                        <div className="ticket-notch-left"></div>
                        <div className="ticket-notch-right"></div>
                        <div className="ticket-dash-line"></div>

                        <div className="ticket-route" style={{ marginTop: '12px' }}>
                            <div className="ticket-station">
                                <span className="ticket-station-label">FROM</span>
                                <span className="ticket-station-code" style={{ color: '#4c1d95' }}>{booking.fromStation.substring(0, 4).toUpperCase()}</span>
                                <span className="ticket-station-name">{booking.fromStation}</span>
                            </div>
                            <div className="ticket-arrow-icon">➔</div>
                            <div className="ticket-station" style={{ alignItems: 'flex-end', textAlign: 'right' }}>
                                <span className="ticket-station-label">TO</span>
                                <span className="ticket-station-code" style={{ color: '#4c1d95' }}>{booking.toStation.substring(0, 4).toUpperCase()}</span>
                                <span className="ticket-station-name">{booking.toStation}</span>
                            </div>
                        </div>

                        <div className="ticket-qr-section">
                            <div className="temp-qr-box">
                                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" opacity="0.8">
                                    <path d="M4 4h6v6H4V4zM14 4h6v6h-6V4zM4 14h6v6H4v-6z" stroke="#312e81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="6" y="6" width="2" height="2" fill="#312e81" />
                                    <rect x="16" y="6" width="2" height="2" fill="#312e81" />
                                    <rect x="6" y="16" width="2" height="2" fill="#312e81" />
                                    <path d="M14 14h6v6h-6v-6zM16 16h2v2h-2v-2z" fill="#312e81" />
                                    <path d="M14 14h2v2h-2v-2zM18 14h2v2h-2v-2zM14 18h2v2h-2v-2zM18 18h2v2h-2v-2z" fill="#312e81" />
                                </svg>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '12px', fontWeight: 600 }}>
                                SCAN TO ENTER STATION
                            </div>
                        </div>

                        <div className="ticket-info-grid">
                            <div className="ticket-info-item">
                                <span className="ticket-info-label">BOOKING ID</span>
                                <span className="ticket-info-value">{booking.bookingId || 'KMR-8X2M9'}</span>
                            </div>
                            <div className="ticket-info-item">
                                <span className="ticket-info-label">FARE</span>
                                <span className="ticket-info-value">₹ {booking.fare}</span>
                            </div>
                            <div className="ticket-info-item">
                                <span className="ticket-info-label">PASSENGERS</span>
                                <span className="ticket-info-value">{booking.passengers || '1'}</span>
                            </div>
                            <div className="ticket-info-item">
                                <span className="ticket-info-label">DATE</span>
                                <span className="ticket-info-value">{new Date().toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button onClick={handleDownload} className="ticket-btn btn-primary-ticket">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Download Ticket
                    </button>
                    <button onClick={handleEmail} className="ticket-btn btn-secondary-ticket" disabled={sendingEmail}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        {sendingEmail ? 'Sending...' : 'Send to Email'}
                    </button>
                    {emailResult && <div className="email-result" style={{ textAlign: 'center', fontSize: '0.85rem' }}>{emailResult}</div>}
                </div>

                <div className="ticket-view-home">
                    <span onClick={() => onNavigate('home')}>Return to Home</span>
                </div>
            </div>
        </div>
    );
}

export default TicketView;
