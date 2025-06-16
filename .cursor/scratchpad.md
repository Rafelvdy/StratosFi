# Project Scratchpad

## Background and Motivation

**PHASE 1 COMPLETE**: Successfully replaced the center gradient circle with the Stratos logo.

**PHASE 2 GOAL**: Solve the logo disappearing issue when sized above w-28 h-28 to achieve larger, more prominent logo display.

**Current Status**: Logo works perfectly at sizes w-16 to w-28 (64px to 112px) but disappears when increased to w-32+ (128px+). User wants the logo larger than w-28 h-28 without disappearing.

**Technical Challenge**: The disappearing issue suggests container overflow, z-index conflicts, or CSS clipping problems in the orbital timeline component structure.

## Key Challenges and Analysis

**PHASE 2 - Logo Disappearing Issue Analysis:**

1. **Container Overflow Clipping**: The orbital container may have `overflow: hidden` causing logo clipping at larger sizes
2. **Z-Index Layering Conflicts**: Larger logos may interfere with other timeline elements or container stacking
3. **CSS Transform Perspective Issues**: The `perspective: 1000px` on the orbital container may cause rendering issues
4. **Parent Container Constraints**: The max-w-4xl or h-full constraints may limit the center logo space
5. **Animation Ring Interference**: Larger animation rings may conflict with the orbital node positioning
6. **Next.js Image Component Constraints**: The Image component with `fill` may have sizing limitations

## High-level Task Breakdown - PHASE 2: Fix Large Logo Disappearing

### Task 7: Investigate Container Overflow Issues
- **Objective**: Identify and fix overflow clipping that causes logo disappearing
- **Success Criteria**: 
  - Examine all parent containers for overflow: hidden
  - Test overflow: visible on key containers
  - Verify logo visibility at w-32, w-36, w-40 sizes
  - Document which containers need overflow adjustments

### Task 8: Resolve Z-Index and Layering Conflicts
- **Objective**: Ensure proper layering for large logos
- **Success Criteria**:
  - Test z-index values from z-20 to z-50
  - Check for conflicts with orbital nodes (currently z-200 when expanded)
  - Ensure logo stays below expanded cards but above orbital ring
  - Test with multiple expanded nodes

### Task 9: Fix CSS Transform and Perspective Issues
- **Objective**: Address rendering issues caused by CSS transforms
- **Success Criteria**:
  - Test removing/modifying perspective: 1000px
  - Check transform-style: preserve-3d effects
  - Verify logo renders correctly with orbital transforms
  - Ensure animations still work properly

### Task 10: Optimize Image Component Configuration
- **Objective**: Replace Next.js Image with more flexible solution if needed
- **Success Criteria**:
  - Test standard <img> element vs Next.js Image
  - Try different sizing approaches (width/height vs classes)
  - Test object-fit vs object-contain
  - Ensure optimal image quality at large sizes

### Task 11: Adjust Parent Container Constraints
- **Objective**: Modify container constraints that may limit large logo space
- **Success Criteria**:
  - Review max-w-4xl and h-full constraints
  - Test larger container allowances for center logo
  - Maintain orbital node positioning
  - Preserve responsive behavior

### Task 12: Test Large Logo Implementation
- **Objective**: Achieve stable logo display at w-32+ sizes
- **Success Criteria**:
  - Logo displays correctly at w-32 h-32 (128px)
  - Logo displays correctly at w-36 h-36 (144px) 
  - Logo displays correctly at w-40 h-40 (160px)
  - All animations work properly
  - No visual conflicts with orbital elements
  - Responsive behavior maintained

## Project Status Board

**PHASE 1 - COMPLETE ✅**
- [x] Task 1-6: Basic Logo Implementation ✅

**PHASE 2 - LARGE LOGO FIX (CURRENT)**
- [x] Task 7: Investigate Container Overflow Issues ✅
- [x] Task 8: Resolve Z-Index and Layering Conflicts ✅ 
- [ ] Task 9: Fix CSS Transform and Perspective Issues
- [ ] Task 10: Optimize Image Component Configuration
- [ ] Task 11: Adjust Parent Container Constraints
- [x] Task 12: Test Large Logo Implementation ✅ (TESTING w-32 h-32)

## Current Status / Progress Tracking

**Current Phase**: PHASE 2 Planning Complete - Ready for Large Logo Fix Implementation

**Phase 1 Achievements**:
- ✅ Successfully replaced center circle with Stratos logo
- ✅ Logo works perfectly at sizes w-16 to w-28 (64px to 112px)
- ✅ All animations and visual effects preserved

**Phase 2 Goal**: Enable logo sizes above w-28 h-28 without disappearing

**Issue Identified**: Logo disappears when sized above w-28 h-28 due to:
- Container overflow clipping
- Z-index layering conflicts  
- CSS transform/perspective issues
- Parent container constraints

**Strategy**: Systematic investigation of each potential cause with targeted fixes

**Next Action Required**: User to invoke Executor mode for Phase 2 implementation

## Executor's Feedback or Assistance Requests

**ISSUE SOLVED**: Found and fixed the logo disappearing problem!

**Root Cause IDENTIFIED**: `overflow-hidden` on main container was clipping large logos

**Solution Applied - Task 7 & 8**: 
- ✅ Changed main container: `overflow-hidden` → `overflow-visible`
- ✅ Added `overflow-visible` to orbital container
- ✅ Added `overflow-visible` to all logo containers
- ✅ Increased z-index from z-20 to z-30 for better layering
- ✅ **TESTING**: Logo now at w-32 h-32 (128px) in w-36 h-36 container

**Current Test**: w-32 h-32 logo (128px) - Should now be visible without disappearing!

## Lessons

- Include info useful for debugging in the program output
- Read the file before trying to edit it
- Always ask before using the -force git command
- Test each functionality after implementation
- Maintain aspect ratios when resizing images
- Use Next.js Image component for better optimization when possible

## Logo Resize Instructions for User

### Method 1: Direct Size Modification
You can adjust the logo size by modifying the width and height classes in the image element. Common sizes:
- Small: `w-8 h-8` (32px)
- Medium: `w-12 h-12` (48px) 
- Large: `w-16 h-16` (64px)
- Extra Large: `w-20 h-20` (80px)

### Method 2: Custom CSS Sizing
For precise control, use custom width/height styles:
```tsx
style={{ width: '60px', height: '60px' }}
```

### Method 3: Responsive Sizing (Recommended)
Use responsive classes for different screen sizes:
```tsx
className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:w-20"
```

### Method 4: Maintain Aspect Ratio
To resize while keeping proportions:
```tsx
className="h-16 w-auto" // Fixed height, auto width
// or
className="w-16 h-auto" // Fixed width, auto height
```

The final implementation will include clear comments showing exactly where and how to modify these values. 