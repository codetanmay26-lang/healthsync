import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  assignPatientToDoctor
} from '../../../services/localStorageUserManagement';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    gender: '',
    assignedDoctorId: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleCreateUser = () => {
    const result = createUser(newUser);
    if (result.success) {
      alert('User created successfully!');
      loadUsers();
      setShowAddUser(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'patient',
        phone: '',
        gender: '',
        assignedDoctorId: ''
      });
    } else {
      alert(result.error);
    }
  };

  const handleAssignDoctor = (patientId, doctorId) => {
    assignPatientToDoctor(patientId, doctorId);
    loadUsers();
    alert('Patient assigned to doctor successfully!');
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      deleteUser(userId);
      loadUsers();
    }
  };

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(u => u.role === selectedRole);

  const doctors = users.filter(u => u.role === 'doctor');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
            <p className="text-text-secondary mt-1">Manage all system users and assignments</p>
          </div>
          <Button
            variant="default"
            iconName="UserPlus"
            iconPosition="left"
            onClick={() => setShowAddUser(true)}
          >
            Add New User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-text-primary">
              {users.filter(u => u.active).length}
            </div>
            <div className="text-sm text-text-secondary">Total Active Users</div>
          </div>
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-text-primary">
              {users.filter(u => u.role === 'patient' && u.active).length}
            </div>
            <div className="text-sm text-text-secondary">Active Patients</div>
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-text-primary">
              {users.filter(u => u.role === 'doctor' && u.active).length}
            </div>
            <div className="text-sm text-text-secondary">Active Doctors</div>
          </div>
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-text-primary">
              {users.filter(u => !u.active).length}
            </div>
            <div className="text-sm text-text-secondary">Inactive Users</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        {['all', 'patient', 'doctor', 'pharmacy', 'admin'].map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-medical ${
              selectedRole === role
                ? 'bg-primary text-white'
                : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      {/* Users List */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{user.name}</div>
                      {user.role === 'patient' && user.patientId && (
                        <div className="text-xs text-text-secondary">{user.patientId}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    user.role === 'doctor' ? 'bg-primary/10 text-primary' :
                    user.role === 'patient' ? 'bg-success/10 text-success' :
                    user.role === 'admin' ? 'bg-error/10 text-error' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{user.phone || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {user.role === 'patient' && (
                      <select
                        value={user.assignedDoctorId || ''}
                        onChange={(e) => handleAssignDoctor(user.id, e.target.value)}
                        className="text-xs border border-border rounded px-2 py-1 bg-input text-text-primary"
                      >
                        <option value="">Assign Doctor</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name}</option>
                        ))}
                      </select>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Trash2"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-error hover:bg-error/10"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-text-primary mb-4">Add New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary"
                />
              </div>

              {newUser.role === 'patient' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Assign Doctor</label>
                  <select
                    value={newUser.assignedDoctorId}
                    onChange={(e) => setNewUser({...newUser, assignedDoctorId: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 mt-6">
              <Button
                variant="default"
                onClick={handleCreateUser}
                className="flex-1"
              >
                Create User
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddUser(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
