import React, { useState, useRef } from "react";
import {
  Search,
  Code,
  Database,
  Brain,
  Shield,
  Globe,
  Lightbulb,
  Zap,
  Copy,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
} from "lucide-react";

const ResourceHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCards, setExpandedCards] = useState({});
  const [copiedStates, setCopiedStates] = useState({});

  // Categories with their respective icons and colors
  const categories = {
    frontend: {
      icon: <Code className="w-5 h-5 text-white" />,
      label: "Frontend Development",
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    backend: {
      icon: <Database className="w-5 h-5 text-white" />,
      label: "Backend Development",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    ai: {
      icon: <Brain className="w-5 h-5 text-white" />,
      label: "AI/ML Resources",
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
    security: {
      icon: <Shield className="w-5 h-5 text-white" />,
      label: "Security",
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    api: {
      icon: <Globe className="w-5 h-5 text-white" />,
      label: "API Resources",
      color: "bg-orange-500",
      textColor: "text-orange-500",
    },
    tips: {
      icon: <Lightbulb className="w-5 h-5 text-white" />,
      label: "Quick Tips",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
  };

  // Resource data
  const resources = [
    {
      id: 1,
      category: "frontend",
      title: "Modern React Best Practices",
      description:
        "Essential React patterns and optimization techniques for building scalable applications.",
      tags: ["React", "JavaScript", "Performance"],
      difficulty: "Intermediate",
      link: "https://react.dev/learn",
      code: `// Example of React.memo usage
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});`,
      readTime: "5 min",
    },
    {
      id: 2,
      category: "backend",
      title: "Node.js Performance Optimization",
      description:
        "Learn how to optimize your Node.js applications for better performance.",
      tags: ["Node.js", "Performance", "Backend"],
      difficulty: "Advanced",
      link: "https://nodejs.org/en/docs/guides/dont-block-the-event-loop",
      code: `// Example of async/await usage in Node.js
async function getData() {
  try {
    const result = await db.query('SELECT * FROM users');
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}`,
      readTime: "8 min",
    },
    {
      id: 3,
      category: "ai",
      title: "Getting Started with TensorFlow.js",
      description:
        "Build and train ML models in the browser using TensorFlow.js.",
      tags: ["AI", "Machine Learning", "JavaScript"],
      difficulty: "Beginner",
      link: "https://www.tensorflow.org/js",
      code: `// Simple TensorFlow.js example
const model = tf.sequential({
  layers: [
    tf.layers.dense({ inputShape: [1], units: 1 })
  ]
});
model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });`,
      readTime: "10 min",
    },
    {
      id: 4,
      category: "security",
      title: "Web Security Essentials",
      description: "Essential security practices for modern web applications.",
      tags: ["Security", "Web", "Authentication"],
      difficulty: "Intermediate",
      link: "https://owasp.org/www-project-top-ten/",
      code: `// Example of secure password hashing
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}`,
      readTime: "7 min",
    },
    {
      id: 5,
      category: "tips",
      title: "Debug React Apps Like a Pro",
      description:
        "Quick tips and tricks for debugging React applications effectively.",
      tags: ["React", "Debugging", "Development"],
      difficulty: "Intermediate",
      link: "https://react.dev/learn/react-developer-tools",
      code: `// Using React DevTools
function DebugComponent() {
  console.log('Component rendered');
  debugger; // Set breakpoint
  return <div>Debug me!</div>;
}`,
      readTime: "4 min",
    },
  ];

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
  };

  const toggleCard = (id) => {
    setExpandedCards({
      ...expandedCards,
      [id]: !expandedCards[id],
    });
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resource Hub
            <span className="text-red-500">.</span>
          </h1>
          <p className="text-lg text-gray-600">
            Curated resources to supercharge your development journey
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-lg mr-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedCategory("all")}
              className={` px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {Object.entries(categories).map(([key, { icon, label }]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>
                  {React.cloneElement(icon, {
                    className: "w-5 h-5",
                    style: { color: "black" },
                  })}
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      categories[resource.category].color
                    } bg-opacity-10`}
                  >
                    {categories[resource.category].icon}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      categories[resource.category].textColor
                    }`}
                  >
                    {categories[resource.category].label}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>

                <p className="text-gray-600 mb-4">{resource.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Clock className="w-3 h-3 mr-1" />
                    {resource.readTime}
                  </span>
                </div>

                {/* Difficulty Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      resource.difficulty === "Beginner"
                        ? "bg-green-100 text-green-800"
                        : resource.difficulty === "Intermediate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {resource.difficulty}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:text-red-600 font-medium text-sm"
                  >
                    Learn More →
                  </a>
                  <button
                    onClick={() => toggleCard(resource.id)}
                    className="text-gray-500 hover:text-gray-600"
                  >
                    {expandedCards[resource.id] ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Code Section */}
              {expandedCards[resource.id] && (
                <div className="border-t border-gray-100 bg-gray-50 p-6">
                  <div className="relative">
                    <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                      <code>{resource.code}</code>
                    </pre>
                    <button
                      onClick={() => handleCopyCode(resource.code, resource.id)}
                      className="absolute top-2 right-2 p-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      {copiedStates[resource.id] ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceHub;
