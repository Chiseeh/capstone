// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiURL: 'http://localhost:3000/',

}
export const firebaseConfig ={
  production: false,
  firebaseConfig: {
  apiKey: "AIzaSyAWcm652xXY3s2WepeUdVjW0m2GUpNv7ic",
  authDomain: "capstonevecinal.firebaseapp.com",
  projectId: "capstonevecinal",
  storageBucket: "capstonevecinal.appspot.com",
  messagingSenderId: "564486199588",
  appId: "1:564486199588:web:14f48e28be0bd62ab5bbb1",
  measurementId: "G-J0ESPFZE5C"
}};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
