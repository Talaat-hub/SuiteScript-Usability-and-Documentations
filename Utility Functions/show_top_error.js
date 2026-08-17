/*
## Dependencies

This is a paste-in snippet meant for a Client Script. It expects `N/ui/message` already
imported as `message` and `N/log` already imported as `log` in the containing script, e.g.:
`define(['N/ui/message', 'N/log'], (message, log) => { ... })`.

@param {msgText} - The error message as a STRING

---

## Example Usage

if (!subsidiary) {
    showTopError("Please choose a subsidiary!"); // Error message
}
*/

const showTopError = (msgText) => {
    try {
        const errorMessage = message.create({
            title: "Validation Error",
            message: msgText,
            type: message.Type.ERROR
        });

        errorMessage.show({
            duration: 10000 // 10 seconds
        });
    } catch (errshowTopError) {
        log.debug('errshowTopError', errshowTopError);
    }
};