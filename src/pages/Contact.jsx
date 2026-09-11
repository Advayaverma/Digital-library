import React, { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState('green');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatusMessage('Please fill in all fields!');
      setStatusColor('red');
      return;
    }

    setStatusMessage('Message sent successfully!');
    setStatusColor('green');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <section className="contact-container">
      <div className="contact-content">
        <h2>Contact Us</h2>
        <p>Have questions? Feel free to reach out to us through the following contact details.</p>

        <div className="contact-details">
          <p><i className="fas fa-envelope"></i> Email: support@digitallibrary.com</p>
          <p><i className="fas fa-phone"></i> Phone: +1 (123) 456-7890</p>
          <p><i className="fas fa-map-marker-alt"></i> Address: 123 Library Street, Knowledge City, 56789</p>
        </div>

        <h3>Follow Us</h3>
        <div className="social-links">
          <a href="#facebook" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
          <a href="#twitter" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#instagram" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          <a href="#linkedin" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
        </div>

        {/* Contact Form */}
        <h3>Send Us a Message</h3>
        <form id="contactForm" onSubmit={handleSubmit}>
          <input
            type="text"
            id="name"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            id="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            id="message"
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <button type="submit">Send Message</button>
        </form>

        {statusMessage && (
          <p id="formMessage" className="form-message" style={{ color: statusColor }}>
            {statusMessage}
          </p>
        )}
      </div>
    </section>
  );
}
