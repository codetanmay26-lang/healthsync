import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InventoryOverview = ({ onViewDetails, onReorderAlert }) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [sortBy, setSortBy] = useState('stock');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    // Mock inventory data
    const mockInventory = [
      {
        id: 'med-001',
        name: 'Metformin 500mg',
        category: 'Diabetes',
        currentStock: 45,
        minStock: 50,
        maxStock: 200,
        unitPrice: 12.50,
        expiryDate: '2025-03-15',
        supplier: 'PharmaCorp',
        status: 'low',
        lastRestocked: '2024-12-01',
        monthlyUsage: 85,
        batchNumber: 'MET2024-001'
      },
      {
        id: 'med-002',
        name: 'Lisinopril 10mg',
        category: 'Cardiovascular',
        currentStock: 120,
        minStock: 30,
        maxStock: 150,
        unitPrice: 8.75,
        expiryDate: '2025-06-20',
        supplier: 'MediSupply',
        status: 'optimal',
        lastRestocked: '2024-11-15',
        monthlyUsage: 42,
        batchNumber: 'LIS2024-003'
      },
      {
        id: 'med-003',
        name: 'Amoxicillin 250mg',
        category: 'Antibiotic',
        currentStock: 8,
        minStock: 25,
        maxStock: 100,
        unitPrice: 15.25,
        expiryDate: '2025-01-30',
        supplier: 'AntiBio Labs',
        status: 'critical',
        lastRestocked: '2024-10-20',
        monthlyUsage: 35,
        batchNumber: 'AMX2024-007'
      },
      {
        id: 'med-004',
        name: 'Atorvastatin 20mg',
        category: 'Cardiovascular',
        currentStock: 180,
        minStock: 40,
        maxStock: 200,
        unitPrice: 22.00,
        expiryDate: '2025-08-10',
        supplier: 'CardioMed',
        status: 'optimal',
        lastRestocked: '2024-12-05',
        monthlyUsage: 28,
        batchNumber: 'ATO2024-012'
      },
      {
        id: 'med-005',
        name: 'Insulin Glargine',
        category: 'Diabetes',
        currentStock: 15,
        minStock: 20,
        maxStock: 60,
        unitPrice: 125.00,
        expiryDate: '2025-04-25',
        supplier: 'DiabetesCare',
        status: 'low',
        lastRestocked: '2024-11-28',
        monthlyUsage: 18,
        batchNumber: 'INS2024-005',
      }
    ];
    setInventoryData(mockInventory);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-error bg-error/10 border-error/20';
      case 'low': return 'text-warning bg-warning/10 border-warning/20';
      case 'optimal': return 'text-success bg-success/10 border-success/20';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const getStockPercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  const filteredData = inventoryData?.filter(item => {
    if (filterBy === 'all') return true;
    if (filterBy === 'low') return item?.status === 'low' || item?.status === 'critical';
    if (filterBy === 'expiring') {
      const expiryDate = new Date(item.expiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow?.setDate(thirtyDaysFromNow?.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow;
    }
    return item?.category?.toLowerCase() === filterBy?.toLowerCase();
  });

  const sortedData = [...filteredData]?.sort((a, b) => {
    switch (sortBy) {
      case 'stock':
        return a?.currentStock - b?.currentStock;
      case 'name':
        return a?.name?.localeCompare(b?.name);
      case 'expiry':
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      case 'usage':
        return b?.monthlyUsage - a?.monthlyUsage;
      default:
        return 0;
    }
  });

  const handleReorder = (medication) => {
    if (onReorderAlert) {
      onReorderAlert(medication);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Inventory Overview</h2>
          <p className="text-sm text-text-secondary mt-1">
            {inventoryData?.length} medications tracked • {filteredData?.filter(item => item?.status === 'critical' || item?.status === 'low')?.length} need attention
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Items</option>
            <option value="low">Low Stock</option>
            <option value="expiring">Expiring Soon</option>
            <option value="diabetes">Diabetes</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="antibiotic">Antibiotics</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="stock">Sort by Stock</option>
            <option value="name">Sort by Name</option>
            <option value="expiry">Sort by Expiry</option>
            <option value="usage">Sort by Usage</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4">
        {sortedData?.map((medication) => (
          <div key={medication?.id} className="border border-border rounded-lg p-4 hover:shadow-medical-sm transition-medical">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-medium text-text-primary">{medication?.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(medication?.status)}`}>
                    {medication?.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Current Stock:</span>
                    <div className="font-medium text-text-primary">{medication?.currentStock} units</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Monthly Usage:</span>
                    <div className="font-medium text-text-primary">{medication?.monthlyUsage} units</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Expires:</span>
                    <div className="font-medium text-text-primary">
                      {new Date(medication.expiryDate)?.toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Supplier:</span>
                    <div className="font-medium text-text-primary">{medication?.supplier}</div>
                  </div>
                </div>

                {/* Stock Level Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                    <span>Stock Level</span>
                    <span>{getStockPercentage(medication?.currentStock, medication?.maxStock)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        medication?.status === 'critical' ? 'bg-error' :
                        medication?.status === 'low'? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: `${Math.min(getStockPercentage(medication?.currentStock, medication?.maxStock), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>Min: {medication?.minStock}</span>
                    <span>Max: {medication?.maxStock}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Eye"
                  iconPosition="left"
                  iconSize={14}
                  onClick={() => onViewDetails && onViewDetails(medication)}
                >
                  Details
                </Button>
                
                {(medication?.status === 'critical' || medication?.status === 'low') && (
                  <Button
                    variant="default"
                    size="sm"
                    iconName="ShoppingCart"
                    iconPosition="left"
                    iconSize={14}
                    onClick={() => handleReorder(medication)}
                  >
                    Reorder
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {sortedData?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Package" size={48} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No medications found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default InventoryOverview;