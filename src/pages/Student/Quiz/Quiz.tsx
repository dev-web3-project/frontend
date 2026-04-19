import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getQuizzesByModuleId, getModuleById, getQuizById, submitQuiz } from "../../../services/api/course";
import PageLoading from "../../../components/Admin/PageLoading";
import { useAuth } from "../../../services/AuthContext";

const StudentQuiz = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [module, setModule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeQuiz, setActiveQuiz] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [mouseExitCount, setMouseExitCount] = useState(0);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [autoSubmitted, setAutoSubmitted] = useState(false);
    const quizContainerRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && activeQuiz && activeQuiz.documentMode === 'NO_DOCS') {
                setTabSwitchCount(prev => prev + 1);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [activeQuiz]);

    useEffect(() => {
        if (mouseExitCount >= 3 && activeQuiz && activeQuiz.documentMode === 'NO_DOCS') {
            handleSubmitQuiz(true);
        }
    }, [mouseExitCount, activeQuiz]);

    const handleMouseLeave = () => {
        if (activeQuiz && activeQuiz.documentMode === 'NO_DOCS') {
            setMouseExitCount(prev => prev + 1);
        }
    };

    const startQuiz = async (quizId: string) => {
        try {
            const quizData = await getQuizById(quizId);
            let questions = [...quizData.questions];
            
            if (quizData.randomizeQuestions) {
                questions.sort(() => Math.random() - 0.5);
            }
            
            if (quizData.randomizeAnswers) {
                questions = questions.map(q => ({
                    ...q,
                    options: [...q.options].sort(() => Math.random() - 0.5)
                }));
            }

            setActiveQuiz({ ...quizData, questions });
            setCurrentQuestionIndex(0);
            setAnswers(questions.map(() => ({ questionId: null, selectedOptionId: null, textAnswer: '' })));
            setStartTime(new Date());
            setMouseExitCount(0);
            setTabSwitchCount(0);
            setAutoSubmitted(false);
        } catch (error) {
            console.error("Error starting quiz:", error);
        }
    };

    const selectAnswer = (optionId: number) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = {
            ...updatedAnswers[currentQuestionIndex],
            questionId: activeQuiz.questions[currentQuestionIndex].id,
            selectedOptionId: optionId
        };
        setAnswers(updatedAnswers);
    };

    const handleTextAnswer = (text: string) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = {
            ...updatedAnswers[currentQuestionIndex],
            questionId: activeQuiz.questions[currentQuestionIndex].id,
            textAnswer: text
        };
        setAnswers(updatedAnswers);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < activeQuiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async (auto = false) => {
        if (!user || !activeQuiz) return;

        if (!auto && !window.confirm("Êtes-vous sûr de vouloir soumettre le quiz ?")) {
            return;
        }

        try {
            const submissionData = {
                quizId: activeQuiz.id,
                studentId: user.username,
                answers: answers.filter(a => a.questionId !== null),
                integrityReport: {
                    mouseExitCount,
                    tabSwitchCount,
                    autoSubmitted: auto,
                    suspiciousVideoSegments: [],
                    notes: ''
                }
            };

            await submitQuiz(submissionData);
            setActiveQuiz(null);
            fetchData();
        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    };

    if (loading && !module) return <PageLoading />;

    if (activeQuiz) {
        const currentQuestion = activeQuiz.questions[currentQuestionIndex];
        const currentAnswer = answers[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;

        return (
            <div className="content">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <div 
                                className="card card-primary"
                                ref={quizContainerRef}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h3 className="card-title mb-0">{activeQuiz.title}</h3>
                                        <div className="text-muted">
                                            Question {currentQuestionIndex + 1} sur {activeQuiz.questions.length}
                                        </div>
                                    </div>
                                    <div className="progress mt-2" style={{ height: '10px' }}>
                                        <div 
                                            className="progress-bar" 
                                            role="progressbar" 
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    {activeQuiz.documentMode === 'NO_DOCS' && (
                                        <div className="mt-2 text-danger small">
                                            <i className="fas fa-exclamation-triangle"></i> Mode anti-triche activé ! 
                                            Sorties de souris : {mouseExitCount}/3
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    <div className="mb-4">
                                        <h4>{currentQuestion.text}</h4>
                                        {currentQuestion.hint && (
                                            <small className="text-muted">
                                                <i className="fas fa-lightbulb"></i> Indice : {currentQuestion.hint}
                                            </small>
                                        )}
                                    </div>

                                    {currentQuestion.type === 'SINGLE_CHOICE' && (
                                        <div className="list-group">
                                            {currentQuestion.options.map((option: any) => (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    className={`list-group-item list-group-item-action ${currentAnswer.selectedOptionId === option.id ? 'active' : ''}`}
                                                    onClick={() => selectAnswer(option.id)}
                                                >
                                                    {option.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                                        <div className="list-group">
                                            {currentQuestion.options.map((option: any) => (
                                                <label key={option.id} className="list-group-item">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2"
                                                        checked={currentAnswer.selectedOptionId === option.id}
                                                        onChange={() => selectAnswer(option.id)}
                                                    />
                                                    {option.text}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {currentQuestion.type === 'TRUE_FALSE' && (
                                        <div className="btn-group btn-group-toggle d-flex">
                                            {currentQuestion.options.map((option: any) => (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    className={`btn ${currentAnswer.selectedOptionId === option.id ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => selectAnswer(option.id)}
                                                >
                                                    {option.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {(currentQuestion.type === 'SHORT_ANSWER' || currentQuestion.type === 'ESSAY') && (
                                        <div className="form-group">
                                            <textarea
                                                className="form-control"
                                                rows={currentQuestion.type === 'ESSAY' ? 10 : 3}
                                                value={currentAnswer.textAnswer}
                                                onChange={(e) => handleTextAnswer(e.target.value)}
                                                placeholder="Entrez votre réponse..."
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={prevQuestion}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        <i className="fas fa-arrow-left"></i> Précédent
                                    </button>
                                    {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={() => handleSubmitQuiz(false)}
                                        >
                                            Soumettre le quiz
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={nextQuestion}
                                        >
                                            Suivant <i className="fas fa-arrow-right"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content-header">
                <div className="container">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Quiz disponibles : {module?.title}</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><Link to={"/student"}>Accueil</Link></li>
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
                            <div className="card card-outline card-primary">
                                <div className="card-header">
                                    <h3 className="card-title">Quiz disponibles</h3>
                                </div>
                                <div className="card-body p-0">
                                    {quizzes.length === 0 ? (
                                        <div className="p-5 text-center text-muted">
                                            <p>Aucun quiz n'est disponible pour ce module.</p>
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
                                                    <th className="text-right">Action</th>
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
                                                            <button 
                                                                onClick={() => startQuiz(quiz.id)}
                                                                className="btn btn-sm btn-primary"
                                                            >
                                                                Commencer le quiz
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

export default StudentQuiz;
