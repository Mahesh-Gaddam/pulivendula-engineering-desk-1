import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

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

app.post('/api/complaints', async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.json({ success: true, message: '✅ Complaint Registered Successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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

app.patch('/api/complaints/:id', async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true, message: 'Status Updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
