import React, { useState, useEffect } from 'react';
import './styleLanding.css';
import { 
  FaCalendarAlt, 
  FaBell, 
  FaChartLine, 
  FaSun, 
  FaMoon,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';
import Chatbot from '../components/chatbot/Chatbot';

// Import images
import heroImage from './assets/Facing.png';
import dashboardImage from './assets/software.webp';

const Landing = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 70; // height of fixed navbar
      const elementPosition = element.offsetTop - navbarHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="leave-flow-landing">
      <nav className="nav">
        <div className="nav__logo">LeaveFlow</div>
        <ul className="nav__links">
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
          <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How it works</a></li>
          <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</a></li>
          <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a></li>
        </ul>
        <div className="nav__buttons">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          <a href="/register" className="btn btn-outline">Sign Up</a>
          <a href="/login" className="btn">Login</a>
        </div>
      </nav>

      <header className="hero">
        <div className="hero__content">
          <h1>Simplify Your Leave Management</h1>
          <p>Streamline your organization's leave requests, approvals, and tracking with our intuitive platform.</p>
          <a href="/register" className="btn btn-large">
            Start Free Trial
          </a>
        </div>
        <div className="hero__image">
          <img src={heroImage} alt="Leave Management Dashboard" />
        </div>
      </header>

      <section className="features" id="features">
        <h2>Why Choose LeaveFlow?</h2>
        <div className="features__grid">
          <div className="feature-card">
            <FaCalendarAlt className="feature-icon" />
            <h3>Easy Leave Planning</h3>
            <p>Request and manage leaves with just a few clicks. Plan your time off efficiently.</p>
          </div>
          <div className="feature-card">
            <FaBell className="feature-icon" />
            <h3>Smart Notifications</h3>
            <p>Stay informed with automated alerts for requests, approvals, and team updates.</p>
          </div>
          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>Real-time Analytics</h3>
            <p>Track leave patterns, balances, and team availability in real-time.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up and set up your organization's profile with employee details and leave policies.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Set Policies</h3>
            <p>Define leave types, approval workflows, and customize settings to match your needs.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Manage Leaves</h3>
            <p>Employees request leaves, managers approve, and everyone stays informed in real-time.</p>
          </div>
        </div>
      </section>

      <section className="dashboard-preview">
        <div className="dashboard-preview__content">
          <h2>Powerful Dashboard</h2>
          <p>Get a clear overview of your team's leave status</p>
          <ul className="dashboard-features">
            <li>
              <span className="check-icon">✓</span>
              Visual calendar view
            </li>
            <li>
              <span className="check-icon">✓</span>
              Leave balance tracking
            </li>
            <li>
              <span className="check-icon">✓</span>
              Team availability
            </li>
            <li>
              <span className="check-icon">✓</span>
              Custom reports
            </li>
          </ul>
        </div>
        <div className="dashboard-preview__image">
          <img src={dashboardImage} alt="Dashboard Preview" />
        </div>
      </section>

      <section className="pricing" id="pricing">
        <h2>Simple, Transparent Pricing</h2>
        <div className="pricing__grid">
          <div className="pricing-card">
            <h3>Starter</h3>
            <div className="price">$5<span>/user/month</span></div>
            <ul>
              <li>Up to 10 users</li>
              <li>Basic leave types</li>
              <li>Email notifications</li>
              <li>Basic reporting</li>
            </ul>
            <a href="/register" className="btn">Get Started</a>
          </div>
          <div className="pricing-card featured">
            <div className="popular-badge">Most Popular</div>
            <h3>Professional</h3>
            <div className="price">$10<span>/user/month</span></div>
            <ul>
              <li>Unlimited users</li>
              <li>Custom leave types</li>
              <li>Advanced notifications</li>
              <li>Advanced reporting</li>
            </ul>
            <a href="/register" className="btn">Get Started</a>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Contact Us</div>
            <ul>
              <li>Custom solutions</li>
              <li>API access</li>
              <li>Dedicated support</li>
              <li>Custom integrations</li>
            </ul>
            <a href="/contact" className="btn btn-outline">Contact Sales</a>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact__content">
          <h2>Get in Touch</h2>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          
          <div className="contact__info">
            <div className="contact__info-item">
              <FaPhone className="contact__icon" />
              <div>
                <h4>Phone</h4>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="contact__info-item">
              <FaEnvelope className="contact__icon" />
              <div>
                <h4>Email</h4>
                <p>info@leaveflow.com</p>
              </div>
            </div>
            <div className="contact__info-item">
              <FaMapMarkerAlt className="contact__icon" />
              <div>
                <h4>Office</h4>
                <p>123 Business Ave, Suite 100<br />San Francisco, CA 94107</p>
              </div>
            </div>
          </div>

          <form className="contact__form">
            <div className="form__group">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
            </div>
            <input type="text" placeholder="Subject" required />
            <textarea placeholder="Your Message" rows="5" required></textarea>
            <button type="submit" className="btn btn-large">Send Message</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__content">
          <div className="footer__section footer__brand">
            <h4>LeaveFlow</h4>
            <p>Making leave management simple and efficient for organizations worldwide.</p>
            <div className="footer__social">
              <a href="#" aria-label="LinkedIn">
                <FaLinkedin className="social-icon" />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter className="social-icon" />
              </a>
              <a href="#" aria-label="Facebook">
                <FaFacebook className="social-icon" />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram className="social-icon" />
              </a>
            </div>
          </div>
          
          <div className="footer__section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#integrations">Integrations</a></li>
              <li><a href="#api">API</a></li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4>Company</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/press">Press Kit</a></li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4>Resources</h4>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/documentation">Documentation</a></li>
              <li><a href="/guides">Guides</a></li>
              <li><a href="/webinars">Webinars</a></li>
              <li><a href="/status">System Status</a></li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/security">Security</a></li>
              <li><a href="/compliance">Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer__divider"></div>
        
        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} LeaveFlow. All rights reserved.</p>
          
        </div>
      </footer>
      
      <Chatbot />
    </div>
  );
};

export default Landing;