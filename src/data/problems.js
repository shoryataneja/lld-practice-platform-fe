export const problems = [
  {
    slug: 'parking-lot',
    title: 'Parking Lot',
    difficulty: 'EASY',
    summary:
      'Model a multi-level parking lot with spot types, entry/exit flows and parking rates.',
  },
  {
    slug: 'vending-machine',
    title: 'Vending Machine',
    difficulty: 'MEDIUM',
    summary: 'Design a vending machine that handles inventory, payments and dispensing.',
  },
  {
    slug: 'elevator',
    title: 'Elevator',
    difficulty: 'MEDIUM',
    summary: 'Design an elevator control system coordinating requests across floors.',
  },
  {
    slug: 'library-management',
    title: 'Library Management',
    difficulty: 'MEDIUM',
    summary: 'Model books, members and borrowing workflows for a public library.',
  },
  {
    slug: 'movie-ticket-booking',
    title: 'Movie Ticket Booking',
    difficulty: 'HARD',
    summary: 'Design booking, seating selection and show management for a multiplex.',
  },
]

export const getProblemBySlug = (slug) =>
  problems.find((problem) => problem.slug === slug)