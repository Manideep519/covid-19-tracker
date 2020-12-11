//  apis async functions
let url = 'https://covid19.mathdro.id/api';



async function getData(country) {

    let changableurl = url;

    if (country) {
        changableurl = `${url}/countries/${country}`;
    }

    try {
        const res = await fetch(changableurl);
        const { confirmed, recovered, deaths, lastUpdate } = await res.json();
        return { confirmed, recovered, deaths, lastUpdate }

    } catch (error) {
        console.log("Some error occured in getData() Error: " + error);
    }

}

async function getCountries() {
    const res = await fetch(`${url}/countries`);
    const { countries } = await res.json();
    return countries.map(country => country.name)
}

async function getDailyData() {
    try {
        const res = await fetch(`${url}/daily`);
        const data = await res.json();
        const modifiedData = data.map(({ confirmed, deaths, reportDate: date }) => ({ confirmed: confirmed.total, deaths: deaths.total, date }))

        return modifiedData;

    } catch (error) {
        return error;
    }
}


// callings apis asyn functions
getCountries().then(countriesData => updateCountries(countriesData));
getData().then(casesData => updateCards(casesData));
getDailyData().then(dailyData => updateChart(dailyData, 'line'));


// DOM and HTML update

function handleContryChange(option) {

    getData(option.value).then(casesData => updateCards(casesData));

    if (option.value) {
        getData(option.value).then(casesData => {
            updateChart(casesData, 'bar')
        });
    } else {
        getDailyData().then(dailyData => updateChart(dailyData, 'line'));
    }

}

function updateCountries(data) {
    let list = document.getElementById("list");
    data.map(country => {
        let option = document.createElement("option");
        option.text = country
        option.setAttribute('value', country)
        list.add(option)
    })
}

function updateCards(FetchedData) {

    let confirmed = FetchedData.confirmed.value;
    let recovered = FetchedData.recovered.value;
    let deaths = FetchedData.deaths.value;
    let lastUpdate = FetchedData.lastUpdate;

    let confirmedElement = document.getElementById("confirmed")
    let recoveredElement = document.getElementById("recovered")
    let deathsElement = document.getElementById("deaths")
    let lastUpdateElement = document.getElementsByClassName("lastUpdate");

    confirmedElement.innerHTML = confirmed.toLocaleString();
    recoveredElement.innerHTML = recovered.toLocaleString();
    deathsElement.innerHTML = deaths.toLocaleString();
    [...lastUpdateElement].forEach(Element => {
        Element.innerHTML = new Date(lastUpdate).toDateString();
    })
}


function updateChart(dailyData, type) {

    const chart = document.getElementById('myChart');

    if (type == 'line') {
        var line = new Chart(chart, {
            type: 'line',
            data: {
                labels: dailyData.map(({ date }) => new Date(date).toLocaleDateString()),
                datasets: [{
                    data: dailyData.map((data) => data.confirmed),
                    label: 'Infected',
                    borderColor: '#3333ff',
                    fill: true,
                }, {
                    data: dailyData.map((data) => data.deaths),
                    label: 'Deaths',
                    borderColor: 'red',
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                    fill: true,
                }, ]
            },
            options: {
                // This chart will not respond to mousemove, etc
                events: []
            }
        });

    } else if (type == 'bar') {
        var bar = new Chart(chart, {
            type: 'bar',
            data: {
                labels: ['Infected', 'Recovered', 'Deaths'],
                datasets: [{
                    label: 'People',
                    backgroundColor: ['rgba(0, 0, 255, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(255, 0, 0, 0.5)'],
                    data: [dailyData.confirmed.value, dailyData.recovered.value, dailyData.deaths.value],
                }, ],
            },
            options: {
                legend: { display: false },
                events: []
            }
        });
    }
}