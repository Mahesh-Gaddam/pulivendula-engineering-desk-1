import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ====================== HTML PAGE ======================
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pulivendula Engineering Desk</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
  <div class="max-w-5xl mx-auto p-4">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-blue-900">Pulivendula Municipality</h1>
      <h2 class="text-2xl text-gray-700">Engineering Complaint Desk</h2>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" id="stats"></div>

    <!-- Tabs -->
    <div class="flex bg-white rounded-t-2xl shadow overflow-hidden">
      <button onclick="switchTab(0)" id="tab0" class="flex-1 py-4 font-semibold text-blue-600 border-b-4 border-blue-600">Register</button>
      <button onclick="switchTab(1)" id="tab1" class="flex-1 py-4 font-semibold text-gray-600">All Complaints</button>
      <button onclick="switchTab(2)" id="tab2" class="flex-1 py-4 font-semibold text-gray-600">AE Admin</button>
    </div>

    <!-- Register Tab -->
    <div id="tabContent0" class="bg-white p-6 rounded-b-2xl shadow">
      <form id="complaintForm" class="space-y-5">
        <input type="text" id="name" placeholder="Full Name" required class="w-full p-4 border rounded-xl">
        <input type="tel" id="phone" placeholder="Phone Number" required class="w-full p-4 border rounded-xl">
        <input type="text" id="location" placeholder="Area / Ward / Landmark" required class="w-full p-4 border rounded-xl">
        <select id="issueType" required class="w-full p-4 border rounded-xl">
          <option value="">Select Issue Type</option>
          <option>Road Damage</option>
          <option>Water Supply</option>
          <option>Drainage</option>
          <option>Street Light</option>
          <option>Garbage</option>
          <option>Others</option>
        </select>
        <textarea id="description" rows="4" placeholder="Describe the issue..." required class="w-full p-4 border rounded-xl"></textarea>
        <button type="submit" class="w-full bg-blue-700 text-white py-4 rounded-xl font-bold">Submit Complaint</button>
      </form>
    </div>

    <!-- All Complaints -->
    <div id="tabContent1" class="hidden bg-white p-6 rounded-b-2xl shadow">
      <div id="complaintsList" class="space-y-4"></div>
    </div>

    <!-- Admin -->
    <div id="tabContent2" class="hidden bg-white p-6 rounded-b-2xl shadow">
      <input type="password" id="adminPass" placeholder="Password: admin123" class="w-full p-4 border rounded-xl mb-4">
      <button onclick="loginAdmin()" class="w-full bg-green-700 text-white py-4 rounded-xl font-bold">Login as AE</button>
      <div id="adminPanel" class="hidden mt-8">
        <h3 class="font-semibold mb-4">Update Status</h3>
        <div id="adminList" class="space-y-4"></div>
      </div>
    </div>
  </div>

  <script>
    const ADMIN_PASS = "admin123";

    async function loadStats() {
      const res = await fetch('/api/stats');
      const data = await res.json();
      document.getElementById('stats').innerHTML = \`
        <div class="bg-white p-6 rounded-2xl shadow text-center">
          <p class="text-red-600 text-sm">Needs AE Action</p>
          <p class="text-5xl font-bold">\${data.pending || 0}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow text-center">
          <p class="text-yellow-600 text-sm">In Progress</p>
          <p class="text-5xl font-bold">\${data.inProgress || 0}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow text-center">
          <p class="text-green-600 text-sm">Resolved</p>
          <p class="text-5xl font-bold">\${data.resolved || 0}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow text-center">
          <p class="text-blue-600 text-sm">Total</p>
          <p class="text-5xl font-bold">\${data.total || 0}</p>
        </div>
      \`;
    }

    async function loadComplaints() {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      let html = data.map(c => \`
        <div class="border rounded-2xl p-5 bg-white">
          <div class="flex justify-between">
            <div><strong>\${c.name}</strong> - \${c.location}</div>
            <span class="px-4 py-1 rounded-full text-sm \${c.status === 'Resolved' ? 'bg-green-100 text-green-700' : c.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
              \${c.status}
            </span>
          </div>
          <p class="text-sm mt-2">\${c.issueType}</p>
          <p class="mt-3">\${c.description}</p>
        </div>
      \`).join('');
      document.getElementById('complaintsList').innerHTML = html || '<p class="text-center py-10 text-gray-500">No complaints yet</p>';
    }

    function loginAdmin() {
      if (document.getElementById('adminPass').value === ADMIN_PASS) {
        document.getElementById('adminPanel').classList.remove('hidden');
        loadComplaintsForAdmin();
      } else {
        alert('Wrong Password! Use: admin123');
      }
    }

    async function loadComplaintsForAdmin() {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      let html = data.map(c => \`
        <div class="border rounded-2xl p-5">
          <p class="font-bold">\${c.name} - \${c.location}</p>
          <p class="text-sm">\${c.description}</p>
          <div class="mt-4 flex gap-3">
            <button onclick="updateStatus('\${c._id}', 'In Progress')" class="flex-1 bg-yellow-500 text-white py-3 rounded-xl">In Progress</button>
            <button onclick="updateStatus('\${c._id}', 'Resolved')" class="flex-1 bg-green-600 text-white py-3 rounded-xl">Mark Resolved</button>
          </div>
        </div>
      \`).join('');
      document.getElementById('adminList').innerHTML = html;
    }

    function updateStatus(id, status) {
      fetch(\`/api/complaints/\${id}\`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({status})
      }).then(() => {
        alert('✅ Status Updated!');
        loadComplaints();
        loadComplaintsForAdmin();
        loadStats();
      });
    }

    function switchTab(n) {
      document.querySelectorAll('#tabContent0,#tabContent1,#tabContent2').forEach(el => el.classList.add('hidden'));
      document.getElementById('tabContent' + n).classList.remove('hidden');
      
      document.querySelectorAll('#tab0,#tab1,#tab2').forEach(el => el.classList.remove('border-b-4', 'border-blue-600', 'text-blue-600'));
      document.getElementById('tab' + n).classList.add('border-b-4', 'border-blue-600', 'text-blue-600');

      if (n === 1) loadComplaints();
      if (n === 2) loadComplaintsForAdmin();
    }

    // Form Submit
    document.getElementById('complaintForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        issueType: document.getElementById('issueType').value,
        description: document.getElementById('description').value
      };

      await fetch('/api/complaints', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });

      alert('✅ Complaint Submitted Successfully!');
      e.target.reset();
      loadStats();
      loadComplaints();
    });

    // Load on start
    loadStats();
    setInterval(loadStats, 10000);
  </script>
</body>
</html>
`;

// Serve HTML
app.get('/', (req, res) => res.send(html));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// API Routes
app.post('/api/complaints', async (req, res) => {
  const complaint = new mongoose.model('Complaint', new mongoose.Schema({
    name: String, phone: String, location: String,
    issueType: String, description: String,
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now }
  }))(req.body);
  await complaint.save();
  res.json({ message: '✅ Complaint Registered!' });
});

app.get('/api/complaints', async (req, res) => {
  const Complaint = mongoose.model('Complaint');
  const complaints = await Complaint.find().sort({ date: -1 });
  res.json(complaints);
});

app.get('/api/stats', async (req, res) => {
  const Complaint = mongoose.model('Complaint');
  const [total, pending, inProgress, resolved] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({status: 'Pending'}),
    Complaint.countDocuments({status: 'In Progress'}),
    Complaint.countDocuments({status: 'Resolved'})
  ]);
  res.json({total, pending, inProgress, resolved});
});

app.patch('/api/complaints/:id', async (req, res) => {
  const Complaint = mongoose.model('Complaint');
  await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json({ message: 'Status Updated' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`🚀 Server running on port \${PORT}\`));
