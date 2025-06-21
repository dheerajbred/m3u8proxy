# Netlify Deployment Guide

This project has been configured to work with Netlify's serverless functions.

## Deployment Steps

1. **Connect your repository to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the repository

2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `src`
   - Node version: 18 (automatically set in netlify.toml)

3. **Deploy:**
   - Netlify will automatically detect the configuration and deploy
   - The site will be available at your Netlify URL

## How it works

- The static HTML file is served from the `src` directory
- The `/m3u8-proxy` endpoint is handled by the serverless function in `netlify/functions/proxy.js`
- All other routes redirect to `index.html` for SPA behavior

## Environment Variables

No environment variables are required for basic functionality. The proxy function will work with any M3U8 URL.

## Troubleshooting

If you encounter issues:
1. Check the Netlify function logs in the Netlify dashboard
2. Ensure your M3U8 URL is accessible from the internet
3. Verify the URL format is correct 