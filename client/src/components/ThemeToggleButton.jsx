import { useTheme } from "../ThemeContext";
import "./ThemeToggleButton.css";

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle-btn" type="button" onClick={toggleTheme}>
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

export default ThemeToggleButton;
