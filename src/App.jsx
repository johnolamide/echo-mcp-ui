import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatPage />
  },
  {
    path: '/conversations/:conversationId',
    element: <ChatPage />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
