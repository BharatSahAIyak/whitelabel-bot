import { toast } from 'react-hot-toast';

export async function recordUserLocation() {
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(saveUserLocation);
    }

    if (
      sessionStorage.getItem('latitude') &&
      sessionStorage.getItem('longitude')
    ) {
      let locationRes: any = await fetch(
        `https://geoip.samagra.io/georev?lat=${sessionStorage.getItem(
          'latitude'
        )}&lon=${sessionStorage.getItem('longitude')}`
      );
      locationRes = await locationRes.json();
      if (locationRes?.district)
        sessionStorage.setItem('city', locationRes.district);
      if (locationRes?.state)
        sessionStorage.setItem('state', locationRes.state);
    }

    let apiRes: any = await fetch('https://api.ipify.org?format=json');

    apiRes = await apiRes.json();

    if (apiRes?.ip) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then(async (res: any) => {
          let locationRes: any = await fetch(
            `https://geoip.samagra.io/city/${apiRes.ip}`
          );
          locationRes = await locationRes.json();
          if (!sessionStorage.getItem('city'))
            sessionStorage.setItem('city', locationRes.city);
          if (!sessionStorage.getItem('state'))
            sessionStorage.setItem('state', locationRes.regionName);
          sessionStorage.setItem('ip', apiRes?.ip);

          if (res.state != 'granted') {
            sessionStorage.setItem('latitude', locationRes.lat);
            sessionStorage.setItem('longitude', locationRes.lon);
          }
        });
    }
  } catch (err) {
    console.log(err);
  }
}

function saveUserLocation(position: any) {
  sessionStorage.setItem('latitude', position.coords.latitude);
  sessionStorage.setItem('longitude', position.coords.longitude);
}
