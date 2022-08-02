/**
 * Pengecekan indicator macd dengan websocket dari TradingView Api
 * @mathieuc/tradingview
 */

import TradingView from "@mathieuc/tradingview";
// const TradingView = import();
// const bf = require("./../bot_function.js");
// const { config } = require("./config");
// const tradingview_ta = require("../lib/tradingview_ta");

// client tradingview
let last_signal;
let last_order;

const client = new TradingView.Client();
const chart = new client.Session.Chart();

chart.setMarket("BINANCE:BNBUSDTPERP", {
  timeframe: "15",
  range: 3, // Can be positive to get before or negative to get after
  // to: 1600000000,
});

TradingView.getIndicator("PUB;EhBrwQPjZ1cE1oo4D8LLRpWDfSgqyNpC").then(
  async (indic) => {
    console.log(`Loading '${indic.description}' study...`);
    const STD = new chart.Study(indic);

    STD.onUpdate(async () => {
      const macdData = STD.periods;

      const last_candle = true;
      let previous_macd, previous_signal, current_macd, current_signal;
      if (last_candle) {
        previous_macd = macdData[1].MACD;
        previous_signal = macdData[1].Signal;

        current_macd = macdData[0].MACD;
        current_signal = macdData[0].Signal;
      } else {
        previous_macd = macdData[2].MACD;
        previous_signal = macdData[2].Signal;

        current_macd = macdData[1].MACD;
        current_signal = macdData[1].Signal;
      }

      let is_hot = false,
        is_cold = false;

      is_hot = previous_macd < previous_signal && current_macd > current_signal;
      is_cold =
        previous_macd > previous_signal && current_macd < current_signal;

      console.log({ is_hot, is_cold });

      // prepare order
      // let lastOrder = await redisDb.get("lastOrder");
      // lastOrder = lastOrder ? lastOrder : null;
      // console.log("last order data", lastOrder);

      let post_order = "none";
      if (is_hot && lastOrder.side != "buy") {
        post_order = "buy";
      }
      // trigger order sell
      if (is_cold && lastOrder.side != "sell") {
        post_order = "sell";
      }

      // ketika signal terakhir sama dengan signal sekarang maka lewati
      if (post_order == last_signal) {
        post_order = "none";
      }

      if (post_order != "none") {
        console.log("mendapatkan signal untuk post order", {
          last_signal,
          post_order,
          is_hot,
          is_cold,
        });

        const price = chart.periods[0].close;
        console.log(price);
        // await bf.trigger_webhook({
        //   type: post_order,
        //   price: price,
        // });

        last_signal = post_order;
      }
    });
  }
);
