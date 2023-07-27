import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:4000/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(
        'http://localhost:4000/transactions',
        { name, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      setAmount('');
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `http://localhost:4000/transactions/${id}`,
        { name, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      setAmount('');
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:4000/login', {
        username,
        password,
      });
      setToken(response.data.token);
      setUsername('');
      setPassword('');
      fetchTransactions();
    } catch (error) {
      console.error('Error login:', error);
    }
  };

  return (
    <div>
      <h1>Transaksi Sederhana</h1>
      <div>
        <h2>Login</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button onClick={handleLogin}>Login</button>
      </div>
      {token ? (
        <div>
          <h2>Tambah Data</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Jumlah"
          />
          <button onClick={handleCreate}>Tambah</button>
        </div>
      ) : null}
      {token ? (
        <div>
          <h2>Data Transaksi</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Jumlah</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction._id}</td>
                  <td>{transaction.name}</td>
                  <td>{transaction.amount}</td>
                  <td>
                    <button onClick={() => handleUpdate(transaction._id)}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(transaction._id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default App;
