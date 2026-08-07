export const initialData = {
  personal: {
    name: 'Ayesha Khan',
    title: 'Senior Product Designer',
    email: 'ayesha.khan@example.com',
    phone: '+1 (555) 014-2291',
    location: 'San Francisco, CA',
    website: 'ayesha.design',
  },
  summary:
    'Award-winning product designer with 8+ years of experience crafting intuitive digital experiences for SaaS and mobile products. Passionate about design systems, accessibility, and turning complex problems into simple, delightful interfaces. Proven track record of shipping products used by millions.',
  experience: [
    {
      id: 'exp-1',
      role: 'Senior Product Designer',
      company: 'Lumina Labs',
      location: 'San Francisco, CA',
      start: '2021',
      end: 'Present',
      current: true,
      description:
        'Lead design for the company\'s flagship analytics platform. Redesigned the onboarding flow, increasing activation by 34%. Built a scalable design system adopted across 6 product teams.',
    },
    {
      id: 'exp-2',
      role: 'Product Designer',
      company: 'Brightwave Studio',
      location: 'Remote',
      start: '2018',
      end: '2021',
      current: false,
      description:
        'Designed mobile-first experiences for fintech clients. Ran 40+ user interviews and usability tests, translating insights into 12 shipped features. Improved key flows, lifting retention by 22%.',
    },
    {
      id: 'exp-3',
      role: 'UI/UX Designer',
      company: 'Pixelforge',
      location: 'New York, NY',
      start: '2015',
      end: '2018',
      current: false,
      description:
        'Collaborated with engineers and PMs to deliver marketing sites and web apps. Created prototypes and high-fidelity mockups for a portfolio of 25+ client projects.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      school: 'California College of the Arts',
      degree: 'B.F.A.',
      field: 'Interaction Design',
      start: '2011',
      end: '2015',
      description: 'Graduated with honors. President of the Design Club.',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'Figma & Prototyping', level: 95 },
    { id: 'sk-2', name: 'Design Systems', level: 90 },
    { id: 'sk-3', name: 'User Research', level: 85 },
    { id: 'sk-4', name: 'Interaction Design', level: 88 },
    { id: 'sk-5', name: 'HTML / CSS', level: 75 },
    { id: 'sk-6', name: 'Accessibility', level: 80 },
  ],
  languages: [
    { id: 'lg-1', name: 'English' },
    { id: 'lg-2', name: 'Urdu' },
    { id: 'lg-3', name: 'French' },
  ],
};
