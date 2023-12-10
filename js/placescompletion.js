mapboxgl.accessToken = 'pk.eyJ1IjoiZWxheGlzYWxleGlzIiwiYSI6ImNrbWtzdzZ1NDE0M2Iyb3FvYmJwc2F2dTcifQ.v2isDFFChFkVvqmGOOj_Rg';

const tripLocationInput = document.getElementById('trip-location-departure');
const suggestionsList = document.getElementById('suggestions-trips-departure');

tripLocationInput.addEventListener('input', function () {
    const query = this.value;

    suggestionsList.innerHTML = '';

    if (query.trim() !== '') {
        const [latitude, longitude] = query.split(',');

        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?country=fr&proximity=2.245299%2C43.605862&types=place%2Caddress%2Cpoi%2Cneighborhood%2Cregion%2Cdistrict&language=fr&access_token=pk.eyJ1IjoiZWxheGlzYWxleGlzIiwiYSI6ImNrbWtzdzZ1NDE0M2Iyb3FvYmJwc2F2dTcifQ.v2isDFFChFkVvqmGOOj_Rg`)
            .then(response => response.json())
            .then(data => {
                const features = data.features;
                let count = 0;
                features.forEach(feature => {
                    if (count <= 5) {
                        const suggestionItem = document.createElement('li');
                        suggestionItem.textContent = feature.place_name;
                        suggestionItem.addEventListener('click', () => {
                            tripLocationInput.value = feature.place_name;
                            suggestionsList.innerHTML = '';
                        });
                        suggestionsList.appendChild(suggestionItem);
                        count++;
                    }
                });
            })
            .catch(error => {
                console.error('Erreur de recherche :', error);
            });
    }
});

const tripLocationInput2 = document.getElementById('trip-location-finish');
const suggestionsList2 = document.getElementById('suggestions-trips-finish');

tripLocationInput2.addEventListener('input', function () {
    const query = this.value;

    suggestionsList2.innerHTML = '';

    if (query.trim() !== '') {
        const [latitude, longitude] = query.split(',');

        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?country=fr&proximity=2.245299%2C43.605862&types=place%2Caddress%2Cpoi%2Cneighborhood%2Cregion%2Cdistrict&language=fr&access_token=pk.eyJ1IjoiZWxheGlzYWxleGlzIiwiYSI6ImNrbWtzdzZ1NDE0M2Iyb3FvYmJwc2F2dTcifQ.v2isDFFChFkVvqmGOOj_Rg`)
            .then(response => response.json())
            .then(data => {
                const features = data.features;
                let count = 0;
                features.forEach(feature => {
                    if (count <= 5) { 
                        const suggestionItem = document.createElement('li');
                        suggestionItem.textContent = feature.place_name;
                        suggestionItem.addEventListener('click', () => {
                            tripLocationInput2.value = feature.place_name;
                            suggestionsList.innerHTML = '';
                        });
                        suggestionsList2.appendChild(suggestionItem);
                        count++;
                    }
                });
            })
            .catch(error => {
                console.error('Erreur de recherche :', error);
            });
    }
});

document.addEventListener('click', function (event) {
    const tripLocationInput = document.getElementById('trip-location-departure');
    const suggestionsList = document.getElementById('suggestions-trips-departure');
    
    const tripLocationInput2 = document.getElementById('trip-location-finish');
    const suggestionsList2 = document.getElementById('suggestions-trips-finish');
    
    //Si il clique sur un des champs, on affiche les suggestions
    if (event.target === tripLocationInput) {
        suggestionsList.style.display = 'block';
        suggestionsList2.style.display = 'none';
    }
    else if (event.target === tripLocationInput2) {
        suggestionsList2.style.display = 'block';
        suggestionsList.style.display = 'none';
    }

    //Si il clique en dehors des champs, on cache les suggestions sÃ©parement et on reset le innerHtml
    else if (event.target !== tripLocationInput) {
        suggestionsList.style.display = 'none';
        suggestionsList2.style.display = 'none';
        suggestionsList.innerHTML = 'Commencez à taper quelque chose';
    }
    else if (event.target !== tripLocationInput2) {
        suggestionsList.style.display = 'none';
        suggestionsList2.style.display = 'none';
        suggestionsList2.innerHTML = 'Commencez à taper quelque chose';
    }
});
