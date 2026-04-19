import React, { useEffect, useState, useCallback } from 'react';
import BreadCrumb from "../../../components/Admin/Breadcrumb";
import PageLoading from "../../../components/Admin/PageLoading";
import {
    Message,
    getInbox,
    getSent,
    sendMessage,
    markAsRead,
    deleteMessageByReceiver,
    deleteMessageBySender,
} from "../../../services/api/messages";
import {
    sendNotification,
    getUserNotifications,
    deleteNotification,
} from "../../../services/api/announcement";

// Read the current user from localStorage
const getUsername = (): string => {
    try {
        const stored = localStorage.getItem('user');
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.username || parsed.sub || '';
        }
    } catch { }
    return '';
};

const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return 'Il y a quelques minutes';
    if (diffH < 24) return `Il y a ${diffH}h`;
    if (diffH < 48) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

type Folder = 'inbox' | 'sent';

const Messages = () => {
    const username = getUsername();
    const [folder, setFolder] = useState<Folder>('inbox');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Message | null>(null);

    // Compose modal state
    const [showCompose, setShowCompose] = useState(false);
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    // Notification state
    const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
    const [notifTo, setNotifTo] = useState('');
    const [notifTitre, setNotifTitre] = useState('');
    const [notifContenu, setNotifContenu] = useState('');
    const [notifGenre, setNotifGenre] = useState('SYSTEME');
    const [sendingNotif, setSendingNotif] = useState(false);
    const [recentNotifs, setRecentNotifs] = useState<any[]>([]);
    const [notifTarget, setNotifTarget] = useState('');
    const [loadingNotifs, setLoadingNotifs] = useState(false);

    const loadMessages = useCallback(async () => {
        setLoading(true);
        setSelected(null);
        const data = folder === 'inbox'
            ? await getInbox(username)
            : await getSent(username);
        setMessages(data);
        setLoading(false);
    }, [folder, username]);

    useEffect(() => {
        if (username) loadMessages();
        else setLoading(false);
    }, [loadMessages, username]);

    const handleOpen = async (msg: Message) => {
        setSelected(msg);
        if (!msg.read && folder === 'inbox') {
            await markAsRead(msg.id);
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
        }
    };

    const handleDelete = async (msg: Message) => {
        if (folder === 'inbox') await deleteMessageByReceiver(msg.id);
        else await deleteMessageBySender(msg.id);
        setMessages(prev => prev.filter(m => m.id !== msg.id));
        if (selected?.id === msg.id) setSelected(null);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!to || !subject || !body) return;
        setSending(true);
        await sendMessage({ senderUsername: username, receiverUsername: to, subject, body });
        setSending(false);
        setShowCompose(false);
        setTo(''); setSubject(''); setBody('');
        if (folder === 'sent') loadMessages();
    };

    const unread = messages.filter(m => !m.read).length;

    // ── Notification handlers ──
    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifTo || !notifTitre || !notifContenu) return;
        setSendingNotif(true);
        await sendNotification({ userId: notifTo, titre: notifTitre, contenu: notifContenu, genre: notifGenre });
        setSendingNotif(false);
        setNotifTitre(''); setNotifContenu('');
        // reload recent notifs if same user
        if (notifTarget === notifTo) loadNotifHistory(notifTo);
    };

    const loadNotifHistory = async (userId: string) => {
        if (!userId) return;
        setLoadingNotifs(true);
        setNotifTarget(userId);
        const data = await getUserNotifications(userId);
        setRecentNotifs(Array.isArray(data) ? data : []);
        setLoadingNotifs(false);
    };

    const handleDeleteNotif = async (id: number) => {
        await deleteNotification(id);
        setRecentNotifs(prev => prev.filter(n => n.id !== id));
    };

    return (
        <section className="content">
            <BreadCrumb page_name="Messages" parent_name="Communication" />
            <div className="container-fluid">
                <div className="row">

                    {/* ── Sidebar folders ── */}
                    <div className="col-md-3">
                        {/* Tab switcher */}
                        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
                            <button
                                className="btn btn-block"
                                style={{
                                    flex: 1, fontWeight: 700,
                                    background: activeTab === 'messages' ? 'rgba(159,239,0,.12)' : 'transparent',
                                    border: `1px solid ${activeTab === 'messages' ? 'rgba(159,239,0,.4)' : '#2a3f5f'}`,
                                    color: activeTab === 'messages' ? '#9fef00' : '#a4b1cd',
                                }}
                                onClick={() => setActiveTab('messages')}
                            >
                                <i className="fas fa-envelope mr-1"></i> Messages
                            </button>
                            <button
                                className="btn btn-block"
                                style={{
                                    flex: 1, fontWeight: 700,
                                    background: activeTab === 'notifications' ? 'rgba(159,239,0,.12)' : 'transparent',
                                    border: `1px solid ${activeTab === 'notifications' ? 'rgba(159,239,0,.4)' : '#2a3f5f'}`,
                                    color: activeTab === 'notifications' ? '#9fef00' : '#a4b1cd',
                                }}
                                onClick={() => setActiveTab('notifications')}
                            >
                                🔔 Notifs
                            </button>
                        </div>

                        {activeTab === 'messages' && (
                        <button
                            className="btn btn-primary btn-block mb-3"
                            onClick={() => setShowCompose(true)}
                        >
                            <i className="fas fa-pen mr-1"></i> Nouveau Message
                        </button>
                        )}

                        {activeTab === 'messages' && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Dossiers</h3>
                            </div>
                            <div className="card-body p-0">
                                <ul className="nav nav-pills flex-column">
                                    <li className="nav-item">
                                        <a
                                            href="#"
                                            className={`nav-link${folder === 'inbox' ? ' active' : ''}`}
                                            style={folder === 'inbox'
                                                ? { background: 'rgba(159,239,0,.12)', color: '#9fef00', borderLeft: '3px solid #9fef00' }
                                                : { background: 'transparent', color: '#a4b1cd' }}
                                            onClick={e => { e.preventDefault(); setFolder('inbox'); }}
                                        >
                                            <i className="fas fa-inbox mr-2"></i> Boîte de réception
                                            {unread > 0 && folder === 'inbox' && (
                                                <span className="badge badge-success float-right">{unread}</span>
                                            )}
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            href="#"
                                            className={`nav-link${folder === 'sent' ? ' active' : ''}`}
                                            style={folder === 'sent'
                                                ? { background: 'rgba(159,239,0,.12)', color: '#9fef00', borderLeft: '3px solid #9fef00' }
                                                : { background: 'transparent', color: '#a4b1cd' }}
                                            onClick={e => { e.preventDefault(); setFolder('sent'); }}
                                        >
                                            <i className="far fa-paper-plane mr-2"></i> Envoyés
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* ── Main content area ── */}
                    <div className="col-md-9">

                    {/* ── Notifications Panel ── */}
                    {activeTab === 'notifications' && (
                        <div className="card card-primary card-outline">
                            <div className="card-header">
                                <h3 className="card-title">🔔 Envoyer une Notification</h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSendNotification}>
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                            <label>Destinataire (username)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="username de l'étudiant ou du lecturer"
                                                value={notifTo}
                                                onChange={e => setNotifTo(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label>Type</label>
                                            <select className="form-control" value={notifGenre} onChange={e => setNotifGenre(e.target.value)}>
                                                <option value="SYSTEME">⚙️ Système</option>
                                                <option value="COURS">📚 Cours</option>
                                                <option value="QUIZ">🎯 Quiz</option>
                                                <option value="BADGE">🏆 Badge</option>
                                                <option value="MENTORING">🤝 Mentorat</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Titre</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Titre de la notification"
                                            value={notifTitre}
                                            onChange={e => setNotifTitre(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Contenu</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            placeholder="Message de la notification..."
                                            value={notifContenu}
                                            onChange={e => setNotifContenu(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '.75rem' }}>
                                        <button type="submit" className="btn btn-primary" disabled={sendingNotif}>
                                            {sendingNotif
                                                ? <><i className="fas fa-spinner fa-spin mr-1"></i>Envoi...</>
                                                : <><i className="fas fa-bell mr-1"></i>Envoyer la notification</>
                                            }
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-default"
                                            onClick={() => loadNotifHistory(notifTo)}
                                            disabled={!notifTo}
                                        >
                                            <i className="fas fa-history mr-1"></i> Voir l'historique
                                        </button>
                                    </div>
                                </form>

                                {/* History */}
                                {notifTarget && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <h5 style={{ color: '#a4b1cd', fontSize: '.85rem', fontWeight: 700, marginBottom: '.75rem' }}>
                                            Notifications de <span style={{ color: '#9fef00' }}>{notifTarget}</span>
                                        </h5>
                                        {loadingNotifs ? (
                                            <PageLoading />
                                        ) : recentNotifs.length === 0 ? (
                                            <p style={{ color: '#556987', fontSize: '.85rem' }}>Aucune notification trouvée.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                                {recentNotifs.map((n: any) => (
                                                    <div key={n.id} style={{
                                                        display: 'flex', alignItems: 'center', gap: '.75rem',
                                                        background: n.lu ? 'transparent' : 'rgba(159,239,0,.05)',
                                                        border: `1px solid ${n.lu ? '#1e2d40' : 'rgba(159,239,0,.2)'}`,
                                                        borderRadius: 8, padding: '.6rem .9rem',
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{ color: '#e5eaf3', fontWeight: n.lu ? 400 : 700, fontSize: '.85rem' }}>{n.titre}</span>
                                                            <span style={{ marginLeft: 8, color: '#556987', fontSize: '.75rem' }}>{n.genre}</span>
                                                            <p style={{ margin: '2px 0 0', color: '#718096', fontSize: '.78rem' }}>{n.contenu?.substring(0, 80)}</p>
                                                        </div>
                                                        {!n.lu && <span style={{ background: 'rgba(159,239,0,.15)', color: '#9fef00', borderRadius: 99, fontSize: '.65rem', padding: '2px 8px', fontWeight: 800 }}>Non lue</span>}
                                                        <button
                                                            className="btn btn-xs btn-default"
                                                            onClick={() => handleDeleteNotif(n.id)}
                                                            title="Supprimer"
                                                        >
                                                            <i className="fas fa-trash-alt text-danger"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Messages Panel ── */}
                    {activeTab === 'messages' && (
                    <>{selected ? (
                            /* ── Message detail view ── */
                            <div className="card card-primary card-outline">
                                <div className="card-header">
                                    <button className="btn btn-sm btn-default mr-2" onClick={() => setSelected(null)}>
                                        <i className="fas fa-arrow-left mr-1"></i> Retour
                                    </button>
                                    <button className="btn btn-sm btn-danger float-right" onClick={() => handleDelete(selected)}>
                                        <i className="fas fa-trash-alt mr-1"></i> Supprimer
                                    </button>
                                </div>
                                <div className="card-body">
                                    <h4 style={{ color: 'var(--text-primary)' }}>{selected.subject}</h4>
                                    <div className="d-flex justify-content-between mb-3" style={{ fontSize: '0.82rem', color: '#a4b1cd' }}>
                                        <span>
                                            {folder === 'inbox' ? `De : ${selected.senderUsername}` : `À : ${selected.receiverUsername}`}
                                        </span>
                                        <span>{formatDate(selected.createdAt)}</span>
                                    </div>
                                    <hr style={{ borderColor: 'var(--border)' }} />
                                    <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.7 }}>
                                        {selected.body}
                                    </p>
                                    {folder === 'inbox' && (
                                        <button
                                            className="btn btn-primary btn-sm mt-3"
                                            onClick={() => {
                                                setTo(selected.senderUsername);
                                                setSubject(`Re: ${selected.subject}`);
                                                setBody('');
                                                setShowCompose(true);
                                            }}
                                        >
                                            <i className="fas fa-reply mr-1"></i> Répondre
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ── Message list ── */
                            <div className="card card-primary card-outline">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        {folder === 'inbox' ? 'Boîte de réception' : 'Messages envoyés'}
                                    </h3>
                                    <div className="card-tools">
                                        <button className="btn btn-sm btn-default" onClick={loadMessages}>
                                            <i className="fas fa-sync-alt"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    {loading ? (
                                        <PageLoading />
                                    ) : messages.length === 0 ? (
                                        <div className="empty-state">
                                            <i className="fas fa-inbox"></i>
                                            <p>Aucun message dans ce dossier</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <tbody>
                                                    {messages.map(msg => (
                                                        <tr
                                                            key={msg.id}
                                                            style={{ cursor: 'pointer', fontWeight: !msg.read && folder === 'inbox' ? 700 : 400 }}
                                                        >
                                                            <td style={{ width: 28 }} onClick={() => handleOpen(msg)}>
                                                                {!msg.read && folder === 'inbox' && (
                                                                    <span style={{
                                                                        display: 'inline-block', width: 8, height: 8,
                                                                        background: '#9fef00', borderRadius: '50%'
                                                                    }} />
                                                                )}
                                                            </td>
                                                            <td onClick={() => handleOpen(msg)} style={{ width: 180 }}>
                                                                <span style={{ color: 'var(--text-primary)' }}>
                                                                    {folder === 'inbox' ? msg.senderUsername : msg.receiverUsername}
                                                                </span>
                                                            </td>
                                                            <td onClick={() => handleOpen(msg)}>
                                                                {msg.subject}
                                                                <span style={{ color: '#556987', marginLeft: 8, fontWeight: 400, fontSize: '0.82rem' }}>
                                                                    — {msg.body?.substring(0, 60)}...
                                                                </span>
                                                            </td>
                                                            <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#a4b1cd', width: 100 }}>
                                                                {formatDate(msg.createdAt)}
                                                            </td>
                                                            <td style={{ width: 40 }}>
                                                                <button
                                                                    className="btn btn-xs btn-default"
                                                                    onClick={() => handleDelete(msg)}
                                                                    title="Supprimer"
                                                                >
                                                                    <i className="fas fa-trash-alt text-danger"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer text-muted" style={{ fontSize: '0.8rem' }}>
                                    {messages.length} message(s)
                                </div>
                            </div>
                        )}
                    </>
                    )}
                    </div>
                </div>
            </div>

            {/* ── Compose Modal ── */}
            {showCompose && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-pen mr-2" style={{ color: '#9fef00' }}></i>
                                    Nouveau message
                                </h5>
                                <button className="close" onClick={() => setShowCompose(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSend}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Destinataire (username)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="username du destinataire"
                                            value={to}
                                            onChange={e => setTo(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Objet</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Objet du message"
                                            value={subject}
                                            onChange={e => setSubject(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Message</label>
                                        <textarea
                                            className="form-control"
                                            rows={6}
                                            placeholder="Écrivez votre message..."
                                            value={body}
                                            onChange={e => setBody(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={() => setShowCompose(false)}>
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={sending}>
                                        {sending
                                            ? <><i className="fas fa-spinner fa-spin mr-1"></i> Envoi...</>
                                            : <><i className="fas fa-paper-plane mr-1"></i> Envoyer</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Messages;