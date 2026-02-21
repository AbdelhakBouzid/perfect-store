export default function Container({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-screen-3xl px-4 sm:px-6 lg:px-8 ${className}`.trim()}>{children}</div>;
}
