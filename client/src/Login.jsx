import React, { useState } from 'react';

function Login(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return(<>
    <div className="login-wrapper">
    <label>Username</label>
    <input value={username} onChange={(e) => setUsername(e.target.value)}/>
    <label>Password</label>
    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
    <button onClick={async () => props.onLogin(username, password)}>Sign in</button>
    </div>
    </>)
}

export default Login;