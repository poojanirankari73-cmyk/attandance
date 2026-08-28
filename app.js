const Storage = {
  getStudents() {
    return JSON.parse(localStorage.getItem('ams_students') || '[]');
  },
  setStudents(students) {
    localStorage.setItem('ams_students', JSON.stringify(students));
  },
  getAttendance() {
    return JSON.parse(localStorage.getItem('ams_attendance') || '[]');
  },
  setAttendance(records) {
    localStorage.setItem('ams_attendance', JSON.stringify(records));
  },
  getClasses() {
    return JSON.parse(localStorage.getItem('ams_classes') || '[]');
  },
  setClasses(classes) {
    localStorage.setItem('ams_classes', JSON.stringify(classes));
  },
  getSubjects() {
    return JSON.parse(localStorage.getItem('ams_subjects') || '[]');
  },
  setSubjects(subjects) {
    localStorage.setItem('ams_subjects', JSON.stringify(subjects));
  },
  getUsers() {
    return JSON.parse(localStorage.getItem('ams_users') || '[]');
  },
  setUsers(users) {
    localStorage.setItem('ams_users', JSON.stringify(users));
  },
  getSession() {
    return JSON.parse(localStorage.getItem('ams_session') || 'null');
  },
  setSession(session) {
    localStorage.setItem('ams_session', JSON.stringify(session));
  },
  clearSession() {
    localStorage.removeItem('ams_session');
  }
};

function initData() {
  if (Storage.getClasses().length === 0) {
    Storage.setClasses([
      { id: 1, name: 'Computer Science', section: 'A', year: '2024-25' },
      { id: 2, name: 'Information Technology', section: 'A', year: '2024-25' }
    ]);
  }

  if (Storage.getSubjects().length === 0) {
    Storage.setSubjects([
      { id: 1, name: 'Data Structures', code: 'CS101', classId: 1, facultyId: 'teacher1' },
      { id: 2, name: 'Operating Systems', code: 'CS102', classId: 1, facultyId: 'teacher1' },
      { id: 3, name: 'Database Management', code: 'IT101', classId: 2, facultyId: 'teacher1' }
    ]);
  }

  if (Storage.getStudents().length === 0) {
    const demoStudents = [
      { id: 's1', rollNo: 'CS001', name: 'Alice Johnson', classId: 1, createdAt: '2024-01-01T00:00:00Z' },
      { id: 's2', rollNo: 'CS002', name: 'Bob Smith', classId: 1, createdAt: '2024-01-01T00:00:00Z' },
      { id: 's3', rollNo: 'CS003', name: 'Charlie Brown', classId: 1, createdAt: '2024-01-01T00:00:00Z' },
      { id: 's4', rollNo: 'IT001', name: 'Diana Prince', classId: 2, createdAt: '2024-01-01T00:00:00Z' },
      { id: 's5', rollNo: 'IT002', name: 'Eve Davis', classId: 2, createdAt: '2024-01-01T00:00:00Z' }
    ];
    Storage.setStudents(demoStudents);
  }

  if (Storage.getAttendance().length === 0) {
    const today = new Date();
    const demoAttendance = [];
    const students = Storage.getStudents();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      students.forEach(student => {
        const rand = Math.random();
        let status = 'present';
        if (rand > 0.8) status = 'absent';
        else if (rand > 0.6) status = 'late';

        demoAttendance.push({
          id: generateId() + '-' + student.id + '-' + dateStr,
          studentId: student.id,
          classId: student.classId,
          date: dateStr,
          status: status,
          timestamp: date.toISOString()
        });
      });
    }
    Storage.setAttendance(demoAttendance);
  }

  if (Storage.getUsers().length === 0) {
    const students = Storage.getStudents();
    Storage.setUsers([
      { id: 'teacher1', username: 'teacher', password: 'teacher123', role: 'teacher', name: 'Admin Teacher' },
      { id: 'student1', username: 'student1', password: 'student123', role: 'student', name: students[0]?.name || 'John Doe', studentId: students[0]?.id || 's1' }
    ]);
  }
}

function requireAuth() {
  const session = Storage.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

function logout() {
  Storage.clearSession();
  window.location.href = 'login.html';
}

function showAlert(message, type = 'success') {
  const alertEl = document.getElementById('alert');
  if (!alertEl) return;
  alertEl.className = `alert alert-${type} show`;
  alertEl.textContent = message;
  setTimeout(() => alertEl.classList.remove('show'), 3000);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id);
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => closeModal(modal.id));
  }
});

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function exportToCSV(data, filename) {
  const headers = Object.keys(data[0] || {});
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function calculateAttendanceStats(studentId, classId, subjectId) {
  const records = Storage.getAttendance();
  const studentRecords = records.filter(r => r.studentId === studentId && r.classId == classId && (!subjectId || r.subjectId == subjectId));

  const total = studentRecords.length;
  const present = studentRecords.filter(r => r.status === 'present').length;
  const absent = studentRecords.filter(r => r.status === 'absent').length;
  const late = studentRecords.filter(r => r.status === 'late').length;
  const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

  return { total, present, absent, late, percentage };
}

function getClassStats(classId, date, subjectId) {
  const records = Storage.getAttendance().filter(r => r.classId == classId && r.date === date && (!subjectId || r.subjectId == subjectId));
  const students = Storage.getStudents().filter(s => s.classId == classId);

  return {
    total: students.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    notMarked: students.length - records.length
  };
}

function getSubjectStats(subjectId, date) {
  const subject = Storage.getSubjects().find(s => s.id == subjectId);
  if (!subject) return { total: 0, present: 0, absent: 0, late: 0, notMarked: 0 };

  const records = Storage.getAttendance().filter(r => r.subjectId == subjectId && r.date === date);
  const students = Storage.getStudents().filter(s => s.classId == subject.classId);

  return {
    total: students.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    notMarked: students.length - records.length
  };
}

function getFacultySubjects(facultyId) {
  return Storage.getSubjects().filter(s => s.facultyId == facultyId);
}

function getSubjectName(subjectId) {
  const subject = Storage.getSubjects().find(s => s.id == subjectId);
  return subject ? subject.name : 'Unknown';
}

function getClassName(classId) {
  const cls = Storage.getClasses().find(c => c.id == classId);
  return cls ? `${cls.name} - ${cls.section}` : 'Unknown';
}

function getStudentName(studentId) {
  const student = Storage.getStudents().find(s => s.id === studentId);
  return student ? student.name : 'Unknown';
}

function getFacultyName(facultyId) {
  const user = Storage.getUsers().find(u => u.id === facultyId);
  return user ? user.name : 'Unassigned';
}

function initDashboard() {
  initData();
}
