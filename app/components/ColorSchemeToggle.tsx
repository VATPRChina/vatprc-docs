import { useEffect } from "react";
import { TbSun, TbMoon } from "react-icons/tb";

const updateTheme = () => {
  const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";

  const lightIcon = document.getElementById("theme-toggle-light-icon");
  const darkIcon = document.getElementById("theme-toggle-dark-icon");

  if (lightIcon && darkIcon) {
    lightIcon.classList.toggle("hidden", currentTheme !== "light");
    darkIcon.classList.toggle("hidden", currentTheme !== "dark");
  }
};

export const ColorSchemeToggle = () => {
  useEffect(() => {
    // use media query to set initial theme
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDarkScheme) {
      document.documentElement.classList.add("dark");
    }
    // check localStorage for theme preference
    const savedTheme = localStorage.getItem("vatprc-homepage-theme");
    if (savedTheme) {
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
    updateTheme();
    // listen for changes in the color scheme
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      updateTheme();
    });
  });

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    updateTheme();
    // save the theme preference in localStorage
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("vatprc-homepage-theme", currentTheme);
  };

  return (
    <button type="button" className="button-theme-toggle" onClick={toggleTheme}>
      <TbSun id="theme-toggle-light-icon" className="hidden" />
      <TbMoon id="theme-toggle-dark-icon" className="hidden" />
    </button>
  );
};
