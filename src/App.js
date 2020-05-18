import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import io from "socket.io-client";
import SwitchExample from "./components/ReactSwitch.js";

import {
  CartesianGrid,
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const socket = io("https://le-18262636.bitzonte.com/", {
  path: "/stocks",
});

socket.emit("EXCHANGES");
socket.emit("STOCKS");

function find_ticker(nombre, lista_stocks) {
  for (var stock in lista_stocks) {
    if (nombre == lista_stocks[stock].company_name)
      return lista_stocks[stock].ticker;
  }
  return "Not found";
}

function find_buy_volume(ticker, dicc) {
  if (isNaN(dicc[ticker])) {
    return 0;
  } else {
    return dicc[ticker];
  }
}
function find_volume_exchange(listed_companies, buy_stocks, stocks) {
  var ticker;
  var total = 0;
  for (var company in listed_companies) {
    ticker = find_ticker(listed_companies[company], stocks);
    total += find_buy_volume(ticker, buy_stocks);
  }

  return total;
}

function find_market_share(exchangesNames, amu, buyStocks, sellStocks, stocks) {
  var volumen_total_mercado = 0;
  var mi_volumen_total = 0;

  for (var exchange in exchangesNames) {
    volumen_total_mercado += find_volume_exchange(
      exchangesNames[exchange].listed_companies,
      buyStocks,
      stocks
    );
    volumen_total_mercado += find_volume_exchange(
      exchangesNames[exchange].listed_companies,
      sellStocks,
      stocks
    );
  }

  mi_volumen_total += find_volume_exchange(
    amu.listed_companies,
    buyStocks,
    stocks
  );
  mi_volumen_total += find_volume_exchange(
    amu.listed_companies,
    sellStocks,
    stocks
  );

  var share = mi_volumen_total / volumen_total_mercado;
  return share;
}

function find_price(ticker, dicc) {
  if (isNaN(dicc[ticker])) {
    return 0;
  } else {
    return dicc[ticker];
  }
}
function find_price_2(ticker, dicc) {
  if (isNaN(dicc[ticker])) {
    return 0;
  } else {
    return dicc[ticker];
  }
}

function render_chart() {}

function App() {
  const [stocks, setStock] = useState([]);
  const [exchangesNames, setExchangesNames] = useState([]);

  const [buyStocks, setBuyStocks] = useState([]);

  const [sellStocks, setSellStocks] = useState([]);

  const [priceStocks, setPriceStocks] = useState([]);

  const [lastpriceStocks, setlastPriceStocks] = useState([]);

  const [minpriceStocks, setminPriceStocks] = useState([]);
  const [maxpriceStocks, setmaxPriceStocks] = useState([]);

  const [dataStocks, setdataStocks] = useState({});

  var listExchangesNames = [];
  var buy_stocks_info = {};
  var sell_stocks_info = {};
  var price_stocks_info = {};
  var last_price_stocks_info = {};

  var min_price_stocks_info = {};
  var max_price_stocks_info = {};
  var data_info = {};

  //ESTADISTICAS

  useEffect(() => {
    socket.once("STOCKS", (stocks) => {
      setStock([...stocks]);
    });

    socket.once("EXCHANGES", (exchangesNames) => {
      for (var i in exchangesNames) {
        listExchangesNames.push(exchangesNames[i]);
      }
      setExchangesNames([...listExchangesNames]);
    });
    //es la compra de una acción

    socket.on("BUY", (buyStocks) => {
      if (isNaN(buy_stocks_info[buyStocks.ticker])) {
        buy_stocks_info[buyStocks.ticker] = buyStocks.volume;
        setBuyStocks(buy_stocks_info);
      } else {
        buy_stocks_info[buyStocks.ticker] += buyStocks.volume;
        setBuyStocks(buy_stocks_info);
      }
    });
    //venta volumen
    socket.on("SELL", (sellStocks) => {
      if (isNaN(sell_stocks_info[sellStocks.ticker])) {
        sell_stocks_info[sellStocks.ticker] = sellStocks.volume;
        setSellStocks(sell_stocks_info);
      } else {
        sell_stocks_info[sellStocks.ticker] += sellStocks.volume;
        setSellStocks(sell_stocks_info);
      }
    });

    //Venta UPDATE
    socket.on("UPDATE", (priceStocks) => {
      if (isNaN(price_stocks_info[priceStocks.ticker])) {
        price_stocks_info[priceStocks.ticker] = priceStocks.value;
        setPriceStocks(price_stocks_info);

        data_info[priceStocks.ticker] = [];
        var aux = {};

        aux["time"] = new Date(priceStocks.time).toLocaleString("es-CL");
        aux["value"] = priceStocks.value;
        data_info[priceStocks.ticker].push(aux);
        setdataStocks(data_info);

        last_price_stocks_info[priceStocks.ticker] = priceStocks.value;
        setlastPriceStocks(last_price_stocks_info);

        min_price_stocks_info[priceStocks.ticker] = priceStocks.value;
        max_price_stocks_info[priceStocks.ticker] = priceStocks.value;
        setminPriceStocks(min_price_stocks_info);
        setmaxPriceStocks(max_price_stocks_info);
      } else {
        last_price_stocks_info[priceStocks.ticker] =
          price_stocks_info[priceStocks.ticker];
        setlastPriceStocks(last_price_stocks_info);

        price_stocks_info[priceStocks.ticker] = priceStocks.value;
        setPriceStocks(price_stocks_info);

        var aux = {};

        var d = new Date(priceStocks.time);
        var t = new Date(d.getTime() + 1000).toLocaleString("es-CL");
        aux["time"] = t;

        aux["value"] = priceStocks.value;
        data_info[priceStocks.ticker].push(aux);
        setdataStocks(data_info);

        var min = min_price_stocks_info[priceStocks.ticker];
        var max = max_price_stocks_info[priceStocks.ticker];
        if (priceStocks.value > max) {
          max_price_stocks_info[priceStocks.ticker] = priceStocks.value;
        }

        if (priceStocks.value < min) {
          min_price_stocks_info[priceStocks.ticker] = priceStocks.value;
        }
        setminPriceStocks(min_price_stocks_info);
        setmaxPriceStocks(max_price_stocks_info);
      }
    });
  }, []);

  const [value, setValue] = useState(0); //
  useEffect(() => {
    const interval = setInterval(() => {
      setValue((value) => ++value);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div>
        <h1>IIC3103 Jparavich Stock Market</h1>
        <div>
          <SwitchExample my_socket={socket} />
        </div>
        <center>
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Exchange</th>
                <th scope="col">Country</th>
                <th scope="col">Volumen Compra</th>
                <th scope="col">Volumen Venta</th>
                <th scope="col">Volumen Total</th>
                <th scope="col">Cantidad Acciones</th>
                <th scope="col">Participación de Mercado</th>
              </tr>
            </thead>
            {exchangesNames.map((amu) => (
              <tr>
                <td scope="row">{amu.name}</td>
                <td scope="row">{amu.country}</td>

                <td scope="row">
                  {find_volume_exchange(
                    amu.listed_companies,
                    buyStocks,
                    stocks
                  )}{" "}
                </td>

                <td scope="row">
                  {find_volume_exchange(
                    amu.listed_companies,
                    sellStocks,
                    stocks
                  )}{" "}
                </td>

                <td scope="row">
                  {find_volume_exchange(
                    amu.listed_companies,
                    buyStocks,
                    stocks
                  ) +
                    find_volume_exchange(
                      amu.listed_companies,
                      sellStocks,
                      stocks
                    )}{" "}
                </td>

                <td scope="row">{amu.listed_companies.length}</td>
                <td scope="row">
                  {find_market_share(
                    exchangesNames,
                    amu,
                    buyStocks,
                    sellStocks,
                    stocks
                  )}
                </td>
              </tr>
            ))}
          </table>
        </center>
        <center>
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Company Stock</th>
                <th scope="col">Country</th>
                <th scope="col">Volumen Total Transado</th>
                <th scope="col">Alto historico</th>
                <th scope="col">Bajo historico</th>
                <th scope="col">Ultimo Precio</th>
                <th scope="col">Variación porcentual (%)</th>
              </tr>
            </thead>
            {stocks.map((block) => (
              <tr>
                <td scope="row">{block.company_name}</td>
                <td scope="row">{block.country}</td>
                <td scope="row">
                  {find_buy_volume(block.ticker, buyStocks) +
                    find_buy_volume(block.ticker, sellStocks)}
                </td>
                <td scope="row">
                  {find_price_2(block.ticker, maxpriceStocks)}{" "}
                </td>
                <td scope="row">
                  {find_price_2(block.ticker, minpriceStocks)}{" "}
                </td>
                <td scope="row">{find_price(block.ticker, priceStocks)} </td>
                <td scope="row">
                  {((find_price(block.ticker, priceStocks) -
                    find_price(block.ticker, lastpriceStocks)) /
                    find_price(block.ticker, priceStocks)) *
                    100}{" "}
                </td>

                <td scope="row">
                  {console.log(dataStocks[block.ticker])}
                  <LineChart
                    key={Math.random()}
                    width={360}
                    height={320}
                    data={dataStocks[block.ticker]}
                    redraw={true}
                  >
                    <XAxis
                      dataKey="time"
                      label={{ value: "Time", position: "insideBottom" }}
                    />
                    <YAxis
                      label={{
                        value: "$USD",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </td>
              </tr>
            ))}
          </table>
        </center>
      </div>
    </div>
  );
}

export default App;
