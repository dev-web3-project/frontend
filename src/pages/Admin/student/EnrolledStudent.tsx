import { useEffect, useState } from "react";
import BreadCrumb from "../../../components/Admin/Breadcrumb";
import 'datatables.net-buttons-bs5';
import { Link, useNavigate } from "react-router-dom";
import { deleteStudent, getStudents } from "../../../services/api/user";
import PageLoading from "../../../components/Admin/PageLoading";

const EnrolledStudent = () => {
    const [student, setStudent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const listStudents = async () => {
        const data = await getStudents();
        setStudent(data);
        setLoading(false);
    }

    useEffect(() => {
        listStudents().then(r => r);
    }, []);

    useEffect(() => {
        if (!loading) {
            const table = $('#student-table').DataTable({
                paging: student.length > 10,
                lengthChange: false,
                autoWidth: false,
                ordering: false,
                buttons: [
                    {
                        text: 'Create New',
                        action: function (e: any, dt: any, node: any, config: any) {
                            navigate("/admin/student/new");
                        },
                    },
                ],
            });
            table.buttons().container().appendTo('#student-table_wrapper .col-md-6:eq(0)');

            return () => {
                table.destroy();
            }
        }

    }, [loading]);

    const handleDelete = async (id: string) => {
        await deleteStudent(id);
        await listStudents();
    }

    if (loading) {
        return <PageLoading />
    }

    return (
        <section className="content">
            <BreadCrumb page_name="Étudiants" parent_name="Université" />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <table id="student-table" className="table table-hover text-nowrap">
                                    <thead>
                                    <tr>
                                        <th className="col-2">Matricule</th>
                                        <th className="col-3">Nom complet</th>
                                        <th className="col-2">Génie / Département</th>
                                        <th className="col-2">Niveau</th>
                                        <th className="col-2">Promotion</th>
                                        <th className="col-1"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        Array.isArray(student) && student.length > 0 ? (
                                            student.map((s: any) => (
                                                <tr key={s.id}>
                                                    <td className="font-weight-bold text-green">{s.studentId}</td>
                                                    <td>
                                                        <Link to={`/admin/student/${s.username}/details`} className="text-white">
                                                            {s.fullName}
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-info" style={{backgroundColor: '#2cb5e8', color: '#fff', padding: '5px 10px'}}>
                                                            {s.department === 'GIT' ? 'GIT' : (s.department || 'GIT')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-secondary">{s.intake || 'DIC1'}</span>
                                                    </td>
                                                    <td className="text-muted small">2023-2024</td>
                                                    <td>
                                                        <i className="fas fa-ellipsis-v button-cursor-pointer"
                                                           id={`dropdownMenu-${s.id}`} data-toggle="dropdown"
                                                           aria-haspopup="true"></i>
                                                        <div className="dropdown-menu"
                                                              aria-labelledby={`dropdownMenu-${s.id}`}>
                                                            <a className="dropdown-item"
                                                               href={`/admin/student/${s.username}/details`}>
                                                                <i className="fas fa-eye mr-2"></i> Voir Détails
                                                            </a>
                                                            <a className="dropdown-item text-danger" type="button"
                                                               onClick={() => handleDelete(s.id)}>
                                                                <i className="fas fa-trash mr-2"></i> Supprimer
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <></>
                                        )
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EnrolledStudent;