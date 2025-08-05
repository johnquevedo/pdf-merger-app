import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const handleRegister = async () => {
        const res = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.message) alert(data.message);
    }

    const doRegisterAndNavigate = async () => {
        await handleRegister();
        console.log("handled")
        navigate('/login');  
        console.log("navigating");
        
}



    return((<>
    <div className="login-wrapper">
    <label>Username</label>
    <input value={username} onChange={(e) => setUsername(e.target.value)}/>
    <label>Password</label>
    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
    <button onClick={doRegisterAndNavigate}>Sign up</button>
    </div>
    </>)
)
}

export default Register;