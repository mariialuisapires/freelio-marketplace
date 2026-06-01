import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { PrivateLayout } from '@/layouts/PrivateLayout'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Projects } from '@/pages/Projects'
import { ProjectDetails } from '@/pages/ProjectDetails'
import { CreateProject } from '@/pages/CreateProject'
import { MyProposals } from '@/pages/MyProposals'
import { Contracts } from '@/pages/Contracts'
import { Chat } from '@/pages/Chat'
import { Profile } from '@/pages/Profile'
import { Categories } from '@/pages/Categories'
import { CategoryDetail } from '@/pages/CategoryDetail'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/categorias', element: <Categories /> },
      { path: '/categorias/:id', element: <CategoryDetail /> },
    ],
  },
  {
    element: <PrivateLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/projects', element: <Projects /> },
      { path: '/projects/create', element: <CreateProject /> },
      { path: '/projects/:id', element: <ProjectDetails /> },
      { path: '/proposals', element: <MyProposals /> },
      { path: '/contracts', element: <Contracts /> },
      { path: '/chat', element: <Chat /> },
      { path: '/chat/:userId', element: <Chat /> },
      { path: '/profile', element: <Profile /> },
      { path: '/profile/:id', element: <Profile /> },
    ],
  },
])
