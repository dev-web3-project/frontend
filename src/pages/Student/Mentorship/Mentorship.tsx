import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getMenteeRequests,
    getMentorRequests,
    requestMentorship,
    updateMentorshipStatus,
} from "../../../services/api/gamification";

const STATUS_COLORS: Record<string, string> = {
    PENDING:   '#ffaf00',
    ACTIVE:    '#9fef00',
    COMPLETED: '#2cb5e8',
    REFUSED:   '#ff3e3e',
};

const Mentorship = () => {
    const [username, setUsername]       = useState('');
    const [myRequests, setMyRequests]   = useState<any[]>([]);
    const [mentorOf, setMentorOf]       = useState<any[]>([]);
    const [loading, setLoading]         = useState(true);
    const [activeTab, setActiveTab]     = useState<'sent' | 'received'>('sent');

    /* New request form */
    const [form, setForm] = useState({ mentorUsername: '', moduleId: '' });
    const [sending, setSending]   = useState(false);
    const [formMsg, setFormMsg]   = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const uname = stored ? (JSON.parse(stored).username || '') : '';
        setUsername(uname);
        if (!uname) { setLoading(false); return; }

        Promise.all([
            getMenteeRequests(uname),
            getMentorRequests(uname),
        ]).then(([sent, received]) => {
            setMyRequests(Array.isArray(sent) ? sent : []);
            setMentorOf(Array.isArray(received) ? received : []);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.mentorUsername || !form.moduleId) { setFormMsg('Tous les champs sont requis.'); return; }
        setSending(true); setFormMsg('');
        try {
            await requestMentorship({
                mentorUsername: form.mentorUsername,
                menteeUsername: username,
                moduleId: Number(form.moduleId),
            });
            setFormMsg('✅ Demande envoyée avec succès !');
            setForm({ mentorUsername: '', moduleId: '' });
            const updated = await getMenteeRequests(username);
            setMyRequests(Array.isArray(updated) ? updated : []);
        } catch {
            setFormMsg('❌ Erreur lors de l\'envoi. Vérifiez le nom d\'utilisateur du mentor.');
        } finally { setSending(false); }
    };

    const handleStatus = async (id: number, status: string) => {
        try {
            await updateMentorshipStatus(id, status);
            const updated = await getMentorRequests(username);
            setMentorOf(Array.isArray(updated) ? updated : []);
        } catch { alert('Erreur lors de la mise à jour.'); }
    };

    return (
        <>
            <div style={S.header}>
                <div style={S.headerInner}>
                    <div>
                        <p style={S.breadcrumb}><Link to="/student" style={S.breadLink}>Accueil</Link> / Mentorat</p>
                        <h1 style={S.headerTitle}>🤝 Mentorat</h1>
                    </div>
                    <p style={S.headerSub}>Demandez de l'aide ou devenez mentor pour un autre étudiant.</p>
                </div>
            </div>

            <div style={S.content}>
                <div style={S.grid}>
                    {/* Left : New request form */}
                    <div style={S.card}>
                        <div style={S.cardHeader}>
                            <span style={S.cardHeaderIcon}>✉️</span> Nouvelle demande de mentorat
                        </div>
                        <form onSubmit={handleSend} style={S.form}>
                            <label style={S.label}>Nom d'utilisateur du mentor</label>
                            <input
                                id="mentor-username"
                                style={S.input}
                                type="text"
                                placeholder="ex: prof.dupont"
                                value={form.mentorUsername}
                                onChange={e => setForm(p => ({ ...p, mentorUsername: e.target.value }))}
                            />
                            <label style={S.label}>ID du module concerné</label>
                            <input
                                id="mentor-module-id"
                                style={S.input}
                                type="number"
                                placeholder="ex: 42"
                                value={form.moduleId}
                                onChange={e => setForm(p => ({ ...p, moduleId: e.target.value }))}
                            />
                            {formMsg && <p style={{ color: formMsg.startsWith('✅') ? '#9fef00' : '#ff3e3e', fontSize: '.85rem', margin: '.5rem 0 0' }}>{formMsg}</p>}
                            <button id="mentor-submit" type="submit" style={S.submitBtn} disabled={sending}>
                                {sending ? 'Envoi...' : 'Envoyer la demande'}
                            </button>
                        </form>
                    </div>

                    {/* Right : Request lists */}
                    <div style={S.card}>
                        <div style={S.tabs}>
                            <button
                                id="tab-sent"
                                style={{ ...S.tab, ...(activeTab === 'sent' ? S.tabActive : {}) }}
                                onClick={() => setActiveTab('sent')}
                            >
                                Mes demandes ({myRequests.length})
                            </button>
                            <button
                                id="tab-received"
                                style={{ ...S.tab, ...(activeTab === 'received' ? S.tabActive : {}) }}
                                onClick={() => setActiveTab('received')}
                            >
                                Je suis mentor ({mentorOf.length})
                            </button>
                        </div>

                        {loading ? (
                            <p style={{ color: '#556987', padding: '1.5rem' }}>Chargement...</p>
                        ) : activeTab === 'sent' ? (
                            myRequests.length === 0 ? (
                                <EmptyState msg="Aucune demande envoyée." />
                            ) : (
                                <div style={{ padding: '1rem' }}>
                                    {myRequests.map((r: any) => (
                                        <RequestCard key={r.id} req={r} role="mentee" />
                                    ))}
                                </div>
                            )
                        ) : (
                            mentorOf.length === 0 ? (
                                <EmptyState msg="Aucune demande reçue." />
                            ) : (
                                <div style={{ padding: '1rem' }}>
                                    {mentorOf.map((r: any) => (
                                        <RequestCard key={r.id} req={r} role="mentor" onAction={handleStatus} />
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

/* Request card component */
const RequestCard = ({ req, role, onAction }: { req: any; role: 'mentor' | 'mentee'; onAction?: (id: number, status: string) => void }) => {
    const statusColor = STATUS_COLORS[req.status] || '#9fef00';
    return (
        <div style={S.reqCard}>
            <div style={S.reqTop}>
                <span style={{ color: '#e5eaf3', fontWeight: 700 }}>
                    {role === 'mentee' ? `➡ Mentor: ${req.mentorUsername}` : `⬅ Mentee: ${req.menteeUsername}`}
                </span>
                <span style={{ ...S.badge, background: statusColor + '22', color: statusColor, borderColor: statusColor + '55' }}>
                    {req.status}
                </span>
            </div>
            <p style={S.reqMeta}>Module ID: <strong style={{ color: '#2cb5e8' }}>{req.moduleId}</strong></p>
            {role === 'mentor' && req.status === 'PENDING' && onAction && (
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
                    <button id={`accept-${req.id}`} style={S.acceptBtn} onClick={() => onAction(req.id, 'ACTIVE')}>✓ Accepter</button>
                    <button id={`refuse-${req.id}`} style={S.refuseBtn} onClick={() => onAction(req.id, 'REFUSED')}>✗ Refuser</button>
                </div>
            )}
            {role === 'mentor' && req.status === 'ACTIVE' && onAction && (
                <div style={{ marginTop: '.5rem' }}>
                    <button id={`complete-${req.id}`} style={S.completeBtn} onClick={() => onAction(req.id, 'COMPLETED')}>✔ Marquer terminé</button>
                </div>
            )}
        </div>
    );
};

const EmptyState = ({ msg }: { msg: string }) => (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#556987' }}>
        <span style={{ fontSize: '2rem' }}>📭</span>
        <p style={{ marginTop: '.5rem' }}>{msg}</p>
    </div>
);

const S: Record<string, React.CSSProperties> = {
    header: { background: '#1a2332', borderBottom: '1px solid #2a3f5f', padding: '1.5rem 0' },
    headerInner: { maxWidth: 960, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' },
    breadcrumb: { color: '#556987', fontSize: '.875rem', margin: '0 0 .25rem' },
    breadLink: { color: '#556987', textDecoration: 'none' },
    headerTitle: { color: '#e5eaf3', fontSize: '1.5rem', fontWeight: 800, margin: 0 },
    headerSub: { color: '#556987', fontSize: '.8rem', maxWidth: 280, textAlign: 'right' },
    content: { padding: '1.5rem', maxWidth: 960, margin: '0 auto' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
    card: { background: '#1a2332', border: '1px solid #2a3f5f', borderRadius: 12, overflow: 'hidden' },
    cardHeader: { background: '#111927', borderBottom: '1px solid #2a3f5f', padding: '1rem 1.25rem', color: '#e5eaf3', fontWeight: 700, fontSize: '.95rem', display: 'flex', alignItems: 'center', gap: '.5rem' },
    cardHeaderIcon: { fontSize: '1.1rem' },
    form: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' },
    label: { color: '#8ba3c7', fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' },
    input: { background: '#111927', border: '1px solid #2a3f5f', borderRadius: 6, color: '#e5eaf3', padding: '.55rem .85rem', fontSize: '.9rem', outline: 'none', transition: 'border-color .15s' },
    submitBtn: { background: 'rgba(159,239,0,.15)', border: '1px solid rgba(159,239,0,.45)', color: '#9fef00', borderRadius: 8, padding: '.65rem 1rem', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', marginTop: '.25rem', transition: 'background .15s' },
    tabs: { display: 'flex', borderBottom: '1px solid #2a3f5f' },
    tab: { flex: 1, padding: '.85rem 1rem', background: 'transparent', border: 'none', color: '#556987', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', transition: 'color .15s, border-bottom .15s', borderBottom: '2px solid transparent' },
    tabActive: { color: '#9fef00', borderBottom: '2px solid #9fef00' },
    reqCard: { background: '#111927', border: '1px solid #2a3f5f', borderRadius: 8, padding: '.9rem 1rem', marginBottom: '.75rem' },
    reqTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.35rem', flexWrap: 'wrap', gap: '.5rem' },
    reqMeta: { color: '#556987', fontSize: '.82rem', margin: 0 },
    badge: { fontSize: '.7rem', fontWeight: 700, padding: '.2em .65em', borderRadius: 20, border: '1px solid' },
    acceptBtn: { background: 'rgba(159,239,0,.15)', border: '1px solid rgba(159,239,0,.45)', color: '#9fef00', borderRadius: 6, padding: '.35rem .75rem', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' },
    refuseBtn: { background: 'rgba(255,62,62,.12)', border: '1px solid rgba(255,62,62,.4)', color: '#ff3e3e', borderRadius: 6, padding: '.35rem .75rem', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' },
    completeBtn: { background: 'rgba(44,181,232,.12)', border: '1px solid rgba(44,181,232,.4)', color: '#2cb5e8', borderRadius: 6, padding: '.35rem .75rem', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' },
};

export default Mentorship;
