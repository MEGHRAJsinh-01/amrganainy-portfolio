# EmailJS Setup for Contact Form

This document explains how to set up EmailJS to handle the contact form submissions in your portfolio.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS website](https://www.emailjs.com/) and sign up for a free account
2. Verify your account through the email you receive

## Step 2: Add an Email Service

1. Log in to your EmailJS dashboard
2. Go to "Email Services" and click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps and connect your email account
5. Name your service "default_service" or note down the service ID for your `.env` file

## Step 3: Create an Email Template

1. Go to "Email Templates" in your EmailJS dashboard
2. Click "Create New Template"
3. Name your template "template_portfolio" or note down the template ID for your `.env` file
4. Design your email template. Here's a suggested format:

```
Subject: New Contact Form Submission from {{from_name}}

Name: {{from_name}}
Email: {{reply_to}}
Subject: {{subject}}

Message:
{{message}}
```

5. Save your template

## Step 4: Get Your API Keys

1. Go to "Account" > "API Keys" in your EmailJS dashboard
2. Copy your public key and private key

## Step 5: Set Up Environment Variables

1. Create a `.env.local` file in the root directory of your project (if it doesn't exist already)
2. Add your EmailJS configuration:

```
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_EMAILJS_PRIVATE_KEY=your_emailjs_private_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
```

3. Replace the placeholder values with your actual keys and IDs

Note: The `.env.local` file is excluded from version control for security. For collaborators, an `.env.local.example` file is provided as a template.

## Testing

1. Fill out the contact form on your website
2. Submit the form
3. Check that you receive the email at your connected email account
4. Verify that you see the success message on the form

## Troubleshooting

- If emails aren't being sent, check your EmailJS dashboard for any errors
- Make sure your email service is properly connected
- Verify that your template contains the correct variables
- Check that your environment variables are correctly set in the `.env.local` file
- Ensure you've restarted your development server after changing environment variables

## Security Notes

- Never commit your `.env.local` file to version control
- The private key should only be used on the server-side (if needed)
- The public key is safe to use in client-side code
- Consider setting up rate limiting in your EmailJS initialization
