//     __  __             _      _ _          _ _           
//    |  \/  |           | |    (_) |        | | |          
//    | \  / | ___  _ __ | |     _| |__   ___| | |_   _ ___ 
//    | |\/| |/ _ \| '_ \| |    | | '_ \ / _ \ | | | | / __|
//    | |  | | (_) | | | | |____| | |_) |  __/ | | |_| \__ \
//    |_|  |_|\___/|_| |_|______|_|_.__/ \___|_|_|\__,_|___/
//
//                   Alexis-Rarchaert.fr
//              © 2023 Touts droits réservés                                                   


//Importation des fichiers JS
import { arrets } from './../data/bus.js';
import { lignesDeBus } from './../data/lignes.js'
import { trajetsDeBus } from './../data/trajets.js'

mapboxgl.accessToken = 'pk.eyJ1IjoiZWxheGlzYWxleGlzIiwiYSI6ImNrbWtzdzZ1NDE0M2Iyb3FvYmJwc2F2dTcifQ.v2isDFFChFkVvqmGOOj_Rg';

var map = new mapboxgl.Map({
    container: 'map',
    zoom: 15,
    style: 'mapbox://styles/elaxisalexis/clmf839na01h201pf7ybs9hah',
    center: [2.241129, 43.605381]
});

function trouverLignesDesserviesParArret(arretId) {
    const arret = arrets.find((a) => a.id === arretId);

    if (!arret) {
        console.error(`ArrÃªt avec l'ID ${arretId} introuvable.`);
        return [];
    }

    const arretIdAvecPrefixe = arretId;

    const lignesDesservies = [];

    trajetsDeBus.forEach((trajet) => {
        const arretslength = trajet.arrets.length;

        for(let i = 0; i < arretslength; i++) {
            if (trajet.arrets[i].arretId === arretIdAvecPrefixe) {
                const ligneCorrespondante = lignesDeBus.find((ligne) => ligne.id === trajet.ligneId);

                if (ligneCorrespondante) {
                    lignesDesservies.push(ligneCorrespondante);
                } else {
                    console.error(`Ligne avec l'ID ${trajet.ligneId} introuvable.`);
                }
            } 
        }

    });

    var unique = lignesDesservies.filter((x, i) => lignesDesservies.indexOf(x) === i);
    unique.sort((a, b) => a.number - b.number);
    return unique;
}

let retards = [];

async function fetchRetards() {
    try {
        const response = await fetch('https://libellusdata.000webhostapp.com/');
        retards = await response.json();
        console.log('Retards rÃ©cupÃ©rÃ©s :', retards);
    } catch (error) {
        console.error('Erreur lors de la rÃ©cupÃ©ration des retards :', error);
    }
}

window.addEventListener('load', fetchRetards);

arrets.forEach(function (arret) {
    setTimeout(function () {
        const lds = trouverLignesDesserviesParArret(arret.id);

        const lignesHTML = lds.map((ligne) =>
            `<a href="?showligne=${ligne.id || "zenbus:Line:834470001:LOC"}" style="background-color: #${ligne.color || '006E2B'}; color: white; padding: 4px; font-size: 14px; text-decoration: bold;">${ligne.number || 'Chrono'}</a>`
        ).join(', ');

        const prochainsBus = getProchainsBus(arret.id, retards);

        const busHTML = prochainsBus.map((bus) =>
            `<a style="display: block; margin: 2px; background-color: #${lignesDeBus.find((ligne) => ligne.id === bus.ligneId).color || '006E2B'}; color: white; padding: 4px; font-size: 14px; text-decoration: bold;">
                <strong><span style="font-family: Arial;">${bus.heure}</span> | ${lignesDeBus.find((ligne) => ligne.id === bus.ligneId).number || '<i class="fa-solid fa-stopwatch"></i>'} - Dest. ${bus.destination}</strong>             
            </a>`
        ).join('') || "Aucun bus aujourd'hui";

        var el = document.createElement('div');
        el.innerHTML = '<div style="text-align: center;"><img src="https://static-00.iconduck.com/assets.00/bus-icon-223x256-2e0yfshu.png" alt="bus icon" style="width: 14px; height: 16px; display: block; margin-left: auto; margin-right: auto;"><p style="text-align: center;">' + arret.nom + '</p></div>';

        new mapboxgl.Marker(el)
            .setLngLat([arret.coordonnees[1], arret.coordonnees[0]])
            .setPopup(new mapboxgl.Popup().setHTML(`
                <strong style="font-size: 120%;">Arrêt: ${arret.nom}</strong><br>
                <a href="nextbus.html?arret=${arret.id}" style="background: green; padding: 7px; color: white; border-radius: 5px; border: none; margin-top: 15px;">Voir les prochains bus</a><br><br>
                <strong>Lignes desservies :</strong><br> ${lignesHTML}<br><br>
                <!--<strong>Prochain(s) bus :</strong><br> ${busHTML}-->`))
            .addTo(map);
    }, 1500);
});

const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');

function searchArrets(query) {
    return arrets.filter(arret => arret.nom.toLowerCase().includes(query.toLowerCase()));
}

function displaySuggestions(arr) {
    suggestions.innerHTML = '';
    const maxSuggestions = 5;
    for (let i = 0; i < Math.min(maxSuggestions, arr.length); i++) {
        const li = document.createElement('li');
        li.textContent = arr[i].nom;
        li.addEventListener('click', () => {
            zoomToArret(arr[i]);
            searchInput.value = '';
            suggestions.style.display = 'none';
        });
        suggestions.appendChild(li);
    }
}

function zoomToArret(arret) {
    map.flyTo({
        center: [arret.coordonnees[1], arret.coordonnees[0]],
        zoom: 20,
    });
}

searchInput.addEventListener('input', function () {
    const query = this.value;
    const matchingArrets = searchArrets(query);
    displaySuggestions(matchingArrets);

    if (query.trim() === '') {
        suggestions.style.display = 'none';
    } else {
        suggestions.style.display = 'block';
    }
});

async function getRouteCoordinates(coordinates) {
    const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates.join(';')}?geometries=geojson&access_token=${mapboxgl.accessToken}`);
    const data = await response.json();
    return data.routes[0].geometry.coordinates;
}

var coordonneesAller = [];
var coordonneesRetour = [];

async function afficherAllerRetourLigne(ligneId) {
    const ligneSpecifique = lignesDeBus.find(ligne => ligne.id === ligneId);

    if (ligneSpecifique) {
        const arretsDeLaLigne = ligneSpecifique.arrets;
        const coordonneesAller = [];

        for (let index = 0; index < arretsDeLaLigne.length - 1; index++) {
            const arretId = arretsDeLaLigne[index];
            const arret = arrets.find(a => a.id === arretId);
            const arretSuivantId = arretsDeLaLigne[index + 1];
            const arretSuivant = arrets.find(a => a.id === arretSuivantId);

            if (arret && arretSuivant) {
                const coordonneesArrÃªtActuel = [arret.coordonnees[1], arret.coordonnees[0]];
                const coordonneesArrÃªtSuivant = [arretSuivant.coordonnees[1], arretSuivant.coordonnees[0]];

                const directions = await getDirections(
                    coordonneesArrÃªtActuel,
                    coordonneesArrÃªtSuivant
                );

                coordonneesAller.push(...directions.routes[0].geometry.coordinates);
            } else {
                console.error(`ArrÃªt avec l'ID ${arretId} ou ${arretSuivantId} introuvable.`);
            }
        }

        map.addSource('aller-source', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordonneesAller
                }
            }
        });

        map.addLayer({
            id: 'aller-layer',
            type: 'line',
            source: 'aller-source',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': 'blue',
                'line-width': 4
            }
        });
    }
}

// Fonction pour obtenir le trajet entre deux points
async function getDirections(start, end) {
    const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start.join(',')};${end.join(',')}?alternatives=true&access_token=${mapboxgl.accessToken}&geometries=geojson&language=fr`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    const data = await response.json();
    return data;
}

//Trajet à pied
async function getDirectionsAPied(start, end) {
    const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start.join(',')};${end.join(',')}?alternatives=true&access_token=${mapboxgl.accessToken}&geometries=geojson&language=fr`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    const data = await response.json();
    return data;
}

map.on("style.load", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const ligneId = urlParams.get("showligne");



    if (ligneId) {
        afficherAllerRetourLigne(ligneId);
    }
});

const tripForm = document.getElementById('trip-form');

tripForm.addEventListener('submit', async function (event) {
    //On cache les champs de suggestion
    const suggestionsList = document.getElementById('suggestions-trips-departure');
    const suggestionsList2 = document.getElementById('suggestions-trips-finish');
    suggestionsList.style.display = 'none';
    suggestionsList2.style.display = 'none';

    event.preventDefault(); // EmpÃªche l'envoi du formulaire par dÃ©faut

    const tripLocationDepartureInput = document.getElementById('trip-location-departure');
    const tripLocationFinishInput = document.getElementById('trip-location-finish');

    const departureCoordinates = await geocodeAddress(tripLocationDepartureInput.value);
    const destinationCoordinates = await geocodeAddress(tripLocationFinishInput.value);

    if (departureCoordinates && destinationCoordinates) {
        // Utilisez departureCoordinates et destinationCoordinates comme vous le souhaitez, par exemple, pour effectuer une recherche ou un calcul.
        console.log('CoordonnÃ©es de dÃ©part :', departureCoordinates);
        console.log('CoordonnÃ©es de destination :', destinationCoordinates);
        //Supprimer les marqueurs précédents
        map.removeLayer('departure-marker');
        map.removeLayer('destination-marker');

        //Maintenant, ajouter un marqueur vert pour les coordonnÃ©es de dÃ©part et un marqueur rouge pour les coordonnÃ©es de destination
        const departureMarker = new mapboxgl.Marker({ color: 'green' })

            .setLngLat([departureCoordinates.longitude, departureCoordinates.latitude])
            .addTo(map);
        departureMarker.id = 'departure-marker';

        const destinationMarker = new mapboxgl.Marker({ color: 'red' })
            .setLngLat([destinationCoordinates.longitude, destinationCoordinates.latitude])
            .addTo(map);
        destinationMarker.id = 'destination-marker';

        //On zoom au millieu des 2 marqueurs
        map.fitBounds([
            [departureCoordinates.longitude, departureCoordinates.latitude],
            [destinationCoordinates.longitude, destinationCoordinates.latitude]
        ], {
            padding: 100
        });

        //On recherche l'arrêt le plus proche de l'adresse donnée, car les input retournent une adresse et non un id d'arrêt
        //Ensuite, on va rechercher les lignes en commun avec les deux arrêts, si on ne trouve pas, on prend le deuxieme arrêt le plus proche du point de départ.

        var arretDepart = await getNearestArret(departureCoordinates);
        const arretDestination = await getNearestArret(destinationCoordinates);

        const lignesDesservantArretDepart = trouverLignesDesserviesParArret(arretDepart.id);
        const lignesDesservantArretDestination = trouverLignesDesserviesParArret(arretDestination.id);

        const lignesEnCommun = lignesDesservantArretDepart.filter((ligne) => lignesDesservantArretDestination.includes(ligne));

        if (lignesEnCommun.length > 0) {
            console.log('Lignes en commun :', lignesEnCommun);
        } else {
            var arretDepart = await getSecondNearestArret(departureCoordinates, arretDepart.id);

            const lignesDesservantArretDepart2 = trouverLignesDesserviesParArret(arretDepart.id);

            const lignesEnCommun2 = lignesDesservantArretDepart2.filter((ligne) => lignesDesservantArretDestination.includes(ligne));

            if (lignesEnCommun2.length > 0) {
                console.log('Lignes en commun :', lignesEnCommun2);
            } else {
                console.log('Aucune ligne en commun.');
            }
        }

        //On envoi dans la console l'arrêt de départ et d'arrivée choisis (Arrêt 1 ou 2 pour le départ)
        console.log('Arrêt de départ :', arretDepart);
        console.log('Arrêt de destination :', arretDestination);

        //Ensuite, on recherche les prochains trajets qui passent par le départ et passent ensuite à la destination
        const trajetsDesservantArretDepart = trajetsDeBus.filter((trajet) => {
            return trajet.arrets.some((arret) => arret.arretId === arretDepart.id);
        });

        const trajetsDesservantArretDestination = trajetsDeBus.filter((trajet) => {
            return trajet.arrets.some((arret) => arret.arretId === arretDestination.id);
        });

        //On vérifie dans le trajet, que l'arrêt de départ est avant l'arrêt de destination
        const trajetsDesservantArretDepartEtDestination = trajetsDesservantArretDepart.filter((trajet) => {
            const arretDepartIndex = trajet.arrets.findIndex((arret) => arret.arretId === arretDepart.id);
            const arretDestinationIndex = trajet.arrets.findIndex((arret) => arret.arretId === arretDestination.id);

            return arretDepartIndex < arretDestinationIndex;
        });

        //On affiche les trajets dans la console
        console.log('Trajets desservant l\'arrêt de départ :', trajetsDesservantArretDepart);
        console.log('Trajets desservant l\'arrêt de destination :', trajetsDesservantArretDestination);
        console.log('Trajets desservant l\'arrêt de départ et de destination :', trajetsDesservantArretDepartEtDestination);

        //On affiche dans la console les prochains trajets qui mènent à la destination en fonction de l'heure actuelle:
        const now = new Date();
        now.setHours(7); // utilisÃ© pour tester les horaires de bus
        now.setMinutes(12);

        //On lit la variable trajetsDesservantArretDepartEtDestination et on compare les heures de départ avec l'heure actuelle pour les trier dans l'ordre croissant et ne pas afficher les trajets déjà passés
        const prochainsBus = trajetsDesservantArretDepartEtDestination.map((trajet) => {

            const heureDepart = new Date();
            const heureActuelle = now.getHours();
            const minuteActuelle = now.getMinutes();

            const [heures, minutes] = trajet.arrets.find((arretTrajet) => arretTrajet.arretId === arretDepart.id).time.split(':');

            heureDepart.setHours(parseInt(heures));
            heureDepart.setMinutes(parseInt(minutes));

            if (parseInt(heures) >= heureActuelle && parseInt(minutes) >= (parseInt(minuteActuelle) - 5)) {
                //Return l'Id de la ligne, le nom de la ligne, l'id du trajet, l'heure de départ, l'heure d'arrivée, l'arrêt de départ, l'arrêt de destination
                return {
                    ligneId: trajet.ligneId,
                    ligneNom: lignesDeBus.find((ligne) => ligne.id === trajet.ligneId).number,
                    trajetId: trajet.id,
                    heureDepart: heures + ":" + minutes + ":00",
                    heureArrivee: trajet.arrets.find((arretTrajet) => arretTrajet.arretId === arretDestination.id).time,
                    arretDepart: arretDepart.nom,
                    arretDestination: arretDestination.nom
                };
            }
            return null;
        }
        ).filter(Boolean);

        console.table(prochainsBus);
    }
});

function getNearestArret(coordinates) {
    const distances = arrets.map((arret) => {
        return {
            arretId: arret.id,
            distance: distance(coordinates.latitude, coordinates.longitude, arret.coordonnees[0], arret.coordonnees[1])
        };
    }
    );

    distances.sort((a, b) => a.distance - b.distance);

    return arrets.find((arret) => arret.id === distances[0].arretId);
}

function getSecondNearestArret(coordinates, arretId) {
    const distances = arrets.map((arret) => {
        return {
            arretId: arret.id,
            distance: distance(coordinates.latitude, coordinates.longitude, arret.coordonnees[0], arret.coordonnees[1])
        };
    }
    );

    distances.sort((a, b) => a.distance - b.distance);

    return arrets.find((arret) => arret.id === distances[1].arretId);
}

function distance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

//fonction pour obtenir les coordonnées GPS d'un emplacement
async function geocodeAddress(address) {
    try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${mapboxgl.accessToken}&country=FR`);
        const data = await response.json();
        const [longitude, latitude] = data.features[0].center;
        return { latitude, longitude };
    } catch (error) {
        console.error('Erreur de gÃ©ocodage :', error);
        return null;
    }
}

function getProchainsBus(arretId, retards) {
    const arret = arrets.find((a) => a.id === arretId);

    if (!arret) {
        console.error(`ArrÃªt avec l'ID ${arretId} introuvable.`);
        return [];
    }

    const trajetsDesservantArret = trajetsDeBus.filter((trajet) => {
        return trajet.arrets.some((arret) => arret.arretId === arretId);
    });

    const now = new Date();
    // now.setHours(19); // utilisÃ© pour tester les horaires de bus
    // now.setMinutes(12);

    const joursDeLaSemaine = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const jourActuel = joursDeLaSemaine[now.getDay()-1];

    console.log('Jour actuel :', jourActuel);

    const trajetsValides = trajetsDesservantArret.filter((trajet) => {
        if (trajet.days_school.includes(jourActuel)) {
            return true;
        }
        return false;
    });

    const prochainsBus = trajetsValides.map((trajet) => {
        const heureDepart = new Date();
        const heureActuelle = now.getHours();
        const minuteActuelle = now.getMinutes();
        
        const [heures, minutes] = trajet.arrets.find((arretTrajet) => arretTrajet.arretId === arretId).time.split(':');

        heureDepart.setHours(parseInt(heures));
        heureDepart.setMinutes(parseInt(minutes));

        if (parseInt(heures) >= heureActuelle && parseInt(minutes) >= (parseInt(minuteActuelle) - 5)) {
            const retard = retards.find((retard) => retard.tripId === trajet.id);

            if (retard) {
                console.log(heures + parseInt(retard.late_time));
            }

            return {
                ligneId: trajet.ligneId,
                trajetId: trajet.id,
                heure: retard ? heures + ":" + (parseInt(minutes) + parseInt(retard.late_time)) + ":00" : heures + ":" + minutes + ":00",
                destination: getStopName(trajet.arrets[trajet.arrets.length - 1].arretId),
                retard: retard ? `<strong><i class="fa-solid fa-hourglass-end"></i> +${retard.late_time}min ${retard.late_reason == "Inconnu" ? "" : "(" + retard.late_reason + ")" }</strong>`:''
            };
        }
        return null;
    }).filter(Boolean);

    prochainsBus.sort((a, b) => {
        const heureA = parseInt(a.heure.split(':')[0]) * 60 + parseInt(a.heure.split(':')[1]);
        const heureB = parseInt(b.heure.split(':')[0]) * 60 + parseInt(b.heure.split(':')[1]);
        return heureA - heureB;
    });

    const cinqProchainsBus = prochainsBus.slice(0, 7);

    return cinqProchainsBus;
}

//Fonction qui permet d'obtenir le nom de tout les arrÃªts d'un trajet, recherche par son id, dans le fichier trajetsDeBus
function getAllStopsName(trajetId) {
    const trajet = trajetsDeBus.find((trajet) => trajet.id === trajetId);

    if (!trajet) {
        console.error(`Trajet avec l'ID ${trajetId} introuvable.`);
        return [];
    }

    const arrets = trajet.arrets;

    const arretsName = [];

    for(let i = 0; i < arrets.length; i++) {
        const arretId = arrets[i].arretId;

        arretsName.push(getStopName(arretId));
    }

    return arretsName;
}

function getStopName(arretId) {
    const arret = arrets.find((arret) => arret.id === arretId);

    if (!arret) {
        console.error(`ArrÃªt avec l'ID ${arretId} introuvable.`);
        return [];
    }

    return arret.nom;
}

//Fonction qui permet d'obtenir l'arrÃªt final d'un trajet grÃ¢ce Ã  l'id du trajet.
function getFinalArret(trajetId) {
    const trajet = trajetsDeBus.find((trajet) => trajet.id === trajetId);

    if (!trajet) {
        console.error(`Trajet avec l'ID ${trajetId} introuvable.`);
        return [];
    }

    const arretId = trajet.arrets[(trajet.arrets.length) - 1].arretId;

    const arret = arrets.find((arret) => arret.id === arretId);

    if (!arret) {
        console.error(`ArrÃªt avec l'ID ${arretId} introuvable.`);
        return [];
    }

    return arret.nom;
}

//fonction qui permet d'afficher un point rouge sur la carte
function showPosition(position) {
    const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([position.coords.longitude, position.coords.latitude])
        .addTo(map);

    map.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom: 15,
    });
}