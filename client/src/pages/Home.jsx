import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Globe from 'react-globe.gl';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  Play, 
  MapPin, 
  Search, 
  Sparkles, 
  Layers, 
  Compass, 
  Award, 
  History, 
  BarChart3, 
  Download, 
  Users, 
  Megaphone, 
  Code2, 
  UserCheck, 
  Factory, 
  Rocket, 
  TrendingUp, 
  ChevronDown, 
  Check, 
  Building,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

// Interactive 3D Real Earth Globe (WebGL themed with Glowing Emerald/Green Elements)
const NiceRealGlobe = () => {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.clientWidth, 650);
        setDimensions({ width: width || 500, height: width || 500 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.enableZoom = false;
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 1.75 });
    }
  }, []);

  // Glowing green location beacons (leads)
  const pointsData = [
    { lat: 37.7749, lng: -122.4194, size: 0.35, color: '#34d399', name: 'SF Lead Hub' },
    { lat: 51.5074, lng: -0.1278, size: 0.3, color: '#10b981', name: 'London Hub' },
    { lat: 35.6762, lng: 139.6503, size: 0.4, color: '#34d399', name: 'Tokyo Office' },
    { lat: -33.8688, lng: 151.2093, size: 0.3, color: '#059669', name: 'Sydney Prospect' },
    { lat: 1.3521, lng: 103.8198, size: 0.35, color: '#10b981', name: 'Singapore Leads' },
    { lat: 19.0760, lng: 72.8777, size: 0.4, color: '#34d399', name: 'Mumbai Discovery' },
    { lat: -23.5505, lng: -46.6333, size: 0.3, color: '#059669', name: 'São Paulo Contacts' },
    { lat: 30.0444, lng: 31.2357, size: 0.25, color: '#10b981', name: 'Cairo Agency' },
  ];

  const arcsData = [
    { startLat: 37.7749, startLng: -122.4194, endLat: 51.5074, endLng: -0.1278, color: ['rgba(16, 185, 129, 0.3)', 'rgba(52, 211, 153, 0.8)'] },
    { startLat: 51.5074, startLng: -0.1278, endLat: 19.0760, endLng: 72.8777, color: ['rgba(52, 211, 153, 0.3)', 'rgba(16, 185, 129, 0.8)'] },
    { startLat: 19.0760, startLng: 72.8777, endLat: 35.6762, endLng: 139.6503, color: ['rgba(16, 185, 129, 0.3)', 'rgba(52, 211, 153, 0.8)'] },
    { startLat: 35.6762, startLng: 139.6503, endLat: -33.8688, endLng: 151.2093, color: ['rgba(52, 211, 153, 0.3)', 'rgba(5, 150, 105, 0.8)'] },
    { startLat: 37.7749, startLng: -122.4194, endLat: -23.5505, endLng: -46.6333, color: ['rgba(16, 185, 129, 0.3)', 'rgba(5, 150, 105, 0.8)'] },
    { startLat: 1.3521, startLng: 103.8198, endLat: 19.0760, endLng: 72.8777, color: ['rgba(52, 211, 153, 0.3)', 'rgba(16, 185, 129, 0.8)'] },
  ];

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative select-none">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        showGlobe={true}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        // Atmosphere glowing green
        showAtmosphere={true}
        atmosphereColor="#10b981"
        atmosphereAltitude={0.24}

        // Connection lines
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.45}
        arcDashGap={0.15}
        arcDashAnimateTime={2200}
        arcStroke={0.55}

        // Location beacons
        pointsData={pointsData}
        pointColor="color"
        pointRadius="size"
        pointAltitude={0.06}
        pointsMerge={false}

        // Location Labels
        labelsData={pointsData}
        labelLat="lat"
        labelLng="lng"
        labelText="name"
        labelSize={0.7}
        labelColor={() => '#34d399'}
        labelDotRadius={0.3}
        labelAltitude={0.07}
      />
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      num: '01',
      title: 'Search a Location',
      desc: 'Enter any query niche and target location boundary directly on the Prospector panel.',
      icon: MapPin,
      color: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30'
    },
    {
      num: '02',
      title: 'Discover Businesses',
      desc: 'GeoIntel crawls Google Places in real-time, fetching addresses, ratings, phones, and websites.',
      icon: Search,
      color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30'
    },
    {
      num: '03',
      title: 'Generate AI Insights',
      desc: 'Let Gemini review websites and summarize core offerings, pitch angles, and sales recommendations.',
      icon: Sparkles,
      color: 'from-fuchsia-500/20 to-pink-500/20 text-fuchsia-400 border-fuchsia-500/30'
    },
    {
      num: '04',
      title: 'Identify High-Quality Leads',
      desc: 'Evaluate scored opportunities and filter priority tiers (High, Medium, Low) for instant sales outreach.',
      icon: Layers,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    }
  ];

  const featuresList = [
    {
      title: 'Smart Lead Discovery',
      desc: 'Automatically discover business listings, verify contact items, and crawl details from any geographic location.',
      icon: Compass
    },
    {
      title: 'AI Business Insights',
      desc: 'Leverage Google Gemini LLM API to summarize business profiles and suggest tailored B2B elevator pitches.',
      icon: Sparkles
    },
    {
      title: 'Lead Scoring System',
      desc: 'Instantly score each listing based on digital presence indicators and categorize priority into High, Medium, or Low tiers.',
      icon: Award
    },
    {
      title: 'Search History',
      desc: 'A permanent query log allows sales agents to review past prospecting runs, check yields, and reload previous searches.',
      icon: History
    },
    {
      title: 'Dashboard Analytics',
      desc: 'Evaluate prospecting performance with high-level cards summarizing total leads discovered, average ratings, and duplicate ratios.',
      icon: BarChart3
    },
    {
      title: 'Export Leads',
      desc: 'Securely download compiled prospect spreadsheets in CSV or Excel format with one click for easy CRM integration.',
      icon: Download
    }
  ];

  const audiences = [
    {
      title: 'Sales Teams',
      desc: 'Scout commercial listings, compile direct contact lists, and target prospective outreach campaigns in minutes.',
      icon: Users
    },
    {
      title: 'Marketing Agencies',
      desc: 'Discover local brands, evaluate their digital assets (websites/ratings), and build tailored business pitch lists.',
      icon: Megaphone
    },
    {
      title: 'Software Companies',
      desc: 'Find offline businesses lacking robust websites or modern platforms, and offer custom software development.',
      icon: Code2
    },
    {
      title: 'Recruitment Agencies',
      desc: 'Identify growing businesses, check contact details, and locate regional target accounts that are scaling fast.',
      icon: UserCheck
    },
    {
      title: 'Manufacturers & Suppliers',
      desc: 'Map regional distributors, dealers, and industrial partners inside specific manufacturing zones.',
      icon: Factory
    },
    {
      title: 'Startups & Entrepreneurs',
      desc: 'Validate new geographical markets, research competitor density, and compile target customer lists instantly.',
      icon: Rocket
    }
  ];

  const useCases = [
    {
      title: 'Industrial Lead Generation',
      search: 'Manufacturing Companies in Ambad MIDC',
      outcome: '180+ companies found • 130+ valid contacts',
      desc: 'Scout specific manufacturing hubs and export high-priority industrial accounts directly to your CRM.',
      badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
    },
    {
      title: 'Hospitality Evaluation',
      search: 'Resorts in Goa',
      outcome: '90 hotels listed • 45 hot lead scores',
      desc: 'Target hospitality prospects, verify resort websites, and check opening hours to schedule direct sales pitches.',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Education Sector scouting',
      search: 'Colleges in Pune',
      outcome: '75 colleges identified • 55 contact phones',
      desc: 'Evaluate schools and colleges, identify contact parameters, and pitch educational software or recruitment services.',
      badgeColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20'
    },
    {
      title: 'Restaurant & F&B Mapping',
      search: 'Cafes in Brooklyn',
      outcome: '220+ cafes scraped • Avg rating 4.3/5.0',
      desc: 'Discover coffee shops and food businesses, evaluate their ratings, and pitch direct delivery or POS integration services.',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Healthcare Leads discovery',
      search: 'Hospitals in Nashik',
      outcome: '45 clinics evaluating • 100% verified',
      desc: 'Map clinics, dental centers, and hospitals. Track reviews and phone lines to offer medical supply partnerships.',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'Expansion Research',
      search: 'Real Estate agencies in Chicago',
      outcome: '120 agencies mapped • Density assessed',
      desc: 'Evaluate real estate brokers in new city boundaries to assess market competitiveness before launching regional offices.',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    }
  ];

  const benefits = [
    {
      title: '90% Time Saved',
      desc: 'Replace hours of tedious web browsing and copy-pasting contacts with immediate, automated database exports.',
      icon: Clock
    },
    {
      title: '3x Conversion Rates',
      desc: 'Evaluate scored leads to focus sales efforts exclusively on high-value business prospects with active phone lines.',
      icon: TrendingUp
    },
    {
      title: 'Instant AI Context',
      desc: 'Review clean, AI-summarized elevator pitches before picking up the phone, making every cold call feel like a warm introduction.',
      icon: Sparkles
    },
    {
      title: 'Centralized CRM Database',
      desc: 'Maintain all regional prospecting records in a single database, avoiding duplicate contacts and team overlap.',
      icon: Building
    },
    {
      title: '2.5x Productivity Boost',
      desc: 'Minimize prospecting friction so sales reps spend more hours making discovery pitches and less time building lists.',
      icon: Zap
    },
    {
      title: 'Data-Driven Direction',
      desc: 'Make smart, strategic decisions using clear ratings, review statistics, and lead tiers computed by verified algorithms.',
      icon: CheckCircle
    }
  ];

  const faqs = [
    {
      q: 'What is GeoIntel?',
      a: 'GeoIntel is a next-generation lead generation and location intelligence platform that helps businesses discover, evaluate, and export high-quality commercial leads. By combining real-time Google Places crawling, lead tier algorithms, and Gemini AI analysis, it delivers fully enriched target lists instantly.'
    },
    {
      q: 'How does lead discovery work?',
      a: 'Users enter a business niche (keyword) and a city (location) into the search dashboard. GeoIntel retrieves the corresponding business listings from the Google Maps API, filters out pre-existing duplicates under your account using fuzzy logic, assesses lead tier, and populates them on your dashboard.'
    },
    {
      q: 'How are AI summaries generated?',
      a: 'When you click "Generate AI Summary" on a lead, the platform uses Google\'s Gemini LLM. It parses the company\'s name, category, address, and website details to synthesize a brief B2B intelligence profile and pitch suggestion. If the API experiences rate limits, it falls back to a highly detailed local heuristic summary.'
    },
    {
      q: 'What types of businesses can be discovered?',
      a: 'Any commercial establishment that is indexed on Google Maps. This includes manufacturing factories, suppliers, clinics, schools, corporate offices, hotels, cafes, retail stores, and service companies.'
    },
    {
      q: 'Is there a free plan available?',
      a: 'Yes, you can register a free account to test the system. The free tier gives you full access to the Prospecting Dashboard, Search History logs, and CSV exports so you can evaluate the platform immediately.'
    },
    {
      q: 'How does the lead scoring system work?',
      a: 'Each business is graded up to 100 points based on digital markers: website availability (30 pts), phone listing (20 pts), physical address (15 pts), geotargeting coordinates (10 pts), Google ratings (15 pts), and review count (10 pts). Businesses are then prioritized into High (>=80), Medium (>=60), or Low (<60) priority tiers.'
    },
    {
      q: 'Can I export the lead data?',
      a: 'Yes. You can export any query list or entire lead database from the dashboard. GeoIntel compiles the data and triggers immediate downloads of formatted CSV files or Excel spreadsheets.'
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. All search history queries, lead lists, and AI summary logs are private to your user account and secured behind standard JWT authentication protocols.'
    }
  ];

  return (
    <div className="dark bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-violet-600/30 selection:text-violet-200">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-30 blur-[130px] bg-gradient-to-r from-violet-600/30 via-indigo-600/20 to-transparent -z-10" />

      {/* Hero Section */}
      <section className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 pb-20 md:pt-10 md:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-24 items-center overflow-hidden">
        {/* Left Info Column */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 space-y-8 text-center lg:text-left z-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-bold text-violet-400">
            <Zap className="w-3.5 h-3.5 fill-violet-400/20 animate-pulse" />
            <span>AI-Powered Location Prospecting</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find High-Quality Business Leads in{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              Minutes, Not Days
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Discover companies, analyze opportunities, generate AI-powered business insights, and identify the best prospects from any location.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button
              onClick={handleCTA}
              className="px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert('Demo video placeholder: GeoIntel evaluation dashboard features will open.')}
              className="px-6 py-3.5 text-sm font-semibold text-slate-300 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-200 cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-300/10" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-slate-900 text-left">
            <div>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white">500+</h4>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Companies Scraped</p>
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white">AI-Powered</h4>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Insights & Pitches</p>
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white">Intelligent</h4>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Lead Scoring</p>
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white">Real-Time</h4>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Business Discovery</p>
            </div>
          </div>
        </motion.div>

        {/* Right Globe Column */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-6 flex items-center justify-center relative w-full h-[400px] sm:h-[550px] lg:h-[600px]"
        >
          {/* Subtle glowing halo behind the globe */}
          <div className="absolute w-[80%] h-[80%] rounded-full bg-emerald-600/10 dark:bg-emerald-500/5 blur-[50px] pointer-events-none" />
          
          <NiceRealGlobe />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900/30 border-y border-slate-900 py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Simple Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How It Works</h2>
            <p className="text-sm text-slate-400">Discover leads, scoring opportunities, and extracting AI summaries in four simple steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 relative hover:border-slate-700/80 transition group"
                >
                  {/* Step Number Badge */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${step.color} border flex items-center justify-center mb-5 shrink-0`}>
                    <IconComp className="w-5 h-5 animate-pulse" />
                  </div>
                  
                  <span className="absolute top-6 right-6 text-3xl font-extrabold text-slate-800 dark:text-slate-800/30 tracking-tighter">
                    {step.num}
                  </span>

                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Enterprise Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Geo-Intelligence Capabilities</h2>
            <p className="text-sm text-slate-400">Robust lead mining toolset backed by Google Places search and LLM data enrichment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresList.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/60 p-8 rounded-2xl transition duration-300 group flex gap-5"
                >
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl w-fit h-fit shrink-0 group-hover:scale-105 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-violet-400 transition-colors">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="bg-slate-900/20 border-t border-slate-900 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Ideal Fits</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Who Uses GeoIntel?</h2>
            <p className="text-sm text-slate-400">Tailored data discovery for sales development, scaling, and market targeting.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {audiences.map((aud, idx) => {
              const IconComp = aud.icon;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-6 hover:shadow-lg hover:shadow-violet-500/5 hover:border-slate-700/80 transition duration-300"
                >
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-fit h-fit mb-5">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{aud.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{aud.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Application Areas</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Scouting Use Cases</h2>
            <p className="text-sm text-slate-400">Practical search targets showing real-world outputs from the intelligence dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((uc, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-800 transition duration-300"
              >
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">{uc.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
                  </div>
                </div>

                {/* Dashboard snippet visualization */}
                <div className="bg-slate-950/80 border-t border-slate-900 p-4 font-mono text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>QUERY IN PROGRESS:</span>
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 font-semibold uppercase tracking-wider">Scraped</span>
                  </div>
                  <div className="text-slate-300 font-semibold truncate">
                    &gt; {uc.search}
                  </div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{uc.outcome}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-slate-900/30 border-y border-slate-900 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Business Value</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Key Platform Benefits</h2>
            <p className="text-sm text-slate-400">Maximize sales results and build high-level location databases.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((ben, idx) => {
              const IconComp = ben.icon;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 hover:bg-slate-900 hover:border-slate-700 transition flex gap-5 duration-350"
                >
                  <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 rounded-xl w-fit h-fit shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">{ben.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{ben.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Clarifications</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400">Everything you need to know about the GeoIntel prospecting tool.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-sm sm:text-base text-white outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-400' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-900 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative w-full max-w-5xl mx-auto px-4 pb-28">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-tr from-violet-900/30 via-indigo-950/20 to-transparent border border-violet-500/20 rounded-3xl p-8 sm:p-16 text-center space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Ready to Discover Your Next Customer?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Start finding high-quality leads with AI-powered business intelligence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={handleCTA}
              className="px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert('Demo video placeholder: GeoIntel evaluation dashboard features will open.')}
              className="px-6 py-3.5 text-sm font-semibold text-slate-300 bg-slate-950/45 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-200 cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-300/10" />
              <span>Watch Demo</span>
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
