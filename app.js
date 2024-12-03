const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const qs = require('qs');


dotenv.config();


const app = express();
const PORT = 3019;

// Load environment variables
const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    AUTHORIZE_URL,
    TOKEN_URL,
    SCOPES,
} = process.env;

// Home Route
app.get('/', (req, res) => {
    const queryParams = qs.stringify({
        client_id: CLIENT_ID,
        response_type: 'Assertion',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        state: 'Embold',
    });
    const authUrl = `${AUTHORIZE_URL}?${queryParams}`;
    res.send(`<a href="${authUrl}">Authorize with Azure DevOps</a>`);
});

// Callback Route
app.get('/auth/callback/az', async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code not provided');
    }

    try {
        const tokenResponse = await axios.post(
            TOKEN_URL,
            qs.stringify({
                client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                client_assertion: CLIENT_SECRET,
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const tokenData = tokenResponse.data;
        res.send(`<h2>Access Token:</h2><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
    } catch (error) {
        console.error('Error exchanging code for token:', error.message);
        res.status(500).send('Failed to exchange code for token');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
