import { Button, CircularProgress, Typography } from "@mui/material";
import { observer } from "mobx-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from ".";
import { api } from "./service/api";

function MainPage(props){
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { type } = useContext(Context).store.user;
    
    const handleRecalc = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post("/recalcAllStatsFor30Days", {});
            setResult(res.data);
        } catch (e) {
            setResult({ status: "error", message: e?.response?.data?.message || e.message });
        }
        setLoading(false);
    };

    return <div style={{textAlign: "center", margin: "0 auto"}}>
        <br/>
        <br/>
        <RouteButton label="Публичная статистика" path="/publicStats"/><br/><br/>
        {["admin"].includes(type) ? <RouteButton label="Суммарная статистика" path="/globalStats"/> : null}<br/><br/>
        {["admin", "buyer"].includes(type) ? <RouteButton label="Локальная статистика" path="/stats"/> : null}<br/><br/>
        {["admin", "buyer"].includes(type) ? <RouteButton label="Форма отправки" path="/sendForm"/> : null}<br/><br/><br/>
        {["admin"].includes(type) ? <RouteButton label="Регистрация" path="/register"/> : null}<br/><br/><br/>
        {["admin"].includes(type) ? <Button style={{backgroundColor: "white"}} variant="outlined" color="inherit" onClick={handleRecalc}>Ручной перерасчет статистики</Button> : null}
        {loading && <CircularProgress size={24} style={{ marginLeft: 16, verticalAlign: "middle" }} />}
        {result && (
        <Typography sx={{ mt: 2 }} color={result.status === "ok" ? "green" : "red"}>
            {result.status === "ok"
            ? `Готово! Обработано: ${result.total}, изменено: ${result.updated}`
            : `Ошибка: ${result.message}`}
        </Typography>
        )}
    </div>
}

function RouteButton(props){
    const route = useNavigate();
    return <Button style={{backgroundColor: "white"}} variant="outlined" color="inherit" onClick={() => route(props.path)}>{props.label}</Button>
}

export default observer(MainPage);