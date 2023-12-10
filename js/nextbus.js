import { arrets } from './../data/bus.js';
import { lignesDeBus } from './../data/lignes.js'
import { trajetsDeBus } from './../data/trajets.js'

const urlParams = new URLSearchParams(window.location.search);
const arret = urlParams.get('arret');
const date = urlParams.get('date');

document.getElementById("stopForm").value = arret;
document.getElementById("dateForm").value = date;

let retards = [];

async function fetchRetards() {
    try {
        const response = await fetch('https://libellusdata.000webhostapp.com/');
        retards = await response.json();
        console.log('Retards récupérés :', retards);
    } catch (error) {
        console.error('Erreur lors de la récupération des retards :', error);
    }
}

window.addEventListener('load', fetchRetards);

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
        const arretTime = arrets[i].time;

        arretsName.push(getStopName(arretId) + " (" + arretTime + ")");
    }

    return arretsName;
}

function getLineName(ligneId) {
    const ligne = lignesDeBus.find((ligne) => ligne.id === ligneId);

    if (!ligne) {
        console.error(`Ligne avec l'ID ${ligneId} introuvable.`);
        return [];
    }

    return ligne.number;
}

function getLineColor(ligneId) {
    const ligne = lignesDeBus.find((ligne) => ligne.id === ligneId);

    if (!ligne) {
        console.error(`Ligne avec l'ID ${ligneId} introuvable.`);
        return [];
    }

    return ligne.color;
}

function getLastStopTime(trajetId) {
    const trajet = trajetsDeBus.find((trajet) => trajet.id === trajetId);

    if (!trajet) {
        console.error(`Trajet avec l'ID ${trajetId} introuvable.`);
        return false;
    }

    const arrets = trajet.arrets;
    
    if (arrets.length === 0) {
        return false;
    }

    const dernierArret = arrets[arrets.length - 1];
    return dernierArret.time;
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

    var now = new Date();
    // now.setMonth(8);
    // now.setDate(30);
    // now.setHours(9); // utilisÃ© pour tester les horaires de bus
    // now.setMinutes(15);

    if(date) {
        var now = new Date(date);
    }

    console.log('Date actuelle :', now)

    const joursDeLaSemaine = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const jourActuel = joursDeLaSemaine[now.getDay()-1];

    console.log('Jour actuel :', jourActuel);

    const dateTimestamp = new Date(now).getTime();

    const debutPeriodeScolaire = new Date('2023-10-22').getTime();
    const finPeriodeScolaire = new Date('2023-11-7').getTime();

    const startPeriodeScolaire = (dateTimestamp > debutPeriodeScolaire) ? "Started" : "Not started";
    const endPeriodeScolaire = (dateTimestamp < finPeriodeScolaire) ? "Not finished" : "Finished"
    
    const estEnPeriodeScolaire = !(startPeriodeScolaire == "Started" && endPeriodeScolaire == "Not finished")

    console.log(startPeriodeScolaire)

    const trajetsValides = trajetsDesservantArret.filter((trajet) => {
        if(trajet.days_school.includes(jourActuel)) {
            return true;
        } else {
            return false;
        }
        // if(estEnPeriodeScolaire) {
        //     if(trajet.days_working.includes(jourActuel)) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // } else {
        //     if(trajet.holidays_working == true) {
        //         return true;
        //     } else { 
        //         return false;
        //     }
        // }
        
    });

    const heureMinimal = new Date(); //Date actuelle - 10min
        heureMinimal.setHours(now.getHours());
        heureMinimal.setMinutes(now.getMinutes() - 10);

    console.log("Heure minimal d'affichage des bus : ", heureMinimal)

    const prochainsBus = trajetsValides.map((trajet) => {
        const heureDepart = new Date();

        const [heures, minutes] = trajet.arrets.find((arretTrajet) => arretTrajet.arretId === arretId).time.split(':');

        heureDepart.setHours(parseInt(heures));
        heureDepart.setMinutes(parseInt(minutes));

        const arretsDesservis = getAllStopsName(trajet.id);
        const dernierArret = arretsDesservis[arretsDesservis.length - 1];

        if(heureDepart >= heureMinimal) {
            const retard = retards.find((retard) => retard.tripId === trajet.id);

            var retardMinute = 0;
            var ArriveeTerminus = getLastStopTime(trajet.id);

            if (retard) {
                if(parseInt(minutes) + parseInt(retard.late_time) <= 9){
                    let heureTo = new Date();
                    
                    var retardMinute = "0" + (parseInt(minutes) + parseInt(retard.late_time)).toString()

                    let [heuresT, minutesT, secondesT] = getLastStopTime(trajet.id) .split(":").map(Number);

                    heureTo.setHours(heuresT);
                    heureTo.setMinutes(minutesT);
                    heureTo.setSeconds(secondesT);

                    heureTo.setMinutes(addRetardToHeure(heureTo.getHours + ":" + heureTo.getMinutes() + ":" + heureTo.getSeconds(), retard.late_time));

                    console.log(ajouterZero(heureTo.getHours()) + ':' + ajouterZero(heureTo.getMinutes()))

                    var ArriveeTerminus = `${ajouterZero(heureTo.getHours())}:${ajouterZero(heureTo.getMinutes())}:${ajouterZero(heureTo.getSeconds())}`;
                } else {
                    if(parseInt(minutes) + parseInt(retard.late_time) >= 60) {
                        heureDepart.setHours(parseInt(heures) + 1);
                        heureDepart.setMinutes(parseInt(minutes) + parseInt(retard.late_time) - 60);
                    }
                    var retardMinute = parseInt(minutes) + parseInt(retard.late_time)
                }
            }

            return {
                ligneId: trajet.ligneId,
                trajetId: trajet.id,
                ligne: getLineName(trajet.ligneId),
                color: getLineColor(trajet.ligneId),
                heure: retard ? heureDepart.getHours() + ":" + ajouterZero(heureDepart.getMinutes()) + ":00" : heures + ":" + minutes + ":00",
                //heure: retard ? heures + ":" + retardMinute + ":00" : heures + ":" + minutes + ":00",
                heureInitiale: retard ? heures + ":" + minutes + ":00" : heures + ":" + retardMinute + ":00",
                destination: getStopName(trajet.arrets[trajet.arrets.length - 1].arretId),
                heureArriveeTerminus: dernierArret ? ArriveeTerminus : 'N/A',
                retard_time: retard ? retard.late_time : 0,
                retard: retard ? `<strong><i class="fa-solid fa-map-pin"></i> +${retard.late_time} min.</strong>`:'',
                remplisage: retard ? retard.remplissage + '%' : '',
            };
        }
        return null;
    }).filter(Boolean);

    prochainsBus.sort((a, b) => {
        const heureA = parseInt(a.heure.split(':')[0]) * 60 + parseInt(a.heure.split(':')[1]);
        const heureB = parseInt(b.heure.split(':')[0]) * 60 + parseInt(b.heure.split(':')[1]);
        return heureA - heureB;
    });

    return prochainsBus;
}


function getStopName(arretId) {
    const arret = arrets.find((arret) => arret.id === arretId);

    if (!arret) {
        console.error(`Arrêt avec l'ID ${arretId} introuvable.`);
        return [];
    }

    return arret.nom;
}

function trouverLignesDesserviesParArret(arretId) {
    const arret = arrets.find((a) => a.id === arretId);

    if (!arret) {
        console.error(`Arrêt avec l'ID ${arretId} introuvable.`);
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

//On récupère les retards pour l'arrêt avec l'id des paramètres de l'URL
setTimeout(function() {
    if(arret) {
        const busalarret = getProchainsBus(arret, retards);
    
        const lds = trouverLignesDesserviesParArret(arret);
    
        const lignesHTML = lds.map((ligne) =>
            `<a style="background-color: #${ligne.color || '006E2B'}; color: white; padding: 4px; font-size: 14px; text-decoration: bold;">${ligne.number || 'Chrono'}</a>`
        ).join(' ');
    
        const buslist = document.getElementById('nextbus-list');
    
        document.getElementById('stop_title').innerHTML = "Prochains bus à l'arrêt: " + getStopName(arret).charAt(0).toUpperCase() + getStopName(arret).slice(1).toLowerCase();
    
        console.log(busalarret);
        const html = busalarret.map((trajet) =>
            `
            <div class="bus" id="${trajet.trajetId}">
                    <span class="ligne" style="background-color: #${trajet.color}">${trajet.ligne || '<i class="fa-solid fa-stopwatch"></i>'}</span>
    
                    <div class="base">
                        <div class="infos">
                            <span class="destination">${((trajet.heureArriveeTerminus.substring(0, trajet.heureArriveeTerminus.length - 3) == trajet.heure.substring(0, trajet.heure.length - 3)) ? '<i class="fa-solid fa-map-pin"></i> ' + (trajet.destination.charAt(0).toUpperCase() + trajet.destination.slice(1).toLowerCase()).replace('College', 'Clg.').replace('arrivée', '').replace('depart', '') : (trajet.destination.charAt(0).toUpperCase() + trajet.destination.slice(1).toLowerCase()).replace('College', 'Clg.').replace('arrivée', '').replace('depart', ''))}</span>
                            <span class="passage">${addRetardToHeure(trajet.heure.substring(0, trajet.heure.length - 3), trajet.retard_time)}</span>
                        </div>
    
                        <!--<span class="arrival">Heure d'arrivée estimée: <span class="arrivee">${(trajet.heureArriveeTerminus.substring(0, trajet.heureArriveeTerminus.length - 3) == trajet.heure.substring(0, trajet.heure.length - 3)) ? 'Terminus' : addRetardToHeure(trajet.heure, trajet.retard.retard_time)}</span></span>-->
                        <span class="arrival">Heure d'arrivée estimée: <span class="arrivee">${addRetardToHeure(trajet.heureArriveeTerminus, trajet.retard.retard_time)}</span></span>
                        <span>Retard estimé: <span class="retard">(${trajet.retard ? (trajet.retard + ' Prévu: ' + trajet.heureInitiale.substring(0, trajet.heureInitiale.length - 3)) : 'Aucune donnée'})</span></span>
                        <span>Remplissage du bus: <span class="remplissage">${trajet.remplisage || 'Aucune donnée'}</span></span>
                    </div>
                </div>
            `).join(' ') || "<br><br>Aucun service disponible pour cet arrêt aujourd'hui, ou ceux-ci sont tous passés aujourd'hui";
    
        //On ajoute la variable html dans le div nextbus
        buslist.innerHTML = "Lignes deservies par cet arrêt: <br>" + lignesHTML + html;
    }
}, 1500);

var close_popup = document.getElementsByClassName("close")[0];
const busElements = document.getElementsByClassName("bus");
var popup = document.getElementsByClassName("popup")[0];

setTimeout(function() {
    for (let i = 0; i < busElements.length; i++) {
        busElements[i].addEventListener("click", function() {
            const busElement = busElements[i];

            console.log(busElement)

            const busData = {
                id: busElement.id,
                ligne: busElement.querySelector('.ligne').textContent,
                ligneColor: busElement.querySelector('.ligne').style.backgroundColor,
                destination: busElement.querySelector('.destination').textContent,
                heurePassage: busElement.querySelector('.passage').textContent,
                heureArrivee: busElement.querySelector('.arrivee').textContent,
                retard: busElement.querySelector('.retard').textContent.split(" min")[0].substring(3, 5)
            };

            const date_heureArrivee = new Date();
            let [hArrivee, mArrivee, sArrivee] = busData.heureArrivee.split(":");
            date_heureArrivee.setHours(hArrivee);
            date_heureArrivee.setMinutes(mArrivee);

            const maintenant = new Date();
            maintenant.setMinutes(maintenant.getMinutes());

            const heureMax = new Date();
            heureMax.setHours(date_heureArrivee.getHours());
            heureMax.setMinutes(date_heureArrivee.getMinutes() + 60);

            if(maintenant <= heureMax && date_heureArrivee < heureMax) {
                console.info("Le trajet séléctionné est encore valide.");
            } else {
                console.info("Le trajet séléctionné n'est plus valide.")
                document.getElementById("share-infos").innerHTML = "<hr>Il n'est plus possible d'ajouter un retard ou de modifier le remplissage du bus pour ce trajet.";
            }

            document.getElementById("infosbus").style.display = "block";
            
            document.getElementById("trajet").innerHTML = busData.id;

            document.getElementById("infosbus").querySelector('.ligne').innerHTML = busData.ligne || '<i class="fa-solid fa-stopwatch"></i>';
            document.getElementById("infosbus").querySelector('.ligne').style.backgroundColor = busData.ligneColor;
            document.getElementById("infosbus").querySelector('.destination').innerHTML = busData.destination;
            document.getElementById("infosbus").querySelector('.passage').innerHTML = busData.heurePassage;
            document.getElementById("infosbus").querySelector('.arrivee').innerHTML = busData.heureArrivee;
            document.getElementById("infosbus").querySelector('.retard').innerHTML = "Aucune donnée";
            document.getElementById("infosbus").querySelector('.remplissage').innerHTML = "Aucune donnée";

            document.getElementById("stopList").innerHTML = genererContenuArrets(busData.id, parseInt(busData.retard), arret);
        });
    }
}, 1500)

close_popup.onclick = function() {
    document.getElementsByClassName("popup")[0].style.display = "none";
}

window.onclick = function(event) {
    if (event.target == popup) {
        popup.style.display = "none";
    }
}

function ajouterZero(number) {
    return number < 10 ? "0" + number : number;
}

function genererContenuArrets(trajet, retard, arretActuel) {
    let contenu = "<ul>";
    trajetsDeBus.forEach(async (arret) => {
        if(arret.id == trajet) {
            for(let i=0; i < arret.arrets.length; i++) {
                let [heures, minutes, seconds] = arret.arrets[i].time.split(":");
                minutes = retard ? ajouterZero(parseInt(ajouterZero(minutes)) + parseInt(ajouterZero(retard))) : (minutes);
                if(minutes >= 60){
                    minutes = ajouterZero(minutes-60);
                    heures = parseInt(heures)+1;
                }

                contenu += (arret.arrets[i].arretId == arretActuel) ? `<li><b>${getStopName(arret.arrets[i].arretId)} - ${heures}:${minutes}</b> (Votre arrêt)</li>` : `<li>${getStopName(arret.arrets[i].arretId)} - ${heures}:${minutes}</li>`;
            }
        }
    });
    return contenu + "</ul>";
}

function addRetardToHeure(heure, retard) {
    let [heures, minutes, seconds] = heure.split(":");
    minutes = retard ? ajouterZero(parseInt(ajouterZero(minutes)) + parseInt(ajouterZero(retard))) : (minutes);
                
    if(minutes >= 60){
        minutes = ajouterZero(minutes-60);
        heures = parseInt(heures)+1;
    }

    return heures + ":" + minutes;
}