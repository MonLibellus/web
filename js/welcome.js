section1 = document.getElementById('welcome1');
section2 = document.getElementById('welcome2');
section3 = document.getElementById('welcome3');

//On vérifie si le cookie welcome existe, et si il est défini sur passed on envoi un message dans la console
if (document.cookie.indexOf('welcome=passed') != -1) {
    //Redirection vers la page map.html
    window.location.href = "map.html";
} else {
    actualsection = 1;

    nextButtonsList = document.getElementsByClassName('next'); 
    skipButtonsList = document.getElementsByClassName('skip');

    //quand on clique sur un des boutons skip
    for (let i = 0; i < skipButtonsList.length; i++) {
        skipButtonsList[i].addEventListener('click', function() {
            document.cookie = "welcome=passed";

            location.reload();
        });
    }

    section2.style.display = 'none';
    section3.style.display = 'none';

    //quand on clique sur un des boutons next
    for (let i = 0; i < nextButtonsList.length; i++) {
        nextButtonsList[i].addEventListener('click', function() {
            if (actualsection == 1) {
                section1.style.display = 'none';
                section2.style.display = 'block';

                actualsection = 2;
            } else if (actualsection == 2) {
                section2.style.display = 'none';
                section3.style.display = 'block';

                actualsection = 3;
            } else if (actualsection == 3) {
                document.cookie = "welcome=passed";

                location.reload();
            }
        });
    }
}