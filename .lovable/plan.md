

## Plan: Move Hero Image to Right Side

**Problem**: The hero uses `lg:grid-cols-2` (1024px breakpoint), but the current viewport is 928px, so the image stacks below the text instead of appearing on the right.

**Fix**: Change the grid breakpoint from `lg:grid-cols-2` to `md:grid-cols-2` (768px) in `src/components/landing/Hero.tsx` (line 33). This will show the two-column layout (text left, image right) at the current viewport size and any screen wider than 768px.

**File**: `src/components/landing/Hero.tsx`
- Line 33: Change `grid lg:grid-cols-2` → `grid md:grid-cols-2`
- Adjust text size classes from `lg:text-6xl` to `md:text-5xl` to fit the narrower column

