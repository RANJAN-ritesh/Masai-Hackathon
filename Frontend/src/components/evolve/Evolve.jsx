import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Code2,
  Brain,
  Network,
  Cpu,
  Database,
  LineChart,
  Ship,
  Users,
  Rocket,
  Trophy,
  BookOpen,
  Github,
  Twitter,
  Linkedin,
  Code,
  ChevronRight,
  Layers,
  Globe,
  Calendar,
  Award,
  TrendingUp,
  MessageCircle,
  Clock,
  BarChart3,
  Bell,
  Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";
import EvolveNavbar from "./EvolveNavbar";

const Evolve = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // const wings = [
  //   {
  //     icon: Code2,
  //     title: "CodeForge",
  //     desc: "Master modern software development through hands-on projects and industry-standard practices.",
  //     gradient: "bg-gradient-to-br from-[#FF416C]/90 to-[#FF4B2B]/90",
  //     softBg: "bg-[#FF416C]/5",
  //     features: ["Full-stack Development", "Cloud Architecture", "DevOps"],
  //     stats: { projects: "250+", students: "1.2K+", rating: "4.8" },
  //   },
  //   {
  //     icon: Brain,
  //     title: "AlgoNest",
  //     desc: "Excel in data structures, algorithms, and competitive programming with expert guidance.",
  //     gradient: "bg-gradient-to-br from-[#7F00FF]/90 to-[#E100FF]/90",
  //     softBg: "bg-[#7F00FF]/5",
  //     features: ["Advanced DSA", "System Design", "Problem Solving"],
  //     stats: { projects: "180+", students: "950+", rating: "4.9" },
  //   },
  //   {
  //     icon: Network,
  //     title: "FutureMind",
  //     desc: "Build cutting-edge AI solutions and explore the frontiers of machine learning.",
  //     gradient: "bg-gradient-to-br from-[#11998e]/90 to-[#38ef7d]/90",
  //     softBg: "bg-[#11998e]/5",
  //     features: ["Machine Learning", "Neural Networks", "AI Applications"],
  //     stats: { projects: "200+", students: "800+", rating: "4.7" },
  //   },
  //   {
  //     icon: Database,
  //     title: "InfoSphere",
  //     desc: "Transform raw data into actionable insights through advanced analytics and visualization.",
  //     gradient: "bg-gradient-to-br from-[#4E65FF]/90 to-[#92EFFD]/90",
  //     softBg: "bg-[#4E65FF]/5",
  //     features: ["Data Analytics", "Big Data", "Visualization"],
  //     stats: { projects: "150+", students: "600+", rating: "4.8" },
  //   },
  //   {
  //     icon: LineChart,
  //     title: "StratLab",
  //     desc: "Bridge the gap between technology and business with strategic thinking and leadership.",
  //     gradient: "bg-gradient-to-br from-[#F857A6]/90 to-[#FF5858]/90",
  //     softBg: "bg-[#F857A6]/5",
  //     features: ["Tech Strategy", "Product Management", "Leadership"],
  //     stats: { projects: "120+", students: "450+", rating: "4.9" },
  //   },
  //   {
  //     icon: Ship,
  //     title: "ChipWorks",
  //     desc: "Create innovative IoT solutions and smart systems for the connected world.",
  //     gradient: "bg-gradient-to-br from-[#24C6DC]/90 to-[#514A9D]/90",
  //     softBg: "bg-[#24C6DC]/5",
  //     features: ["IoT Development", "Embedded Systems", "Smart Solutions"],
  //     stats: { projects: "160+", students: "700+", rating: "4.8" },
  //   },
  // ];

  const wings = [
    {
      size: "large",
      icon: Code2,
      title: "CodeForge",
      desc: "Empowering learners through hands-on coding experiences. Our structured programs help students build real-world applications, preparing them for successful tech careers.",
      metrics: [
        { label: "Projects Built", value: "500+" },
        { label: "Student Satisfaction", value: "98%" },
        { label: "Career Transition Rate", value: "40%" },
      ],
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
      gradient: "from-neutral-900 to-neutral-800",
    },
    {
      size: "small",
      icon: Brain,
      title: "AIHub",
      desc: "Integrating AI-powered learning assistants to provide personalized support, ensuring students grasp complex concepts effectively.",
      gradient: "from-neutral-800 to-neutral-700",
    },
    {
      size: "small",
      icon: Cpu,
      title: "ChipWorks",
      desc: "Offering foundational courses in hardware and embedded systems to help students understand the fundamentals of computing.",
      gradient: "from-neutral-700 to-neutral-600",
    },
    {
      size: "medium",
      icon: BarChart3,
      title: "StratLab",
      desc: "Providing data-driven insights and career analytics to guide students on their learning journey and optimize job placement outcomes.",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      gradient: "from-neutral-800 to-neutral-700",
    },
    {
      size: "medium",
      icon: Network,
      title: "AlgoNest",
      desc: "Fostering problem-solving skills through algorithmic challenges and system design projects, preparing learners for technical interviews and competitive coding.",
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800",
      gradient: "from-neutral-700 to-neutral-600",
    },
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Structured Learning",
      desc: "Follow curated paths designed by industry experts to master new skills efficiently",
      color: "bg-blue-50",
      accentColor: "text-blue-600",
      borderColor: "border-blue-100",
      link: "",
    },
    {
      icon: Rocket,
      title: "Real Projects",
      desc: "Build production-ready applications that matter using industry best practices",
      color: "bg-purple-50",
      accentColor: "text-purple-600",
      borderColor: "border-purple-100",
      link: "",
    },
    {
      icon: Bell,
      title: "Latest Updates",
      desc: "Stay informed with the latest tech news, trends, and platform updates",
      color: "bg-indigo-50",
      accentColor: "text-indigo-600",
      borderColor: "border-indigo-100",
      link: "",
    },
    {
      icon: Trophy,
      title: "Regular Hackathons",
      desc: "Test your skills in competitive environments and win exciting prizes",
      color: "bg-amber-50",
      accentColor: "text-amber-600",
      borderColor: "border-amber-100",
      link: "/",
    },
    {
      icon: Briefcase,
      title: "Internships",
      desc: "Gain real-world experience with internship opportunities from top companies",
      color: "bg-pink-50",
      accentColor: "text-pink-600",
      borderColor: "border-pink-100",
      link: "",
    },
    {
      icon: Users,
      title: "Active Community",
      desc: "Learn and grow with passionate peers through forums, study groups, and events",
      color: "bg-teal-50",
      accentColor: "text-teal-600",
      borderColor: "border-teal-100",
      link: "",
    },
  ];

  // Stats with icons
  const stats = [
    {
      number: "10K+",
      label: "Active Students",
      icon: Users,
      description: "Join peers from over 120 countries",
    },
    {
      number: "500+",
      label: "Projects Completed",
      icon: Award,
      description: "Real-world, industry-backed projects",
    },
    {
      number: "50+",
      label: "Expert Mentors",
      icon: BookOpen,
      description: "Learn from industry veterans",
    },
    {
      number: "100%",
      label: "Career Growth",
      icon: TrendingUp,
      description: "Our students report significant progress",
    },
  ];

  // Upcoming community events
  const events = [
    {
      title: "Web3 Development Workshop",
      date: "March 22, 2025",
      time: "6:00 PM - 8:00 PM",
      attendees: 243,
      image:
        "https://assets.clarisco.com/clarisco+images/new-web3/web-3-development-3.webp",
    },
    {
      title: "AI Ethics Roundtable",
      date: "March 25, 2025",
      time: "5:30 PM - 7:30 PM",
      attendees: 189,
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    },
    {
      title: "Tech Career Fair",
      date: "April 2, 2025",
      time: "10:00 AM - 4:00 PM",
      attendees: 312,
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <EvolveNavbar/>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#F5F5F7]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent" />
        <div className="relative max-w-[1400px] mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-6xl lg:text-7xl font-medium leading-tight mb-6">
                Unlock your
                <span className="text-red-500"> potential</span>
                <br />
                with Evolve
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join a thriving community of 10,000+ learners mastering
                cutting-edge tech skills. Transform your future through hands-on
                learning and real-world projects.
              </p>
              <div className="flex gap-4">
                <button className="group px-8 py-4 bg-black text-white rounded-full hover:bg-black/90 transition-all">
                  <span className="flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="px-8 py-4 border border-black/20 rounded-full hover:bg-black/5 transition-all">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative h-[600px]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500 rounded-full overflow-hidden shadow-2xl animate-float">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                  alt="Students collaborating"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black rounded-full overflow-hidden shadow-2xl animate-float-delayed">
                <img
                  src="https://ik.imagekit.io/t6mlgjrxa/masaischool.jpg?updatedAt=1742070751513"
                  alt="Student"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Wings */}
      {/* <section className="py-24 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-red-100 text-red-500 text-sm font-medium mb-4 rounded-full">
              Our Programs
            </span>
            <h2 className="text-5xl font-bold text-black mb-4">
              Specialized Learning <span className="text-red-500">Wings</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Choose your path to excellence with our specialized learning
              tracks designed to transform your career
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {wings.map((wing, index) => (
              <article
                key={wing.title}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="p-8 h-full flex flex-col"> */}
      {/* Colored accent bar */}
      {/* <div
                    className={`h-1 w-16 rounded-full mb-6 bg-gradient-to-r ${wing.gradient}`}
                  ></div> */}

      {/* Icon */}
      {/* <div className="mb-6">
                    <wing.icon className="h-8 w-8 text-black" />
                  </div>

                  <h3 className="text-2xl font-bold text-black mb-3">
                    {wing.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{wing.desc}</p> */}

      {/* Stats */}
      {/* <div className="grid grid-cols-3 gap-4 mb-6">
                    {Object.entries(wing.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-black font-bold">{value}</div>
                        <div className="text-gray-500 text-sm capitalize">
                          {key}
                        </div>
                      </div>
                    ))}
                  </div> */}

      {/* Features */}
      {/* <ul className="space-y-3 mb-8">
                    {wing.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-gray-700 flex items-center gap-3"
                      >
                        <div
                          className={`h-1 w-4 rounded-full bg-gradient-to-r ${wing.gradient}`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <button
                      className={`w-full bg-gradient-to-r ${wing.gradient} text-white py-3.5 rounded-full flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer`}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section> */}

      {/* Wings Section */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-red-500 mb-4">Wings</h2>
            <p className="text-neutral-600 max-w-2xl text-lg">
              Empowering learners with industry-relevant skills through hands-on
              training, fostering growth, innovation, and career excellence.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {wings.map((wing, index) => {
              const baseClasses =
                "rounded-2xl overflow-hidden relative group transition-all duration-300 hover:shadow-xl";
              const gridClasses = {
                large: "col-span-12 md:col-span-8 row-span-2 h-[600px]",
                medium: "col-span-12 md:col-span-6 h-[400px]",
                small: "col-span-12 md:col-span-4 h-[300px]",
              };

              return (
                <div
                  key={wing.title}
                  className={`${baseClasses} ${gridClasses[wing.size]}`}
                >
                  {/* Background Image or Gradient */}
                  <div className="absolute inset-0">
                    {wing.image ? (
                      <>
                        <img
                          src={wing.image}
                          alt={wing.title}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${wing.gradient} opacity-90`}
                        />
                      </>
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${wing.gradient}`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="relative h-full p-8 flex flex-col justify-between text-white">
                    <div>
                      <wing.icon className="h-8 w-8 mb-4" />
                      <h3 className="text-2xl font-medium mb-3">
                        {wing.title}
                      </h3>
                      <p className="text-white/80 text-lg">{wing.desc}</p>
                    </div>

                    {wing.metrics && (
                      <div className="grid grid-cols-3 gap-6 mt-8">
                        {wing.metrics.map((metric, idx) => (
                          <div key={idx}>
                            <div className="text-2xl font-semibold">
                              {metric.value}
                            </div>
                            <div className="text-white/60 text-sm">
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-6">
                      <button className="group inline-flex items-center text-sm font-medium cursor-pointer">
                        Learn more
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-red-50 text-red-500 font-medium text-sm mb-4">
              Why Students Love Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why choose{" "}
              <span className="text-red-500 relative">
                Evolve
                <span className="absolute bottom-0 left-0 w-full h-2 bg-red-100 -z-10"></span>
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who've accelerated their careers
              through our innovative learning platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group p-6 rounded-xl border ${feature.borderColor} ${feature.color} hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 rounded-full bg-white/30 z-0"></div>

                <div className="relative z-10">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-5`}
                  >
                    <feature.icon
                      className={`h-6 w-6 ${feature.accentColor}`}
                    />
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:translate-x-1 transition-transform">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{feature.desc}</p>

                  <Link to={feature.link}>
                    <p
                      className={`inline-flex items-center text-sm font-medium ${feature.accentColor} group-hover:underline cursor-pointer`}
                    >
                      Learn more{" "}
                      <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="inline-flex items-center justify-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl !important">
              Start Learning Today
            </button>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-32 bg-black">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-medium text-white mb-6">
              Join Our Community
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Connect with 10,000+ learners, share knowledge, and accelerate
              your growth together.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Active Students" },
              { number: "500+", label: "Projects Completed" },
              { number: "50+", label: "Expert Mentors" },
              { number: "100%", label: "Career Growth" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-8 rounded-2xl bg-white/5 text-center"
              >
                <div className="text-4xl font-medium text-red-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 left-1/2 w-1/2 h-1/2 bg-red-500 opacity-10 blur-[150px] -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500 opacity-10 blur-[150px]"></div>

        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-2 bg-red-500/20 text-red-500 text-sm font-medium mb-4 rounded-full">
              Community
            </span>
            <h2 className="text-6xl font-bold text-white mb-6">
              Learn <span className="text-red-500">Together</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Connect with 10,000+ learners, share knowledge, and accelerate
              your growth through our vibrant global community.
            </p>
          </div>

          {/* Stats section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mr-4">
                    <stat.icon className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {stat.number}
                  </div>
                </div>
                <div className="text-lg text-white font-medium mb-2">
                  {stat.label}
                </div>
                <div className="text-gray-400">{stat.description}</div>
              </div>
            ))}
          </div>

          {/* Community Highlights */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* Left side - Community Features */}
            <div className="flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-white mb-8">
                How our community elevates your learning
              </h3>

              {[
                {
                  icon: MessageCircle,
                  title: "Peer Learning Networks",
                  desc: "Engage in discussions, solve problems together, and share insights with peers on the same learning journey.",
                },
                {
                  icon: Calendar,
                  title: "Weekly Events & Workshops",
                  desc: "Participate in regular tech talks, coding sessions, and career development workshops led by industry experts.",
                },
                {
                  icon: Globe,
                  title: "Global Networking",
                  desc: "Connect with learners and professionals worldwide, building relationships that extend beyond your studies.",
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex mb-8">
                  <div className="mr-6">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}

              <button className="mt-4 bg-red-500 text-white py-4 px-8 rounded-full flex items-center justify-center gap-2 w-fit hover:bg-red-600 transition-colors">
                Join the Community
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right side - Upcoming Events */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-8">
                Upcoming Community Events
              </h3>

              <div className="space-y-6">
                {events.map((event, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-auto overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <h4 className="text-xl font-medium text-white mb-2">
                          {event.title}
                        </h4>
                        <div className="flex items-center text-gray-400 mb-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-gray-400 mb-4">
                          <Clock className="w-4 h-4 mr-2" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{event.attendees} attending</span>
                        </div>
                        <button className="mt-4 bg-transparent border border-red-500 text-red-500 py-2 px-4 rounded-full text-sm hover:bg-red-500/10 transition-colors">
                          RSVP Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonials preview */}
          <div className="text-center">
            <p className="text-gray-400 mb-6">
              Hear from our community members
            </p>
            <p
              href="#testimonials"
              className="text-white underline underline-offset-4 hover:text-red-500 transition-colors"
            >
              See all testimonials
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img
                  src="https://ik.imagekit.io/t6mlgjrxa/IMG_0248.png?updatedAt=1742069249449"
                  alt="Evolve"
                  className="h-8 invert brightness-0"
                />
                <span className="text-xs font-light text-gray-500">
                  by Masai
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                Building the next generation of tech talent through immersive
                learning and real-world projects.
              </p>
              <div className="flex gap-4">
                <p
                  href="#"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Github className="h-6 w-6" />
                </p>
                <p
                  href="#"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </p>
                <p
                  href="#"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </p>
              </div>
            </div>
            {[
              {
                title: "Studio Wings",
                links: ["CodeForge", "AlgoNest", "FutureMind", "InfoSphere"],
              },
              {
                title: "Resources",
                links: ["Documentation", "Community", "Blog", "Contact"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="text-white font-medium mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <p
                        href="#"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        {link}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-20 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Evolve By Masai. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Evolve;
