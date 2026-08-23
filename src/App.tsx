import { MessagesPage } from './pages/MessagesPage';

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
    <main className="app">
      <MessagesPage />
    </main>
  );
}
