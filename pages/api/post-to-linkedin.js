import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://default:GdAvYNGOKYSepS07npxNdUbIl170FDH7@redis-14217.crce202.eu-west-3-1.ec2.cloud.redislabs.com:14217'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to Redis
    await redisClient.connect();
    
    const { submissionId } = req.body;

    // Fetch the project submission from Redis
    const submission = await redisClient.hGetAll(submissionId);

    if (!submission || Object.keys(submission).length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // In a real implementation, you would:
    // 1. Generate the LinkedIn post content
    // 2. Use LinkedIn API to post
    // 3. Mark the submission as posted in the database
    
    // For now, we'll simulate this process
    const postContent = generateLinkedinPost(
      submission.project_slogan,
      submission.project_content,
      submission.project_link,
      submission.anonymous ? 'A Community Member' : submission.linkedin_link
    );

    // Simulate LinkedIn API call (this would be replaced with actual API call)
    console.log('Would post to LinkedIn:', postContent);
    
    // Update the submission record to mark it as posted
    await redisClient.hSet(submissionId, 'postedToLinkedIn', true);
    await redisClient.hSet(submissionId, 'postedAt', new Date().toISOString());

    res.status(200).json({ 
      success: true, 
      message: 'Successfully prepared LinkedIn post!', 
      preview: postContent 
    });
  } catch (err) {
    console.error('API route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Close Redis connection
    await redisClient.quit();
  }
}

function generateLinkedinPost(slogan, content, projectLink, author) {
  // Create an engaging LinkedIn post based on the submission
  const postText = `
🚀 ${slogan}

${content}

🔗 Check out the project: ${projectLink}

Thank you to ${author} for contributing to our developer community! 💙

#VibecodingCommunity #WebDevelopment #OpenSource #Innovation #Tech
`.trim();

  return postText;
}