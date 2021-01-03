'use strict';

let enabledFeatures = [6];
let prices = [];

(function() {	
	var currentUser = null;

	fetch("/files/js/pro/features.json").then(function(response) {
		return response.json()
	}).then(function(proFeatures) {
		let availableFeaturesElement = document.getElementById("available-features");
		availableFeaturesElement.innerHTML = ""
		for (var i = 0; i < proFeatures.length; i++) {
			const element = proFeatures[i];
			prices.push(element.price);
			const enabled = enabledFeatures.includes(i);
			var action = '<a onclick="window.toggleEstimate(' + i + ')" class="sr-button style-2 button-small button-pointer">' + (enabled ? "Remove from estimate" : "Add to estimate") + '</a>'
			if (i == 2) {
				action = '<input oninput="window.toggleEstimate(' + i + ')" type="number" min="0" name="satelliteCount" id="satelliteCount" value="" placeholder="Satellite count" style="padding: 9px 10px 10px 10px; margin: 2px 0 3px 0" />'
			} else if (i == 4) {
				action = '<input oninput="window.toggleEstimate(' + i + ')" type="number" min="0" name="userCount" id="userCount" value="" placeholder="Community user count" style="padding: 9px 10px 10px 10px; margin: 2px 0 3px 0" />'
			}
			availableFeaturesElement.innerHTML += '<div class="blog-item isotope-item" id="feature-' + i + '"><div class="blog-item-inner item-inner"><div class="blog-media"><a onclick="window.toggleEstimate(' + i + ')" class="thumb-hover button-pointer"><img src="' + element.img + '" alt="' + element.alt + '" title="' + element.altTitle + '" class="' + (enabled ? "" : "grayscale") + '" /></a></div><div class="blog-info"><div class="post-meta clearfix"><span class="post-date">' + (enabled ? "Enabled" : "Disabled") + '</span><span class="post-cat">' + element.postCat + '</span></div><h3 class="post-name">' + action + '</h3></div></div></div>';
		}
	});

	const getAccountInformation = function() {
		currentUser.getIdToken().then(function(token) {
			fetch("/private/account/details", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				}
			}).then(function(result) {
				return result.json()
			}).then(function(response) {
				if (token == response.token) {
					if (response.accountDetails.customer.personalSubscription.plan == "price_HLr5Pnrj3yRWOP") {
						if (response.accountDetails.customer.addons.marketAlerts == 1) toggleEstimate(0);
						if (response.accountDetails.customer.addons.flow == 1) toggleEstimate(1);
						if (response.accountDetails.customer.addons.satellites > 0) {
							document.getElementById("satelliteCount").value = response.accountDetails.customer.addons.satellites;
							toggleEstimate(2);
						}
						if (response.accountDetails.customer.addons.statistics == 1) toggleEstimate(3);
						if (response.accountDetails.customer.addons.noads > 0) {
							document.getElementById("userCount").value = Math.round(response.accountDetails.customer.addons.noads);
							toggleEstimate(4);
						}
						if (response.accountDetails.customer.addons.commandPresets == 1) toggleEstimate(5);
						if (response.accountDetails.customer.addons.liveTrading == 1) toggleEstimate(6);
					}

					document.body.classList.add("loaded");
					setTimeout(function() {
						document.body.classList.add("loading-end");
					}, 1500);
				} else {
					firebase.auth().signOut();
				}
			}).catch(function(err) {
				console.error(err);
			});
		}.bind(this)).catch(function(err) {
			console.error(err);
		});
	};

	firebase.auth().onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser && firebaseUser.emailVerified) {
			currentUser = firebaseUser;
			getAccountInformation();
		} else {
			document.body.classList.add("loaded");
			setTimeout(function() {
				document.body.classList.add("loading-end");
			}, 1500);
		}
	});
})();

function toggleEstimate(i) {
	const element = document.getElementById("feature-" + i);

	if (i == 2) {
		const count = document.getElementById("satelliteCount").value
		if (!count || count == 0) {
			if (enabledFeatures.includes(i)) enabledFeatures.splice(enabledFeatures.indexOf(i), 1);
			element.querySelector("img").classList.add("grayscale");
			element.querySelector(".post-date").innerText = "Disabled";
		} else {
			if (!enabledFeatures.includes(i)) enabledFeatures.push(i);
			prices[i] = count * 200;
			element.querySelector("img").classList.remove("grayscale");
			element.querySelector(".post-date").innerText = "Enabled";
		}
	} else if (i == 4) {
		const count = document.getElementById("userCount").value
		if (!count || count == 0) {
			if (enabledFeatures.includes(i)) enabledFeatures.splice(enabledFeatures.indexOf(i), 1);
			element.querySelector("img").classList.add("grayscale");
			element.querySelector(".post-date").innerText = "Disabled";
		} else {
			if (!enabledFeatures.includes(i)) enabledFeatures.push(i);
			prices[i] = Math.ceil(200 + Math.log2(count) * 100);
			element.querySelector("img").classList.remove("grayscale");
			element.querySelector(".post-date").innerText = "Enabled";
		}
	} else if (enabledFeatures.includes(i)) {
		enabledFeatures.splice(enabledFeatures.indexOf(i), 1);
		element.querySelector("img").classList.add("grayscale");
		element.querySelector(".post-name").querySelector("a").innerText = "Add to estimate";
		element.querySelector(".post-date").innerText = "Disabled";
	} else {
		enabledFeatures.push(i);
		element.querySelector("img").classList.remove("grayscale");
		element.querySelector(".post-name").querySelector("a").innerText = "Remove from estimate";
		element.querySelector(".post-date").innerText = "Enabled";
	}

	var price = 0;
	for (var index = 0; index < enabledFeatures.length; index++) {
		price += prices[enabledFeatures[index]];
	}
	price /= 100;

	document.getElementById("price-estimate").innerText = "You're estimated to pay $" + price.toFixed(2) + " for your Alpha Pro subcription.";
}