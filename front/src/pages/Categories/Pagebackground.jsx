/**
 * Purely decorative animated background blobs.
 * Extracted to keep the page component clean and allow
 * easy removal / replacement without touching business logic.
 */
const PageBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute top-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-linear-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
    <div
      className="absolute bottom-20 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-linear-to-tr from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
      style={{ animationDelay: '1s' }}
    />
  </div>
);

export default PageBackground;