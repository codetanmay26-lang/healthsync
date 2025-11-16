/**
 * Enhanced localStorage User Management
 * Simple, immediate solution - no Firebase needed
 */

// Initialize default users including Rakesh Sharma
export const initializeDefaultUsers = () => {
  const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

  if (existingUsers.length === 0) {
    const defaultUsers = [
      // Keep existing Rakesh Sharma
      {
        id: "patient-rakesh-001",
        uid: "patient-rakesh-001",
        name: "Rakesh Sharma",
        email: "patient@healthsync.com",
        password: "patient123", // In real app, this should be hashed
        role: "patient",
        phone: "+91-9876543210",
        dateOfBirth: "1980-05-15",
        gender: "male",
        bloodGroup: "A+",
        address: "Mumbai, Maharashtra",
        patientId: "PAT-001",
        assignedDoctorId: "doctor-sarah-001", // Assigned to Dr. Sarah
        active: true,
        createdAt: new Date().toISOString(),
      },
      // Doctor - Dr. Sarah Johnson
      {
        id: "doctor-sarah-001",
        uid: "doctor-sarah-001",
        name: "Dr. Sarah Johnson",
        email: "doctor@healthsync.com",
        password: "doctor123",
        role: "doctor",
        phone: "+91-9876543211",
        gender: "female",
        doctorId: "DOC-001",
        specialization: "General Medicine",
        qualification: "MBBS, MD",
        experience: "10 years",
        assignedPatients: ["patient-rakesh-001"], // Rakesh assigned to her
        active: true,
        createdAt: new Date().toISOString(),
      },
      // Admin
      {
        id: "admin-001",
        uid: "admin-001",
        name: "System Administrator",
        email: "admin@healthsync.com",
        password: "admin123",
        role: "admin",
        phone: "+91-9876543213",
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }
};

// Get all users (admin only)
export const getAllUsers = () => {
  return JSON.parse(localStorage.getItem("users") || "[]");
};

// Get user by ID
export const getUserById = (userId) => {
  const users = getAllUsers();
  return users.find((u) => u.id === userId || u.uid === userId);
};

// Get doctor's assigned patients
export const getDoctorPatients = (doctorId) => {
  const users = getAllUsers();
  const doctor = users.find((u) => u.id === doctorId && u.role === "doctor");

  if (!doctor || !doctor.assignedPatients) return [];

  return users.filter(
    (u) => u.role === "patient" && doctor.assignedPatients.includes(u.id)
  );
};

// Create new user (admin only)
export const createUser = (userData) => {
  const users = getAllUsers();

  // Check if email already exists
  if (users.some((u) => u.email === userData.email)) {
    return { success: false, error: "Email already exists" };
  }

  const newUser = {
    id: `${userData.role}-${Date.now()}`,
    uid: `${userData.role}-${Date.now()}`,
    ...userData,
    active: true,
    createdAt: new Date().toISOString(),
  };

  // Add role-specific fields
  if (userData.role === "patient") {
    newUser.patientId = `PAT-${Date.now()}`;
    newUser.assignedDoctorId = userData.assignedDoctorId || null;
  } else if (userData.role === "doctor") {
    newUser.doctorId = `DOC-${Date.now()}`;
    newUser.assignedPatients = [];
  }

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  return { success: true, user: newUser };
};

// Assign patient to doctor
export const assignPatientToDoctor = (patientId, doctorId) => {
  const users = getAllUsers();

  // Update patient's assignedDoctorId
  const patientIndex = users.findIndex((u) => u.id === patientId);
  if (patientIndex !== -1) {
    users[patientIndex].assignedDoctorId = doctorId;
  }

  // Update doctor's assignedPatients array
  const doctorIndex = users.findIndex((u) => u.id === doctorId);
  if (doctorIndex !== -1) {
    if (!users[doctorIndex].assignedPatients) {
      users[doctorIndex].assignedPatients = [];
    }
    if (!users[doctorIndex].assignedPatients.includes(patientId)) {
      users[doctorIndex].assignedPatients.push(patientId);
    }
  }

  localStorage.setItem("users", JSON.stringify(users));
  return { success: true };
};

// Update user
export const updateUser = (userId, updates) => {
  const users = getAllUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: "User not found" };
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  localStorage.setItem("users", JSON.stringify(users));

  return { success: true, user: users[userIndex] };
};

// Delete/Deactivate user
export const deleteUser = (userId) => {
  const users = getAllUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: "User not found" };
  }

  // Just deactivate, don't delete
  users[userIndex].active = false;
  localStorage.setItem("users", JSON.stringify(users));

  return { success: true };
};

// Messaging system
export const sendMessage = (fromUserId, toUserId, message) => {
  const messages = JSON.parse(localStorage.getItem("messages") || "[]");

  const newMessage = {
    id: `msg-${Date.now()}`,
    from: fromUserId,
    to: toUserId,
    fromUser: getUserById(fromUserId),
    toUser: getUserById(toUserId),
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };

  messages.push(newMessage);
  localStorage.setItem("messages", JSON.stringify(messages));

  return { success: true, message: newMessage };
};

// Get messages between two users
export const getMessagesBetweenUsers = (userId1, userId2) => {
  const messages = JSON.parse(localStorage.getItem("messages") || "[]");

  return messages
    .filter(
      (m) =>
        (m.from === userId1 && m.to === userId2) ||
        (m.from === userId2 && m.to === userId1)
    )
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};
