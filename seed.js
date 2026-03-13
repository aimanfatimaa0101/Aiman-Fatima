require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');

const samplePosts = [
  {
    title: "The Future of Artificial Intelligence in 2024",
    description: "Exploring how AI is reshaping industries, from healthcare to finance, and what we can expect in the coming years.",
    content: `<h2>Introduction</h2><p>Artificial Intelligence has come a long way from its theoretical roots. Today, it's embedded in everything from the apps on our phones to the complex systems running our hospitals and financial markets.</p><h2>Key Trends</h2><p>Large Language Models (LLMs) like GPT-4 and Claude have democratized access to powerful AI capabilities. Businesses of all sizes now leverage these tools for content creation, customer service, and data analysis.</p><h2>Healthcare Revolution</h2><p>In healthcare, AI diagnostic tools are achieving accuracy rates that rival experienced physicians. Early detection of cancers, prediction of patient deterioration, and drug discovery are being accelerated dramatically.</p><h2>The Road Ahead</h2><p>As we look to the future, the integration of AI into our daily lives will only deepen. The key challenge will be ensuring this technology remains aligned with human values and benefits society broadly.</p>`,
    author: "Dr. Sarah Chen",
    category: "Technology",
    tags: ["AI", "Machine Learning", "Future Tech", "Innovation"],
    featuredImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    likes: 142,
    views: 3420
  },
  {
    title: "Hidden Gems of Southeast Asia: A Traveler's Guide",
    description: "Beyond the tourist trails lie breathtaking destinations that offer authentic experiences and stunning natural beauty.",
    content: `<h2>Off the Beaten Path</h2><p>Southeast Asia is renowned for its famous destinations — Bali, Bangkok, Singapore. But tucked between these well-worn tourist routes lie extraordinary places that few travelers discover.</p><h2>Kampot, Cambodia</h2><p>This sleepy riverside town has retained a colonial charm that Phnom Penh lost decades ago. The nearby Bokor National Park offers misty mountain treks through abandoned French hill stations.</p><h2>Mrauk U, Myanmar</h2><p>Often called the "mini-Bagan," Mrauk U is an ancient city of remarkable temples spread across rolling hills. Unlike Bagan, you might have entire temple complexes to yourself.</p><h2>Practical Tips</h2><p>The best time to visit most of Southeast Asia is November through February. Always carry cash in smaller denominations, learn a few phrases in the local language, and be prepared to venture beyond your comfort zone.</p>`,
    author: "Marco Valdez",
    category: "Travel",
    tags: ["Southeast Asia", "Travel", "Adventure", "Budget Travel"],
    featuredImage: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
    likes: 89,
    views: 2156
  },
  {
    title: "Mastering the Art of Sourdough: A Complete Guide",
    description: "From creating your starter to baking the perfect loaf, everything you need to know about sourdough bread making.",
    content: `<h2>Why Sourdough?</h2><p>Sourdough is more than bread — it's a connection to our oldest food traditions. The wild yeast fermentation creates complex flavors that commercial bread simply cannot replicate.</p><h2>Creating Your Starter</h2><p>Mix equal parts flour and water (by weight) in a clean jar. Each day, discard half and feed with fresh flour and water. Within 5-7 days, your starter should be bubbly and ready to use.</p><h2>The Perfect Dough</h2><p>Combine 450g bread flour, 325g water, 100g active starter, and 9g salt. Autolyse, then fold and stretch every 30 minutes for 2-3 hours. Cold ferment overnight for better flavor development.</p><h2>Baking Day</h2><p>Preheat your Dutch oven at 500°F. Score the loaf with a sharp blade, then bake covered for 20 minutes and uncovered for 25 more. The deep golden crust and open crumb structure are your reward.</p>`,
    author: "Emma Fitzgerald",
    category: "Food",
    tags: ["Baking", "Sourdough", "Recipe", "Bread"],
    featuredImage: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&q=80",
    likes: 215,
    views: 5670
  },
  {
    title: "Minimalist Living: How Less Became More",
    description: "A personal journey into minimalism and the surprising ways reducing possessions transformed my mental health and relationships.",
    content: `<h2>The Breaking Point</h2><p>Three years ago, I stood in my storage unit — paying $200 a month to store things I hadn't touched in years — and had an epiphany. I was working to maintain my stuff, not myself.</p><h2>The Philosophy</h2><p>Minimalism isn't about deprivation. It's about intentionality. Each possession should earn its place in your life by bringing value, function, or genuine joy.</p><h2>Starting the Journey</h2><p>Begin with one room. The KonMari method works, but so does the simpler question: "Would I buy this today?" If not, it goes. The momentum of clearing space is surprisingly addictive.</p><h2>Unexpected Benefits</h2><p>Clearer mind. Lower anxiety. More time. Stronger relationships. When you stop managing things, you start experiencing life. That storage unit money now funds annual vacations.</p>`,
    author: "James Thornton",
    category: "Lifestyle",
    tags: ["Minimalism", "Mental Health", "Declutter", "Lifestyle"],
    featuredImage: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80",
    likes: 178,
    views: 4230
  },
  {
    title: "Building a Startup in 90 Days: Lessons from the Trenches",
    description: "Real lessons from launching a SaaS product in 90 days — what worked, what failed, and what I'd do differently.",
    content: `<h2>The Idea</h2><p>We had a problem we experienced firsthand: freelancers spending too much time on invoicing. Our solution was simple — automated invoicing triggered by calendar events. Classic scratch-your-own-itch startup.</p><h2>Days 1-30: Validation</h2><p>We didn't write a line of code for the first month. Instead, we interviewed 50 freelancers. 80% confirmed the pain. We built a landing page, ran Facebook ads, and collected 200 email signups before writing any code.</p><h2>Days 31-60: Building</h2><p>Two engineers, 60-hour weeks, lots of coffee. We used Next.js, Stripe, and Supabase. MVP was embarrassingly basic but functional. Beta users gave us brutally honest feedback.</p><h2>Days 61-90: Launch</h2><p>Product Hunt launch, Twitter announcement, LinkedIn posts. Day one: 340 signups, 23 paid conversions. Not a rocket ship, but proof of concept. We've been growing 15% month-over-month since.</p>`,
    author: "Priya Patel",
    category: "Business",
    tags: ["Startup", "SaaS", "Entrepreneurship", "Business"],
    featuredImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    likes: 312,
    views: 8940
  },
  {
    title: "The Science of Sleep: Why 8 Hours Isn't Enough",
    description: "New research reveals it's not just quantity but quality and timing of sleep that determines your cognitive performance.",
    content: `<h2>The Sleep Revolution</h2><p>We've known sleep matters, but recent neuroscience has revealed the extraordinary complexity of what happens when we close our eyes. Sleep is active, complex, and crucial in ways we're only beginning to understand.</p><h2>Sleep Architecture</h2><p>A healthy night's sleep consists of 4-6 cycles, each containing light sleep, deep sleep, and REM stages. Each stage serves specific functions — from memory consolidation to cellular repair.</p><h2>The Glymphatic System</h2><p>During deep sleep, your brain shrinks by 60%, allowing cerebrospinal fluid to flush out metabolic waste including beta-amyloid, the protein linked to Alzheimer's disease. Sleep is literally brain cleaning.</p><h2>Optimizing Your Sleep</h2><p>Maintain consistent sleep/wake times. Keep bedroom temperature at 65-68°F. Block all light. Limit alcohol, which fragments sleep architecture. Morning sunlight exposure sets your circadian clock.</p>`,
    author: "Dr. Michael Torres",
    category: "Health",
    tags: ["Sleep", "Health", "Neuroscience", "Wellness"],
    featuredImage: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80",
    likes: 267,
    views: 6780
  }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogdb')
  .then(async () => {
    console.log('Connected to MongoDB');
    await Post.deleteMany({});
    const posts = await Post.insertMany(samplePosts);
    console.log(`✅ Seeded ${posts.length} posts successfully`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
