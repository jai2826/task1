import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Post from './src/models/Post.js';

dotenv.config();

const PASSWORD_PLAIN = 'test1234@';

const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
];

// 20 distinct users (12 with avatar images, 8 blank)
const USERS_SEED_DATA = [
  {
    username: 'sophia_codes',
    email: 'sophia.codes@example.com',
    avatarUrl: AVATAR_URLS[0],
    bio: 'Full-stack engineer building open source tools 💻☕',
  },
  {
    username: 'marcus_dev',
    email: 'marcus.dev@example.com',
    avatarUrl: '', // blank
    bio: 'TypeScript enthusiast, distributed systems nerd.',
  },
  {
    username: 'elena_design',
    email: 'elena.design@example.com',
    avatarUrl: AVATAR_URLS[1],
    bio: 'Product designer crafting clean UI/UX experiences ✨',
  },
  {
    username: 'alex_travels',
    email: 'alex.travels@example.com',
    avatarUrl: AVATAR_URLS[2],
    bio: 'Chasing horizons and capturing the world 🌍✈️',
  },
  {
    username: 'chloe_writes',
    email: 'chloe.writes@example.com',
    avatarUrl: '', // blank
    bio: 'Writer, tech essayist, avid fiction reader 📚',
  },
  {
    username: 'liam_pixel',
    email: 'liam.pixel@example.com',
    avatarUrl: AVATAR_URLS[3],
    bio: 'Game developer and 3D artist exploring WebGL 🎮',
  },
  {
    username: 'maya_sound',
    email: 'maya.sound@example.com',
    avatarUrl: AVATAR_URLS[4],
    bio: 'Sound designer & electronic music producer 🎧🎵',
  },
  {
    username: 'david_photo',
    email: 'david.photo@example.com',
    avatarUrl: '', // blank
    bio: 'Street and architectural photography 📷',
  },
  {
    username: 'zara_coffee',
    email: 'zara.coffee@example.com',
    avatarUrl: AVATAR_URLS[5],
    bio: 'Specialty coffee roaster and cafe explorer ☕',
  },
  {
    username: 'oliver_tech',
    email: 'oliver.tech@example.com',
    avatarUrl: '', // blank
    bio: 'Cloud architect, DevOps practitioner, Linux lover 🐧',
  },
  {
    username: 'nina_art',
    email: 'nina.art@example.com',
    avatarUrl: AVATAR_URLS[6],
    bio: 'Digital illustrator and concept artist 🎨',
  },
  {
    username: 'lucas_reads',
    email: 'lucas.reads@example.com',
    avatarUrl: '', // blank
    bio: 'Philosophy, economics, and late-night podcasts 📖',
  },
  {
    username: 'amara_wander',
    email: 'amara.wander@example.com',
    avatarUrl: AVATAR_URLS[7],
    bio: 'Mountain climber and outdoor adventurer 🏔️🌲',
  },
  {
    username: 'kai_minimal',
    email: 'kai.minimal@example.com',
    avatarUrl: AVATAR_URLS[8],
    bio: 'Minimalist workspace curator & mechanical keyboard fanatic ⌨️',
  },
  {
    username: 'hannah_chef',
    email: 'hannah.chef@example.com',
    avatarUrl: '', // blank
    bio: 'Pastry chef experimenting with artisanal sourdough 🥖',
  },
  {
    username: 'ryan_runner',
    email: 'ryan.runner@example.com',
    avatarUrl: '', // blank
    bio: 'Marathon runner training for Boston 2027 🏃‍♂️💨',
  },
  {
    username: 'zoe_creator',
    email: 'zoe.creator@example.com',
    avatarUrl: AVATAR_URLS[9],
    bio: 'Content creator documenting indie hacking and startup life 🚀',
  },
  {
    username: 'ethan_cloud',
    email: 'ethan.cloud@example.com',
    avatarUrl: AVATAR_URLS[10],
    bio: 'Backend engineer focused on scale and observability ☁️',
  },
  {
    username: 'isla_nature',
    email: 'isla.nature@example.com',
    avatarUrl: '', // blank
    bio: 'Botanist, gardener, lover of native flora 🌿🌸',
  },
  {
    username: 'leo_vibes',
    email: 'leo.vibes@example.com',
    avatarUrl: AVATAR_URLS[11],
    bio: 'DJ and vinyl collector spinning sunset sessions 🌅🎶',
  },
];

// Curated comments library
const SAMPLE_COMMENTS = [
  'Love this perspective! Thanks for sharing.',
  'Stunning shot! The lighting here is incredible.',
  'Couldn\'t agree more with this.',
  'Where was this taken? The view is unreal!',
  'Great work! Keep it up.',
  'Such clean aesthetics, bookmarking this.',
  'What camera/lens setup did you use for this?',
  'This inspired me to get back to building today.',
  'So true. Simplicity is underrated.',
  'Incredible vibe here! ✨',
  '100% agreed. It took me years to realize this too.',
  'Such an insightful post, thanks!',
  'Looks fantastic! Which framework did you end up using?',
  'That looks so peaceful! Hope you had a great time.',
  'Well said! Definitely sharing this with my team.',
  'Super clean setup! What keyboard is that?',
  'A masterpiece! Really love your style.',
  'Adding this to my bucket list immediately!',
  'Spot on! Excited to see where this goes next.',
  'Amazing shot! The colors are so vibrant.',
  'Couldn\'t have said it better myself.',
  'Such a great reminder for a Monday morning.',
  'Awesome progress! Congratulations 🎉',
  'This is the kind of content I open this app for.',
  'Looks delicious! Recipe when? 😋',
];

// Curated 50 posts content
const POSTS_RAW_DATA = [
  {
    userIndex: 0,
    text: 'Just deployed the new version of our open-source state management library! 🚀 After weeks of refactoring and benchmarking, memory overhead is down 40%. Check it out on GitHub!',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 14,
  },
  {
    userIndex: 1,
    text: 'Unpopular opinion: You probably do not need a microservices architecture until your engineering team has at least 50+ engineers. A modular monolith will save you months of debugging distributed race conditions.',
    imageUrl: '',
    daysAgo: 13.8,
  },
  {
    userIndex: 2,
    text: 'Early morning design sprint sketches. Exploring dark mode palette options with accessible WCAG AAA contrast ratios. Design is as much about ethics as aesthetics.',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 13.5,
  },
  {
    userIndex: 3,
    text: 'Lost in the bamboo groves of Arashiyama, Kyoto. The rustle of wind through the stalks is the purest sound in nature. 🎋🇯🇵',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 13.1,
  },
  {
    userIndex: 4,
    text: '"Write freely and without fear, edit ruthlessly and without mercy." A quote that sits permanently taped to my monitor.',
    imageUrl: '',
    daysAgo: 12.8,
  },
  {
    userIndex: 5,
    text: 'Prototyping procedural terrain generation in Three.js! Playing with Perlin noise algorithms and custom vertex shaders for volumetric fog. 🎮',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 12.4,
  },
  {
    userIndex: 6,
    text: 'Analog synth patching session today. There is something profoundly tactile about physical patch cables and turning real potentiometers. 🎛️',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 12.1,
  },
  {
    userIndex: 7,
    text: 'Geometric shadows cast by the brutalist architecture in downtown Chicago. 35mm film shot on Kodak Tri-X 400. 🖤',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 11.7,
  },
  {
    userIndex: 8,
    text: 'Dialing in an Ethiopian Yirgacheffe on the V60 this morning. Tasting notes of bergamot, peach blossom, and honey crisp apple. Pure liquid sunshine. ☕☀️',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 11.3,
  },
  {
    userIndex: 9,
    text: 'Reminder: Backups that have never been restored and tested are not backups. They are just hopeful wishes stored on S3.',
    imageUrl: '',
    daysAgo: 10.9,
  },
  {
    userIndex: 10,
    text: 'Finished this botanical illustration after 18 hours of digital ink work! Layering textures and organic foliage is my favorite meditative flow. 🌿🎨',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 10.5,
  },
  {
    userIndex: 11,
    text: 'Currently reading "Thinking, Fast and Slow" by Daniel Kahneman for the second time. Fascinating how cognitive heuristics influence technical product decisions.',
    imageUrl: '',
    daysAgo: 10.2,
  },
  {
    userIndex: 12,
    text: 'Summit sunrise at 12,000 feet! 4 AM alpine start was chilly, but witnessing the peaks ignite with golden alpenglow makes every step worth it. 🏔️✨',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 9.8,
  },
  {
    userIndex: 13,
    text: 'Desk setup iteration 2026. Cable management took 3 hours, but having zero visible wires provides unmatched peace of mind. Minimalist workspace, clear focus. 🖥️',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 9.4,
  },
  {
    userIndex: 14,
    text: 'Fresh sourdough boule straight out of the Dutch oven! 80% hydration, 24-hour cold retard. That open crumb and blistered crust is pure joy. 🥖🍞',
    imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 9.0,
  },
  {
    userIndex: 15,
    text: '20-mile long run completed in the crisp morning drizzle. Consistent pacing, negative splits on the last 5 miles. Training block is right on schedule! 🏃‍♂️💪',
    imageUrl: '',
    daysAgo: 8.6,
  },
  {
    userIndex: 16,
    text: 'Bootstrapping milestone: We just passed $10,000 MRR on our developer analytics SaaS! 3 years of late nights, countless iterations, and listening closely to our users. Never give up. 🚀',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 8.2,
  },
  {
    userIndex: 17,
    text: 'Migrated our core database cluster from single-region to multi-region active-passive replica with zero downtime. Comprehensive dry runs in staging are your best friend.',
    imageUrl: '',
    daysAgo: 7.9,
  },
  {
    userIndex: 18,
    text: 'My fiddle-leaf fig just sprouted two gigantic new leaves this week! Proof that proper indirect light and patient watering works wonders. 🌿🪴',
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 7.5,
  },
  {
    userIndex: 19,
    text: 'Dug up an original 1978 pressing of Japanese jazz fusion on vinyl. The dynamic range and warmth on this pressing is unbelievable. 🎷🎶',
    imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 7.1,
  },
  {
    userIndex: 0,
    text: 'Code reviews are not just about finding bugs; they are about sharing context, mentoring junior teammates, and collectively owning the quality of the codebase.',
    imageUrl: '',
    daysAgo: 6.8,
  },
  {
    userIndex: 1,
    text: 'Writing a custom Redis protocol parser in Go. The simplicity of the RESP specification makes it an absolute delight to implement. Fast, lightweight, zero bloat.',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 6.5,
  },
  {
    userIndex: 2,
    text: 'Design tokens are the single best investment our team made this year. Changing brand primary accents across 4 apps now takes 1 commit and 3 minutes.',
    imageUrl: '',
    daysAgo: 6.2,
  },
  {
    userIndex: 3,
    text: 'Wandering through the vibrant blue alleys of Chefchaouen, Morocco. Every corner looks like an impressionist painting. 🇲🇦💙',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 5.9,
  },
  {
    userIndex: 4,
    text: 'Finished a 4,000-word deep dive into the history of distributed consensus algorithms from Paxos to Raft. Link coming to the blog soon!',
    imageUrl: '',
    daysAgo: 5.6,
  },
  {
    userIndex: 5,
    text: 'Experimenting with procedural glass caustics using custom WebGPU compute shaders. The physics simulations run at 120 FPS! 💎✨',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 5.3,
  },
  {
    userIndex: 6,
    text: 'Field recording thunderstorms on the Pacific northwest coast. Catching low-frequency rumbles with hydrophones and binaural mics. 🌧️🌊',
    imageUrl: 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 5.0,
  },
  {
    userIndex: 7,
    text: 'Golden hour reflections along the glass facades of modern skyscrapers. Cities are living, breathing sculptures. 🏙️🌆',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 4.7,
  },
  {
    userIndex: 8,
    text: 'Pour over or Espresso? Drop your go-to morning brew method below! 👇 For me, flat white on weekends, Chemex on weekdays.',
    imageUrl: '',
    daysAgo: 4.4,
  },
  {
    userIndex: 9,
    text: 'Automated our entire staging environment teardown on weekends. Saved 28% on our monthly AWS cloud bill with just one scheduled Lambda function. 💡💸',
    imageUrl: '',
    daysAgo: 4.1,
  },
  {
    userIndex: 10,
    text: 'Sneak peek at the cover art for an upcoming indie sci-fi novella! Neon cityscapes, moody rain reflections, and retro-futuristic vibes. 🎨🚀',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 3.8,
  },
  {
    userIndex: 11,
    text: '"The impediment to action advances action. What stands in the way becomes the way." — Marcus Aurelius. Still the ultimate guide to overcoming creative blocks.',
    imageUrl: '',
    daysAgo: 3.5,
  },
  {
    userIndex: 12,
    text: 'Backpacking through the dramatic alpine passes of the Dolomites. Steep limestone spires towering above emerald valleys. 🏔️🇮🇹',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 3.2,
  },
  {
    userIndex: 13,
    text: 'Built my first custom mechanical keyboard: Lubricated Holy Panda switches, brass plate, and botanical keycaps. The acoustics are so satisfyingly thocky! ⌨️🎧',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 2.9,
  },
  {
    userIndex: 14,
    text: 'Raspberry pistacchio tartlets with crisp pâte sablée and silky white chocolate mousse. Baking is precision chemistry wrapped in art. 🍓🧁',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 2.6,
  },
  {
    userIndex: 15,
    text: 'Trail run through misty redwood forests. The smell of damp pine needles and giant ancient trees is the best stress relief imaginable. 🌲👟',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 2.3,
  },
  {
    userIndex: 16,
    text: 'Never underestimate the power of shipping small, incremental improvements every single day. Compound interest applies to software engineering too.',
    imageUrl: '',
    daysAgo: 2.0,
  },
  {
    userIndex: 17,
    text: 'Finally solved a memory leak in our WebSocket gateway! Turns out event listeners were retaining references to disconnected client contexts. Always clean up your listeners! 🔍',
    imageUrl: '',
    daysAgo: 1.8,
  },
  {
    userIndex: 18,
    text: 'Monstera Deliciosa propagating in water under soft morning light. Watching roots develop in clear glass jars is so satisfying. 🌿🌱',
    imageUrl: 'https://images.unsplash.com/photo-1509223197845-458d87318791?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 1.5,
  },
  {
    userIndex: 19,
    text: 'Weekend rooftop DJ session as the sun sets over the skyline. Deep house and melodic techno to recharge for the week ahead. 🌆🎶',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 1.3,
  },
  {
    userIndex: 0,
    text: 'A clean architecture is one that makes the cost of future changes as low as possible. Write code for the engineer who maintains it six months from now—it might be you.',
    imageUrl: '',
    daysAgo: 1.1,
  },
  {
    userIndex: 1,
    text: 'Just finished profiling our database queries. Added two compound indexes and average query latency dropped from 450ms down to 12ms! 🔥⚡',
    imageUrl: '',
    daysAgo: 0.9,
  },
  {
    userIndex: 2,
    text: 'Micro-interactions make all the difference. Added spring-physics animations to button presses and card transitions today. Feels butter smooth! ✨',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 0.8,
  },
  {
    userIndex: 3,
    text: 'Sunset overlooking the dramatic coastal cliffs of Big Sur, California. Pacific waves crashing below in misty spray. What a world. 🌊🌅',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 0.6,
  },
  {
    userIndex: 4,
    text: 'The hardest part of writing is not finding words; it is deciding which words to delete.',
    imageUrl: '',
    daysAgo: 0.5,
  },
  {
    userIndex: 6,
    text: 'Setting up dual monitor workflow for audio mastering. Frequency spectrum analyzer on the left, multi-track timeline on the right. 🎚️🎧',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 0.4,
  },
  {
    userIndex: 7,
    text: 'Rainy neon night in Shinjuku, Tokyo. Reflections puddling on the asphalt under vibrant signboards. ☔🏮',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 0.3,
  },
  {
    userIndex: 8,
    text: 'Tried a honey-processed Costa Rican roast this afternoon. Notes of candied orange peel and brown sugar. Perfect companion for afternoon coding. ☕🍊',
    imageUrl: '',
    daysAgo: 0.2,
  },
  {
    userIndex: 13,
    text: 'Night mode on the desk setup. Warm amber ambient backlighting reduces eye fatigue significantly during late night sessions. 🌙✨',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80',
    daysAgo: 0.1,
  },
  {
    userIndex: 16,
    text: 'Excited to announce we just kicked off beta testing for our new mobile app! So thankful to all our early community members for the invaluable feedback! 🎉🚀',
    imageUrl: '',
    daysAgo: 0.05,
  },
];

// Helper: Shuffle array randomly
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper: Random integer between min and max inclusive
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDatabase() {
  console.log('====================================================');
  console.log('  Mini Social Application - Seeding 20 Users & 50 Posts');
  console.log('====================================================\n');

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-social';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // 1. Hash password "test1234@"
    console.log(`\n1. Hashing universal password: "${PASSWORD_PLAIN}"...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD_PLAIN, salt);

    // Verify hash matches
    const testMatch = await bcrypt.compare(PASSWORD_PLAIN, hashedPassword);
    console.log(`✓ Password hash generated and verified: ${testMatch}`);

    // 2. Create or find 20 User Accounts
    console.log('\n2. Creating 20 user accounts...');
    const userDocs = [];

    for (let i = 0; i < USERS_SEED_DATA.length; i++) {
      const userData = USERS_SEED_DATA[i];
      let user = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });

      if (!user) {
        user = await User.create({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          avatarUrl: userData.avatarUrl || '',
          bio: userData.bio || '',
          createdAt: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        });
        console.log(`  + Created user [${i + 1}/20]: @${user.username} (Avatar: ${user.avatarUrl ? 'Yes' : 'Blank'})`);
      } else {
        // Ensure password matches test1234@ and avatar matches seed spec
        user.password = hashedPassword;
        user.avatarUrl = userData.avatarUrl || '';
        user.bio = userData.bio || user.bio || '';
        await user.save();
        console.log(`  ~ Updated existing user [${i + 1}/20]: @${user.username} (Avatar: ${user.avatarUrl ? 'Yes' : 'Blank'})`);
      }

      userDocs.push(user);
    }

    const withAvatarCount = userDocs.filter((u) => Boolean(u.avatarUrl)).length;
    const blankAvatarCount = userDocs.filter((u) => !u.avatarUrl).length;
    console.log(`\n✓ 20 Accounts ready: ${withAvatarCount} with avatar images, ${blankAvatarCount} with blank avatar.`);

    // 3. Create 50 Posts with randomized likes and comments
    console.log('\n3. Creating 50 posts with randomized likes and comments...');

    // Prepare 50 post documents
    const postsToInsert = [];
    const now = Date.now();

    for (let i = 0; i < POSTS_RAW_DATA.length; i++) {
      const rawPost = POSTS_RAW_DATA[i];
      const author = userDocs[rawPost.userIndex % userDocs.length];
      const postCreatedAt = new Date(now - rawPost.daysAgo * 24 * 60 * 60 * 1000);

      // Randomize likes: 3 to 16 likes per post from other users
      const likeCount = randomInt(3, Math.min(16, userDocs.length));
      const likers = shuffle(userDocs).slice(0, likeCount);
      const likes = likers.map((u) => ({
        userId: u._id,
        username: u.username,
      }));

      // Randomize comments: 1 to 6 comments per post
      const commentCount = randomInt(1, 6);
      const shuffledCommenters = shuffle(userDocs);
      const shuffledComments = shuffle(SAMPLE_COMMENTS);
      const comments = [];

      for (let c = 0; c < commentCount; c++) {
        const commenter = shuffledCommenters[c % shuffledCommenters.length];
        const commentText = shuffledComments[c % shuffledComments.length];
        // Comment created after the post but before now
        const minTime = postCreatedAt.getTime() + 60 * 1000;
        const maxTime = Math.min(now, postCreatedAt.getTime() + 48 * 60 * 60 * 1000);
        const commentTime = new Date(minTime + Math.random() * (maxTime - minTime));

        comments.push({
          userId: commenter._id,
          username: commenter.username,
          avatarUrl: commenter.avatarUrl || '',
          text: commentText,
          createdAt: commentTime,
        });
      }

      // Sort comments chronologically
      comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      postsToInsert.push({
        author: {
          userId: author._id,
          username: author.username,
          avatarUrl: author.avatarUrl || '',
        },
        text: rawPost.text,
        imageUrl: rawPost.imageUrl || '',
        likes,
        comments,
        createdAt: postCreatedAt,
      });
    }

    // Insert the 50 posts into MongoDB
    const createdPosts = await Post.insertMany(postsToInsert);
    console.log(`✓ Successfully created ${createdPosts.length} posts!`);

    // 4. Verification and Summary
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();

    console.log('\n====================================================');
    console.log('              SEEDING COMPLETED SUMMARY              ');
    console.log('====================================================');
    console.log(`Total Users in DB: ${totalUsers}`);
    console.log(`Total Posts in DB: ${totalPosts}`);
    console.log(`New Accounts Created: 20`);
    console.log(`New Posts Created: ${createdPosts.length}`);
    console.log(`Universal Password: "${PASSWORD_PLAIN}"`);
    console.log('Avatar Distribution:');
    console.log(`  - With Avatar Images: ${withAvatarCount} accounts`);
    console.log(`  - Blank Avatars: ${blankAvatarCount} accounts`);

    let totalLikes = 0;
    let totalComments = 0;
    createdPosts.forEach((p) => {
      totalLikes += p.likes.length;
      totalComments += p.comments.length;
    });
    console.log(`Randomized Interactions across newly created 50 posts:`);
    console.log(`  - Total Likes: ${totalLikes} (Average: ${(totalLikes / createdPosts.length).toFixed(1)} / post)`);
    console.log(`  - Total Comments: ${totalComments} (Average: ${(totalComments / createdPosts.length).toFixed(1)} / post)`);

    console.log('\nSample Accounts for Login:');
    userDocs.slice(0, 5).forEach((u) => {
      console.log(`  - Username: ${u.username.padEnd(16)} | Email: ${u.email.padEnd(26)} | Password: ${PASSWORD_PLAIN} | Avatar: ${u.avatarUrl ? 'Yes' : 'Blank'}`);
    });

    console.log('\n====================================================\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
