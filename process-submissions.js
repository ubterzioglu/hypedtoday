/**
 * Script to process pending project submissions for LinkedIn posting
 * This could be run as a scheduled job (cron) or triggered manually
 */

import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://default:GdAvYNGOKYSepS07npxNdUbIl170FDH7@redis-14217.crce202.eu-west-3-1.ec2.cloud.redislabs.com:14217'
});

async function processPendingSubmissions() {
  try {
    // Fetch all submission IDs from the sorted set
    const allSubmissionIds = await redisClient.zRange('submissions', 0, -1);
    
    // Filter for unposted submissions
    const unpostedSubmissions = [];
    
    for (const id of allSubmissionIds) {
      const submission = await redisClient.hGetAll(id);
      
      if (submission.postedToLinkedIn !== 'true') {
        unpostedSubmissions.push({...submission, id});
      }
    }

    console.log(`Found ${unpostedSubmissions.length} pending submissions`);

    for (const submission of submissions) {
      try {
        // Generate LinkedIn post content
        const postContent = generateLinkedinPost(
          submission.projectSlogan,
          submission.projectContent,
          submission.projectLink,
          submission.anonymous === 'true' ? 'A Community Member' : submission.linkedinLink
        );

        console.log(`Processing submission #${submission.id}:`);
        console.log(postContent);
        console.log('---');

        // In a real implementation, you would:
        // 1. Post to LinkedIn API using the user's access token
        // 2. Wait for a response
        // 3. Update the database record accordingly
        
        // Simulate LinkedIn API call (would be replaced with actual API call)
        await simulatePostToLinkedIn(submission.id, postContent);

        console.log(`Successfully processed submission ${submission.id}`);
      } catch (err) {
        console.error(`Error processing submission ${submission.id}:`, err.message);
      }
    }

    console.log('Finished processing pending submissions');
  } catch (err) {
    console.error('Error in processPendingSubmissions:', err);
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
`;

  return postText.trim();
}

async function simulatePostToLinkedIn(submissionId, postContent) {
  // Simulate API call to LinkedIn
  // In a real implementation, this would use the LinkedIn API
  // with the user's access token to post the content
  
  console.log(`Simulating LinkedIn post for submission ${submissionId}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update the submission record to mark it as posted
  await redisClient.hSet(submissionId, 'postedToLinkedIn', 'true');
  await redisClient.hSet(submissionId, 'postedAt', new Date().toISOString());
}

// Run the function if this script is executed directly
if (require.main === module) {
  processPendingSubmissions()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default processPendingSubmissions;