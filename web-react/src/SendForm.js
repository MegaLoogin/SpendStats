import { Box, TextField, Button, Typography, FormHelperText, Autocomplete, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import axios from "axios";
import { BasicDatePicker, SelectInput, SimpleBackdrop } from "./Components.js";
import { useNavigate } from "react-router-dom";
import { LOCAL_KEY } from "./App.js";
import { api } from "./service/api.js";
import { useContext } from "react";
import { Context } from ".";
import React from 'react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Получаем список всех часовых поясов с их смещениями относительно UTC
const timezones = Intl.supportedValuesOf('timeZone').map(zone => {
    const offset = dayjs().tz(zone).utcOffset() / 60;
    const sign = offset >= 0 ? '+' : '';
    return {
        value: zone,
        label: `${zone} (UTC${sign}${offset})`
    };
}).sort((a, b) => {
    const offsetA = dayjs().tz(a.value).utcOffset();
    const offsetB = dayjs().tz(b.value).utcOffset();
    return offsetA - offsetB;
});

let offersSend = {};

// const api = axios.create({
//     "baseURL": "http://localhost/api/",
//     maxBodyLength: 10000 * 1024,
//     maxContentLength: 10000 * 1024
// });

// Установка глобальных настроек для всех запросов
axios.defaults.maxContentLength = 10000000; // 10MB
axios.defaults.maxBodyLength = 10000000; // 10MB

export function SendForm(){
    const { type, username, btag } = useContext(Context).store.user;
    console.log('Current user btag:', btag, type, username);
    const [name, setName] = useState('');
    const [users, setUsers] = useState([]);
    const [geosData, setGeosData] = useState([]);
    const [offersData, setOffersData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offersSections, setOffersSections] = useState([]);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [userBtag, setUserBtag] = useState('');

    const navigate = useNavigate();

    async function onUserSelect(value){
        setOffersSections([]);
        offersSend = {};

        setLoading(true);
        const data = ((await api.post("getOffers", { buyerId: value[0] })).data);
        setLoading(false);

        setGeosData(data.avaliableGeos);
        setOffersData(data.offers);
        setFilteredOffers(data.offers);
        
        // Устанавливаем btag выбранного баера
        if (type === 'admin' && value[2]) {
            setUserBtag(value[2]);
        }

        setButtonDisabled(false);
    }

    async function onSend(){
        setLoading(true);
        for(let id of Object.keys(offersSend)){
            await offersSend[id]();
        }
        setLoading(false);
    }

    useEffect(() => {
        async function onLoad(){
            setLoading(true);
            if (type === 'admin') {
                const response = await api.get("getUsers");
                if (response.data.status === "ok" && Array.isArray(response.data.data)) {
                    // Фильтруем только баеров и добавляем btag в массив
                    const buyers = response.data.data
                        .filter(user => user.type === 'buyer')
                        .map(v => [[v._id, v.username, v.btag], v.username]);
                    setUsers(buyers);
                }
                setButtonDisabled(true);
            } else {
                // Для обычного пользователя всегда вызываем onUserSelect с его данными
                const buyers = (await api.get("getBuyers")).data;
                const currentBuyer = buyers.find(b => b.name === username);
                if (currentBuyer) {
                    setName([currentBuyer.id, currentBuyer.name]);
                    await onUserSelect([currentBuyer.id, currentBuyer.name]);
                } else {
                    // Если пользователь не найден в списке байеров, создаем временную запись
                    const tempBuyer = { id: username, name: username };
                    setName([tempBuyer.id, tempBuyer.name]);
                    await onUserSelect([tempBuyer.id, tempBuyer.name]);
                }
            }
            setLoading(false);
        }

        onLoad();
    }, []);

    // Фильтрация офферов при вводе в поиск
    useEffect(() => {
        if (offersData.length > 0) {
            const filtered = offersData.filter(offer => 
                offer.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredOffers(filtered);
        }
    }, [searchQuery, offersData]);

    function OfferSection(props){
        const { id } = props;
        const [geo, setGeo] = useState('');
        const [offer, setOffer] = useState('');
        const [date, setDate] = useState(dayjs().subtract(1, 'day'));
        const [spend, setSpend] = useState('');
        const [geos, setGeos] = useState([]);
        const [offers, setOffers] = useState([]);
        const [clicksData, setClicksData] = useState([]);
        const [count, setCount] = useState("");
        const [totalRevenue, setTotalRevenue] = useState(0);
        const [buyerClicks, setBuyerClicks] = useState(0);
        const [buyerRevenue, setBuyerRevenue] = useState(0);
        const [helper, setHelper] = useState("");
        const [helperError, setHelperError] = useState(false);

        // Получаем актуальный btag в зависимости от типа пользователя
        const currentBtag = type === 'admin' ? userBtag : btag;

        async function onGeoSelect(value){
            setOffer("");
            setOffers(filteredOffers.filter(v => v.country.includes(value)).map(v => [v.id, v.name]));
        }

        const onOfferDateSelect = async (value, dateValue) => { }

        async function send() {
            if(offer == "" || spend == "") {
                setHelperError(true);
                setHelper("Ошибка: заполните поля");
                return;
            }
            const selectedOffer = offersData.find(v => v.id == offer);
            // Фильтруем клики только по btag пользователя
            const filteredClicks = currentBtag ? clicksData.filter(click => click.sub_id_6 === currentBtag) : clicksData;
            alert(currentBtag + " " + clicksData.length + " " + filteredClicks.length);
            const res = (await api.post("addData", {
                offerData: selectedOffer,
                data: filteredClicks,
                buyerName: name[1],
                spend: spend,
                date: date.format("YYYY-MM-DD")
            })).data;

            setHelperError(res.status == "error");
            setHelper(res.status == "error" ? "Ошибка: " + res.message : "Отправлено");

            // Очищаем данные после успешной отправки
            if (res.status !== "error") {
                setSpend("");
                setClicksData([]);
                setCount("");
                setTotalRevenue(0);
                setBuyerClicks(0);
                setBuyerRevenue(0);
            }
        }

        useEffect(() => {
            setGeos(geosData.map(v => [v, v]));
        }, [geosData, offersSections])

        useEffect(() => {
            const start = async () => {
                try{
                    if(offer == "") return;
                    const selectedOffer = offersData.find(v => v.id == offer);
    
                    let clicksDataTemp = (await api.post("getClicks", { 
                        date: date.toDate().toLocaleDateString(), 
                        offerId: offer, 
                        timezone: "Europe/Moscow" 
                    })).data.data;
    
                    console.log('All clicks:', clicksDataTemp);
                    console.log('Filtering by btag:', currentBtag);
    
                    setClicksData(clicksDataTemp);
                    setCount(clicksDataTemp.length);
                    
                    // Считаем общий revenue
                    const revenue = clicksDataTemp.reduce((sum, click) => sum + (click.sale_revenue || 0), 0);
                    setTotalRevenue(revenue);

                    // Считаем клики и revenue только по btag пользователя
                    if (currentBtag) {
                        const buyerFilteredClicks = clicksDataTemp.filter(click => {
                            console.log('Click sub_id_6:', click.sub_id_6, 'btag:', currentBtag);
                            return click.sub_id_6 === currentBtag;
                        });
                        console.log('Filtered clicks:', buyerFilteredClicks);
                        setBuyerClicks(buyerFilteredClicks.length);
                        const buyerRevenue = buyerFilteredClicks.reduce((sum, click) => sum + (click.sale_revenue || 0), 0);
                        setBuyerRevenue(buyerRevenue);
                    } else {
                        setBuyerClicks(0);
                        setBuyerRevenue(0);
                    }
                }catch(e){
                    console.log('Error in start:', e);
                }
            };
    
            start();
        }, [offer, offersData, date, currentBtag]);

        useEffect(() => {
            offersSend[id] = send;
        }, [offer, geo, spend, date, offersSections]);

        return(
            <React.Fragment>
                <Autocomplete
                    fullWidth
                    options={filteredOffers}
                    getOptionLabel={(option) => option.name}
                    value={offersData.find(v => v.id === offer) || null}
                    onChange={(event, newValue) => {
                        setOffer(newValue ? newValue.id : '');
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Поиск оффера"
                            margin="normal"
                            required
                        />
                    )}
                    filterOptions={(options, { inputValue }) => {
                        const searchTerms = inputValue.toLowerCase().trim().split(/\s+/);
                        
                        return options.filter(option => {
                            if (searchTerms[0].startsWith('id:')) {
                                const searchId = searchTerms[0].substring(3);
                                return option.id.toString().includes(searchId);
                            }

                            const optionName = option.name.toLowerCase();
                            return searchTerms.every(term => 
                                optionName.includes(term) || 
                                option.id.toString().includes(term)
                            );
                        });
                    }}
                /><br/><br/>
                <BasicDatePicker label="Выберите дату" value={date} setValue={setDate} callback={onOfferDateSelect}/><br/>
                <TextField type="number" label="Сумма спенда" variant="outlined" onChange={e => setSpend(e.target.value)} value={spend} required/><br/><br/>
                <Typography>Общее количество: {count}</Typography>
                <Typography>Общий revenue: {totalRevenue.toFixed(2)} $</Typography>
                {currentBtag && (
                    <>
                        <Typography sx={{ color: 'green' }}>Количество по баеру: {buyerClicks}</Typography>
                        <Typography sx={{ color: 'green' }}>Revenue по баеру: {buyerRevenue.toFixed(2)} $</Typography>
                    </>
                )}
                <FormHelperText error={helperError} sx={{color: "green"}}>{helper}</FormHelperText>
            </React.Fragment>
        );
    }

    function add(){
        const id = Math.round(Math.random() * 100000)
        setOffersSections([...offersSections, <div><div style={{ backgroundColor: "#f6f6f6", padding: "5px", borderRadius: "5px"}}><OfferSection key={id} id={id}/></div><br/></div>]);
    }

    return (
        <div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: 'white'}}>
                <div>
                    <Button sx={{backgroundColor: "white", margin: "5px", marginLeft: "10px"}} variant="outlined" color="inherit" onClick={() => navigate(`/`)}>Меню</Button>
                    <Button sx={{backgroundColor: "white", margin: "5px", marginLeft: "10px"}} variant="outlined" color="inherit" onClick={() => navigate(`/stats`)}>Статистика</Button>
                </div>
            </div>
            <div style={{justifyContent: "center", display: "flex", backgroundColor: "#f3f0e7", margin: "10px", padding: "10px", height: "100%"}}>
                <Box sx={{ minWidth: 350, maxWidth: 500 }} height={"min-content"} bgcolor={"white"} borderRadius={2} p={2} >
                    {type === 'admin' && (
                        <React.Fragment>
                            <SelectInput labelName="Ник баера" value={name} setValue={setName} callback={onUserSelect} array={users} required/><br/><br/>
                        </React.Fragment>
                    )}
                    {offersSections.map(v => v)}
                    <br/>
                    <div style={{display: "block", textAlign: "center"}}>
                        <Button id="addButton" variant="outlined" color="inherit" onClick={add} disabled={buttonDisabled}>+</Button><br/><br/>
                        <Button variant="outlined" color="inherit" onClick={onSend}>Отправить</Button>
                    </div>
                </Box>
                <SimpleBackdrop openState={loading}/>
            </div>
        </div>);
}