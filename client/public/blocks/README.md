# Presidency University Campus Block Imagery Guide
## ECHOTECH AI Sustainability Platform

This directory contains photographic assets for each campus building block at **Presidency University, Yelahanka, Bengaluru**.

---

### Strict Imagery Policy
1. **No Scraping or Hotlinking**: Do not hotlink or scrape images from `presidencyuniversity.in` or external third-party sites without authorization.
2. **Authorized Sources**:
   - Official institutional photos supplied by the Presidency University Media & Communications cell.
   - High-resolution photographs captured personally on campus with administrative clearance.
   - Open Creative Commons assets with explicit commercial reuse rights.
3. **Graceful Fallback**: The ECHOTECH web application includes `<BlockImage />` with built-in SVG gradient fallbacks and Lucide category icons. If no physical photograph is present in this directory, the UI renders gracefully with zero broken-image artifacts.

---

### File Naming Convention & Sizing
- **Hero Image**: `/blocks/<BLOCK_ID>.jpg` (or `.webp`)
  - Example: `ADMIN.jpg`, `CSE.jpg`, `ENGG.jpg`, `CIVIL.jpg`, `LIB.jpg`, `ARCH.jpg`, `COMM.jpg`, `HOSTEL_B.jpg`, `HOSTEL_G.jpg`, `FOOD.jpg`, `SPORTS.jpg`, `AUD.jpg`, `STP.jpg`.
  - Campus-wide Hero: `/blocks/CAMPUS_HERO.jpg`
- **Recommended Dimensions**: 1280 × 720 px (16:9 widescreen aspect ratio).
- **File Size Target**: Under 300 KB per image (use WebP or 80% JPEG compression).
- **Photo Credits**: Record the attribution in `server/data/blocks.config.json` under `"imageCredit"` (e.g. `"Presidency University Campus Facilities"`). It will be rendered automatically as a discreet caption.
