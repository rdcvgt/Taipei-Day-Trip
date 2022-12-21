let fields = {
	number: {
		// css selector
		element: "#card-number",
		placeholder: "**** **** **** ****",
	},
	expirationDate: {
		// DOM object
		element: document.getElementById("card-expiration-date"),
		placeholder: "MM / YY",
	},
	ccv: {
		element: "#card-ccv",
		placeholder: "ccv",
	},
};

TPDirect.card.setup({
	fields: fields,
	styles: {
		// Style all elements
		input: {
			color: "gray",
		},
		// Styling ccv field
		"input.ccv": {
			"font-size": "16px",
		},
		// Styling expiration-date field
		"input.expiration-date": {
			"font-size": "16px",
		},
		// Styling card-number field
		"input.card-number": {
			"font-size": "16px",
		},
		// style focus state
		":focus": {
			// 'color': 'black'
		},
		// style valid state
		".valid": {
			color: "green",
		},
		// style invalid state
		".invalid": {
			color: "red",
		},
		// Media queries
		// Note that these apply to the iframe, not the root window.
		"@media screen and (max-width: 400px)": {
			input: {
				color: "orange",
			},
		},
	},
	// 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
	isMaskCreditCardNumber: true,
	maskCreditCardNumberRange: {
		beginIndex: 6,
		endIndex: 11,
	},
});
