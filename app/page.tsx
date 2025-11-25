'use client'

import Link from 'next/link'
import { Clock, BarChart3, MessageSquare, ArrowRight, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { WaitlistDialog } from '@/components/waitlist-dialog'

function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
      }
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return [ref, isInView] as const
}

export default function LandingPage() {
  const [heroRef, heroInView] = useInView({ threshold: 0.1 })
  const [servicesRef, servicesInView] = useInView({ threshold: 0.1 })
  const [feature1Ref, feature1InView] = useInView({ threshold: 0.1 })
  const [feature2Ref, feature2InView] = useInView({ threshold: 0.1 })
  const [waitlistOpen, setWaitlistOpen] = useState(false)

  const services = [
    {
      title: 'English Coach',
      description:
        'Improve your English with AI-powered conversations, real-time feedback, and personalized lessons.',
      href: '/english-tutor',
    },
    {
      title: 'Interview Preparer',
      description:
        'Ace your interviews with AI-driven practice sessions, tailored feedback, and expert strategies.',
      href: '/interview-preparer',
    },
  ]

  const features = [
    {
      icon: <Clock className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />,
      title: '24/7 AI-Powered Learning',
      description:
        'Engage with your personal AI tutor at any time, from anywhere. Our advanced AI technology ensures you receive consistent, high-quality instruction whenever you\'re ready to learn.',
      bullets: [
        'Available around the clock, no scheduling needed',
        'Instant personalized feedback on your performance',
        'Realistic conversation practice with natural responses',
      ],
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />,
      title: 'Detailed Progress Analytics',
      description:
        'Track your improvement with comprehensive analytics and insights. Our platform provides detailed breakdowns of your performance, helping you identify strengths and areas for growth.',
      bullets: [
        'Real-time performance tracking across all sessions',
        'Comprehensive skill assessments and CEFR scoring',
        'Actionable insights to accelerate your learning',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <main className="pt-8">
        {/* Hero Section */}
        <div
          ref={heroRef}
          className={`max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 ${
            heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6">
            Elevate your skills with AI-powered learning
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 md:mb-10">
            Master English and ace interviews with personalized AI tutoring
          </p>

          <Link href="/english-tutor">
            <button className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors mb-10 sm:mb-12 md:mb-16">
              Talk to AI - Free
            </button>
          </Link>

          <div className="text-left mb-8 sm:mb-12">
            <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-6 sm:mb-8">
              Every year, <span className="font-semibold text-gray-900 dark:text-white">millions of students graduate in India.</span> Most{' '}
              <span className="font-semibold text-gray-900 dark:text-white">don't get jobs right away</span> - not because they aren't smart,
              but because the <span className="font-semibold text-gray-900 dark:text-white">system wasn't built to help</span> them shine.
              We're building <span className="font-semibold text-gray-900 dark:text-white">something that fixes that.</span>
            </p>

            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-base sm:text-lg text-gray-400 dark:text-gray-500">🎤</span>
                <span>AI-first, voice-based sessions in your native language</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-base sm:text-lg text-gray-400 dark:text-gray-500">✨</span>
                <span>Voice bots that behave like mentors in your pocket</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-base sm:text-lg text-gray-400 dark:text-gray-500">🎯</span>
                <span>Smart matching based on real signals like hustle</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-base sm:text-lg text-gray-400 dark:text-gray-500">🌍</span>
                <span>Built for population scale</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-base sm:text-lg text-gray-400 dark:text-gray-500">📱</span>
                <span>Mobile-first, no typing, no English, no friction</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-base sm:text-lg text-gray-400 dark:text-gray-500">📊</span>
                <span>Quantitative reports that show if training actually works</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Services */}
        <div
          ref={servicesRef}
          className={`max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 delay-200 ${
            servicesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-700 ${
                  servicesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{service.description}</p>
                <Link
                  href="/session"
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  Explore <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 1 */}
        <div
          ref={feature1Ref}
          className={`max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 md:mb-20 py-8 sm:py-12 transition-all duration-1000 ${
            feature1InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div>
              <div className="mb-4 sm:mb-6">{features[0].icon}</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {features[0].title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{features[0].description}</p>
              <ul className="space-y-3">
                {features[0].bullets.map((bullet, bulletIndex) => (
                  <li
                    key={bulletIndex}
                    className={`flex items-start transition-all duration-700 ${
                      feature1InView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${(bulletIndex + 3) * 100}ms` }}
                  >
                    <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 flex items-center justify-center">
              <MessageSquare className="w-20 h-20 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div
          ref={feature2Ref}
          className={`max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 md:mb-20 bg-gray-50 dark:bg-gray-800 py-8 sm:py-12 rounded-xl transition-all duration-1000 ${
            feature2InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div className="md:order-2">
              <div className="mb-4 sm:mb-6">{features[1].icon}</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {features[1].title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{features[1].description}</p>
              <ul className="space-y-3">
                {features[1].bullets.map((bullet, bulletIndex) => (
                  <li
                    key={bulletIndex}
                    className={`flex items-start transition-all duration-700 ${
                      feature2InView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${(bulletIndex + 3) * 100}ms` }}
                  >
                    <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 flex items-center justify-center md:order-1">
              <MessageSquare className="w-20 h-20 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="bg-indigo-500 dark:bg-indigo-600 text-white py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 gap-4">
          <span className="text-xs sm:text-sm text-center md:text-left">
            Learning Forever is just beginning. We're teaming up with
            institutions to tackle this at scale.
            <br className="hidden sm:inline" />
            <span className="inline sm:hidden"> </span>
            Want in? Drop your email, and we'll reach out.
          </span>
          <button
            onClick={() => setWaitlistOpen(true)}
            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 text-indigo-500 dark:text-indigo-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Join the waitlist
          </button>
        </div>
      </div>

      {/* Waitlist Dialog */}
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  )
}
