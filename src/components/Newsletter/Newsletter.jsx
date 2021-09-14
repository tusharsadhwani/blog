import classes from "./Newsletter.module.css";

const Newsletter = () => {
  const subscribe = (event) => {
    event.preventDefault();
    const btn = document.getElementById("subscribe");
    btn.disabled = true;

    const form = event.target;
    const formData = new FormData(form);
    let email;
    for (const [name, value] of formData) {
      email = value;
    }

    if (!email) {
      btn.disabled = false;
      return;
    }

    fetch("https://newsletter.sadh.life/subscribe", {
      method: "post",
      body: JSON.stringify({
        email: email,
        name: "User",
        status: "enabled",
        lists: [3],
      }),
    }).then((response) => {
      if (response.ok) {
        btn.style.backgroundColor = "#007766";
        btn.textContent = "Success!";
      } else {
        btn.style.backgroundColor = "red";
        btn.textContent = "Some error occured.";
      }
    });
  };

  return (
    <div className={classes.Newsletter}>
      <h4>Subscribe to my newsletter:</h4>
      <form onSubmit={subscribe}>
        <label>
          <input type="text" name="email" placeholder="Your email..." />
        </label>
        <button id="subscribe">Subscribe</button>
      </form>
    </div>
  );
};

export default Newsletter;
