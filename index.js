let countries = new Map();
let eachCountry = new Map();
let countryNameToCode = new Map();
let countryContainer = document.getElementById("countryContainer");
let grid = document.getElementById("grid");
let cityId;
let cityInfo;
let countriesArray = [];
let chartData = new Map();

fetch("https://restcountries.eu/rest/v2/all")
  .then((response) => response.json())
  .then((result) => {
    let countriesWithNeighbours = result.filter((c) => {
      return c.borders.length > 0;
    });
    for (let c of countriesWithNeighbours) {
      let element = document.createElement("option");
      element.textContent = c.name;
      document.querySelector("#countryContainer").appendChild(element);
      countries.set(c.name, c.borders);

      /////*****

      eachCountry.set(c.alpha3Code, c.name);
      countryNameToCode.set(c.name, c.alpha3Code);
    }
    let selectedCountries = JSON.parse(
      sessionStorage.getItem("countriesNames")
    );
    if (selectedCountries !== null) {
      for (let cnt of selectedCountries) {
        addCountry(cnt);
      }
    }
  });

function showCountry(country) {
  let section = document.createElement("section");
  section.setAttribute("id", country);
  grid.appendChild(section);

  let i = document.createElement("i");
  i.setAttribute("class", "far fa-times-circle cross");
  i.addEventListener("click", (e) => {
    removeCountry(country);
    updateChart();
  });
  section.appendChild(i);

  let h1 = document.createElement("h1");
  h1.textContent = country + "  neighbors are:  ";
  section.appendChild(h1);

  let neighbours = countries.get(country);
  for (let c = 0; c < neighbours.length; c++) {
    let nameOutOfCode = eachCountry.get(neighbours[c]);
    let p = document.createElement("p");
    p.textContent = c + 1 + "." + nameOutOfCode;

    let i = document.createElement("i");
    i.setAttribute("class", "fas fa-plus cross " + neighbours[c]);
    if (countriesArray.includes(nameOutOfCode)) {
      i.style.display = "none";
    }
    i.addEventListener("click", (e) => {
      addCountry(nameOutOfCode);
      i.style.display = "none";
      removePlus(neighbours[c]);
      updateChart();
    });
    p.appendChild(i);

    section.appendChild(p);
  }
  document.getElementById("grid").append(section);
}
function removePlus(code) {
  let allCode = document.querySelectorAll("." + code);
  for (let c of allCode) {
    c.style.display = "none";
  }
}

function addPlus(code) {
  let allCode = document.querySelectorAll("." + code);
  for (let c of allCode) {
    c.style.display = "block";
  }
}

let countryBtn = document.getElementById("countryBtn");
countryBtn.addEventListener("click", (e) => {
  let country = countryContainer.value;
  addCountry(country);
});

function addCountry(country) {
  if (countriesArray.includes(country)) {
    return;
  }

  countriesArray.push(country);
  sessionStorage.setItem("countriesNames", JSON.stringify(countriesArray));

  let neighbours = countries.get(country);
  chartData.set(country, neighbours.length);

  if (countriesArray.length > 6) {
    let countryToRemove = countriesArray.shift();
    removeCountry(countryToRemove);
  }

  showCountry(country);
  removePlus(countryNameToCode.get(country));
  updateChart();
}

function removeCountry(country) {
  document.getElementById(country).remove();
  chartData.delete(country);

  let code = countryNameToCode.get(country);
  addPlus(code);

  countriesArray = countriesArray.filter((current) => {
    return country !== current;
  });
  sessionStorage.setItem("countriesNames", JSON.stringify(countriesArray));
}

function updateChart() {
  myChart.data.labels = Array.from(chartData.keys());
  myChart.data.datasets[0].data = Array.from(chartData.values());
  myChart.update();
}

//Get and Delete
function getCities() {
  let cities = document.getElementById("cities");
  cities.innerHTML = "Loading...";

  fetch("https://avancera.app/cities/")
    .then((response) => response.json())
    .then((result) => {
      cities.innerHTML = "";
      for (let n = 0; n < result.length; n++) {
        let elementCity = document.createElement("p");
        elementCity.id = result[n].id;
        elementCity.textContent =
          "City: " +
          result[n].name +
          "_" +
          " Population: " +
          result[n].population;
        cities.appendChild(elementCity);
      }
    });
}

cities.addEventListener("click", (e) => {
  let citySweden = document.querySelectorAll("#cities>p");
  for (let each of citySweden) {
    each.style.color = null;
  }
  e.target.style.color = "tomato";
  cityId = e.target.id;
  console.log(cityId);
});

let citiesBtn = document.getElementById("citiesBtn");
citiesBtn.addEventListener("click", getCities);

let deleteBtn = document.getElementById("deleteBtn");
deleteBtn.addEventListener("click", (e) => {
  fetch("https://avancera.app/cities/" + cityId, {
    method: "DELETE",
  });
  document.getElementById(cityId).remove();
});

//Post
function post() {
  fetch("https://avancera.app/cities/", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name: nameContainer.value,
      population: populationContainer.value,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      getCities();
    });
}
let submitBtn1 = document.getElementById("submitBtn1");

submitBtn1.addEventListener("click", post);

//put
function put() {
  fetch("https://avancera.app/cities/")
    .then((response) => response.json())
    .then((result) => {
      let selected = result.find(
        (city) => city.name === oldCityContainer.value
      );
      console.log(selected);

      if (selected) {
        fetch("https://avancera.app/cities/" + selected.id, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify({
            name: newCityContainer.value,
            population: newPopulationContainer.value,
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            getCities();
          });
      } else {
        alert("No city with this name exists");
      }
    });
}

let submitBtn2 = document.getElementById("submitBtn2");
submitBtn2.addEventListener("click", put);

//chart
var ctx = document.getElementById("myChart");
ctx.height = 50;
var myChart = new Chart(ctx, {
  type: "horizontalBar",
  data: {
    labels: [],
    datasets: [
      {
        label: "# of Borders",
        data: [],
        backgroundColor: [
          "#F28D35",
          "#f27830",
          "#BF472C",
          "#7FC210",
          "#175668",
          "#0E8F94",
        ],
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
      xAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
});
