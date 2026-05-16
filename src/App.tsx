import { BrowserRouter as Router, Routes, Route, ScrollRestoration } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import RouteFallback from './components/RouteFallback';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const Research = lazy(() => import('./pages/Research'));
const ArticleView = lazy(() => import('./pages/content/ArticleView'));
const Models = lazy(() => import('./pages/Models'));
const ModelView = lazy(() => import('./pages/content/ModelView'));
const Agents = lazy(() => import('./pages/Agents'));
const AgentView = lazy(() => import('./pages/content/AgentView'));
const OPC = lazy(() => import('./pages/OPC'));
const Company = lazy(() => import('./pages/Company'));
const Blog = lazy(() => import('./pages/company/Blog'));
const Careers = lazy(() => import('./pages/company/Careers'));
const Charter = lazy(() => import('./pages/company/Charter'));
const Login = lazy(() => import('./pages/auth/Login'));
const Search = lazy(() => import('./pages/Search'));
const Try = lazy(() => import('./pages/Try'));
const Projects = lazy(() => import('./pages/projects/Projects'));
const ProjectCiao = lazy(() => import('./pages/projects/Ciao'));
const ProjectFreeAPI = lazy(() => import('./pages/projects/FreeAPI'));
const ProjectZhiwo = lazy(() => import('./pages/projects/Zhiwo'));
const ProjectInferenceAgent = lazy(() => import('./pages/projects/InferenceAgent'));
const ProjectExoKey = lazy(() => import('./pages/projects/ExoKey'));

function App() {
  return (
    <Router>
      <ScrollRestoration />
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="research" element={<Research />} />
              <Route path="research/:slug" element={<ArticleView />} />
              <Route path="models" element={<Models />} />
              <Route path="models/:slug" element={<ModelView />} />
              <Route path="agents" element={<Agents />} />
              <Route path="agents/:slug" element={<AgentView />} />
              <Route path="opc" element={<OPC />} />
              <Route path="company" element={<Company />} />
              <Route path="company/blog" element={<Blog />} />
              <Route path="company/careers" element={<Careers />} />
              <Route path="company/charter" element={<Charter />} />
              <Route path="login" element={<Login />} />
              <Route path="search" element={<Search />} />
              <Route path="try" element={<Try />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/exokey" element={<ProjectExoKey />} />
              <Route path="projects/ciao" element={<ProjectCiao />} />
              <Route path="projects/freeapi" element={<ProjectFreeAPI />} />
              <Route path="projects/zhiwo" element={<ProjectZhiwo />} />
              <Route path="projects/inference-agent" element={<ProjectInferenceAgent />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
