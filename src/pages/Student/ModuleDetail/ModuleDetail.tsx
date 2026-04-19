import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMaterialsByModuleId, getModuleById, getQuizzesByModuleId, getForumThreadsByModuleId, createForumThread } from "../../../services/api/course";
import { useAuth as useAuthContext } from "../../../services/AuthContext";
import PageLoading from "../../../components/Admin/PageLoading";

const StudentModuleDetail = () => {
    const { id } = useParams();
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState<'materials' | 'quiz' | 'forum'>('materials');
    const [module, setModule] = useState<any>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
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

                if (activeTab === 'materials') {
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

    const handleCreateThread = async (e: any) => {
        e.preventDefault();
        try {
            await createForumThread(newThread);
            setShowCreateModal(false);
            setNewThread({
                title: '',
                content: '',
                authorId: user?.username || '',
                authorName: user?.username || '',
                moduleId: id
            });
            fetchData();
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    const stripCode = (title: string) => {
        if (!title) return '';
        return title.replace(/^\[.*?\]\s*/, '');
    };

    if (loading && !module) return <PageLoading />;

    return (
        <>
            <div className="content-header">
                <div className="container">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">{stripCode(module?.title)}</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><Link to={"/student"}>Accueil</Link></li>
                                <li className="breadcrumb-item active">Module</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content">
                <div className="container">
                    <div className="card card-primary card-outline">
                        <div className="card-header p-2">
                            <ul className="nav nav-pills">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'materials' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('materials')}
                                    >
                                        <i className="fas fa-book"></i> Supports de cours
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'quiz' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('quiz')}
                                    >
                                        <i className="fas fa-question-circle"></i>Quiz</button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'forum' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('forum')}
                                    >
                                        <i className="fas fa-comments"></i>Forum</button>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body">
                            {activeTab === 'materials' && (
                                <div>
                                    <h4 className="mb-4">Supports de cours</h4>
                                    {materials.length === 0 ? (
                                        <div className="p-5 text-center text-muted">
                                            <i className="fas fa-folder-open fa-3x mb-3"></i>
                                            <p>Aucun support disponible pour ce module.</p>
                                        </div>
                                    ) : (
                                        <table className="table table-striped projects">
                                            <thead>
                                                <tr>
                                                    <th style={{width: "20%"}}>Type</th>
                                                    <th style={{width: "40%"}}>Titre</th>
                                                    <th style={{width: "30%"}}>Description</th>
                                                    <th style={{width: "10%"}} className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {materials.map((material: any) => (
                                                    <tr key={material.id}>
                                                        <td>
                                                            {material.type === 'PDF' && <span className="badge badge-danger"><i className="fas fa-file-pdf mr-1"></i> PDF</span>}
                                                            {material.type === 'VIDEO' && <span className="badge badge-primary"><i className="fas fa-video mr-1"></i> VIDEO</span>}
                                                            {material.type === 'LINK' && <span className="badge badge-info"><i className="fas fa-link mr-1"></i> LINK</span>}
                                                            {material.type === 'DOCUMENT' && <span className="badge badge-success"><i className="fas fa-file-word mr-1"></i> DOC</span>}
                                                        </td>
                                                        <td><strong>{material.title}</strong></td>
                                                        <td><small>{material.description}</small></td>
                                                        <td className="text-center">
                                                            <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                                                <i className="fas fa-external-link-alt"></i> Ouvrir
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {activeTab === 'quiz' && (
                                <div>
                                    <h4 className="mb-4">Quiz disponibles</h4>
                                    {quizzes.length === 0 ? (
                                        <div className="p-5 text-center text-muted">
                                            <i className="fas fa-question-circle fa-3x mb-3"></i>
                                            <p>Aucun quiz disponible pour ce module.</p>
                                        </div>
                                    ) : (
                                        <div className="list-group">
                                            {quizzes.map((quiz: any) => (
                                                <div key={quiz.id} className="list-group-item list-group-item-action">
                                                    <h5 className="mb-1">{quiz.title}</h5>
                                                    <p className="mb-1">{quiz.description}</p>
                                                    <small className="text-muted">
                                                        {quiz.durationMinutes && <span><i className="fas fa-clock"></i> {quiz.durationMinutes} min</span>}
                                                        {quiz.passingScore && <span className="ml-3"><i className="fas fa-percentage"></i> Note de passage: {quiz.passingScore}%</span>}
                                                    </small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'forum' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="mb-0">Discussions</h4>
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setShowCreateModal(true)}
                                        >
                                            <i className="fas fa-plus"></i> Nouvelle discussion
                                        </button>
                                    </div>
                                    {threads.length === 0 ? (
                                        <div className="p-5 text-center text-muted">
                                            <i className="fas fa-comments fa-3x mb-3"></i>
                                            <p>Aucune discussion pour le moment. Soyez le premier à commencer !</p>
                                        </div>
                                    ) : (
                                        <div className="list-group">
                                            {threads.map((thread: any) => (
                                                <div key={thread.id} className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h5 className="mb-1">
                                                            {thread.title}
                                                            {thread.solution && (
                                                                <span className="badge badge-success ml-2"><i className="fas fa-check"></i> Résolu</span>
                                                            )}
                                                        </h5>
                                                        <small>
                                                            <i className="fas fa-eye"></i> {thread.viewCount}
                                                            <i className="fas fa-thumbs-up ml-2"></i> {thread.upvoteCount}
                                                            <i className="fas fa-comment ml-2"></i> {thread.posts?.length || 0}
                                                        </small>
                                                    </div>
                                                    <p className="mb-1">{thread.content.substring(0, 150)}...</p>
                                                    <small className="text-muted">
                                                        Par {thread.authorName} • {new Date(thread.createdAt).toLocaleDateString('fr-FR')}
                                                    </small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {showCreateModal && (
                        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Nouvelle discussion</h5>
                                        <button 
                                            type="button" 
                                            className="close"
                                            onClick={() => setShowCreateModal(false)}
                                        >
                                            <span>&times;</span>
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateThread}>
                                        <div className="modal-body">
                                            <div className="form-group">
                                                <label>Titre</label>
                                                <input type="text" className="form-control" required
                                                    value={newThread.title}
                                                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                                                    placeholder="Entrez le titre" />
                                            </div>
                                            <div className="form-group">
                                                <label>Contenu</label>
                                                <textarea className="form-control" rows={5} required
                                                    value={newThread.content}
                                                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                                                    placeholder="Entrez le contenu"></textarea>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary"
                                                onClick={() => setShowCreateModal(false)}>
                                                Annuler
                                            </button>
                                            <button type="submit" className="btn btn-primary">
                                                Créer
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentModuleDetail;
