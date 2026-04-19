import React, { useEffect, useState } from "react";
import BreadCrumb from "../../../../components/Admin/Breadcrumb";
import 'datatables.net-buttons-bs5';
import { Link, useParams } from "react-router-dom";
import {
    assignGenieToClass,
    getGeniesByClassId,
    getGeniesWithoutAssigned,
    getClassById,
    unassignGenieFromClass,
    updateClass
} from "../../../../services/api/usiversity";
import { AssignButton, SaveButton } from "../../../../components/Admin/ButtonIndicator";
import PageLoading from "../../../../components/Admin/PageLoading";
import { notifyError, notifySuccess } from "../../../../components/notify";

const ClassDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [genieLoading, setGenieLoading] = useState(true);
    const [classGenieLoading, setClassGenieLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAssign, setIsAssign] = useState(false);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
    const [classData, setClassData] = useState<any>({
        id: '',
        clid: '',
        name: '',
        description: '',
        phone: '',
        email: '',
        createdDate: ''
    });
    const [genies, setGenies] = useState<any[]>([]);
    const [classGenies, setClassGenies] = useState<any[]>([]);

    useEffect(() => {
        const fetchClassDetails = async () => {
            const classDataResult = await getClassById(id || '');
            setClassData(classDataResult);
            setLoading(false);
        };
        fetchClassDetails().then(r => r);
    }, [id]);

    const fetchGenies = async () => {
        const geniesData = await getGeniesWithoutAssigned();
        setGenies(geniesData);
        setGenieLoading(false);
    };
    useEffect(() => {
        fetchGenies().then(r => r);
    }, []);

    const fetchGeniesByClass = async () => {
        const classGeniesData = await getGeniesByClassId(id || '');
        setClassGenies(classGeniesData);
        setClassGenieLoading(false);
    };
    useEffect(() => {
        fetchGeniesByClass().then(r => r);
    }, [id]);

    useEffect(() => {
        if (!classGenieLoading) {
            const table = $('#class-genies-table').DataTable({
                lengthChange: false,
                autoWidth: false,
                ordering: false,
                buttons: [
                    {
                        text: 'Ajouter un génie',
                        action: function (e: any, dt: any, node: any, config: any) {
                            $('<button type="button" style="display:none;" data-toggle="modal" data-target="#addGenieModal"></button>')
                                .appendTo('body')
                                .trigger('click')
                                .remove();
                        },
                    },
                ],
            });

            table.buttons().container().appendTo('#class-genies-table_wrapper .col-md-6:eq(0)');

            return () => {
                table.destroy();
            }
        }
    }, [classGenieLoading, id, loading]);

    useEffect(() => {
        if (!genieLoading) {
            const genTable = $('#genie-table').DataTable({
                lengthChange: false,
                autoWidth: false,
                ordering: false,
            });

            return () => {
                genTable.destroy();
            }
        }
    }, [genieLoading, id, loading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setClassData((prevClassData: any) => ({
            ...prevClassData,
            [name]: value
        }));
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSaving(true);
        if (id) {
            await updateClass(id, classData);
        }
        setTimeout(() => {
            setIsSaving(false);
        }, 1000);
    };

    const handleCheckboxChange = (id: string) => {
        setCheckedItems(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const getCheckedIds = () => {
        return Object.keys(checkedItems).filter(id => checkedItems[id]);
    };

    const handleUnassign = async (id: string) => {
        await unassignGenieFromClass(id);
        await fetchGeniesByClass();
        await fetchGenies();
    }

    const handleAssign = async () => {
        const checkedIds = getCheckedIds();
        if (checkedIds.length === 0) {
            return;
        }
        try {
            setIsAssign(true);
            await Promise.all(
                checkedIds.map(async (genieId: any) => {
                    console.log(genieId);
                    await assignGenieToClass(id || '', genieId);
                })
            );
            setTimeout(() => {
                setIsAssign(false);
            }, 1000);
            notifySuccess("Génie assigné avec succès");
            await fetchGeniesByClass();
            await fetchGenies();

        } catch (error: any) {
            notifyError(error.response.data);
            setIsAssign(false);
        }
    }

    if (loading) {
        return <PageLoading />
    }

    return (
        <section className="content">
            <BreadCrumb title={classData.name ? classData.name : 'Loading...'} page_name="Classe" parent_name="Université" />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card card-primary card-outline card-outline-tabs">
                            <div className="card-header p-0 border-bottom-0">
                                <ul className="nav nav-tabs" id="custom-tabs-four-tab" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link active" id="custom-tabs-four-details-tab" data-toggle="pill" href={"#custom-tabs-four-details"} role="tab" aria-controls="custom-tabs-four-details" aria-selected="true">Détails</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="custom-tabs-four-genies-tab" data-toggle="pill" href={"#custom-tabs-four-genies"} role="tab" aria-controls="custom-tabs-four-genies" aria-selected="false">Génies</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" id="custom-tabs-four-settings-tab" data-toggle="pill" href={"#custom-tabs-four-settings"} role="tab" aria-controls="custom-tabs-four-settings" aria-selected="false">Paramètres</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div>Loading...</div>
                                ) : (
                                    <div className="tab-content" id="custom-tabs-four-tabContent">
                                        <div className="tab-pane fade show active" id="custom-tabs-four-details" role="tabpanel" aria-labelledby="custom-tabs-four-details-tab">
                                            <form className="form-horizontal" id="createRoleForm" onSubmit={handleUpdate}>
                                                <div className="card-body">
                                                    <div className="form-group row">
                                                        <label htmlFor="clId" className="col-sm-2 col-form-label">ID Classe <span className="text-danger">*</span></label>
                                                        <div className="col-sm-10">
                                                            <input type="text" className="form-control" id="clId" name="clId" value={classData.clid} disabled />
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label htmlFor="createdDate" className="col-sm-2 col-form-label">Créé le <span className="text-danger">*</span></label>
                                                        <div className="col-sm-10">
                                                            <input type="text" className="form-control" id="createdDate" name="createdDate" value={new Date(classData.createdDate).toLocaleString()} disabled />
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label htmlFor="name" className="col-sm-2 col-form-label">Nom de la classe</label>
                                                        <div className="col-sm-10">
                                                            <input type="text" className="form-control" id="name" name="name" value={classData.name} onChange={handleChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label htmlFor="description" className="col-sm-2 col-form-label">Description</label>
                                                        <div className="col-sm-10">
                                                            <textarea className="form-control" id="description" name="description" value={classData.description} onChange={handleChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row mt-4">
                                                        <label className="col-sm-2 col-form-label"></label>
                                                        <div className="col-sm-10 d-flex">
                                                            <SaveButton isSaving={isSaving} onClick={handleUpdate} />
                                                            <button type="reset" className="btn btn-default float-right">Annuler</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="tab-pane fade" id="custom-tabs-four-genies" role="tabpanel" aria-labelledby="custom-tabs-four-genies-tab">
                                            <div className="modal fade" id="addGenieModal">
                                                <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h4 className="modal-title">Ajouter un génie à la classe</h4>
                                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                                <span aria-hidden="true">&times;</span>
                                                            </button>
                                                        </div>
                                                        <div className="modal-body">
                                                            {genieLoading ? (
                                                                <div>Loading...</div>
                                                            ) : (
                                                                <table id="genie-table" className="table table-hover text-nowrap">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="col-3">ID Génie</th>
                                                                            <th className="col-3">Nom du génie</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {
                                                                            Array.isArray(genies) && genies.length > 0 ? (
                                                                                genies.map((d: any) => (
                                                                                    <tr key={d.id}>
                                                                                        <td>
                                                                                            <div className="custom-control custom-checkbox">
                                                                                                <input type="checkbox" name="terms" className="custom-control-input scope-checkbox" id={`checkbox-${d.id}`}
                                                                                                       checked={checkedItems[d.id]} onChange={() => handleCheckboxChange(d.id)} />
                                                                                                <label className="custom-control-label" htmlFor={`checkbox-${d.id}`}></label>

                                                                                                <Link to={``}>{d.gid}</Link>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td>{d.name}</td>
                                                                                    </tr>
                                                                                ))
                                                                            ) : (
                                                                                <></>
                                                                            )
                                                                        }


                                                                    </tbody>
                                                                </table>
                                                            )}
                                                        </div>
                                                        <div className="modal-footer d-flex justify-content-start">
                                                            <AssignButton onClick={() => handleAssign()} isSaving={isAssign} disabled={Object.keys(checkedItems).filter(id => checkedItems[id]).length === 0} />
                                                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {classGenieLoading ? (
                                                <div>Loading...</div>
                                            ) : (
                                                <table id="class-genies-table" className="table table-hover text-nowrap">
                                                    <thead>
                                                        <tr>
                                                            <th className="col-2">ID Génie</th>
                                                            <th className="col-3">Nom du génie</th>
                                                            <th className="col-1"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        {
                                                            Array.isArray(classGenies) && classGenies.length > 0 ? (
                                                                classGenies.map((d: any) => (
                                                                    <tr key={d.id}>
                                                                        <td><a href="#">{d.gid}</a></td>
                                                                        <td>{d.name}</td>
                                                                        <td>
                                                                            <i className="fas fa-ellipsis-v button-cursor-pointer" typeof="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true"></i>
                                                                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                                                <button className="dropdown-item text-danger" onClick={() => handleUnassign(d.id)}>Désassigner</button>
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
                                            )}
                                        </div>

                                        <div className="tab-pane fade" id="custom-tabs-four-settings" role="tabpanel" aria-labelledby="custom-tabs-four-settings-tab">

                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ClassDetails;
