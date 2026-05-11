import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Alerts from './pages/Alerts';
import NewsPage from './pages/News';
import Settings from './pages/Settings';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
    public: true,
  },
  {
    name: 'Portfolio',
    path: '/portfolio',
    element: <Portfolio />,
    public: true,
  },
  {
    name: 'Alerts',
    path: '/alerts',
    element: <Alerts />,
    public: true,
  },
  {
    name: 'News',
    path: '/news',
    element: <NewsPage />,
    public: true,
  },
  {
    name: 'Settings',
    path: '/settings',
    element: <Settings />,
    public: true,
  },
];
