import "./Switch.module.css";

const cssVariables = [
  "--background-color",
  "--highlight-color",
  "--border-color",
  "--primary-color",
  "--link-color",
  "--active-color",
  "--subheading-color",
  "--shadow-color",
  "--text-color",
];

const Switch = () => {
  const switchId = "switch-" + Math.floor(Math.random() * 10000);
  const toggleTheme = () => {
    const root = document.documentElement;
    const computedCssVars = window.getComputedStyle(root);
    const textColor = computedCssVars.getPropertyValue("--text-color").trim();
    const currentTheme = textColor === "white" ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    for (const cssVar of cssVariables) {
      root.style.setProperty(cssVar, `var(${cssVar}-${newTheme})`);
    }
  };
  return (
    <div style={{ display: "flex" }}>
      <input id={switchId} type="checkbox" onClick={toggleTheme} />
      <label for={switchId}></label>
    </div>
  );
};

export default Switch;
