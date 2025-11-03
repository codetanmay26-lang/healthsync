import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const BreadcrumbNavigation = ({ 
  items = [],
  userRole = 'doctor',
  showBackButton = true,
  onBack
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history?.back();
    }
  };

  const handleBreadcrumbClick = (item) => {
    if (item?.path && item?.clickable !== false) {
      window.location.href = item?.path;
    }
  };

  const getRoleBasedHome = () => {
    switch (userRole) {
      case 'doctor':
        return { label: 'Dashboard', path: '/doctor-dashboard', icon: 'Activity' };
      case 'patient':
        return { label: 'My Portal', path: '/patient-portal', icon: 'User' };
      case 'pharmacy':
        return { label: 'Dashboard', path: '/pharmacy-dashboard', icon: 'Package' };
      case 'admin':
        return { label: 'Analytics', path: '/admin-analytics', icon: 'BarChart3' };
      default:
        return { label: 'Home', path: '/', icon: 'Home' };
    }
  };

  // If no items provided, don't render breadcrumbs
  if (!items || items?.length === 0) {
    return null;
  }

  const homeItem = getRoleBasedHome();
  const allItems = [homeItem, ...items];

  return (
    <nav className="flex items-center space-x-2 py-3" aria-label="Breadcrumb">
      {/* Back Button */}
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          iconName="ArrowLeft"
          iconSize={16}
          onClick={handleBack}
          className="text-text-secondary hover:text-text-primary hover:bg-muted transition-medical mr-2"
          aria-label="Go back"
        />
      )}
      {/* Breadcrumb Items */}
      <ol className="flex items-center space-x-2">
        {allItems?.map((item, index) => {
          const isLast = index === allItems?.length - 1;
          const isClickable = item?.clickable !== false && item?.path && !isLast;

          return (
            <li key={index} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <Icon 
                  name="ChevronRight" 
                  size={14} 
                  className="text-text-secondary mx-2" 
                  aria-hidden="true"
                />
              )}
              {/* Breadcrumb Item */}
              <div className="flex items-center">
                {isClickable ? (
                  <button
                    onClick={() => handleBreadcrumbClick(item)}
                    className="flex items-center space-x-1 text-sm text-text-secondary hover:text-primary transition-medical"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item?.icon && index === 0 && (
                      <Icon name={item?.icon} size={14} className="mr-1" />
                    )}
                    <span>{item?.label}</span>
                  </button>
                ) : (
                  <span 
                    className={`flex items-center space-x-1 text-sm ${
                      isLast 
                        ? 'text-text-primary font-medium' :'text-text-secondary'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item?.icon && index === 0 && (
                      <Icon name={item?.icon} size={14} className="mr-1" />
                    )}
                    <span>{item?.label}</span>
                  </span>
                )}

                {/* Status Indicator */}
                {item?.status && (
                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    item?.status === 'active' ? 'bg-success/10 text-success' :
                    item?.status === 'pending' ? 'bg-warning/10 text-warning' :
                    item?.status === 'inactive'? 'bg-error/10 text-error' : 'bg-muted text-text-secondary'
                  }`}>
                    {item?.status}
                  </span>
                )}

                {/* Count Badge */}
                {item?.count !== undefined && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {item?.count}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {/* Additional Actions */}
      {items?.length > 0 && items?.[items?.length - 1]?.actions && (
        <div className="flex items-center space-x-1 ml-4">
          {items?.[items?.length - 1]?.actions?.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              iconName={action?.icon}
              iconSize={14}
              onClick={action?.onClick}
              className="text-text-secondary hover:text-text-primary hover:bg-muted transition-medical"
              title={action?.label}
            />
          ))}
        </div>
      )}
    </nav>
  );
};

// Example usage patterns for different healthcare workflows
BreadcrumbNavigation.examples = {
  doctorPatientView: [
    { label: 'Patients', path: '/doctor-dashboard' },
    { label: 'John Doe', path: '/patient-profile/john-doe' },
    { 
      label: 'Medical History', 
      status: 'active',
      actions: [
        { icon: 'Edit', label: 'Edit', onClick: () => {} },
        { icon: 'Share', label: 'Share', onClick: () => {} }
      ]
    }
  ],
  
  pharmacyInventory: [
    { label: 'Inventory', path: '/pharmacy-dashboard' },
    { label: 'Medications', path: '/pharmacy-dashboard/medications' },
    { label: 'Insulin', count: 24 }
  ],
  
  patientMedications: [
    { label: 'My Medications', path: '/patient-portal' },
    { label: 'Prescriptions', path: '/patient-portal/prescriptions' },
    { label: 'Current', status: 'active' }
  ],
  
  adminAnalytics: [
    { label: 'Reports', path: '/admin-analytics' },
    { label: 'Patient Outcomes', path: '/admin-analytics/outcomes' },
    { label: 'Monthly Summary' }
  ]
};

export default BreadcrumbNavigation;