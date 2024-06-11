document.getElementById('check-versions').addEventListener('click', async () => {
    const packageJson = document.getElementById('package-json-input').value;
    console.log('Package.json input:', packageJson);
    const versionsCache = {}; // Cache to store versions for each package

    let dependencies;
    try {
        const parsedJson = JSON.parse(packageJson);
        dependencies = {...parsedJson.dependencies, ...parsedJson.devDependencies};
    } catch (error) {
        console.error('Error parsing package.json:', error);
        return;
    }

    console.log('Parsed dependencies:', dependencies);

    const results = document.getElementById('results');
    results.innerHTML = '<p class="loading">Fetching latest versions...</p>';

    const fetchPackageVersion = async (packageName) => {
        console.log(`Fetching version for package: ${packageName}`);
        if (versionsCache[packageName]) return versionsCache[packageName]; // Return cached version if available
        try {
            const response = await fetch(`https://registry.npmjs.org/${packageName}`);
            if (response.ok) {
                const data = await response.json(); // Parse the JSON response
                console.log(`Fetched data for ${packageName}:`, data);
                if (data && data['dist-tags']) {
                    versionsCache[packageName] = data['dist-tags'].latest; // Cache the fetched version
                }
                return data['dist-tags'].latest;
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

    const packageVersions = await Promise.all(Object.keys(dependencies).map(async (packageName) => {
        const currentVersion = dependencies[packageName];
        console.log(`Processing package: ${packageName}`);
        const latestVersion = await fetchPackageVersion(packageName);
        console.log(`Fetched latest version for ${packageName}:`, latestVersion);
        return {packageName, currentVersion, latestVersion};
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
    packageVersions.forEach(({packageName, currentVersion, latestVersion}) => {
        if (latestVersion.error) {
            console.error(`Error for package ${packageName}:`, latestVersion.error);
            resultsHtml += `<tr><td>${escapeHtml(packageName)}</td><td>${escapeHtml(currentVersion)}</td><td>${escapeHtml(latestVersion.error)}</td></tr>`;
        } else {
            console.log(`Adding row for package ${packageName} with version ${latestVersion}`);
            resultsHtml += `<tr class="package-row" data-package='${escapeHtml(JSON.stringify({
                name: packageName,
                version: latestVersion
            }))}'><td>${escapeHtml(packageName)}</td><td>${escapeHtml(currentVersion)}</td><td class="new-version">${escapeHtml(latestVersion)}</td></tr>`;
        }
    });
    resultsHtml += '</tbody></table>';
    results.innerHTML = resultsHtml;

    // Show the "Generate New package.json" button
    document.getElementById('generate-package-json').style.display = 'block';

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
            `;
            modal.style.display = 'block';
        });
    });

    document.querySelector('.close').addEventListener('click', () => {
        console.log('Modal close button clicked');
        document.getElementById('modal').style.display = 'none';
    });

    document.querySelector('.close-package-json').addEventListener('click', () => {
        console.log('Package.json modal close button clicked');
        document.getElementById('package-json-modal').style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal');
        const packageJsonModal = document.getElementById('package-json-modal');
        if (event.target == modal) {
            console.log('Window clicked outside modal');
            modal.style.display = 'none';
        } else if (event.target == packageJsonModal) {
            console.log('Window clicked outside package.json modal');
            packageJsonModal.style.display = 'none';
        }
    });
});

document.getElementById('generate-package-json').addEventListener('click', () => {
    const rows = document.querySelectorAll('.package-row');
    let newPackageJson = {
        dependencies: {},
        devDependencies: {}
    };
    rows.forEach(row => {
        const packageName = row.children[0].textContent;
        const newVersion = row.querySelector('.new-version').textContent;
        const currentVersion = row.children[1].textContent;
        if (currentVersion.startsWith('^') || currentVersion.startsWith('~')) {
            newPackageJson.dependencies[packageName] = `${currentVersion[0]}${newVersion}`;
        } else {
            newPackageJson.dependencies[packageName] = newVersion;
        }
    });

    // Separate dependencies and devDependencies
    const originalPackageJson = JSON.parse(document.getElementById('package-json-input').value);
    Object.keys(newPackageJson.dependencies).forEach(packageName => {
        if (originalPackageJson.devDependencies && originalPackageJson.devDependencies[packageName]) {
            newPackageJson.devDependencies[packageName] = newPackageJson.dependencies[packageName];
            delete newPackageJson.dependencies[packageName];
        }
    });

    // Merge original package.json fields except dependencies and devDependencies
    const mergedPackageJson = {...originalPackageJson, ...newPackageJson};
    delete mergedPackageJson.dependencies;
    delete mergedPackageJson.devDependencies;
    mergedPackageJson.dependencies = newPackageJson.dependencies;
    mergedPackageJson.devDependencies = newPackageJson.devDependencies;

    document.getElementById('new-package-json').value = JSON.stringify(mergedPackageJson, null, 2);
    document.getElementById('package-json-modal').style.display = 'block';
});