export type RoutePath = '/messages' | '/guide' | '/admin' | '/settings';

export type AppRoute = {
  path: RoutePath;
  label: string;
  title: string;
};

export const primaryRoutes: AppRoute[] = [
  {
    path: '/messages',
    label: '메시지',
    title: '받은 메시지',
  },
  {
    path: '/guide',
    label: '대응 가이드',
    title: '대응 가이드',
  },
  {
    path: '/admin',
    label: '관리자 공유',
    title: '관리자 공유',
  },
];

export const utilityRoutes: AppRoute[] = [
  {
    path: '/settings',
    label: '설정/도움말',
    title: '설정/도움말',
  },
];

export const routes = [...primaryRoutes, ...utilityRoutes];
export const defaultRoute = primaryRoutes[0];

export function routeToHash(path: RoutePath) {
  return `#${path}`;
}

export function findRoute(path: string) {
  return routes.find((route) => route.path === path) ?? defaultRoute;
}

export function getRoutePathFromHash(hash: string): RoutePath {
  const path = hash.replace(/^#/, '');

  return findRoute(path).path;
}
