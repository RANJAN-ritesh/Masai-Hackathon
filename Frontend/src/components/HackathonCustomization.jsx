import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MyContext } from '../context/AuthContextProvider';
import { Palette, Type, Eye, Save, X } from 'lucide-react';

const HackathonCustomization = ({ isOpen, onClose, hackathonId, currentTheme, currentFont }) => {
  const { hackathon } = useContext(MyContext);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'modern-tech');
  const [selectedFont, setSelectedFont] = useState(currentFont || 'roboto');
  const [isSaving, setIsSaving] = useState(false);
  
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  // Theme configurations
  const themes = {
    'modern-tech': {
      name: 'Modern Tech',
      description: 'Dark theme with blue accents and tech-inspired gradients',
      preview: {
        backgroundColor: '#0f172a',
        textColor: '#f8fafc',
        accentColor: '#3b82f6',
        cardBg: '#1e293b'
      }
    },
    'creative-arts': {
      name: 'Creative Arts',
      description: 'Light theme with vibrant colors and artistic patterns',
      preview: {
        backgroundColor: '#fef3c7',
        textColor: '#1f2937',
        accentColor: '#ec4899',
        cardBg: '#ffffff'
      }
    },
    'corporate': {
      name: 'Corporate',
      description: 'Professional theme with clean lines and business focus',
      preview: {
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        accentColor: '#475569',
        cardBg: '#ffffff'
      }
    },
    'minimalist': {
      name: 'Minimalist',
      description: 'Clean design with lots of whitespace and simplicity',
      preview: {
        backgroundColor: '#ffffff',
        textColor: '#374151',
        accentColor: '#6b7280',
        cardBg: '#f9fafb'
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

  const ThemePreview = ({ themeKey, theme }) => (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selectedTheme === themeKey ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setSelectedTheme(themeKey)}
      style={{
        backgroundColor: theme.preview.backgroundColor,
        color: theme.preview.textColor
      }}
    >
      <div className="font-semibold mb-2">{theme.name}</div>
      <div className="text-sm opacity-80 mb-3">{theme.description}</div>
      <div className="space-y-2">
        <div
          className="h-3 rounded"
          style={{ backgroundColor: theme.preview.accentColor }}
        ></div>
        <div
          className="h-8 rounded p-2"
          style={{ backgroundColor: theme.preview.cardBg }}
        ></div>
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
      <div className="font-semibold mb-2">{font.name}</div>
      <div className="text-sm text-gray-600 mb-3">{font.description}</div>
      <div
        className="text-lg"
        style={{ fontFamily: font.family }}
      >
        The quick brown fox jumps over the lazy dog
      </div>
      <div
        className="text-sm mt-2"
        style={{ fontFamily: font.family }}
      >
        1234567890
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Customize Hackathon</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
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

        {/* Live Preview */}
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <Eye className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
          </div>
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: themes[selectedTheme].preview.backgroundColor,
              color: themes[selectedTheme].preview.textColor,
              fontFamily: fonts[selectedFont].family
            }}
          >
            <h4 className="text-xl font-bold mb-4">Hackathon Title</h4>
            <p className="mb-4">
              This is how your hackathon page will look with the selected theme and font.
              The preview shows the main content area styling.
            </p>
            <div
              className="p-4 rounded"
              style={{ backgroundColor: themes[selectedTheme].preview.cardBg }}
            >
              <h5 className="font-semibold mb-2">Sample Content Card</h5>
              <p className="text-sm opacity-80">
                This represents how content cards will appear in your selected theme.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HackathonCustomization; 