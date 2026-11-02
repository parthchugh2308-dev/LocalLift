import React from 'react';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Toast } from './components/Toast';
import { AdminPortal } from './components/admin/AdminPortal';
import { CustomerApp } from './components/customer/CustomerApp';
import { VendorPortal } from './components/vendor/VendorPortal';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { activeRole } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f8]">
      {/* Universal Role Switcher Top Bar */}
      <RoleSwitcher />

      {/* Global Notifications Toast */}
      <Toast />

      {/* Role View Portals */}
      <div className="flex-1">
        {activeRole === 'customer' && <CustomerApp />}
        {activeRole === 'vendor' && <VendorPortal />}
        {activeRole === 'admin' && <AdminPortal />}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
