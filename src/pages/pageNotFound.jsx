// src/pages/pageNotFound.jsx
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function PageNotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4
                 bg-white text-gray-900
                 dark:bg-neutral-900 dark:text-gray-100 transition-colors px-4"
    >
      <h1 className="text-7xl font-bold">404</h1>

      <p className="text-xl font-medium text-gray-700 dark:text-gray-200">
        Page Not Found :(
      </p>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Sorry, we couldn’t find the page you’re looking for.
      </p>

      <Link
        to="/"
        className="mt-4 inline-flex items-center gap-2 rounded-lg border
                   border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition
                   hover:bg-gray-100
                   dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
