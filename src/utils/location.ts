export async function recordUserLocation() {
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(saveUserLocation);
    }

    if (localStorage.getItem('latitude') && localStorage.getItem('longitude')) {
      let locationRes: any = await fetch(
        `https://geoip.samagra.io/georev?lat=${localStorage.getItem('latitude')}&lon=${localStorage.getItem('longitude')}`
      );
      locationRes = await locationRes.json();
      if (locationRes?.district) localStorage.setItem('city', locationRes.district);
      if (locationRes?.state) localStorage.setItem('state', locationRes.state);
    }

    let apiRes: any = await fetch('https://api.ipify.org?format=json');

    apiRes = await apiRes.json();

    if (apiRes?.ip) {
      navigator.permissions.query({ name: 'geolocation' }).then(async (res: any) => {
        let locationRes: any = await fetch(`https://geoip.samagra.io/city/${apiRes.ip}`);
        locationRes = await locationRes.json();
        if (!localStorage.getItem('city')) localStorage.setItem('city', locationRes.city);
        if (!localStorage.getItem('state')) localStorage.setItem('state', locationRes.regionName);
        localStorage.setItem('ip', apiRes?.ip);

        if (res.state != 'granted') {
          localStorage.setItem('latitude', locationRes.lat);
          localStorage.setItem('longitude', locationRes.lon);
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
}

function saveUserLocation(position: any) {
  console.log('position', position);
  localStorage.setItem('latitude', position.coords.latitude);
  localStorage.setItem('longitude', position.coords.longitude);
}
