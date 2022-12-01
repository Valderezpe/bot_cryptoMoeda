const WebSocket = require ("ws");
const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`);

const PROFITABILITY = parseFloat(process.env.PROFITABILITY);
let sellPrice = 0;

ws.onmessage = (event) => {
    console.clear();
    const obj = JSON.parse(event.data);
    console.log("Symbol: " + obj.s);
    console.log("Best Ask" + obj.a);

    const currentPrice = parseFloat(obj.a);
    if(sellPrice === 0 && currentPrice < 16893){
        console.log("Bom para comprar");
        newOrder("0.001", "BUY");
        sellPrice = currentPrice * PROFITABILITY;
        // 17119 valor dia 30/11 : 16:40 hrs
        // 17076 valor dia 01/12 : 08:02 hrs
        // 17125 valor dia 01/12 : 10:18 hrs 
    }
    else if(sellPrice !== 0 && currentPrice >= sellPrice){
        console.log("Bom para vender");
        newOrder("0.001", "SELL");
        sellPrice = 0;
    }
    else 
    console.log("Esperando...Sell Price" + sellPrice);
}

const axios = require('axios');
const crypto = require('crypto');

async function newOrder(quantity,side){
    const data ={
        symbol: process.env.SYMBOL,
        type: 'MARKET', 
        side, 
        quantity
    };

    const timestamp = Date.now();
    const recvWindow =5000;

    const signature = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(`${new URLSearchParams({...data, timestamp, recvWindow})}`)
        .digest('hex');

    const newData = {...data, timestamp, recvWindow, signature};
    const qs = `?${new URLSearchParams(newData)}`;


    try{
       const result = await axios({
            method: 'POST',
            url: `${process.env.API_URL}/v3/order${qs}`,
            headers:{'X-MBX-APIKEY': process.env.API_KEY}
        })
        console.log(result.data);
    }
    catch(err){
        console.error(err);
    }

}