const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models/index");
const User = require("./models/register");
const Transaction = require("./models/transaksi-data");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

//koneksi ke database
const mongooseConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
db.mongoose.connect(db.url, mongooseConfig)
.then(()=> console.log("database connected"))
.catch(err => {
    console.log(`gagal konek ${err.message}`);
    process.exit();
})

// Create Data
app.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// Route untuk membuat transaksi baru
app.post('/transactions', async (req, res) => {
  const { name, amount } = req.body;

  try {
    // Membuat instance dari model Transaction dengan data yang diberikan
    const newTransaction = new Transaction({ name, amount });

    // Menyimpan data transaksi ke MongoDB
    await newTransaction.save();

    res.status(201).json(newTransaction); // Mengirimkan data transaksi yang baru disimpan sebagai respons
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Error adding transaction' });
  }
});

// Update Data
app.put('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { name, amount } = req.body;

  try {
    // Cari transaksi berdasarkan ID
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { name, amount },
      { new: true }
    );

    await transaction.save();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Error updating transaction' });
  }
});

// Delete Data
app.delete('/transactions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Hapus transaksi berdasarkan ID
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Error deleting transaction' });
  }
});

const secretKey = "mySecretKey123";

// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Akses ditolak");

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).send("Token tidak valid");
    req.user = user;
    next();
  });
};

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cek apakah pengguna sudah terdaftar sebelumnya berdasarkan username atau email
    const existingUser = await User.findOne({ $or: [{ username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Jika pengguna belum terdaftar, buat instance dari model User
    const newUser = new User({ username, password });

    // Simpan pengguna baru ke database
    await newUser.save();

    // Buat token JWT untuk autentikasi setelah registrasi
    const token = jwt.sign({ userId: newUser._id }, 'mySecretKey123');

    // Kirim respons berhasil bersama dengan token
    res.status(201).json({ message: 'Registration successful', token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari pengguna berdasarkan username di database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verifikasi password yang dimasukkan dengan password yang ada di database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Jika verifikasi berhasil, buat token JWT untuk autentikasi
    const token = jwt.sign({ userId: user._id }, 'mySecretKey123');

    // Kirim respons berhasil bersama dengan token
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Protected Route
app.get("/protected", verifyToken, (req, res) => {
  res.send(`Halo, ${req.user.username}! Ini adalah halaman yang dilindungi`);
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
