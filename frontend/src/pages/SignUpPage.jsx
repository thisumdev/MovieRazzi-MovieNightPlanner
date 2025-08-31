// src/pages/SignUpPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Input from "../components/Input";
import { User, Mail, Lock, Loader } from "lucide-react";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import API from "../utils/api";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await API.post("/signup", {
        username: username,
        email: email,
        password: password,
      });
      toast.success("Signup successful!");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.detail || "Signup failed";
      toast.error(message);
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-md w-full mt-10 bg-white bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSignup}>
        <p className="text-sm text-gray-600">Username</p>
        <Input
          icon={User}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <p className="text-sm text-gray-600 mt-4">Email</p>
        <Input
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
        />

        <p className="text-sm text-gray-600 mt-4">Password</p>
        <Input
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <PasswordStrengthMeter password={password} />

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg shadow-md"
        >
          {isLoading ? <Loader className="mx-auto animate-spin" /> : "Sign Up"}
        </motion.button>
      </form>
      <div className="text-center mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </div>
    </motion.div>
  );
};

export default SignUpPage;
