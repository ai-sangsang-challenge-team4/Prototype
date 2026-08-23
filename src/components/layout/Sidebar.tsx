import { useState } from 'react';
import defaultProfileImage from '../../assets/profile.png';
import {
  SidebarCollapseIcon,
  SidebarGuideIcon,
  SidebarMenuIcon,
  SidebarMessageIcon,
  SidebarSettingsIcon,
  SidebarShareIcon,
} from './icons';
import './Sidebar.css';

type SidebarItem = 'messages' | 'guide' | 'share';

type SidebarProps = {
  activeItem?: SidebarItem;
  defaultCollapsed?: boolean;
  messageCount?: number;
  onCollapsedChange?: (isCollapsed: boolean) => void;
};

const navItems = [
  {
    href: '#messages',
    icon: SidebarMessageIcon,
    key: 'messages',
    label: '메시지',
  },
  {
    href: '#guide',
    icon: SidebarGuideIcon,
    key: 'guide',
    label: '대응 가이드',
  },
  {
    href: '#share',
    icon: SidebarShareIcon,
    key: 'share',
    label: '관리자 공유',
  },
] satisfies {
  href: string;
  icon: typeof SidebarMessageIcon;
  key: SidebarItem;
  label: string;
}[];

export function Sidebar({
  activeItem = 'messages',
  defaultCollapsed = true,
  messageCount = 0,
  onCollapsedChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggleCollapsed = () => {
    setIsCollapsed((currentValue) => {
      const nextValue = !currentValue;

      onCollapsedChange?.(nextValue);

      return nextValue;
    });
  };

  return (
    <aside
      className={`sidebar-shell${isCollapsed ? ' is-collapsed' : ''}`}
      aria-label="교사 메뉴"
    >
      <div className="sidebar-brand">
        <span className="sidebar-logo">(로고)</span>
        <strong>Teacher Hub</strong>
      </div>

      <button
        aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        aria-pressed={isCollapsed}
        className="sidebar-collapse"
        onClick={handleToggleCollapsed}
        type="button"
      >
        {isCollapsed ? <SidebarMenuIcon /> : <SidebarCollapseIcon />}
      </button>

      <nav className="sidebar-nav" aria-label="주요 메뉴">
        {navItems.map(({ href, icon: Icon, key, label }) => {
          const isActive = activeItem === key;

          return (
            <a
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              className={`sidebar-link${isActive ? ' is-active' : ''}`}
              href={href}
              key={key}
              title={label}
            >
              <Icon className="sidebar-link-icon" />
              <span className="sidebar-link-label">{label}</span>
              {key === 'messages' && messageCount > 0 ? (
                <span className="sidebar-badge">{messageCount}</span>
              ) : null}
            </a>
          );
        })}
      </nav>

      <div className="sidebar-divider" aria-hidden="true" />

      <a
        aria-label="설정/도움말"
        className="sidebar-utility-link"
        href="#settings"
        title="설정/도움말"
      >
        <SidebarSettingsIcon className="sidebar-link-icon" />
        <span className="sidebar-link-label">설정/도움말</span>
      </a>

      <div className="sidebar-profile">
        <img
          alt=""
          aria-hidden="true"
          className="sidebar-profile-avatar"
          src={defaultProfileImage}
        />
        <span>
          <strong>조예인 선생님</strong>
          <small>숙명초등학교</small>
        </span>
      </div>
    </aside>
  );
}
