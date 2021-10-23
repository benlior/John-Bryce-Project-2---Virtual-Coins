// Array to hold toggled coins
const liveReportArray = new Array();

$(() => {
  // Get all coins
  $.ajax({
    url: "https://api.coingecko.com/api/v3/coins",
    beforeSend: function () {
      // Show loading
      loading();
    },
    success: function (result) {
      // Hide loading
      doneLoading();
      result.forEach(ele => {
        $("div");
        $("#coin-display").append(
          `
          <div id="${ele.id}" class="card col-sm-4 ${ele.symbol.toUpperCase()}">
            <div class="card-body">
              <div class="card-title"> 
                <h4 class="float-left">${ele.symbol.toUpperCase()}</h4>
                <label class="switch float-right">
                  <input id=${ele.id}-toggle class="toggle" type="checkbox">
                  <span class="slider round"></span>
                </label>
              </div>
              <br>
              <p class="coin-name">${ele.name}</p>
              <button class="btn btn-dark more-info-button">More Info</button>
            </div>
          </div>
          `
        );
      });
    }
  });
  // Get additional coin info and add to card
  $("body").on("click", ".more-info-button", function () {
    const date = new Date();
    const clickTime = date.getTime();
    const cardtext = $(this).parents(".card-body");
    const id = $(this)
      .parents(".card")
      .attr("id");
    const coinLSinfo = JSON.parse(localStorage.getItem(id));
    $(this).hide();

    // If coin info was already saved to local storage and 2 minutes have not yet passed - get from LS
    if (
      localStorage.hasOwnProperty(id) &&
      clickTime - coinLSinfo.timeAdded <= 120000
    ) {
      cardtext.append(`
            <div class="more-info">
                <img src=${coinLSinfo.image}/>
                <p class="mt-2">Price:
                    <ul>
                        <li>${coinLSinfo.usd} $</li>
                        <li>${coinLSinfo.eur} €</li>
                        <li>${coinLSinfo.ils} ₪</li>
                    </ul>
                <button class="mt-2 btn btn-dark less-info">Less Info</button>
            </div>
        `);
    } else {
      // else get new coin info from API and save/overwrite in local storage
      const infoURL = "https://api.coingecko.com/api/v3/coins/" + id;
      $.ajax({
        url: infoURL,
        beforeSend: function () {
          loading();
        },
        success: function (result) {
          doneLoading();
          const currentPrice = result.market_data.current_price;
          const usd = parseFloat(currentPrice.usd).toFixed(2);
          const eur = parseFloat(currentPrice.eur).toFixed(2);
          const ils = parseFloat(currentPrice.ils).toFixed(2);

          cardtext.append(`
                    <div class="more-info">
                        <img src=${result.image.small}/>
                        <p>Price:
                            <ul>
                                <li>${usd} $</li>
                                <li>${eur} €</li>
                                <li>${ils} ₪</li>
                            </ul>
                        <button class="mt-2 btn btn-dark less-info">Less Info</button>
                    </div>
                `);
          localStorage.setItem(
            id,
            JSON.stringify({
              image: result.image.small,
              usd: usd,
              eur: eur,
              ils: ils,
              timeAdded: clickTime
            })
          );
        }
      });
    }
  });
  // Hide additional coin info
  $("body").on("click", ".less-info", function () {
    $(this)
      .parents(".more-info")
      .siblings(".more-info-button")
      .show();
    $(this)
      .parents(".more-info")
      .html("");
  });

  $("#home").click(function () {
    activeNavbar($(this));
    $("#about-display").hide();
    $("#report-display").hide();
    $("#search-display").html("");
    $("#coin-display").show();
  });

  $("#live-reports").click(function () {
    activeNavbar($(this));
    $("#about-display").hide();
    $("#report-display").show();
    $("#coin-display").hide();
    $("#search-display").html("");
    if (liveReportArray.length > 0) {
      $("#report-display").html("");
      getLiveReports();
    } else {
      $("#report-display").html(
        `
        <h1 class="mt-2">No coins were added to live reports</h1>
        `
      );
    }
  });

  $("#about").click(function () {
    activeNavbar($(this));
    $("#report-display").hide();
    $("#coin-display").hide();
    $("#about-display").show();
    $("#search-display").html("");
  });

  $("#search-button").click(() => {
    //If user input exists
    if ($("#search-input").val()) {
      const searchInput = $("#search-input").val();
      $("li").removeClass("active activeNav");
      $("#search-display").html("");
      $("#report-display").hide();
      $("#about-display").hide();
      $("#search-input").val("");
      $("#coin-display").hide();

      //If coin symbol exists
      if ($(`.${searchInput}`)[0]) {
        $("#search-display").html($(`.${searchInput}`).clone(true));
        $(`.${searchInput}`).show();
      } else {
        $("#coin-display").hide();
        $("#search-display").html(`<h1 class="mt-2">The coin <b><u>${searchInput}</b></u> was not found!<br>Make sure it's written in uppercase and check your spelling</h1>`);
      }
    }
  });

  $("body").on("change", ".toggle", function () {
    // Stop interval to prevent console error on array change
    stopInterval($("body").data("interval"));

    let numOfSelected = $("body").find('input[type="checkbox"]:checked').length;
    let reportCoinId = $(this)
      .parents(".card-title")
      .children("h4")
      .text();
    if (this.checked && numOfSelected <= 5) {
      //Change toggle and add to array
      $("#" + $(this).attr("id")).prop("checked", true);
      liveReportArray.push(reportCoinId);
      $(".modal-body").append(
        `
        <div id="${this.id}-row" class="row justify-content-between mt-2 mb-2">
          <h4 class="float-left ml-2">${$(this)
          .parents(".card-title")
          .siblings("p")
          .text()}</h4>
          <button id=${
        this.id
        }-remove class="btn btn-danger mr-2" type="button">Remove</button>
        </div>
        `
      );
    } else if ($(this).prop("checked", false) && numOfSelected <= 5) {
      //Change toggle and remove from array
      $("#" + $(this).attr("id")).prop("checked", false);
      $(`#${this.id}-row`).remove();
      liveReportArray.splice(liveReportArray.indexOf(reportCoinId), 1);
    }

    if (numOfSelected > 5) {
      //Save coin to jQuery data for global use, prevent toggle from switching on and show modal
      $("body").data("newCoin", this.id);
      $(this).prop("checked", false);
      $("#myModal").modal("show");
    }
  });

  $(".modal-dialog").on("click", ".btn-danger", function () {
    //Get coin from jQuery data
    const newCoinToggleId = $("body").data("newCoin");

    const newCoinName = $(`#${newCoinToggleId}`)
      .parents(".card-title")
      .siblings("p")
      .text();

    const removedToggleId = $(this)
      .attr("id")
      .replace("-remove", "");

    const removedId = $(`#${removedToggleId}`)
      .parents(".card-title")
      .children("h4")
      .text();

    liveReportArray.splice(liveReportArray.indexOf(removedId), 1);

    const newCoinId = $(`#${newCoinToggleId}`)
      .parents(".card-title")
      .children("h4")
      .text();

    liveReportArray.push(newCoinId);

    //Toggle in coin-display div
    $(`#${removedToggleId}`).prop("checked", false);
    $(`#${newCoinToggleId}`).prop("checked", true);
    $("#search-display")
      .find(`#${newCoinToggleId}`)
      .prop("checked", true);
    //If 2 coins have the same symbol - handle them in the search-display div
    if ($("#search-display").children().length > 1) {
      $("#search-display")
        .find(`#${removedToggleId}`)
        .prop("checked", false);
    }
    // Remove coin from modal
    $(this)
      .parent()
      .remove();

    // Add new coin to modal
    $(".modal-body").append(
      `
      <div id="${newCoinToggleId}-row" class="row justify-content-between mt-2 mb-2">
        <h4 class="float-left ml-2">${newCoinName}</h4>
        <button id=${newCoinToggleId}-remove class="btn btn-danger mr-2" type="button">Remove</button>
      </div>
      `
    );
    //Hide modal after adding
    $("#myModal").modal("hide");
  });

  $("#modalCancel").on("click", function () {
    $("#myModal").modal("hide");
  });
});

// Functions

// Show Loading bar
function loading() {
  $(".progress").show();
  $(".container-fluid").css("opacity", "0.2");
}
// Hide loading bar
function doneLoading() {
  $(".progress").hide();
  $(".container-fluid").css("opacity", "1");
}

// Active navbar choice
function activeNavbar(event) {
  $(event).addClass("active activeNav");
  $(event)
    .siblings("li")
    .removeClass("active activeNav");
}

function getLiveReports() {
  $("#report-display").html(
    `
    <div id="chartContainer" style="height: 370px; width: 100%;"></div>
    `
  );
  // Make milliseconds = 0 (precision full seconds)
  let time = new Date().getTime();
  time -= time % 1000;

  var chart = new CanvasJS.Chart("chartContainer", {
    zoomEnabled: true,
    title: {
      text: "Live Reports"
    },
    axisX: {
      valueFormatString: "HH:mm:ss"
    },
    axisY: {
      title: "Coin Value",
      prefix: "$",
      includeZero: false
    },
    toolTip: {
      shared: true
    },

    legend: {
      cursor: "pointer",
      verticalAlign: "top",
      fontSize: 22,
      fontColor: "dimGrey"
    },
    data: [{
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "$####.00",
        xValueFormatString: "HH:mm:ss",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "$####.00",
        xValueFormatString: "HH:mm:ss",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "$####.00",
        xValueFormatString: "HH:mm:ss",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "$####.00",
        xValueFormatString: "HH:mm:ss",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "$####.00",
        xValueFormatString: "HH:mm:ss",
        showInLegend: true,
        dataPoints: []
      }
    ]
  });

  const reportedCoinsString = liveReportArray.join(",");
  const reportURL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${reportedCoinsString}&tsyms=USD`;
  $.ajax({
    url: reportURL,
    beforeSend: function () {
      loading();
    },
    success: function (result) {
      doneLoading();
      liveReportArray.forEach((coin, index) => {
        if (result[coin] !== undefined) {
          chart.options.data[index].dataPoints.push({
            x: time,
            y: result[coin]["USD"],
            name: coin
          });
          chart.options.data[index].legendText = coin;
          chart.render();
        } else {
          //If coin data doesn't exist in API
          chart.options.data[index].dataPoints.push({
            x: time,
            y: "No Data",
            name: coin
          });
          chart.options.data[index].legendText = coin;
          chart.render();
        }
      });
    }
  });
  const myInterval = setInterval(function () {
    $.ajax({
      url: reportURL,
      success: function (result) {
        liveReportArray.forEach((coin, index) => {
          time = new Date().getTime();
          // Make milliseconds = 0 (precision full seconds)
          time -= time % 1000;
          if (result[coin] !== undefined) {
            chart.options.data[index].dataPoints.push({
              x: time,
              y: result[coin]["USD"],
              name: coin
            });
            chart.options.data[index].legendText = coin;
            chart.render();
          } else {
            //If coin data doesn't exist in API
            chart.options.data[index].dataPoints.push({
              x: time,
              y: "No Data",
              name: coin
            });
            chart.options.data[index].legendText = coin;
            chart.render();
          }
        });
      }
    });
  }, 2000);

  //Save interval to data for global access
  $("body").data("interval", myInterval);
}

function stopInterval(interval) {
  clearInterval(interval);
}