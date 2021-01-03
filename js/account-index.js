'use strict';

(function() {
	var currentUser = null;

	var accountSettingsSection = document.getElementById("overview");
	accountSettingsSection.style.minHeight = accountSettingsSection.clientHeight + "px";


	var emailForm = document.querySelector('.email-form');
	var passwordForm = document.querySelector('.security-form');
	var deleteForm = document.querySelector('.delete-form');

	var newEmail = document.getElementById("new-email");
	var verifyPasswordEmail = document.getElementById("new-email-old-password");

	var verifyOldPassword = document.getElementById("old-password");
	var newPassword = document.getElementById("new-password");
	var newPasswordVerify = document.getElementById("new-password-verify");

	var verifyPasswordDelete = document.getElementById("old-password-verify");

	newEmail.addEventListener('input', hideWarning, false);
	verifyPasswordEmail.addEventListener('input', hideWarning, false);
	verifyOldPassword.addEventListener('input', hideWarning, false);
	newPassword.addEventListener('input', hideWarning, false);
	newPasswordVerify.addEventListener('input', hideWarning, false);
	verifyPasswordDelete.addEventListener('input', hideWarning, false);
	
	
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
					// Discord details
					if (!response.accountDetails.oauth.discord.userId) {
						document.getElementById("discord-status").innerHTML = "Not connected"
						document.getElementById("discord-communities").innerHTML = "Managing 0 communities"
					} else if (response.accountDetails.oauth.discord.expiry > new Date() - 86400) {
						let communityCount = response.accountDetails.customer.communitySubscriptions.length
						document.getElementById("discord-status").innerHTML = "Connected"
						document.getElementById("discord-communities").innerHTML = "Managing " + communityCount + (communityCount > 1 ? " communities" : " community")
					} else {
						let communityCount = response.accountDetails.customer.communitySubscriptions.length
						document.getElementById("discord-status").innerHTML = "Connected"
						document.getElementById("discord-communities").innerHTML = "Managing " + communityCount + (communityCount > 1 ? " communities" : " community")
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
		if (!firebaseUser) {
			window.location = "/sign-in";
		} else {
			currentUser = firebaseUser;
			getAccountInformation();
		}
	});

	function triggerBrowserValidation(form) {
		// The only way to trigger HTML5 form validation UI is to fake a user submit event.
		var submit = document.createElement('input');
		submit.type = 'submit';
		submit.style.display = 'none';
		form.appendChild(submit);
		submit.click();
		submit.remove();
	}

	// Listen on the form's 'submit' handler...
	emailForm.addEventListener('submit', function(e) {
		e.preventDefault();

		// Trigger HTML5 validation UI on the form if any of the inputs fail
		// validation.
		var plainInputsValid = true;
		Array.prototype.forEach.call(emailForm.querySelectorAll('input'), function(input) {
			if (input.checkValidity && !input.checkValidity()) {
				plainInputsValid = false;
				return;
			}
		});
		if (!plainInputsValid) {
			triggerBrowserValidation(emailForm);
			return;
		}

		if (newEmail.value == "") {
			showWarning("alert-warning", "A new email address must be set.", document.getElementById("email-page"));
		} else if (verifyPasswordEmail.value == "") {
			showWarning("alert-warning", "You must confirm your current password.", document.getElementById("email-page"));
		} else {
			document.body.classList.remove("loading-end")
			document.body.classList.remove("loaded")
			currentUser.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(currentUser.email, verifyPasswordEmail.value)).then(function() {
				currentUser.updateEmail(newEmail.value).then(function() {
					window.location = "/account/verify";
				}).catch(function(error) {
					if (error.code == "auth/email-already-in-use") {
						showWarning("alert-warning", "There already exists and account with the given email address.", document.getElementById("email-page"));
					} else if (error.code == "auth/invalid-email") {
						showWarning("alert-danger", "The provided email is not valid.", document.getElementById("email-page"));
					} else if (error.code == "auth/too-many-requests") {
						showWarning("alert-danger", "Too many unsuccessful login attempts. Please try again later.", document.getElementById("email-page"));
					} else {
						showWarning("alert-danger", "Something went wrong: " + error.message + " (code: " + error.code + ").", document.getElementById("email-page"));
					}
					document.body.classList.add("loaded");
					setTimeout(function() {
						document.body.classList.add("loading-end");
					}, 1500);
				});
			}).catch(function(error) {
				if (error.code == "auth/wrong-password") {
					showWarning("alert-danger", "Your account password is wrong.", document.getElementById("email-page"));
				} else if (error.code == "auth/too-many-requests") {
					showWarning("alert-danger", "Too many unsuccessful login attempts. Please try again later.", document.getElementById("email-page"));
				} else {
					showWarning("alert-danger", "Something went wrong: " + error.message + " (code: " + error.code + ").", document.getElementById("email-page"));
				}
				document.body.classList.add("loaded");
				setTimeout(function() {
					document.body.classList.add("loading-end");
				}, 1500);
			});
		}
	});

	// Listen on the form's 'submit' handler...
	passwordForm.addEventListener('submit', function(e) {
		e.preventDefault();

		// Trigger HTML5 validation UI on the form if any of the inputs fail
		// validation.
		var plainInputsValid = true;
		Array.prototype.forEach.call(passwordForm.querySelectorAll('input'), function(input) {
			if (input.checkValidity && !input.checkValidity()) {
				plainInputsValid = false;
				return;
			}
		});
		if (!plainInputsValid) {
			triggerBrowserValidation(passwordForm);
			return;
		}

		if (verifyOldPassword.value == "") {
			showWarning("alert-warning", "You must confirm your current password.", document.getElementById("password-page"));
		} else if (newPassword.value == "") {
			showWarning("alert-warning", "A password must be set.", document.getElementById("password-page"));
		} else if (newPasswordVerify.value == "") {
			showWarning("alert-warning", "You must confirm your new password.", document.getElementById("password-page"));
		} else if (newPassword.value != newPasswordVerify.value) {
			showWarning("alert-danger", "Password fields do not match. Make sure you typed the password correctly.", document.getElementById("password-page"));
		} else {
			document.body.classList.remove("loading-end")
			document.body.classList.remove("loaded")
			currentUser.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(currentUser.email, verifyOldPassword.value)).then(function() {
				currentUser.updatePassword(newPassword.value).then(function() {
					showWarning("alert-success", "Your password was updated successfully.", document.getElementById("password-page"));
					document.body.classList.add("loaded");
					setTimeout(function() {
						document.body.classList.add("loading-end");
					}, 1500);
				}).catch(function(error) {
					if (error.code == "auth/weak-password") {
						showWarning("alert-danger", "The new password is not strong enough.", document.getElementById("password-page"));
					} else {
						showWarning("alert-danger", "Something went wrong: " + error.message + " (code: " + error.code + ").", document.getElementById("password-page"));
					}
					document.body.classList.add("loaded");
					setTimeout(function() {
						document.body.classList.add("loading-end");
					}, 1500);
				});
			}).catch(function(error) {
				if (error.code == "auth/wrong-password") {
					showWarning("alert-danger", "Your current password is incorrect.", document.getElementById("password-page"));
				} else if (error.code == "auth/too-many-requests") {
					showWarning("alert-danger", "Too many unsuccessful attempts. Please try again later.", document.getElementById("password-page"));
				} else {
					showWarning("alert-danger", "Something went wrong: " + error.message + " (code: " + error.code + ").", document.getElementById("password-page"));
				}
				document.body.classList.add("loaded");
				setTimeout(function() {
					document.body.classList.add("loading-end");
				}, 1500);
			});
		}
	});

	// Listen on the form's 'submit' handler...
	deleteForm.addEventListener('submit', function(e) {
		e.preventDefault();

		// Trigger HTML5 validation UI on the form if any of the inputs fail
		// validation.
		var plainInputsValid = true;
		Array.prototype.forEach.call(deleteForm.querySelectorAll('input'), function(input) {
			if (input.checkValidity && !input.checkValidity()) {
				plainInputsValid = false;
				return;
			}
		});
		if (!plainInputsValid) {
			triggerBrowserValidation(deleteForm);
			return;
		}

		if (verifyPasswordDelete.value == "") {
			showWarning("alert-warning", "You must confirm your current password.", document.getElementById("delete-page"));
		} else {
			document.body.classList.remove("loading-end")
			document.body.classList.remove("loaded")
			currentUser.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(currentUser.email, verifyPasswordDelete.value)).then(function() {
				currentUser.delete().then(function() {
					signOut()
				}).catch(function(error) {
					showWarning("alert-danger", "Something went wrong: " + error.message + " (code: " + error.code + ").", document.getElementById("delete-page"));
					document.body.classList.add("loaded");
					setTimeout(function() {
						document.body.classList.add("loading-end");
					}, 1500);
				});
			}).catch(function(error) {
				if (error.code == "auth/wrong-password") {
					showWarning("alert-danger", "Your current password is incorrect.", document.getElementById("delete-page"));
				} else if (error.code == "auth/too-many-requests") {
					showWarning("alert-danger", "Too many unsuccessful attempts. Please try again later.", document.getElementById("delete-page"));
				} else {
					showWarning("alert-danger", "Something went wrong: " + error.message + " (code: " + error.code + ").", document.getElementById("delete-page"));
				}
				document.body.classList.add("loaded");
				setTimeout(function() {
					document.body.classList.add("loading-end");
				}, 1500);
			});
		}
	});
})();

function signOut() {
	firebase.auth().signOut()
}

function toggleDeletePage() {
	let deletePage = document.getElementById("delete-page");
	let privacySection = document.getElementById("privacy-section");
	
	setVisibilityOf([{
		element: deletePage,
		setVisible: true
	}, {
		element: privacySection,
		setVisible: true
	}], null, function() {
		hideWarning();
		document.getElementById("toggleDeletePage").onclick = function() {
			window.location = "/account"
		}
		document.getElementById("toggleDeletePage").innerText = "Cancel"
	});
}

function togglePrivacySettings() {
	let descriptionSection = document.getElementById("description-section");
	let privacySection = document.getElementById("privacy-section");
	const isHidden = privacySection.clientHeight == 0;
	document.getElementById("togglePrivacySettings").innerText = isHidden ? "Close privacy settings" : "Open privacy settings";
	var s1 = isHidden ? descriptionSection : privacySection
	var s2 = isHidden ? privacySection : descriptionSection
	setVisibilityOf([{
		element: s1,
		setVisible: false
	}, {
		element: s2,
		setVisible: true
	}]);
}