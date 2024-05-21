document.getElementById('check-versions').addEventListener('click', async () => {
    const requirements = document.getElementById('requirements-input').value;
    console.log('Requirements input:', requirements);
    const versionsCache = {}; // Cache to store versions for each package
    const packages = requirements.split('\n')
        .map(line => line.split('#')[0].trim()) // Remove comments and trim whitespace
        .filter(line => line !== ''); // Filter out empty lines

    console.log('Parsed packages:', packages);

    const results = document.getElementById('results');
    results.innerHTML = '<p class="loading">Fetching latest versions...</p>';

    const fetchPackageVersion = async (packageName) => {
        console.log(`Fetching version for package: ${packageName}`);
        if (versionsCache[packageName]) return versionsCache[packageName]; // Return cached version if available
        try {
            const response = await fetch(`https://pypi.org/pypi/${packageName}/json`);
            if (response.ok) {
                const data = await response.json(); // Parse the JSON response
                console.log(`Fetched data for ${packageName}:`, data);
                if (data && data.info) {
                    versionsCache[packageName] = data.info; // Cache the fetched version
                }
                return data.info;
            } else {
                versionsCache[packageName] = {error: `Error fetching version for ${packageName}: ${response.statusText}`};
                console.error(`Error fetching version for ${packageName}: ${response.statusText}`);
                return {error: `Error fetching version for ${packageName}: ${response.statusText}`};
            }
        } catch (error) {
            versionsCache[packageName] = {error: `Error fetching version for ${packageName}: ${error.message}`};
            console.error(`Error fetching version for ${packageName}: ${error.message}`);
            return {error: `Error fetching version for ${packageName}: ${error.message}`};
        }
    };

    const packageVersions = await Promise.all(packages.map(async (pkg) => {
        const match = pkg.match(/(.*?)(==|>=|>)(.*)/);
        if (null==match) {
            const packageName = pkg.trim();
            const packageInfo = await fetchPackageVersion(packageName); 
            console.log(`Fetched info for ${packageName}:`, packageInfo);
            const currentVersion = '';
           const operator = '';
            return {packageName, currentVersion, operator, packageInfo};
        }
        const packageName = match[1].trim();
        const operator = match[2];
        const currentVersion = match[3].trim();
        console.log(`Processing package: ${packageName}`);
        const packageInfo = await fetchPackageVersion(packageName);
        console.log(`Fetched info for ${packageName}:`, packageInfo);
        return {packageName, currentVersion, operator, packageInfo};
    }));

    const escapeHtml = (unsafe) => {
        if (null == unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    console.log('Package versions:', packageVersions);

    let resultsHtml = '<table><thead><tr><th>Package</th><th>Current Version</th><th>New Version</th></tr></thead><tbody>';
    packageVersions.forEach(({packageName, currentVersion, operator, packageInfo}) => {
        if (packageInfo.error) {
            console.error(`Error for package ${packageName}:`, packageInfo.error);
            resultsHtml += `<tr><td>${escapeHtml(packageName)}</td><td>${escapeHtml(operator + ' ' + (currentVersion || 'N/A'))}</td><td>${escapeHtml(packageInfo.error)}</td></tr>`;
        } else {
            console.log(`Adding row for package ${packageName} with version ${packageInfo.version}`);
            resultsHtml += `<tr class="package-row" data-package='${escapeHtml(JSON.stringify(packageInfo))}'><td>${escapeHtml(packageName)}</td><td>${escapeHtml(operator + ' ' + (currentVersion || 'N/A'))}</td><td class="new-version">${escapeHtml(currentVersion === '' ? '' : (packageInfo.version || ''))}</td></tr>`;
        }
    });
    resultsHtml += '</tbody></table>';
    results.innerHTML = resultsHtml;

   // Show the "Generate New Requirements" button
   document.getElementById('generate-requirements').style.display = 'block';

    console.log('Package versions:', packageVersions);

    document.querySelectorAll('.package-row').forEach(row => {
        row.addEventListener('click', async () => {
            const packageInfo = JSON.parse(row.getAttribute('data-package'));
            console.log('Package row clicked:', packageInfo);
            const modal = document.getElementById('modal');
            const modalDetails = document.getElementById('modal-details');
            modalDetails.innerHTML = `
                <h2>${escapeHtml(packageInfo.name)}</h2>
                <p><strong>Latest Version:</strong> ${escapeHtml(packageInfo.version)}</p>
                <p><strong>Version:</strong> <select id="all-versions" class="version-dropdown" data-current-version="${escapeHtml(row.querySelector('.new-version').textContent)}"></select></p>
                <p><strong>Summary:</strong> ${escapeHtml(packageInfo.summary)}</p>
                <p><strong>Author:</strong> ${escapeHtml(packageInfo.author)}</p>
                <p><strong>Author Email:</strong> ${escapeHtml(packageInfo.author_email)}</p>
                <p><strong>License:</strong> ${escapeHtml(packageInfo.license)}</p>
                <p><strong>Home Page:</strong> <a href="${escapeHtml(packageInfo.home_page)}" target="_blank">${escapeHtml(packageInfo.home_page)}</a></p>
            `;
            modal.style.display = 'block';

            const versionsList = document.createElement('ul'); // Create the versions list element

            // Fetch and display all versions
            let allVersionsData; // Declare a variable to store the fetched data
            try {
                const response = await fetch(`https://pypi.org/pypi/${packageInfo.name}/json`);
                if (response.ok) {
                    const data = await response.json();
                    allVersionsData = data; // Store the fetched data
                    const versionsDropdown = document.getElementById('all-versions');
                    const currentVersion = versionsDropdown.getAttribute('data-current-version');
                    Object.keys(data.releases).forEach(version => {
                        const option = document.createElement('option');
                        option.value = version;
                       option.textContent = version;
                        if (version === currentVersion) {
                             option.selected = true; // Select the new version by default
                        }
                        versionsDropdown.appendChild(option);
                        const listItem = document.createElement('li');
                        listItem.setAttribute('data-version', version);
                       listItem.setAttribute('data-package', escapeHtml(JSON.stringify(data.releases[version])));
                       listItem.textContent = version;
                       versionsList.appendChild(listItem);
                   });
                   // Add <No Version> option
                   const noVersionOption = document.createElement('option');
                   noVersionOption.value = '';
                   noVersionOption.textContent = '<No Version>';
                   versionsDropdown.insertBefore(noVersionOption, versionsDropdown.firstChild);
                }
            } catch (error) {
                console.error(`Error fetching all versions for ${packageInfo.name}: ${error.message}`);
            }

            // Add event listener to update modal details when a different version is selected
            document.getElementById('all-versions').addEventListener('change', (event) => {
                const selectedVersion = event.target.value;
                let selectedPackageInfo = allVersionsData.releases[selectedVersion]; // Use the stored data
                if (null == selectedPackageInfo) selectedPackageInfo = packageInfo;
                const versionsDropdownHtml = document.getElementById('all-versions').outerHTML; // Get the current dropdown HTML
                let summary = selectedPackageInfo.summary || packageInfo.summary;
                let author = selectedPackageInfo.author || packageInfo.author;
                let author_email = selectedPackageInfo.author_email || packageInfo.author_email;
                let license = selectedPackageInfo.license || packageInfo.license;
                let home_page = selectedPackageInfo.home_page || packageInfo.home_page;
                modalDetails.innerHTML = `
                    <h2>${escapeHtml(packageInfo.name)}</h2>
                    <p><strong>Selected Version:</strong> ${escapeHtml(selectedVersion)}</p>
                    ${versionsDropdownHtml} <!-- Re-insert the dropdown HTML -->
                    <p><strong>Summary:</strong> ${escapeHtml(summary)}</p>
                    <p><strong>Author:</strong> ${escapeHtml(author)}</p>
                    <p><strong>Author Email:</strong> ${escapeHtml(author_email)}</p>
                    <p><strong>License:</strong> ${escapeHtml(license)}</p>
                    <p><strong>Home Page:</strong> <a href="${escapeHtml(home_page)}" target="_blank">${escapeHtml(home_page)}</a></p>
                `;
                // Update the main table with the new version
                row.querySelector('.new-version').textContent = escapeHtml(selectedVersion);

                // Re-attach the event listener to the new dropdown
                document.getElementById('all-versions').addEventListener('change', (event) => {
                    const selectedVersion = event.target.value;
                    const selectedPackageInfo = allVersionsData.releases[selectedVersion];
                    const versionsDropdownHtml = document.getElementById('all-versions').outerHTML;
                    modalDetails.innerHTML = `
                        <h2>${escapeHtml(packageInfo.name)}</h2>
                        <p><strong>Selected Version:</strong> ${escapeHtml(selectedVersion)}</p>
                        ${versionsDropdownHtml}
                        <p><strong>Summary:</strong> ${escapeHtml(selectedPackageInfo.summary || packageInfo.summary)}</p>
                        <p><strong>Author:</strong> ${escapeHtml(selectedPackageInfo.author || packageInfo.author)}</p>
                        <p><strong>Author Email:</strong> ${escapeHtml(selectedPackageInfo.author_email || packageInfo.author_email)}</p>
                        <p><strong>License:</strong> ${escapeHtml(selectedPackageInfo.license || packageInfo.license)}</p>
                        <p><strong>Home Page:</strong> <a href="${escapeHtml(selectedPackageInfo.home_page || packageInfo.home_page)}" target="_blank">${escapeHtml(selectedPackageInfo.home_page || packageInfo.home_page)}</a></p>
                    `;
                    // Update the main table with the new version
                    row.querySelector('.new-version').textContent = escapeHtml(selectedVersion);
                });
            });
        });
    });

    document.querySelector('.close').addEventListener('click', () => {
        console.log('Modal close button clicked');
        document.getElementById('modal').style.display = 'none';
    });

   document.querySelector('.close-requirements').addEventListener('click', () => {
       console.log('Requirements modal close button clicked');
       document.getElementById('requirements-modal').style.display = 'none';
   });

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal');
       const requirementsModal = document.getElementById('requirements-modal');
        if (event.target == modal) {
            console.log('Window clicked outside modal');
            modal.style.display = 'none';
       } else if (event.target == requirementsModal) {
           console.log('Window clicked outside requirements modal');
           requirementsModal.style.display = 'none';
        }
    });
});

document.getElementById('generate-requirements').addEventListener('click', () => {
    const rows = document.querySelectorAll('.package-row');
    let newRequirements = '';
    rows.forEach(row => {
        const packageName = row.children[0].textContent;
        const newVersion = row.querySelector('.new-version').textContent;
        const currentVersion = row.children[1].textContent;
        let match = currentVersion.match(/(==|>=|>)/);
        const operator = (null == match) ? '' : match[0];
       if (newVersion === '<No Version>') {
           newRequirements += `${packageName}\n`;
       } else if (currentVersion && operator && newVersion && currentVersion !== 'N/A') {
           newRequirements += `${packageName}${operator}${newVersion}\n`;
       } else {
           newRequirements += `${packageName}${newVersion}\n`;
       }
    });
    document.getElementById('new-requirements').value = newRequirements;
    document.getElementById('requirements-modal').style.display = 'block';
});