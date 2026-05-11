const randomItem = (array) => {
  return array[
    Math.floor(
      Math.random() * array.length
    )
  ];
};

const randomNumber = (
  min,
  max
) => {

  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
};

module.exports = {
  randomItem,
  randomNumber
};
