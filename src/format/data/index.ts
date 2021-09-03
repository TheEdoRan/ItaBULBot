import dayjs from "dayjs";

export const unavailable = "<i>non disponibile</i>";

export const formatLatestUpdate = (date: string) => {
  const time = dayjs(date).format("HH:mm");
  const day = dayjs(date).format("DD/MM/YYYY");

  return `\n\n<i>Ultimo aggiornamento alle ${time} del ${day}</i>`;
};

export const formatLatestUpdateError = () =>
  `\n<i>Non è stato possibile ricavare la data dell'ultimo aggiornamento</i>`;
