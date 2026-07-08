import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="page notfound">
      <div className="content">
        <img src="/notfound.png" alt="Page not found" />
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">Back to Home</Link>
      </div>
    </section>
  );
};

export default NotFound;
