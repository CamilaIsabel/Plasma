const createKeywords = (name) => {
  const arrName = [];
  let curName = "";
  name.split("").forEach((letter) => {
    curName += letter;
    arrName.push(curName);
  });
  return arrName;
};

const generateKeywords = (string) => {
  const result = [];

  const names = string.toLowerCase().split(" ");
  names.forEach((string) => {
    result.push(...createKeywords(string.trim()));
  });

  result.push(...createKeywords(string.toLowerCase()));
  return result;
};

export { generateKeywords };
