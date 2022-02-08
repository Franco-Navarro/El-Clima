// ACTUALIZA LA FECHA DE HOY DE LOS SIGUIENTES 5 DIAS AL CARGAR EL DOM
((d)=>{
    const $todayDate = d.querySelector("#today-date"),
        $dayDate = d.querySelectorAll("#day-date");
    let date = new Date(),
        months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
        actuallyMonth = date.getMonth(),
        actuallyDay = (date.getDate()),
        lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
        i = 1,
        j = 1;

    $todayDate.innerHTML = months[actuallyMonth] + " " + actuallyDay;
    $dayDate.forEach($dayDate => {
        if(actuallyDay + i <= lastDay){
            $dayDate.innerHTML = months[actuallyMonth] + " " + (actuallyDay + i);
            i++;
        }
        else if(actuallyDay + i > lastDay) {
            $dayDate.innerHTML = months[actuallyMonth + 1] + " " + j;
            j++;
        }
        
    });
})(document);

// BUSCA LA GEOLOCALIZACION
function geolocation(){
    navigator.geolocation.getCurrentPosition(async function(position) {
        if (navigator.geolocation) {
            let res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&lang=sp&exclude=minutely,hourly,alerts&units=metric&appid=4d8fb5b93d4af21d66a2948710284366`),
            json = await res.json();
            try {
                let location = json.timezone.split("/")
                searchLocation(location[2]);
            }
            catch(err){
                console.log(err.status)
            }
        }
    });
}

// BARRA DE BUSQUEDA DE CIUDAD
((d)=>{
    const $searchInput = d.querySelector("#search-input"),
    $searchButton = d.querySelector("#search-input-button"),
    $searchLocation = d.querySelector("#location-search");
    // BUSCA LA GEOLOCALIZACION ACTUAL
    $searchLocation.addEventListener("click",()=>{geolocation()})
    // LLAMAN A SEARCHLOCATION PARA BUSCAR LA CIUDAD PEDIDA
    $searchButton.addEventListener("click",()=> searchLocation($searchInput.value));
    $searchInput.addEventListener("keyup", (event)=> {if (event.keyCode === 13) searchLocation($searchInput.value)});
})(document)

// CALCULA LA DIRECCION DEL VIENTO SEGUN LOS GRADOS
function windDirection(direction, speed) {
    let dir = ["N ","NE ","E ","SE ","S ","SO ","O ","NO "],
    sp = speed + "Km";
    if(direction > 337.5 && direction <= 360 || direction >= 0 && direction <= 22.5) {
        return dir[0] + sp
    }
    else if(direction > 22.5 && direction <= 67.5) {
        return dir[1] + sp
    }
    else if(direction > 67.5 && direction <= 112.5) {
        return dir[2] + sp
    }
    else if(direction > 112.5 && direction <= 157.5) {
        return dir[3] + sp
    }
    else if(direction > 157.5 && direction <= 202.5) {
        return dir[4] + sp
    }
    else if(direction > 202.5 && direction <= 247.5) {
        return dir[5] + sp
    }
    else if(direction > 257.5 && direction <= 292.5) {
        return dir[6] + sp
    }
    else if(direction > 292.5 && direction <= 337.5) {
        return dir[7] + sp
    }
}

// CALCULA EL INDICE UV MAX
function uvScale(uv) {
    if(uv < 2) {
        return uv + " Baja";
    }
    else if(uv >= 3 && uv <= 5) {
        return uv + " Moderada"
    }
    else if(uv >= 6 && uv <= 7) {
        return uv + " Alta"
    }
    else if(uv >= 8 && uv <= 10) {
        return uv + " Muy Alta"
    }
    else if(uv >= 11) {
        return uv + " Extremo"
    }
}

// CAMBIA EL COLOR DE FONDO Y LETRA SEGUN EL CLIMA
function background(icon) {
    const $body = document.querySelector(".body");

    if(icon === "01") {
        $body.style.background = "var(--background-clear)";
        $body.classList.remove("dark");
    }
    else if(icon === "02" ) {
        $body.style.background = "var(--background-cloud)";
        $body.classList.remove("dark");
    }
    else if(icon === "03" ||icon === "04"  || icon === "10") {
        $body.style.background = "var(--background-shower)";
        $body.classList.add("dark");
    }
    else if(icon === "09" || icon === "11" || icon === "50") {
        $body.style.background = "var(--background-rain)";
        $body.classList.add("dark");
    }
    else if(icon === "13") {
        $body.style.background = "var(--background-snow)";
        $body.classList.remove("dark");
    }
}

// ACTUALIZA LOS DATOS EN PANTALLA SEGUN LAS CORDENADAS DADAS POR LA FUNCION SEARCHLOCATION
async function updateData(lat,lon) {
    const $todayWeatherImg = document.querySelector("#today-weather-img"),
    $actuallyTemp = document.querySelector("#actually-temp"),
    $todayWeather = document.querySelector("#today-weather"),
    $todayMinMax = document.querySelector("#today-min-max"),
    // DATOS DE LOS PROXIMOS 5 DIAS
    $dayWeatherImg = document.querySelectorAll("#day-weather-img"),
    $dayMinMax = document.querySelectorAll("#day-min-max"),
    // DETALLES DEL DIA DE HOY
    $pressure = document.querySelector("#today-pressure"),
    $humidity = document.querySelector("#today-humidity"),
    $wind = document.querySelector("#today-wind"),
    $uvi = document.querySelector("#today-uvi");

    let res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&lang=sp&exclude=minutely,hourly,alerts&units=metric&appid=4d8fb5b93d4af21d66a2948710284366`),
    json = await res.json(),
    i = 1;
    try {
        if(!res.ok) throw{status:res.status,statusText:res.statusText};
        // Parametros del dia de hoy
        $todayMinMax.innerHTML = `Min ${Math.round(json.daily['0'].temp.min)}º / ${Math.round(json.daily['0'].temp.max)}º Max` ;
        $actuallyTemp.innerHTML = `${Math.round(json.current.temp)}º C`;
        $todayWeatherImg.src = `assets/${json.current.weather[0].icon.slice(0,2)}.svg`;
        $todayWeather.innerHTML = json.current.weather[0].description[0].toUpperCase() + json.current.weather[0].description.slice(1);
        // Mas detalles del dia de hoy
        $pressure.innerHTML = json.current.pressure + " hPa";
        $humidity.innerHTML = json.current.humidity + "%";
        $uvi.innerHTML = uvScale(Math.round(json.current.uvi));
        $wind.innerHTML = windDirection(json.current.wind_deg, json.current.wind_speed);
        // Tarjetas de los proximos 5 dias
        $dayMinMax.forEach($dayMinMax => {
            $dayMinMax.innerHTML = `Min ${Math.round(json.daily[i].temp.min)}º / ${Math.round(json.daily[i].temp.max)}º Max`;
            $dayWeatherImg[i-1].src = `assets/${json.daily[i].weather[0].icon.slice(0,2)}.svg`;
            i++;
        });
        // Actualizacion del fondo
        background(json.current.weather[0].icon.slice(0,2));
    }
    catch(err){
        console.log(err.status);
    }
}

// BUSCA LA CIUDAD PEDIDA Y LLAMA A LA FUNCION UPDATEDATA EN CASO DE ENCOTRARLA
async function searchLocation(name) {
    const $actuallyLocation = document.querySelector("#actually-location"),
    $searchInput = document.querySelector("#search-input"),
    $noLocation = document.querySelector("#no-location");

    let res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${name}&limit=5&appid=4d8fb5b93d4af21d66a2948710284366`),
    json = await res.json();
    try {
        if(!res.ok) throw{status:res.status,statusText:res.statusText};
        if(json[0] === undefined || json === undefined || json[0].local_names.es === undefined){
            $searchInput.value = ""
            $noLocation.classList.remove("hidden");
            setTimeout(()=>{$noLocation.classList.add("hidden");},3000);
        } else{
            updateData(json[0].lat,json[0].lon);
            $searchInput.value = ""
            $searchInput.placeholder = "Buscar Localizacion"
            $actuallyLocation.innerHTML = json[0].local_names.es + " / " +   json[0].country ;
        }
    }
    catch(err){
        console.log(err.status)
    }
}

// BUSCA LA GEOLOCALIZACION AL CARGAR EL DOM
geolocation();