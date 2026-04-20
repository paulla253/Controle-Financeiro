import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 p-4 border-r min-h-screen">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="block p-2 rounded hover:bg-gray-100">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/expenses" className="block p-2 rounded hover:bg-gray-100">
              Despesas
            </Link>
          </li>
          <li>
            <Link href="/categories" className="block p-2 rounded hover:bg-gray-100">
              Categorias
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
