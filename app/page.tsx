/* eslint-disable jsx-a11y/aria-role */
"use client";

import { Button as HeroUIButton } from "@heroui/button";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { LoginHandler } from "@/components/ui/login";

const FeatureCard = ({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) => {
    return (
        <div className="relative p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
            <div className="absolute -top-6 -left-2 bg-primary text-white rounded-full p-3 shadow-lg">
                <Icon height={24} icon={icon} width={24} />
            </div>
            <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
    );
};

const TestimonialCard = ({
    quote,
    author,
    role,
    avatar,
}: {
    quote: string;
    author: string;
    role: string;
    avatar: string;
}) => {
    return (
        <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <Image
                    alt={author}
                    className="rounded-full"
                    height={48}
                    src={avatar}
                    width={48}
                />
                <div>
                    <h4 className="font-semibold">{author}</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {role}
                    </p>
                </div>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 italic">
                &quot;{quote}&quot;
            </p>
        </div>
    );
};

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="py-16 lg:py-28">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="lg:w-1/2">
                            <motion.div
                                animate={{ opacity: 1, y: 0 }}
                                initial={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h1 className="text-4xl md:text-5xl lg:text-6xl pb-3 font-bold mb-6 bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent">
                                    AI-Powered Education for Everyone
                                </h1>
                            </motion.div>
                            <motion.p
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xl text-zinc-600 dark:text-zinc-400 mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                Transform your learning experience with
                                personalized AI tutors across any subject. Get
                                instant answers, explanations, and guidance
                                whenever you need it.
                            </motion.p>
                            <motion.div
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col sm:flex-row gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Link href="/app">
                                    <HeroUIButton
                                        className="min-w-[150px] font-medium"
                                        color="primary"
                                        size="lg"
                                        startContent={
                                            <Icon icon="lucide:sparkles" />
                                        }
                                    >
                                        Get Started
                                    </HeroUIButton>
                                </Link>
                                <div className="flex items-center">
                                    <LoginHandler />
                                </div>
                            </motion.div>
                        </div>
                        <motion.div
                            animate={{ opacity: 1, scale: 1 }}
                            className="lg:w-1/2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="relative w-full max-w-lg mx-auto">
                                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob" />
                                <div className="absolute top-0 -right-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
                                <div className="relative">
                                    <Image
                                        alt="AI Education"
                                        className="mx-auto"
                                        height={400}
                                        src="https://cdn-icons-png.flaticon.com/512/7571/7571842.png"
                                        width={400}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-zinc-100/50 dark:bg-zinc-800/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <motion.h2
                            className="text-3xl font-bold mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            Why Choose tut
                            <span className="text-primary">.ai</span>
                        </motion.h2>
                        <motion.p
                            className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            Our AI-powered platform provides personalized
                            learning experiences that adapt to your unique needs
                            and learning style.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <FeatureCard
                                description="Our AI tutors adapt to your learning style and pace, providing customized educational experiences."
                                icon="lucide:brain-circuit"
                                title="Personalized Learning"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <FeatureCard
                                description="Get help whenever you need it. Our AI tutors are available around the clock to answer your questions."
                                icon="lucide:clock"
                                title="24/7 Availability"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <FeatureCard
                                description="From mathematics to literature, our AI tutors excel in a wide range of academic subjects."
                                icon="lucide:book-open"
                                title="Multi-Subject Expertise"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <FeatureCard
                                description="Monitor your academic growth with detailed analytics and personalized feedback."
                                icon="lucide:line-chart"
                                title="Progress Tracking"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <FeatureCard
                                description="Our platform provides a secure and private space for students to learn and grow."
                                icon="lucide:shield"
                                title="Safe Learning Environment"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <FeatureCard
                                description="Engage with dynamic learning materials and interactive lessons that make education fun."
                                icon="lucide:palette"
                                title="Interactive Learning"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <motion.h2
                            className="text-3xl font-bold mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            How It Works
                        </motion.h2>
                        <motion.p
                            className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            Getting started with tut.ai is simple and
                            straightforward.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-primary">
                                    1
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Create an Account
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Sign up for a free account to access our AI
                                tutoring platform.
                            </p>
                        </motion.div>
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-primary">
                                    2
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Select Your Subject
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Choose from a wide range of academic subjects
                                you need help with.
                            </p>
                        </motion.div>
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-primary">
                                    3
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Start Learning
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Begin your learning journey with personalized
                                AI-powered tutoring.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 bg-zinc-100/50 dark:bg-zinc-800/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <motion.h2
                            className="text-3xl font-bold mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            What Our Users Say
                        </motion.h2>
                        <motion.p
                            className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            Don&apos;t just take our word for it. Here&apos;s
                            what students and educators have to say about
                            tut.ai.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <TestimonialCard
                                author="Sarah Johnson"
                                avatar="/placeholder.svg?height=48&width=48"
                                quote="tut.ai helped me improve my calculus grade from a C to an A. The personalized explanations made complex concepts easy to understand."
                                role="College Student"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <TestimonialCard
                                author="Prof. David Miller"
                                avatar="/placeholder.svg?height=48&width=48"
                                quote="As a teacher, I recommend tut.ai to all my students who need additional help. It's like having a teaching assistant available 24/7."
                                role="High School Teacher"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <TestimonialCard
                                author="Michael Chang"
                                avatar="/placeholder.svg?height=48&width=48"
                                quote="The AI tutors are incredibly knowledgeable and patient. I finally understood quantum physics concepts that had been confusing me for months."
                                role="Graduate Student"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h2
                            className="text-3xl font-bold mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            Ready to Transform Your Learning Experience?
                        </motion.h2>
                        <motion.p
                            className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            Join thousands of students who are already
                            benefiting from our AI-powered tutoring platform.
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <Link href="/app">
                                <HeroUIButton
                                    className="min-w-[150px] font-medium"
                                    color="primary"
                                    size="lg"
                                >
                                    Start Learning Now
                                </HeroUIButton>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
