"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import {
  Award,
  Calendar,
  CheckCircle2,
  FileText,
  Github,
  Globe,
  HelpCircle,
  Linkedin,
  Mail,
  MessageSquare,
  Search,
  Shield,
  Star,
  TrendingUp,
  Twitter,
  Users,
  Zap,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface AnimatedHomePageProps {
  session: any;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const iconVariants = {
  hover: {
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

export function AnimatedHomePage({
  session: serverSession,
}: AnimatedHomePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const perfectForRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const detailedFeaturesRef = useRef(null);
  const testimonialsRef = useRef(null);
  const builtForRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  const isLoggedIn = session?.user || serverSession?.user;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const perfectForInView = useInView(perfectForRef, {
    once: true,
    amount: 0.2,
  });
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.2 });
  const howItWorksInView = useInView(howItWorksRef, {
    once: true,
    amount: 0.3,
  });
  const detailedFeaturesInView = useInView(detailedFeaturesRef, {
    once: true,
    amount: 0.2,
  });
  const testimonialsInView = useInView(testimonialsRef, {
    once: true,
    amount: 0.2,
  });
  const builtForInView = useInView(builtForRef, { once: true, amount: 0.2 });
  const faqInView = useInView(faqRef, { once: true, amount: 0.2 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  const features = [
    {
      icon: Users,
      iconColor: "text-blue-600",
      title: "Study Groups",
      description: "Create or join study groups based on courses and topics",
      items: [
        "Create and manage groups",
        "Role-based permissions (Admin, Member, Viewer)",
        "Join via invite links",
      ],
    },
    {
      icon: MessageSquare,
      iconColor: "text-green-600",
      title: "Real-Time Messaging",
      description: "Chat with your group members instantly",
      items: [
        "WhatsApp-like chat interface",
        "Share files in messages",
        "Real-time notifications",
      ],
    },
    {
      icon: FileText,
      iconColor: "text-purple-600",
      title: "File Sharing",
      description: "Upload, share, and organize course materials",
      items: [
        "Support for PDF, DOCX, PPTX, images",
        "Public share links",
        "Version control",
      ],
    },
    {
      icon: Calendar,
      iconColor: "text-orange-600",
      title: "Events & Scheduling",
      description: "Plan study sessions and group meetings",
      items: [
        "Create and manage events",
        "RSVP functionality",
        "Automatic reminders",
      ],
    },
    {
      icon: Search,
      iconColor: "text-indigo-600",
      title: "Search & Discovery",
      description: "Find groups, users, and resources easily",
      items: [
        "Search groups by topic",
        "Find students by program/skills",
        "Discover relevant content",
      ],
    },
    {
      icon: Shield,
      iconColor: "text-red-600",
      title: "Security & Privacy",
      description: "Your data is safe and secure",
      items: [
        "Secure authentication",
        "Profile visibility controls",
        "Email verification",
      ],
    },
  ];

  const steps = [
    {
      number: 1,
      color: "bg-blue-100",
      textColor: "text-blue-600",
      title: "Sign Up",
      description:
        "Create your account with your student email and build your profile",
    },
    {
      number: 2,
      color: "bg-green-100",
      textColor: "text-green-600",
      title: "Join Groups",
      description:
        "Search for study groups or create your own based on your courses",
    },
    {
      number: 3,
      color: "bg-purple-100",
      textColor: "text-purple-600",
      title: "Collaborate",
      description:
        "Share files, chat with members, schedule events, and study together",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <motion.nav
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl font-bold text-blue-600"
            >
              CampusConnect
            </motion.div>
            <motion.div
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              {isLoggedIn ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={handleSignOut}>Sign Out</Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" asChild>
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild>
                      <Link href="/auth/signup">Get Started</Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={heroRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="text-center py-20"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Connect, Collaborate, and{" "}
            <span className="text-blue-600">Study Together</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto"
          >
            CampusConnect is your all-in-one platform for student collaboration.{" "}
            Join study groups, share resources, schedule events, and communicate
            in real-time.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  100%
                </div>
                <div className="text-sm text-gray-600">Free for Students</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Available Support</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  Secure
                </div>
                <div className="text-sm text-gray-600">Data Protection</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex justify-center space-x-4 flex-wrap gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" asChild>
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          ref={statsRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-16 bg-blue-600 rounded-2xl mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Students", icon: Users },
              { number: "5K+", label: "Study Groups", icon: Users },
              { number: "50K+", label: "Files Shared", icon: FileText },
              { number: "100K+", label: "Messages Sent", icon: MessageSquare },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  initial="hidden"
                  animate={statsInView ? "visible" : "hidden"}
                  transition={{ delay: index * 0.1 }}
                  className="text-white"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center"
                  >
                    <Icon className="h-8 w-8 mb-2 opacity-80" />
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                      className="text-4xl md:text-5xl font-bold mb-2"
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-blue-100 text-sm md:text-base">
                      {stat.label}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          ref={featuresRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
          >
            Everything You Need to Succeed
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover="hover"
                  initial="visible"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full cursor-pointer">
                    <CardHeader>
                      <motion.div variants={iconVariants} whileHover="hover">
                        <Icon
                          className={`h-10 w-10 ${feature.iconColor} mb-4`}
                        />
                      </motion.div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {feature.items.map((item) => (
                          <motion.li
                            key={item}
                            className="flex items-center"
                            initial={{ x: 0 }}
                            animate={{ x: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          ref={perfectForRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-16 bg-white rounded-2xl mb-20"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Perfect for Every Student
              </h2>
              <p className="text-lg text-gray-600">
                Whether you&apos;re studying alone or in a group, CampusConnect
                adapts to your needs
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                variants={itemVariants}
                className="p-6 bg-blue-50 rounded-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Individual Learners
                </h3>
                <p className="text-gray-700 mb-4">
                  Create your own study groups, organize your course materials,
                  and connect with peers who share your academic interests.
                  Build your network and find study partners for any subject.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      Create personalized study groups for your courses
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      Organize and access all your study materials in one place
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      Find study partners based on your program and skills
                    </span>
                  </li>
                </ul>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="p-6 bg-green-50 rounded-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Study Groups
                </h3>
                <p className="text-gray-700 mb-4">
                  Collaborate effectively with your existing study groups. Share
                  files instantly, coordinate study sessions, and keep everyone
                  in sync with real-time messaging and event scheduling.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>Real-time group chat keeps everyone connected</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      Share files and resources instantly with group members
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      Schedule and manage study sessions with built-in calendar
                    </span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={benefitsRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-20 bg-gray-50 rounded-2xl mb-20"
        >
          <div className="text-center mb-12">
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Why Choose CampusConnect?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Join thousands of students who are already collaborating and
              succeeding together
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Real-time updates and instant messaging keep you connected with your study group.",
                color: "text-yellow-500",
              },
              {
                icon: Globe,
                title: "Accessible Anywhere",
                description:
                  "Access your groups, files, and messages from any device, anywhere, anytime.",
                color: "text-blue-500",
              },
              {
                icon: Award,
                title: "Trusted Platform",
                description:
                  "Built with security and privacy in mind. Your data is always protected.",
                color: "text-green-500",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  variants={cardVariants}
                  whileHover="hover"
                  initial="visible"
                  animate="visible"
                  transition={{ delay: index * 0.15 }}
                >
                  <Card className="h-full text-center">
                    <CardHeader>
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        className="flex justify-center mb-4"
                      >
                        <div
                          className={`${benefit.color} bg-gray-50 rounded-full p-4`}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                      </motion.div>
                      <CardTitle>{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {benefit.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          ref={howItWorksRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-20 bg-white rounded-lg shadow-sm mb-20"
        >
          <div className="text-center max-w-3xl mx-auto px-4">
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            >
              How It Works
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  initial="visible"
                  animate="visible"
                  transition={{ delay: index * 0.2 }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`${step.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
                  >
                    <span className={`text-2xl font-bold ${step.textColor}`}>
                      {step.number}
                    </span>
                  </motion.div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={detailedFeaturesRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-16 mb-20"
        >
          <div className="max-w-5xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How CampusConnect Works for You
              </h2>
              <p className="text-lg text-gray-600">
                A comprehensive platform designed to enhance your academic
                journey
              </p>
            </motion.div>
            <div className="space-y-8">
              <motion.div
                variants={itemVariants}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Discover and Join Study Groups
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Search through hundreds of active study groups organized
                      by course topics, programs, and subjects. Each group has
                      its own dedicated space for discussions, file sharing, and
                      event planning. You can filter groups by your program,
                      semester, or specific course codes to find the perfect
                      match for your studies.
                    </p>
                    <p className="text-gray-600 text-sm">
                      Groups are managed by admins who can approve members,
                      assign roles, and maintain organization. As a member, you
                      can contribute files, participate in discussions, and
                      attend group events.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Real-Time Communication
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Our WhatsApp-like messaging interface makes group
                      communication seamless and intuitive. Messages are
                      delivered instantly to all group members, and you can
                      attach files directly in conversations. The interface
                      shows your messages on the right and others&apos; messages
                      on the left, making it easy to follow discussions.
                    </p>
                    <p className="text-gray-600 text-sm">
                      You&apos;ll receive real-time notifications for new
                      messages, file uploads, event invitations, and group
                      updates. Customize your notification preferences in your
                      profile settings to stay informed without being
                      overwhelmed.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Comprehensive File Management
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Upload and organize all your course materials in one
                      centralized location. Support for PDFs, Word documents,
                      PowerPoint presentations, and images ensures you can share
                      any type of study material. Files are organized by group,
                      making it easy to find what you need when you need it.
                    </p>
                    <p className="text-gray-600 text-sm">
                      Generate public share links for files you want to share
                      outside your groups, or keep them private within your
                      study groups. Version control prevents conflicts when
                      multiple members upload files with the same name, ensuring
                      you always have access to the latest version.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Event Planning and Scheduling
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Coordinate study sessions, group meetings, and academic
                      events with our built-in calendar system. Create events
                      with detailed descriptions, set locations (virtual or
                      physical), and manage RSVPs to know who&apos;s attending.
                      Automatic reminders ensure no one misses important study
                      sessions.
                    </p>
                    <p className="text-gray-600 text-sm">
                      Events are visible to all group members, and you can see
                      who&apos;s planning to attend before the session starts.
                      Recurring events can be set up for regular study sessions,
                      making it easy to maintain consistent study schedules
                      throughout the semester.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={testimonialsRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-20 mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Students Are Saying
            </h2>
            <p className="text-lg text-gray-600">
              See how CampusConnect is helping students succeed
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Computer Science Student",
                content:
                  "CampusConnect has completely transformed how I study. Finding study groups and sharing notes has never been easier!",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Engineering Student",
                content:
                  "The real-time messaging and file sharing features are amazing. My study group is more organized than ever.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                role: "Business Student",
                content:
                  "I love how easy it is to schedule study sessions and events. The platform is intuitive and user-friendly.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={cardVariants}
                whileHover="hover"
                initial="visible"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">
                      &quot;{testimonial.content}&quot;
                    </p>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          ref={builtForRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-16 bg-blue-50 rounded-2xl mb-20"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Built for Modern Students
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to succeed in your academic journey
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  Secure by Default
                </h3>
                <p className="text-gray-700 text-sm">
                  All your data is encrypted and securely stored. We use
                  industry-standard security practices to protect your personal
                  information and academic materials. Your profile visibility is
                  completely under your control, and you can choose who sees
                  your information.
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                  Always Available
                </h3>
                <p className="text-gray-700 text-sm">
                  Access CampusConnect from any device - your laptop, tablet, or
                  smartphone. Our responsive design ensures a seamless
                  experience whether you&apos;re in the library, at home, or on
                  the go. All your data syncs automatically across devices.
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  Continuously Improving
                </h3>
                <p className="text-gray-700 text-sm">
                  We regularly update CampusConnect with new features based on
                  student feedback. Our platform evolves with your needs,
                  ensuring you always have access to the latest tools for
                  effective collaboration and learning.
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="h-5 w-5 text-purple-600 mr-2" />
                  Student-Focused
                </h3>
                <p className="text-gray-700 text-sm">
                  CampusConnect is built specifically for students, by
                  understanding the unique challenges of academic collaboration.
                  Every feature is designed to make your study experience more
                  efficient, organized, and enjoyable.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={faqRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-20 bg-white rounded-2xl shadow-sm mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about CampusConnect
            </p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "How do I join a study group?",
                answer:
                  "You can search for study groups by course topic, or create your own group. You can also join groups using invite links shared by group admins.",
              },
              {
                question: "Is CampusConnect free to use?",
                answer:
                  "Yes! CampusConnect is completely free for all students. Just sign up with your student email address to get started.",
              },
              {
                question: "What file types can I share?",
                answer:
                  "You can share PDFs, DOCX documents, PPTX presentations, and image files (JPG, PNG). All files are securely stored and can be accessed by group members.",
              },
              {
                question: "How does real-time messaging work?",
                answer:
                  "Our platform uses WebSocket technology to provide instant messaging. Messages are delivered in real-time to all group members, just like WhatsApp.",
              },
              {
                question: "Can I control who sees my profile?",
                answer:
                  "Yes! You can set your profile visibility to public, restricted, or private. You have full control over your privacy settings.",
              },
              {
                question: "How do I schedule events?",
                answer:
                  "Group members can create events directly within their study groups. You can set dates, times, locations, and other members can RSVP to events.",
              },
            ].map((faq, index) => (
              <motion.div
                key={faq.question}
                variants={itemVariants}
                initial="visible"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          ref={ctaRef}
          initial="visible"
          animate="visible"
          variants={containerVariants}
          className="py-20 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 mb-8"
          >
            Join thousands of students already using CampusConnect
          </motion.p>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" asChild>
              <Link href="/auth/signup">Create Your Account</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.footer
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 text-white mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold mb-4">CampusConnect</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your all-in-one platform for student collaboration. Connect,
                study, and succeed together.
              </p>
              <div className="flex space-x-4">
                {[
                  {
                    icon: Twitter,
                    href: "https://twitter.com",
                    label: "Twitter",
                  },
                  {
                    icon: Linkedin,
                    href: "https://linkedin.com",
                    label: "LinkedIn",
                  },
                  { icon: Github, href: "https://github.com", label: "GitHub" },
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/groups"
                    className="hover:text-white transition-colors"
                  >
                    Study Groups
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="hover:text-white transition-colors"
                  >
                    Search
                  </Link>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a
                    href="mailto:support@campusconnect.com"
                    className="hover:text-white transition-colors"
                  >
                    support@campusconnect.com
                  </a>
                </li>
                <li className="pt-2">
                  <p className="text-gray-400">
                    Have questions? We&apos;re here to help!
                  </p>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="border-t border-gray-800 pt-8 mt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 CampusConnect. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
