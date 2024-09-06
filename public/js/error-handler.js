function hideErrorMessage(errorMessageId = "error=msg", delay = 5000) {
    const errorMessage = document.getElementById(errorMessageId);
    console.log(errorMessage);
    if (errorMessage) {
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, delay);
    }
}
