import type { ReactNode } from 'react';

type HeaderProps = {
  actions?: ReactNode;
  title: string;
};

export function Header({ actions, title }: HeaderProps) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}
