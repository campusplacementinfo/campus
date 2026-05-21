import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import { request } from "../../services/api"; // Re-exported from api.js
import "./DashboardStyles.css";

function StudentDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
   const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState({});
  const [testScore, setTestScore] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [resumeData, setResumeData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    summary: "Aspiring placement candidate with strong academic and technical skills.",
    education: "B.Tech in Computer Science\nABC University, 2024",
    experience: "Internship at XYZ Company - Assisted with project delivery and coding tasks.",
    projects: "Placement Portal Web App, Campus Event Tracker",
    skills: "JavaScript, React, Node.js, MongoDB, Communication"
  });
  const [resumeSaved, setResumeSaved] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [interviewPrepData, setInterviewPrepData] = useState({
    selectedCategory: "technical",
    currentTip: 0,
    tipsViewed: []
  });
  const [careerGuidance, setCareerGuidance] = useState({
    selectedPath: "software",
    assessmentCompleted: false,
    recommendations: []
  });
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const userName = user?.name || "Candidate";

  const mockTests = [
    {
      id: 1,
      title: "Aptitude Fundamentals",
      category: "Aptitude",
      difficulty: "easy",
      difficulty_badge: "Easy",
      duration: "45 mins",
      questions: 30,
      description: "Practice reasoning, arithmetic, and verbal ability questions.",
      sampleQuestions: [
        {
          id: 101,
          question: "What is 15% of 200?",
          options: ["20", "25", "30", "35"],
          answer: "30"
        },
        {
          id: 102,
          question: "If 3x + 5 = 20, what is x?",
          options: ["3", "5", "7", "10"],
          answer: "5"
        },
        {
          id: 103,
          question: "Which is the next number: 2, 6, 12, 20, ?",
          options: ["26", "30", "28", "24"],
          answer: "30"
        }
      ]
    },
    {
      id: 2,
      title: "Coding Concepts",
      category: "Technical",
      difficulty: "medium",
      difficulty_badge: "Medium",
      duration: "60 mins",
      questions: 25,
      description: "Practice data structures, algorithms, and logic questions.",
      sampleQuestions: [
        {
          id: 201,
          question: "Which data structure uses FIFO order?",
          options: ["Stack", "Queue", "Tree", "Graph"],
          answer: "Queue"
        },
        {
          id: 202,
          question: "What does CSS stand for?",
          options: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Control Style Syntax"],
          answer: "Cascading Style Sheets"
        },
        {
          id: 203,
          question: "Which keyword declares a constant in JavaScript?",
          options: ["var", "let", "const", "static"],
          answer: "const"
        }
      ]
    },
    {
      id: 3,
      title: "Interview Warmup",
      category: "HR",
      difficulty: "easy",
      difficulty_badge: "Easy",
      duration: "40 mins",
      questions: 20,
      description: "Prepare for HR and technical interviews with quick practice.",
      sampleQuestions: [
        {
          id: 301,
          question: "How do you greet a recruiter in an interview?",
          options: ["Ignore them", "Say hi", "Introduce yourself professionally", "Start with a joke"],
          answer: "Introduce yourself professionally"
        },
        {
          id: 302,
          question: "Which trait is important for teamwork?",
          options: ["Stubbornness", "Communication", "Avoiding feedback", "Working alone"],
          answer: "Communication"
        },
        {
          id: 303,
          question: "What should you do after a technical question you don’t fully know?",
          options: ["Guess randomly", "Admit uncertainty and explain reasoning", "Stay silent", "Blame the interviewer"],
          answer: "Admit uncertainty and explain reasoning"
        }
      ]
    }
  ];

  const interviewTips = {
    technical: [
      {
        id: 1,
        title: "Data Structures & Algorithms",
        content: "Practice common algorithms like sorting, searching, and dynamic programming. Focus on time/space complexity analysis.",
        examples: ["Implement quicksort", "Solve leetcode medium problems", "Understand Big O notation"],
        resources: ["LeetCode", "GeeksforGeeks", "CLRS Book"]
      },
      {
        id: 2,
        title: "System Design",
        content: "Learn to design scalable systems. Understand databases, caching, load balancing, and microservices architecture.",
        examples: ["Design a URL shortener", "Design a chat application", "Design a recommendation system"],
        resources: ["System Design Primer", "Designing Data-Intensive Applications", "Grokking System Design"]
      },
      {
        id: 3,
        title: "Coding Best Practices",
        content: "Write clean, maintainable code. Follow SOLID principles, use design patterns, and write unit tests.",
        examples: ["Use meaningful variable names", "Write modular functions", "Add proper error handling"],
        resources: ["Clean Code by Robert Martin", "Head First Design Patterns", "Refactoring by Martin Fowler"]
      }
    ],
    hr: [
      {
        id: 4,
        title: "Behavioral Questions",
        content: "Prepare STAR (Situation, Task, Action, Result) method answers for common behavioral questions.",
        examples: ["Tell me about a challenge you faced", "Describe a time you worked in a team", "How do you handle pressure?"],
        resources: ["STAR Method Guide", "Common Interview Questions", "Behavioral Interview Prep"]
      },
      {
        id: 5,
        title: "Company Research",
        content: "Research the company thoroughly. Understand their products, culture, recent news, and values.",
        examples: ["Read company website", "Check recent news/articles", "Review employee reviews on Glassdoor"],
        resources: ["Company Career Pages", "LinkedIn Company Insights", "Industry News Sources"]
      },
      {
        id: 6,
        title: "Communication Skills",
        content: "Practice clear communication. Be confident, listen actively, and ask thoughtful questions.",
        examples: ["Practice mock interviews", "Record yourself speaking", "Join public speaking groups"],
        resources: ["Toastmasters", "Communication Skills Books", "Online Public Speaking Courses"]
      }
    ],
    general: [
      {
        id: 7,
        title: "Interview Etiquette",
        content: "Dress professionally, arrive early, bring copies of resume, and follow up with thank you emails.",
        examples: ["Business formal attire", "Punctuality", "Professional email communication"],
        resources: ["Business Etiquette Guides", "Professional Development Courses", "Career Counseling"]
      },
      {
        id: 8,
        title: "Salary Negotiation",
        content: "Research salary ranges, know your worth, and practice negotiation techniques.",
        examples: ["Use salary comparison tools", "Prepare counter-offers", "Consider total compensation"],
        resources: ["Salary Negotiation Books", "Glassdoor Salary Data", "Negotiation Training"]
      }
    ]
  };

  const careerPaths = {
    software: {
      title: "Software Development",
      description: "Build applications and systems using programming languages and frameworks.",
      skills: ["Programming Languages", "Data Structures", "System Design", "Version Control"],
      jobRoles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer"],
      salary: "₹6-15 LPA",
      growth: "High demand with continuous learning opportunities"
    },
    data: {
      title: "Data Science & Analytics",
      description: "Analyze data to extract insights and build predictive models.",
      skills: ["Statistics", "Machine Learning", "Python/R", "Data Visualization"],
      jobRoles: ["Data Analyst", "Data Scientist", "ML Engineer", "Business Intelligence Analyst"],
      salary: "₹7-18 LPA",
      growth: "Growing field with AI/ML integration"
    },
    design: {
      title: "UI/UX Design",
      description: "Create user-friendly interfaces and enhance user experience.",
      skills: ["Design Tools", "User Research", "Prototyping", "Visual Design"],
      jobRoles: ["UI Designer", "UX Designer", "Product Designer", "Design System Specialist"],
      salary: "₹5-12 LPA",
      growth: "Essential for digital products and user-centric companies"
    },
    management: {
      title: "Product Management",
      description: "Manage product lifecycle from ideation to launch and optimization.",
      skills: ["Product Strategy", "Market Research", "Agile/Scrum", "Data Analysis"],
      jobRoles: ["Product Manager", "Product Owner", "Business Analyst", "Program Manager"],
      salary: "₹12-25 LPA",
      growth: "Critical role in tech companies and startups"
    }
  };

  const token = localStorage.getItem("token");

  const fetchJobs = async () => {
    const res = await request(
      "/jobs",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      3
    );

    if (!res.success) {
      setBackendError(res.message);
      setJobs([]);
      return;
    }

    setJobs(Array.isArray(res.data) ? res.data : []);
  };

  const fetchApplications = async () => {
    const res = await request(
      "/applications/my-applications",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      3
    );

    if (!res.success) {
      setBackendError(res.message);
      setApplications([]);
      return;
    }

    setApplications(Array.isArray(res.data) ? res.data : []);
  };

  const loadSavedResume = () => {
    const saved = localStorage.getItem("resumeData");
    if (saved) {
      setResumeData(JSON.parse(saved));
      setResumeSaved(true);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoadingData(true);
      setBackendError("");
      await Promise.all([fetchJobs(), fetchApplications()]);
      loadSavedResume();
      setLoadingData(false);
    };

    // Check URL for section parameter and set active section
    const params = new URLSearchParams(location.search);
    const sectionFromUrl = params.get("section");
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }

    loadDashboardData();
  }, [location]);

  const getResumeText = () => {
    return `Name: ${resumeData.name || ""}\nEmail: ${resumeData.email || ""}\n\nProfessional Summary:\n${resumeData.summary || ""}\n\nEducation:\n${resumeData.education || ""}\n\nExperience:\n${resumeData.experience || ""}\n\nProjects:\n${resumeData.projects || ""}\n\nSkills:\n${resumeData.skills || ""}\n`;
  };

  const downloadResume = () => {
    const fileName = `${(resumeData.name || "My_Resume").replace(/\s+/g, "_")}.txt`;
    const blob = new Blob([getResumeText()], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const printResume = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    const html = `
      <html>
        <head>
          <title>Resume - ${resumeData.name || "Candidate"}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 40px;
              color: #333;
              background: white;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #667eea;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .name {
              font-size: 28px;
              font-weight: bold;
              margin: 0;
              color: #667eea;
            }
            .contact {
              font-size: 16px;
              color: #666;
              margin: 5px 0;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .content {
              margin: 0;
              white-space: pre-wrap;
              font-size: 14px;
            }
            .skills {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
            }
            .skill-tag {
              background: #f0f0f0;
              padding: 5px 10px;
              border-radius: 15px;
              font-size: 13px;
            }
            @media print {
              body { padding: 20px; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="name">${resumeData.name || "Candidate Name"}</h1>
            <p class="contact">${resumeData.email || "email@example.com"}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Professional Summary</h2>
            <p class="content">${resumeData.summary || "No summary provided."}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Education</h2>
            <p class="content">${resumeData.education || "No education details provided."}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Experience</h2>
            <p class="content">${resumeData.experience || "No experience details provided."}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Projects</h2>
            <p class="content">${resumeData.projects || "No project details provided."}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills">
              ${(resumeData.skills || "").split(",").map(skill => skill.trim()).filter(skill => skill).map(skill => `<span class="skill-tag">${skill}</span>`).join("")}
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const saveResume = () => {
    localStorage.setItem("resumeData", JSON.stringify(resumeData));
    setResumeSaved(true);
    alert("Resume saved locally. You can reopen it later from this dashboard.");
  };

  const clearResume = () => {
    setResumeData((prev) => ({
      ...prev,
      summary: "",
      education: "",
      experience: "",
      projects: "",
      skills: ""
    }));
    localStorage.removeItem("resumeData");
    setResumeSaved(false);
  };

  const applyJob = async (jobId) => {
    const res = await request(
      "/applications/apply",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ jobId })
      },
      3
    );

    alert(res.message || "Unable to apply at this time.");
    if (res.success) {
      fetchApplications();
      fetchJobs();
    }
  };

  const isApplied = (jobId) => {
    return applications.some((app) => app.job?._id === jobId);
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleResumeChange = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterviewCategoryChange = (category) => {
    setInterviewPrepData(prev => ({
      ...prev,
      selectedCategory: category,
      currentTip: 0
    }));
  };

  const handleNextTip = () => {
    const currentTips = interviewTips[interviewPrepData.selectedCategory];
    setInterviewPrepData(prev => ({
      ...prev,
      currentTip: (prev.currentTip + 1) % currentTips.length,
      tipsViewed: [...prev.tipsViewed, currentTips[prev.currentTip].id]
    }));
  };

  const handleCareerPathChange = (path) => {
    setCareerGuidance(prev => ({
      ...prev,
      selectedPath: path
    }));
  };

  const completeCareerAssessment = () => {
    // Simulate career assessment
    const recommendations = [
      "Focus on building a strong portfolio",
      "Network with professionals in your field",
      "Consider certifications to boost employability",
      "Gain practical experience through projects",
      "Develop soft skills alongside technical skills"
    ];
    setCareerGuidance(prev => ({
      ...prev,
      assessmentCompleted: true,
      recommendations
    }));
  };

  const getJobRecommendations = () => {
    // Simple recommendation logic based on resume skills
    const userSkills = resumeData.skills.toLowerCase();
    const recommendations = [];

    if (userSkills.includes('javascript') || userSkills.includes('react')) {
      recommendations.push({
        title: "Frontend Developer",
        company: "TechCorp",
        match: "95%",
        reason: "Strong match with your JavaScript and React skills"
      });
    }

    if (userSkills.includes('node') || userSkills.includes('backend')) {
      recommendations.push({
        title: "Backend Developer",
        company: "InnovateLtd",
        match: "88%",
        reason: "Good fit for your backend development experience"
      });
    }

    if (userSkills.includes('data') || userSkills.includes('python')) {
      recommendations.push({
        title: "Data Analyst",
        company: "DataTech",
        match: "82%",
        reason: "Matches your data analysis and Python skills"
      });
    }

    return recommendations;
  };

  const sidebarLinks = [
  { label: "Dashboard", icon: "📊", action: () => handleSectionChange("dashboard") },
  { label: "Available Jobs", icon: "🔍", action: () => handleSectionChange("jobs") },
  { label: "My Applications", icon: "📋", action: () => handleSectionChange("applications") },
  { label: "Mock Tests", icon: "📝", action: () => handleSectionChange("mock") },
  { label: "Resume Builder", icon: "📄", action: () => handleSectionChange("resume") },
  { label: "Interview Prep", icon: "🎯", action: () => handleSectionChange("interview") },
  { label: "Career Guidance", icon: "🚀", action: () => handleSectionChange("career") },
  { label: "Profile", icon: "👤", action: () => handleSectionChange("profile") }
];

  const dashboardMenuItems = [
    { id: "jobs", label: "Available Jobs", icon: "🔍" },
    { id: "applications", label: "My Applications", icon: "📋" },
    { id: "mock", label: "Mock Tests", icon: "📝" },
    { id: "resume", label: "Resume Builder", icon: "📄" },
    { id: "interview", label: "Interview Prep", icon: "🎯" },
    { id: "career", label: "Career Guidance", icon: "🚀" },
    { id: "profile", label: "Profile", icon: "👤" }
  ];

  return (
    <div className="dashboard-container">
 <>
  <div
    className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
    onClick={() => setSidebarOpen(false)}
  ></div>

  <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
    <Sidebar links={sidebarLinks} />
  </div>
</>
      <main className="dashboard-main">
        <div className="dashboard-topbar">
  <button
    className={`menu-btn ${sidebarOpen ? "active" : ""}`}
    onClick={() => setSidebarOpen(!sidebarOpen)}
  >
    <span></span>
  </button>

  <h3>Placement Portal</h3>
</div>
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p>Welcome back, {userName} — ready to prepare for your next placement?</p>
        </div>

        {backendError && (
          <div className="dashboard-error-banner">
            <p>⚠️ {backendError}</p>
            <button className="retry-button" onClick={async () => {
              setBackendError("");
              setLoadingData(true);
              await Promise.all([fetchJobs(), fetchApplications()]);
              setLoadingData(false);
            }}>
              Retry Backend Connection
            </button>
          </div>
        )}

        {loadingData && (
          <div className="dashboard-loading-banner">
            <p>⏳ Checking backend connection. Please wait...</p>
          </div>
        )}

        <button className="menu-toggle-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "📋 Hide Menu" : "📋 Show Menu"}
        </button>

        <div className={`section-menu ${isMenuOpen ? "open" : "closed"}`}>
          {dashboardMenuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-btn ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeftColor: "#3498db" }}>
            <div className="stat-value">{jobs.length}</div>
            <div className="stat-label">Active Job Openings</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: "#27ae60" }}>
            <div className="stat-value">{applications.length}</div>
            <div className="stat-label">My Applications</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: "#f39c12" }}>
            <div className="stat-value">
              {applications.filter((a) => a.status === "pending").length}
            </div>
            <div className="stat-label">Pending Status</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: "#e74c3c" }}>
            <div className="stat-value">
              {applications.filter((a) => a.status === "accepted").length}
            </div>
            <div className="stat-label">Offers Received</div>
          </div>
        </div>
{activeSection === "dashboard" && (
  <div className="content-section">
    <div className="section-content">
      <h2>Student Dashboard Overview</h2>
      <div className="info-grid">
        <div className="info-box">
          <h3>🔍 Available Jobs</h3>
          <p>Browse and apply for placement opportunities from sidebar.</p>
        </div>
        <div className="info-box">
          <h3>📋 My Applications</h3>
          <p>Track applied jobs and current selection status.</p>
        </div>
        <div className="info-box">
          <h3>📝 Mock Tests</h3>
          <p>Practice aptitude, technical, and HR questions.</p>
        </div>
        <div className="info-box">
          <h3>📄 Resume Builder</h3>
          <p>Create, save, download, and print your resume.</p>
        </div>
        <div className="info-box">
          <h3>🎯 Interview Prep</h3>
          <p>Prepare for technical, HR, and general interviews.</p>
        </div>
        <div className="info-box">
          <h3>🚀 Career Guidance</h3>
          <p>Explore career paths and job recommendations.</p>
        </div>
      </div>
    </div>
  </div>
)}
        {/* Jobs Section */}
        {activeSection === "jobs" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Available Job Opportunities</h2>
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <p>📭 No jobs available matching your search.</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {filteredJobs.map((job) => (
                  <div key={job._id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className={`badge ${isApplied(job._id) ? "applied" : ""}`}>
                        {isApplied(job._id) ? "✓ Applied" : "Open"}
                      </span>
                    </div>
                    <div className="job-details">
                      <p className="company">
                        <span className="icon">🏢</span> {job.company}
                      </p>
                      <p className="location">
                        <span className="icon">📍</span> {job.location}
                      </p>
                    </div>
                    <p className="description">{job.description}</p>
                    <button
                      className={`apply-btn ${isApplied(job._id) ? "disabled" : ""}`}
                      onClick={() => applyJob(job._id)}
                      disabled={isApplied(job._id)}
                    >
                      {isApplied(job._id) ? "✓ Already Applied" : "Apply Now"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Section */}
        {activeSection === "applications" && (
          <div className="content-section">
            <h2>My Application Status</h2>

            {applications.length === 0 ? (
              <div className="empty-state">
                <p>📭 You haven't applied to any jobs yet.</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className={`application-card status-${app.status}`}
                  >
                    <div className="app-header">
                      <h3>{app.job?.title}</h3>
                      <span className={`status-badge status-${app.status}`}>
                        {app.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="app-details">
                      <p>
                        <strong>Company:</strong> {app.job?.company}
                      </p>
                      <p>
                        <strong>Location:</strong> {app.job?.location}
                      </p>
                      <p className="description">{app.job?.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "mock" && (
          <div className="content-section">
            <h2>📝 Mock Test Papers</h2>
            
            <div className="filter-section">
              <label>Filter by Difficulty:</label>
              <div className="difficulty-filters">
                <button 
                  className={`filter-btn ${selectedDifficulty === "all" ? "active" : ""}`}
                  onClick={() => setSelectedDifficulty("all")}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${selectedDifficulty === "easy" ? "active" : ""}`}
                  onClick={() => setSelectedDifficulty("easy")}
                >
                  Easy
                </button>
                <button 
                  className={`filter-btn ${selectedDifficulty === "medium" ? "active" : ""}`}
                  onClick={() => setSelectedDifficulty("medium")}
                >
                  Medium
                </button>
              </div>
            </div>

            <div className="info-grid">
              {mockTests
                .filter(test => selectedDifficulty === "all" || test.difficulty === selectedDifficulty)
                .map((test) => (
                <div key={test.id} className="info-box test-card">
                  <div className="test-header-info">
                    <h3>{test.title}</h3>
                    <span className={`difficulty-badge difficulty-${test.difficulty}`}>
                      {test.difficulty_badge}
                    </span>
                  </div>
                  <p className="test-category">📚 {test.category}</p>
                  <p>{test.description}</p>
                  <div className="test-meta-info">
                    <p>
                      <strong>⏱️ Duration:</strong> {test.duration}
                    </p>
                    <p>
                      <strong>❓ Questions:</strong> {test.questions}
                    </p>
                  </div>
                  <button
                    className="action-btn"
                    onClick={() => {
                      setSelectedTest(test);
                      setActiveSection("test");
                      setCurrentQuestionIndex(0);
                      setTestAnswers({});
                      setTestScore(null);
                    }}
                  >
                    🚀 Start Test
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "resume" && (
          <div className="content-section">
            <h2>Resume Builder</h2>
            <div className="resume-builder-grid">
              <section className="resume-form-card">
                <h3>Build Your Resume</h3>
                <div className="resume-form">
                  <div className="form-group">
                    <label htmlFor="resume-name">Full Name</label>
                    <input
                      id="resume-name"
                      type="text"
                      value={resumeData.name}
                      onChange={(e) => handleResumeChange("name", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="resume-email">Email</label>
                    <input
                      id="resume-email"
                      type="email"
                      value={resumeData.email}
                      onChange={(e) => handleResumeChange("email", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="resume-summary">Professional Summary</label>
                    <textarea
                      id="resume-summary"
                      rows="4"
                      value={resumeData.summary}
                      onChange={(e) => handleResumeChange("summary", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="resume-education">Education</label>
                    <textarea
                      id="resume-education"
                      rows="4"
                      value={resumeData.education}
                      onChange={(e) => handleResumeChange("education", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="resume-experience">Experience</label>
                    <textarea
                      id="resume-experience"
                      rows="4"
                      value={resumeData.experience}
                      onChange={(e) => handleResumeChange("experience", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="resume-projects">Projects</label>
                    <textarea
                      id="resume-projects"
                      rows="4"
                      value={resumeData.projects}
                      onChange={(e) => handleResumeChange("projects", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="resume-skills">Skills</label>
                    <input
                      id="resume-skills"
                      type="text"
                      value={resumeData.skills}
                      onChange={(e) => handleResumeChange("skills", e.target.value)}
                    />
                  </div>
                  <div className="action-buttons">
                    <button type="button" className="submit-btn" onClick={saveResume}>
                      Save Resume
                    </button>
                    <button type="button" className="action-btn" onClick={downloadResume}>
                      Download Resume
                    </button>
                    <button type="button" className="action-btn secondary" onClick={printResume}>
                      Print / Save as PDF
                    </button>
                    <button type="button" className="action-btn secondary" onClick={clearResume}>
                      Clear Form
                    </button>
                  </div>
                  {resumeSaved && <p className="save-note">Saved resume data is available in your browser.</p>}
                </div>
              </section>

              <section className="resume-preview-card">
                <h3>Preview</h3>
                <div className="resume-preview">
                  <div className="resume-header">
                    <h2>{resumeData.name || "Candidate Name"}</h2>
                    <p>{resumeData.email || "email@example.com"}</p>
                  </div>
                  <div className="resume-section">
                    <h4>Professional Summary</h4>
                    <p>{resumeData.summary}</p>
                  </div>
                  <div className="resume-section">
                    <h4>Education</h4>
                    <pre>{resumeData.education}</pre>
                  </div>
                  <div className="resume-section">
                    <h4>Experience</h4>
                    <pre>{resumeData.experience}</pre>
                  </div>
                  <div className="resume-section">
                    <h4>Projects</h4>
                    <pre>{resumeData.projects}</pre>
                  </div>
                  <div className="resume-section">
                    <h4>Skills</h4>
                    <p>{resumeData.skills}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeSection === "test" && selectedTest && (
          <div className="content-section mock-test-container">
            <div className="test-header">
              <h2>{selectedTest.title}</h2>
              <p>{selectedTest.description}</p>
              <div className="test-meta">
                <span>Duration: {selectedTest.duration}</span>
                <span>Questions: {selectedTest.sampleQuestions.length}</span>
              </div>
            </div>

            {testScore === null ? (
              <>
                <div className="question-card">
                  <h3>
                    Question {currentQuestionIndex + 1} of {selectedTest.sampleQuestions.length}
                  </h3>
                  <p>{selectedTest.sampleQuestions[currentQuestionIndex].question}</p>
                  <div className="options-grid">
                    {selectedTest.sampleQuestions[currentQuestionIndex].options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`option-btn ${testAnswers[selectedTest.sampleQuestions[currentQuestionIndex].id] === option ? "selected" : ""}`}
                        onClick={() =>
                          setTestAnswers((prev) => ({
                            ...prev,
                            [selectedTest.sampleQuestions[currentQuestionIndex].id]: option
                          }))
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="test-actions">
                  <button
                    type="button"
                    className="action-btn secondary"
                    onClick={() => setActiveSection("mock")}
                  >
                    Back to Mock Tests
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, selectedTest.sampleQuestions.length - 1))}
                    disabled={currentQuestionIndex === selectedTest.sampleQuestions.length - 1}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => {
                      const score = selectedTest.sampleQuestions.reduce(
                        (total, question) =>
                          total + (testAnswers[question.id] === question.answer ? 1 : 0),
                        0
                      );
                      setTestScore(score);
                    }}
                  >
                    Submit Test
                  </button>
                </div>
              </>
            ) : (
              <div className="test-result-card">
                <h3>Test Completed</h3>
                <p>
                  You scored {testScore} out of {selectedTest.sampleQuestions.length}.
                </p>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    setActiveSection("mock");
                    setSelectedTest(null);
                    setTestScore(null);
                  }}
                >
                  Back to Mock Test List
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === "profile" && (
          <div className="content-section">
            <h2>Student Profile</h2>
            <div className="profile-grid">
              <div className="profile-info">
                <div className="info-card">
                  <h3>Personal Information</h3>
                  <p><strong>Name:</strong> {userName}</p>
                  <p><strong>Role:</strong> Student</p>
                  <p><strong>Email:</strong> {resumeData.email || "Not provided"}</p>
                </div>

                <div className="info-card">
                  <h3>Dashboard Overview</h3>
                  <p><strong>Active Jobs:</strong> {jobs.length}</p>
                  <p><strong>My Applications:</strong> {applications.length}</p>
                  <p><strong>Pending Applications:</strong> {applications.filter((a) => a.status === "pending").length}</p>
                  <p><strong>Offers Received:</strong> {applications.filter((a) => a.status === "accepted").length}</p>
                </div>
              </div>

              <div className="resume-preview-card">
                <h3>My Resume</h3>
                {resumeSaved ? (
                  <>
                    <div className="resume-summary">
                      <p><strong>Name:</strong> {resumeData.name}</p>
                      <p><strong>Email:</strong> {resumeData.email}</p>
                      <p><strong>Summary:</strong> {resumeData.summary ? resumeData.summary.substring(0, 100) + "..." : "No summary"}</p>
                      <p><strong>Skills:</strong> {resumeData.skills ? resumeData.skills.split(",").slice(0, 3).join(", ") + (resumeData.skills.split(",").length > 3 ? "..." : "") : "No skills listed"}</p>
                    </div>
                    <div className="action-buttons">
                      <button type="button" className="action-btn" onClick={printResume}>
                        View Full Resume
                      </button>
                      <button type="button" className="action-btn secondary" onClick={() => setActiveSection("resume")}>
                        Edit Resume
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-resume">
                    <p>No resume created yet.</p>
                    <button type="button" className="action-btn" onClick={() => setActiveSection("resume")}>
                      Create Resume
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interview Preparation Section */}
        {activeSection === "interview" && (
          <div className="content-section">
            <h2>🎯 Interview Preparation</h2>
            <div className="interview-prep-container">
              <div className="interview-categories">
                <h3>Choose Category</h3>
                <div className="category-buttons">
                  <button
                    className={`category-btn ${interviewPrepData.selectedCategory === "technical" ? "active" : ""}`}
                    onClick={() => handleInterviewCategoryChange("technical")}
                  >
                    💻 Technical
                  </button>
                  <button
                    className={`category-btn ${interviewPrepData.selectedCategory === "hr" ? "active" : ""}`}
                    onClick={() => handleInterviewCategoryChange("hr")}
                  >
                    👥 HR & Behavioral
                  </button>
                  <button
                    className={`category-btn ${interviewPrepData.selectedCategory === "general" ? "active" : ""}`}
                    onClick={() => handleInterviewCategoryChange("general")}
                  >
                    📋 General Tips
                  </button>
                </div>
              </div>

              <div className="interview-content">
                {interviewTips[interviewPrepData.selectedCategory] && (
                  <div className="interview-tip-card">
                    <div className="tip-header">
                      <h3>{interviewTips[interviewPrepData.selectedCategory][interviewPrepData.currentTip].title}</h3>
                      <span className="tip-counter">
                        {interviewPrepData.currentTip + 1} of {interviewTips[interviewPrepData.selectedCategory].length}
                      </span>
                    </div>
                    <div className="tip-content">
                      <p>{interviewTips[interviewPrepData.selectedCategory][interviewPrepData.currentTip].content}</p>

                      <div className="tip-examples">
                        <h4>💡 Key Examples:</h4>
                        <ul>
                          {interviewTips[interviewPrepData.selectedCategory][interviewPrepData.currentTip].examples.map((example, idx) => (
                            <li key={idx}>{example}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="tip-resources">
                        <h4>📚 Recommended Resources:</h4>
                        <div className="resource-tags">
                          {interviewTips[interviewPrepData.selectedCategory][interviewPrepData.currentTip].resources.map((resource, idx) => (
                            <span key={idx} className="resource-tag">{resource}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="tip-actions">
                      <button className="action-btn" onClick={handleNextTip}>
                        Next Tip →
                      </button>
                      <button className="action-btn secondary" onClick={() => setActiveSection("mock")}>
                        Practice Tests
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Career Guidance Section */}
        {activeSection === "career" && (
          <div className="content-section">
            <h2>🚀 Career Guidance</h2>
            <div className="career-guidance-container">
              <div className="career-paths">
                <h3>Explore Career Paths</h3>
                <div className="path-selector">
                  {Object.entries(careerPaths).map(([key, path]) => (
                    <div
                      key={key}
                      className={`career-path-card ${careerGuidance.selectedPath === key ? "active" : ""}`}
                      onClick={() => handleCareerPathChange(key)}
                    >
                      <h4>{path.title}</h4>
                      <p>{path.description}</p>
                      <div className="path-highlights">
                        <span className="highlight">💰 {path.salary}</span>
                        <span className="highlight">📈 {path.growth}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="career-details">
                {careerPaths[careerGuidance.selectedPath] && (
                  <div className="career-detail-card">
                    <h3>{careerPaths[careerGuidance.selectedPath].title}</h3>
                    <p className="career-description">{careerPaths[careerGuidance.selectedPath].description}</p>

                    <div className="career-section">
                      <h4>🛠️ Key Skills</h4>
                      <div className="skill-tags">
                        {careerPaths[careerGuidance.selectedPath].skills.map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="career-section">
                      <h4>💼 Job Roles</h4>
                      <div className="job-roles">
                        {careerPaths[careerGuidance.selectedPath].jobRoles.map((role, idx) => (
                          <span key={idx} className="job-role">{role}</span>
                        ))}
                      </div>
                    </div>

                    <div className="career-actions">
                      <button className="action-btn" onClick={completeCareerAssessment}>
                        📊 Take Career Assessment
                      </button>
                      <button className="action-btn secondary" onClick={() => setActiveSection("resume")}>
                        📝 Update Resume
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {careerGuidance.assessmentCompleted && (
                <div className="assessment-results">
                  <h3>🎯 Your Career Assessment Results</h3>
                  <div className="recommendations-list">
                    {careerGuidance.recommendations.map((rec, idx) => (
                      <div key={idx} className="recommendation-item">
                        <span className="rec-number">{idx + 1}</span>
                        <p>{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="job-recommendations">
                <h3>🎯 Recommended Jobs for You</h3>
                <div className="recommendations-grid">
                  {getJobRecommendations().map((rec, idx) => (
                    <div key={idx} className="recommendation-card">
                      <div className="rec-header">
                        <h4>{rec.title}</h4>
                        <span className="match-score">{rec.match} match</span>
                      </div>
                      <p className="rec-company">{rec.company}</p>
                      <p className="rec-reason">{rec.reason}</p>
                      <button className="action-btn small">Apply Now</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;