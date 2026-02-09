import confetti from 'canvas-confetti';

/**
 * Trigger confetti animation for task completion
 */
export function triggerConfetti(origin?: { x: number; y: number }): void {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'],
  };

  function shoot(angle: number, startVelocity: number) {
    confetti({
      ...defaults,
      particleCount: 60,
      scalar: 1.2,
      origin,
      angle,
      startVelocity,
    });
  }

  // Multiple bursts for celebration effect
  setTimeout(() => shoot(60, 35), 0);
  setTimeout(() => shoot(120, 35), 100);
  setTimeout(() => shoot(240, 35), 200);
  setTimeout(() => shoot(300, 35), 300);
}

/**
 * Trigger confetti from the center of the screen
 */
export function triggerConfettiCenter(): void {
  triggerConfetti(undefined);
}

/**
 * Small confetti burst for quick feedback
 */
export function triggerConfettiSmall(): void {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.6 },
    colors: ['#ef4444', '#f59e0b', '#eab308', '#22c55e'],
  });
}
