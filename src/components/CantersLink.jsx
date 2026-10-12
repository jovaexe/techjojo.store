// Link to the Mojo's Canters game. Styled to match the header on canters.techjojo.store:
// the bottle-cap logo tight against a heavy Archivo wordmark, with no border or fill so
// it reads as a brand lockup rather than a button.
export default function CantersLink({ className = "" }) {
  return (
    <a
      href="https://canters.techjojo.store"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Play Mojo's Canters, our football game (opens in a new tab)"
      className={`group inline-flex shrink-0 items-center gap-1.5 ${className}`}
    >
      <img
        src="/mojo-cap.png"
        alt=""
        width="24"
        height="24"
        className="h-6 w-6 shrink-0 transition duration-300 group-hover:scale-110"
      />
      <span className="font-archivo text-[0.85rem] font-black leading-none tracking-[-0.025em] whitespace-nowrap text-gray-900 dark:text-white">
        Play Mojo&rsquo;s Canters
      </span>
    </a>
  );
}
