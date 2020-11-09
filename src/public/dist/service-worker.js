
//DOM is fully loaded
$(document).ready(function() {
	const VAPID_PUBLIC = "BAUqOHp-3Y1ZuPy0RgZO7JmzKeLp5sTyTyZvyB4Md15flKM4C9T_TQu5NEKZJZvl2YrPLflc3qCAR3vK3ca5KXk";

	function urlBase64ToUint8Array(base64String) {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i)
			outputArray[i] = rawData.charCodeAt(i);
		return outputArray;
	}

	function subscription() {
		const SW = "/src/public/dist/worker.min.js";
		console.log("Registering a Service worker...");
		navigator.serviceWorker.register(SW).then(register => {
			// Listen Push Notifications
			return register.pushManager.subscribe({
				applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
				userVisibleOnly: true
			});
		}).then(subscription => {
			//console.log(subscription);
			console.log("Listening Push Notifications");
			// Send Notification
			return fetch("/subscription", {
				method: "POST",
				body: JSON.stringify(subscription),
				headers: { "Content-Type": "application/json" }
			});
		}).then(res => { //text spected and load message
			return res.ok ? res.text().then(setSuccess) : res.text().then(setDanger);
		}).catch(setDanger);
	};

	// Service Worker Support
	if ("serviceWorker" in navigator)
		subscription();
	else
		setDanger("Service Worker is not suported!");
});
