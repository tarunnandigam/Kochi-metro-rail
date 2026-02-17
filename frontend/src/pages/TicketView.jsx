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
        : `${window.location.origin}/mock-api/tickets/${booking.bookingId}.pdf`;

    const handleDownload = async () => {
        try {
            const headers = {};
            // include Authorization header if present in localStorage
            try { const token = localStorage.getItem('kmrl_token'); if (token) headers['Authorization'] = `Bearer ${token}`; } catch (e) {}
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
        <div className="ticket-view page-content">
            <div className="ticket-card">
                <h2>KMRL Ticket</h2>
                <p><strong>Booking ID:</strong> {booking.bookingId}</p>
                <p><strong>From:</strong> {booking.fromStation}</p>
                <p><strong>To:</strong> {booking.toStation}</p>
                <p><strong>Fare:</strong> ₹{booking.fare}</p>
                <p><strong>Passenger:</strong> {booking.passengerName || 'N/A'}</p>
                <div className="ticket-actions">
                    <button onClick={handleDownload} className="btn-primary">Download / View Ticket</button>
                    <button onClick={handleEmail} className="btn-secondary" disabled={sendingEmail}>{sendingEmail ? 'Sending...' : 'Send to Email'}</button>
                </div>
                {emailResult && <div className="email-result">{emailResult}</div>}
                <div style={{ marginTop: 12 }}>
                    <button onClick={() => onNavigate('dashboard')} className="btn-link">Back to Dashboard</button>
                </div>
            </div>
        </div>
    );
}

export default TicketView;
