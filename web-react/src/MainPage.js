import { Button } from "@mui/material";
import { observer } from "mobx-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from ".";

function MainPage(props){
    const { type } = useContext(Context).store.user;

    return <div style={{textAlign: "center", margin: "0 auto"}}>
        <br/>
        <br/>
        <RouteButton label="Публичная статистика" path="/publicStats"/><br/><br/>
        {["admin"].includes(type) ? <RouteButton label="Суммарная статистика" path="/globalStats"/> : null}<br/><br/>
        {["admin", "buyer"].includes(type) ? <RouteButton label="Локальная статистика" path="/stats"/> : null}<br/><br/>
        {["admin", "buyer"].includes(type) ? <RouteButton label="Форма отправки" path="/sendForm"/> : null}<br/><br/><br/>
        {["admin"].includes(type) ? <RouteButton label="Регистрация" path="/register"/> : null}
    </div>
}

function RouteButton(props){
    const route = useNavigate();
    return <Button style={{backgroundColor: "white"}} variant="outlined" color="inherit" onClick={() => route(props.path)}>{props.label}</Button>
}

export default observer(MainPage);