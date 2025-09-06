# Portfolio Deployment Checklist

## Step 1: Database Setup
- [x] Create MongoDB Atlas account
- [x] Set up MongoDB Atlas cluster
- [x] Create database user and password
- [x] Configure connection string in `.env.production`
- [ ] Whitelist all IPs (0.0.0.0/0) or the specific Render IP once deployed

## Step 2: Backend Deployment (Render)
- [ ] Create a Render account at https://render.com
- [ ] Connect your GitHub repository
- [ ] Create a new Web Service:
  - [ ] Select the repository
  - [ ] Set name: `amrganainy-portfolio-api` 
  - [ ] Set root directory: `server`
  - [ ] Set build command: `npm install`
  - [ ] Set start command: `node server.js`
  - [ ] Select environment: `Node`
  - [ ] Set environment variables:
    - [ ] `MONGO_URI`: your MongoDB Atlas connection string
    - [ ] `JWT_SECRET`: your production JWT secret
    - [ ] `FRONTEND_URL`: your domain or Netlify/Vercel URL
    - [ ] Any other environment variables needed by the backend
- [ ] Deploy the service
- [ ] Note the deployment URL (e.g., `https://amrganainy-portfolio-api.onrender.com`)

## Step 3: Update Frontend Configuration
- [ ] Update `.env.production` with the actual Render backend URL:
  ```
  VITE_API_URL=https://your-actual-render-url.onrender.com/api
  ```

## Step 4: Frontend Deployment (Netlify)
- [ ] Create a Netlify account at https://netlify.com
- [ ] Connect your GitHub repository
- [ ] Configure the build settings:
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
  - [ ] Add environment variables from your `.env.production` file (BUT NOT INCLUDING SERVER-SIDE VARIABLES):
    - [ ] All `VITE_*` variables
    - [ ] Do NOT include `MONGO_URI` or `JWT_SECRET` as these are server-side only
- [ ] Deploy the site
- [ ] Note the Netlify URL (e.g., `https://amrganainy-portfolio.netlify.app`)

## Step 5: Connect Your Custom Domain
- [ ] In your Netlify dashboard, go to "Domain Management"
- [ ] Click "Add Custom Domain" and enter your domain name
- [ ] Configure DNS settings:
  - [ ] Option 1: Use Netlify DNS (recommended)
    - [ ] Update nameservers at your domain registrar
  - [ ] Option 2: Keep your current DNS provider
    - [ ] Add CNAME record pointing to your Netlify site

## Step 6: Final Configuration
- [ ] Update Render environment variables:
  - [ ] Set `FRONTEND_URL` to your custom domain (e.g., `https://yourdomain.com`)
- [ ] Set up CORS in your backend code to allow your custom domain:
  ```javascript
  app.use(cors({
    origin: [
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ],
    credentials: true
  }));
  ```

## Step 7: Testing
- [ ] Test GitHub projects loading
- [ ] Test contact form functionality
- [ ] Test LinkedIn integration
- [ ] Test admin panel authentication
- [ ] Test multilanguage support

## Step 8: Performance Optimization
- [ ] Set up a ping service (e.g., UptimeRobot) to keep Render backend awake
- [ ] Add Netlify prerendering for SEO
- [ ] Set up proper cache control headers
- [ ] Consider implementing a service worker for offline support

## Step 9: Monitoring & Analytics
- [ ] Add Google Analytics or Plausible Analytics
- [ ] Set up monitoring for the backend API
- [ ] Monitor MongoDB Atlas usage to stay within free tier limits
