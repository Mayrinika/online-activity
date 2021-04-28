export default (): void => {
    const inputEl = document.querySelector('#gameId') as HTMLInputElement;
    const inputValue = inputEl!.value.trim();

    if (!navigator.clipboard) {
        inputEl.select();
        document.execCommand("copy");
    } else {
        navigator.clipboard.writeText(inputValue)
            .then(() => {
                inputEl.select();
            })
            .catch(err => {
                console.log('Something went wrong', err);
            });
    }
};