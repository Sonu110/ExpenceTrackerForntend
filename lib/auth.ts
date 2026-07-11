// src/lib/auth.ts

import { Preferences } from "@capacitor/preferences";


const TOKEN_KEY = "token";


// Check if running inside Capacitor app
const isCapacitor = () => {

  return (
    typeof window !== "undefined" &&
    window.Capacitor?.isNativePlatform()
  );

};


// Save token
export async function setToken(
  token: string
) {

  if (isCapacitor()) {

    await Preferences.set({

      key: TOKEN_KEY,

      value: token,

    });

  } else {

    localStorage.setItem(
      TOKEN_KEY,
      token
    );

  }

}

console.log(isCapacitor());
  
// Get token
export async function getToken() {

  if (isCapacitor()) {

    const result =
      await Preferences.get({

        key: TOKEN_KEY,

      });


    return result.value;

  }

  
  


  return localStorage.getItem(
    TOKEN_KEY
  );

}




// Remove token (logout)
export async function removeToken() {


  if (isCapacitor()) {


    await Preferences.remove({

      key: TOKEN_KEY,

    });


  } else {


    localStorage.removeItem(
      TOKEN_KEY
    );


  }

}




// Check login status
export async function isLoggedIn(){

  const token = await getToken();

  return !!token;

}