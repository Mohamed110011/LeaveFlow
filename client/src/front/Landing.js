import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';
import Chatbot from '../components/chatbot/Chatbot';
import LanguageSelector from '../components/LanguageSelector';

// Import images
import heroImage from './assets/Facing.png';
import dashboardImage from './assets/software.webp';

const Landing = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { t } = useTranslation();

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
    <div className="leave-flow-landing">      <nav className="nav">
        <div className="nav__logo">LeaveFlow</div>
        <div className="nav__links">
          <a href="#features">{t('landing.navigation.features')}</a>
          <a href="#how-it-works">{t('landing.navigation.howItWorks')}</a>
          <a href="#pricing">{t('landing.navigation.pricing')}</a>
          <a href="#contact">{t('landing.navigation.contact')}</a>
        </div>
        <div className="nav__actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          <LanguageSelector />          <button className="btn btn-outline" onClick={() => window.location.href='/login'}>
            {t('landing.navigation.login')}
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href='/register'}>
            {t('landing.navigation.register')}
          </button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero__content">
          <h1>{t('landing.hero.title')}</h1>
          <p>{t('landing.hero.subtitle')}</p>
          <button className="btn btn-large" onClick={() => window.location.href='/register'}>
            {t('landing.hero.startTrial')}
          </button>
        </div>
        <div className="hero__image">
          <img src={heroImage} alt="Leave Management" />
        </div>
      </header>

      <section className="features" id="features">
        <h2>{t('landing.features.title')}</h2>
        <div className="features__grid">
          <div className="feature-card">
            <FaCalendarAlt className="feature-icon" />
            <h3>{t('landing.features.cards.planning.title')}</h3>
            <p>{t('landing.features.cards.planning.description')}</p>
          </div>
          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>{t('landing.features.cards.tracking.title')}</h3>
            <p>{t('landing.features.cards.tracking.description')}</p>
          </div>
          <div className="feature-card">
            <FaBell className="feature-icon" />
            <h3>{t('landing.features.cards.notifications.title')}</h3>
            <p>{t('landing.features.cards.notifications.description')}</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <h2>{t('landing.pricing.title')}</h2>
        <div className="pricing__grid">
          <div className="pricing-card">
            <h3>{t('landing.pricing.plans.starter.title')}</h3>
            <div className="price">
              {t('landing.pricing.plans.starter.price')}
              <span>{t('landing.pricing.plans.starter.period')}</span>
            </div>
            <ul>
              {t('landing.pricing.plans.starter.features', { returnObjects: true }).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button className="btn">{t('landing.cta.getStarted')}</button>
          </div>
          <div className="pricing-card featured">
            <h3>{t('landing.pricing.plans.professional.title')}</h3>
            <div className="price">
              {t('landing.pricing.plans.professional.price')}
              <span>{t('landing.pricing.plans.professional.period')}</span>
            </div>
            <ul>
              {t('landing.pricing.plans.professional.features', { returnObjects: true }).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button className="btn">{t('landing.cta.getStarted')}</button>
          </div>
          <div className="pricing-card">
            <h3>{t('landing.pricing.plans.enterprise.title')}</h3>
            <div className="price">{t('landing.pricing.plans.enterprise.price')}</div>
            <ul>
              {t('landing.pricing.plans.enterprise.features', { returnObjects: true }).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button className="btn btn-outline">{t('landing.cta.contactSales')}</button>
          </div>
        </div>      </section>

      <section className="dashboard-preview">
        <div className="dashboard-preview__content">
          <h2>{t('landing.dashboard.title')}</h2>
          <p>{t('landing.dashboard.subtitle')}</p>
          <ul className="dashboard-features">
            <li>✓ {t('landing.dashboard.features.calendarView')}</li>
            <li>✓ {t('landing.dashboard.features.leaveBalance')}</li>
            <li>✓ {t('landing.dashboard.features.teamAvailability')}</li>
            <li>✓ {t('landing.dashboard.features.customReports')}</li>
          </ul>
        </div>
        <div className="dashboard-preview__image">
          <img src={dashboardImage} alt="Dashboard Preview" />
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>{t('landing.contact.title')}</h2>
        <p className="subtitle">{t('landing.contact.subtitle')}</p>
        <div className="contact__content">
          <form className="contact-form">
            <input 
              type="text" 
              placeholder={t('landing.contact.form.name')} 
              required 
            />
            <input 
              type="email" 
              placeholder={t('landing.contact.form.email')} 
              required 
            />
            <textarea 
              placeholder={t('landing.contact.form.message')} 
              required
            ></textarea>
            <button type="submit" className="btn btn-primary">
              {t('landing.contact.form.send')} <FaEnvelope />
            </button>
          </form>
          <div className="contact-info">
            <div className="info-item">
              <FaPhone />
              <span>{t('landing.contact.info.phone')}</span>
            </div>
            <div className="info-item">
              <FaEnvelope />
              <span>{t('landing.contact.info.email')}</span>
            </div>
            <div className="info-item">
              <FaMapMarkerAlt />
              <span>{t('landing.contact.info.address')}</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__content">
          <div className="footer__section">
            <h4>{t('landing.footer.about.title')}</h4>
            <p>{t('landing.footer.about.description')}</p>
          </div>
          <div className="footer__section">
            <h4>{t('landing.footer.sections.product.title')}</h4>
            <ul>
              <li><a href="#features">{t('landing.footer.sections.product.links.features')}</a></li>
              <li><a href="#pricing">{t('landing.footer.sections.product.links.pricing')}</a></li>
              <li><a href="#how-it-works">{t('landing.footer.sections.product.links.howItWorks')}</a></li>
            </ul>
          </div>
          <div className="footer__section">
            <h4>{t('landing.footer.sections.company.title')}</h4>
            <ul>
              <li><a href="/about">{t('landing.footer.sections.company.links.about')}</a></li>
              <li><a href="/contact">{t('landing.footer.sections.company.links.contact')}</a></li>
              <li><a href="/blog">{t('landing.footer.sections.company.links.blog')}</a></li>
            </ul>
          </div>
          <div className="footer__section">            <h4>{t('landing.footer.social.title')}</h4>
            <div className="social-links">
              <a href="https://linkedin.com/company/leaveflow" target="_blank" rel="noopener noreferrer" title={t('landing.footer.social.linkedin')}><FaLinkedin /></a>
              <a href="https://twitter.com/leaveflow" target="_blank" rel="noopener noreferrer" title={t('landing.footer.social.twitter')}><FaTwitter /></a>
              <a href="https://facebook.com/leaveflow" target="_blank" rel="noopener noreferrer" title={t('landing.footer.social.facebook')}><FaFacebook /></a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>{t('landing.footer.copyright')}</p>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
};

export default Landing;