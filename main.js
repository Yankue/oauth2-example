const express = require('express');
const fetch = require('node-fetch');
const { join } = require('path');
const app = express();
const apiBase = "https://discord.com/api";

const config = {
    CLIENT_ID: "your-id",
    CLIENT_SECRET: "your-secret",
    PORT: 3000
 }
config.REDIRECT_URI = `http://localhost:${config.PORT}/oauth-callback`;

app.get('/', async (req, res) => {
    res.sendFile(join(__dirname + "/homepage.html"));
});

app.get('/login', async (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.CLIENT_ID}&redirect_uri=` + encodeURIComponent(`${config.REDIRECT_URI}`) + `&response_type=code&scope=identify`);
});

app.get('/oauth-callback', async (req, res) => {
    const code = req.query.code;
    if(!code) return res.redirect('http://localhost:' + config.port + "/login");
    fetch(`${apiBase}/oauth2/token`, {
        method: "POST",
        headers: {
           "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
           "client_id": config.CLIENT_ID,
           "client_secret": config.CLIENT_SECRET,
           "grant_type": "authorization_code",
           "code": code,
           "redirect_uri": config.REDIRECT_URI,
           "scope": "identify guilds email"
        })
    }).then(async (result) => {
        result = await result.json();

        const data = await fetch(`${apiBase}/v6/users/@me`, {
            method: "GET",
            headers: {
               "Authorization": `Bearer ${result.access_token}`
            }
         })
         const completeData = await data.json();
         res.send(completeData);
    })
});

app.listen(config.PORT);
