import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getModulesByLecturer } from "../../../services/api/course";
import { getLecturerDetailsByUsername } from "../../../services/api/user";
import PageLoading from "../../../components/Admin/PageLoading";

const ACCENT_COLORS = ['#9fef00','#2cb5e8','#ffaf00','#ff3e3e','#a855f7','#ec4899','#14b8a6','#f97316'];

const LecturerHome = () => {
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const go = async () => {
            try {
                const stored = localStorage.getItem('user');
                const uname = stored ? (JSON.parse(stored).username || JSON.parse(stored).email || '') : '';
                setUsername(uname);
                try {
                    await getLecturerDetailsByUsername(uname); // Just to ensure details exist if needed
                } catch(e) {}
                const list = await getModulesByLecturer(uname);
                setModules(Array.isArray(list) ? list : []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        go();
    }, []);

    if (loading) return <PageLoading />;

    return (
        <>
            <div style={S.header}>
                <div style={S.headerInner}>
                    <div>
                        <p style={S.headerGreet}>Prof. <span style={S.green}>{username}</span></p>
                        <h1 style={S.headerTitle}>Vos Modules</h1>
                    </div>
                    <div style={S.headerBadge}>
                        <span style={S.green}>{modules.length}</span>
                        <span style={S.headerBadgeLabel}>modules</span>
                    </div>
                </div>
            </div>

            <div style={S.content}>
                {modules.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-chalkboard-teacher" />
                        <p>Aucun module assigné pour le moment.</p>
                    </div>
                ) : (
                    <div style={S.grid}>
                        {modules.map((mod: any, i: number) => {
                            const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
                            return (
                                <div key={mod.id} style={S.card}>
                                    <div style={{ ...S.cardStripe, background: color }} />
                                    <div style={S.cardBody}>
                                        <div style={S.cardTop}>
                                            <span style={{ ...S.midTag, color, borderColor: color + '44', background: color + '11' }}>
                                                {mod.mid}
                                            </span>
                                            <span style={S.semTag}>{mod.semester}</span>
                                        </div>
                                        <h3 style={S.cardTitle}>{mod.title.replace(/^\[.*?\]\s*/, '')}</h3>
                                        <div style={S.cardFooter}>
                                            <Link to={`/lecturer/${mod.id}`} style={{ ...S.btn, color, borderColor: color + '55', background: color + '11' }}>
                                                Gérer <i className="fas fa-arrow-right" style={{ marginLeft: '.4rem', fontSize: '.75rem' }} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

const S: Record<string, React.CSSProperties> = {
    header: { background: '#1a2332', borderBottom: '1px solid #2a3f5f', padding: '1.5rem 0' },
    headerInner: { maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    headerGreet: { color: '#556987', fontSize: '.875rem', margin: '0 0 .25rem' },
    headerTitle: { color: '#e5eaf3', fontSize: '1.5rem', fontWeight: 800, margin: 0 },
    green: { color: '#9fef00' },
    headerBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
    headerBadgeLabel: { color: '#556987', fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' },
    content: { padding: '1.5rem', maxWidth: 1100, margin: '0 auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
    card: {
        background: '#1a2332', border: '1px solid #2a3f5f',
        borderRadius: 8, overflow: 'hidden', transition: 'border-color .18s',
        display: 'flex', flexDirection: 'column',
    },
    cardStripe: { height: 3 },
    cardBody: { padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1 },
    cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' },
    midTag: {
        fontSize: '.72rem', fontWeight: 700, borderRadius: 4,
        padding: '.2em .6em', border: '1px solid', fontFamily: "'Courier New', monospace",
    },
    semTag: {
        fontSize: '.72rem', fontWeight: 600, color: '#556987',
        background: '#111927', borderRadius: 4, padding: '.2em .6em', border: '1px solid #2a3f5f',
    },
    cardTitle: { color: '#e5eaf3', fontSize: '.95rem', fontWeight: 600, flex: 1, margin: '0 0 1rem', lineHeight: 1.45 },
    cardFooter: { borderTop: '1px solid #2a3f5f', paddingTop: '.85rem' },
    btn: {
        display: 'inline-flex', alignItems: 'center',
        padding: '.38rem .85rem', borderRadius: 4,
        fontWeight: 700, fontSize: '.8rem', border: '1px solid',
        textDecoration: 'none',
    },
};

export default LecturerHome;