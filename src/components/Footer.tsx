import React from "react";
import {Link} from "react-router-dom";

export default function Footer() {
  return (
    <div id="footer" className="tx-center tx-12 p-2 bg-blue mt-auto">
      <span className="me-2">&copy; {new Date().getFullYear()}</span>
      <Link to="/">
        happy train
      </Link>
      .
      <span className="ms-2">All Rights Reserved.</span>
    </div>
  )
}
