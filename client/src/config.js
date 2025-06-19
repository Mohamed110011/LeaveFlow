const config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
    RECAPTCHA_SITE_KEY: process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LfT3GMrAAAAAPvjbNp0ypX9zB820x06VPv-FTXj',
    GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyDuF2yA3fFOsJ_TtLQZQYGr-WRfucLeolg'
};

export default config;
