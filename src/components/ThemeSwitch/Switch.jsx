import classes from "./Switch.module.css";

const Switch = () => {
  const switchId = "switch-" + Math.floor(Math.random() * 10000);
  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.dataset.theme === "light") {
      root.dataset.theme = "dark";
      localStorage.setItem("lightMode", "false");
    } else {
      root.dataset.theme = "light";
      localStorage.setItem("lightMode", "true");
    }
  };
  return (
    <div className={classes.themeSwitch} style={{ display: "flex" }}>
      <input
        id={switchId}
        type="checkbox"
        onClick={toggleTheme}
        checked={document.documentElement.dataset.theme === "light"}
      />
      <label for={switchId}></label>
    </div>
  );
};

export default Switch;
