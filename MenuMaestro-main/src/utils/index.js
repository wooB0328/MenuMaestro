export function isEqual(objA, objB) {
    if (objA === objB) {
      return true;
    }
  
    if (typeof objA !== 'object' || typeof objB !== 'object') {
      return false;
    }
  
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
  
    if (keysA.length !== keysB.length) {
      return false;
    }
  
    for (const key of keysA) {
      if (!keysB.includes(key) || !isEqual(objA[key], objB[key])) {
        return false;
      }
    }
  
    return true;
  }

export const getToday = () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const date = `${new Date().getDate()}`;
  return `${year}-${month}-${date.padStart(2, '0')}`;
}

  

export const getTodayReadable = () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const date = new Date().getDate();
  return `${year}년 ${month}월 ${date}일`;
}
