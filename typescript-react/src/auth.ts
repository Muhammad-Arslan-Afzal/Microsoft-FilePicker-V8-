// import {
//   PublicClientApplication,
//   Configuration,
//   SilentRequest,
// } from "@azure/msal-browser";
// import { combine } from "@pnp/core";
// import { IAuthenticateCommand } from "@pnp/picker-api/dist";

// const msalParams: Configuration = {
//   auth: {
//     authority: "https://login.microsoftonline.com/common",
//     //https://login.microsoftonline.com/bf906cde-02e0-4ea2-91f9-2f3c7bc11f90
//     clientId: "15aa9381-b87c-49f1-a504-0589c2f94d88",
//     redirectUri: "http://localhost:3000",
//   },
// };

// const app = new PublicClientApplication(msalParams); // setting up the application to make it ready for authentication and accesstoken acquisition

// export async function getToken(command: IAuthenticateCommand): Promise<string> {
//   return getTokenWithScopes([`${combine(command.resource, ".default")}`]);
// }

// export async function getTokenWithScopes(
//   scopes: string[],
//   additionalAuthParams?: Omit<SilentRequest, "scopes">
// ): Promise<string> {
//   let accessToken = "";
//   const authParams = { scopes, ...additionalAuthParams };

//   try {
//     // see if we have already the idtoken saved
//     const resp = await app.acquireTokenSilent(authParams!);
//     accessToken = resp.accessToken;
//   } catch (e) {
//     // per examples we fall back to popup
//     const resp = await app.loginPopup(authParams!);
//     app.setActiveAccount(resp.account);

//     if (resp.idToken) {
//       const resp2 = await app.acquireTokenSilent(authParams!);
//       accessToken = resp2.accessToken;
//     } else {
//       // throw the error that brought us here
//       throw e;
//     }
//   }

//   return accessToken;
// }

///////////////////////////////
///////MSAL VERSION 1//////////
///////////////////////////////
import { UserAgentApplication, AuthResponse } from "msal";
import { combine } from "@pnp/core";
import { IAuthenticateCommand } from "@pnp/picker-api/dist";
const msalConfig = {
  auth: {
    clientId: "15aa9381-b87c-49f1-a504-0589c2f94d88",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:3000",
  },
};

const app = new UserAgentApplication(msalConfig);

export async function getToken(command: IAuthenticateCommand) {
  return getTokenWithScopes([`${combine(command.resource, ".default")}`]);
}

export async function getTokenWithScopes(
  scopes: string[],
  additionalAuthParams?: any
) {
  let accessToken = "";
  const authParams = { scopes, ...additionalAuthParams };

  try {
    const resp = await app.acquireTokenSilent(authParams);
    accessToken = resp.accessToken;
  } catch (e) {
    // For MSAL.js (version 1), you can use the loginPopup method to handle the fallback to popup login.
    const resp = await app.loginPopup(authParams);

    if (resp.idToken) {
      const resp2 = await app.acquireTokenSilent(authParams.scopes);
      accessToken = resp2.accessToken;
    } else {
      // throw the error that brought us here
      throw e;
    }
  }

  return accessToken;
}
