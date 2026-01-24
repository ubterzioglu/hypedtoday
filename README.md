# Vibecoding Community Project Submission

This project allows community members to submit their projects for sharing on LinkedIn.

## Features

- Beautiful animated background with gradient blobs
- Responsive design for all devices
- Simple project submission form
- Anonymous submission option
- Data stored in Supabase database
- Integration ready for LinkedIn posting

## Prerequisites

- Node.js (v14 or higher)
- A Supabase account (free tier available)

## Setup Instructions

### 1. Clone or download this repository

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Create a table called `project_submissions` with these columns:
   - `id` - Auto-incrementing integer (Primary Key)
   - `project_link` - Text (not null)
   - `linkedin_link` - Text (not null)
   - `anonymous` - Boolean (default: false)
   - `project_slogan` - Text (not null)
   - `project_content` - Text (not null)
   - `posted_to_linkedin` - Boolean (default: false)
   - `posted_at` - Timestamp (optional)
   - `created_at` - Timestamp (default: now())

### 4. Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

To get these values:
1. Go to your Supabase dashboard
2. Project URL is in Settings > General
3. Service Role Key is in Settings > API

### 5. Run the development server

```bash
npm run dev
```

Your app will be available at http://localhost:3000

## LinkedIn Integration

The project includes an API endpoint (`/api/post-to-linkedin`) that can be used to automatically post to LinkedIn when a project is approved. This endpoint:

1. Fetches the project submission from the database
2. Generates a formatted LinkedIn post
3. Would integrate with LinkedIn's API to post the content
4. Updates the submission to mark it as posted

For actual LinkedIn posting, you'd need to:
1. Register your app with LinkedIn Developer Platform
2. Implement OAuth flow to get user access tokens
3. Replace the simulation in `/api/post-to-linkedin.js` with actual LinkedIn API calls

## Deployment

This project is ready to be deployed on Vercel:

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and create an account
3. Import your project from GitHub
4. Add the environment variables in the deployment settings
5. Deploy!

## How It Works

1. Users click "Add Your Project!" button
2. A form appears to collect:
   - Project link
   - LinkedIn profile link
   - Anonymous preference
   - Project slogan
   - Project description
3. Form data is submitted to the API endpoint
4. Data is stored in Supabase database
5. An admin can later approve and post submissions to LinkedIn

## Future Enhancements

- Automated LinkedIn posting
- Admin panel to review submissions
- User authentication
- Project categorization
- Image uploads for projects
- Email notifications for submission status

## License

MIT