import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

const complaintSchema = new mongoose.Schema({
  name: String,
  phone: String,
  location: String,
  issueType: String,
  description: String,
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

// Routes
app.post('/api/complaints', async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.json({ message: '✅ Complaint Registered!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/complaints', async (req, res) => {
  const complaints = await Complaint.find().sort({ date: -1 });
  res.json(complaints);
});

app.get('/api/stats', async (req, res) => {
  const total = await Complaint.countDocuments();
  const pending = await Complaint.countDocuments({ status: 'Pending' });
  const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
  const resolved = await Complaint.countDocuments({ status: 'Resolved' });
  res.json({ total, pending, inProgress, resolved });
});

// New: Update Status
app.patch('/api/complaints/:id', async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: 'Status Updated Successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
