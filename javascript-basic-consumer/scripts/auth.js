const msalParams = {
  auth: {
    authority: "https://login.microsoftonline.com/consumers",
    clientId: "c3582642-7c0a-4012-b246-c82165986546",
    redirectUri: "http://localhost:3000",
  },
};

const app = new msal.PublicClientApplication(msalParams);

async function getToken() {
  let accessToken = "";

  authParams = { scopes: ["OneDrive.ReadWrite"] };

  try {
    // see if we have already the idtoken saved
    const resp = await app.acquireTokenSilent(authParams);
    accessToken = resp.accessToken;
  } catch (e) {
    // per examples we fall back to popup
    const resp = await app.loginPopup(authParams);
    app.setActiveAccount(resp.account);

    if (resp.idToken) {
      const resp2 = await app.acquireTokenSilent(authParams);
      accessToken = resp2.accessToken;
    } else {
      // throw the error that brought us here
      throw e;
    }
  }

  return accessToken;
}
