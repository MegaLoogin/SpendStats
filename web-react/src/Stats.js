import axios from "axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { BasicDatePicker, SelectInput } from "./Components.js";
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@mui/material";
import { LOCAL_KEY } from "./App.js";

const api = axios.create({
    "baseURL": "/api/"
});

const intervals = [["yesterday", "Вчера", 1, 1], ["3_days", "3 дня", 3, 1], ["7_days", "7 дней", 7, 1], ["week", "Неделя", (dayjs().day() === 0 ? 6 : dayjs().day() - 1), 1], ["30_days", "30 дней", 30, 1], ["month", "Месяц", (dayjs().date() - 1), 1], ["all_time", "Все время", dayjs().diff(dayjs('1970-01-01'), 'days'), 1]];

const columns = [
    // { field: "id", headerName: "id"},
    { field: "date", headerName: "Дата"},
    { field: "click", headerName: "Uniq Click"},
    { field: "lead", headerName: "Lead"},
    { field: "sale", headerName: "Sale"},
    { field: "spend", headerName: "Spend"},
    { field: "revenue", headerName: "Revenue"},
    { field: "profit", headerName: "Profit"}
]

export function Stats(){
    const [ dateStart, setDateStart ] = useState(dayjs().subtract(8, 'day'));
    const [ dateEnd, setDateEnd ] = useState(dayjs().subtract(1, 'day'));
    const [ interval, setInterval ] = useState("");
    
    const [ name, setName ] = useState("");
    const [ users, setUsers ] = useState([]);

    const [ offer, setOffer ] = useState("");
    const [ offers, setOffers ] = useState([]);

    const [ rows, setRows ] = useState([]);
    const [ footerCount, setFooterCount ] = useState({});

    const [ searchParams, setSearchParams ] = useSearchParams();

    const navigate = useNavigate();

    async function onUserSelect(value) {
        const data = (await api.post("getOffersByUser", {userId: value})).data.data;
        setOffers(data.map(v => [v._id, v.title]));
    }

    async function onOfferSelect(value) { }

    async function onIntervalSelect(value) {
        const data = intervals.find(v => v[0] === value);
        setDateStart(dayjs().subtract(data[2], 'day'));
        setDateEnd(dayjs().subtract(data[3], 'day'));
    }

    const updateQueryParams = (intervalP, nameP, offerP) => {
        const params = new URLSearchParams(searchParams);
        params.set("interval", intervalP);
        params.set("name", nameP);
        params.set("offer", offerP);
        setSearchParams(params);
    };

    const round = v => Math.round(v * 100) / 100;

    useEffect(() => {
        const intervalParam = searchParams.get("interval");
        const nameParam = searchParams.get("name");
        const offerParam = searchParams.get("offer");

        if(intervalParam){
            setInterval(intervalParam);
            onIntervalSelect(intervalParam)
        };

        if(nameParam){
            setName(nameParam);
            onUserSelect(nameParam);
        }
        if(offerParam) setOffer(offerParam);
    }, [searchParams]);

    useEffect(() => {
        updateQueryParams(interval, name, offer);

        async function onChange(){
            try{
                if(!name || !offer) return;
                const data = (await api.post("/getDataByFilter", { dateStart: dateStart.format("YYYY-MM-DD"), dateEnd: dateEnd.format("YYYY-MM-DD"), offerId: offer, userId: name })).data.data;

                const rowsTemp = [];

                const allCount = { click: 0, lead: 0, sale: 0, spend: 0, revenue: 0, profit: 0};

                data.forEach(v => {
                    rowsTemp.push({ id: v._id, date: v.date.split("T")[0], click: v.click, lead: v.lead, sale: v.sale, spend: v.spend + " $", revenue: round(v.revenue) + " $", profit: round(v.profit) + " $" });
                    Object.keys(allCount).forEach(k => allCount[k] += v[k]);
                });

                allCount.revenue = round(allCount.revenue);
                allCount.profit = round(allCount.profit);

                setFooterCount(allCount);
                setRows(rowsTemp);
            }catch(e){
                console.log(e);
            }
        }

        onChange();
    }, [name, offer, dateStart, dateEnd]);

    useEffect(() => {
        async function start() {
            setUsers((await api.get("getUsers")).data.data.map(v => [v._id, v.name]));
        }

        start();
    }, []);

    function Footer(props){
        const row = [{ id: 0, date: "", click: props.click, lead: props.lead, sale: props.sale, spend: props.spend ? props.spend + " $" : "", revenue: props.revenue ? props.revenue + " $" : "", profit: props.profit ? props.profit + " $" : "" }]
        return <div>
            <DataGrid rows={row} columns={columns} hideFooter columnHeaderHeight={0}/>
        </div>;
    }

    return (
        <div>
            <Button sx={{display: "block", backgroundColor: "white", margin: "5px", marginLeft: "9px"}} variant="outlined" color="inherit" onClick={() => navigate(`/${LOCAL_KEY}/sendForm`)}>Отправка</Button>
            <div style={{margin: "0 auto", padding: "10px", borderRadius: "5px",backgroundColor: "white", justifyContent: "center", maxWidth: "720px"}}>
                <div style={{display: "block"}}>
                    <div style={{display: "flex"}}>
                        <BasicDatePicker label="Start" value={dateStart} setValue={setDateStart} callback={() => {}}/>
                        <BasicDatePicker label="End" value={dateEnd} setValue={setDateEnd} callback={() => {}}/>
                        <div style={{marginTop: "8px"}}><SelectInput label="Интервал" value={interval} setValue={setInterval} array={intervals} fullWidth={false} callback={onIntervalSelect}></SelectInput></div>
                    </div>
                    <SelectInput label="Имя" value={name} setValue={setName} array={users} fullWidth={false} callback={onUserSelect}/>
                    <SelectInput label="Оффер" value={offer} setValue={setOffer} array={offers} fullWidth={false} callback={onOfferSelect}/>
                </div>
                <DataGrid rows={rows} columns={columns} slots={{footer: Footer}} slotProps={{footer: footerCount}} hideFooterPagination={false}/>
            </div>
        </div>);
}