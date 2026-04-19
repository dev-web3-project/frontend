import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
    getMaterialsByModuleId, getModuleById, getQuizzesByModuleId, getForumThreadsByModuleId, 
    createMaterial, deleteMaterial, createQuiz, deleteQuiz, createForumThread 
} from "../../../services/api/course";
import { useAuth as useAuthContext } from "../../../services/AuthContext";
import PageLoading from "../../../components/Admin/PageLoading";
import api from "../../../services/api/api";

const LecturerModuleDetail = () => {
    const { id } = useParams();
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState<'materials' | 'quiz' | 'forum' | 'lessons'>('materials');
    const [module, setModule] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Lesson form
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [newLesson, setNewLesson] = useState({
        title: '',
        description: '',
        format: 'IN-PERSON',
        status: 'DRAFT',
        duration: 2,
        module: { id: id }
    });

    // Material form
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        description: '',
        type: 'PDF',
        fileUrl: '',
        moduleId: id
    });

    // Quiz form
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [newQuiz, setNewQuiz] = useState({
        title: '',
        description: '',
        moduleId: id
    });

    // Forum form
    const [showForumModal, setShowForumModal] = useState(false);
    const [newThread, setNewThread] = useState({
        title: '',
        content: '',
        authorId: '',
        authorName: '',
        moduleId: id
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (id) {
                const moduleData = await getModuleById(id);
                setModule(moduleData);

                if (activeTab === 'lessons') {
                    // Fetch lessons via GET /api/course/course/module/{moduleId}
                    const res = await api.get(`/course/course/module/${id}`);
                    setLessons(Array.isArray(res.data) ? res.data : []);
                } else if (activeTab === 'materials') {
                    const materialsData = await getMaterialsByModuleId(id);
                    setMaterials(Array.isArray(materialsData) ? materialsData : []);
                } else if (activeTab === 'quiz') {
                    const quizzesData = await getQuizzesByModuleId(id);
                    setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
                } else if (activeTab === 'forum') {
                    const threadsData = await getForumThreadsByModuleId(id);
                    setThreads(Array.isArray(threadsData) ? threadsData : []);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setNewThread(prev => ({
                ...prev,
                authorId: user.username,
                authorName: user.username
            }));
        }
        fetchData();
    }, [id, activeTab, user]);

    // Lesson handlers
    const handleAddLesson = async (e: any) => {
        e.preventDefault();
        try {
            await api.post(`/course`, newLesson);
            setShowLessonModal(false);
            setNewLesson({ ...newLesson, title: '', description: '' });
            fetchData();
        } catch (error) {
            console.error("Error creating lesson:", error);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (window.confirm("Voulez-vous vraiment supprimer cette séance ?")) {
            try {
                await api.delete(`/course/${lessonId}`);
                fetchData();
            } catch (error) {
                console.error("Error deleting lesson:", error);
            }
        }
    };

    const updateLessonStatus = async (lessonId: string, status: string) => {
        try {
            await api.put(`/course/${lessonId}`, { status });
            fetchData();
        } catch (error) {
            console.error("Error updating lesson status:", error);
        }
    };

    // Material handlers
    const handleAddMaterial = async (e: any) => {
        e.preventDefault();
        setUploading(true);
        try {
            let fileUrl = newMaterial.fileUrl;
            
            // If it's a file type and a file is selected, upload it first
            if (newMaterial.type !== 'VIDEO' && newMaterial.type !== 'LINK' && selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadRes = await api.post('/course/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                fileUrl = uploadRes.data.url;
            }

            await createMaterial({ ...newMaterial, fileUrl });
            setNewMaterial({ ...newMaterial, title: '', description: '', fileUrl: '' });
            setSelectedFile(null);
            fetchData();
        } catch (error) {
            console.error("Error creating material:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce support ?")) {
            try {
                await deleteMaterial(materialId);
                fetchData();
            } catch (error) {
                console.error("Error deleting material:", error);
            }
        }
    };

    // Quiz & Forum handlers
    const handleAddQuiz = async (e: any) => {
        e.preventDefault();
        try {
            await createQuiz(newQuiz);
            setShowQuizModal(false);
            setNewQuiz({ ...newQuiz, title: '', description: '' });
            fetchData();
        } catch (error) {
            console.error("Error creating quiz:", error);
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce quiz ?")) {
            try {
                await deleteQuiz(quizId);
                fetchData();
            } catch (error) {
                console.error("Error deleting quiz:", error);
            }
        }
    };

    const handleCreateThread = async (e: any) => {
        e.preventDefault();
        try {
            await createForumThread(newThread);
            setShowForumModal(false);
            setNewThread({ ...newThread, title: '', content: '' });
            fetchData();
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    if (loading && !module) return <PageLoading />;

    const tabs = [
        { id: 'materials', label: 'Supports', icon: 'fa-book' },
        { id: 'quiz', label: 'Quiz', icon: 'fa-question-circle' },
        { id: 'forum', label: 'Forum', icon: 'fa-comments' }
    ];

    return (
        <div style={{ paddingBottom: '3rem' }}>
            {/* Header HTB */}
            <div style={S.header}>
                <div style={S.headerInner}>
                    <div>
                        <Link to="/lecturer" style={S.backBtn}>
                            <i className="fas fa-arrow-left"></i> Retour aux modules
                        </Link>
                        <p style={S.headerGreet}>
                            <span style={S.green}>{module?.mId}</span> • {module?.semester}
                        </p>
                        <h1 style={S.headerTitle}>{module?.title?.replace(/^\[.*?\]\s*/, '')}</h1>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: '#111927', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #2a3f5f', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: '#556987', fontSize: '0.8rem', fontWeight: 600 }}>PROGRESSION :</span>
                                <input 
                                    type="number" 
                                    value={module?.hoursDone || 0} 
                                    onChange={async (e) => {
                                        const val = parseInt(e.target.value);
                                        try {
                                            await api.put(`/course/module/${id}/hours`, { hoursDone: val });
                                            setModule({ ...module, hoursDone: val });
                                        } catch (err) { console.error(err); }
                                    }}
                                    style={{ ...S.input, width: 60, padding: '0.2rem 0.5rem', textAlign: 'center' }}
                                />
                                <span style={{ color: '#9fef00', fontWeight: 700 }}>/ {module?.totalHours || 0} H</span>
                                <div style={{ width: 100, height: 6, background: '#111927', borderRadius: 3, border: '1px solid #2a3f5f', overflow: 'hidden' }}>
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${Math.min(100, ((module?.hoursDone || 0) / (module?.totalHours || 1)) * 100)}%`, 
                                        background: '#9fef00' 
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation HTB */}
            <div style={{ background: '#111927', borderBottom: '1px solid #2a3f5f' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '2rem' }}>
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                ...S.tabBtn,
                                borderBottom: activeTab === tab.id ? '2px solid #9fef00' : '2px solid transparent',
                                color: activeTab === tab.id ? '#9fef00' : '#556987',
                            }}
                        >
                            <i className={`fas ${tab.icon}`} style={{ marginRight: '0.5rem' }}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={S.content}>
                


                {/* MATERIALS TAB */}
                {activeTab === 'materials' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                        {/* Add form */}
                        <div style={S.card}>
                            <div style={{ ...S.cardBody, borderBottom: '1px solid #2a3f5f' }}>
                                <h3 style={S.cardTitle}>Nouveau Support</h3>
                            </div>
                            <form onSubmit={handleAddMaterial}>
                                <div style={S.cardBody}>
                                    <div style={S.formGroup}>
                                        <label style={S.label}>Titre</label>
                                        <input type="text" required style={S.input} value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} />
                                    </div>
                                    <div style={S.formGroup}>
                                        <label style={S.label}>Description</label>
                                        <textarea rows={3} style={S.input} value={newMaterial.description} onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} />
                                    </div>
                                    <div style={S.formGroup}>
                                        <label style={S.label}>Type</label>
                                        <select style={S.input} value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value})}>
                                            <option value="PDF">Document PDF</option>
                                            <option value="VIDEO">Lien Vidéo</option>
                                            <option value="LINK">Site Web Externe</option>
                                        </select>
                                    </div>
                                    {newMaterial.type === 'VIDEO' || newMaterial.type === 'LINK' ? (
                                        <div style={S.formGroup}>
                                            <label style={S.label}>{newMaterial.type === 'VIDEO' ? 'Lien URL de la vidéo' : 'Lien du site web'}</label>
                                            <input type="url" required style={S.input} value={newMaterial.fileUrl} onChange={e => setNewMaterial({...newMaterial, fileUrl: e.target.value})} placeholder={newMaterial.type === 'VIDEO' ? "https://youtube.com/..." : "https://..."} />
                                        </div>
                                    ) : (
                                        <div style={S.formGroup}>
                                            <label style={S.label}>Fichier</label>
                                            <input 
                                                type="file" 
                                                required={!newMaterial.fileUrl}
                                                style={{...S.input, padding: '0.4rem'}} 
                                                onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} 
                                            />
                                            <small style={{color: '#556987', marginTop: '0.2rem', display: 'block'}}>PDF, DOCX, ZIP, etc.</small>
                                        </div>
                                    )}
                                    <button 
                                        type="submit" 
                                        disabled={uploading}
                                        style={{ ...S.primaryBtn, width: '100%', justifyContent: 'center', opacity: uploading ? 0.7 : 1 }}
                                    >
                                        {uploading ? 'Envoi...' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        {/* List */}
                        <div>
                            {materials.length === 0 ? (
                                <div style={S.emptyState}>
                                    <i className="fas fa-file-pdf"></i>
                                    <p>Aucun support de cours disponible.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {materials.map(mat => (
                                        <div key={mat.id} style={{ ...S.card, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '1rem' }}>
                                            <div style={{ fontSize: '2rem', color: mat.type === 'PDF' ? '#ff3e3e' : '#2cb5e8', marginRight: '1rem' }}>
                                                <i className={`fas ${mat.type === 'PDF' ? 'fa-file-pdf' : mat.type === 'VIDEO' ? 'fa-video' : 'fa-link'}`}></i>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, color: '#e5eaf3', fontSize: '1rem' }}>{mat.title}</h4>
                                                <p style={{ margin: '0.2rem 0 0', color: '#556987', fontSize: '0.85rem' }}>{mat.description}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a href={mat.fileUrl} target="_blank" rel="noreferrer" style={{ ...S.outlineBtn, color: '#2cb5e8', borderColor: '#2cb5e8' }}>
                                                    <i className="fas fa-eye"></i>
                                                </a>
                                                <button onClick={() => handleDeleteMaterial(mat.id)} style={S.dangerBtn}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* QUIZ TAB */}
                {activeTab === 'quiz' && (
                    <div>
                        <div style={S.flexBetween}>
                            <h2 style={S.sectionTitle}>Évaluations</h2>
                            <button style={S.primaryBtn} onClick={() => setShowQuizModal(true)}>
                                <i className="fas fa-plus"></i> Nouveau Quiz
                            </button>
                        </div>
                        {quizzes.length === 0 ? (
                            <div style={S.emptyState}>
                                <i className="fas fa-question-circle"></i>
                                <p>Aucun quiz n'a été créé.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                {quizzes.map(quiz => (
                                    <div key={quiz.id} style={S.card}>
                                        <div style={S.cardBody}>
                                            <h3 style={S.cardTitle}>{quiz.title}</h3>
                                            <p style={{ color: '#556987', fontSize: '0.9rem', marginBottom: '1rem' }}>{quiz.description}</p>
                                            <div style={S.flexBetween}>
                                                <span style={{ color: '#9fef00', fontSize: '0.8rem', fontWeight: 600 }}>{quiz.questions?.length || 0} Questions</span>
                                                <button onClick={() => handleDeleteQuiz(quiz.id)} style={S.dangerBtn}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* FORUM TAB */}
                {activeTab === 'forum' && (
                    <div>
                        <div style={S.flexBetween}>
                            <h2 style={S.sectionTitle}>Discussions</h2>
                            <button style={S.primaryBtn} onClick={() => setShowForumModal(true)}>
                                <i className="fas fa-plus"></i> Nouvelle Discussion
                            </button>
                        </div>
                        {threads.length === 0 ? (
                            <div style={S.emptyState}>
                                <i className="fas fa-comments"></i>
                                <p>Aucune discussion dans le forum.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {threads.map(thread => (
                                    <div key={thread.id} style={S.card}>
                                        <div style={{ ...S.cardBody, display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2a3f5f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                                                {thread.authorName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={S.flexBetween}>
                                                    <h3 style={{ ...S.cardTitle, margin: 0 }}>
                                                        {thread.title}
                                                        {thread.solution && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#14b8a611', color: '#14b8a6', padding: '0.2rem 0.5rem', borderRadius: 4, border: '1px solid #14b8a6' }}><i className="fas fa-check"></i> Résolu</span>}
                                                    </h3>
                                                    <span style={{ fontSize: '0.8rem', color: '#556987' }}>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p style={{ color: '#556987', fontSize: '0.9rem', margin: '0.5rem 0' }}>{thread.content.substring(0, 150)}...</p>
                                                <div style={{ fontSize: '0.8rem', color: '#556987', display: 'flex', gap: '1rem' }}>
                                                    <span><i className="fas fa-thumbs-up"></i> {thread.upvoteCount}</span>
                                                    <span><i className="fas fa-comment"></i> {thread.posts?.length || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showLessonModal && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <h3 style={S.cardTitle}>Nouvelle Séance</h3>
                        <form onSubmit={handleAddLesson}>
                            <div style={S.formGroup}>
                                <label style={S.label}>Titre (ex: Cours 1 - Introduction)</label>
                                <input type="text" required style={S.input} value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Description</label>
                                <textarea rows={3} style={S.input} value={newLesson.description} onChange={e => setNewLesson({...newLesson, description: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ ...S.formGroup, flex: 1 }}>
                                    <label style={S.label}>Format</label>
                                    <select style={S.input} value={newLesson.format} onChange={e => setNewLesson({...newLesson, format: e.target.value})}>
                                        <option value="IN-PERSON">Présentiel</option>
                                        <option value="ONLINE">En Ligne</option>
                                    </select>
                                </div>
                                <div style={{ ...S.formGroup, flex: 1 }}>
                                    <label style={S.label}>Durée (Heures)</label>
                                    <input type="number" required min={1} style={S.input} value={newLesson.duration} onChange={e => setNewLesson({...newLesson, duration: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" style={{ ...S.outlineBtn, flex: 1 }} onClick={() => setShowLessonModal(false)}>Annuler</button>
                                <button type="submit" style={{ ...S.primaryBtn, flex: 1, justifyContent: 'center' }}>Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {showQuizModal && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <h3 style={S.cardTitle}>Nouveau Quiz</h3>
                        <form onSubmit={handleAddQuiz}>
                            <div style={S.formGroup}>
                                <label style={S.label}>Titre</label>
                                <input type="text" required style={S.input} value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Description</label>
                                <textarea rows={3} style={S.input} value={newQuiz.description} onChange={e => setNewQuiz({...newQuiz, description: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" style={{ ...S.outlineBtn, flex: 1 }} onClick={() => setShowQuizModal(false)}>Annuler</button>
                                <button type="submit" style={{ ...S.primaryBtn, flex: 1, justifyContent: 'center' }}>Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showForumModal && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <h3 style={S.cardTitle}>Nouvelle Discussion</h3>
                        <form onSubmit={handleCreateThread}>
                            <div style={S.formGroup}>
                                <label style={S.label}>Sujet</label>
                                <input type="text" required style={S.input} value={newThread.title} onChange={e => setNewThread({...newThread, title: e.target.value})} />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Message</label>
                                <textarea rows={5} required style={S.input} value={newThread.content} onChange={e => setNewThread({...newThread, content: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" style={{ ...S.outlineBtn, flex: 1 }} onClick={() => setShowForumModal(false)}>Annuler</button>
                                <button type="submit" style={{ ...S.primaryBtn, flex: 1, justifyContent: 'center' }}>Publier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

const S: any = {
    header: { background: '#1a2332', padding: '1.5rem 0' },
    headerInner: { maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' },
    backBtn: { color: '#556987', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1rem' },
    headerGreet: { color: '#556987', fontSize: '.875rem', margin: '0 0 .25rem', textTransform: 'uppercase', letterSpacing: 1 },
    headerTitle: { color: '#e5eaf3', fontSize: '1.8rem', fontWeight: 800, margin: 0 },
    green: { color: '#9fef00' },
    content: { padding: '2rem 1.5rem', maxWidth: 1100, margin: '0 auto' },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    sectionTitle: { color: '#e5eaf3', fontSize: '1.2rem', margin: 0 },
    tabBtn: { background: 'none', border: 'none', padding: '1rem 0', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
    card: { background: '#1a2332', border: '1px solid #2a3f5f', borderRadius: 8, overflow: 'hidden' },
    cardBody: { padding: '1.25rem' },
    cardTitle: { color: '#e5eaf3', fontSize: '1.1rem', margin: '0 0 0.5rem' },
    emptyState: { padding: '4rem 2rem', textAlign: 'center', color: '#556987', background: '#1a2332', borderRadius: 8, border: '1px dashed #2a3f5f', fontSize: '1.1rem' },
    primaryBtn: { background: '#9fef00', color: '#111927', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' },
    outlineBtn: { background: 'transparent', color: '#556987', border: '1px solid #556987', padding: '0.5rem 1rem', borderRadius: 4, fontWeight: 600, cursor: 'pointer' },
    dangerBtn: { background: '#ff3e3e11', color: '#ff3e3e', border: '1px solid #ff3e3e', padding: '0.4rem 0.8rem', borderRadius: 4, cursor: 'pointer' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', color: '#e5eaf3', marginBottom: '0.5rem', fontSize: '0.9rem' },
    input: { width: '100%', background: '#111927', border: '1px solid #2a3f5f', color: '#e5eaf3', padding: '0.5rem 0.75rem', borderRadius: 4, outline: 'none' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { background: '#1a2332', padding: '2rem', borderRadius: 8, width: '100%', maxWidth: 500, border: '1px solid #2a3f5f' },
    statusSelect: (status: string) => {
        let color = '#556987';
        if (status === 'IN_PROGRESS') color = '#2cb5e8';
        if (status === 'COMPLETED') color = '#9fef00';
        return {
            background: `${color}11`, color, border: `1px solid ${color}`,
            padding: '0.3rem 0.5rem', borderRadius: 4, outline: 'none', fontSize: '0.8rem', fontWeight: 600
        };
    }
};

export default LecturerModuleDetail;
