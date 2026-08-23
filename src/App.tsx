import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AdminSharePage } from './pages/AdminSharePage';
import { GuidePage } from './pages/GuidePage';
import { MessagesPage } from './pages/MessagesPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  defaultRoute,
  findRoute,
  getRoutePathFromHash,
  routeToHash,
  type RoutePath,
} from './routes';

const pageByPath: Record<RoutePath, ComponentType> = {
  '/messages': MessagesPage,
  '/guide': GuidePage,
  '/admin': AdminSharePage,
  '/settings': SettingsPage,
};

function getInitialPath() {
  return getRoutePathFromHash(window.location.hash);
}

export default function App() {
  const [activePath, setActivePath] = useState<RoutePath>(getInitialPath);
  const activeRoute = useMemo(() => findRoute(activePath), [activePath]);
  const ActivePage = pageByPath[activePath];

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', routeToHash(defaultRoute.path));
    }

    const handleHashChange = () => {
      setActivePath(getRoutePathFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <AppLayout activePath={activePath} title={activeRoute.title}>
      <ActivePage />
    </AppLayout>
  );
}
