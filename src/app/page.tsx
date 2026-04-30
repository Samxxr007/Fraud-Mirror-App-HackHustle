'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart, Star, ShieldCheck, Clock, CheckCircle2, User, LogOut, Package, Truck, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

const PRODUCTS = [
    { id: 'p1', title: 'AirPods Pro (2nd Gen)', price: 249, category: 'Electronics', image: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=600', rating: 4.8 },
    { id: 'p2', title: 'Premium Leather Wallet', price: 49, category: 'Accessories', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', rating: 4.5 },
    { id: 'p3', title: 'Mechanical Keyboard Pro', price: 129, category: 'Electronics', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600', rating: 4.7 },
    { id: 'p4', title: 'Designer Sunglasses', price: 199, category: 'Accessories', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', rating: 4.9 },
];

export default function CombinedDemo() {
    // State
    const [view, setView] = useState<'shop' | 'orders' | 'cart' | 'auth'>('shop');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cart, setCart] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [activeOrder, setActiveOrder] = useState<string | null>(null);

    // Load Data
    useEffect(() => {
        const savedOrders = sessionStorage.getItem('shop_orders');
        const savedUser = sessionStorage.getItem('shop_user');
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        if (savedUser) setIsLoggedIn(true);
    }, []);

    const saveOrders = (newOrders: any[]) => {
        setOrders(newOrders);
        sessionStorage.setItem('shop_orders', JSON.stringify(newOrders));
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
        sessionStorage.setItem('shop_user', 'demo-user');
        setView('shop');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        sessionStorage.removeItem('shop_user');
        setView('shop');
    };

    const handleCheckout = () => {
        if (!isLoggedIn) { setView('auth'); return; }
        const newOrder = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            items: [...cart],
            total: cart.reduce((acc, p) => acc + p.price, 0),
            status: 'Processing',
            createdAt: new Date().toISOString(),
            deliveredAt: null,
            scanDeadline: null,
            scanStatus: 'Pending'
        };
        saveOrders([newOrder, ...orders]);
        setCart([]);
        setView('orders');
    };

    const simulateDelivery = (orderId: string) => {
        const deliveredAt = new Date();
        const deadline = new Date(deliveredAt.getTime() + 20 * 60000);
        const newOrders = orders.map(o => 
            o.id === orderId 
            ? { ...o, status: 'Delivered', deliveredAt: deliveredAt.toISOString(), scanDeadline: deadline.toISOString() } 
            : o
        );
        saveOrders(newOrders);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* ── NAVBAR ── */}
            <nav style={{ 
                padding: '16px 40px', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(16px)', 
                position: 'sticky', top: 0, zIndex: 1000 
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em', cursor: 'pointer' }} onClick={() => setView('shop')}>
                    Shop<span style={{ color: '#3b82f6' }}>Sphere</span>
                </div>

                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <button onClick={() => setView('shop')} style={{ background: 'none', border: 'none', color: view === 'shop' ? '#3b82f6' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}>Products</button>
                    <button onClick={() => setView('orders')} style={{ background: 'none', border: 'none', color: view === 'orders' ? '#3b82f6' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}>Track Orders</button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingLeft: 20, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setView('cart')}>
                            <ShoppingBag size={22} style={{ color: view === 'cart' ? '#3b82f6' : '#94a3b8' }} />
                            {cart.length > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: '#3b82f6', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10, fontWeight: 900 }}>{cart.length}</span>}
                        </div>

                        {isLoggedIn ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={18} color="#3b82f6" />
                                </div>
                                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><LogOut size={18} /></button>
                            </div>
                        ) : (
                            <button onClick={() => setView('auth')} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer' }}>Sign In</button>
                        )}
                    </div>
                </div>
            </nav>

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
                
                {/* ── SHOP VIEW ── */}
                {view === 'shop' && (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: 60, textAlign: 'center' }}>
                            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.03em' }}>Curated Excellence.</h1>
                            <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Every purchase secured by **Forensic Visual DNA** verification.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
                            {PRODUCTS.map(p => (
                                <div key={p.id} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                                    <div style={{ position: 'relative' }}>
                                        <img src={p.image} alt={p.title} style={{ width: '100%', height: 260, objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(3,7,18,0.6)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
                                            FORENSIC READY
                                        </div>
                                    </div>
                                    <div style={{ padding: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{p.category}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: '0.9rem' }}><Star size={14} fill="#f59e0b" /> {p.rating}</div>
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20 }}>{p.title}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>${p.price}</span>
                                            <button 
                                                onClick={() => { setCart([...cart, p]); setView('cart'); }} 
                                                style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                                                Add to Bag
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CART VIEW ── */}
                {view === 'cart' && (
                    <div style={{ maxWidth: 600, margin: '0 auto' }} className="animate-fade-in">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 40 }}>Your Shopping Bag</h2>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛍️</div>
                                <h3 style={{ color: '#64748b' }}>Your bag is empty</h3>
                                <button onClick={() => setView('shop')} style={{ marginTop: 24, color: '#3b82f6', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Continue Shopping →</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {cart.map((item, i) => (
                                    <div key={i} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, display: 'flex', gap: 20, alignItems: 'center' }}>
                                        <img src={item.image} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontWeight: 800 }}>{item.title}</h4>
                                            <p style={{ color: '#64748b' }}>${item.price}</p>
                                        </div>
                                        <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                                    </div>
                                ))}
                                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 900, marginBottom: 32 }}>
                                        <span>Total</span>
                                        <span>${cart.reduce((a, b) => a + b.price, 0)}</span>
                                    </div>
                                    <button 
                                        onClick={handleCheckout}
                                        style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 16, padding: '20px', fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer' }}>
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── LOGIN VIEW ── */}
                {view === 'auth' && (
                    <div style={{ maxWidth: 400, margin: '100px auto', background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 40, textAlign: 'center' }} className="animate-fade-in">
                        <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <ShieldCheck size={32} color="#3b82f6" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>Welcome to ShopSphere</h2>
                        <p style={{ color: '#64748b', marginBottom: 32 }}>Sign in to access your forensic-secured orders.</p>
                        <button 
                            onClick={handleLogin}
                            style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}>
                            Sign In with Demo Account
                        </button>
                        <p style={{ marginTop: 24, fontSize: '0.8rem', color: '#475569' }}>Experimental Build — Forensic Auth Active</p>
                    </div>
                )}

                {/* ── ORDERS / TRACKING VIEW ── */}
                {view === 'orders' && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 40 }}>Order Tracking</h2>
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>No orders found.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 40 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {orders.map(o => (
                                        <div 
                                            key={o.id} 
                                            onClick={() => setActiveOrder(o.id)}
                                            style={{ 
                                                background: '#0f172a', 
                                                border: `2px solid ${activeOrder === o.id ? '#3b82f6' : 'rgba(255,255,255,0.05)'}`, 
                                                borderRadius: 24, padding: 24, cursor: 'pointer', transition: 'all 0.2s' 
                                            }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <Package size={20} color="#3b82f6" />
                                                    <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{o.id}</span>
                                                </div>
                                                <span style={{ 
                                                    fontSize: '0.7rem', fontWeight: 900, padding: '6px 12px', borderRadius: 99,
                                                    background: o.status === 'Delivered' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                                                    color: o.status === 'Delivered' ? '#22c55e' : '#3b82f6'
                                                }}>{o.status.toUpperCase()}</span>
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                {o.items.length} items • Total: ${o.total}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Active Order Sidebar */}
                                <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32, position: 'sticky', top: 120, height: 'fit-content' }}>
                                    {!activeOrder ? (
                                        <p style={{ textAlign: 'center', color: '#64748b' }}>Select an order to track</p>
                                    ) : (() => {
                                        const o = orders.find(ord => ord.id === activeOrder);
                                        const isDelivered = o?.status === 'Delivered';
                                        return (
                                            <>
                                                <h3 style={{ marginBottom: 32, fontWeight: 900 }}>Tracking: {activeOrder}</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>
                                                    <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.05)' }} />
                                                    
                                                    <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={14} color="#fff" /></div>
                                                        <div><div style={{ fontWeight: 700 }}>Order Confirmed</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(o!.createdAt).toLocaleTimeString()}</div></div>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: isDelivered ? '#3b82f6' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isDelivered ? <CheckCircle2 size={14} color="#fff" /> : <Truck size={14} color="#94a3b8" />}</div>
                                                        <div><div style={{ fontWeight: 700, color: isDelivered ? '#fff' : '#64748b' }}>Out for Delivery</div></div>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: isDelivered ? '#22c55e' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isDelivered && <CheckCircle2 size={14} color="#fff" />}</div>
                                                        <div><div style={{ fontWeight: 700, color: isDelivered ? '#22c55e' : '#64748b' }}>Delivered</div></div>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {!isDelivered ? (
                                                        <button 
                                                            onClick={() => simulateDelivery(activeOrder)}
                                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px', fontWeight: 800, cursor: 'pointer' }}>
                                                            Simulate Handover
                                                        </button>
                                                    ) : (
                                                        <div>
                                                            {o?.scanStatus === 'Verified' ? (
                                                                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                                                                    <div style={{ color: '#22c55e', fontWeight: 900, marginBottom: 8 }}>✓ FINGERPRINT SECURED</div>
                                                                    <button 
                                                                        onClick={() => window.location.href = `/submit?orderId=${o.id}`}
                                                                        style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>
                                                                        Request Return →
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => window.location.href = `/delivery-scan/${o!.id}`}
                                                                    style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                                                    <ShieldCheck size={18} /> Secure with 2FVV
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Forensic Footer */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 20px', marginTop: 100, background: '#020617' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 8 }}>Secured by Fraud Mirror</div>
                            <p style={{ color: '#475569', fontSize: '0.9rem' }}>Real-time forensic verification for every shipment.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)', color: '#22c55e', fontSize: '0.8rem', fontWeight: 700 }}>✓ 2FVV ACTIVE</div>
                            <div style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 700 }}>✓ AI CROSS-CHECK</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                        <button onClick={() => { sessionStorage.clear(); window.location.reload(); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.5 }}>Reset Demo Environment (Clear All Data)</button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            `}</style>
        </div>
    );
}
