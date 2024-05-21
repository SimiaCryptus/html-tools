document.addEventListener('DOMContentLoaded', function () {
    const isoInput = document.getElementById('iso-datetime');
    const unixInput = document.getElementById('unix-timestamp');
    const localInput = document.getElementById('local-datetime');
    const utcInput = document.getElementById('utc-datetime');
    const clearButton = document.getElementById('clear-button');
    const durationButton = document.getElementById('duration-button');
    const durationModal = document.getElementById('duration-modal');
    const closeModal = document.querySelector('.close');
    const applyDurationButton = document.getElementById('apply-duration-button');
    const setTodayButton = document.getElementById('set-today-button');
    const inputs = [isoInput, unixInput, localInput, utcInput];
    let now = new Date();

    console.log('Script initialized. DOM fully loaded and parsed.');

    let currentDate = new Date();

    durationButton.addEventListener('click', function () {
        console.log('Duration button clicked.');
        durationModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function () {
        console.log('Close modal button clicked.');
        durationModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === durationModal) {
            console.log('Clicked outside the duration modal. Closing modal.');
            durationModal.style.display = 'none';
        }
    });

    applyDurationButton.addEventListener('click', function () {
        console.log('Apply duration button clicked. now:', now);
        const seconds = parseInt(document.getElementById('seconds').value) || 0;
        const minutes = parseInt(document.getElementById('minutes').value) || 0;
        const hours = parseInt(document.getElementById('hours').value) || 0;
        const days = parseInt(document.getElementById('days').value) || 0;

        console.log(`Duration to apply - Days: ${days}, Hours: ${hours}, Minutes: ${minutes}, Seconds: ${seconds}`);
        now.setSeconds(now.getSeconds() + seconds);
        now.setMinutes(now.getMinutes() + minutes);
        now.setHours(now.getHours() + hours);
        now.setDate(now.getDate() + days);
        console.log('New date after applying duration:', now);

        updateFields('', now);
        durationModal.style.display = 'none';
        currentDate = now; // Update currentDate to the new date after applying duration
    });

    inputs.forEach(input => {
        updateFields('', now);
        durationModal.style.display = 'none';
    });

    inputs.forEach(input => {
        input.addEventListener('input', function () {
            console.log(`Input detected in ${input.id} with value: ${input.value}`);
            if (input.value) {
                try {
                    const date = parseInput(input.id, input.value);
                    console.log(`Parsed date for ${input.id}:`, date);
                    updateFields(input.id, date);
                } catch (e) {
                    console.error('Invalid date format for', input.id, 'with value:', input.value);
                }
            }
        });
    });

    setTodayButton.addEventListener('click', function () {
        console.log('Set today button clicked.');
        now = new Date();
        console.log('Current date:', now);
        currentDate = now;
        inputs.forEach(input => {
            updateFields('', now);
        });
    });

    clearButton.addEventListener('click', function () {
        console.log('Clear button clicked.');
        inputs.forEach(input => {
            input.value = '';
        });
        console.log('All input fields cleared.');
    });

    function parseInput(id, value) {
        console.log(`Parsing input for ${id} with value: ${value}`);
        switch (id) {
            case 'iso-datetime':
                return new Date(value);
            case 'unix-timestamp':
                return new Date(parseInt(value) * 1000);
            case 'local-datetime':
                return new Date(value);
            case 'utc-datetime':
                return new Date(value);
            default:
                console.error('Unknown input id:', id);
                throw new Error('Unknown input id');
        }
    }

    function updateFields(excludeId, date) {
        console.log(`Updating fields, excluding ${excludeId}. New date:`, date);
        inputs.forEach(input => {
            if (input.id !== excludeId) {
                switch (input.id) {
                    case 'iso-datetime':
                        input.value = date.toISOString();
                        console.log(`Updated iso-datetime to ${input.value}`);
                        break;
                    case 'unix-timestamp':
                        input.value = Math.floor(date.getTime() / 1000);
                        console.log(`Updated unix-timestamp to ${input.value}`);
                        break;
                    case 'local-datetime':
                        input.value = date.toLocaleString();
                        console.log(`Updated local-datetime to ${input.value}`);
                        break;
                    case 'utc-datetime':
                        input.value = date.toUTCString();
                        console.log(`Updated utc-datetime to ${input.value}`);
                        break;
                }
            }
        });
    }
});