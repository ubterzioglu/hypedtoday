/**
 * Migration script to move data from old system to Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gicrpczuonnxzmldfotl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpY3JwY3p1b25ueHptbGRmb3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NTMwOTEsImV4cCI6MjA4NzMyOTA5MX0.CuUU9dEvPI36c8P2TFBtgutMX4vBML0HN7ONW6Byu9Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample data based on existing structure
const sampleProjects = [
  {
    name: "Hyped.Today Dashboard",
    country: "TR",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    project_url: "https://hyped.today",
    motto: "Discover the next big thing",
    description: "A modern dashboard for discovering trending projects and startups.",
    linkedin_url: "https://linkedin.com/company/hyped",
    is_anonymous: false,
    contact_email: "hello@hyped.today"
  },
  {
    name: "AI Code Assistant",
    country: "OTHER",
    image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    project_url: "https://aicode.example.com",
    motto: "Code smarter, not harder",
    description: "An AI-powered code assistant that helps developers write better code faster.",
    linkedin_url: "https://linkedin.com/company/aicode",
    is_anonymous: false,
    contact_email: "info@aicode.example.com"
  },
  {
    name: "E-Commerce Platform",
    country: "TR",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    project_url: "https://shop.example.com",
    motto: "The future of online shopping",
    description: "Next-generation e-commerce platform with AI recommendations.",
    linkedin_url: null,
    is_anonymous: true,
    contact_email: "contact@shop.example.com"
  }
];

async function migrateData() {
  console.log("Starting data migration...");

  // Migrate projects
  console.log("Migrating projects...");
  for (const project of sampleProjects) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();

    if (error) {
      console.error(`Error inserting project "${project.name}":`, error);
    } else {
      console.log(`✓ Project "${project.name}" created with ID: ${data.id}`);
    }
  }

  // Add some sample votes
  console.log("\nAdding sample votes...");
  const { data: projects } = await supabase.from('projects').select('id').limit(3);

  if (projects) {
    for (const project of projects) {
      const vote = {
        project_id: project.id,
        ui_score: Math.floor(Math.random() * 5) + 6, // 6-10
        ux_score: Math.floor(Math.random() * 5) + 6,
        stability_score: Math.floor(Math.random() * 5) + 6,
        innovation_score: Math.floor(Math.random() * 5) + 6,
        doc_score: Math.floor(Math.random() * 5) + 6,
        user_ip: '127.0.0.1'
      };

      const { error } = await supabase.from('votes').insert([vote]);
      if (error) {
        console.error(`Error adding vote for project ${project.id}:`, error);
      } else {
        console.log(`✓ Vote added for project ${project.id}`);
      }
    }
  }

  // Add sample feedback
  console.log("\nAdding sample feedback...");
  const feedbacks = [
    "Great platform! Love the design.",
    "Could use more filtering options.",
    "Very useful for discovering new projects.",
    "The leaderboard feature is amazing!"
  ];

  for (const message of feedbacks) {
    const { error } = await supabase.from('feedback').insert([{ message }]);
    if (error) {
      console.error(`Error adding feedback:`, error);
    } else {
      console.log(`✓ Feedback added`);
    }
  }

  console.log("\n✅ Migration complete!");
}

// Run migration
migrateData().catch(console.error);
