import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Play } from "lucide-react";
import { useAuth } from "../lib/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

export function AuthForm({ mode, onToggleMode }) {
  const { signIn, signUp } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "", // kept for UI only
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const backgroundImages = [
    "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    "https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    "https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const result = await signIn(formData.username, formData.password);
        if (result?.error) {
          setError("Invalid Credentials. Try Again!!");
        } else {
          navigate(from, { replace: true }); // ✅
        }
      } else {
        const result = await signUp(
          formData.username,
          formData.email,
          formData.password
        );
        if (result?.error) {
          setError("Sign Up Failed!");
        } else {
          navigate(from, { replace: true }); // ✅
        }
      }
    } catch {
      setError(
        mode === "login"
          ? "Invalid Credentials. Try Again!!"
          : "Sign Up Failed!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 opacity-30 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-30" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-600 p-3 rounded-lg shadow-lg">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Movie<span className="text-red-600">Razzi</span>
          </h1>
          <p className="text-gray-300">Unlimited movies, TV shows and more.</p>
        </div>

        <div className="bg-black/75 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-800 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === "login" ? "Sign In" : "Sign Up"}
            </h2>
            <p className="text-gray-400 text-sm">
              {mode === "login"
                ? "Welcome back to MovieRazzi"
                : "Join millions of movie lovers"}
            </p>
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all placeholder-gray-500"
                required
              />
            </div>

            {mode === "signup" && (
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all placeholder-gray-500"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-red-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white pl-12 pr-12 py-4 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {mode === "login" ? "Signing In..." : "Creating Account..."}
                </div>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={onToggleMode}
                className="text-red-500 hover:text-red-400 transition-colors font-semibold"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Watch anywhere. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
