function toLocalDate() {
  const currentDate = new Date();
  const hour = currentDate.getHours() + 7;
  currentDate.setHours(hour);
  return currentDate;
}

module.exports = {
  toLocalDate,
};
