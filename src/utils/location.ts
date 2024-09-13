export async function recordUserLocation() {
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          sessionStorage.removeItem('location_error');
          sessionStorage.setItem('latitude', String(position.coords.latitude));
          sessionStorage.setItem('longitude', String(position.coords.longitude));
          let locationRes: any = await fetch(
            `https://geoip.samagra.io/georev?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          locationRes = await locationRes.json();
          if (locationRes?.subDistrict) sessionStorage.setItem('block', locationRes.subDistrict);
          if (locationRes?.district) sessionStorage.setItem('city', locationRes.district);
          if (locationRes?.state) sessionStorage.setItem('state', locationRes.state);
          let apiRes: any = await fetch('https://ip-retriever-production.up.railway.app/');
          apiRes = await apiRes.text();
          if (apiRes) {
            let locationRes: any = await fetch(`https://geoip.samagra.io/city/${apiRes}`);
            locationRes = await locationRes.json();
            sessionStorage.setItem('ip', apiRes);
          }
        },
        async (error) => {
          sessionStorage.setItem('location_error', 'true');
          sessionStorage.setItem('latitude', String(process.env.NEXT_PUBLIC_USER_LATITUDE));
          sessionStorage.setItem('longitude', String(process.env.NEXT_PUBLIC_USER_LONGITUDE));
          sessionStorage.setItem('city', String(process.env.NEXT_PUBLIC_USER_LOCATION));

          if (error.code === error.PERMISSION_DENIED) {
            let apiRes: any = await fetch('https://ip-retriever-production.up.railway.app/');
            apiRes = await apiRes.text();
            if (apiRes) {
              let locationRes: any = await fetch(`https://geoip.samagra.io/city/${apiRes}`);
              locationRes = await locationRes.json();
              sessionStorage.setItem('ip', apiRes);
              if (!sessionStorage.getItem('city')) sessionStorage.setItem('city', locationRes.city);
              if (!sessionStorage.getItem('district'))
                sessionStorage.setItem('district', locationRes.city);
              if (!sessionStorage.getItem('block'))
                sessionStorage.setItem('block', locationRes.regionName);
              if (!sessionStorage.getItem('state'))
                sessionStorage.setItem('state', locationRes.regionName);
              //   sessionStorage.setItem('latitude', locationRes.lat);
              //   sessionStorage.setItem('longitude', locationRes.lon);
            }
          } else {
            let apiRes: any = await fetch('https://ip-retriever-production.up.railway.app/');
            apiRes = await apiRes.text();
            if (apiRes) {
              let locationRes: any = await fetch(`https://geoip.samagra.io/city/${apiRes}`);
              locationRes = await locationRes.json();
              sessionStorage.setItem('ip', apiRes);
              if (!sessionStorage.getItem('city')) sessionStorage.setItem('city', locationRes.city);
              if (!sessionStorage.getItem('district'))
                sessionStorage.setItem('district', locationRes.city);
              if (!sessionStorage.getItem('block'))
                sessionStorage.setItem('block', locationRes.regionName);
              if (!sessionStorage.getItem('state'))
                sessionStorage.setItem('state', locationRes.regionName);
              //   sessionStorage.setItem('latitude', locationRes.lat);
              //   sessionStorage.setItem('longitude', locationRes.lon);
            }
            console.error('Error occurred while getting location:', error);
          }
        },
        {
          enableHighAccuracy: true,
        }
      );
    }
  } catch (err) {
    console.log(err);
    sessionStorage.setItem('location_error', 'true');
  }
}
