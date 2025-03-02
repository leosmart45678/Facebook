import React from "react";

export function MetaLogo() {
  return (
    <div className="flex justify-center items-center py-2">
      <div className="flex items-center gap-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="40" 
          height="40" 
          fill="none" 
          id="meta" 
          viewBox="0 0 24 24"
          className="w-[35px] h-[35px]"
        >
          <path 
            fill="currentColor" 
            className="text-black dark:text-white opacity-60"
            fillRule="evenodd" 
            d="M7.703 7a3.056 3.056 0 0 0-2.82 1.88c-.433 1.04-1.017 3.615-1.281 4.845-.074.34-.104.633-.08.896.078.88.35 1.3.606 1.516.267.227.673.363 1.267.363.653 0 1.26-.337 1.607-.89l1.645-2.632 2.187-3.645-.51-.85A3.056 3.056 0 0 0 7.704 7ZM12 7.39a5.056 5.056 0 0 0-8.963.721c-.52 1.249-1.143 4.038-1.39 5.194a4.988 4.988 0 0 0-.118 1.494c.111 1.24.54 2.214 1.305 2.863.753.639 1.687.838 2.561.838a3.895 3.895 0 0 0 3.303-1.83l1.65-2.64.01-.015L12 11.277l1.642 2.738.01.015 1.65 2.64a3.895 3.895 0 0 0 3.302 1.83c.983 0 2.005-.28 2.772-1.086.76-.799 1.124-1.96 1.124-3.414 0-.923-.35-2.266-.675-3.341a43.426 43.426 0 0 0-.815-2.422A5.056 5.056 0 0 0 12 7.39Zm1.166 1.943 2.186 3.645 1.645 2.631c.346.554.954.891 1.607.891.617 0 1.043-.17 1.323-.465.288-.302.573-.89.573-2.035 0-.584-.255-1.655-.59-2.764a41.348 41.348 0 0 0-.774-2.303 3.056 3.056 0 0 0-5.46-.45l-.51.85Z" 
            clipRule="evenodd"
          ></path>
        </svg>
        <span className="text-[#737373] dark:text-gray-400 font-semibold">Meta</span>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="container">
      {/* Facebook logo removed */}
      <input type="text" placeholder="Mobile number or email address" className="input-box" />
      <input type="password" placeholder="Password" className="input-box" />
      <button className="login-btn">Log in</button>
      <a href="#" className="forgot-password">Forgotten Password?</a>
      <button className="create-account-btn">Create new account</button>
      <style jsx>{`
        .container {
          width: 90%;
          max-width: 400px;
          margin: auto;
          text-align: center;
        }

        .logo { /*This rule is not used anymore, but keeping it for possible future use*/
          width: 60px;
          height: 60px;
          margin: 20px auto;
        }

        .input-box {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 16px;
        }

        .login-btn {
          width: 100%;
          background-color: #1877F2;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 18px;
          cursor: pointer;
          margin-top: 10px;
        }

        .login-btn:hover {
          background-color: #145dbf;
        }

        .forgot-password {
          display: block;
          margin: 15px 0;
          font-size: 14px;
          color: #1877F2;
          text-decoration: none;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .create-account-btn {
          width: 100%;
          background-color: #42B72A;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 18px;
          cursor: pointer;
          margin-top: 10px;
        }

        .create-account-btn:hover {
          background-color: #36a420;
        }

        .meta-logo {
          width: 80px;
          margin: 20px auto;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;