# HackHustle Challenge: Forensic DNA & Unit Identity

## Challenge Overview
The primary challenge in modern e-commerce is the **Same-Model Unit Swap**. Fraudsters purchase a new unit (e.g., AirPods Pro 2) and attempt to return an older, broken, or cloned unit of the same model.

## Acceptance Criteria
1.  **Visual DNA Matching**: The system must identify labels and features (color, shape, branding) with >60% Jaccard Similarity.
2.  **Serial Identity Verification**: The system must extract and match unique Serial Numbers (SN) via OCR between the delivery scan and return scan.
3.  **Nuclear Hard-Gate**: Any serial mismatch must trigger an immediate 100% risk score and block return authorization.

## Sample Input
*   **Order ID**: `ORD-4506`
*   **Baseline Serial**: `VERIFIED-SN-777`
*   **Return Scan Description**: `SWAP` (Demo Trigger)
*   **Expected Output**: `tamperDetected: true`, `visualMatchScore: 0.05`.

## Scoring
- **Accuracy**: 40%
- **Latency**: 20% (Sub-second Edge Detection)
- **Robustness**: 40% (Against lighting/angle variance)
