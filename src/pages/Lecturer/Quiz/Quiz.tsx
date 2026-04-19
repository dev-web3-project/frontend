import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getQuizzesByModuleId, getModuleById, createQuiz, deleteQuiz } from "../../../services/api/course";
import PageLoading from "../../../components/Admin/PageLoading";

const LecturerQuiz = () => {
    const { id } = useParams();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [module, setModule] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [newQuiz, setNewQuiz] = useState({
        title: '',
        description: '',
        timeLimit: 30,
        timeLimitPerQuestion: false,
        documentMode: 'NO_DOCS',
        cameraSurveillanceEnabled: false,
        randomizeQuestions: false,
        randomizeAnswers: true,
        maxAttempts: 3,
        publishDate: new Date().toISOString().slice(0, 16),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        isDraft: false,
        passingScore: 60.0,
        moduleId: id,
        questions: [
            {
                text: '',
                hint: '',
                orderIndex: 1,
                points: 10,
                type: 'SINGLE_CHOICE',
                options: [
                    { text: '', correct: true },
                    { text: '', correct: false }
                ]
            }
        ]
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (id) {
                const moduleData = await getModuleById(id);
                setModule(moduleData);
                const quizzesData = await getQuizzesByModuleId(id);
                setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAddQuestion = () => {
        setNewQuiz({
            ...newQuiz,
            questions: [
                ...newQuiz.questions,
                {
                    text: '',
                    hint: '',
                    orderIndex: newQuiz.questions.length + 1,
                    points: 10,
                    type: 'SINGLE_CHOICE',
                    options: [
                        { text: '', correct: true },
                        { text: '', correct: false }
                    ]
                }
            ]
        });
    };

    const handleRemoveQuestion = (index: number) => {
        if (newQuiz.questions.length > 1) {
            setNewQuiz({
                ...newQuiz,
                questions: newQuiz.questions.filter((_, i) => i !== index)
            });
        }
    };

    const handleAddOption = (qIndex: number) => {
        const updatedQuestions = [...newQuiz.questions];
        updatedQuestions[qIndex].options.push({ text: '', correct: false });
        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    };

    const handleRemoveOption = (qIndex: number, oIndex: number) => {
        const updatedQuestions = [...newQuiz.questions];
        if (updatedQuestions[qIndex].options.length > 2) {
            updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== oIndex);
            setNewQuiz({ ...newQuiz, questions: updatedQuestions });
        }
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const updatedQuestions = [...newQuiz.questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    };

    const handleOptionChange = (qIndex: number, oIndex: number, field: string, value: any) => {
        const updatedQuestions = [...newQuiz.questions];
        updatedQuestions[qIndex].options[oIndex] = { ...updatedQuestions[qIndex].options[oIndex], [field]: value };
        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    };

    const handleCreateQuiz = async (e: any) => {
        e.preventDefault();
        try {
            await createQuiz(newQuiz);
            setNewQuiz({
                title: '',
                description: '',
                timeLimit: 30,
                timeLimitPerQuestion: false,
                documentMode: 'NO_DOCS',
                cameraSurveillanceEnabled: false,
                randomizeQuestions: false,
                randomizeAnswers: true,
                maxAttempts: 3,
                publishDate: new Date().toISOString().slice(0, 16),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                isDraft: false,
                passingScore: 60.0,
                moduleId: id,
                questions: [
                    {
                        text: '',
                        hint: '',
                        orderIndex: 1,
                        points: 10,
                        type: 'SINGLE_CHOICE',
                        options: [
                            { text: '', correct: true },
                            { text: '', correct: false }
                        ]
                    }
                ]
            });
            fetchData();
        } catch (error) {
            console.error("Error creating quiz:", error);
        }
    };

    const handleDelete = async (quizId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ?")) {
            try {
                await deleteQuiz(quizId);
                fetchData();
            } catch (error) {
                console.error("Error deleting quiz:", error);
            }
        }
    };

    if (loading && !module) return <PageLoading />;

    return (
        <>
            <div className="content-header">
                <div className="container">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Gérer les quiz : {module?.title}</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><Link to={"/lecturer"}>Accueil</Link></li>
                                <li className="breadcrumb-item active">Quiz</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card card-primary">
                                <div className="card-header">
                                    <h3 className="card-title">Créer un nouveau quiz</h3>
                                </div>
                                <form onSubmit={handleCreateQuiz}>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Titre du quiz</label>
                                                    <input type="text" className="form-control" required
                                                        value={newQuiz.title}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                                                        placeholder="Entrez le titre" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Note de réussite (%)</label>
                                                    <input type="number" className="form-control" required min="0" max="100" step="0.5"
                                                        value={newQuiz.passingScore}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, passingScore: parseFloat(e.target.value) })} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea className="form-control" rows={3}
                                                value={newQuiz.description}
                                                onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                                                placeholder="Entrez la description"></textarea>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Durée (min)</label>
                                                    <input type="number" className="form-control" min="1"
                                                        value={newQuiz.timeLimit}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) })} />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Nombre de tentatives</label>
                                                    <input type="number" className="form-control" min="1"
                                                        value={newQuiz.maxAttempts}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, maxAttempts: parseInt(e.target.value) })} />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Date de publication</label>
                                                    <input type="datetime-local" className="form-control"
                                                        value={newQuiz.publishDate}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, publishDate: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Date limite</label>
                                                    <input type="datetime-local" className="form-control"
                                                        value={newQuiz.dueDate}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, dueDate: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Mode documents</label>
                                                    <select className="form-control"
                                                        value={newQuiz.documentMode}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, documentMode: e.target.value })}>
                                                        <option value="NO_DOCS">Pas de documents</option>
                                                        <option value="PARTIAL">Partiel</option>
                                                        <option value="FULL">Total</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-check mt-4">
                                                    <input type="checkbox" className="form-check-input"
                                                        checked={newQuiz.randomizeQuestions}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, randomizeQuestions: e.target.checked })} />
                                                    <label className="form-check-label">Randomiser les questions</label>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-check mt-4">
                                                    <input type="checkbox" className="form-check-input"
                                                        checked={newQuiz.randomizeAnswers}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, randomizeAnswers: e.target.checked })} />
                                                    <label className="form-check-label">Randomiser les réponses</label>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-check mt-4">
                                                    <input type="checkbox" className="form-check-input"
                                                        checked={newQuiz.cameraSurveillanceEnabled}
                                                        onChange={(e) => setNewQuiz({ ...newQuiz, cameraSurveillanceEnabled: e.target.checked })} />
                                                    <label className="form-check-label">Surveillance caméra</label>
                                                </div>
                                            </div>
                                        </div>

                                        <hr />
                                        <h4>Questions</h4>
                                        {newQuiz.questions.map((question, qIndex) => (
                                            <div key={qIndex} className="card card-outline card-info mb-3">
                                                <div className="card-header d-flex justify-content-between align-items-center">
                                                    <h5 className="card-title mb-0">Question {qIndex + 1}</h5>
                                                    <button type="button" className="btn btn-sm btn-danger"
                                                        onClick={() => handleRemoveQuestion(qIndex)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-8">
                                                            <div className="form-group">
                                                                <label>Texte de la question</label>
                                                                <input type="text" className="form-control" required
                                                                    value={question.text}
                                                                    onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <div className="form-group">
                                                                <label>Type</label>
                                                                <select className="form-control"
                                                                    value={question.type}
                                                                    onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}>
                                                                    <option value="SINGLE_CHOICE">Choix unique</option>
                                                                    <option value="MULTIPLE_CHOICE">Choix multiple</option>
                                                                    <option value="TRUE_FALSE">Vrai/Faux</option>
                                                                    <option value="SHORT_ANSWER">Réponse courte</option>
                                                                    <option value="ESSAY">Dissertation</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <div className="form-group">
                                                                <label>Points</label>
                                                                <input type="number" className="form-control" min="1"
                                                                    value={question.points}
                                                                    onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Indice (optionnel)</label>
                                                        <input type="text" className="form-control"
                                                            value={question.hint}
                                                            onChange={(e) => handleQuestionChange(qIndex, 'hint', e.target.value)} />
                                                    </div>

                                                    {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') && (
                                                        <div>
                                                            <label>Options de réponse</label>
                                                            {question.options.map((option, oIndex) => (
                                                                <div key={oIndex} className="input-group mb-2">
                                                                    <div className="input-group-prepend">
                                                                        <div className="input-group-text">
                                                                            <input type="checkbox"
                                                                                checked={option.correct}
                                                                                onChange={(e) => handleOptionChange(qIndex, oIndex, 'correct', e.target.checked)} />
                                                                        </div>
                                                                    </div>
                                                                    <input type="text" className="form-control" required
                                                                        value={option.text}
                                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                                                                        placeholder={`Option ${oIndex + 1}`} />
                                                                    <div className="input-group-append">
                                                                        <button type="button" className="btn btn-danger"
                                                                            onClick={() => handleRemoveOption(qIndex, oIndex)}>
                                                                            <i className="fas fa-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {(question.type !== 'TRUE_FALSE') && (
                                                                <button type="button" className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleAddOption(qIndex)}>
                                                                    <i className="fas fa-plus"></i> Ajouter une option
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-outline-primary mb-3"
                                            onClick={handleAddQuestion}>
                                            <i className="fas fa-plus"></i> Ajouter une question
                                        </button>
                                    </div>
                                    <div className="card-footer">
                                        <button type="submit" className="btn btn-primary btn-block">
                                            Créer le quiz
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="card card-outline card-primary">
                                <div className="card-header">
                                    <h3 className="card-title">Quiz existants</h3>
                                </div>
                                <div className="card-body p-0">
                                    {quizzes.length === 0 ? (
                                        <div className="p-5 text-center text-muted">
                                            <p>Aucun quiz n'a été créé pour ce module.</p>
                                        </div>
                                    ) : (
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Titre</th>
                                                    <th>Description</th>
                                                    <th>Durée</th>
                                                    <th>Tentatives</th>
                                                    <th>Note de réussite</th>
                                                    <th className="text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quizzes.map((quiz: any) => (
                                                    <tr key={quiz.id}>
                                                        <td><strong>{quiz.title}</strong></td>
                                                        <td>{quiz.description}</td>
                                                        <td>{quiz.timeLimit} min</td>
                                                        <td>{quiz.maxAttempts}</td>
                                                        <td>{quiz.passingScore}%</td>
                                                        <td className="text-right">
                                                            <button onClick={() => handleDelete(quiz.id)} className="btn btn-sm btn-danger">
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LecturerQuiz;
