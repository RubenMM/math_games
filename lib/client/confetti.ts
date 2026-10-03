/** Celebratory burst; loaded lazily so it never weighs on the first paint. */
export async function celebrate() {
  const confetti = (await import('canvas-confetti')).default;
  const burst = (originX: number) =>
    confetti({ particleCount: 90, spread: 80, startVelocity: 45, origin: { x: originX, y: 0.7 }, disableForReducedMotion: true });
  burst(0.2);
  burst(0.8);
  setTimeout(() => confetti({ particleCount: 120, spread: 120, origin: { y: 0.5 }, disableForReducedMotion: true }), 250);
}
