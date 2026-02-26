import React from "react";
import Footer from "../components/Layout/Footer";
import "../styles/HelpAndContact.css"; // We'll create this CSS file later

const HelpAndContact = ({ onNavigate }) => {
    return (
        <div className="help-contact-page">
            <div className="hc-hero">
                <div className="hc-hero-content">
                    <h1>Help & Contact</h1>
                    <p>We are here to assist you with any inquiries, suggestions, or issues related to Kochi Metro.</p>
                </div>
            </div>

            <div className="hc-main-content">
                <div className="hc-section hc-contact-info">
                    <h2>Reach Out to Us</h2>
                    <div className="hc-cards">
                        <div className="hc-card">
                            <div className="hc-icon">📞</div>
                            <h3>24x7 Helpline</h3>
                            <p>Call us toll-free anytime for instant support and emergencies.</p>
                            <span className="hc-highlight">1800-425-8022</span>
                        </div>
                        <div className="hc-card">
                            <div className="hc-icon">✉️</div>
                            <h3>Email Support</h3>
                            <p>Send us your detailed queries, business proposals, or feedback.</p>
                            <span className="hc-highlight">contact@kochimetro.org</span>
                        </div>
                        <div className="hc-card">
                            <div className="hc-icon">📍</div>
                            <h3>Head Office</h3>
                            <p>Kochi Metro Rail Limited<br />JLN Stadium Metro Station<br />Kaloor, Ernakulam, Kerala 682017</p>
                        </div>
                    </div>
                </div>

                <div className="hc-section hc-form-section">
                    <h2>Send Us a Message</h2>
                    <p>Got a specific question or complaint? Fill out the form below and our team will get back to you shortly.</p>
                    <form className="hc-form" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! We will get back to you soon.'); }}>
                        <div className="hc-form-row">
                            <div className="hc-form-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="Enter your full name" required />
                            </div>
                            <div className="hc-form-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="Enter your email address" required />
                            </div>
                        </div>
                        <div className="hc-form-group">
                            <label>Subject</label>
                            <input type="text" placeholder="What is this regarding?" required />
                        </div>
                        <div className="hc-form-group">
                            <label>Message</label>
                            <textarea rows="5" placeholder="Write your message here..." required></textarea>
                        </div>
                        <button type="submit" className="hc-submit-btn">Send Message</button>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HelpAndContact;
