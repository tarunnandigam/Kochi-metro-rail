import React, { useState, useEffect } from 'react';
import '../styles/MyAccount.css';

const MyAccount = ({ user, onLogout, onNavigate }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [ticketTab, setTicketTab] = useState('active');
    const [transactionTab, setTransactionTab] = useState('all');

    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const storedTxns = JSON.parse(localStorage.getItem('kmrl_all_transactions') || '[]');
        // map and sort by date descending
        const mapped = storedTxns.map(t => ({
            from: t.fromStation || 'Network',
            to: t.toStation || 'Network',
            id: t.bookingId || 'TXN1029384756',
            dateTime: t.date || new Date().toLocaleString(),
            method: t.method || 'Bill Desk / UPI',
            status: t.status || 'Success',
            amount: `₹ ${t.fare || 0}`,
            rawDate: new Date(t.date || new Date())
        })).sort((a, b) => b.rawDate - a.rawDate);
        setTransactions(mapped);
    }, []);

    const filterTransactions = () => {
        if (transactionTab === 'all') return transactions;
        return transactions.filter(t => t.status.toLowerCase() === transactionTab.replace('_', ' '));
    };

    return (
        <div className="account-container">
            <aside className="account-sidebar">
                <div className="sidebar-header">
                    <h2>Account Settings</h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            Profile
                        </li>
                        <li className={activeTab === 'medical' ? 'active' : ''} onClick={() => setActiveTab('medical')}>
                            Medical Information
                        </li>
                        <li className={activeTab === 'tickets' ? 'active' : ''} onClick={() => setActiveTab('tickets')}>
                            My Tickets
                        </li>
                        <li className={activeTab === 'transactions' ? 'active' : ''} onClick={() => setActiveTab('transactions')}>
                            My Transactions
                        </li>
                        <li className={activeTab === 'lostitem' ? 'active' : ''} onClick={() => setActiveTab('lostitem')}>
                            My Lost Item
                        </li>
                        <li className={activeTab === 'vigilance' ? 'active' : ''} onClick={() => setActiveTab('vigilance')}>
                            Vigilance Complaint
                        </li>
                        <li className={activeTab === 'grievance' ? 'active' : ''} onClick={() => setActiveTab('grievance')}>
                            Grievance Complaint
                        </li>
                    </ul>
                    <div className="logout-section" onClick={onLogout}>
                        <span className="logout-text">Logout</span>
                    </div>
                </nav>
            </aside>

            <main className="account-main">
                {activeTab === 'profile' && (
                    <div className="profile-section">
                        <div className="section-header">
                            <div>
                                <h1>Profile</h1>
                                <p>Provide your personal details for a personalized and better user experience.</p>
                            </div>
                            <div className="header-actions">
                                <span className="go-green-badge">
                                    GO-GREEN POINTS: 0
                                </span>
                                <button className="edit-btn">Edit Details</button>
                            </div>
                        </div>

                        <div className="profile-body">
                            <div className="avatar-section">
                                <div className="avatar-circle">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <button className="upload-pic-btn">Upload Picture</button>
                            </div>

                            <div className="form-section">
                                <div className="form-group-title">
                                    <span>Personal Details</span>
                                    <div className="line"></div>
                                </div>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>First Name*</label>
                                        <input type="text" defaultValue="Nandigam" disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Last Name*</label>
                                        <input type="text" defaultValue="Tarun" disabled />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Father's Name*</label>
                                        <input type="text" placeholder="Father's Name" disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Date of Birth*</label>
                                        <input type="text" placeholder="mm/dd/yyyy" disabled />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Gender*</label>
                                        <div className="toggle-group">
                                            <button className="toggle-btn active">Male</button>
                                            <button className="toggle-btn">Female</button>
                                            <button className="toggle-btn">Other</button>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Marital Status*</label>
                                        <div className="toggle-group">
                                            <button className="toggle-btn active">Single</button>
                                            <button className="toggle-btn">Married</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group-title mt-4">
                                    <span>Contact Details</span>
                                    <div className="line"></div>
                                </div>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Contact Number*</label>
                                        <div className="phone-input">
                                            <span className="prefix">+91</span>
                                            <input type="text" defaultValue="6303075411" disabled />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>E-Mail Address*</label>
                                        <input type="email" defaultValue={user?.email || "tarunnandigam@gmail.com"} disabled />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="input-group full-width">
                                        <label>Address*</label>
                                        <textarea placeholder="Enter Address" disabled></textarea>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>City*</label>
                                        <input type="text" placeholder="City" disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>State*</label>
                                        <select disabled>
                                            <option>Select State</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>PIN Code*</label>
                                        <input type="text" placeholder="PIN Code" disabled />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tickets' && (
                    <div className="tickets-section">
                        <h1>My Tickets</h1>
                        <div className="tabs">
                            <button className={`tab ${ticketTab === 'active' ? 'active' : ''}`} onClick={() => setTicketTab('active')}>Active Tickets</button>
                            <button className={`tab ${ticketTab === 'completed' ? 'active' : ''}`} onClick={() => setTicketTab('completed')}>Completed Tickets</button>
                        </div>
                        <div className="tab-content">
                            {ticketTab === 'active' && transactions.length > 0 ? (
                                transactions.map((txn, idx) => (
                                    <div className="ticket-card" key={idx}>
                                        <div className="ticket-header">
                                            <span className="ticket-route">{txn.from} &rarr; {txn.to}</span>
                                            <span className="ticket-status">Active</span>
                                        </div>
                                        <div className="ticket-body">
                                            <p><strong>Booking ID:</strong> {txn.id}</p>
                                            <p><strong>Date:</strong> {txn.dateTime}</p>
                                        </div>
                                        <div className="ticket-actions">
                                            <button className="view-ticket-btn" onClick={() => onNavigate('ticket')}>View QR Ticket</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">No tickets found in this category.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="transactions-section">
                        <h1>My Transactions</h1>
                        <div className="transaction-filters">
                            {['All', 'Success', 'Pending', 'Failed', 'Refund Initiated', 'Refunded', 'Cancelled'].map(status => {
                                const val = status.toLowerCase().replace(' ', '_');
                                return (
                                    <button
                                        key={val}
                                        className={`filter-btn ${transactionTab === val ? 'active' : ''}`}
                                        onClick={() => setTransactionTab(val)}
                                    >
                                        {status}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="transaction-list">
                            {filterTransactions().map((txn, idx) => (
                                <div className="transaction-card" key={idx}>
                                    <div className="txn-left">
                                        <div className="txn-route">
                                            <span className="station">{txn.from}</span>
                                            <span className="arrow">&rarr;</span>
                                            <span className="station">{txn.to}</span>
                                        </div>
                                        <div className="txn-details">
                                            <div className="detail-col">
                                                <small>Transaction ID</small>
                                                <span>{txn.id}</span>
                                            </div>
                                            <div className="detail-col">
                                                <small>Transaction Date & Time</small>
                                                <span>{txn.dateTime}</span>
                                            </div>
                                            <div className="detail-col">
                                                <small>Payment Method</small>
                                                <span>{txn.method}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="txn-right">
                                        <div className="txn-status">
                                            <small>Status</small>
                                            <span className={`status-badge ${txn.status.toLowerCase()}`}>{txn.status}</span>
                                        </div>
                                        <div className="txn-amount">
                                            {txn.amount}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filterTransactions().length === 0 && (
                                <div className="empty-state">No transactions found.</div>
                            )}
                        </div>
                    </div>
                )}

                {['medical', 'lostitem', 'vigilance', 'grievance'].includes(activeTab) && (
                    <div className="placeholder-section">
                        <h1>Coming Soon</h1>
                        <p>This module is currently under development.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyAccount;
