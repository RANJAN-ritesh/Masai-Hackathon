import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MyContext } from '../context/AuthContextProvider';
import { useTheme } from '../context/ThemeContextProvider';
import { Palette, Type, Eye, Save, X, Sun, Moon } from 'lucide-react';

const HackathonCustomization = ({ isOpen, onClose, hackathonId, currentTheme, currentFont }) => {
  const { hackathon } = useContext(MyContext);
  const { themeConfig, isDarkMode, toggleDarkMode, applyGlobalTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'modern-tech');
  const [selectedFont, setSelectedFont] = useState(currentFont || 'roboto');
  const [isSaving, setIsSaving] = useState(false);
  
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  // Enhanced theme configurations with dark/light variants
  const themes = {
    'modern-tech': {
      name: 'Modern Tech',
      description: 'Professional theme with tech-inspired gradients',
      variants: {
        light: {
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
          accentColor: '#3b82f6',
          cardBg: '#ffffff',
          borderColor: '#e2e8f0'
        },
        dark: {
          backgroundColor: '#0f172a',
          textColor: '#f8fafc',
          accentColor: '#60a5fa',
          cardBg: '#1e293b',
          borderColor: '#334155'
        }
      }
    },
    'creative-arts': {
      name: 'Creative Arts',
      description: 'Vibrant theme with artistic patterns',
      variants: {
        light: {
          backgroundColor: '#fef3c7',
          textColor: '#1f2937',
          accentColor: '#ec4899',
          cardBg: '#ffffff',
          borderColor: '#fbbf24'
        },
        dark: {
          backgroundColor: '#451a03',
          textColor: '#fef3c7',
          accentColor: '#f472b6',
          cardBg: '#92400e',
          borderColor: '#d97706'
        }
      }
    },
    'corporate': {
      name: 'Corporate',
      description: 'Clean business-focused design',
      variants: {
        light: {
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
          accentColor: '#475569',
          cardBg: '#ffffff',
          borderColor: '#cbd5e1'
        },
        dark: {
          backgroundColor: '#1e293b',
          textColor: '#f8fafc',
          accentColor: '#94a3b8',
          cardBg: '#334155',
          borderColor: '#475569'
        }
      }
    },
    'minimalist': {
      name: 'Minimalist',
      description: 'Clean design with lots of whitespace',
      variants: {
        light: {
          backgroundColor: '#ffffff',
          textColor: '#374151',
          accentColor: '#6b7280',
          cardBg: '#f9fafb',
          borderColor: '#e5e7eb'
        },
        dark: {
          backgroundColor: '#111827',
          textColor: '#f9fafb',
          accentColor: '#9ca3af',
          cardBg: '#1f2937',
          borderColor: '#374151'
        }
      }
    }
  };

  // Font configurations
  const fonts = {
    'roboto': {
      name: 'Roboto',
      description: 'Modern, clean, and highly readable',
      family: 'Roboto, sans-serif'
    },
    'poppins': {
      name: 'Poppins',
      description: 'Friendly and approachable design',
      family: 'Poppins, sans-serif'
    },
    'inter': {
      name: 'Inter',
      description: 'Professional and highly legible',
      family: 'Inter, sans-serif'
    },
    'montserrat': {
      name: 'Montserrat',
      description: 'Creative and stylish typography',
      family: 'Montserrat, sans-serif'
    }
  };

  useEffect(() => {
    if (hackathon) {
      setSelectedTheme(hackathon.theme || 'modern-tech');
      setSelectedFont(hackathon.fontFamily || 'roboto');
    }
  }, [hackathon]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${baseURL}/hackathons/${hackathonId}/customize`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: selectedTheme,
          fontFamily: selectedFont
        }),
      });

      if (response.ok) {
        toast.success('Hackathon customization saved successfully!');
        // Apply the newly selected theme immediately across app
        const variant = isDarkMode ? 'dark' : 'light';
        const cfg = themes[selectedTheme].variants[variant];
        applyGlobalTheme(cfg, fonts[selectedFont].family);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save customization');
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      toast.error('Error saving customization');
    } finally {
      setIsSaving(false);
    }
  };

  const variantKey = isDarkMode ? 'dark' : 'light';
  const previewTheme = themes[selectedTheme].variants[variantKey];

  const ThemePreview = ({ themeKey, theme }) => (
    <div className="space-y-3">
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          selectedTheme === themeKey ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedTheme(themeKey)}
      >
        <div className="font-semibold mb-2 text-gray-800">{theme.name}</div>
        <div className="text-sm text-gray-600 mb-3">{theme.description}</div>
        {/* Light Variant Preview */}
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
            <Sun className="w-3 h-3 mr-1" />
            Light Variant
          </div>
          <div
            className="h-16 rounded p-3 space-y-2"
            style={{
              backgroundColor: theme.variants.light.backgroundColor,
              color: theme.variants.light.textColor
            }}
          >
            <div className="h-2 rounded" style={{ backgroundColor: theme.variants.light.accentColor }}></div>
            <div
              className="h-8 rounded p-2"
              style={{ backgroundColor: theme.variants.light.cardBg, border: `1px solid ${theme.variants.light.borderColor}` }}
            ></div>
          </div>
        </div>
        {/* Dark Variant Preview */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
            <Moon className="w-3 h-3 mr-1" />
            Dark Variant
          </div>
          <div
            className="h-16 rounded p-3 space-y-2"
            style={{
              backgroundColor: theme.variants.dark.backgroundColor,
              color: theme.variants.dark.textColor
            }}
          >
            <div className="h-2 rounded" style={{ backgroundColor: theme.variants.dark.accentColor }}></div>
            <div
              className="h-8 rounded p-2"
              style={{ backgroundColor: theme.variants.dark.cardBg, border: `1px solid ${theme.variants.dark.borderColor}` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  const FontPreview = ({ fontKey, font }) => (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selectedFont === fontKey ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setSelectedFont(fontKey)}
    >
      <div className="font-semibold mb-2 text-gray-800">{font.name}</div>
      <div className="text-sm text-gray-600 mb-3">{font.description}</div>
      <div className="text-lg" style={{ fontFamily: font.family }}>
        The quick brown fox jumps over the lazy dog
      </div>
      <div className="text-sm mt-2" style={{ fontFamily: font.family }}>
        1234567890
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Customize Hackathon</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Dark/Light Mode Toggle */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Theme Mode</h3>
              <p className="text-sm text-gray-600">Toggle between dark and light variants</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
              }`}
            >
              {isDarkMode ? (<><Sun className="w-5 h-5" /><span>Light Mode</span></>) : (<><Moon className="w-5 h-5" /><span>Dark Mode</span></>)}
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <strong>Current:</strong> {isDarkMode ? 'Dark Mode' : 'Light Mode'} - Switch to see how your selected theme looks in both variants!
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Theme Selection */}
          <div>
            <div className="flex items-center mb-4">
              <Palette className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Choose Theme</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(themes).map(([key, theme]) => (
                <ThemePreview key={key} themeKey={key} theme={theme} />
              ))}
            </div>
          </div>

          {/* Font Selection */}
          <div>
            <div className="flex items-center mb-4">
              <Type className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Choose Font</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(fonts).map(([key, font]) => (
                <FontPreview key={key} fontKey={key} font={font} />
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview bound to current selections */}
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <Eye className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
          </div>
          <div
            className="p-6 rounded-lg border-2"
            style={{
              backgroundColor: previewTheme.backgroundColor,
              color: previewTheme.textColor,
              fontFamily: fonts[selectedFont]?.family,
              borderColor: previewTheme.borderColor
            }}
          >
            <h4 className="text-xl font-bold mb-4">Sample Content</h4>
            <p className="mb-4">This is how your hackathon page will look with the selected theme and font.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: previewTheme.cardBg, border: `1px solid ${previewTheme.borderColor}` }}
              >
                <h5 className="font-semibold mb-2">Sample Card</h5>
                <p className="text-sm" style={{ color: previewTheme.mutedText || previewTheme.textColor }}>
                  This card shows the theme's card background and border colors.
                </p>
              </div>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: previewTheme.buttonBg }}>
                  Primary Button
                </button>
                <button
                  className="w-full px-4 py-2 rounded-lg font-medium"
                  style={{ border: `1px solid ${previewTheme.accentColor}`, color: previewTheme.accentColor, backgroundColor: 'transparent' }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center">
            {isSaving ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save Changes</>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HackathonCustomization; 