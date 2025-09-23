import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Calendar, LogOut, Play } from "lucide-react";
import { useAuth } from "../lib/useAuth";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 right-0 z-40 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
        aria-label="Open Menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 right-0 bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-2xl py-3 min-w-56 border border-gray-700/50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-700/50">
            <div className="flex items-center">
              <div className="bg-red-600 p-2 rounded mr-3">
                <Play className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {user?.username || "User"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <button
            onClick={() => {
              setIsOpen(false);
              if (location.pathname !== "/schedule") navigate("/schedule");
            }}
            className="w-full flex items-center px-4 py-3 transition-colors hover:bg-gray-700/50 text-white"
          >
            <Calendar className="h-5 w-5 mr-3 text-red-500" />
            Schedule Creator
          </button>

          <div className="border-t border-gray-700/50 mt-2 pt-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-600/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
