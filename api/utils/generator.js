export function generateUniqueId(existingIds) {
  let id;
  do {
    id = Math.floor(10000 + Math.random() * 90000).toString();
  } while (existingIds.includes(id));
  return id;
}

export function generateToken() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

