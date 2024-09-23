export async function recordUserLocation(config: any) {
  return new Promise((resolve, reject) => {
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
            resolve('');
          },
          async (error) => {
            sessionStorage.setItem('latitude', config?.latitude);
            sessionStorage.setItem('longitude', config?.longitude);
            sessionStorage.setItem('city', config?.location);
            sessionStorage.setItem('location_error', 'true');
            resolve('');
          },
          {
            enableHighAccuracy: true,
          }
        );
      }
    } catch (err) {
      sessionStorage.setItem('location_error', 'true');

      console.log('denied location', err);
      reject(err);
    }
  });
}
