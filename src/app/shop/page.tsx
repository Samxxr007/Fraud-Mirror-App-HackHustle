'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Package, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

const PRODUCTS = [
    { id: 'p1', title: 'AirPods Pro (2nd Gen)', price: 249, category: 'Electronics', image: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=600', rating: 4.8 },
    { id: 'p2', title: 'Premium Leather Wallet', price: 49, category: 'Accessories', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', rating: 4.5 },
    { id: 'p3', title: 'Mechanical Keyboard Pro', price: 129, category: 'Electronics', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600', rating: 4.7 },
    { id: 'p4', title: 'Designer Sunglasses', price: 199, category: 'Accessories', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', rating: 4.9 },
];

export default function ShopPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [view, setView] = useState<'shop' | 'orders'>('shop');

    // Load mock orders
    useEffect(() => {
        const saved = sessionStorage.getItem('shop_orders');
        if (saved) setOrders(JSON.parse(saved));
    }, []);

    const saveOrders = (newOrders: any[]) => {
        setOrders(newOrders);
        sessionStorage.setItem('shop_orders', JSON.stringify(newOrders));
    };

    const addToCart = (product: any) => {
        setCart([...cart, product]);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        const newOrder = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            items: [...cart],
            total: cart.reduce((acc, p) => acc + p.price, 0),
            status: 'Pending',
            createdAt: new Date().toISOString(),
            deliveredAt: null,
            scanDeadline: null,
            scanStatus: 'Missing'
        };
        saveOrders([newOrder, ...orders]);
        setCart([]);
        setView('orders');
    };

    const simulateDelivery = (orderId: string) => {
        const deliveredAt = new Date();
        const deadline = new Date(deliveredAt.getTime() + 20 * 60000); // 20 mins later
        const newOrders = orders.map(o => 
            o.id === orderId 
            ? { ...o, status: 'Delivered', deliveredAt: deliveredAt.toISOString(), scanDeadline: deadline.toISOString() } 
            : o
        );
        saveOrders(newOrders);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9' }}>
            {/* Header */}
            <nav style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>
                    Shop<span style={{ color: '#3b82f6' }}>Sphere</span>
                </div>
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <button onClick={() => setView('shop')} style={{ background: 'none', border: 'none', color: view === 'shop' ? '#3b82f6' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}>Shop</button>
                    <button onClick={() => setView('orders')} style={{ background: 'none', border: 'none', color: view === 'orders' ? '#3b82f6' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}>My Orders</button>
                    <div style={{ position: 'relative' }}>
                        <ShoppingCart size={22} style={{ color: '#94a3b8' }} />
                        {cart.length > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: '#3b82f6', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10 }}>{cart.length}</span>}
                    </div>
                </div>
            </nav>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
                {view === 'shop' ? (
                    <>
                        <div style={{ marginBottom: 40 }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 8 }}>Discover Premium Excellence</h1>
                            <p style={{ color: '#64748b' }}>Curated products with built-in Forensic Security.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                            {PRODUCTS.map(p => (
                                <div key={p.id} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', transition: 'transform 0.2s' }}>
                                    <img src={p.image} alt={p.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                                    <div style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase' }}>{p.category}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: '0.85rem' }}><Star size={14} fill="#f59e0b" /> {p.rating}</div>
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>{p.title}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>${p.price}</span>
                                            <button onClick={() => addToCart(p)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>Add to Bag</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {cart.length > 0 && (
                            <div style={{ marginTop: 60, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
                                <h2 style={{ marginBottom: 16 }}>Ready to checkout?</h2>
                                <button onClick={handleCheckout} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 40px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>
                                    Secure Checkout (Stripe Demo)
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="animate-fade-in">
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32 }}>Order History</h1>
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>No orders found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {orders.map(o => {
                                    const isDelivered = o.status === 'Delivered';
                                    const isExpired = o.scanDeadline && new Date() > new Date(o.scanDeadline);
                                    
                                    return (
                                        <div key={o.id} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                    <span style={{ fontWeight: 800, color: '#3b82f6' }}>{o.id}</span>
                                                    <span style={{ 
                                                        fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: 4,
                                                        background: isDelivered ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                                        color: isDelivered ? '#22c55e' : '#f59e0b',
                                                        border: `1px solid ${isDelivered ? '#22c55e' : '#f59e0b'}40`
                                                    }}>{o.status.toUpperCase()}</span>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                                    {o.items.length} item{o.items.length > 1 ? 's' : ''} • ${o.total}
                                                </div>
                                                {isDelivered && (
                                                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                                                        <Clock size={14} color={isExpired ? '#ef4444' : '#3b82f6'} />
                                                        <span style={{ color: isExpired ? '#ef4444' : '#3b82f6', fontWeight: 600 }}>
                                                            {isExpired ? '20-Min Window Expired' : 'Secure within 20 mins of delivery'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                {!isDelivered ? (
                                                    <button onClick={() => simulateDelivery(o.id)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                                                        Simulate Delivery
                                                    </button>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: 12 }}>
                                                        {o.scanStatus === 'Verified' ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 700, fontSize: '0.9rem' }}>
                                                                    <ShieldCheck size={18} /> FINGERPRINT SECURED
                                                                </div>
                                                                <button 
                                                                    onClick={() => window.location.href = `/submit?orderId=${o.id}`}
                                                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                                                                    Request Return
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                disabled={isExpired}
                                                                onClick={() => window.location.href = `/delivery-scan/${o.id}`}
                                                                style={{ 
                                                                    background: isExpired ? '#334155' : '#3b82f6', 
                                                                    color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', 
                                                                    fontWeight: 700, cursor: isExpired ? 'not-allowed' : 'pointer',
                                                                    display: 'flex', alignItems: 'center', gap: 8
                                                                }}>
                                                                <ShieldCheck size={18} /> Perform Secure Scan
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Forensic Footer */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 20px', marginTop: 100, background: '#020617' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 8 }}>Secured by Fraud Mirror</div>
                        <p style={{ color: '#475569', fontSize: '0.9rem' }}>Real-time forensic verification for every shipment.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)', color: '#22c55e', fontSize: '0.8rem', fontWeight: 700 }}>✓ 2FVV ACTIVE</div>
                        <div style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 700 }}>✓ AI CROSS-CHECK</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
