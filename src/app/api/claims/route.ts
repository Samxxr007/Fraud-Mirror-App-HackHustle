import { NextRequest, NextResponse } from 'next/server';
import claimsData from '../../../data/claims.json';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const decision = searchParams.get('decision');
  const claimType = searchParams.get('claimType');
  const limit = parseInt(searchParams.get('limit') ?? '20');

  let claims: any[] = [...claimsData];

  try {
    const q = query(collection(db, "claims"), orderBy("analysedAt", "desc"), firestoreLimit(20));
    const querySnapshot = await getDocs(q);
    const liveClaims = querySnapshot.docs.map(doc => doc.data() as any);
    // Put live claims at the top
    claims = [...liveClaims, ...claims];
  } catch (e) {
    console.warn("Firestore fetch error in API:", e);
  }

  if (decision) claims = claims.filter((c) => c.decision === decision);
  if (claimType) claims = claims.filter((c) => c.claimType === claimType);

  return NextResponse.json(claims.slice(0, limit));
}
