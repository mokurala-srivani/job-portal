require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const sampleJobs = (recruiterId) => [
  {
    title: 'Senior Backend Engineer',
    company: 'Acme Corp',
    location: 'Remote',
    salaryMin: 120000,
    salaryMax: 160000,
    type: 'remote',
    description: 'Build scalable Node.js services. Experience with MongoDB, Redis, and distributed systems required.',
    skills: ['Node.js', 'MongoDB', 'Redis', 'AWS'],
    postedBy: recruiterId,
  },
  {
    title: 'Frontend React Developer',
    company: 'Pixelworks',
    location: 'Bangalore, India',
    salaryMin: 800000,
    salaryMax: 1500000,
    type: 'full-time',
    description: 'Craft delightful UIs with React and Tailwind. Strong fundamentals in accessibility and performance.',
    skills: ['React', 'Tailwind', 'TypeScript'],
    postedBy: recruiterId,
  },
  {
    title: 'Full Stack Engineer (MERN)',
    company: 'Nimbus Labs',
    location: 'San Francisco, CA',
    salaryMin: 110000,
    salaryMax: 150000,
    type: 'full-time',
    description: 'End-to-end ownership of features across React, Node, Express, and MongoDB.',
    skills: ['React', 'Node.js', 'Express', 'MongoDB'],
    postedBy: recruiterId,
  },
  {
    title: 'DevOps Intern',
    company: 'Acme Corp',
    location: 'Remote',
    salaryMin: 30000,
    salaryMax: 45000,
    type: 'internship',
    description: 'Assist in building CI/CD pipelines, infra-as-code, and observability dashboards.',
    skills: ['Docker', 'Terraform', 'GitHub Actions'],
    postedBy: recruiterId,
  },
  {
    title: 'Contract iOS Developer',
    company: 'Wavelet',
    location: 'New York, NY',
    salaryMin: 90000,
    salaryMax: 130000,
    type: 'contract',
    description: 'Ship features in a Swift + SwiftUI codebase on a 6-month engagement.',
    skills: ['Swift', 'SwiftUI', 'iOS'],
    postedBy: recruiterId,
  },
  {
    title: 'Data Engineer (Part-time)',
    company: 'Insightly',
    location: 'Berlin, Germany',
    salaryMin: 50000,
    salaryMax: 70000,
    type: 'part-time',
    description: 'Build robust pipelines moving data from operational systems to a Snowflake warehouse.',
    skills: ['Python', 'SQL', 'Airflow', 'Snowflake'],
    postedBy: recruiterId,
  },
];

(async () => {
  await connectDB(process.env.MONGO_URI);
  await Promise.all([User.deleteMany({}), Job.deleteMany({}), Application.deleteMany({})]);

  const make = async (name, email, role) => {
    const u = new User({ name, email, role });
    await u.setPassword('password123');
    await u.save();
    return u;
  };

  const recruiter = await make('Rita Recruiter', 'recruiter@example.com', 'recruiter');
  const seeker = await make('Sam Seeker', 'seeker@example.com', 'job_seeker');
  await make('Ava Admin', 'admin@example.com', 'admin');

  await Job.insertMany(sampleJobs(recruiter._id));

  console.log('[seed] done. recruiter@example.com / seeker@example.com / admin@example.com (password123)');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
