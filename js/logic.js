let map;
let panorama;
let guessMarker;
let targetMarker;
let allowMarkerSet = true;
let dottedLine;
let sv;
let pointOfOrigin = { lat: -34.60181892162199, lng: -58.44588177394128 };

const winPhrases = [
    "¡La clavaste!",
    "¡Épico!",
    "¡Justo en el blanco!",
    "¡Sos experto en CabaGuesser!",
    "¡Absolutamente preciso!",
    "¡Adivinanza de expertos!",
    "¡Estás a pleno!",
    "¡Impecable!",
];

const closePhrases = [
    "¡No está mal!",
    "¡Por poco!",
    "¡Casi lo tenés!",
    "¡Impresionantemente cerca!",
    "¡Casi la clavás!",
    "¡Te estás acercando!"
];

const farAwayPhrases = [
    "Hay margen de mejora",
    "¡Intento lejano!",
    "¡Seguí explorando!",
    "¡La próxima vez, tal vez!",
    "¡Explorando nuevos horizontes!",
    "Tratá un enfoque diferente la próxima vez"
];

const veryFarAwayPhrases = [
    "¡Estás en otra dimensión!",
    "¿Adivinaste desde la luna?",
    "¡Muy lejos del objetivo!",
    "Es una ciudad grande, ¡seguí buscando!",
    "¡La pifiaste feo!",
    "Nada que ver, ¡seguí intentando!"
];

function adjustLayout() { // Adjust layout on resize
    var map = document.getElementById("map");
    var pano = document.getElementById("pano");

    if (window.innerWidth - (window.innerWidth * 22 / 100) < window.innerHeight) {
        map.style.width = "100%";
        map.style.float = "none";
        pano.style.width = "100%";
        pano.style.float = "none";
        map.style.height = "50%";
        pano.style.height = "50%";
    } else {
        map.style.width = "50%";
        map.style.float = "left";
        pano.style.width = "50%";
        pano.style.float = "left";
        map.style.height = "100%";
        pano.style.height = "100%";
    }
}

function haversineDistance(lat1, lon1, lat2, lon2) { // Calculate kilometer distance between two coordinates
    const R = 6371;
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    return distance;
}

function degToRad(deg) {
    return deg * (Math.PI / 180);
}

function generateRandomFixedCoordMap() {

const landmarks = [
    { lat: -34.54195736583065, lng: -58.4360634310488 },
    { lat: -34.61143532619618, lng: -58.39824998058475 },
    { lat: -34.588182471276866, lng: -58.4536965711264 },
    { lat: -34.607355886910135, lng: -58.41868037737263 },
    { lat: -34.57300723215053, lng: -58.416929836267464 },
    { lat: -34.58258818864084, lng: -58.47946706372144 },
    { lat: -34.62261380330833, lng: -58.3886438137978 },
    { lat: -34.59197475044357, lng: -58.44578039636387 },
    { lat: -34.58477105776043, lng: -58.41076331765551 },
    { lat: -34.60340532070307, lng: -58.41801263558946 },
    { lat: -34.619777792735796, lng: -58.4153193773059 },
    { lat: -34.628469553620384, lng: -58.41988127117157 },
    { lat: -34.63220437833412, lng: -58.43475635276855 },
    { lat: -34.602165951719485, lng: -58.38438943436553 },
    { lat: -34.59602582004414, lng: -58.39137358099236 },
    { lat: -34.60064789939566, lng: -58.39423977852984 },
    { lat: -34.63303910382637, lng: -58.380282813507336 },
    { lat: -34.64281358204076, lng: -58.38967051043283 },
    { lat: -34.638150723201285, lng: -58.411174696940215 },
    { lat: -34.61146321203356, lng: -58.410256574253424 },
    { lat: -34.61476472553586, lng: -58.42861450798497 },
    { lat: -34.607425408780074, lng: -58.37474109326841 },
    { lat: -34.6008132402474, lng: -58.518198377925216 },
    { lat: -34.616105533203424, lng: -58.44049025031336 },
    { lat: -34.648967493097686, lng: -58.377771704910465 },
    { lat: -34.61124242616171, lng: -58.427080096342905 },
    { lat: -34.6121573793927, lng: -58.36803351473128 },
    { lat: -34.597755443080715, lng: -58.42492825891024 },
    { lat: -34.60753720616659, lng: -58.385444256462364 },
    { lat: -34.61784015918677, lng: -58.385809626999944 },
    { lat: -34.6066586901461, lng: -58.386364215955204 }
];

return landmarks[Math.floor(Math.random() * landmarks.length)];
}

function getCityNameByLatLng(latitude, longitude, callback) { // Get city name by coordinates
    var latlng = new google.maps.LatLng(latitude, longitude);
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: latlng }, function (results, status) {
        if (status === "OK") {
            if (results[0]) {
                for (var i = 0; i < results[0].address_components.length; i++) {
                    var types = results[0].address_components[i].types;
                    if (types.includes("locality")) {
                        var city = results[0].address_components[i].long_name;
                        callback(city);
                        return;
                    }
                }
                callback(null); // City not found
            } else {
                callback(null); // No results found
            }
        } else {
            callback(null); // Geocoder failed
        }
    });
}

function getCityCornerCoordinates(centerPoint) { // Get city corner coordinates by city center coordinates
    const distanceToFarthestPoint = google.maps.geometry.spherical.computeDistanceBetween(centerPoint, map.getBounds().getNorthEast());
    const cityRadius = Math.round(distanceToFarthestPoint);

    const cityNorthEast = google.maps.geometry.spherical.computeOffset(centerPoint, cityRadius, 45);
    const citySouthWest = google.maps.geometry.spherical.computeOffset(centerPoint, cityRadius, 225);

    return { northEast: cityNorthEast, southWest: citySouthWest };
}

function initialize() { // Initialize
    document.getElementById("informationButton").onclick = function () {
        window.open("https://louisdev.de", "_blank");
    };

    const cityInput = document.getElementById('cityInput');
    const autocomplete = new google.maps.places.Autocomplete(cityInput);

    autocomplete.setTypes(['(cities)']);
    autocomplete.addListener('place_changed', () => {
        const selectedPlace = autocomplete.getPlace();
        document.getElementById('validityMarkCheck').style.visibility = selectedPlace ? 'visible' : 'hidden';
        if (selectedPlace) {
            cityInput.value = selectedPlace.name;
            const lat = selectedPlace.geometry.location.lat();
            const lng = selectedPlace.geometry.location.lng();

            console.log('Selected City:', selectedPlace.name);
            pointOfOrigin = { lat: lat, lng: lng };
            resetGame();
        }
    });

    cityInput.addEventListener('keydown', (e) => {
        document.getElementById('validityMarkCheck').style.visibility = 'hidden';
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });

    map = new google.maps.Map(document.getElementById("map"), { // Initialize map
        center: pointOfOrigin,
        zoom: 13,
        streetViewControl: false,
        mapId: '46d582f1f0225e32',
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        tilt: 0,
        disableDefaultUI: true
    });

    google.maps.event.addListenerOnce(map, 'idle', function () {
        const coordinates = generateRandomFixedCoordMap();
        sv = new google.maps.StreetViewService();

        panorama = new google.maps.StreetViewPanorama(
            document.getElementById("pano")
        );

        sv.getPanorama({ location: coordinates, radius: 10000 }).then(processSVData);
        panorama.setOptions({
            showRoadLabels: false,
            addressControl: false,
            streetViewControl: false,
            source: google.maps.StreetViewSource.OUTDOOR,
            motionTracking: false,
            motionTrackingControl: false
        });
    });

    $('#introductionModal').modal('show');

    map.addListener("click", (event) => { // Add marker on click
        if (!allowMarkerSet) {
            return;
        }

        const playDropAnimation = !guessMarker;

        if (guessMarker !== null && guessMarker !== undefined) {
            guessMarker.setAnimation(null);
            guessMarker.setMap(null);
        }

        guessMarker = new google.maps.Marker({
            position: event.latLng,
            map,
            title: 'Guess',
            animation: playDropAnimation ? google.maps.Animation.DROP : null,
            draggable: true,
        });
        map.panTo(event.latLng);

        if (playDropAnimation) {
            google.maps.event.addListenerOnce(guessMarker, 'animation_changed', function () {
                guessMarker.setAnimation(google.maps.Animation.BOUNCE);
            });
        }
        if (guessMarker.getAnimation() == null) {
            guessMarker.setAnimation(google.maps.Animation.BOUNCE);
        }
    });
}


function processSVData({ data }) { // Process street view data
    const location = data.location;

    panorama.setPano(location.pano);
    panorama.setPov({
        heading: Math.floor(Math.random() * 360),
        pitch: 0,
    });
    panorama.setVisible(true);
}

function resetGame() { // Reset game
    allowMarkerSet = true;
    if (guessMarker !== null && guessMarker !== undefined) {
        guessMarker.setMap(null);
        guessMarker = null;
    }
    if (dottedLine !== null && dottedLine !== undefined) {
        dottedLine.setMap(null);
        dottedLine = null;
    }
    if (targetMarker !== null && targetMarker !== undefined) {
        targetMarker.setMap(null);
        targetMarker = null;
    }

    map.panTo(pointOfOrigin);
    map.setZoom(14);

    const cornerCoordinates = getCityCornerCoordinates(pointOfOrigin);
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(cornerCoordinates.northEast);
    bounds.extend(cornerCoordinates.southWest);
    map.fitBounds(bounds);
    
    const coordinates = generateRandomFixedCoordMap();
    sv.getPanorama({ location: coordinates, radius: 10000 })
        .then(processSVData)
        .catch((e) =>
            resetGame()
        );;

    document.getElementById("guessBtn").innerHTML = "Intentar!";
}

async function guessBtnClick() { // Guess button click
    let resultModalCenterTitle = document.getElementById("resultModalCenterTitle");
    let resultModalCenterText = document.getElementById("resultModalCenterText");

    if (!guessMarker) { // No marker set
        resultModalCenterTitle.innerHTML = "Oops!😮";
        resultModalCenterText.innerHTML = "Primero tenés que colocar un marcador en el mapa!";
        $('#resultModalCenter').modal('show');
        return;
    }

    if (!allowMarkerSet) { // Reset game
        resetGame();
        return;
    }

    allowMarkerSet = false;
    guessMarker.setAnimation(null);
    guessMarker.setDraggable(false);
    document.getElementById("guessBtn").innerHTML = "Nueva ronda";

    // Draw target marker
    if (targetMarker) {
        targetMarker.setMap(null);
    }
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    const pinBackground = new PinElement({
        background: "#06d102",
        borderColor: "#199140",
        glyphColor: "#199140",
    });
    targetMarker = new AdvancedMarkerElement({
        position: panorama.getPosition(),
        map,
        title: 'Target',
        content: pinBackground.element,
    });

    // Draw dotted line between markers
    const lineSymbol = {
        path: "M 0,-1 0,1",
        strokeOpacity: 1,
        scale: 4,
    };
    dottedLine = new google.maps.Polyline({
        path: [
            { lat: panorama.getPosition().lat(), lng: panorama.getPosition().lng() },
            { lat: guessMarker.getPosition().lat(), lng: guessMarker.getPosition().lng() },
        ],
        strokeColor: "#c0e2fc",
        strokeOpacity: 0,
        icons: [
            {
                icon: lineSymbol,
                offset: "0",
                repeat: "20px",
            },
        ],
        map: map,
    });

    // Zoom out to have both markers in view
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(panorama.getPosition());
    bounds.extend(guessMarker.getPosition());
    map.fitBounds(bounds);


    const distance = haversineDistance(
        panorama.getPosition().lat(),
        panorama.getPosition().lng(),
        guessMarker.getPosition().lat(),
        guessMarker.getPosition().lng()
    ).toFixed(2);

    resultModalCenterText.innerHTML = "Tu intento está a " + distance + " km de distancia!";
    if (distance < 0.05) {
        resultModalCenterTitle.innerHTML = winPhrases[Math.floor(Math.random() * winPhrases.length)] + "🤯";
        resultModalCenterText.innerHTML = "¡Totalmente acertado!";
        startConfetti();
        setTimeout(function () { stopConfetti(); }, 4000);
    } else if (distance < 0.20) {
        resultModalCenterTitle.innerHTML = winPhrases[Math.floor(Math.random() * winPhrases.length)] + "🥳";
        startConfetti();
        setTimeout(function () { stopConfetti(); }, 3000);
    } else if (distance < 1.15) {
        resultModalCenterTitle.innerHTML = closePhrases[Math.floor(Math.random() * closePhrases.length)] + "😎";
    } else if (distance > 3.0) {
        resultModalCenterTitle.innerHTML = veryFarAwayPhrases[Math.floor(Math.random() * veryFarAwayPhrases.length)] + "😞";
    } else {
        resultModalCenterTitle.innerHTML = farAwayPhrases[Math.floor(Math.random() * farAwayPhrases.length)] + "😱";
    }

    $('#resultModalCenter').modal('show');
}

function loadGoogleScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${getGoogleMapsApiKey()}&libraries=places&callback=initialize&v=weekly`;
    script.defer = true;
    document.head.appendChild(script);
}

loadGoogleScript();

window.addEventListener("resize", adjustLayout);
window.addEventListener("load", adjustLayout);
window.initialize = initialize;