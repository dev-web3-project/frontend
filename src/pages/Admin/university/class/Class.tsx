import { useEffect, useState } from "react";
import BreadCrumb from "../../../../components/Admin/Breadcrumb";
import 'datatables.net-buttons-bs5';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { deleteClass, getClasses, getGeniesByClassId } from "../../../../services/api/usiversity";
import { getModules } from "../../../../services/api/course";
import PageLoading from "../../../../components/Admin/PageLoading";
import { GIT_CURRICULUM } from "./curriculum";

const Class = () => {
    const [classData, setClassData] = useState<any[]>([]);
    const [classGenies, setClassGenies] = useState<{ [key: string]: any[] }>({});
    const [loading, setLoading] = useState(true);
    const [expandedClasses, setExpandedClasses] = useState<{ [key: string]: boolean }>({});
    const [selectedGenie, setSelectedGenie] = useState<any>(null);
    const [genieModules, setGenieModules] = useState<any[]>([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const [localCurriculum, setLocalCurriculum] = useState<any>(GIT_CURRICULUM);
    const [editingModule, setEditingModule] = useState<string | null>(null);
    const [newHours, setNewHours] = useState<number>(0);
    
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const filterQuery = queryParams.get('q');

    const EPT_GENIES = [
        { id: 'gc', name: 'Génie Civil', gid: 'GC' },
        { id: 'gem', name: 'Génie Électromécanique', gid: 'GEM' },
        { id: 'git', name: 'Génie Informatique et Télécoms', gid: 'GIT' },
        { id: 'ga', name: 'Génie Aéronautique', gid: 'GA' },
        { id: 'gi', name: 'Génie Industriel', gid: 'GI' }
    ];

    const listClasses = async () => {
        setLoading(true);
        const data = await getClasses();
        let filteredData = data || [];
        
        // If no classes exist yet, and we have a DIC/TC query, create a virtual class for display
        if ((!filteredData || filteredData.length === 0) && filterQuery) {
            filteredData = [{
                id: 'virtual-' + filterQuery,
                name: filterQuery,
                clid: filterQuery,
                description: 'Classe ' + filterQuery + ' (EPT)'
            }];
        } else if (filterQuery && Array.isArray(filteredData)) {
            const normalizedQuery = filterQuery.toLowerCase().replace(/\s/g, '');
            filteredData = filteredData.filter((cls: any) => {
                const nameMatch = cls.name.toLowerCase().replace(/\s/g, '').includes(normalizedQuery);
                const idMatch = cls.clid?.toLowerCase().replace(/\s/g, '').includes(normalizedQuery);
                return nameMatch || idMatch;
            });

            // If query is for a standard EPT level but no match in DB, show a virtual one
            if (filteredData.length === 0 && (filterQuery.includes('DIC') || filterQuery.includes('TC'))) {
                filteredData = [{
                    id: 'virtual-' + filterQuery,
                    name: filterQuery,
                    clid: filterQuery,
                    description: 'Classe ' + filterQuery + ' (EPT)'
                }];
            }
        }

        setClassData(filteredData);
        
        if (Array.isArray(filteredData)) {
            const geniePromises = filteredData.map(async (cls: any) => {
                let genies: any[] = [];
                if (!cls.id.toString().startsWith('virtual-')) {
                    const res = await getGeniesByClassId(cls.id);
                    genies = Array.isArray(res) ? res : [];
                }
                
                // Fallback for DIC levels to show the 5 standard genies if none are found
                if (genies.length === 0 && (cls.name.includes('DIC') || cls.name === 'TC2')) {
                    genies = EPT_GENIES.map(g => ({ ...g, id: `${cls.id}-${g.id}` }));
                }
                
                return { classId: cls.id, genies };
            });
            
            const results = await Promise.all(geniePromises);
            const genieMap: { [key: string]: any[] } = {};
            const initialExpanded: { [key: string]: boolean } = {};
            
            results.forEach((result) => {
                genieMap[result.classId] = result.genies;
                if (filterQuery) {
                    initialExpanded[result.classId] = true;
                }
            });
            setClassGenies(genieMap);
            setExpandedClasses(initialExpanded);
        }
        
        setLoading(false);
    }

    useEffect(() => {
        listClasses();
    }, [filterQuery]);

    const handleGenieClick = async (genie: any, className: string) => {
        if (selectedGenie?.id === genie.id) {
            setSelectedGenie(null);
            setGenieModules([]);
            return;
        }

        setSelectedGenie(genie);
        setLoadingModules(true);
        
        try {
            const allModules = await getModules();
            // Priority: Check if we have standard EPT GIT curriculum for this level
            const level = className.toUpperCase().replace(/\s/g, '');
            if (genie.gid === 'GIT' && localCurriculum[level]) {
                const enriched = localCurriculum[level].map((m: any) => {
                    const dbMod = Array.isArray(allModules) ? allModules.find((am: any) => 
                        am.title.toLowerCase().includes(m.title.toLowerCase()) || 
                        am.title.toLowerCase().includes(m.code.toLowerCase())
                    ) : null;
                    return { ...m, dbId: dbMod ? dbMod.id : null };
                });
                setGenieModules(enriched);
            } else {
                if (Array.isArray(allModules)) {
                    const genieParts = genie.name.split(' ');
                    const filtered = allModules.filter((m: any) => {
                        const title = m.title.toLowerCase();
                        return genieParts.some((part: string) => part.length > 2 && title.includes(part.toLowerCase()));
                    });
                    const finalMods = filtered.length > 0 ? filtered : allModules.slice(0, 5);
                    setGenieModules(finalMods.map((m: any) => ({ ...m, dbId: m.id })));
                }
            }
        } catch (e) {
            setGenieModules([]);
        } finally {
            setLoadingModules(false);
        }
    };

    const handleUpdateHours = (moduleId: string, hours: number, className: string) => {
        // Update currently displayed modules
        const newGenieModules = genieModules.map((m: any) => {
            const currentId = m.code || m.id;
            if (currentId === moduleId) {
                return { ...m, hoursDone: hours };
            }
            return m;
        });
        setGenieModules(newGenieModules);

        // Also update localCurriculum if applicable
        const level = className.toUpperCase().replace(/\s/g, '');
        if (localCurriculum[level]) {
            const updatedLevelModules = localCurriculum[level].map((m: any) => {
                if (m.code === moduleId || m.id === moduleId) {
                    return { ...m, hoursDone: hours };
                }
                return m;
            });
            setLocalCurriculum({
                ...localCurriculum,
                [level]: updatedLevelModules
            });
        }

        setEditingModule(null);
    };

    const toggleClassExpansion = (classId: string) => {
        setExpandedClasses(prev => ({
            ...prev,
            [classId]: !prev[classId]
        }));
    };

    const handleDelete = async (id: string) => {
        await deleteClass(id);
        await listClasses();
    }

    if (loading) {
        return <PageLoading />
    }

    return (
        <section className="content">
            <BreadCrumb page_name="Classes & Génies" parent_name="EPT - Gestion" />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    {Array.isArray(classData) && classData.length > 0 ? (
                                        classData.map((cls: any) => (
                                            <div key={cls.id} className="col-md-12 mb-4">
                                                <div className="card card-outline card-indigo h-100">
                                                    <div className="card-header border-0 bg-transparent">
                                                        <h3 className="card-title d-flex align-items-center">
                                                            <i className="fas fa-graduation-cap mr-3 text-indigo"></i>
                                                            <Link to={`/admin/university/class/${cls.id}/details`} className="text-dark font-weight-bold h5 mb-0">
                                                                {cls.name}
                                                            </Link>
                                                        </h3>
                                                        <div className="card-tools">
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-tool" 
                                                                onClick={() => toggleClassExpansion(cls.id)}
                                                            >
                                                                <i className={`fas fa-${expandedClasses[cls.id] ? 'minus' : 'plus'}`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className={`card-body pt-0 ${!expandedClasses[cls.id] ? 'd-none' : ''}`}>
                                                        <p className="text-sm text-muted mb-4 border-left pl-3" style={{borderColor: 'var(--green)'}}>{cls.clid} — {cls.description}</p>
                                                        
                                                        <h5 className="mb-3 small font-weight-bold text-uppercase text-muted letter-spacing-1">
                                                            <i className="fas fa-layer-group mr-2 text-teal"></i>
                                                            Spécialités (Génies)
                                                        </h5>
                                                        
                                                        <div className="d-flex flex-wrap gap-2 mb-4">
                                                            {Array.isArray(classGenies[cls.id]) && classGenies[cls.id].length > 0 ? (
                                                                classGenies[cls.id].map((genie: any) => (
                                                                    <div 
                                                                        key={genie.id} 
                                                                        className={`p-3 rounded border mb-2 mr-2 transition-all shadow-sm ${selectedGenie?.id === genie.id ? 'border-success bg-dark text-white' : 'bg-light'}`}
                                                                        style={{ flex: '1 1 18%', minWidth: '160px', cursor: 'pointer' }}
                                                                        onClick={() => handleGenieClick(genie, cls.name)}
                                                                    >
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <span className={`font-weight-bold ${selectedGenie?.id === genie.id ? 'text-green' : ''}`}>{genie.name}</span>
                                                                            <i className={`fas fa-chevron-${selectedGenie?.id === genie.id ? 'down' : 'right'} tiny opacity-50`}></i>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-muted small">Aucun génie associé</p>
                                                            )}
                                                        </div>

                                                        {/* Modules Section (Conditional) */}
                                                        {selectedGenie && Array.isArray(classGenies[cls.id]) && classGenies[cls.id].some((g: any) => g.id === selectedGenie.id) && (
                                                            <div className="mt-4 p-4 rounded bg-dark text-white border-top border-green shadow-lg">
                                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                                    <div>
                                                                        <h4 className="font-weight-bold text-green mb-0">Maquette : {selectedGenie.name}</h4>
                                                                        <span className="text-xs text-muted">Programme officiel DIC - EPT Thiès</span>
                                                                    </div>
                                                                    {loadingModules && <i className="fas fa-sync fa-spin text-green h4"></i>}
                                                                </div>

                                                                <div className="table-responsive">
                                                                    <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                                                                        <thead style={{ borderBottom: '2px solid #333' }}>
                                                                            <tr className="text-muted text-xs text-uppercase">
                                                                                <th className="border-0">Module</th>
                                                                                <th className="border-0 text-center">Code</th>
                                                                                <th className="border-0 text-center">CM</th>
                                                                                <th className="border-0 text-center">TD</th>
                                                                                <th className="border-0 text-center">TP</th>
                                                                                <th className="border-0 text-center text-green">Fait (h)</th>
                                                                                <th className="border-0 text-center">Total</th>
                                                                                <th className="border-0 text-center">Statut</th>
                                                                                <th className="border-0 text-center" style={{ width: '150px' }}>Progression</th>
                                                                                <th className="border-0 text-right">Crédits</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {genieModules.length > 0 ? (
                                                                                genieModules.map((m: any) => {
                                                                                    const totalExpected = (m.cm || 0) + (m.td || 0) + (m.tp || 0);
                                                                                    const progress = totalExpected > 0 ? Math.round((m.hoursDone / totalExpected) * 100) : 0;
                                                                                    
                                                                                    return (
                                                                                        <tr key={m.code || m.id} style={{ borderBottom: '1px solid #222' }}>
                                                                                            <td className="py-3">
                                                                                                {m.dbId ? (
                                                                                                    <Link to={`/admin/university/module/${m.dbId}/details`} className="font-weight-bold text-green text-decoration-none">
                                                                                                        {m.title.replace(/^\[.*?\]\s*/, '')} <i className="fas fa-external-link-alt text-xs ml-1 opacity-50"></i>
                                                                                                    </Link>
                                                                                                ) : (
                                                                                                    <span className="font-weight-bold">{m.title.replace(/^\[.*?\]\s*/, '')}</span>
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="text-center text-muted small">{m.code || 'N/A'}</td>
                                                                                            <td className="text-center">{m.cm || '-'}h</td>
                                                                                            <td className="text-center">{m.td || '-'}h</td>
                                                                                            <td className="text-center">{m.tp || '-'}h</td>
                                                                                            <td className="text-center position-relative">
                                                                                                {editingModule === (m.code || m.id) ? (
                                                                                                    <div className="d-flex align-items-center justify-content-center">
                                                                                                        <input 
                                                                                                            type="number" 
                                                                                                            className="form-control form-control-sm bg-dark text-white border-green text-center" 
                                                                                                            style={{ width: '60px' }}
                                                                                                            defaultValue={m.hoursDone}
                                                                                                            onBlur={(e) => handleUpdateHours(m.code || m.id, parseInt(e.target.value) || 0, cls.name)}
                                                                                                            onKeyDown={(e) => {
                                                                                                                if (e.key === 'Enter') handleUpdateHours(m.code || m.id, parseInt((e.target as any).value) || 0, cls.name);
                                                                                                            }}
                                                                                                            autoFocus
                                                                                                        />
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div 
                                                                                                        className="button-cursor-pointer d-flex align-items-center justify-content-center"
                                                                                                        onClick={() => setEditingModule(m.code || m.id)}
                                                                                                    >
                                                                                                        <span className="text-green font-weight-bold mr-2">{m.hoursDone || 0}h</span>
                                                                                                        <i className="fas fa-edit text-xs opacity-30"></i>
                                                                                                    </div>
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="text-center font-weight-bold opacity-70">{totalExpected}h</td>
                                                                                            <td className="text-center">
                                                                                                <span className={`badge ${
                                                                                                    progress >= 100 ? 'badge-secondary' : 
                                                                                                    progress > 0 ? 'badge-primary' : 'badge-danger'
                                                                                                } text-xs px-2`}>
                                                                                                    {progress >= 100 ? 'Terminé' : progress > 0 ? 'En cours' : 'Non démarré'}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="text-center align-middle">
                                                                                                <div className="progress progress-xxs bg-dark-dim mt-1" style={{ height: '6px', borderRadius: '3px' }}>
                                                                                                    <div 
                                                                                                        className={`progress-bar ${progress >= 100 ? 'bg-success' : 'bg-green'}`} 
                                                                                                        role="progressbar" 
                                                                                                        style={{ width: `${progress}%` }}
                                                                                                        aria-valuenow={progress} 
                                                                                                        aria-valuemin={0} 
                                                                                                        aria-valuemax={100}
                                                                                                    ></div>
                                                                                                </div>
                                                                                                <div className="text-xs mt-1 opacity-50">{progress}%</div>
                                                                                            </td>
                                                                                            <td className="text-right">
                                                                                                <span className="badge badge-success px-2 py-1">{m.credits} ECTS</span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })
                                                                            ) : !loadingModules && (
                                                                                <tr>
                                                                                    <td colSpan={7} className="text-center py-5 text-muted">
                                                                                        <i className="fas fa-folder-open mb-2 h3 d-block"></i>
                                                                                        Aucun module trouvé pour ce génie dans cette classe.
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12">
                                            <div className="alert alert-info bg-dark border-success">
                                                <h5><i className="icon fas fa-info text-green"></i> Explorateur Académique</h5>
                                                Sélectionnez une classe ou un niveau dans le menu latéral pour explorer les spécialités et leurs maquettes de cours.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Class;
