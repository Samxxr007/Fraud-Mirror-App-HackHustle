import { NextRequest, NextResponse } from 'next/server';
import { analyseImage, visionApiCheck, extractRealExif, extractMockExif } from '../../../lib/imageForensics';
import { analyseDocuments } from '../../../lib/documentAnalyser';
import { analyseBehaviour } from '../../../lib/behaviourEngine';
import { checkCarrier } from '../../../lib/carrierChecker';
import { analyseNetwork } from '../../../lib/networkGraph';
import { calculateRiskScore } from '../../../lib/riskScorer';
import { db } from '../../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const photoFile = formData.get('photo') as File | null;
      let photoSource: string | ArrayBuffer | null = formData.get('photoUrl') as string || null;
      
      if (photoFile && photoFile.size > 0) {
        photoSource = await photoFile.arrayBuffer();
      }

      body = {
        orderId: formData.get('orderId'),
        customerId: formData.get('customerId'),
        claimType: formData.get('claimType'),
        description: formData.get('description'),
        imageSource: photoSource,
      };
    } else {
      body = await request.json();
    }

    const {
      claimId = 'CLM-' + Math.floor(Math.random() * 9000 + 1000),
      customerId = 'CUST-DEFAULT',
      orderId = 'ORD-DEFAULT',
      claimType = 'other',
      claimValue = 1000,
      imageSource = null,
      receiptUrl = null,
      deliveryAddress = 'Mumbai, India',
      purchaseDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      submittedAt = new Date().toISOString(),
    } = body;

    const [exif, vision] = await Promise.all([
      typeof imageSource === 'string' 
        ? extractMockExif(imageSource)
        : imageSource 
          ? extractRealExif(imageSource)
          : { hasMetadata: false, metadataStripped: false, dateTaken: undefined, location: undefined },
      visionApiCheck(imageSource, body.description)
    ]);

    // Deep Forensic Comparison (Delivery vs Return)
    let tamperDetected = false;
    let visualMatchScore = 0;
    
    try {
      // 1. Check Memory Cache First (Fast Fallback)
      const { forensicStore } = await import('../../../lib/forensicStore');
      const memoryBaseline = forensicStore.get(orderId);
      
      let baselineLabels = [];
      let baselineProductName = '';
      let baselineSerialNumbers = [];
      let foundBaseline = false;

      if (memoryBaseline) {
        baselineLabels = memoryBaseline.labels;
        baselineProductName = memoryBaseline.productName;
        baselineSerialNumbers = memoryBaseline.serialNumbers || [];
        foundBaseline = true;
      } else {
        // 2. Check Firestore (Original Store)
        const deliveryDoc = await getDoc(doc(db, "deliveries", orderId));
        if (deliveryDoc.exists()) {
          const data = deliveryDoc.data();
          baselineLabels = data.labels || [];
          baselineProductName = data.productName || '';
          baselineSerialNumbers = data.serialNumbers || [];
          foundBaseline = true;
        }
      }

      if (foundBaseline) {
        // 1. STRICT LABEL MATCHING (Jaccard Similarity)
        const currentLabels = vision.labels || [];
        const currentSerials = vision.serialNumbers || [];
        const intersection = baselineLabels.filter((l: string) => currentLabels.includes(l));
        const union = Array.from(new Set([...baselineLabels, ...currentLabels]));
        const matchRatio = union.length > 0 ? intersection.length / union.length : 0;

        // 2. BRAND IDENTITY CHECK (Deep Forensic)
        const suspiciousBrands = ['ptron', 'boat', 'noise', 'boult', 'mivi'];
        const detectedSuspiciousBrand = currentLabels.find(l => suspiciousBrands.some(b => l.includes(b)));
        const brandMismatch = detectedSuspiciousBrand && !baselineProductName.toLowerCase().includes(detectedSuspiciousBrand);

        // 3. CATEGORY VALIDATION (Fix for "Bowl" misidentification)
        const techKeywords = ['airpods', 'pro', 'buds', 'earphone', 'headphone', 'audio', 'electronics', 'keyboard'];
        const isTechProduct = techKeywords.some(kw => baselineProductName.toLowerCase().includes(kw));
        const visionDetectedTech = currentLabels.some(l => techKeywords.some(kw => l.includes(kw)) || l.includes('gadget') || l.includes('peripheral'));
        const categoryMismatch = isTechProduct && !visionDetectedTech && (currentLabels.includes('bowl') || currentLabels.includes('plate') || currentLabels.includes('frisbee'));

        // 4. SERIAL IDENTITY VERIFICATION (The "Same-Model Swap" Fix)
        const hasSerialData = (baselineSerialNumbers.length > 0 && currentSerials.length > 0);
        const serialMatch = currentSerials.some((s: string) => baselineSerialNumbers.includes(s));
        const serialMismatch = hasSerialData && !serialMatch;

        // 5. HYBRID SCORE NORMALIZATION (Fix for "Remote/Bowl/Frisbee" misidentification)
        // If the browser model misidentified the object at delivery (e.g. as a "frisbee"), 
        // but our high-quality Vision AI confirms it matches the tech category, we normalize the score.
        let finalMatchRatio = matchRatio;
        if (isTechProduct && visionDetectedTech && !brandMismatch && !serialMismatch) {
          finalMatchRatio = Math.max(matchRatio, 0.95); 
        }

        if (finalMatchRatio < 0.6 || brandMismatch || categoryMismatch || serialMismatch) { 
          tamperDetected = true;
          visualMatchScore = (brandMismatch || categoryMismatch || serialMismatch) ? 0.05 : Math.min(finalMatchRatio, 0.2); 
        } else {
          visualMatchScore = 0.96; 
        }
      } else {
        // No baseline found - high risk by default for new system
        visualMatchScore = 0.45;
      }
    } catch (e) { console.warn("Forensic lookup failed:", e); }

    const input = {
      userId: customerId,
      deviceId: 'device-123',
      ipAddress: '192.168.1.100',
      itemPrice: claimValue,
      deliveryAddress: deliveryAddress,
      deliveryDate: purchaseDate,
      photoCreationDate: exif.dateTaken || null,
      photoGPS: exif.location || null,
      deliveryGPS: { lat: 19.0760, lng: 72.8777 },
      isPixelPerfect: typeof imageSource === 'string' && imageSource.includes('stock'),
      priorReturns: 2,
      priorFraudFlags: 0,
      returnDaysSinceDelivery: 2,
      isPostHoliday: false,
      claimType: claimType,
      deliveryConfirmed: true,
      signatureObtained: false,
      claimAddress: deliveryAddress,
      labels: vision.labels,
      webMatches: vision.webMatches,
      visualMatchScore: visualMatchScore,
      tamperDetected: tamperDetected
    };

    const riskOutput = calculateRiskScore(input);
    
    // FINAL AUTOMATED GATE: Schedule or Block
    let finalDecision = riskOutput.finalScore < 40 ? 'SCHEDULED' : 'FORENSIC_BLOCK';
    
    // NUCLEAR OVERRIDE: If AI detected tampering, NO return allowed regardless of other scores
    if (tamperDetected || visualMatchScore < 0.6) {
      finalDecision = 'FORENSIC_BLOCK';
      riskOutput.finalScore = 100;
    }

    const result = {
      claimId,
      customerId,
      orderId,
      status: finalDecision,
      decision: finalDecision === 'SCHEDULED' ? 'Return Authorized & Scheduled' : 'Return Denied - Tampering Detected',
      riskScore: riskOutput.finalScore,
      analysis: {
        visualMatch: visualMatchScore * 100,
        tamperDetected: tamperDetected,
        signals: [
          { label: 'Visual Identity', description: 'DNA comparison with delivery baseline', score: tamperDetected ? 100 : 0 },
          { label: 'Behavioural Risk', description: 'Historical return and fraud patterns', score: riskOutput.signalBreakdown.B },
          { label: 'Metadata Sync', description: 'EXIF timing and metadata integrity', score: riskOutput.signalBreakdown.M },
          { label: 'Network Graph', description: 'Device and account association risk', score: riskOutput.signalBreakdown.N },
          { label: 'Geospatial Proof', description: 'GPS verification vs delivery address', score: riskOutput.signalBreakdown.G },
        ]
      },
      analysedAt: new Date().toISOString(),
    };

    // Background save (Non-blocking for demo performance)
    setDoc(doc(db, "claims", claimId), result).catch(() => {});

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}
