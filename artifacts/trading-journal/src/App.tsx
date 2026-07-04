import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { TradeProvider } from './hooks/useTrades';
import { Layout } from './components/Layout';

import { Dashboard } from './pages/Dashboard';
import { Journal } from './pages/Journal';
import { Analytics } from './pages/Analytics';
import { AICoach } from './pages/AICoach';
import { Reports } from './pages/Reports';

const queryClient = new QueryClient();

// Ensure dark mode is strictly applied on mount
document.documentElement.classList.add("dark");

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/journal" component={Journal} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/ai-coach" component={AICoach} />
        <Route path="/reports" component={Reports} />
        <Route>
          <div className="h-full flex items-center justify-center">
            <h1 className="text-2xl text-muted-foreground">404 - Page Not Found</h1>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TradeProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </TradeProvider>
    </QueryClientProvider>
  );
}

export default App;