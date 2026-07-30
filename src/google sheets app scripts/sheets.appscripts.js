function onFormSubmit(e) {
  const data = {
    first_name: e.namedValues["First Name"][0],
    last_name: e.namedValues["Last Name"][0],
    email: e.namedValues["Email"][0],
    phone: e.namedValues["Phone Number"][0]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "ngrok-skip-browser-warning": "true"
    },
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(
    "https://3bd2-105-163-2-215.ngrok-free.app/api/v1/google/admin-onboarding",
    options
  );

  Logger.log(response.getResponseCode());
  Logger.log(response.getContentText());
}