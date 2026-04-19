import { useEffect, useState } from "react";
import BreadCrumb from "../../../../components/Admin/Breadcrumb";
import 'datatables.net-buttons-bs5';
import { Link, useNavigate } from "react-router-dom";
import { deleteGenie, getGenies } from "../../../../services/api/usiversity";
import PageLoading from "../../../../components/Admin/PageLoading";

const Genie = () => {
    const [genie, setGenie] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const listGenies = async () => {
        const data = await getGenies();
        setGenie(data);
        setLoading(false);
    }

    useEffect(() => {
        listGenies().then(r => r);
    }, []);

    useEffect(() => {
        if (!loading) {
            const table = $('#genie-table').DataTable({
                lengthChange: false,
                autoWidth: false,
                ordering: false,
                buttons: [
                    {
                        text: 'Ajouter Nouveau',
                        action: function (e: any, dt: any, node: any, config: any) {
                            navigate("/admin/university/genie/new");
                        },
                    },
                ],
            });
            table.buttons().container().appendTo('#genie-table_wrapper .col-md-6:eq(0)');

            return () => {
                table.destroy();
            }
        }

    }, [loading, navigate]);

    const handleDelete = async (id: string) => {
        await deleteGenie(id);
        await listGenies();
    }

    if (loading) {
        return <PageLoading />
    }

    return (
        <section className="content">
            <BreadCrumb page_name="Génies" parent_name="Université" />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <table id="genie-table" className="table table-hover text-nowrap">
                                    <thead>
                                    <tr>
                                        <th className="col-3">ID Génie</th>
                                        <th className="col-5">Nom du génie</th>
                                        <th className="col-1"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            Array.isArray(genie) && genie.length > 0 ? (
                                                genie.map((f: any) => (
                                                    <tr key={f.id}>
                                                        <td>{f.gid}</td>
                                                        <td><Link
                                                            to={`/admin/university/genie/${f.id}/details`}>{f.name}</Link>
                                                        </td>
                                                        <td>
                                                            <i className="fas fa-ellipsis-v button-cursor-pointer"
                                                               id="dropdownMenuButton1" data-toggle="dropdown"
                                                               aria-haspopup="true"></i>
                                                            <div className="dropdown-menu"
                                                                 aria-labelledby="dropdownMenuButton1">
                                                                <a className="dropdown-item"
                                                                   href={`/admin/university/genie/${f.id}/details`}>Modifier</a>
                                                                <a className="dropdown-item text-danger" type="button"
                                                                   onClick={() => handleDelete(f.id)}>Supprimer</a>
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

export default Genie;
