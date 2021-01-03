'use strict';

(function() {
	firebase.auth().signOut()

	var form = document.querySelector('.sign-up-form');
	var email = document.getElementById('email');
	var password = document.getElementById('password');
	var passwordVerify = document.getElementById('password-verify');

	const urlParams = new URLSearchParams(window.location.search);
	const promoCode = urlParams.get("promo");


	if (promoCode) {
		fetch("/private/stats/coupon/get", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store"
			},
			body: JSON.stringify({
				promoCode: promoCode
			})
		}).then(function(result) {
			return result.json()
		}).then(function(response) {
			if (response.message) {
				document.getElementById("promo-message").innerHTML = response.message
				setVisibilityOf([{
					element: document.querySelector('.referral'),
					setVisible: true
				}]);
			}
		}).catch(function(err) {
			console.error(err);
		})
	}

	firebase.auth().onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			if (promoCode) {
				firebaseUser.getIdToken().then(function(token) {
					fetch("/private/verify/coupon/apply", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": "Bearer " + token,
							"Cache-Control": "no-store"
						},
						body: JSON.stringify({
							promoCode: promoCode
						})
					}).then(function(result) {
						return result.json()
					}).then(function(response) {
						if (token == response.token) {
							window.location = "/account/verify";
						} else {
							firebase.auth().signOut();
						}
					}).catch(function(err) {
						console.error(err);
					})
				}.bind(this)).catch(function(err) {
					console.error(err);
				});
			} else {
				window.location = "/account/verify";
			}
		}
	});

	email.addEventListener('input', hideWarning, false);
	password.addEventListener('input', hideWarning, false);
	passwordVerify.addEventListener('input', hideWarning, false);

	function triggerBrowserValidation() {
		// The only way to trigger HTML5 form validation UI is to fake a user submit event.
		var submit = document.createElement('input');
		submit.type = 'submit';
		submit.style.display = 'none';
		form.appendChild(submit);
		submit.click();
		submit.remove();
	}

	// Listen on the form's 'submit' handler...
	form.addEventListener('submit', function(e) {
		e.preventDefault();

		// Trigger HTML5 validation UI on the form if any of the inputs fail
		// validation.
		var plainInputsValid = true;
		Array.prototype.forEach.call(form.querySelectorAll('input'), function(input) {
			if (input.checkValidity && !input.checkValidity()) {
				plainInputsValid = false;
				return;
			}
		});
		if (!plainInputsValid) {
			triggerBrowserValidation();
			return;
		}

		if (email.value == "") {
			showWarning("alert-warning", "An email address must be given.");
		} else if (password.value == "") {
			showWarning("alert-warning", "A password must be given.");
		} else if (passwordVerify.value == "") {
			showWarning("alert-warning", "The password must be verified.");
		} else if (password.value != passwordVerify.value) {
			showWarning("alert-danger", "Password fields do not match. Make sure you typed the password correctly.");
		} else {
			setVisibilityOf([{
				element: form,
				setVisible: false
			}, {
				element: document.querySelector('.account-loader'),
				setVisible: true
			}], false, function() {
				firebase.auth().createUserWithEmailAndPassword(email.value, password.value).catch(function(error) {
					if (error.code == "auth/email-already-in-use") {
						showWarning("alert-warning", "An account with the given email address already exists.");
					} else if (error.code == "auth/invalid-email") {
						showWarning("alert-danger", "The given email is not valid.");
					} else if (error.code == "auth/weak-password") {
						showWarning("alert-danger", "The given password is not strong enough.");
					} else {
						showWarning("alert-danger", "Something went wrong: " + error.message + " (code: " + error.code + ").");
					}
					setVisibilityOf([{
						element: document.querySelector('.account-loader'),
						setVisible: false
					}, {
						element: form,
						setVisible: true
					}]);
				});
			});
		}
	});
})();