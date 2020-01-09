 // client/main.js

    function urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    let publicVapidKey2 = '';
    //const publicVapidKey = 'BMilFiQJPtLRxgBF209Z5VuMZSh1_Y7ga91nx2HBLXj5mD6j5KcJN3LuORoH0FHuHGXOMv7U0gfAd9H1MxPzIAM';


   let register;

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then((reg) => {
              console.log('Service worker registered.', reg);
              register = reg;
            });
      });
    }

    async function triggerPushNotification() {
      if ('serviceWorker' in navigator) {
        //const register = await navigator.serviceWorker.register('/sw.js', {scope: '/'});

        await fetch('/obtenerClavePublica',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
          }
        ).then(response => response.text())
        .then(text => {
          //saco las "" que vienen del server
          publicVapidKey2 = text.replace("\"","").replace("\"","");
          console.log("Clave publica desde el server: " + publicVapidKey2);
        }).catch(err => {
          console.error('fetch failed', err);
        });

        /*console.log("Clave publica desde el cliente: " + publicVapidKey);
        console.log(`en base 64: ${btoa(publicVapidKey)}, ${btoa(publicVapidKey2)}` );*/

        const subscription = await register.pushManager.subscribe({
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey2),
          userVisibleOnly: true
        });
        
        console.log("llamo al suscribe")
        /*await fetch('/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: {
            'Content-Type': 'application/json',},
        });*/

        await fetch('/subscribe',{
                                    method: 'POST',
                                    body: JSON.stringify(subscription),
                                    headers: {'Content-Type': 'application/json'}
                                  }
        ).then(response => response.text())
        .then(text => {
          console.log(text);
        }).catch(err => {
          console.error('fetch failed', err);
        });
        
        
      } else {
        console.error('Service workers are not supported in this browser');
      }
    }

    const triggerPush = document.querySelector('.trigger-push');
    
    triggerPush.addEventListener('click', () => {
      triggerPushNotification().catch(error => console.error(error));
    });

//---------------------boton de instalar app
let deferredPrompt; // Allows to show the install prompt
let setupButton;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log("beforeinstallprompt fired");
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    if (setupButton == undefined) {
        setupButton = document.getElementById("setup_button");
    }
    // Show the setup button
    //setupButton.style.display = "inline";
    //setupButton.disabled = false;
});

function installApp() {
  // Show the prompt
  deferredPrompt.prompt();
  //setupButton.disabled = true;
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
      .then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
              console.log('PWA setup accepted');
              // hide our user interface that shows our A2HS button
              //setupButton.style.display = 'none';
          } else {
              console.log('PWA setup rejected');
          }
          deferredPrompt = null;
      });
}

window.addEventListener('appinstalled', (evt) => {
  console.log("appinstalled fired", evt);
});