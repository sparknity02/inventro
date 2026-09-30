import { NavLink } from 'react-router-dom';

export default function Navbar({ lowStockCount }) {
  return (
    <header className="navbar">
      <div className="nav-wrapper">
        <NavLink to="/" className="nav-brand">
          <div className="brand-icon">INV</div>
          <div>
            <span>Inventro</span>
          </div>
        </NavLink>

        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Items
              </NavLink>
            </li>
            <li>
              <NavLink to="/suppliers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Suppliers
              </NavLink>
            </li>
            <li>
              <NavLink to="/low-stock" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Low Stock
                {lowStockCount > 0 && <span className="nav-badge">{lowStockCount}</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
