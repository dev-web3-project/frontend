import React from 'react';
import BreadCrumb from "../../../components/Admin/Breadcrumb";

const Support = () => {
    return (
        <section className="content">
            <BreadCrumb page_name="Assistance" parent_name="Autres" />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card card-info card-outline">
                            <div className="card-header">
                                <h3 className="card-title">Centre d'aide</h3>
                            </div>
                            <div className="card-body">
                                <p>Besoin d'assistance avec la plateforme LMS ?</p>
                                <ul>
                                    <li><strong>Documentation :</strong> Consultez le guide d'utilisation.</li>
                                    <li><strong>Email :</strong> support@uni-lms.sn</li>
                                    <li><strong>Téléphone :</strong> +221 33 000 00 00</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card card-warning card-outline">
                            <div className="card-header">
                                <h3 className="card-title">Ouvrir un ticket</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Sujet</label>
                                    <input type="text" className="form-control" placeholder="Problème technique..." />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea className="form-control" rows={3} placeholder="Détails du problème..."></textarea>
                                </div>
                                <button className="btn btn-warning">Envoyer la demande</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Support;
