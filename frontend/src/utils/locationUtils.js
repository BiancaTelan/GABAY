import postalData from './ph-postal-codes.json';

export const getZipCode = (province, city) => {
  if (!province || !city) return "";
  
  const cleanProv = province.trim();
  const cleanCity = city.trim();

  if (postalData[cleanProv] && postalData[cleanProv][cleanCity]) {
    return postalData[cleanProv][cleanCity];
  }
  return "";
};

export const getLocationByZip = (zip) => {
  if (!zip || zip.length !== 4) return null;

  for (const [province, cities] of Object.entries(postalData)) {
    for (const [city, cityZip] of Object.entries(cities)) {
      if (cityZip === zip) {
        return { province, city };
      }
    }
  }
  return null;
};