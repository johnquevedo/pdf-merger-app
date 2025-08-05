import { Link } from 'react-router-dom';

function Header(props) {
    return(!props.logged ?
    
    (<nav>
        <ul><Link to="/">Home</Link></ul>
        <ul><Link to="/register">Register</Link></ul>
        <ul><Link to="/login">Login</Link></ul>
    </nav>)
    
    :

    (<nav>
        <ul><Link to="/">Home</Link></ul>
        <ul><Link to="/dashboard">Dashboard</Link></ul>
        <ul><button onClick={props.logout}>Log Out</button></ul>
    </nav>)

)
}
export default Header;