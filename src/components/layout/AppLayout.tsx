import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { RoutePath } from '../../routes';

type AppLayoutProps = {
  activePath: RoutePath;
  children: ReactNode;
  headerActions?: ReactNode;
  title: string;
};

export function AppLayout({
  activePath,
  children,
  headerActions,
  title,
}: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div
      className={`app-layout${isSidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}
    >
      <Sidebar
        activePath={activePath}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((current) => !current)}
      />
      <div className="layout-body">
        <div className="content-shell">
          <Header actions={headerActions} title={title} />
          <main className="layout-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
