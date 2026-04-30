# 🪞 Fraud Mirror

> **Return & Refund Fraud Detection — with Dignity**

Every other system gives a fraud score. **Fraud Mirror gives a reason** — shown to both the retailer and the customer simultaneously, in plain English.

---

## 🚀 Live Demo

```
npm run dev  → http://localhost:3000
```

| Route | Description |
|---|---|
| `/` | Landing page |
| `/submit` | Customer claim submission (3-step form) |
| `/mirror/CLM-001` | Wardrobing denial — split screen |
| `/mirror/CLM-002` | Fast lane approval (INR clean) |
| `/mirror/CLM-003` | Borderline review case |
| `/mirror/CLM-004` | Document fraud denial |
| `/dashboard` | Retailer fraud ops dashboard |
| `/timeline/RING-A` | Wardrobing ring replay |
| `/timeline/RING-B` | INR ring (8 members) |
| `/timeline/RING-C` | Identity fraud ring (12 members) |
| `/trust/CUST-102` | Clean trusted customer profile |
| `/trust/CUST-101` | At-risk customer profile |
| `/economics` | ROI dashboard + live calculator |
| `/simulate` | Adversarial hardening simulator |
| `/network` | Cross-retailer fraud network map |

---

## 🎯 3-Minute Judge Demo Walkthrough

### Minute 1 — The Problem + The Mirror
1. Open `/` — explain the core tension: fraud systems are black boxes that hurt innocent customers
2. Click **"See the Mirror Demo"** → `/mirror/CLM-001`
3. Show the split screen: **"This is the same claim, same data, two different languages"**
   - Left: technical evidence trail (retailer)
   - Right: plain English, no accusation (customer)

### Minute 2 — The Fast Lane
1. Go to `/mirror/CLM-002` — confetti fires, instant approval
2. **"96% of legitimate customers get this. Zero friction. 0.8 seconds."**
3. Navigate to `/submit` — show the 3-step form with EXIF preview
4. Use Order ID `ORD-5001` → submit → watch it redirect to mirror

### Minute 3 — The Intelligence
1. Open `/timeline/RING-C` — play the 12-member identity fraud ring
2. **"This ring claimed ₹1.86 lakhs. Fraud Mirror would have caught it at claim #2."**
3. Open `/simulate` — toggle VPN + EXIF scrub → show score stays at 84
4. **"They can't defeat all 5 signals simultaneously."**
5. Quick flash: `/economics` → ROI calculator, `/network` → cross-retailer graph

---

## 🔬 The 5 Signal Architecture

All signals run **in parallel** via `Promise.all()`:

| Signal | Weight | What it checks |
|---|---|---|
| 📷 Image Forensics | 30% | EXIF metadata, GPS vs address, reverse image search, pixel manipulation |
| 🧾 Document Analysis | 25% | PDF font consistency, metadata vs printed dates, whitespace pixel patterns |
| 👤 Behavioural Pattern | 25% | Return rate, claim frequency, new-account-high-value, anomaly scoring |
| 🚚 Carrier Cross-Check | 15% | Delivery scan timestamp vs claim, signature, GPS delivery proof |
| 🕸️ Network Graph | 5% | Device/IP/address clustering, ring detection, organised fraud signals |

**Decision thresholds:**
- `0–30` → Auto-approve (fast lane if ≤25)
- `31–70` → Human review with pre-filled summary
- `71–100` → Auto-deny with documented evidence trail

---

## 🧬 The Core Tension This Solves

**Traditional fraud systems** create a binary: approve (and absorb fraud loss) OR flag (and lose innocent customers).

**Fraud Mirror** resolves this by:
1. **Explaining itself** — no black box, full evidence trail
2. **Speaking differently to each party** — technical to retailer, human to customer
3. **Fast-laning the innocent** — trusted customers never see friction
4. **Ring detection** — catches organised fraud at cluster level, not individual level

> *"The best fraud system is one that fraudsters know is there — and legitimate customers never know exists."*

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Vanilla CSS
- **Charts**: Recharts (bar, line, donut, radar)
- **Animations**: CSS animations + canvas-confetti
- **Network Graph**: Canvas 2D API
- **Data**: 100% mock JSON (no external DB)
- **Image forensics**: Mock EXIF (exifr ready for real integration)
- **Vision API**: Falls back to mock if no `GOOGLE_VISION_API_KEY`

---

## ⚙️ Setup

```bash
cd fraud-mirror
npm install
npm run dev
```

Optional — add Google Vision API key:
```bash
# .env.local
GOOGLE_VISION_API_KEY=your_key_here
```

---

## 📁 Key Files

```
app/
  page.tsx                   ← Landing
  submit/page.tsx            ← 3-step claim form
  mirror/[claimId]/page.tsx  ← THE MIRROR (signature feature)
  dashboard/page.tsx         ← Retailer ops
  timeline/[ringId]/page.tsx ← Fraud ring replay
  trust/[customerId]/page.tsx← Trust score profile
  economics/page.tsx         ← ROI dashboard
  simulate/page.tsx          ← Adversarial simulator
  network/page.tsx           ← Cross-retailer graph
  api/analyse/route.ts       ← Main engine (5 parallel signals)

lib/
  riskScorer.ts             ← Weighted scoring (30/25/25/15/5)
  imageForensics.ts         ← Signal A
  documentAnalyser.ts       ← Signal B
  behaviourEngine.ts        ← Signal C
  carrierChecker.ts         ← Signal D
  networkGraph.ts           ← Signal E

data/
  claims.json               ← 20 mock claims (all 6 fraud types)
  customers.json            ← 15 mock customer profiles
  rings.json                ← 3 fraud rings (A, B, C)
  carrier.json              ← 20 delivery records
  fraud-dna.json            ← 10 fraud DNA profiles
```

---

Built with ❤️ for the hackathon. **Fraud Mirror** — because innocent customers deserve to know why.
