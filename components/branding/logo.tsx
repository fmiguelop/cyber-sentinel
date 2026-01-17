import Image from "next/image";
import Link from "next/link";


export function Logo() {
  return (
    <div className="hidden lg:flex justify-end items-start">
      <Link
        href="/"
        aria-label="CyberSentinel"
        title="CyberSentinel - Real-Time Threat Intelligence Dashboard"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
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
