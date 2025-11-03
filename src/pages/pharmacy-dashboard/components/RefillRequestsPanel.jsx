import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RefillRequestsPanel = ({ onProcessRefill, onContactPatient }) => {
  const [refillRequests, setRefillRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [sortBy, setSortBy] = useState('priority');

  useEffect(() => {
    // Mock refill requests data
    const mockRequests = [
      {
        id: 'refill-001',
        patientName: 'Sarah Johnson',
        patientId: 'PAT-001',
        medication: 'Metformin 500mg',
        prescriptionId: 'RX-2024-001',
        quantity: 90,
        refillsRemaining: 2,
        lastFilled: '2024-11-15',
        requestDate: '2024-12-08',
        priority: 'high',
        status: 'pending',
        doctorName: 'Dr. Michael Chen',
        insuranceStatus: 'verified',
        notes: 'Patient reports good adherence, no side effects',
        estimatedPickup: '2024-12-10',
        patientPhone: '(555) 123-4567'
      },
      {
        id: 'refill-002',
        patientName: 'Robert Martinez',
        patientId: 'PAT-002',
        medication: 'Lisinopril 10mg',
        prescriptionId: 'RX-2024-002',
        quantity: 30,
        refillsRemaining: 5,
        lastFilled: '2024-12-01',
        requestDate: '2024-12-08',
        priority: 'medium',
        status: 'processing',
        doctorName: 'Dr. Emily Rodriguez',
        insuranceStatus: 'pending',
        notes: 'Insurance verification in progress',
        estimatedPickup: '2024-12-09',
        patientPhone: '(555) 234-5678'
      },
      {
        id: 'refill-003',
        patientName: 'Maria Garcia',
        patientId: 'PAT-003',
        medication: 'Insulin Glargine',
        prescriptionId: 'RX-2024-003',
        quantity: 1,
        refillsRemaining: 0,
        lastFilled: '2024-11-20',
        requestDate: '2024-12-08',
        priority: 'urgent',
        status: 'pending',
        doctorName: 'Dr. James Wilson',
        insuranceStatus: 'verified',
        notes: 'Critical medication - patient diabetic, requires cold storage',
        estimatedPickup: '2024-12-08',
        patientPhone: '(555) 345-6789',
        coldChain: true
      },
      {
        id: 'refill-004',
        patientName: 'David Thompson',
        patientId: 'PAT-004',
        medication: 'Atorvastatin 20mg',
        prescriptionId: 'RX-2024-004',
        quantity: 90,
        refillsRemaining: 3,
        lastFilled: '2024-11-25',
        requestDate: '2024-12-07',
        priority: 'low',
        status: 'ready',
        doctorName: 'Dr. Lisa Anderson',
        insuranceStatus: 'verified',
        notes: 'Regular refill, patient stable',
        estimatedPickup: '2024-12-09',
        patientPhone: '(555) 456-7890'
      }
    ];
    setRefillRequests(mockRequests);
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-error bg-error/10 border-error/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'medium': return 'text-primary bg-primary/10 border-primary/20';
      case 'low': return 'text-text-secondary bg-muted border-border';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning bg-warning/10';
      case 'processing': return 'text-primary bg-primary/10';
      case 'ready': return 'text-success bg-success/10';
      case 'completed': return 'text-text-secondary bg-muted';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const filteredRequests = refillRequests?.filter(request => {
    if (filter === 'all') return true;
    return request?.status === filter;
  });

  const sortedRequests = [...filteredRequests]?.sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority];
      case 'date':
        return new Date(b.requestDate) - new Date(a.requestDate);
      case 'patient':
        return a?.patientName?.localeCompare(b?.patientName);
      case 'pickup':
        return new Date(a.estimatedPickup) - new Date(b.estimatedPickup);
      default:
        return 0;
    }
  });

  const handleProcessRefill = (request) => {
    setRefillRequests(prev => 
      prev?.map(r => 
        r?.id === request?.id 
          ? { ...r, status: 'processing' }
          : r
      )
    );
    if (onProcessRefill) {
      onProcessRefill(request);
    }
  };

  const handleMarkReady = (request) => {
    setRefillRequests(prev => 
      prev?.map(r => 
        r?.id === request?.id 
          ? { ...r, status: 'ready' }
          : r
      )
    );
  };

  const getDaysUntilPickup = (pickupDate) => {
    const today = new Date();
    const pickup = new Date(pickupDate);
    const diffTime = pickup - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Refill Requests</h2>
          <p className="text-sm text-text-secondary mt-1">
            {refillRequests?.length} total requests • {refillRequests?.filter(r => r?.status === 'pending')?.length} pending
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="priority">Sort by Priority</option>
            <option value="date">Sort by Date</option>
            <option value="patient">Sort by Patient</option>
            <option value="pickup">Sort by Pickup</option>
          </select>
        </div>
      </div>
      <div className="space-y-4">
        {sortedRequests?.map((request) => (
          <div key={request?.id} className="border border-border rounded-lg p-4 hover:shadow-medical-sm transition-medical">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="font-medium text-text-primary">{request?.patientName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request?.priority)}`}>
                    {request?.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request?.status)}`}>
                    {request?.status}
                  </span>
                  {request?.coldChain && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <Icon name="Snowflake" size={12} className="inline mr-1" />
                      Cold Chain
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-sm font-medium text-text-primary mb-1">{request?.medication}</div>
                    <div className="text-xs text-text-secondary">Quantity: {request?.quantity} • Refills: {request?.refillsRemaining}</div>
                    <div className="text-xs text-text-secondary">Rx: {request?.prescriptionId}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-text-secondary">Doctor</div>
                    <div className="text-sm font-medium text-text-primary">{request?.doctorName}</div>
                    <div className="text-xs text-text-secondary">Last filled: {new Date(request.lastFilled)?.toLocaleDateString()}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-text-secondary">Pickup</div>
                    <div className="text-sm font-medium text-text-primary">
                      {new Date(request.estimatedPickup)?.toLocaleDateString()}
                    </div>
                    <div className={`text-xs ${getDaysUntilPickup(request?.estimatedPickup) <= 0 ? 'text-error' : 'text-text-secondary'}`}>
                      {getDaysUntilPickup(request?.estimatedPickup) === 0 ? 'Today' : 
                       getDaysUntilPickup(request?.estimatedPickup) === 1 ? 'Tomorrow' :
                       `${getDaysUntilPickup(request?.estimatedPickup)} days`}
                    </div>
                  </div>
                </div>

                {request?.notes && (
                  <div className="bg-muted rounded-lg p-3 mb-3">
                    <div className="text-xs text-text-secondary mb-1">Notes:</div>
                    <div className="text-sm text-text-primary">{request?.notes}</div>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Icon name="CreditCard" size={12} />
                    <span>Insurance: {request?.insuranceStatus}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Phone" size={12} />
                    <span>{request?.patientPhone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={12} />
                    <span>Requested: {new Date(request.requestDate)?.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                {request?.status === 'pending' && (
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Play"
                    iconPosition="left"
                    iconSize={14}
                    onClick={() => handleProcessRefill(request)}
                  >
                    Process
                  </Button>
                )}
                
                {request?.status === 'processing' && (
                  <Button
                    variant="success"
                    size="sm"
                    iconName="Check"
                    iconPosition="left"
                    iconSize={14}
                    onClick={() => handleMarkReady(request)}
                  >
                    Mark Ready
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  iconName="MessageCircle"
                  iconPosition="left"
                  iconSize={14}
                  onClick={() => onContactPatient && onContactPatient(request)}
                >
                  Contact
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {sortedRequests?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No refill requests found</p>
        </div>
      )}
    </div>
  );
};

export default RefillRequestsPanel;