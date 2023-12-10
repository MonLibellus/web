const range = document.getElementById("remplissageRange");
const estrange = document.getElementsByClassName("est")[0];

range.addEventListener("change", function() {
    estrange.innerHTML = "Est. " + range.value + " %"
})

const yes = document.getElementById("yes");
const no = document.getElementById("no");
const input = document.getElementById("late");

yes.addEventListener("click", function() {
    const classes = yes.className;

    if(classes == "inactive") {
        yes.classList.remove("inactive");
        yes.classList.add("active");
        no.classList.remove("active");
        no.classList.add("inactive");

        input.style.display = "block";
    }
})

no.addEventListener("click", function() {
    const classes = no.className;

    if(classes == "inactive") {
        no.classList.remove("inactive");
        no.classList.add("active");
        yes.classList.remove("active");
        yes.classList.add("inactive");

        input.style.display = "none";
    }
});

function envoyerSignalement() {
    const trajet = document.getElementById("trajet").innerHTML;
    const latetime = document.getElementById("late").value;
    const ligne = document.getElementsByClassName("ligne")[0].innerHTML;
    const remplissage = range.value;

    if(latetime < 2 && latetime >= 60 || latetime == "") {
        alert("Veuillez vérifier les champs entrés.\nTemps de retard, compris entre 2 et 60 minutes")
    }
    
    console.log("Trajet: " + trajet);
    console.log("Retard estimé: " + latetime);
    console.log("Remplissage: " + remplissage + " %")
    console.log("Ligne: " + ligne)

    const url = `https://libellusdata.000webhostapp.com/addretard?trajetId=${trajet}&retard_minutes=${latetime}&remplissage=${remplissage}&ligne=${ligne}`;
    console.log(url)

    fetch(url, {
        mode: 'no-cors'
    })
    .then(alert("Signalement envoyé, merci pour votre contribution :p"));
    location.reload();
}