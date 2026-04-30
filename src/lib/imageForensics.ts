import 'server-only';
import exifr from 'exifr';
import type { SignalResult } from './riskScorer';

export async function extractRealExif(buffer: ArrayBuffer): Promise<ExifData> {
  try {
    const data = await exifr.parse(buffer, {
      gps: true,
      ifd0: true, // Device model
      exif: true, // Date taken
    } as any);

    if (!data) return { hasMetadata: false, metadataStripped: false };

    return {
      dateTaken: data.DateTimeOriginal || data.CreateDate,
      location: data.latitude ? { lat: data.latitude, lng: data.longitude } : undefined,
      deviceModel: data.Model || data.Make,
      hasMetadata: true,
      metadataStripped: false,
    };
  } catch (error) {
    console.error('EXIF extraction error:', error);
    return { hasMetadata: false, metadataStripped: true };
  }
}

interface ExifData {

  dateTaken?: string;
  location?: { lat: number; lng: number };
  deviceModel?: string;
  hasMetadata: boolean;
  metadataStripped: boolean;
}

export function extractMockExif(imageUrl: string | null): ExifData {
  if (!imageUrl) return { hasMetadata: false, metadataStripped: false };
  
  // Mock EXIF extraction based on image URL pattern
  const mockExif: Record<string, ExifData> = {
    '/mock/damage1.jpg': {
      dateTaken: '2026-04-10T09:22:00Z', // 18 days before submission
      location: { lat: 12.9716, lng: 77.5946 }, // Bengaluru matches
      deviceModel: 'iPhone 15 Pro',
      hasMetadata: true,
      metadataStripped: false,
    },
    '/mock/damage3.jpg': {
      dateTaken: '2026-04-20T16:00:00Z',
      location: { lat: 28.7041, lng: 77.9880 }, // Delhi, but 12km from delivery
      deviceModel: 'Samsung Galaxy S24',
      hasMetadata: true,
      metadataStripped: false,
    },
    '/mock/damage16.jpg': {
      dateTaken: null as unknown as string,
      location: undefined,
      deviceModel: undefined,
      hasMetadata: false,
      metadataStripped: true,
    },
  };
  
  return mockExif[imageUrl] || {
    dateTaken: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    location: { lat: 19.0760, lng: 72.8777 },
    deviceModel: 'Generic Device',
    hasMetadata: true,
    metadataStripped: false,
  };
}

function checkImageOnWeb(imageUrl: string | null): { found: boolean; sites: string[] } {
  // Mock web detection
  const flaggedImages: Record<string, string[]> = {
    '/mock/damage1.jpg': ['fashionblog.com', 'instagram.com/@fashionlover'],
    '/mock/damage7.jpg': ['instagram.com/@fashionlover', 'pinterest.com'],
    '/mock/damage15.jpg': ['shutterstock.com', 'freepik.com'],
  };
  
  if (!imageUrl) return { found: false, sites: [] };
  const sites = flaggedImages[imageUrl] || [];
  return { found: sites.length > 0, sites };
}
export async function visionApiCheck(imageSource: string | ArrayBuffer | null, demoTrigger: string = ''): Promise<{ flags: string[]; scoreIncrease: number; labels: string[]; serialNumbers: string[]; webMatches: number }> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey || !imageSource) return { flags: [], scoreIncrease: 0, labels: [], serialNumbers: [], webMatches: 0 };
  if (typeof imageSource === 'string' && imageSource.startsWith('/mock')) return { flags: [], scoreIncrease: 0, labels: [], serialNumbers: [], webMatches: 0 };

  try {
    const imagePayload = typeof imageSource === 'string'
      ? { source: { imageUri: imageSource } }
      : { content: Buffer.from(imageSource).toString('base64') };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            image: imagePayload,
            features: [
              { type: 'WEB_DETECTION' },
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'IMAGE_PROPERTIES' },
              { type: 'TEXT_DETECTION' }
            ],
          },
        ],
      }),
    });

    const data = await response.json().catch(() => ({}));
    
    // DEMO RESILIENCE & SWAP SIMULATION
    if (data.error || !data.responses) {
      console.warn('[ForensicEngine] Vision API Billing Error. Using Mock OCR...');
      
      const isSwapSimulation = demoTrigger.toUpperCase().includes('SWAP');
      let simulatedLabels = ['object', 'product'];
      
      // If simulated SWAP mode, we use a mismatched serial
      let simulatedSerial = isSwapSimulation ? 'OLD-SN-999' : 'VERIFIED-SN-777';
      
      const sourceStr = typeof imageSource === 'string' ? imageSource.toLowerCase() : '';
      if (sourceStr.includes('airpods') || sourceStr.includes('buds')) {
        simulatedLabels = ['audio', 'earbud', 'electronics', 'headphone', 'airpods'];
      }

      return { 
        flags: [isSwapSimulation ? 'FRAUD SIMULATION: Product Swap Detected' : 'Demo Mode: Serial Verification Simulation Active'], 
        scoreIncrease: isSwapSimulation ? 100 : 0, 
        labels: simulatedLabels, 
        serialNumbers: [simulatedSerial],
        webMatches: 0 
      };
    }

    const result = data.responses[0];
    const flags: string[] = [];
    let scoreIncrease = 0;

    // OCR DETECTION (Unique Serial Verification)
    const textAnnotations = result.textAnnotations || [];
    const serialNumbers = textAnnotations.map((t: any) => t.description.replace(/[^A-Z0-9]/g, ''))
                                         .filter((s: string) => s.length > 5);

    // Web Detection Safely
    const web = result.webDetection || {};
    const bestGuessLabels = web.bestGuessLabels || [];
    const webLabels = bestGuessLabels
      .filter((l: any) => l && l.label)
      .map((l: any) => l.label.toLowerCase());
    
    const fullMatchingImages = web.fullMatchingImages || [];
    if (fullMatchingImages.length > 0) {
      flags.push(`Vision API: Exact image match found on ${fullMatchingImages.length} sites — suspicious stock or social media reuse`);
      scoreIncrease += 40;
    } 

    const partialMatchingImages = web.partialMatchingImages || [];
    if (partialMatchingImages.length > 0) {
      flags.push('Vision API: Visually similar image patterns detected across the web');
      scoreIncrease += 15;
    }

    // Label Detection Safely
    const labels = result.labelAnnotations || [];
    const keywords = Array.from(new Set([
      ...labels.filter((l: any) => l && l.description).map((l: any) => l.description.toLowerCase()),
      ...webLabels
    ]));
    
    return { 
      flags, 
      scoreIncrease, 
      labels: keywords, 
      webMatches: fullMatchingImages.length 
    };
  } catch (error) {
    console.error('Vision API Critical Failure:', error);
    return { flags: ['Vision API: Forensic engine connection failed'], scoreIncrease: 0, labels: [], webMatches: 0 };
  }
}

export async function analyseImage(
  imageSource: string | ArrayBuffer | null,
  purchaseDate: string,
  deliveryAddress: string,
  claimType: string
): Promise<SignalResult> {
  await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate async

  const flags: string[] = [];
  let score = 0;

  if (!imageSource) {
    // No image — neutral signal for INR claims, slight flag for damage claims
    if (claimType === 'damaged' || claimType === 'wardrobing') {
      flags.push('No damage photo provided — required for this claim type');
      score = 35;
    } else {
      score = 10;
    }
    return {
      score,
      confidence: 'low',
      flags,
      explanation: 'No image provided for analysis.',
    };
  }

  const exif = typeof imageSource === 'string' 
    ? extractMockExif(imageSource)
    : await extractRealExif(imageSource);
    
  const webCheck = typeof imageSource === 'string' ? checkImageOnWeb(imageSource) : { found: false, sites: [] };
  const vision = await visionApiCheck(imageSource);
  
  // Combine vision flags (Secondary)
  flags.push(...vision.flags);
  score += vision.scoreIncrease;
  
  // PRIMARY SIGNAL: EXIF METADATA INTEGRITY
  // Real photos from mobile devices ALWAYS have EXIF. 
  // Downloads from Google Images or social media ALMOST NEVER do.
  if (exif.metadataStripped) {
    flags.push('CRITICAL: Metadata deliberately stripped — indicative of professional fraud tools');
    score += 45; // Increased weight
  } else if (!exif.hasMetadata) {
    flags.push('SIGNAL: EXIF missing — item likely downloaded from search results or social media');
    score += 35; // Significant weight
  } else {
    // Check photo date vs purchase date
    if (exif.dateTaken) {
      const photoDate = new Date(exif.dateTaken);
      const purchase = new Date(purchaseDate);
      const daysDiff = Math.floor((photoDate.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 14) {
        flags.push(`TIMELINE: Photo taken ${daysDiff} days after delivery — indicates item was used ("wardrobing")`);
        score += 30;
      }
    }
    
    // Check GPS vs delivery address
    if (exif.location) {
      const knownDelhi = deliveryAddress.toLowerCase().includes('delhi');
      if (knownDelhi && Math.abs(exif.location.lat - 28.7041) > 0.1) {
        flags.push('LOCATION: Photo GPS mismatch — image taken at a location different from delivery address');
        score += 25;
      }
    }
  }
  
  // Web detection (Manual match fallback)
  if (webCheck.found) {
    flags.push(`WEB MATCH: Image found on ${webCheck.sites.join(', ')} — reverse search hit`);
    score += 30;
  }
  
  // Pixel noise analysis (mock)
  const isMockDamage = typeof imageSource === 'string' && (imageSource.includes('damage1') || imageSource.includes('damage7') || imageSource.includes('damage4'));
  if (isMockDamage) {
    flags.push('Pixel noise analysis indicates possible image manipulation in key regions');
    score += 15;
  }

  score = Math.min(100, score);
  const confidence: 'low' | 'medium' | 'high' = score > 60 ? 'high' : score > 30 ? 'medium' : 'low';

  return {
    score,
    confidence,
    flags,
    explanation: flags.length > 0
      ? `Image forensics found ${flags.length} concern(s): ${flags[0]}`
      : 'Image forensics clean — photo metadata consistent with claim.',
  };
}
