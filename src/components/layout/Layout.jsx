import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Main layout component with header and optional sidebar
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render in the main area
 * @param {boolean} props.showSidebar - Whether to show the sidebar
 * @param {Object} props.sidebarProps - Props to pass to the sidebar component
 */
const Layout = ({ 
  children, 
  showSidebar = true,
  sidebarProps = {}
}) => {
  return (
    <div className="min-h-screen bg-gray-50 font-satoshi flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {showSidebar && (
          <Sidebar {...sidebarProps} />
        )}
        
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
