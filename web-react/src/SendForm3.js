import { InputLabel, FormControl, MenuItem, Select, Box, TextField, Button, Typography, FormHelperText, Backdrop, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from "axios";

const TIMEZONE = "Europe/Moscow";

const api = axios.create({
    "baseURL": "http://localhost/api/"
});

function BasicDatePicker(props) {
    const { label, value, setValue, callback } = props;
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
                <DatePicker label={label} value={value} onChange={v => { setValue(v); callback(v, v);}} disableFuture/>
            </DemoContainer>
        </LocalizationProvider>
    );
}

function SelectInput(props){
    const { labelName, value, setValue, array, required, callback } = props;
    return (
    <FormControl fullWidth required={required}>
        <InputLabel>{labelName}</InputLabel>
        <Select label={labelName} onChange={(e) => {setValue(e.target.value); callback(e.target.value);}} value={value} required={required}>
            {array.map(v => <MenuItem key={v[0]} value={v[0]}>{v[1]}</MenuItem>)}
        </Select>
    </FormControl>);
}

function SimpleBackdrop(props) {
    const { openState } = props;
    return (
        <div>
            <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={openState}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
}

export function SendForm(){
    const [name, setName] = useState('');
    const [geo, setGeo] = useState('');
    const [offer, setOffer] = useState('');
    const [date, setDate] = useState(dayjs().subtract(1, 'day'));
    const [spend, setSpend] = useState('');

    const [users, setUsers] = useState([]);
    const [geos, setGeos] = useState([]);
    const [offers, setOffers] = useState([]);

    const [geosData, setGeosData] = useState([]);
    const [offersData, setOffersData] = useState([]);

    const [offerType, setOfferType] = useState("");
    const [count, setCount] = useState("");

    const [helper, setHelper] = useState("");
    const [helperError, setHelperError] = useState(false);

    const [clicksData, setClicksData] = useState([]);

    const [loading, setLoading] = useState(true);

    async function onUserSelect(value){
        setGeo("");
        setOffer("");

        setLoading(true);
        const data = ((await api.post("getOffers", { buyerId: value[0] })).data);
        setLoading(false);

        setGeosData(data.avaliableGeos);
        setOffersData(data.offers);
        setGeos(data.avaliableGeos.map(v => [v, v]));

        if(geo != "") onGeoSelect(geo);
    }

    async function onGeoSelect(value){
        setOffer("");
        setOffers(offersData.filter(v => v.country.includes(value)).map(v => [v.id, v.name]));
    }

    async function onSend(){
        if(offer == "" || geo == "" || offer == "" || spend == "") {
            setHelperError(true);
            setHelper("Ошибка: заполните поля");
            return;
        }
        const selectedOffer = offersData.find(v => v.id == offer);
        
        setLoading(true);
        const res = (await api.post("addData", {offerData: selectedOffer, data: clicksData, buyerName: name[1], spend: spend, date: date.toISOString().split("T")[0]})).data;
        setLoading(false);

        setHelperError(res.status == "error");
        setHelper(res.status == "error" ? "Ошибка: " + res.message : "Отправлено");
    }

    const onOfferDateSelect = async (value, dateValue) => { }

    useEffect(() => {
        const start = async () => {
            try{
                if(offer == "") return;
                const selectedOffer = offersData.find(v => v.id == offer);

                setLoading(true);
                let clicksDataTemp = (await api.post("getClicks", { date: date.toDate().toLocaleDateString(), offerId: offer, timezone: TIMEZONE })).data.data;
                setLoading(false);

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
        async function onLoad(){
            setLoading(true);
            setUsers((await api.get("getBuyers")).data.map(v => [[v.id, v.name], v.name]));
            setLoading(false);
        }

        onLoad();
    }, []);

    return (
    <div style={{justifyContent: "center", display: "flex", margin: "10px", padding: "10px", height: "95vh"}}>
        <Box sx={{ minWidth: 350, maxWidth: 500 }} height={"min-content"} bgcolor={"white"} borderRadius={2} p={2} >
            <SelectInput labelName="Ник баера" value={name} setValue={setName} callback={onUserSelect} array={users} required/><br/><br/>
            <SelectInput labelName="Гео" value={geo} setValue={setGeo} array={geos} callback={onGeoSelect} required/><br/><br/>
            <SelectInput labelName="Оффер" value={offer} setValue={setOffer} array={offers} callback={onOfferDateSelect} required/><br/><br/>
            <BasicDatePicker label="Выберите дату" value={date} setValue={setDate} callback={onOfferDateSelect}/><br/>
            <TextField type="number" label="Сумма спенда" variant="outlined" onChange={e => setSpend(e.target.value)} value={spend} required/><br/><br/>
            <Typography>Тип оффера: {offerType}</Typography>
            <Typography>Общее количество: {count}</Typography><br/>
            <Button variant="outlined" color="inherit" onClick={onSend}>Отправить</Button>
            <FormHelperText error={helperError} sx={{color: "green"}}>{helper}</FormHelperText>
        </Box>
        <SimpleBackdrop openState={loading}/>
    </div>);
}