import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
    const [username, setUsername] = useState("");
    const [openMenus, setOpenMenus] = useState({ tc: false, cycle: false });
    const location = useLocation();

    useEffect(() => {
        fetchUser();
        // Auto-open menus based on current path
        if (location.search.includes('TC')) setOpenMenus(prev => ({ ...prev, tc: true }));
        if (location.search.includes('DIC')) setOpenMenus(prev => ({ ...prev, cycle: true }));
    }, [location]);

    const toggleMenu = (menu: 'tc' | 'cycle') => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const fetchUser = () => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const user = JSON.parse(stored);
                setUsername(user.username || user.email || 'Admin');
            } catch (e) {
                setUsername('Admin');
            }
        }
    };

    // Helper to check if a specific academic link is active
    const isAcademicActive = (query: string) => {
        return location.pathname === '/admin/university/class' && location.search === `?q=${query}`;
    };

    return (
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
            {/* Brand Logo */}
            <a href="/admin/index" className="brand-link">
                <img src="/dist/img/main-logo.png" alt="LMS Logo" className="brand-image img-circle elevation-3" style={{ opacity: 0.9, width: '38px', height: '38px' }} />
                <span className="brand-text">ADMINISTRATION</span>
            </a>

            {/* Sidebar */}
            <div className="sidebar">
                {/* User Panel */}
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div className="image">
                        <img src="/dist/img/default-user.png" className="img-circle elevation-2" alt="User" />
                    </div>
                    <div className="info">
                        <NavLink to="/profile" className="d-block">{username}</NavLink>
                    </div>
                </div>

                {/* Sidebar Menu */}
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                        
                        <li className="nav-item">
                            <NavLink to="/admin/index" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <i className="nav-icon fas fa-th-large"></i>
                                <p>Tableau de bord</p>
                            </NavLink>
                        </li>

                        <li className="nav-header"></li>

                        {/* Tronc Commun */}
                        <li className={`nav-item ${openMenus.tc ? 'menu-open' : ''}`}>
                            <a 
                                href="#" 
                                className={`nav-link ${openMenus.tc ? 'active' : ''}`}
                                onClick={(e) => { e.preventDefault(); toggleMenu('tc'); }}
                            >
                                <i className="nav-icon fas fa-book"></i>
                                <p>
                                    Tronc Commun
                                    <i className={`right fas fa-angle-left ${openMenus.tc ? 'rotate-90' : ''}`}></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview" style={{ display: openMenus.tc ? 'block' : 'none' }}>
                                <li className="nav-item">
                                    <NavLink 
                                        to="/admin/university/class?q=TC1" 
                                        className={({ isActive }) => `nav-link ${isAcademicActive('TC1') ? 'active' : ''}`}
                                    >
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>TC1</p>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink 
                                        to="/admin/university/class?q=TC2" 
                                        className={({ isActive }) => `nav-link ${isAcademicActive('TC2') ? 'active' : ''}`}
                                    >
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>TC2</p>
                                    </NavLink>
                                </li>
                            </ul>
                        </li>

                        {/* Cycle Ingénieur */}
                        <li className={`nav-item ${openMenus.cycle ? 'menu-open' : ''}`}>
                            <a 
                                href="#" 
                                className={`nav-link ${openMenus.cycle ? 'active' : ''}`}
                                onClick={(e) => { e.preventDefault(); toggleMenu('cycle'); }}
                            >
                                <i className="nav-icon fas fa-cogs"></i>
                                <p>
                                    Cycle Ingénieur
                                    <i className={`right fas fa-angle-left ${openMenus.cycle ? 'rotate-90' : ''}`}></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview" style={{ display: openMenus.cycle ? 'block' : 'none' }}>
                                {['DIC1', 'DIC2', 'DIC3'].map(year => (
                                    <li key={year} className="nav-item">
                                        <NavLink 
                                            to={`/admin/university/class?q=${year}`} 
                                            className={({ isActive }) => `nav-link ${isAcademicActive(year) ? 'active' : ''}`}
                                        >
                                            <i className="far fa-circle nav-icon"></i>
                                            <p>{year}</p>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </li>

                        <li className="nav-header">UTILISATEURS</li>

                        <li className="nav-item">
                            <NavLink to="/admin/student/enrolled" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <i className="nav-icon fas fa-user-graduate"></i>
                                <p>Gestion des Étudiants</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/admin/lecturer/all" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <i className="nav-icon fas fa-chalkboard-teacher"></i>
                                <p>Corps Enseignant</p>
                            </NavLink>
                        </li>

                        <li className="nav-header">COMMUNICATION</li>

                        <li className="nav-item">
                            <NavLink to="/admin/announcements" className="nav-link">
                                <i className="nav-icon fas fa-bullhorn"></i>
                                <p>Annonces</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/admin/messages" className="nav-link">
                                <i className="nav-icon fas fa-envelope"></i>
                                <p>Messagerie</p>
                            </NavLink>
                        </li>

                        <li className="nav-header">SYSTÈME</li>

                        <li className="nav-item">
                            <NavLink to="/admin/settings" className="nav-link">
                                <i className="nav-icon fas fa-sliders-h"></i>
                                <p>Configuration</p>
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/admin/support" className="nav-link">
                                <i className="nav-icon fas fa-life-ring"></i>
                                <p>Assistance</p>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            <style>{`
                .rotate-90 {
                    transform: rotate(-90deg);
                    transition: transform 0.3s ease;
                }
            `}</style>
        </aside>
    );
}

export default Sidebar;
