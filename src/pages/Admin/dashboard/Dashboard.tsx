import BreadCrumb from "../../../components/Admin/Breadcrumb";
import { useEffect, useState } from "react";
import { getCourseNameById, getCourses } from "../../../services/api/course";
import { getStudents, getLecturers } from "../../../services/api/user";
import { getCycles, getClasses, getGenies } from "../../../services/api/usiversity";
import PageLoading from "../../../components/Admin/PageLoading";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        students: 0,
        lecturers: 0,
        courses: 0,
        cycles: 0,
        classes: 0,
        genies: 0
    });

    const fetchData = async () => {
        try {
            const [students, lecturers, courses, cyclesData, classesData, geniesData] = await Promise.all([
                getStudents(),
                getLecturers(),
                getCourses(),
                getCycles(),
                getClasses(),
                getGenies()
            ]);

            setStats({
                students: Array.isArray(students) ? students.length : 0,
                lecturers: Array.isArray(lecturers) ? lecturers.length : 0,
                courses: Array.isArray(courses) ? courses.length : 0,
                cycles: Array.isArray(cyclesData) ? cyclesData.length : 0,
                classes: Array.isArray(classesData) ? classesData.length : 0,
                genies: Array.isArray(geniesData) ? geniesData.length : 0
            });
            setLoading(false);
        } catch (error: any) {
            console.error("Dashboard data fetch error:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <PageLoading />;

    const statCards = [
        { label: "Étudiants", value: stats.students, icon: "fas fa-user-graduate", color: "var(--green)", link: "/admin/student/enrolled" },
        { label: "Professeurs", value: stats.lecturers, icon: "fas fa-chalkboard-teacher", color: "var(--warning)", link: "/admin/lecturer/all" },
        { label: "Filières", value: stats.courses, icon: "fas fa-book", color: "var(--danger)", link: "/admin/university/course" },
        { label: "Classes", value: stats.classes, icon: "fas fa-school", color: "var(--info)", link: "/admin/university/class" },
        { label: "Départements", value: stats.genies, icon: "fas fa-sitemap", color: "var(--green)", link: "/admin/university/department" },
    ];

    return (
        <section className="content">
            <BreadCrumb page_name="Tableau de bord" parent_name="" />
            
            <div className="container-fluid">
                {/* Statistics Grid */}
                <div className="row">
                    {statCards.map((stat, idx) => (
                        <div key={idx} className="col-lg-2 col-md-4 col-6 mb-4">
                            <div className="card h-100 border-0 shadow-sm" style={{ background: 'var(--bg-card)', borderLeft: `3px solid ${stat.color}` }}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="text-muted small text-uppercase font-weight-bold">{stat.label}</span>
                                            <h3 className="mb-0 mt-1 font-weight-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</h3>
                                        </div>
                                        <div className="icon" style={{ opacity: 0.2, fontSize: '1.5rem', color: stat.color }}>
                                            <i className={stat.icon}></i>
                                        </div>
                                    </div>
                                    <a href={stat.link} className="stretched-link"></a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row">
                    {/* Activity Chart Placeholder */}
                    <div className="col-lg-7">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h3 className="card-title">Aperçu de l'Activité</h3>
                                <div className="card-tools">
                                    <button className="btn btn-tool text-muted"><i className="fas fa-ellipsis-v"></i></button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-baseline mb-4">
                                    <h2 className="mb-0 font-weight-bold">85%</h2>
                                    <span className="text-success ml-2 small font-weight-bold"><i className="fas fa-arrow-up"></i> 12%</span>
                                    <span className="text-muted ml-3 small">Taux de présence global</span>
                                </div>
                                <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0' }}>
                                    {[40, 70, 45, 90, 65, 80, 50, 85, 60, 75, 55, 95].map((h, i) => (
                                        <div key={i} style={{ 
                                            flex: 1, 
                                            height: `${h}%`, 
                                            background: i === 11 ? 'var(--green)' : 'var(--bg-elevated)',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'var(--t)'
                                        }}></div>
                                    ))}
                                </div>
                                <div className="d-flex justify-content-between text-muted mt-2 small px-1">
                                    <span>Jan</span><span>Mar</span><span>Mai</span><span>Juil</span><span>Sep</span><span>Nov</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-lg-5">
                        {/* Attendance Stats Placeholder */}
                        <div className="card">
                            <div className="card-header border-0 bg-transparent py-3">
                                <h3 className="card-title font-weight-bold">Distribution par Département</h3>
                            </div>
                            <div className="card-body pt-0">
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between mb-1 small">
                                        <span>GIT (Génie Informatique et Télécoms)</span>
                                        <span className="font-weight-bold">42%</span>
                                    </div>
                                    <div className="progress progress-xxs bg-dark-dim" style={{ height: '4px' }}>
                                        <div className="progress-bar bg-success" style={{ width: '42%' }}></div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between mb-1 small">
                                        <span>GC (Génie Civil)</span>
                                        <span className="font-weight-bold">25%</span>
                                    </div>
                                    <div className="progress progress-xxs bg-dark-dim" style={{ height: '4px' }}>
                                        <div className="progress-bar bg-info" style={{ width: '25%' }}></div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between mb-1 small">
                                        <span>GEM (Génie Électromécanique)</span>
                                        <span className="font-weight-bold">18%</span>
                                    </div>
                                    <div className="progress progress-xxs bg-dark-dim" style={{ height: '4px' }}>
                                        <div className="progress-bar bg-warning" style={{ width: '18%' }}></div>
                                    </div>
                                </div>
                                <div className="mb-0">
                                    <div className="d-flex justify-content-between mb-1 small">
                                        <span>Autres</span>
                                        <span className="font-weight-bold">15%</span>
                                    </div>
                                    <div className="progress progress-xxs bg-dark-dim" style={{ height: '4px' }}>
                                        <div className="progress-bar bg-secondary" style={{ width: '15%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* System Quick Links */}
                        <div className="card mt-4" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
                            <div className="card-body p-3">
                                <h6 className="text-muted small font-weight-bold text-uppercase mb-3">Actions Rapides</h6>
                                <div className="row no-gutters text-center">
                                    <div className="col-4">
                                        <a href="/admin/announcements" className="text-decoration-none p-2 d-block">
                                            <i className="fas fa-bullhorn mb-1 d-block text-warning"></i>
                                            <span className="small text-muted">Annonce</span>
                                        </a>
                                    </div>
                                    <div className="col-4">
                                        <a href="/admin/lecturer/all" className="text-decoration-none p-2 d-block">
                                            <i className="fas fa-user-plus mb-1 d-block text-success"></i>
                                            <span className="small text-muted">Professeur</span>
                                        </a>
                                    </div>
                                    <div className="col-4">
                                        <a href="/admin/settings" className="text-decoration-none p-2 d-block">
                                            <i className="fas fa-cog mb-1 d-block text-info"></i>
                                            <span className="small text-muted">Config</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Dashboard;
