import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://default:GdAvYNGOKYSepS07npxNdUbIl170FDH7@redis-14217.crce202.eu-west-3-1.ec2.cloud.redislabs.com:14217'
});

// Connect to Redis
await redisClient.connect();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectLink, linkedinLink, anonymous, projectSlogan, projectContent } = req.body;

    // Validate required fields
    if (!projectLink || !linkedinLink || !projectSlogan || !projectContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a unique ID for this submission
    const submissionId = `submission:${Date.now()}`;

    // Prepare the submission object
    const submission = {
      id: submissionId,
      projectLink,
      linkedinLink,
      anonymous: anonymous || false,
      projectSlogan,
      projectContent,
      createdAt: new Date().toISOString(),
      postedToLinkedIn: false
    };

    // Store the submission in Redis
    await redisClient.hSet(submissionId, submission);
    
    // Also add to a sorted set with timestamp for ordering
    await redisClient.zAdd('submissions', { score: Date.now(), value: submissionId });

    // Return success response
    res.status(200).json({ 
      success: true, 
      message: 'Project submitted successfully!',
      id: submissionId 
    });
  } catch (err) {
    console.error('API route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Close Redis connection
    await redisClient.quit();
  }
}