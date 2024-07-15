export async function recordUserLocation() {
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          localStorage.setItem('latitude', String(position.coords.latitude));
          localStorage.setItem('longitude', String(position.coords.longitude));
          let locationRes: any = await fetch(
            `https://geoip.samagra.io/georev?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          locationRes = await locationRes.json();
          if (locationRes?.subDistrict) localStorage.setItem('block', locationRes.subDistrict);
          if (locationRes?.district) localStorage.setItem('city', locationRes.district);
          if (locationRes?.state) localStorage.setItem('state', locationRes.state);
          let apiRes: any = await fetch('https://api.ipify.org?format=json');

          apiRes = await apiRes.json();

          if (apiRes?.ip) {
            let locationRes: any = await fetch(`https://geoip.samagra.io/city/${apiRes.ip}`);
            locationRes = await locationRes.json();
            localStorage.setItem('ip', apiRes?.ip);
          }
        },
        async (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            let apiRes: any = await fetch('https://api.ipify.org?format=json');

            apiRes = await apiRes.json();

            if (apiRes?.ip) {
              let locationRes: any = await fetch(`https://geoip.samagra.io/city/${apiRes.ip}`);
              locationRes = await locationRes.json();
              localStorage.setItem('ip', apiRes?.ip);
              if (!localStorage.getItem('city')) localStorage.setItem('city', locationRes.city);
              if (!localStorage.getItem('state'))
                localStorage.setItem('state', locationRes.regionName);
              localStorage.setItem('latitude', locationRes.lat);
              localStorage.setItem('longitude', locationRes.lon);
            }
          } else {
            let apiRes: any = await fetch('https://api.ipify.org?format=json');

            apiRes = await apiRes.json();

            if (apiRes?.ip) {
              let locationRes: any = await fetch(`https://geoip.samagra.io/city/${apiRes.ip}`);
              locationRes = await locationRes.json();
              if (!localStorage.getItem('city')) localStorage.setItem('city', locationRes.city);
              if (!localStorage.getItem('state'))
                localStorage.setItem('state', locationRes.regionName);
              localStorage.setItem('ip', apiRes?.ip);
              localStorage.setItem('latitude', locationRes.lat);
              localStorage.setItem('longitude', locationRes.lon);
            }
            console.error('Error occurred while getting location:', error);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
}
