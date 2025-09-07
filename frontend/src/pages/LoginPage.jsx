// Updated LoginPage.jsx with MovieRazzi dark theme
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import Input from "../components/Input";
import API from "../utils/api";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await API.post("/login", {
        username: username,
        password: password,
      });
      localStorage.setItem("token", res.data.access_token);
      toast.success("Login successful!");
      navigate("/overview");
    } catch (err) {
      console.log(err);
      toast.error("Invalid username or password");
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-md w-full mt-16 bg-[#161B22] text-white rounded-xl shadow-lg p-8 border border-white/10 backdrop-blur"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-center mb-6">
        Login to MovieRazzi
      </h2>
      <form onSubmit={handleLogin}>
        <p className="text-sm text-gray-400">Username</p>
        <Input
          icon={Mail}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <p className="text-sm text-gray-400 mt-4">Password</p>
        <Input
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3 rounded-lg shadow-md"
        >
          {isLoading ? <Loader className="mx-auto animate-spin" /> : "Login"}
        </motion.button>
      </form>
      <div className="text-center mt-4 text-sm text-gray-400">
        Don't have an account?{" "}
        <Link to="/signup" className="text-orange-400 hover:underline">
          Sign up
        </Link>
      </div>
    </motion.div>
  );
};

export default LoginPage;
