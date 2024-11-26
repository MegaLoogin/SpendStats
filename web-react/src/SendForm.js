import { Box, TextField, Button, Typography, FormHelperText } from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import axios from "axios";
import { BasicDatePicker, SelectInput, SimpleBackdrop } from "./Components.js";

const TIMEZONE = "Europe/Moscow";

let offersSend = {};

const api = axios.create({
    "baseURL": "http://localhost/api/",
    maxBodyLength: 10000 * 1024,
    maxContentLength: 10000 * 1024
});

// Установка глобальных настроек для всех запросов
axios.defaults.maxContentLength = 10000000; // 10MB
axios.defaults.maxBodyLength = 10000000; // 10MB

export function SendForm(){
    const [name, setName] = useState('');
    
    const [users, setUsers] = useState([]);

    const [geosData, setGeosData] = useState([]);
    const [offersData, setOffersData] = useState([]);

    const [loading, setLoading] = useState(false);

    const [offersSections, setOffersSections] = useState([]);

    const [buttonDisabled, setButtonDisabled] = useState(true);


    async function onUserSelect(value){
        setOffersSections([]);
        offersSend = {};

        setLoading(true);
        const data = ((await api.post("getOffers", { buyerId: value[0] })).data);
        setLoading(false);

        setGeosData(data.avaliableGeos);
        setOffersData(data.offers);

        setButtonDisabled(false);
        // setGeos(data.avaliableGeos.map(v => [v, v]));

        // if(geo != "") onGeoSelect(geo);
    }

    async function onSend(){
        setLoading(true);
        for(let id of Object.keys(offersSend)){
            console.log(id);
            await offersSend[id]();
        }
        setLoading(false);
    }

    useEffect(() => {
        async function onLoad(){
            setLoading(true);
            setUsers((await api.get("getBuyers")).data.map(v => [[v.id, v.name], v.name]));
            setLoading(false);
        }

        onLoad();
    }, []);

    function OfferSection(props){
        const { id } = props;
        const [geo, setGeo] = useState('');
        const [offer, setOffer] = useState('');
        const [date, setDate] = useState(dayjs().subtract(1, 'day'));
        const [spend, setSpend] = useState('');

        const [geos, setGeos] = useState([]);
        const [offers, setOffers] = useState([]);

        const [clicksData, setClicksData] = useState([]);

        const [offerType, setOfferType] = useState("");
        const [count, setCount] = useState("");

        const [helper, setHelper] = useState("");
        const [helperError, setHelperError] = useState(false);

        async function onGeoSelect(value){
            setOffer("");
            setOffers(offersData.filter(v => v.country.includes(value)).map(v => [v.id, v.name]));
        }

        const onOfferDateSelect = async (value, dateValue) => { }

        async function send() {
            console.log(offer, geo, spend, 1);
            if(offer == "" || geo == "" || spend == "") {
                setHelperError(true);
                setHelper("Ошибка: заполните поля");
                return;
            }
            const selectedOffer = offersData.find(v => v.id == offer);

            const res = (await api.post("addData", {offerData: selectedOffer, data: clicksData, buyerName: name[1], spend: spend, date: date.toISOString().split("T")[0]})).data;

            setHelperError(res.status == "error");
            setHelper(res.status == "error" ? "Ошибка: " + res.message : "Отправлено");
        }

        useEffect(() => {
            setGeos(geosData.map(v => [v, v]));
        }, [geosData, offersSections])

        useEffect(() => {
            const start = async () => {
                try{
                    if(offer == "") return;
                    const selectedOffer = offersData.find(v => v.id == offer);
    
                    // setLoading(true);
                    let clicksDataTemp = (await api.post("getClicks", { date: date.toDate().toLocaleDateString(), offerId: offer, timezone: TIMEZONE })).data.data;
                    // setLoading(false);
    
                    setClicksData(clicksDataTemp);
    
                    const type = selectedOffer.payout_auto ? "spend" : "cpa";
    
                    setOfferType(type);
                    setCount(clicksDataTemp.length);
                }catch(e){
                    console.log(e);
                }
            };
    
            start();
        }, [offer, offersData, date]);

        useEffect(() => {
            offersSend[id] = send;
        }, [offer, geo, spend, date, offersSections]);

        return(
            <div>
                <SelectInput labelName="Гео" value={geo} setValue={setGeo} array={geos} callback={onGeoSelect} required/><br/><br/>
                <SelectInput labelName="Оффер" value={offer} setValue={setOffer} array={offers} callback={onOfferDateSelect} required/><br/><br/>
                <BasicDatePicker label="Выберите дату" value={date} setValue={setDate} callback={onOfferDateSelect}/><br/>
                <TextField type="number" label="Сумма спенда" variant="outlined" onChange={e => setSpend(e.target.value)} value={spend} required/><br/><br/>
                <Typography>Тип оффера: {offerType}</Typography>
                <Typography>Общее количество: {count}</Typography>
                <FormHelperText error={helperError} sx={{color: "green"}}>{helper}</FormHelperText>
            </div>
        );
    }

    function add(){
        const id = Math.round(Math.random() * 100000)
        setOffersSections([...offersSections, <div><div style={{ backgroundColor: "#f6f6f6", padding: "5px", borderRadius: "5px"}}><OfferSection key={id} id={id}/></div><br/></div>]);
    }

    return (
    <div style={{justifyContent: "center", display: "flex", backgroundColor: "#f3f0e7", margin: "10px", padding: "10px", height: "100%"}}>
        <Box sx={{ minWidth: 350, maxWidth: 500 }} height={"min-content"} bgcolor={"white"} borderRadius={2} p={2} >
            <SelectInput labelName="Ник баера" value={name} setValue={setName} callback={onUserSelect} array={users} required/><br/><br/>
            {offersSections.map(v => v)}
            <br/>
            <div style={{display: "block", textAlign: "center"}}>
                <Button id="addButton" variant="outlined" color="inherit" onClick={add} disabled={buttonDisabled}>+</Button><br/><br/>
                <Button variant="outlined" color="inherit" onClick={onSend}>Отправить</Button>
            </div>
        </Box>
        <SimpleBackdrop openState={loading}/>
    </div>);
}