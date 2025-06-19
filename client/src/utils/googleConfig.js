const verifyGoogleConfig = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
        console.error('Google Client ID is not set in .env.local');
        return false;
    }
    console.log('Google Client ID is configured');
    return true;
};

export default verifyGoogleConfig;
