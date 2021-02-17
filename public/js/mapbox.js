/* eslint-disable */

export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWpheWdhZGh3YWwxIiwiYSI6ImNrbDR4cGIzNDIxbWcycHFvZTVxaGRiZm4ifQ.1B8Ns3IODjoLoldim_NRMg';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ajaygadhwal1/ckl4zwux93fvd19qo2os23kxh',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 4,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(location => {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(location.coordinates)
            .addTo(map);

        new mapboxgl.Popup({ offset: 30 })
            .setLngLat(location.coordinates)
            .setHTML(`<p>Day ${location.day}: ${location.description} </p>`)
            .addTo(map);

        bounds.extend(location.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};
