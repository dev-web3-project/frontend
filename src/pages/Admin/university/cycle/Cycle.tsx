import { useEffect, useState } from "react";
import BreadCrumb from "../../../../components/Admin/Breadcrumb";
import { Link, useNavigate } from "react-router-dom";
import { deleteCycle, getCycles, getClassesByCycleId } from "../../../../services/api/usiversity";
import PageLoading from "../../../../components/Admin/PageLoading";

const Cycle = () => {
    const [cycles, setCycles] = useState<any[]>([]);
    const [cycleClasses, setCycleClasses] = useState<{ [key: string]: any[] }>({});
    const [loading, setLoading] = useState(true);
    const [expandedCycles, setExpandedCycles] = useState<{ [key: string]: boolean }>({});
    const navigate = useNavigate();

    const listCycles = async () => {
        const data = await getCycles();
        setCycles(data || []);
        
        if (Array.isArray(data)) {
            const classPromises = data.map(async (cycle: any) => {
                const classes = await getClassesByCycleId(cycle.id);
                return { cycleId: cycle.id, classes: classes || [] };
            });
            
            const results = await Promise.all(classPromises);
            const classMap: { [key: string]: any[] } = {};
            results.forEach((result) => {
                classMap[result.cycleId] = result.classes;
            });
            setCycleClasses(classMap);
        }
        
        setLoading(false);
    }

    useEffect(() => {
        listCycles().then(r => r);
    }, []);

    const toggleCycleExpansion = (cycleId: string) => {
        setExpandedCycles(prev => ({
            ...prev,
            [cycleId]: !prev[cycleId]
        }));
    };

    const handleDelete = async (id: string) => {
        await deleteCycle(id);
        await listCycles();
    }

    if (loading) {
        return <PageLoading />
    }

    return (
        <section className="content">
            <BreadCrumb page_name="Cycles" parent_name="EPT - Gestion" />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    {Array.isArray(cycles) && cycles.length > 0 ? (
                                        cycles.map((cycle: any) => (
                                            <div key={cycle.id} className="col-md-6 mb-3">
                                                <div className="card card-outline card-purple">
                                                    <div className="card-header">
                                                        <h3 className="card-title d-flex align-items-center">
                                                            <i className="fas fa-redo-alt mr-2"></i>
                                                            <Link to={`/admin/university/cycle/${cycle.id}/details`} className="text-dark">
                                                                {cycle.name}
                                                            </Link>
                                                        </h3>
                                                        <div className="card-tools">
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-tool" 
                                                                onClick={() => toggleCycleExpansion(cycle.id)}
                                                            >
                                                                <i className={`fas fa-${expandedCycles[cycle.id] ? 'minus' : 'plus'}`}></i>
                                                            </button>
                                                            <i className="fas fa-ellipsis-v button-cursor-pointer"
                                                               id="dropdownMenuButton1" data-toggle="dropdown"
                                                               aria-haspopup="true"></i>
                                                            <div className="dropdown-menu dropdown-menu-right"
                                                                 aria-labelledby="dropdownMenuButton1">
                                                                <a className="dropdown-item"
                                                                   href={`/admin/university/cycle/${cycle.id}/details`}>
                                                                    <i className="fas fa-edit mr-2"></i>Modifier
                                                                </a>
                                                                <a className="dropdown-item text-danger" type="button"
                                                                   onClick={() => handleDelete(cycle.id)}>
                                                                    <i className="fas fa-trash mr-2"></i>Supprimer
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`card-body ${!expandedCycles[cycle.id] ? 'd-none' : ''}`}>
                                                        <p className="text-sm text-muted mb-2">{cycle.cid} - {cycle.description || 'Pas de description'}</p>
                                                        <h5 className="mb-2">
                                                            <i className="fas fa-graduation-cap mr-2 text-indigo"></i>
                                                            Classes ({cycleClasses[cycle.id]?.length || 0})
                                                        </h5>
                                                        <div className="row">
                                                            {cycleClasses[cycle.id]?.length > 0 ? (
                                                                cycleClasses[cycle.id].map((cls: any) => (
                                                                    <div key={cls.id} className="col-md-12 mb-1">
                                                                        <div className="callout callout-indigo" style={{padding: '10px'}}>
                                                                            <div className="d-flex justify-content-between">
                                                                                <Link to={`/admin/university/class/${cls.id}/details`} className="text-dark">
                                                                                    <span className="font-weight-bold">{cls.name}</span>
                                                                                </Link>
                                                                                <span className="badge bg-indigo">{cls.clid}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="col-md-12">
                                                                    <p className="text-muted">Aucune classe associée</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12">
                                            <div className="alert alert-info">
                                                <h5><i className="icon fas fa-info"></i> Info!</h5>
                                                Aucun cycle n'a été créé pour le moment.
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center mt-4">
                                    <button 
                                        className="btn btn-primary btn-lg"
                                        onClick={() => navigate("/admin/university/cycle/new")}
                                    >
                                        <i className="fas fa-plus mr-2"></i> Ajouter un nouveau cycle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Cycle;
