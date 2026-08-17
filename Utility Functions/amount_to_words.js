/*
## Dependencies

None — this is plain JavaScript with no NetSuite module imports. Safe to paste directly
into any SuiteScript file, unit test, or run standalone in Node. Uses `console.error` for
logging so it works outside a NetSuite runtime; swap for `N/log` if you want deployment logs
inside NetSuite instead.

@param {amount} - The amount meant to be converted to words
@param {countryName} - To write currency in words

---

## Example usage

const amount = record.getValue('amount'); // 1923.86
const subsidiary = record.getValue('subsidiary'); // United Arab Emirates
const amountWords = amount_to_words(amount, subsidiary); // One Thousand Nine Hundred Twenty Three UAE Dirhams and Eighty Six fils

## PLEASE NOTE THAT YOU CAN EDIT OR ADD THE COUNTRY AND IT'S CURRENCY BASED ON YOUR CONDITION
*/

const amount_to_words = (amount, countryName) => {
    try {
        const currencyMap = {
            'Saudi Arabia': 'Saudi Arabian Riyals',
            'United Arab Emirates': 'UAE Dirhams',
            'Qatar': 'Qatari Riyals',
            'Kuwait': 'Kuwaiti Dinars',
            'Bahrain': 'Bahraini Dinars',
            'Oman': 'Omani Rials',
            'Egypt': 'Egyptian Pounds',
            'United States': 'US Dollars',
            'United Kingdom': 'British Pounds',
            'India': 'Indian Rupees',
            // Eurozone countries all share the Euro — add any others you work with here.
            'Germany': 'Euros',
            'France': 'Euros'
        };
        const subunitMap = {
            'Saudi Arabia': 'halalas',
            'United Arab Emirates': 'fils',
            'Qatar': 'dirhams',
            'Kuwait': 'fils',
            'Bahrain': 'fils',
            'Oman': 'baisa',
            'Egypt': 'piastres',
            'United States': 'cents',
            'United Kingdom': 'pence',
            'India': 'paise',
            'Germany': 'cents',
            'France': 'cents'
        };

        function translate(n) {
            const single_digit = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            const double_digit = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const below_hundred = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            let word = "";

            if (n < 10) {
                word = single_digit[n] + ' ';
            } else if (n < 20) {
                word = double_digit[n - 10] + ' ';
            } else if (n < 100) {
                word = below_hundred[Math.floor(n / 10) - 2] + ' ' + translate(n % 10);
            } else if (n < 1000) {
                word = single_digit[Math.floor(n / 100)] + ' Hundred ' + translate(n % 100);
            } else if (n < 1_000_000) {
                word = translate(Math.floor(n / 1000)).trim() + ' Thousand ' + translate(n % 1000);
            } else if (n < 1_000_000_000) {
                word = translate(Math.floor(n / 1_000_000)).trim() + ' Million ' + translate(n % 1_000_000);
            } else {
                word = translate(Math.floor(n / 1_000_000_000)).trim() + ' Billion ' + translate(n % 1_000_000_000);
            }
            return word;
        }

        const convertFractionalPart = (fraction, countryName) => {
            try {
                const subunit = subunitMap[countryName] || 'subunit';
                if (fraction === "0") {
                    return '';
                }
                return `${translate(Number(fraction)).trim()} ${subunit}`;
            } catch (err) {
                console.error('Error in convertFractionalPart', err);
            }
        };

        if (amount === 0) {
            return 'Zero';
        }

        const parts = amount.toString().split('.');
        const integerPart = Number(parts[0]);
        const fractionalPart = parts.length > 1 ? parts[1] : null;
        let words = translate(integerPart).trim();
        const currencyInWords = currencyMap[countryName] || 'Currency';
        words += ' ' + currencyInWords;

        if (fractionalPart && Number(fractionalPart) > 0) {
            const fractionalWords = convertFractionalPart(fractionalPart, countryName);
            words += ' and ' + fractionalWords;
        }

        return words.trim();
    } catch (err) {
        console.error('Error in amount_to_words function', err.message);
        return 'Zero';
    }
};
