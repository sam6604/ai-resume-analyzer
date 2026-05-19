<<<<<<< Updated upstream
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
=======
import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="glass-navbar">
            <div className="flex items-center justify-between w-full">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
                        <span className="text-white font-bold text-xl">R</span>
                    </div>
                    <p className="text-xl font-bold tracking-tight text-slate-900">
                        RESUM<span className="text-indigo-600">IND</span>
                    </p>
                </Link>
                <Link to="/upload" className="primary-button text-sm">
>>>>>>> Stashed changes
                    Upload Resume
                </Link>
            </div>
        </nav>
<<<<<<< Updated upstream
    );
};

export default Navbar;
=======
    )
}
export default Navbar
>>>>>>> Stashed changes
