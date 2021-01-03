'use strict';

(function() {
	var currentUser = null;

	var topTrialButton = document.getElementById("top-trial-button");
	var bottomTrialSection = document.getElementById("bottom-trial-section");

	const altButton = document.URL.endsWith("/pricing") ? "<a href='/pro' class='sr-button style-2 button-medium'>Learn more about Alpha Pro</a>" : "<a href='/pro/pricing' class='sr-button style-2 button-medium'>Pricing</a>"

	const initiateSubscription = function() {
		document.body.classList.remove("loading-end")
		document.body.classList.remove("loaded")
		
		currentUser.getIdToken().then(function(token) {
			fetch("/private/account/stripe/subscription/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token,
					"Cache-Control": "no-store"
				}
			}).then(function(result) {
				return result.json()
			}).then(function(response) {
				if (token == response.token) {
					window.location = "/account";
				} else {
					firebase.auth().signOut();
				}
			}).catch(function(err) {
				console.error(err);
			})
		}.bind(this)).catch(function(err) {
			console.error(err);
		});
	};

	firebase.auth().onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser && firebaseUser.emailVerified) {
			currentUser = firebaseUser;

			topTrialButton.innerHTML = "Manage your subscription";
			bottomTrialSection.innerHTML = "<div class='spacer-medium'></div><h6 class='title-alt uppercase colored'><strong>Manage your subscription</strong></h6><div class='spacer-small'></div><h3>One place to fully manage<br />your Alpha Pro subscription.</h3><div class='spacer-mini'></div><a href='/account' id='bottom-trial-button' class='sr-button button-medium'>Manage your subscription</a>&nbsp;&nbsp;&nbsp;" + altButton + "<div class='spacer-medium'></div>";

			firebaseUser.getIdToken().then(function(token) {
				fetch("/private/account/details", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + token
					}
				}).then(function(result) {
					return result.json()
				}).then(function(response) {
					if (!response.accountDetails.customer.personalSubscription.plan) {
						topTrialButton.innerHTML = "Start your trial";
						topTrialButton.removeAttribute("href");
						topTrialButton.onclick = function() {
							initiateSubscription();
						};
						bottomTrialSection.innerHTML = "<div class='spacer-medium'></div><h6 class='title-alt uppercase colored'><strong>Free 14-day trial</strong></h6><div class='spacer-small'></div><h3>Try out the full Pro experience.<br />No credit card required.</h3><div class='spacer-mini'></div><a href='/account' id='bottom-trial-button' class='sr-button button-medium'>Sign in to start your trial</a>&nbsp;&nbsp;&nbsp;" + altButton + "<div class='spacer-medium'></div>";
					} else if (response.accountDetails.customer.personalSubscription.plan == "free") {
						topTrialButton.innerHTML = "Start your subscription";
						topTrialButton.href = "/account/subscription/link";
						bottomTrialSection.innerHTML = "<div class='spacer-medium'></div><h6 class='title-alt uppercase colored'><strong>Purchase Alpha Pro</strong></h6><div class='spacer-small'></div><h3>Start your Alpha Pro subscription.</h3><div class='spacer-mini'></div><a href='/account/subscription/link' id='bottom-trial-button' class='sr-button button-medium'>Start your subscription</a>&nbsp;&nbsp;&nbsp;" + altButton + "<div class='spacer-medium'></div>";
					}
				});
			});
		}
	});
})();