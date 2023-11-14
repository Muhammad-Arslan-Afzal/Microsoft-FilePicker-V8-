// import React from "react";
// import { MouseEvent, useEffect, useState } from "react";
// import {
//   Picker,
//   Embed,
//   IPickData,
//   IFilePickerOptions,
//   Popup,
//   IAuthenticateCommand,
//   IPicker,
//   LamdaAuthenticate,
//   SPItem,
// } from "@pnp/picker-api";

// export interface PickerProps {
//   baseUrl: string;
//   getToken: (message: IAuthenticateCommand) => Promise<string>;
//   options: IFilePickerOptions;
//   onResults: (items: SPItem[]) => void;
//   onCancel: () => void;
// }

// // picker button used to launch the picker
// function PickerButton(props: PickerProps) {
//   const { baseUrl, getToken, options, onResults, onCancel } = props;

//   const [contentWindow, setContentWindow] = useState<Window | null>(null);
//   const [picker, setPicker] = useState<IPicker | null>(null);

//   /////////////////////////////
//   useEffect(() => {
//     if (picker) {
//       // optionally log notifications to the console
//       // picker.on.notification(function (this: IPicker, message) {
//       //   this.log("notification: " + JSON.stringify(message));
//       // });

//       // optionially log any logging from the library itself to the console
//       // picker.on.log(function (this: IPicker, message, level) {
//       //   console.log(`log: [${level}] ${message}`);
//       // });

//       // optionially log any logging from the library itself to the console
//       // picker.on.error(function (this: IPicker, err) {
//       //   this.log(`error: ${err}`);
//       // });
//       let results: IPickData | void = null;
//       (async () => {
//         results = await picker.activate({
//           baseUrl,
//           options,
//         });
//         if (!results) {
//           onCancel();
//         } else {
//           console.log(results.items);
//           onResults(results.items);
//         }
//       })();
//     }

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [picker]);
//   /////////////////////////////

//   /////////////////////////////

//   useEffect(() => {
//     if (contentWindow) {
//       // create and set the picker API using the content window
//       setPicker(
//         Picker(contentWindow).using(Popup(), LamdaAuthenticate(getToken))
//       );
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [contentWindow]);

//   /////////////////////////////

//   /////////////////////////////
//   async function click(e: MouseEvent<HTMLButtonElement>): Promise<void> {
//     e.preventDefault();

//     // open a pop-up
//     setContentWindow(window.open("", "Picker", "width=800,height=600"));
//   }
//   /////////////////////////////

//   // <button onClick={click}>Launch Picker</button>;

//   return <button onClick={click}>Launch Picker</button>;
// }

// export default PickerButton;
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
//////////// Iframe Version /////////////////////////////
/////////////////////////////////////////////////////////
import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogType } from "@fluentui/react";
import {
  Picker,
  Embed,
  IPickData,
  IFilePickerOptions,
  IAuthenticateCommand,
  IPicker,
  LamdaAuthenticate,
  SPItem,
} from "@pnp/picker-api";

export interface PickerProps {
  baseUrl: string;
  getToken: (message: IAuthenticateCommand) => Promise<string>;
  options: IFilePickerOptions;
  onResults: (items: SPItem[]) => void;
  onCancel: () => void;
}

function PickerButton(props: PickerProps) {
  const { baseUrl, getToken, options, onResults, onCancel } = props;
  const [iframeVisible, setIframeVisible] = useState(false);
  const [picker, setPicker] = useState<IPicker | null>(null);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

  const closeIframe = () => {
    if (iframe) {
      document.body.removeChild(iframe);
      setIframe(null);
      setIframeVisible(false);
    }
  };
  const handleButtonClick = () => {
    setIframeVisible(true);
  };

  useEffect(() => {
    if (iframeVisible) {
      const newIframe = document.createElement("iframe");
      newIframe.width = "800";
      newIframe.height = "600";
      newIframe.title = "Picker";
      document.body.appendChild(newIframe);
      setIframe(newIframe);

      const embedBehavior = Embed((pickedItems: IPickData) => {
        //All the following should work as the returned instance of.using
        //have all the functionalities attached with the modified instance but it doesnot work as expected
        //  onResults(pickedItems.items);
        //  closeIframe();
        //  setPicker(null);
      });

      const pickerInIframe = Picker(newIframe.contentWindow).using(
        embedBehavior,
        LamdaAuthenticate(getToken)
      );

      // getToken({
      //   command: "authenticate",
      //   type: "SharePoint",
      //   resource: baseUrl,
      // }).then((result) => console.log("access Token", result));

      setPicker(pickerInIframe);
    }
  }, [iframeVisible]);

  useEffect(() => {
    if (picker) {
      let results: IPickData | void = null;
      (async () => {
        results = await picker.activate({
          baseUrl,
          options,
        });
      })();
      picker.on.pick(async (pickedItems) => {
        const item = pickedItems.items[0]; // Assuming you are dealing with the first picked item
        // const url = `${pickedItem["@sharePoint.endpoint"]}/drives/${pickedItem.parentReference.driveId}/items/${pickedItem.id}/content`;

        // try {
        //   let token: string;
        //   getToken({
        //     command: "authenticate",
        //     type: "SharePoint",
        //     resource: baseUrl,
        //   })
        //     .then((result) => (token = result))
        //     .then(() => {
        //       fetch(url, {
        //         headers: {
        //           Authorization: `Bearer ${token}`,
        //         },
        //       }).then((response) => console.log("Final Response", response));
        //     });

        //   onResults(pickedItems.items);
        //   closeIframe();
        //   setPicker(null);
        // } catch (error) {
        //   // Handle errors
        //   console.error("Error making GET request:", error);
        // }
        const url = `${item["@sharePoint.endpoint"]}/drives/${item.parentReference.driveId}/items/${item.id}/content`;
        const token = await getToken({
          command: "authenticate",
          type: "SharePoint",
          resource: baseUrl,
        });
        // Perform the GET request using the constructed URL and token
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Handle the response as needed, e.g., read the content or handle errors
          if (response.ok) {
            console.log(response);
            // const content = await response.text();
            // console.log("File content:", content);
          } else {
            console.error(
              "Failed to retrieve file content:",
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error("Error fetching file content:", error);
        }
      });

      picker.on.close(() => {
        closeIframe();
        setPicker(null);
      });
    }
  }, [picker]);

  return (
    <div>
      <button onClick={handleButtonClick}>Launch Picker</button>
    </div>
  );
}

export default PickerButton;

///////////////////////////////////////////////////////////////
///////////IFRAME ALREADY EXISTING VERSION/////////////////////
///////////////////////////////////////////////////////////////
// export default function PickerButton(props: PickerProps) {
//   const { baseUrl, getToken, options, onResults, onCancel } = props;
//   const [picker, setPicker] = useState<IPicker | null>(null);

//   const handleButtonClick = () => {
//     const Iframe = document.getElementById(
//       "iframe"
//     ) as HTMLIFrameElement | null;

//     const embedBehavior = Embed((pickedItems: IPickData) => {});

//     const pickerInIframe = Picker(Iframe.contentWindow).using(
//       embedBehavior,
//       LamdaAuthenticate(getToken)
//     );

//     setPicker(pickerInIframe);
//   };
//   useEffect(() => {
//     if (picker) {
//       let results: IPickData | void = null;
//       (async () => {
//         results = await picker.activate({
//           baseUrl,
//           options,
//         });
//       })();
//       picker.on.pick((pickedItems) => {
//         onResults(pickedItems.items);
//       });
//     }
//   }, [picker]);

//   return (
//     <div>
//       <button onClick={handleButtonClick}>Launch Picker</button>
//       <iframe id="iframe" style={{ height: "600px", width: "800px" }}></iframe>
//     </div>
//   );
// }

///////////////////////////////////////////////////////////////
///////////IFRAME WITHIN DIALOG [FLUENT UI]////////////////////
///////////////////////////////////////////////////////////////

// export default function App(props) {
//   const { baseUrl, getToken, options, onResults, onCancel } = props;
//   const [picker, setPicker] = useState(null);
//   const [dialogVisible, setDialogVisible] = useState(false);
//   const [iframe, setIframe] = useState(null);

//   const handleButtonClick = () => {
//     setDialogVisible(true);
//   };

//   const handleIframeAccess = () => {
//     const Iframe = document.getElementById(
//       "iframe"
//     ) as HTMLIFrameElement | null;
//     const embedBehavior = Embed((pickedItems: IPickData) => {});

//     const pickerInIframe = Picker(Iframe.contentWindow).using(
//       embedBehavior,
//       LamdaAuthenticate(getToken)
//     );

//     setPicker(pickerInIframe);
//   };
//   useEffect(() => {
//     if (picker) {
//       let results: IPickData | void = null;
//       (async () => {
//         results = await picker.activate({
//           baseUrl,
//           options,
//         });
//       })();
//       picker.on.pick((pickedItems) => {
//         onResults(pickedItems.items);
//       });
//     }
//   }, [picker]);
//   useEffect(() => {
//     if (dialogVisible) {
//       setTimeout(handleIframeAccess, 100);
//     }
//   }, [dialogVisible]);

//   return (
//     <div>
//       <button onClick={handleButtonClick}>Launch Picker</button>
//       <Dialog
//         hidden={!dialogVisible}
//         minWidth="80%"
//         maxWidth="80%"
//         modalProps={{ isBlocking: true }}
//       >
//         <iframe
//           id="iframe"
//           style={{ height: "600px", width: "800px", background: "skyblue" }}
//         ></iframe>
//       </Dialog>
//     </div>
//   );
// }

// useEffect(() => {
//   if (dialogVisible) {
//     const iframe = document.getElementById(
//       "iframe"
//     ) as HTMLIFrameElement | null;

//     iframe.onload = () => {
//       console.log(iframe);
//       const contentWindow = iframe.contentWindow;
//       console.log(contentWindow);

//       const embedBehavior = Embed((pickedItems: IPickData) => {
//         console.log("Hi from embedBehavior method");
//       });

//       const pickerInIframe = Picker(contentWindow).using(
//         embedBehavior,
//         LamdaAuthenticate(getToken)
//       );

//       setPicker(pickerInIframe);
//     };
//   }
// }, [dialogVisible]);

// useEffect(() => {
//   if (picker) {
//     (async () => {
//       await picker.activate({
//         baseUrl,
//         options,
//       });
//     })();
//     picker.on.pick((pickedItems) => {
//       onResults(pickedItems.items);
//     });
//   }
// }, [picker]);
