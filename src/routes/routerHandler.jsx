const handleLoginRequest = (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  res.status(200).json({ message: "Login successful" });
};

const handleSignupRequest = (req, res) => {
  const { name, email, password } = req.body;
  res.status(200).json({ message: "Signup successful" });
};

module.exports = { handleLoginRequest,handleSignupRequest };
