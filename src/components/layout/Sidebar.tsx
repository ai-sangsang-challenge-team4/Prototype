import type { ComponentType, SVGProps } from 'react';
import {
  CollapseIcon,
  GuideIcon,
  MenuIcon,
  MessageIcon,
  SettingsIcon,
  UsersIcon,
} from './icons';
import {
  primaryRoutes,
  routeToHash,
  utilityRoutes,
  type AppRoute,
  type RoutePath,
} from '../../routes';

type SidebarProps = {
  activePath: RoutePath;
  isCollapsed: boolean;
  onToggle: () => void;
};

type NavItem = AppRoute & {
  badge?: number;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const primaryNavItems: NavItem[] = [
  {
    ...primaryRoutes[0],
    Icon: MessageIcon,
    badge: 2,
  },
  {
    ...primaryRoutes[1],
    Icon: GuideIcon,
  },
  {
    ...primaryRoutes[2],
    Icon: UsersIcon,
  },
];

const utilityNavItems: NavItem[] = [
  {
    ...utilityRoutes[0],
    Icon: SettingsIcon,
  },
];

type SidebarLinkProps = {
  activePath: RoutePath;
  item: NavItem;
};

function SidebarLink({ activePath, item }: SidebarLinkProps) {
  const isActive = activePath === item.path;
  const { Icon } = item;

  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={`sidebar-link${isActive ? ' is-active' : ''}`}
      href={routeToHash(item.path)}
      title={item.label}
    >
      <Icon className="sidebar-link-icon" />
      <span className="sidebar-link-label">{item.label}</span>
      {item.badge ? <span className="sidebar-badge">{item.badge}</span> : null}
    </a>
  );
}

export function Sidebar({ activePath, isCollapsed, onToggle }: SidebarProps) {
  const ToggleIcon = isCollapsed ? MenuIcon : CollapseIcon;

  return (
    <aside
      className={`sidebar-shell${isCollapsed ? ' is-collapsed' : ''}`}
      aria-label="교사용 주요 메뉴"
    >
      <div className="sidebar-inner">
        <a className="sidebar-brand" href={routeToHash('/messages')}>
          <span className="sidebar-logo" aria-hidden="true">
            TH
          </span>
          <span className="sidebar-brand-name">Teacher Hub</span>
        </a>

        <button
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          className="sidebar-collapse"
          onClick={onToggle}
          type="button"
        >
          <ToggleIcon />
        </button>

        <nav className="sidebar-nav" aria-label="주요 화면">
          {primaryNavItems.map((item) => (
            <SidebarLink activePath={activePath} item={item} key={item.path} />
          ))}
        </nav>

        <div className="sidebar-divider" />

        <nav className="sidebar-utility" aria-label="지원 메뉴">
          {utilityNavItems.map((item) => (
            <SidebarLink activePath={activePath} item={item} key={item.path} />
          ))}
        </nav>

        <a className="teacher-profile" href={routeToHash('/settings')}>
          <span className="teacher-avatar" aria-hidden="true">
            조
          </span>
          <span className="teacher-profile-text">
            <strong>조예인 선생님</strong>
            <span>숙명초등학교</span>
          </span>
        </a>
      </div>
    </aside>
  );
}
