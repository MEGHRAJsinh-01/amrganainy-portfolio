# Preventing Render Free Tier Sleep

Render's free tier web services will sleep after 15 minutes of inactivity. This means your backend API might be slow to respond when first accessed after a period of inactivity.

To keep your service active and minimize cold starts, you can use a free service like UptimeRobot to periodically ping your API.

## Setting Up UptimeRobot

1. Create a free account at [UptimeRobot](https://uptimerobot.com/)

2. After logging in, click "Add New Monitor"

3. Configure the monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: Portfolio API
   - URL: https://your-render-app-name.onrender.com/api/health
   - Monitoring Interval: 5 minutes (Free tier minimum)

4. Advanced Options:
   - Set alert contacts if you want to be notified of downtime
   - Consider adding a "Monitor-specific status page" to track uptime

5. Click "Create Monitor"

## Why This Works

By pinging your health check endpoint every 5 minutes, your Render service will never go to sleep, ensuring:

- Fast response times for all users
- Consistent performance for your portfolio site
- Better experience for potential employers viewing your portfolio

## Alternative: Custom Ping Script

If you prefer more control, you can also create a simple ping script and run it on another free service or your own machine:

```javascript
// ping-service.js
const fetch = require('node-fetch');
const ENDPOINT = 'https://your-render-app-name.onrender.com/api/health';

async function pingServer() {
  try {
    const response = await fetch(ENDPOINT);
    const data = await response.json();
    console.log(`Server pinged at ${new Date().toISOString()}, response: ${data.status}`);
  } catch (error) {
    console.error(`Error pinging server: ${error.message}`);
  }
}

// Ping every 10 minutes
setInterval(pingServer, 10 * 60 * 1000);

// Initial ping
pingServer();
```

This script could be run on:
- A free Replit instance
- A free Glitch project
- A free Render web service (yes, you can use a second free Render service to keep the first one alive!)

## Render Pro Tip

If you later decide to upgrade to Render's paid tier ($7/month), your service will never sleep and you won't need this ping solution.
