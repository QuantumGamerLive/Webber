'use strict';

function toDateString(timestamp) {
	const months_arr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const date = new Date(timestamp * 1000);

	const year = date.getFullYear();
	const month = months_arr[date.getMonth()];
	const day = date.getDate();
	const weekday = days[date.getDay()];

	return weekday + ", " + month + " " + day + ", " + year;
}

function sleep(ms) {
	return new Promise(function(resolve) {
		setTimeout(resolve, ms)
	});
}

async function setVisibilityOf(list, animations, callback) {
	const properties = animations || {};
	for (var i = 0; i < list.length; i++) {
		if (list[i].setVisible) {
			if (!properties.fixedHeight) list[i].element.style.height = list[i].element.querySelector('.measuring-wrapper').clientHeight + "px";
		} else {
			list[i].element.style.opacity = 0;
		}

		if (!properties.instant) {
			await sleep(500);
		}

		if (list[i].setVisible) {
			list[i].element.style.opacity = 1;
		} else {
			if (!properties.fixedHeight) list[i].element.style.height = 0;
		}
	}
	if (typeof callback === "function") {
		callback();
	}
}

function showWarning(type, text, e) {
	const element = e ? e : document
	const errorPrompt = element.querySelector('.error');
	const alert = errorPrompt.querySelector('.alert');
	alert.classList.add(type);
	alert.innerHTML = "<p>" + text + "</p>"
	setVisibilityOf([{
		element: errorPrompt,
		setVisible: true
	}]);
}

function hideWarning() {
	const errorPrompts = document.querySelectorAll('.error');
	errorPrompts.forEach(errorPrompt => {
		const alert = errorPrompt.querySelector('.alert');
		setVisibilityOf([{
			element: errorPrompt,
			setVisible: false
		}], null, function() {
			alert.classList.remove("alert-danger", "alert-warning")
		});
	});
}

function signOut() {
	firebase.auth().signOut();
}