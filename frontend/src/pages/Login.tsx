import React from 'react';

const Login: React.FC = () => {
  return (
    <div className="login-page">
      <div className="container">
        <div className="login-form">
          <h1>Login</h1>
          <form>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required />
            </div>
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </form>
          <p>
            Don't have an account? <a href="/register">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
