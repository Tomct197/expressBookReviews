const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// 只有注册用户可以登录
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 检查是否提供了用户名和密码
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // 验证用户身份
  if (!authenticatedUser(username, password)) {
    console.log(`Failed login attempt for username: ${username} with password: ${password}`);
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // 创建JWT
  const token = jwt.sign({ username }, "secret_key", { expiresIn: '1h' });

  // 保存JWT到会话中
  req.session.token = token;

  return res.status(200).json({ message: "Login successful", token });
});

// 添加或修改书评
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!req.session.token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let username;
  try {
    const decoded = jwt.verify(req.session.token, "secret_key");
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});
// 删除书评
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!req.session.token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let username;
  try {
    const decoded = jwt.verify(req.session.token, "secret_key");
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

