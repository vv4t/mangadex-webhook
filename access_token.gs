
function main()
{
  const username = "YOUR_USERNAME_HERE";
  const password = "YOUR_PASSWORD_HERE";

  const login_endpoint = API_URL + "/auth/login";
  const credentials = { "username": username, "password": password };

  const login_request = request(login_endpoint, "POST", credentials);

  if (login_request != null) {
    console.log(login_request.token.refresh);
  } else {
    console.log("login failed");
  }  
}
