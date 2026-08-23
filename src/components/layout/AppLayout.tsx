import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar, type SidebarItem } from './Sidebar';
import type { RoutePath } from '../../routes';

type AppLayoutProps = {
  activePath: RoutePath;
  children: ReactNode;
  headerActions?: ReactNode;
  title: string;
};

function getSidebarActiveItem(activePath: RoutePath): SidebarItem {
  if (activePath === '/guide') {
    return 'guide';
  }

  if (activePath === '/admin') {
    return 'share';
  }

  if (activePath === '/settings') {
    return 'settings';
  }

  return 'messages';
}

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
        activeItem={getSidebarActiveItem(activePath)}
        defaultCollapsed={isSidebarCollapsed}
        messageCount={2}
        onCollapsedChange={setIsSidebarCollapsed}
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
