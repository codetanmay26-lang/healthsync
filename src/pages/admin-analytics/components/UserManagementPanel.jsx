import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UserManagementPanel = ({ users, onUserAction }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesRole = selectedRole === "all" || user?.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor': return 'Stethoscope';
      case 'patient': return 'User';
      case 'pharmacy': return 'Pill';
      case 'admin': return 'Shield';
      default: return 'User';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor': return 'text-primary bg-primary/10';
      case 'patient': return 'text-accent bg-accent/10';
      case 'pharmacy': return 'text-warning bg-warning/10';
      case 'admin': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10';
      case 'inactive': return 'text-text-secondary bg-muted';
      case 'suspended': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">User Management</h3>
        <Button 
          variant="default" 
          size="sm" 
          iconName="Plus" 
          iconPosition="left"
          onClick={() => setShowAddUser(true)}
        >
          Add User
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Roles</option>
            <option value="doctor">Doctors</option>
            <option value="patient">Patients</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredUsers?.map((user) => (
          <div key={user?.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-medical">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={20} color="white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-text-primary">{user?.name}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                    <Icon name={getRoleIcon(user?.role)} size={12} className="mr-1" />
                    {user?.role}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user?.status)}`}>
                    {user?.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{user?.email}</p>
                <p className="text-xs text-text-secondary">
                  Last active: {new Date(user.lastActive)?.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                iconName="Edit"
                iconSize={16}
                onClick={() => onUserAction('edit', user)}
              />
              <Button
                variant="ghost"
                size="sm"
                iconName={user?.status === 'active' ? 'UserX' : 'UserCheck'}
                iconSize={16}
                onClick={() => onUserAction(user?.status === 'active' ? 'suspend' : 'activate', user)}
              />
              <Button
                variant="ghost"
                size="sm"
                iconName="MoreVertical"
                iconSize={16}
                onClick={() => onUserAction('menu', user)}
              />
            </div>
          </div>
        ))}
      </div>
      {filteredUsers?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No users found matching your criteria</p>
        </div>
      )}
      <div className="border-t border-border pt-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{users?.filter(u => u?.role === 'doctor')?.length}</div>
            <div className="text-sm text-text-secondary">Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{users?.filter(u => u?.role === 'patient')?.length}</div>
            <div className="text-sm text-text-secondary">Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{users?.filter(u => u?.role === 'pharmacy')?.length}</div>
            <div className="text-sm text-text-secondary">Pharmacy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{users?.filter(u => u?.status === 'active')?.length}</div>
            <div className="text-sm text-text-secondary">Active Users</div>
          </div>
        </div>
      </div>
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030">
          <div className="bg-surface rounded-lg shadow-medical-md p-6 max-w-md mx-4 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Add New User</h3>
              <Button
                variant="ghost"
                size="icon"
                iconName="X"
                iconSize={20}
                onClick={() => setShowAddUser(false)}
              />
            </div>
            
            <div className="space-y-4">
              <Input label="Full Name" type="text" placeholder="Enter full name" required />
              <Input label="Email Address" type="email" placeholder="Enter email address" required />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Input label="Temporary Password" type="password" placeholder="Enter temporary password" required />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button variant="default" className="flex-1">Create User</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowAddUser(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;