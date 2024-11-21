const usernames = document.getElementById("username");
const offers = document.getElementById("offers");
const geos = document.getElementById("geos");
const date = document.getElementById("date");
const ftdCount = document.getElementById("ftdCount");
const allCount = document.getElementById("allCount");
const offerName = document.getElementById("offerName");
const offerType = document.getElementById("offerType");
const spend = document.getElementById("spend");
const sendDataButton = document.getElementById("sendData");
const statusLabel = document.getElementById("status");

let offersData = null;
let clicksData = [];
let mappedOffers = {};

let offersToSend = {};

let filtredOffers = [];

async function post(url, data){
    return await (await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })).json();
}

window.onload = async () => {
    date.max = new Date(Date.now() - 1000 * 3600 * 24).toISOString().split("T")[0]
    const data = await (await fetch("/api/getBuyers")).json();
    // const isBusy = (await (await fetch("/api/status")).json()).busy;

    // if(isBusy){
    //     sendDataButton.disabled = true;
    //     statusLabel.innerHTML = "System is busy right now, reload page and try later";
    // }

    for(let user of data){
        let username = document.createElement('option');
        username.value = user.id;
        username.innerHTML = user.name;
        usernames.appendChild(username);
    }
}

usernames.onchange = async () => {
    const buyerId = usernames.value;

    offers.innerHTML = "<option disabled selected>Выберите оффер</option>";
    offersData = await post("/api/getOffers", { buyerId });

    for(let geo of offersData.avaliableGeos){
        let geoOpt = document.createElement('option');
        geoOpt.value = geo;
        geoOpt.innerHTML = geo;
        geos.appendChild(geoOpt);
    }

    if(geos.value != "") geos.onchange();
}

geos.onchange = async () => {
    offers.innerHTML = "<option disabled selected>Выберите оффер</option>";
    filtredOffers = [];
    if(offersData != null){
        filtredOffers = offersData.offers.filter(v => v.country.includes(geos.value));

        for(let offer of filtredOffers){
            let offerOpt = document.createElement('option');
            offerOpt.value = offer.id;
            offerOpt.innerHTML = offer.name;
            offers.appendChild(offerOpt);
        }
        // const filtredOffers = offersData.offers.filter(v => v.country.includes(geos.value));
        // filtredOffers.forEach(v => {
        //     try{
        //         const offerNameTag = v.name.split("|")[2].trim("").toLowerCase();
        //         console.log(!(offerNameTag in mappedOffers), offerNameTag, mappedOffers);
        //         if(!(offerNameTag in mappedOffers)) mappedOffers[offerNameTag] = [];

        //         mappedOffers[offerNameTag].push(v.id);
        //     }catch(e){
        //         console.log(e, v);
        //     }
        // });

        // for(let offer of Object.keys(mappedOffers)){
        //     let offerOpt = document.createElement('option');
        //     offerOpt.value = offer;
        //     offerOpt.innerHTML = offer;
        //     offers.appendChild(offerOpt);
        // }
    }
}

date.onchange = offers.onchange = async () => {
    const newDate = new Date(date.value).toLocaleDateString();
    const timezone = "Europe/Moscow";

    if(date.value != "" && offers.value != "Выберите оффер"){
        // let allFtdCount = allAllCount = 0;
        // offersToSend = {};

        // for(let offerId of mappedOffers[offers.value]){
        //     const data = await post("/api/getData", {date: newDate, offerId, timezone });
        //     offersToSend[offerId] = {
        //         ftdCount: data.ftdCount,
        //         count: data.data.length
        //     }
        //     allFtdCount += data.ftdCount;
        //     allAllCount += data.data.length;
        // }
        let selectedOffer = filtredOffers.find(v => v.id == offers.value);
        console.log(selectedOffer);
        clicksData = await post("/api/getClicks", { date: newDate, offerId: offers.value, timezone });

        offerType.innerHTML = selectedOffer.payout_auto ? "spend" : "cpa";
        allCount.innerHTML = clicksData.data.length;
    }
}

sendDataButton.onclick = async () => {
    if(date.value != "" && offers.value != "Выберите оффер"){
        let selectedOffer = filtredOffers.find(v => v.id == offers.value);
        sendDataButton.disabled = true;
        statusLabel.innerText = "Загрузка";
        post("/api/addData", {offerData: selectedOffer, data: clicksData, buyerName: usernames.options[usernames.selectedIndex].text, spend: spend.value, date: new Date(date.value)})
        .then((v) => {
            console.log(v);
            if(v.status == "ok")
                statusLabel.innerHTML = "Отправлено";
            else
                statusLabel.innerHTML = "Ошибка<br/>" + v.text;
        })
        .catch((r) => {
            console.log(r);
            statusLabel.innerHTML = "Ошибка"
        })
        .finally(() => sendDataButton.disabled = false);
    }
}