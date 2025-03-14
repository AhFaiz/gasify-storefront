
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, setAdminMode } from '../../integrations/supabase/client';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  const adminUsername = localStorage.getItem('adminUsername');
  
  // Debug info when mounting this component
  useEffect(() => {
    console.log('ProtectedAdminRoute - Auth check:', { 
      isAuthenticated, 
      adminUsername, 
      path: location.pathname,
      isProduction: import.meta.env.PROD
    });
    
    // If we're in development mode, auto-authenticate and set service role bypass
    if (process.env.NODE_ENV === 'development' && !isAuthenticated) {
      console.log('Development mode - Auto authenticating for testing');
      
      // Auto-authenticate for admin dashboards
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminUsername', 'admin123');
      
      // Set up service role access for admin
      const setupDevAuth = async () => {
        try {
          // Apply admin mode flag for subsequent requests
          setAdminMode();
          
          // Execute a test query to ensure DB connection
          const { data, error } = await supabase
            .from('client_messages')
            .select('id')
            .limit(1);
            
          if (error) {
            console.error('Error in test query:', error);
          } else {
            console.log('Test query successful:', data);
          }
        } catch (err) {
          console.error('Error during dev authentication setup:', err);
        }
      };
      
      setupDevAuth();
      toast.info('Auto-login for development enabled');
    } else if (isAuthenticated) {
      // Set admin mode when already authenticated
      setAdminMode();
    }
  }, [location.pathname]);

  // Make sure it's the admin account - but any username is allowed in development
  const isAdmin = process.env.NODE_ENV === 'development' || adminUsername === 'admin123';
  
  if (!isAuthenticated || !isAdmin) {
    // Redirect to login page if not authenticated as admin
    console.log('Admin authentication failed, redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
