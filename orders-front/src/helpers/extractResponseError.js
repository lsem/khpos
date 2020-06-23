export default async function (uiMessage, error) {
  const errorMessage = error.response
    ? await error.response.text()
    : error.message;

  return `${uiMessage}: "${errorMessage}"`;
}
