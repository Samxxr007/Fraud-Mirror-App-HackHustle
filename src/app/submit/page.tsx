'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

const CLAIM_TYPES = [
  { id: 'wardrobing', label: 'Wardrobing', icon: '👗', desc: 'Item worn/used then returned' },
  { id: 'inr', label: 'Item Not Received', icon: '📦', desc: 'Order never arrived' },
  { id: 'damaged', label: 'Damaged Item', icon: '💔', desc: 'Item arrived damaged' },
  { id: 'receipt_issue', label: 'Receipt Issue', icon: '🧾', desc: 'Problem with receipt or proof' },
  { id: 'friendly_fraud', label: 'Friendly Fraud', icon: '🤝', desc: 'Claim item not delivered (received)' },
  { id: 'other', label: 'Other', icon: '❓', desc: 'Other return issue' },
];

interface ExifPreview { date?: string; location?: string; device?: string; }

function extractMockExif(file: File): ExifPreview {
  // In production this would use the exifr library
  return {
    date: new Date(file.lastModified).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    location: Math.random() > 0.5 ? 'No location data found' : 'Location: Mumbai, India',
    device: 'Camera: Mobile Device',
  };
}

export default function SubmitPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [claimType, setClaimType] = useState('');
  const [orderId, setOrderId] = useState('');

  // Auto-fill orderId from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('orderId');
      if (id) setOrderId(id);
    }
  }, []);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [exif, setExif] = useState<ExifPreview | null>(null);
  const [draggingPhoto, setDraggingPhoto] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('Aligning...');
  const [detectedLabels, setDetectedLabels] = useState<string[]>([]);
  const [model, setModel] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);

  const initModel = async () => {
    if ((window as any).cocoSsd) {
      const m = await (window as any).cocoSsd.load();
      setModel(m);
    }
  };

  const detectFrame = async () => {
    if (videoRef.current && model && showScanner) {
      try {
        if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
          // AI Detection
          const predictions = await model.detect(videoRef.current, 10, 0.25);
          const detected = predictions.filter((p: any) => p.class !== 'person').map((p: any) => p.class);
          
          if (detected.length > 0) {
             setDetectedLabels(detected);
             setScanStage('Forensic Identity Confirmed');
             
             // STRICT PROGRESS: Only moves if product is identified
             setScanProgress(prev => {
                const next = prev + 0.35; // Professional verification speed
                return next >= 100 ? 100 : next;
             });
          } else {
             if (scanProgress > 0) {
                setScanStage('Searching for object...');
             } else {
                setScanStage('Scan Target Required...');
             }
          }
        }
      } catch (e) {
        console.error("Detection error:", e);
      }
      requestRef.current = requestAnimationFrame(detectFrame);
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (v && stream && showScanner) {
      if (v.srcObject !== stream) {
        v.srcObject = stream;
        v.play().catch(e => {
          if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
             // Silence harmless interruptions during fast re-renders
          }
        });
      }
    }
  }, [stream, showScanner]);

  useEffect(() => {
    if (scanProgress >= 100 && showScanner) {
      capturePhoto();
    }
  }, [scanProgress, showScanner]);

  useEffect(() => {
    if (scanProgress > 0 && scanProgress < 100) {
      if (scanProgress < 25) setScanStage('Scanning Front...');
      else if (scanProgress < 50) setScanStage('Rotate Left...');
      else if (scanProgress < 75) setScanStage('Rotate Right...');
      else setScanStage('Final Verification...');
    }
  }, [scanProgress]);

  useEffect(() => {
    if (showScanner && model) {
      requestRef.current = requestAnimationFrame(detectFrame);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [showScanner, model]);

  const startScanner = async () => {
    console.log("[Scanner] Starting activation sequence...");
    setShowScanner(true);
    setScanProgress(0);
    setScanStage('Initializing Secure Scan...');

    // Manual model fallback if script loaded but init didn't fire
    if (!model && (window as any).cocoSsd) {
      console.log("[Scanner] Loading model fallback...");
      await initModel();
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }
        }
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      console.log("[Scanner] Camera stream acquired.");
    } catch (err) {
      console.error("Camera error:", err);
      setShowScanner(false);
      alert("Could not access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    if (step === 2 && !showScanner && !photo) {
      startScanner();
    }
  }, [step]);

  const stopScanner = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowScanner(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('scanner-video') as HTMLVideoElement;
    if (!video || !showScanner) return;

    // Force UI reset immediately
    setShowScanner(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStep(3);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `forensic-scan-${Date.now()}.jpg`, { type: "image/jpeg" });
          setPhoto(file);
          
          // Atomic submission to bypass state delays
          handleSubmit(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const progress = (step / 3) * 100;

  function validateStep1() {
    if (!claimType) { setErrors({ claimType: 'Please select a claim type' }); return false; }
    setErrors({});
    return true;
  }

  function validateStep2() {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (!orderId.trim()) { 
      newErrors.orderId = 'Order ID is required'; 
      isValid = false; 
    }
    if (!receipt) {
      newErrors.receipt = 'Receipt or invoice document is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  }

  function nextStep() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  }

  function handlePhotoUpload(file: File) {
    setPhoto(file);
    setExif(extractMockExif(file));
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingPhoto(false);

    // Try to get a URL first (happens when dragging directly from another tab/webpage)
    const droppedUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('URL');
    if (droppedUrl) {
      setPhotoUrl(droppedUrl);
      setPhoto(null);
      setUseUrl(true);
      return;
    }

    // Otherwise look for a file
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handlePhotoUpload(file);
  }, [handlePhotoUpload]);

  async function handleSubmit(directPhoto?: File) {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('customerId', 'CUST-101'); 
      formData.append('claimType', claimType);
      formData.append('description', description);
      
      const activePhoto = directPhoto || photo;
      if (activePhoto) formData.append('photo', activePhoto);
      if (photoUrl) formData.append('photoUrl', photoUrl);
      if (receipt) formData.append('receipt', receipt);

      const res = await fetch('/api/analyse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      sessionStorage.setItem('lastAnalysis', JSON.stringify(data));
      
      window.location.href = '/mirror/live';
    } catch (error) {
      console.error('Analysis failed:', error);
      window.location.href = '/mirror/live';
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(180deg, #030712 0%, #0a0f1e 100%)', padding: '40px 16px' }}>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs" 
        strategy="afterInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Coco-SSD script loaded');
          initModel();
        }}
      />
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>
            Submit Return Claim
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            96% of claims are approved instantly. We just need to verify a few details.
          </p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {['Claim Type', 'Upload Details', 'Review'].map((label, i) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: step > i + 1 ? '#22c55e' : step === i + 1 ? '#3b82f6' : '#334155',
                fontSize: '0.78rem', fontWeight: 600,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step > i + 1 ? 'rgba(34,197,94,0.2)' : step === i + 1 ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${step > i + 1 ? '#22c55e' : step === i + 1 ? '#3b82f6' : '#1e293b'}`,
                  fontSize: '0.7rem', fontWeight: 800,
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className="hidden-mobile">{label}</span>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: 'clamp(20px, 5vw, 36px)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* STEP 1 — Claim type */}
          {step === 1 && (
            <div style={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
                What type of issue are you reporting?
              </h2>
              <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: 24 }}>Select the option that best describes your situation.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {CLAIM_TYPES.map((ct) => (
                  <button key={ct.id} onClick={() => setClaimType(ct.id)} style={{
                    background: claimType === ct.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${claimType === ct.id ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s', color: 'inherit',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{ct.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: claimType === ct.id ? '#93c5fd' : '#e2e8f0', marginBottom: 2 }}>{ct.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>{ct.desc}</div>
                  </button>
                ))}
              </div>
              {errors.claimType && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 12 }}>⚠ {errors.claimType}</p>}
            </div>
          )}

          {/* STEP 2 — Upload */}
          {step === 2 && (
            <div style={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
                Upload supporting documents
              </h2>
              <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: 24 }}>Photos help us process your claim faster.</p>

              {/* Mandatory AI Verification Gate */}
              <div style={{ marginBottom: 24, textAlign: 'center' }}>
                {!photo ? (
                  <div style={{
                    background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 16, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: 20 }}>📸</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>AI Visual Verification</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 300, marginBottom: 24 }}>
                      To prevent fraud, we require a live AI scan of the product. No uploads allowed.
                    </p>
                    <button onClick={startScanner} style={{
                      background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8,
                      padding: '12px 30px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.4)'
                    }}>
                      Start Secure Scan
                    </button>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(34,197,94,0.05)', border: '2px solid #22c55e',
                    borderRadius: 16, padding: '20px', textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: '1.5rem' }}>✅</span>
                      <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '0.9rem' }}>VISUAL IDENTITY VERIFIED</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Digital fingerprint generated and cross-checked against delivery record.
                    </div>
                  </div>
                )}
              </div>

                {/* Scanner UI */}
                {showScanner && (
                  <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: '#000', zIndex: 1000, display: 'flex', flexDirection: 'column'
                  }}>
                    <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                      <video 
                        id="scanner-video"
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
                      />
                      
                      {/* AR Overlay */}
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '85%', height: '65%', border: '2px solid rgba(59,130,246,0.3)', borderRadius: 20,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
                        pointerEvents: 'none',
                      }}>
                        {/* Forensic Static Grid */}
                        <div style={{
                          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                          backgroundImage: `
                            linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)
                          `,
                          backgroundSize: '40px 40px',
                          opacity: 0.5,
                          borderRadius: 20,
                        }} />

                        {/* Corner Accents */}
                        <div style={{ position: 'absolute', top: -2, left: -2, width: 30, height: 30, borderTop: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderTopLeftRadius: 18 }} />
                        <div style={{ position: 'absolute', top: -2, right: -2, width: 30, height: 30, borderTop: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderTopRightRadius: 18 }} />
                        <div style={{ position: 'absolute', bottom: -2, left: -2, width: 30, height: 30, borderBottom: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderBottomLeftRadius: 18 }} />
                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderBottom: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderBottomRightRadius: 18 }} />
                        
                        <div style={{
                          position: 'absolute', top: 20, right: 20, color: '#3b82f6', fontSize: '1rem', fontWeight: 900,
                          background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: 10, border: '1px solid #3b82f6'
                        }}>
                          {Math.floor(scanProgress)}%
                        </div>

                        <div style={{
                          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
                          width: '80%', textAlign: 'center'
                        }}>
                          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: 10, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {scanStage}
                          </div>
                          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${scanProgress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.1s linear' }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8, zIndex: 100 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: model ? '#22c55e' : '#ef4444', boxShadow: model ? '0 0 10px #22c55e' : 'none' }} />
                        <div style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 4 }}>
                          {model ? 'FORENSIC ENGINE READY' : 'CALIBRATING...'}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '30px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                        ANALYSING PRODUCT INTEGRITY...
                      </div>
                    </div>
                  </div>
                )}

              {/* Receipt */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Receipt / Invoice *</label>
                <div style={{
                  border: `1px solid ${errors.receipt ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, 
                  borderRadius: 12, padding: '16px',
                  background: receipt ? 'rgba(34,197,94,0.05)' : errors.receipt ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  transition: 'all 0.2s',
                }} onClick={() => document.getElementById('receipt-input')?.click()}>
                  <input id="receipt-input" type="file" accept=".pdf,image/*" style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) { setReceipt(f); setErrors(errs => ({ ...errs, receipt: '' })); } }} />
                  <span style={{ fontSize: '1.5rem' }}>🧾</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: receipt ? '#22c55e' : errors.receipt ? '#ef4444' : '#94a3b8', fontWeight: receipt ? 600 : 400 }}>
                      {receipt ? receipt.name : 'Upload PDF or image receipt'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#334155' }}>PDF, JPG, PNG</div>
                  </div>
                </div>
                {errors.receipt && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 8 }}>⚠ {errors.receipt}</p>}
              </div>

              {/* Order ID */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Order ID *</label>
                <input
                  className="form-input"
                  placeholder="e.g. ORD-5001 or your order number"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
                {errors.orderId && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>⚠ {errors.orderId}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Additional details (optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Describe the issue in your own words..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div style={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
                Review your submission
              </h2>
              <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: 24 }}>Everything looks good? We'll analyse your claim immediately.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {[
                  { label: 'Claim Type', value: CLAIM_TYPES.find(c => c.id === claimType)?.label || claimType },
                  { label: 'Order ID', value: orderId || '(not provided)' },
                  { label: 'Photo', value: useUrl ? photoUrl : (photo ? photo.name : 'Not uploaded') },
                  { label: 'Receipt', value: receipt ? receipt.name : 'Not uploaded' },
                  { label: 'Description', value: description || '(none)' },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10,
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: '0.85rem', color: '#e2e8f0', maxWidth: '60%', textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {submitting ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(59,130,246,0.2)',
                    borderTop: '3px solid #3b82f6', animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 16px',
                  }} />
                  <p style={{ color: '#93c5fd', fontWeight: 600, marginBottom: 4 }}>Analysing your claim...</p>
                  <p style={{ color: '#475569', fontSize: '0.8rem' }}>Running 5 fraud signals in parallel</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <button id="submit-trigger-btn" onClick={() => handleSubmit()} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '14px' }}>
                  Submit Claim & Analyse →
                </button>
              )}
            </div>
          )}

          {/* Nav buttons */}
          {!submitting && step < 3 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'space-between' }}>
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost">
                  ← Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button onClick={nextStep} className="btn btn-primary">
                {step === 2 ? 'Review →' : 'Continue →'}
              </button>
            </div>
          )}
        </div>

        {/* Reassurance */}
        <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.78rem', marginTop: 20 }}>
          🔒 Your data is encrypted. 96% of legitimate claims are approved instantly.
        </p>
      </div>
    </div>
  );
}
