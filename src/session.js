let users = new Map();

// Push data into map.
export const setAddressData = (userId, cityId, cityName, regionName) =>
  users.set(userId, { cityId, cityName, regionName });

// Check if user is in map.
export const isUserSearching = (userId) => users.has(userId);

// Retrieve data from map.
export const getAddressData = (userId) => users.get(userId);

// Delete user from map.
export const deleteUserData = (userId) => users.delete(userId);
