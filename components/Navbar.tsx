'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="flex justify-between items-center px-6 py-4 max-w-4xl mx-auto bg-white transition-colors">
      <Link href="/" className="flex items-center space-x-3">
        <svg
          width="32"
          height="32"
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M26 50C32.6274 50 38 39.2548 38 26C38 12.7452 32.6274 2 26 2C19.3726 2 14 12.7452 14 26C14 39.2548 19.3726 50 26 50Z"
            fill="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
          />
          <path
            d="M9.03048 42.9704C13.7168 47.6566 25.1137 43.8577 34.4863 34.4851C43.8589 25.1125 47.6579 13.7155 42.9716 9.02923C38.2853 4.34294 26.8883 8.14192 17.5158 17.5145C8.14318 26.8871 4.34419 38.2841 9.03048 42.9704Z"
            fill="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
          />
          <path
            d="M2 26C2 32.6274 12.7452 38 26 38C39.2548 38 50 32.6274 50 26C50 19.3726 39.2548 14 26 14C12.7452 14 2 19.3726 2 26Z"
            fill="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
          />
          <path
            d="M9.03063 9.02951C4.34433 13.7158 8.14332 25.1128 17.5159 34.4854C26.8885 43.8579 38.2855 47.6569 42.9718 42.9706C47.658 38.2843 43.8591 26.8874 34.4865 17.5148C25.1139 8.14221 13.7169 4.34322 9.03063 9.02951Z"
            fill="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
          />
          <path
            d="M26 2C19.3726 2 14 12.7452 14 26C14 39.2548 19.3726 50 26 50C32.6274 50 38 39.2548 38 26C38 12.7452 32.6274 2 26 2Z"
            fill="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
          />
          <path
            d="M42.9715 9.02965C38.2852 4.34336 26.8882 8.14235 17.5156 17.5149C8.14304 26.8875 4.34405 38.2845 9.03034 42.9708C13.7166 47.6571 25.1136 43.8581 34.4862 34.4855C43.8588 25.1129 47.6578 13.7159 42.9715 9.02965Z"
            fill="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
          />
          <path
            d="M50 26C50 19.3726 39.2548 14 26 14C12.7452 14 2 19.3726 2 26C2 32.6274 12.7452 38 26 38C39.2548 38 50 32.6274 50 26Z"
            fill="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
          />
          <path
            d="M42.9713 42.9705C47.6576 38.2842 43.8586 26.8872 34.486 17.5146C25.1135 8.14207 13.7165 4.34308 9.0302 9.02937C4.34391 13.7157 8.1429 25.1126 17.5155 34.4852C26.8881 43.8578 38.285 47.6568 42.9713 42.9705Z"
            fill="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
          />
          <path
            d="M26 38C32.6274 38 38 32.6274 38 26C38 19.3726 32.6274 14 26 14C19.3726 14 14 19.3726 14 26C14 32.6274 19.3726 38 26 38Z"
            fill="currentColor"
            className="text-indigo-300 dark:text-indigo-200"
          />
        </svg>
        <span className="text-lg font-semibold text-gray-900">
          Learning Forever
        </span>
      </Link>
      <nav className="flex items-center space-x-6">
        <Link
          href="/english-tutor"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          English Tutor
        </Link>
        <Link
          href="/interview-preparer"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Interview Preparer
        </Link>
      </nav>
    </header>
  )
}
