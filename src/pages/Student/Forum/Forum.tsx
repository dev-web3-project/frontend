import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getForumThreadsByModuleId, getModuleById, createForumThread } from "../../../services/api/course";
import { useAuth } from "../../../services/AuthContext";
import PageLoading from "../../../components/Admin/PageLoading";

const StudentForum = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [threads, setThreads] = useState<any[]>([]);
    const [module, setModule] = useState<any>(null);
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
                const threadsData = await getForumThreadsByModuleId(id);
                setThreads(Array.isArray(threadsData) ? threadsData : []);
            }
        } catch (error) {
            console.error("Error fetching forum threads:", error);
            setThreads([]);
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
    }, [id, user]);

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

    if (loading && !module) return <PageLoading />;

    return (
        <>
            <div className="content-header">
                <div className="container">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Forum : {module?.title}</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><Link to={"/student"}>Accueil</Link></li>
                                <li className="breadcrumb-item active">Forum</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content">
                <div className="container">
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <button 
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <i className="fas fa-plus"></i> Nouvelle discussion
                            </button>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="card card-outline card-primary">
                                <div className="card-header">
                                    <h3 className="card-title">Discussions</h3>
                                </div>
                                <div className="card-body p-0">
                                    {threads.length === 0 ? (
                                        <div className="p-5 text-center text-muted">
                                            <p>Aucune discussion pour le moment. Soyez le premier à commencer !</p>
                                        </div>
                                    ) : (
                                        <div className="list-group list-group-flush">
                                            {threads.map((thread: any) => (
                                                <div key={thread.id} className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h5 className="mb-1">
                                                            {thread.title}
                                                            {thread.solution && (
                                                                <span className="badge badge-success ml-2">
                                                                    <i className="fas fa-check"></i> Résolu
                                                                </span>
                                                            )}
                                                        </h5>
                                                        <small>
                                                            <i className="fas fa-eye"></i> {thread.viewCount}
                                                            <i className="fas fa-thumbs-up ml-2"></i> {thread.upvoteCount}
                                                            <i className="fas fa-comment ml-2"></i> {thread.posts?.length || 0}
                                                        </small>
                                                    </div>
                                                    <p className="mb-1">{thread.content.substring(0, 100)}...</p>
                                                    <small className="text-muted">
                                                        Par {thread.authorName} • {new Date(thread.createdAt).toLocaleDateString('fr-FR')}
                                                    </small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
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

export default StudentForum;
