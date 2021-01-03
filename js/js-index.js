'use strict';

(function() {
	var signInButton = document.getElementById("sign-in-button");

	firebase.auth().onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			if (firebaseUser.emailVerified) {
				signInButton.innerHTML = "Account overview";
				signInButton.href = "/account"
			} else {
				signInButton.innerHTML = "Sign in"
				signInButton.href = "/account/verify"
			}
		}
	});
})();