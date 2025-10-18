# 🎨 Premium Design System - TBD Style Implementation

## Overview
This document details the premium visual design system inspired by TBD Products' bold, high-impact aesthetic. The system features vibrant gradients, neon glow effects, impactful typography, and smooth animations.

---

## 🎨 Design Tokens

### Colors (HSL-based)
```css
--primary: 173 80% 40%        /* Teal brand color */
--primary-glow: 173 100% 50%  /* Bright teal for glows */
```

### Gradients
```css
--gradient-primary: linear-gradient(135deg, hsl(173 80% 40%), hsl(173 100% 50%))
--gradient-vibrant: linear-gradient(45deg, hsl(173 100% 50%), hsl(173 80% 40%), hsl(173 60% 30%))
--gradient-neon: linear-gradient(90deg, hsl(173 100% 50%), hsl(173 80% 40%), hsl(173 100% 45%))
--gradient-hero: linear-gradient(135deg, hsl(173 80% 40%), hsl(173 60% 30%), hsl(222 47% 11%))
--gradient-bold: linear-gradient(135deg, hsl(173 100% 50%), hsl(173 80% 40%), hsl(173 60% 30%))
```

### Shadows & Effects
```css
--shadow-elegant: 0 20px 60px -10px hsl(173 80% 40% / 0.4)
--shadow-glow: 0 0 60px hsl(173 100% 50% / 0.6)
--shadow-strong: 0 10px 40px -10px hsl(173 80% 40% / 0.5)
--neon-glow: 0 0 5px, 0 0 10px, 0 0 20px, 0 0 40px (all with primary glow color)
```

### Typography
```css
.heading-massive: 
  - Font: Inter/Plus Jakarta Sans
  - Size: clamp(3rem, 10vw, 7rem)
  - Weight: 900
  - Letter-spacing: -0.02em
  - Line-height: 0.9
  - Transform: uppercase

.heading-bold:
  - Font: Plus Jakarta Sans/Inter
  - Size: clamp(1.5rem, 5vw, 3rem)
  - Weight: 800
  - Letter-spacing: 0.02em
  - Transform: uppercase
```

---

## 🧩 Premium Components

### 1. **GlowButton**
Animated button with gradient background and glow effect on hover.

```tsx
import { GlowButton } from '@/components/premium';

<GlowButton 
  onClick={handleClick}
  glowColor="hsl(173 100% 50%)"
>
  Order Now
</GlowButton>
```

**Features:**
- Animated gradient background shift on hover
- Radial glow effect
- Scale animation
- Customizable glow color

---

### 2. **FloatingBadge**
Animated badge with floating animation.

```tsx
import { FloatingBadge } from '@/components/premium';

<FloatingBadge delay={0}>
  NEW
</FloatingBadge>
```

**Features:**
- Continuous floating animation
- Configurable delay for staggered effects
- Border glow effect
- Bold uppercase styling

---

### 3. **ParallaxSection**
Wrapper for parallax scrolling effects.

```tsx
import { ParallaxSection } from '@/components/premium';

<ParallaxSection speed={30}>
  <YourContent />
</ParallaxSection>
```

**Features:**
- Smooth parallax scrolling
- Configurable speed
- Viewport-aware animations

---

### 4. **PageTransition**
Full-page wipe transition effect.

```tsx
import { PageTransition } from '@/components/premium';

<PageTransition>
  <YourPageContent />
</PageTransition>
```

**Features:**
- Smooth wipe transition
- Eased animation timing
- Top-to-bottom reveal

---

### 5. **PremiumLoadingState**
Animated loading screen with rotating logo and progress bar.

```tsx
import { PremiumLoadingState } from '@/components/premium';

{isLoading && <PremiumLoadingState />}
```

**Features:**
- Animated rotating logo
- Gradient progress bar
- Text glow effect
- Full-screen overlay

---

### 6. **ProductShowcase**
Hero product display with parallax and animations.

```tsx
import { ProductShowcase } from '@/components/premium';

<ProductShowcase 
  product={featuredProduct}
  onShopNow={handleShopNow}
/>
```

**Features:**
- Parallax product image
- Floating badges
- Animated background gradients
- Responsive layout
- Bold typography

---

### 7. **EnhancedMobileMenu**
Full-screen mobile menu with bold animations.

```tsx
import { EnhancedMobileMenu } from '@/components/premium';

<EnhancedMobileMenu 
  isOpen={showMenu}
  onClose={() => setShowMenu(false)}
/>
```

**Features:**
- Slide-in animation
- Staggered menu item reveals
- Animated underlines on hover
- Touch-optimized

---

### 8. **PremiumBadge**
Enhanced badge with multiple variants and animation.

```tsx
import { PremiumBadge } from '@/components/premium';
import { Award } from 'lucide-react';

<PremiumBadge 
  icon={Award}
  text="Lab Tested"
  variant="glow"
/>
```

**Variants:**
- `glow`: Pulsing glow animation
- `bold`: Solid bold styling
- `neon`: Neon outline effect

---

### 9. **AnimatedSection**
Wrapper for scroll-triggered animations.

```tsx
import { AnimatedSection } from '@/components/premium';

<AnimatedSection 
  delay={0.2}
  direction="up"
>
  <YourContent />
</AnimatedSection>
```

**Directions:**
- `up` (default)
- `down`
- `left`
- `right`

---

## 🎯 Button Variants

### New Premium Variants
```tsx
// Premium gradient button with neon glow
<Button variant="premium" size="xl">
  Shop Now
</Button>

// Bold outlined button with hover fill
<Button variant="bold" size="lg">
  Learn More
</Button>

// Hero button (existing, enhanced)
<Button variant="hero" size="lg">
  Get Started
</Button>
```

---

## 🎨 Utility Classes

### Text Effects
```css
.text-glow          /* Multi-layer text shadow glow */
.heading-massive    /* Large display heading */
.heading-bold       /* Bold section heading */
```

### Box Effects
```css
.neon-glow         /* Neon box shadow effect */
.premium-card      /* Gradient card with animated border */
.holographic       /* Animated gradient shift background */
.gradient-border   /* Rotating gradient border */
```

### Animations
```tailwind
animate-glow-pulse    /* Pulsing glow effect */
animate-float         /* Floating up/down motion */
transition-bounce     /* Bounce easing transition */
```

---

## 🎬 Animation Keyframes

### Glow Pulse
```css
@keyframes glow-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(45,212,191,0.4) }
  50% { opacity: 0.8; box-shadow: 0 0 40px rgba(45,212,191,0.8) }
}
```

### Float
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) }
  50% { transform: translateY(-10px) }
}
```

### Holographic Shift
```css
@keyframes holographic-shift {
  0%, 100% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
}
```

---

## 📦 Usage Examples

### Hero Section
```tsx
<section className="relative min-h-screen bg-gradient-hero">
  <div className="absolute inset-0 animate-glow-pulse opacity-30">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/40 rounded-full blur-3xl" />
  </div>
  
  <h1 className="heading-massive text-glow">
    NYC'S BOLDEST
    <span className="bg-gradient-vibrant bg-clip-text text-transparent">
      Flower Delivery
    </span>
  </h1>
  
  <GlowButton onClick={handleShop}>
    Shop Now
  </GlowButton>
</section>
```

### Product Card Enhancement
```tsx
<Card className="premium-card hover:shadow-neon transition-all">
  <FloatingBadge delay={0}>NEW</FloatingBadge>
  
  <PremiumBadge 
    icon={Award}
    text="Lab Tested"
    variant="glow"
  />
  
  <Button variant="premium" className="w-full">
    Add to Cart
  </Button>
</Card>
```

### Animated Content
```tsx
<AnimatedSection direction="up" delay={0.2}>
  <h2 className="heading-bold">Featured Products</h2>
</AnimatedSection>

<ParallaxSection speed={30}>
  <ProductGrid />
</ParallaxSection>
```

---

## 🎯 Design Principles

1. **BOLD COLORS**: Don't be shy with vibrant teal and high contrast
2. **HIGH CONTRAST**: Use stark black/white with brand colors
3. **MINIMAL BUT IMPACTFUL**: Fewer elements, bigger impact
4. **PREMIUM EFFECTS**: Glow, shadows, gradients throughout
5. **STRONG TYPOGRAPHY**: Bold, uppercase, impactful text
6. **SMOOTH ANIMATIONS**: Buttery 60fps transitions
7. **CONSISTENT BRAND**: Same energy across all components

---

## 🚀 Performance Notes

- All animations use GPU-accelerated properties (transform, opacity)
- Lazy loading for non-critical premium components
- Framer Motion for optimized animations
- CSS variables for instant theme switching
- Tree-shakeable component exports

---

## 📱 Mobile Optimization

- Touch-friendly 44px minimum targets
- Reduced animation complexity on mobile
- Optimized gradient rendering
- Smooth scroll performance
- Enhanced mobile menu with bold design

---

## 🎨 Color Psychology

**Teal (#2DD4BF - Primary)**
- Calming yet energetic
- Associated with clarity and focus
- Premium, modern feel
- High visibility without aggression

**Black (#0F1419 - Background)**
- Sophistication and luxury
- Makes colors pop
- Reduces eye strain in dark mode
- Premium brand association

---

## 📚 Further Reading

- Framer Motion Docs: https://www.framer.com/motion/
- Tailwind Animations: https://tailwindcss.com/docs/animation
- CSS GPU Acceleration: https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/
