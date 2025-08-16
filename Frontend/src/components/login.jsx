import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Loader2,
  Code,
  Trophy,
  Users,
  Rocket,
  Star,
} from "lucide-react";
import { MyContext } from "../context/AuthContextProvider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { isAuth, setIsAuth, setUserData, userData, role } =
    useContext(MyContext);

  useEffect(() => {
    isAuth && navigate(from);
  }, [isAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${baseURL}/users/verify-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      // console.log("This is users ID: ", data.user.userType);
      localStorage.setItem("userId", data.user.id);
      setIsAuth(true);
      toast.success("User logged in successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      // console.log("from", from, isAuth);
      navigate(from);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Logo, Masai Tagline, and Quote */}
          <div className="text-center mb-8">
            <div className="container mx-auto px-4 py-4 flex justify-center items-center">
              <Link to="/">
                <div className="flex items-center justify-center">
                  <h1 className="text-3xl font-bold">
                    <span className="text-black">xto</span>
                    <span className="text-red-500">10x</span>
                  </h1>
                  <span className="text-gray-500 text-sm ml-2">by masai</span>
                </div>
              </Link>
            </div>

            <p className="text-gray-500 italic">
              "Learn, Build, Evolve — One Line of Code at a Time."
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-[#FF3B3B] p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3B3B] focus:border-[#FF3B3B]"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3B3B] focus:border-[#FF3B3B]"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF3B3B] hover:bg-[#ff2525] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3B3B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Logging in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="w-full max-w-md mx-auto flex flex-col justify-center">
          <div className="mb-12">
            <div className="inline-block p-3 bg-gradient-to-br from-[#FF3B3B] to-[#ff6b6b] rounded-2xl shadow-xl mb-6">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Accelerate Your Learning Journey
            </h2>
            <p className="text-gray-300 text-lg">
              Unlock your potential with hands-on projects and real-world
              challenges.
            </p>
          </div>

          <div className="space-y-8">
            {/* Feature 1 */}
            <div className="flex items-start space-x-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
              <div className="bg-gradient-to-br from-[#FF3B3B]/20 to-[#ff6b6b]/20 p-3 rounded-lg">
                <Code className="h-6 w-6 text-[#FF3B3B]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Hands-On Learning</h3>
                <p className="text-gray-400">
                  Apply your knowledge by building projects using modern
                  technologies.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
              <div className="bg-gradient-to-br from-[#FF3B3B]/20 to-[#ff6b6b]/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-[#FF3B3B]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Collaborative Learning
                </h3>
                <p className="text-gray-400">
                  Work with peers, solve problems together, and grow as a team.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start space-x-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
              <div className="bg-gradient-to-br from-[#FF3B3B]/20 to-[#ff6b6b]/20 p-3 rounded-lg">
                <Trophy className="h-6 w-6 text-[#FF3B3B]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Achieve Excellence</h3>
                <p className="text-gray-400">
                  Earn certifications, build a strong portfolio, and showcase
                  your skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
