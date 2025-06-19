import React, { useEffect, useState } from 'react';
import './styleLanding.css';
import headerImage from './assets/images2.png';
import plan1Image from './assets/téléchargement22.jpg';
import plan2Image from './assets/téléchargement12.jpeg';
import plan3Image from './assets/téléchargement13.jpeg';
import lounge1Image from './assets/lounge-1.jpg';
import lounge2Image from './assets/lounge-2.jpg';
import traveller1 from './assets/traveller-1.jpg';
import traveller2 from './assets/traveller-2.jpg';
import traveller3 from './assets/traveller-3.jpg';
import traveller4 from './assets/traveller-4.jpg';
import client1 from './assets/client-1.jpg';
import client2 from './assets/client-2.jpg';
import client3 from './assets/client-3.jpg';
import client4 from './assets/client-4.jpg';
import Chatbot from '../components/chatbot/Chatbot';






const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      href="https://cdn.jsdelivr.net/npm/remixicon@3.4.0/fonts/remixicon.css"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="styleLanding.css" />
    <title>Smart Home Control | Flivan</title>
  </head>
  <body>
    <nav>
      <div class="nav__logo">SMART HOME</div>
      <ul class="nav__links">
        <li class="link"><a href="#">Home</a></li>
        <li class="link"><a href="#">About</a></li>
        <li class="link"><a href="#">Features</a></li>
        <li class="link"><a href="#">Pricing</a></li>
        <li class="link"><a href="#">Contact</a></li>
      </ul>
      <button class="btn" onclick="window.location.href='http://localhost:3000/login'">Login</button>
    </nav>
    <header class="section__container header__container">
      <h1 class="section__header">Enjoy Smart Control<br />Your New Home</h1>
      <img src="${headerImage}" alt="header" />
    </header>

    <section class="section__container booking__container">
      <div class="booking__nav">
        <span>Basic Plan</span>
        <span>Advanced Plan</span>
        <span>Premium Plan</span>
      </div>
    </section>

    <section class="section__container plan__container">
      <p class="subheader">SMART HOME FEATURES</p>
      <h2 class="section__header">Control your home with confidence</h2>
      <p class="description">
        Find help with your home automation and see what to expect along your journey to a smarter home.
      </p>
      <div class="plan__grid">
        <div class="plan__content">
          <span class="number">01</span>
          <h4>Smart Lighting</h4>
          <p>
            Control your home's lighting with ease, ensuring a bright and energy-efficient living environment.
          </p>
          <span class="number">02</span>
          <h4>Security Systems</h4>
          <p>
            Protect your home with advanced security systems, offering peace of mind and comprehensive protection.
          </p>
          <span class="number">03</span>
          <h4>Temperature Control</h4>
          <p>
            Maintain a comfortable home environment with smart thermostats and climate control systems.
          </p>
        </div>
        <div class="plan__image">
          <img src="${plan1Image}" alt="plan" />
          <img src="${plan2Image}" alt="plan" />
          <img src="${plan3Image}" alt="plan" />
        </div>
      </div>
    </section>

    <section class="memories">
      <div class="section__container memories__container">
        <div class="memories__header">
          <h2 class="section__header">
            Make your home smarter with our solutions
          </h2>
          <button class="view__all">View All</button>
        </div>
        <div class="memories__grid">
          <div class="memories__card">
            <span><i class="ri-calendar-2-line"></i></span>
            <h4>Automate & Relax</h4>
            <p>
              With "Automate and Relax," enjoy the convenience of a fully automated home, giving you more time to unwind.
            </p>
          </div>
          <div class="memories__card">
            <span><i class="ri-shield-check-line"></i></span>
            <h4>Smart Monitoring</h4>
            <p>
              Introducing Smart Monitoring, revolutionizing the way you keep track of your home's activities and security.
            </p>
          </div>
          <div class="memories__card">
            <span><i class="ri-bookmark-2-line"></i></span>
            <h4>Energy Savings</h4>
            <p>
              From efficient energy management to cost-saving tips, we prioritize sustainability without compromising on comfort.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section__container lounge__container">
      <div class="lounge__image">
        <img src="${lounge1Image}" alt="lounge" />
        <img src="${lounge2Image}" alt="lounge" />
      </div>
      <div class="lounge__content">
        <h2 class="section__header">Exclusive Home Lounge</h2>
        <div class="lounge__grid">
          <div class="lounge__details">
            <h4>Experience Comfort</h4>
            <p>
              Enjoy a comfortable living space with our smart home solutions, providing convenience and ease.
            </p>
          </div>
          <div class="lounge__details">
            <h4>Upgrade Your Lifestyle</h4>
            <p>
              Enhance your lifestyle with premium amenities, intelligent automation, and personalized settings.
            </p>
          </div>
          <div class="lounge__details">
            <h4>A Cozy Environment</h4>
            <p>
              Create a welcoming atmosphere for your family and friends with our smart home technologies.
            </p>
          </div>
          <div class="lounge__details">
            <h4>Gourmet Experiences</h4>
            <p>
              Elevate your culinary experiences with smart kitchen appliances, offering convenience and innovation.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section__container travellers__container">
      <h2 class="section__header">Top Home Automation Users of the Month</h2>
      <div class="travellers__grid">
        <div class="travellers__card">
          <img src="${traveller1}" alt="user" />
          <div class="travellers__card__content">
            <img src="${client1}" alt="client" />
            <h4>Emily Johnson</h4>
            <p>New York</p>
          </div>
        </div>
        <div class="travellers__card">
          <img src="${traveller2}" alt="user" />
          <div class="travellers__card__content">
            <img src="${client2}" alt="client" />
            <h4>David Smith</h4>
            <p>San Francisco</p>
          </div>
        </div>
        <div class="travellers__card">
          <img src="${traveller3}" alt="user" />
          <div class="travellers__card__content">
            <img src="${client3}" alt="client" />
            <h4>Olivia Brown</h4>
            <p>Chicago</p>
          </div>
        </div>
        <div class="travellers__card">
          <img src="${traveller4}" alt="user" />
          <div class="travellers__card__content">
            <img src="${client4}" alt="client" />
            <h4>Daniel Taylor</h4>
            <p>Miami</p>
          </div>
        </div>
      </div>
    </section>

    <section class="subscribe">
      <div class="section__container subscribe__container">
        <h2 class="section__header">Subscribe for Smart Home Updates</h2>
        <form class="subscribe__form">
          <input type="text" placeholder="Enter your email here" />
          <button class="btn">Subscribe</button>
        </form>
      </div>
    </section>

    <footer class="footer">
      <div class="section__container footer__container">
        <div class="footer__col">
          <h3>Flivan</h3>
          <p>
            Smart Home Solutions. With a commitment to innovation and customer satisfaction, Flivan offers advanced home automation services.
          </p>
          <p>
            From smart lighting to security systems, we provide seamless and intelligent solutions for a better home experience.
          </p>
        </div>
        <div class="footer__col">
          <h4>INFORMATION</h4>
          <p>Home</p>
          <p>About</p>
          <p>Features</p>
          <p>Pricing</p>
          <p>Contact</p>
        </div>
        <div class="footer__col">
          <h4>CONTACT</h4>
          <p>Support</p>
          <p>Media</p>
          <p>Socials</p>
        </div>
      </div>
      <div class="section__container footer__bar">
        <p>Copyright © 2023 Smart Home Solutions. All rights reserved.</p>
        <div class="socials">
          <span><i class="ri-facebook-fill"></i></span>
          <span><i class="ri-twitter-fill"></i></span>
          <span><i class="ri-instagram-line"></i></span
          <span><i class="ri-youtube-fill"></i></span>
        </div>
      </div>
    </footer>
  </body>
</html>

`;

const Landing = () => {
    const [content, setContent] = useState('');

    useEffect(() => {
        setContent(htmlContent);
    }, []);

    return (
        <div>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            <Chatbot />
        </div>
    );
};

export default Landing;
