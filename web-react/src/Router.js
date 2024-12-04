import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Context } from ".";
import { SendForm } from "./SendForm";
import { Stats } from "./Stats";
import { PublicStats } from "./PublicStats";
import { Button, Typography } from "@mui/material";
import { observer } from "mobx-react";
import LoginForm from "./LoginForm";
import MainPage from "./MainPage";

const PrivateRoute = observer(function (props){
    const { permissionType, children } = props;
    const route = useNavigate();
    const { store } = useContext(Context);

    const [show, setShow] = useState(false);

    useEffect(() => {
        if(localStorage.getItem('token')){
            store.checkAuth().then(() => {
                setShow(permissionType.includes(store.user?.type))
            });
        }else{
            route("/login");
        }
    }, [store]);

    return <div><div style={{display: "flex"}}><LogoutButton/><Typography marginLeft="15px" variant="h5" marginTop="3px" color="textDisabled">Имя: {store.user.username}</Typography></div>{show ? children : <MainPage/>}</div>;
});

function LogoutButton(){
    const { store } = useContext(Context);
    const route = useNavigate();
    const logout = () => store.logout().then(() => route("/login"));
    return <Button style={{backgroundColor: "white", marginLeft: "10px"}} variant="outlined" color="inherit" onClick={logout}>Выход</Button>
}

function Router(){
    return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/">
                    <Route path="/login" element={<LoginForm/>}/>
                    <Route path="/" element={<PrivateRoute permissionType={["admin", "buyer", "aff"]}><MainPage/></PrivateRoute>}/>
                    <Route path="/sendForm" element={<PrivateRoute permissionType={["admin", "buyer"]}><SendForm/></PrivateRoute>}/>
                    <Route path="/stats" element={<PrivateRoute permissionType={["admin", "buyer"]}><Stats/></PrivateRoute>}/>
                    <Route path="/publicStats" element={<PrivateRoute permissionType={["admin", "aff"]}><PublicStats/></PrivateRoute>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    </div>
    );
}

export default observer(Router);