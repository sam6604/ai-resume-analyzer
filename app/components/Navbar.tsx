import { Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="flex items-center">
                    <span className="brand-mark">R</span>
                    <span className="brand">Resumind</span>
                </Link>
                <Link to="/upload" className="btn-primary btn-sm">
                    Upload Resume
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
