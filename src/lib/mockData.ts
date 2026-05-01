// Mock data for development and offline testing
// Used as fallback when backend is unavailable

export const mockUser = {
  id: 'mock-admin-001',
  name: 'Zah (Dev)',
  email: 'admin@dsuc.fun',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dsucadmin',
  role: 'President' as const,
  memberType: 'member' as const,
  skills: ['Solana', 'Rust', 'React', 'TypeScript', 'Anchor'],
  github: 'https://github.com/DSUC-Project',
  twitter: 'https://twitter.com',
  walletAddress: 'DSUCabcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
};

export const mockMembers = [
  {
    id: '1', name: 'Nguyễn Văn An', role: 'Vice-President', memberType: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=an',
    skills: ['Rust', 'Anchor', 'Solana'],
    github: 'https://github.com', twitter: 'https://twitter.com',
    bio: 'Solana developer & co-founder of DSUC.',
  },
  {
    id: '2', name: 'Trần Thị Bình', role: 'Core Member', memberType: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=binh',
    skills: ['React', 'TypeScript', 'Web3.js'],
    github: 'https://github.com', twitter: '',
    bio: 'Frontend builder, DeFi enthusiast.',
  },
  {
    id: '3', name: 'Lê Minh Cường', role: 'Member', memberType: 'community',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cuong',
    skills: ['JavaScript', 'Solana'],
    github: 'https://github.com', twitter: '',
    bio: 'Learning Solana development.',
  },
  {
    id: '4', name: 'Phạm Thị Duyên', role: 'Member', memberType: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duyen',
    skills: ['DeFi', 'Anchor', 'Python'],
    github: 'https://github.com', twitter: 'https://twitter.com',
    bio: 'DeFi researcher and smart contract developer.',
  },
  {
    id: '5', name: 'Hoàng Văn Em', role: 'Intern', memberType: 'community',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=em',
    skills: ['NFT', 'React'],
    github: 'https://github.com', twitter: '',
    bio: 'NFT and creative technology intern.',
  },
  {
    id: '6', name: 'Võ Thị Phương', role: 'Member', memberType: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phuong',
    skills: ['Rust', 'Security', 'Anchor'],
    github: 'https://github.com', twitter: 'https://twitter.com',
    bio: 'Smart contract security researcher.',
  },
];

export const mockEvents = [
  {
    id: 'ev1',
    title: 'Solana Hackathon Prep Workshop',
    date: '2026-05-15',
    description: 'Hands-on workshop preparing teams for the Colosseum Frontier Hackathon. Covers Anchor setup, program deployment, and team coordination.',
    type: 'Workshop',
    location: 'ĐH Đà Nẵng — Phòng B204',
    lumaLink: 'https://lu.ma',
    status: 'upcoming',
  },
  {
    id: 'ev2',
    title: 'DSUC Monthly Meetup — May 2026',
    date: '2026-05-22',
    description: 'Monthly gathering for all DSUC members. Share project updates, celebrate wins, discuss next steps.',
    type: 'Meetup',
    location: 'Online — Discord',
    lumaLink: 'https://lu.ma',
    status: 'upcoming',
  },
  {
    id: 'ev3',
    title: 'Anchor Framework Deep Dive',
    date: '2026-04-10',
    description: 'Advanced session covering Anchor macros, PDA patterns, CPI, and program security.',
    type: 'Workshop',
    location: 'ĐH Đà Nẵng',
    lumaLink: 'https://lu.ma',
    status: 'past',
  },
];

export const mockProjects = [
  {
    id: 'p1',
    name: 'VORA Voice AI',
    category: 'Tool',
    description: 'Voice-first AI agent desktop app built with Tauri + React + Agora Web SDK. Targets non-technical users.',
    github: 'https://github.com/DSUC-Project',
    demo: '',
    status: 'active',
    techStack: ['Tauri', 'React', 'TypeScript', 'Rust', 'Agora'],
    members: ['1', '2'],
  },
  {
    id: 'p2',
    name: 'Gimme Idea',
    category: 'Web3',
    description: 'Startup idea feedback platform with Solana tipping and MetaDAO futarchy integration.',
    github: 'https://github.com/DSUC-Project',
    demo: 'https://gimmeidea.com',
    status: 'active',
    techStack: ['React', 'Next.js', 'Solana', 'Anchor'],
    members: ['1'],
  },
  {
    id: 'p3',
    name: 'Atrax World',
    category: 'NFT',
    description: 'Streaming crypto game built for the Colosseum hackathon. NFT-based character system.',
    github: 'https://github.com/DSUC-Project',
    demo: '',
    status: 'archived',
    techStack: ['Rust', 'Anchor', 'React', 'Phaser'],
    members: ['1', '3'],
  },
  {
    id: 'p4',
    name: 'DSUC Labs Platform',
    category: 'Tool',
    description: 'The operating system for DSUC — member management, academy, events, and finance in one platform.',
    github: 'https://github.com/DSUC-Project/DSUC-Labs',
    demo: 'https://dsuc.fun',
    status: 'active',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    members: ['1', '2', '4'],
  },
];

export const mockResources = [
  { id: 'r1', title: 'Anchor Book', type: 'Doc', url: 'https://book.anchor-lang.com', tags: ['Anchor', 'Rust'], description: 'Official Anchor framework documentation.' },
  { id: 'r2', title: 'Solana Cookbook', type: 'Doc', url: 'https://solanacookbook.com', tags: ['Solana'], description: 'Practical Solana development reference.' },
  { id: 'r3', title: 'Metaplex Docs', type: 'Doc', url: 'https://docs.metaplex.com', tags: ['NFT', 'Solana'], description: 'NFT standard and tooling docs.' },
  { id: 'r4', title: 'DSUC GitHub', type: 'Repo', url: 'https://github.com/DSUC-Project', tags: ['Open Source'], description: 'All DSUC open source projects.' },
  { id: 'r5', title: 'Solana Developers', type: 'Doc', url: 'https://solana.com/developers', tags: ['Solana'], description: 'Official Solana developer portal.' },
  { id: 'r6', title: 'Superteam Earn', type: 'Tool', url: 'https://earn.superteam.fun', tags: ['Bounties', 'Solana'], description: 'Bounties and grants for Solana ecosystem.' },
];

export const mockBounties = [
  {
    id: 'b1', title: 'Build a token swap UI component',
    reward: '0.5 SOL', difficulty: 'Medium',
    skills: ['React', 'Web3.js'], github: 'https://github.com/DSUC-Project', status: 'open',
    description: 'Build a reusable React component for token swapping using Jupiter aggregator.',
  },
  {
    id: 'b2', title: 'Write Anchor tests for lending protocol',
    reward: '1 SOL', difficulty: 'Hard',
    skills: ['Rust', 'Anchor'], github: 'https://github.com/DSUC-Project', status: 'open',
    description: 'Comprehensive test suite covering happy paths and edge cases.',
  },
  {
    id: 'b3', title: 'Design DSUC merch collection',
    reward: '0.2 SOL', difficulty: 'Easy',
    skills: ['Design', 'Figma'], github: '', status: 'open',
    description: 'Create t-shirt and sticker designs for DSUC community.',
  },
];

export const mockFinance = [
  { id: 'f1', type: 'Thu' as const, description: 'Phí thành viên Q1 2026', amount: 5000000, status: 'approved' as const, createdBy: 'Nguyễn Văn An', date: '2026-03-01' },
  { id: 'f2', type: 'Chi' as const, description: 'Thuê phòng workshop tháng 4', amount: 2000000, status: 'approved' as const, createdBy: 'Zah (Dev)', date: '2026-04-10' },
  { id: 'f3', type: 'Chi' as const, description: 'In ấn banner sự kiện tháng 5', amount: 500000, status: 'pending' as const, createdBy: 'Trần Thị Bình', date: '2026-04-28' },
  { id: 'f4', type: 'Thu' as const, description: 'Tài trợ Superteam Q2', amount: 10000000, status: 'approved' as const, createdBy: 'Nguyễn Văn An', date: '2026-04-01' },
];

export const mockLeaderboard = [
  { rank: 1, name: 'Nguyễn Văn An', xp: 1250, lessons: 28, streak: 14, badge: '🏆', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=an' },
  { rank: 2, name: 'Trần Thị Bình', xp: 980, lessons: 21, streak: 8, badge: '🥈', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=binh' },
  { rank: 3, name: 'Zah (Dev)', xp: 750, lessons: 16, streak: 5, badge: '🥉', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dsucadmin' },
  { rank: 4, name: 'Phạm Thị Duyên', xp: 430, lessons: 9, streak: 3, badge: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duyen' },
  { rank: 5, name: 'Lê Minh Cường', xp: 200, lessons: 4, streak: 1, badge: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cuong' },
];

export const mockAcademyStats = {
  xp_total: 750,
  streak_current: 5,
  streak_longest: 12,
  lessons_completed: 16,
  active_days: [
    '2026-04-27', '2026-04-28', '2026-04-29',
    '2026-04-30', '2026-05-01',
  ],
};
