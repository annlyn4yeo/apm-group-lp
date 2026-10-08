import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Rendered size hint for the image optimiser, e.g. "56px". */
  sizes: string;
  priority?: boolean;
  /**
   * For the Contact panel, which is copper in dark and pale in light. The
   * full-colour lockup (red letters) would sink into copper, so in dark it is
   * drawn as a solid ink silhouette; in light it stays full colour.
   */
  onPanel?: boolean;
};

const ALT = "APM Group of Companies";
const SIZE = 1181;

/**
 * The APM Group of Companies lockup: the blue peak with its turbine over the
 * red "apm" letters and grey tagline. The artwork is transparent, and only the
 * grey tagline is a problem on dark, so there are two files: the original, and
 * `apm-logo-dark.png`, identical except that the tagline is paper instead of
 * grey. Which one shows is decided in CSS from `<html data-theme>` (see
 * `.logo-*` in globals.css), so it is right on first paint with no script.
 */
export function Logo({ className, sizes, priority, onPanel }: LogoProps) {
  if (onPanel) {
    return (
      <Image
        src="/images/apm-logo.png"
        alt={ALT}
        width={SIZE}
        height={SIZE}
        sizes={sizes}
        priority={priority}
        className={cn("logo-on-panel block", className)}
      />
    );
  }

  return (
    <>
      <Image
        src="/images/apm-logo.png"
        alt={ALT}
        width={SIZE}
        height={SIZE}
        sizes={sizes}
        priority={priority}
        className={cn("logo-art-light block", className)}
      />
      <Image
        src="/images/apm-logo-dark.png"
        alt={ALT}
        width={SIZE}
        height={SIZE}
        sizes={sizes}
        priority={priority}
        className={cn("logo-art-dark block", className)}
      />
    </>
  );
}
