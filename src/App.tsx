import { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AdminSharePage } from './pages/AdminSharePage';
import { GuidePage } from './pages/GuidePage';
import { MessagesPage } from './pages/MessagesPage';
import { SettingsPage } from './pages/SettingsPage';
import { findRoute, getRoutePathFromHash } from './routes';

export default function App() {
  const [activePath, setActivePath] = useState(() =>
    getRoutePathFromHash(window.location.hash),
  );
  const activeRoute = findRoute(activePath);

  useEffect(() => {
    const handleHashChange = () => {
      setActivePath(getRoutePathFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (activePath === '/guide') {
    return <GuidePage />;
  }

  if (activePath === '/admin') {
    return (
      <AppLayout activePath={activePath} title={activeRoute.title}>
        <AdminSharePage />
      </AppLayout>
    );
  }

  if (activePath === '/settings') {
    return (
      <AppLayout activePath={activePath} title={activeRoute.title}>
        <SettingsPage />
      </AppLayout>
    );
  }

  return <MessagesPage />;
}
