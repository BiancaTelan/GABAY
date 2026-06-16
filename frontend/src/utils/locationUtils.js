import postalData from './ph-postal-codes.json';

export const getZipCode = (province, city) => {
  if (!province || !city) return "";
  
  const cleanProv = province.trim();
  const cleanCity = city.trim().toUpperCase();

  if (postalData[cleanProv]) {
    for (const [jsonCity, zip] of Object.entries(postalData[cleanProv])) {
      if (cleanCity.includes(jsonCity.toUpperCase())) {
        return zip;
      }
    }
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