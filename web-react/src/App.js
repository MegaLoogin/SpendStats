import { observer } from "mobx-react";
import LoginForm from "./LoginForm.js";
import { PublicStats } from "./PublicStats.js";
import { SendForm } from "./SendForm.js";
import { Stats } from "./Stats.js";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Context } from "./index.js";
import Router from "./Router.js";

export const LOCAL_KEY = "0066cec078e744518b28eefddd56ef08", PUBLIC_KEY = "657adc2660b848d7b53ffc029b9ea21d";

function App() {
    // const { store } = useContext(Context);
    // useEffect(() => {
    //     if(localStorage.getItem('token')){
    //         store.checkAuth()
    //     }
    // }, [store]);

    // if(!store.isAuth){
    //     return <LoginForm/>
    // }

    return <Router/>;
}

export default observer(App);
