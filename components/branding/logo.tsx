import Image from "next/image";
import Link from "next/link";
export function Logo() {
  return (
    <div className="hidden items-start justify-end lg:flex">
      <Link
        href="/"
        aria-label="CyberSentinel"
        title="CyberSentinel - Real-Time Threat Intelligence Dashboard"
        className="focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Image
          src="/assets/logo.svg"
          alt="CyberSentinel - Real-Time Threat Intelligence Dashboard"
          width={400}
          height={46}
          className="h-auto"
          priority
          fetchPriority="high"
        />
      </Link>
    </div>
  );
}
