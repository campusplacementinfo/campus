import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./HomeStylesAttractive.css";

function Home() {
  const [activeRole, setActiveRole] = useState("student");
  const [activeOption, setActiveOption] = useState("features");
  const [stats, setStats] = useState({
    placed: 0,
    companies: 0,
    offers: 0,
    success: 0
  });
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const target = { placed: 5200, companies: 420, offers: 12500, success: 96 };
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setStats({
        placed: Math.floor(target.placed * progress),
        companies: Math.floor(target.companies * progress),
        offers: Math.floor(target.offers * progress),
        success: Math.floor(target.success * progress)
      });
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const roleCards = [
    {
      id: "student",
      title: "Students",
      description: "Build your resume, apply for jobs, and track interview progress."
    },
    {
      id: "company",
      title: "Companies",
      description: "Post vacancies, review applications, and hire fresh talent quickly."
    },
    {
      id: "admin",
      title: "Placement Team",
      description: "Manage campus drives, monitor results, and support student success."
    }
  ];

  const featureCards = [
    {
      title: "Profile Builder",
      description: "Create a professional student profile with skills, education, and achievements.",
      icon: "📝"
    },
    {
      title: "Smart Job Matching",
      description: "Match student profiles with relevant company opportunities automatically.",
      icon: "🤝"
    },
    {
      title: "Assessment Hub",
      description: "Practice aptitude tests, mock interviews, and placement assessments.",
      icon: "🧠"
    },
    {
      title: "Placement Insights",
      description: "Monitor placement trends, drive performance, and improve campus outcomes.",
      icon: "📈"
    },
    {
      title: "Resume Optimizer",
      description: "Get AI-powered suggestions to improve your resume and stand out to recruiters.",
      icon: "✨"
    },
    {
      title: "Interview Scheduler",
      description: "Book and manage interview slots with companies directly through the portal.",
      icon: "📅"
    },
    {
      title: "Progress Tracker",
      description: "Track your application status, interview feedback, and placement journey.",
      icon: "📊"
    },
    {
      title: "Career Counseling",
      description: "Get guidance from placement officers and industry experts for career planning.",
      icon: "🎯"
    }
  ];

  const heroHighlights = [
    {
      title: "Real-time Job Alerts",
      description: "Receive placement notifications and company drive updates tailored to your profile."
    },
    {
      title: "Interview Scheduler",
      description: "Book slots, manage reminders, and prepare for interviews all in one place."
    },
    {
      title: "Career Analytics",
      description: "Track application progress, hiring trends, and placement success metrics."
    }
  ];

  const placementSteps = [
    { step: 1, title: "Register & Complete Profile", description: "Sign up and add your academic, skill, and resume details." },
    { step: 2, title: "Browse Openings", description: "Explore company drives and placement opportunities." },
    { step: 3, title: "Apply & Track", description: "Submit applications and monitor your progress in real time." },
    { step: 4, title: "Prepare & Perform", description: "Use mock tests and interview resources to boost confidence." },
    { step: 5, title: "Get Placed", description: "Accept offers and begin your career journey with top employers." }
  ];

  const featureSpotlights = [
    {
      title: "Personalized placement journey",
      description: "Track your progress with tailored recommendations and live feedback from the placement team."
    },
    {
      title: "Seamless recruiter connect",
      description: "Enable direct communication with companies, timeline updates, and interview scheduling." 
    },
    {
      title: "Career readiness tools",
      description: "Access resume tips, mock test libraries, and interview prep resources in one place."
    },
    {
      title: "Data-driven success",
      description: "See real metrics, offer trends, and placement insights to prepare for the next opportunity."
    }
  ];

  const resourceCards = [
    {
      title: "Live Placement Dashboard",
      description: "View active drives, eligibility criteria, and application status in one centralized dashboard.",
      icon: "📊"
    },
    {
      title: "Mentorship Support",
      description: "Connect with faculty and alumni mentors for interview preparation, resume feedback, and career guidance.",
      icon: "🧑‍🏫"
    },
    {
      title: "Drive Calendar",
      description: "Keep track of upcoming company visits, registration deadlines, and interview schedules.",
      icon: "🗓️"
    },
    {
      title: "Training Workshops",
      description: "Attend placement-focused workshops on communication, technical skills, and corporate expectations.",
      icon: "💡"
    }
  ];

  const newsUpdates = [
    {
      title: "Microsoft Campus Drive - Registration Open",
      date: "May 15, 2024",
      description: "Software Engineer positions available for CSE, IT, and ECE students. Package: ₹12-18 LPA.",
      type: "Drive Update"
    },
    {
      title: "Resume Building Workshop - This Friday",
      date: "May 18, 2024",
      description: "Learn ATS-friendly resume creation and get personalized feedback from industry experts.",
      type: "Workshop"
    },
    {
      title: "Placement Statistics Updated",
      date: "May 12, 2024",
      description: "5200+ students placed this year with 96% success rate across 420+ companies.",
      type: "Achievement"
    },
    {
      title: "Mock Interview Sessions Starting",
      date: "May 20, 2024",
      description: "Practice technical and HR interviews with faculty and alumni mentors.",
      type: "Training"
    }
  ];

  const faqItems = [
    {
      question: "Who can use this portal?",
      answer: "Students, companies, and placement officers can use the portal for registration, job posting, candidate selection, and placement tracking."
    },
    {
      question: "How do I apply for a campus drive?",
      answer: "Register with your student profile, browse open drives, and submit applications directly from the dashboard."
    },
    {
      question: "Can companies review candidate profiles?",
      answer: "Yes, companies can review profiles, shortlist candidates, and invite them for interviews through the portal."
    },
    {
      question: "What support is available for students?",
      answer: "Students get resume guidance, mock interviews, career counseling, and placement analytics to boost their readiness."
    }
  ];

  const testimonials = [
    {
      message: "The placement portal helped me land two interview calls in the first week. The campus support was outstanding.",
      author: "Aditi Sharma",
      role: "B.Tech Student",
      company: "Placed at TCS"
    },
    {
      message: "As a recruiter, I could shortlist candidates faster and connect with the university placement team seamlessly.",
      author: "Rohit Singh",
      role: "Hiring Manager",
      company: "Accenture"
    },
    {
      message: "The mock interview sessions and resume building tools were game-changers. I got placed in my dream company!",
      author: "Priya Patel",
      role: "MCA Student",
      company: "Placed at Infosys"
    },
    {
      message: "The placement team's dedication and the portal's efficiency made the entire process smooth and transparent.",
      author: "Amit Kumar",
      role: "B.Tech Student",
      company: "Placed at Wipro"
    },
    {
      message: "From resume optimization to interview preparation, every tool helped me secure multiple offers.",
      author: "Sneha Gupta",
      role: "BCA Student",
      company: "Placed at Cognizant"
    }
  ];

  const upcomingDrives = [
    {
      company: "Microsoft",
      role: "Software Engineer",
      date: "May 15, 2024",
      package: "₹12-18 LPA",
      branches: ["CSE", "IT", "ECE"],
      status: "Registration Open"
    },
    {
      company: "Google",
      role: "Software Developer",
      date: "May 22, 2024",
      package: "₹15-25 LPA",
      branches: ["CSE", "IT"],
      status: "Coming Soon"
    },
    {
      company: "Amazon",
      role: "SDE-1",
      date: "June 5, 2024",
      package: "₹14-20 LPA",
      branches: ["CSE", "IT", "MCA"],
      status: "Registration Open"
    },
    {
      company: "Adobe",
      role: "Full Stack Developer",
      date: "June 12, 2024",
      package: "₹13-18 LPA",
      branches: ["CSE", "IT"],
      status: "Coming Soon"
    }
  ];

  const recruiters = ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "HCL", "Microsoft", "Google", "Amazon", "Adobe"];

  return (
    <div className="home-container">
      <nav className="nav-header">
        <div className="nav-content">
          <div className="nav-logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">Dr. C.V. Raman University Vaishali</span>
          </div>
          <div className="nav-actions">
            <button
              className="nav-toggle"
              type="button"
              onClick={() => setNavOpen((prev) => !prev)}
            >
              {navOpen ? "Close" : "Menu"}
            </button>
          </div>
          <div className={`nav-group ${navOpen ? "open" : ""}`}>
            <div className="nav-menu">
              <a href="#home" className="nav-link" onClick={() => setNavOpen(false)}>
                Home
              </a>
              <a href="#placement" className="nav-link" onClick={() => setNavOpen(false)}>
                Placement
              </a>
              <a href="#drives" className="nav-link" onClick={() => setNavOpen(false)}>
                Drives
              </a>
              <a href="#success" className="nav-link" onClick={() => setNavOpen(false)}>
                Success
              </a>
              <a href="#contact" className="nav-link" onClick={() => setNavOpen(false)}>
                Contact
              </a>
            </div>
            <div className="nav-links">
              <Link to="/login" className="nav-link" onClick={() => setNavOpen(false)}>
                Login
              </Link>
              <Link
                to="/register"
                className="nav-button-primary"
                onClick={() => setNavOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="home-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <section id="home" className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Campus Placement Portal</div>
          <h1 className="hero-title">
            Dr. C.V. Raman University Vaishali
            <span className="highlight"> Campus Placement Portal</span>
          </h1>
          <p className="hero-subtitle">
            Empowering students, recruiters, and the placement team with an interactive platform for placements, assessments, and career success.
          </p>

          <div className="hero-features">
            {heroHighlights.map((item) => (
              <div key={item.title} className="hero-feature-card">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>

          <div className="role-selection">
            {roleCards.map((role) => (
              <button
                key={role.id}
                className={`role-pill ${activeRole === role.id ? "active" : ""}`}
                onClick={() => setActiveRole(role.id)}
              >
                <span>{role.title}</span>
              </button>
            ))}
          </div>

          <div className="hero-cards">
            <div className="hero-cards-row">
              <div className="hero-card">
                <span className="card-icon">👨‍🎓</span>
                <h3>Students</h3>
                <p>Build your resume, apply for jobs, and track interview progress.</p>
              </div>
              <div className="hero-card">
                <span className="card-icon">🏢</span>
                <h3>Companies</h3>
                <p>Post vacancies, review applications, and hire fresh talent quickly.</p>
              </div>
            </div>
            <div className="hero-cards-row">
              <div className="hero-card admin-card">
                <span className="card-icon">⚙️</span>
                <h3>Placement Team</h3>
                <p>Manage campus drives, monitor results, and support student success.</p>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <h3>Start Your Placement Journey</h3>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary">
                Register Now
              </Link>
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="section-header">
          <h2>Placement Highlights</h2>
          <p >Real impact from CVRU University Vaishali's campus placement ecosystem.</p>
        </div>
        <div className="stats-content">
          <div className="stat-card">
            <div className="stat-number">{stats.placed.toLocaleString()}</div>
            <p className="stat-label">Students Placed</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.companies.toLocaleString()}</div>
            <p className="stat-label">Recruiting Companies</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.offers.toLocaleString()}</div>
            <p className="stat-label">Placement Offers</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.success}%</div>
            <p className="stat-label">Average Success Rate</p>
          </div>
        </div>
      </section>

      <section id="options" className="options-section">
        <div className="section-header">
          <h2>Explore Portal Features & Resources</h2>
          <p>Discover features, resources, and latest updates all in one place.</p>
        </div>

        <div className="options-tabs">
          <button
            className={`option-tab ${activeOption === "features" ? "active" : ""}`}
            onClick={() => setActiveOption("features")}
          >
            Portal Features
          </button>
          <button
            className={`option-tab ${activeOption === "resources" ? "active" : ""}`}
            onClick={() => setActiveOption("resources")}
          >
            Campus Resources
          </button>
          <button
            className={`option-tab ${activeOption === "updates" ? "active" : ""}`}
            onClick={() => setActiveOption("updates")}
          >
            Latest Updates
          </button>
        </div>

        {activeOption === "features" && (
          <div>
            <div className="section-header" style={{ marginTop: "40px", marginBottom: "30px" }}>
              <h3>Portal Features</h3>
              <p>Designed to make campus placement easy, transparent, and effective.</p>
            </div>
            <div className="features-grid">
              {featureCards.map((feature) => (
                <div key={feature.title} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="section-header" style={{ marginTop: "50px", marginBottom: "30px" }}>
              <h3>Why This Portal Works</h3>
              <p>Practical tools, placement support, and student-centric services.</p>
            </div>
            <div className="more-grid">
              {featureSpotlights.map((spotlight) => (
                <div key={spotlight.title} className="more-card">
                  <h3>{spotlight.title}</h3>
                  <p>{spotlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeOption === "resources" && (
          <div>
            <div className="section-header" style={{ marginTop: "40px", marginBottom: "30px" }}>
              <h3>Campus Resource Center</h3>
              <p>Full support available to students and recruiters through our placement services.</p>
            </div>
            <div className="resources-grid">
              {resourceCards.map((item) => (
                <div key={item.title} className="feature-card">
                  <div className="feature-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeOption === "updates" && (
          <div>
            <div className="section-header" style={{ marginTop: "40px", marginBottom: "30px" }}>
              <h3>Latest Placement Updates</h3>
              <p>Stay informed with recent placement activities, workshops, and achievements.</p>
            </div>
            <div className="news-grid">
              {newsUpdates.map((item, index) => (
                <div key={index} className="news-card">
                  <div className="news-header">
                    <span className="news-type">{item.type}</span>
                    <span className="news-date">{item.date}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="preparation" className="preparation-section">
        <div className="section-header">
          <h2>Placement Preparation Resources</h2>
          <p>Comprehensive tools and resources to help you succeed in placements.</p>
        </div>
        <div className="preparation-grid">
          <div className="prep-card">
            <div className="prep-icon">📚</div>
            <h3>Aptitude Tests</h3>
            <p>Practice quantitative, logical, and verbal reasoning questions with detailed solutions.</p>
            <ul>
              <li>500+ Practice Questions</li>
              <li>Topic-wise Tests</li>
              <li>Performance Analytics</li>
            </ul>
          </div>
          <div className="prep-card">
            <div className="prep-icon">🎤</div>
            <h3>Mock Interviews</h3>
            <p>Experience real interview scenarios with feedback from industry experts.</p>
            <ul>
              <li>Technical Interviews</li>
              <li>HR Round Practice</li>
              <li>Video Recording</li>
            </ul>
          </div>
          <div className="prep-card">
            <div className="prep-icon">💼</div>
            <h3>Resume Building</h3>
            <p>Create ATS-friendly resumes with templates and expert guidance.</p>
            <ul>
              <li>Professional Templates</li>
              <li>ATS Optimization</li>
              <li>Review & Feedback</li>
            </ul>
          </div>
          <div className="prep-card">
            <div className="prep-icon">📊</div>
            <h3>Company Insights</h3>
            <p>Get detailed information about companies, their culture, and interview processes.</p>
            <ul>
              <li>Company Profiles</li>
              <li>Interview Experiences</li>
              <li>Salary Insights</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="placement" className="placement-section">
        <div className="section-header">
          <h2>How Campus Placement Works</h2>
          <p>A clear path from registration to placement.</p>
        </div>
        <div className="timeline-grid">
          {placementSteps.map((item) => (
            <div key={item.step} className="timeline-card">
              <div className="timeline-step">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="drives" className="upcoming-drives-section">
        <div className="section-header">
          <h2>Upcoming Placement Drives</h2>
          <p>Exciting opportunities from top companies visiting our campus.</p>
        </div>
        <div className="drives-grid">
          {upcomingDrives.map((drive, index) => (
            <div key={index} className="drive-card">
              <div className="drive-header">
                <h3>{drive.company}</h3>
                <span className={`drive-status ${drive.status.toLowerCase().replace(' ', '-')}`}>
                  {drive.status}
                </span>
              </div>
              <div className="drive-details">
                <p className="drive-role">{drive.role}</p>
                <p className="drive-package">{drive.package}</p>
                <p className="drive-date">📅 {drive.date}</p>
                <p className="drive-branches">
                  Eligible: {drive.branches.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="why-choose" className="why-choose-section">
        <div className="section-header">
          <h2>Why Choose Dr. C.V. Raman University Vaishali</h2>
          <p>Experience placement excellence through career-focused learning, strong industry ties, and student-first support.</p>
        </div>
        <div className="why-choose-grid">
          <div className="why-card">
            <div className="why-icon">🏆</div>
            <h3>Proven Placement Success</h3>
            <p>96% placement rate with regular visits from top employers, driving strong outcomes for students.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🎓</div>
            <h3>Industry-Aligned Programs</h3>
            <p>Curriculum and training designed with industry input to build job-ready graduates.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🤝</div>
            <h3>Corporate Partnerships</h3>
            <p>400+ partner companies across technology, business, and consulting provide real placement opportunities.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">💡</div>
            <h3>Innovation and Skill Growth</h3>
            <p>Strong focus on research, skill-building, and experiential learning for future-ready careers.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🌟</div>
            <h3>Holistic Student Development</h3>
            <p>Personality development, leadership coaching, and soft-skill training complement technical education.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">📈</div>
            <h3>Dedicated Career Support</h3>
            <p>Personalized guidance, resume help, and interview coaching from an active placement team.</p>
          </div>
        </div>
      </section>

      <section id="success" className="success-section">
        <div className="section-header">
          <h2>Student Success Stories</h2>
          <p>Real journeys from CVR University to top employers.</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <div key={item.author} className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">"{item.message}"</p>
              <div className="testimonial-author">
                <span className="author-name">{item.author}</span>
                <span className="author-role">{item.role}</span>
                {item.company && <span className="author-company">{item.company}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Get quick answers about how the campus placement portal supports students and recruiters.</p>
        </div>
        <div className="faq-grid">
          {faqItems.map((item) => (
            <div key={item.question} className="faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="partners-section">
        <div className="section-header">
          <h2>Top Recruiters</h2>
          <p>Companies hiring from Dr. C.V. Raman University Vaishali.</p>
        </div>
        <div className="company-logos">
          {recruiters.map((company) => (
            <div key={company} className="brand-logo">
              {company}
            </div>
          ))}
        </div>
      </section>

      <section className="final-cta-section">
        <div className="final-cta-content">
          <h2>Be a part of the next placement success story.</h2>
          <p>Register now and access career support, top company drives, interview practice, and personal placement guidance from faculty and recruiters.</p>
          <div className="final-cta-buttons">
            <Link to="/register" className="btn-primary">
              Register Now
            </Link>
            <Link to="/login" className="btn-secondary">
              Explore Drives
            </Link>
          </div>
        </div>
      </section>

      <footer id="contact" className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Dr. C.V. Raman University Vaishali</h4>
            <p>Empowering futures through education and campus placements.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <a href="#placement">Placement Process</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Vaishali, Bihar</p>
            <p>Email: info@cvru.ac.in</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Dr. C.V. Raman University Vaishali. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
