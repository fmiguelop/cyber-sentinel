# Performance Testing Guide

## Dev-Only Simulation Speed Override

For performance testing at ~30 active threats, you can accelerate the simulation by setting an environment variable.

### Quick Start

1. Create or edit `.env.local` in the project root:
   ```
   NEXT_PUBLIC_SIM_SPEED=fast
   ```

2. Restart the dev server:
   ```bash
   npm run dev
   ```

3. Start the simulation and let it run until you reach ~30 active threats.

### What It Does

When `NEXT_PUBLIC_SIM_SPEED=fast` is set, the simulation generates threats **10x faster** (50-200ms delays instead of 500-2000ms). This allows you to quickly reach the target load of 30 concurrent active threats for performance testing.

### Manual Performance Checklist

When testing at ~30 active threats, verify:

- [ ] Map rendering remains smooth (no jank/stutter)
- [ ] Filter toggling is responsive (no lag when changing filters)
- [ ] Log scrolling is smooth
- [ ] Memory usage doesn't balloon (check DevTools Memory tab)
- [ ] No console errors or warnings
- [ ] All components update correctly when filters change

### Disabling Speed Override

Remove `NEXT_PUBLIC_SIM_SPEED=fast` from `.env.local` or set it to any other value to return to normal speed.
